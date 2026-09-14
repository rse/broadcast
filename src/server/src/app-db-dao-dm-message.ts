/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, asc, eq, sql }     from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, Graph, MessageType, MessageState, Event, Message } from "./app-db-types.js"
import { AuthorizationError, type Session } from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"
import type { Executor }         from "./app-db-dao.js"

/*  the changes of a message: its attributes, its original text (whose
    translations are dropped), and the ids of its question tags  */
type MessageChanges = Partial<Message> & { text?: string, questionTags?: string[] }

/*  the draft of a new message: its state and sender are decided by the
    session, and its sender name defaults to "Moderator" for a moderator
    (SPEC-DR moderator-accept) and to the name appearance of the event else  */
export type MessageDraft = Omit<Draft<Message>, "state" | "senderId" | "senderName"> & { senderName?: string }

/*  the sentiment score below which a message is improper (SPEC-DR sentiment-threshold)  */
const sentimentThreshold = -0.1

/*  the number of likes of a message, counted from its liker relation  */
export const likeCount = sql<number>`(SELECT count(*)::int FROM ${schema.messageLiker}
    WHERE ${schema.messageLiker.messageId} = ${schema.messages.messageId})`

/*  whether an event moderates the messages of a type (SPEC-DR moderation-gate)  */
const moderated = (event: Event, type: MessageType): boolean =>
    type === "Chat" ? event.chatModerator : type === "Question" ? event.questionsModerator : false

/*  the sender name of a new message: the override of a moderator (SPEC-DR
    moderator-accept), the anonymous sender the event allows, or the name
    appearance of the event (SPEC-DM chatName, questionsName)  */
const senderNameOf = (session: Session, event: Event, type: MessageType, override?: string): string => {
    const display   = type === "Question" ? event.questionsName          : event.chatName
    const anonymous = type === "Question" ? event.questionsAllowAnonymous : event.chatAllowAnonymous
    const user      = session.user
    if (session.role === "moderator")
        return override ?? "Moderator"
    else if (override !== undefined) {
        if (override === "Anonymous" && anonymous)
            return override
        throw new AuthorizationError(session, "create", "Message")
    }
    else if (display === "anonymous" || user === null)
        return "Anonymous"
    else if (display === "firstname")
        return user.firstname
    else
        return `${user.firstname} ${user.lastname}`.trim()
}

/*  the initial state of a new message, following the SPEC-SM transitions of
    the actor System: accepted when the event does not moderate messages of
    the type (SPEC-DR moderation-gate) or a moderator authors the message
    (SPEC-DR moderator-accept), accepted or rejected when the server-side
    sentiment analysis so decides (SPEC-DR sentiment-threshold), pending else  */
const initialStateOf = (session: Session, event: Event, type: MessageType, score: number | null): MessageState => {
    if (!moderated(event, type) || session.role === "moderator")
        return "accepted"
    else if (event.sentimentModeratorAnalysis && score !== null) {
        if (score < sentimentThreshold && event.sentimentModeratorAutoReject)
            return "rejected"
        else if (score >= sentimentThreshold && event.sentimentModeratorAutoAccept)
            return "accepted"
    }
    return "pending"
}

/*  the Data Access Object (DAO) of the SPEC-DM entity Message
    (SPEC-DM-message): a chat, support, or question with its texts, tags,
    and likes, whose sender name and initial state follow the event
    settings. It is one of the DAO modules of the persistence layer
    "app-db-dao.ts", whose core provides the connection, the authorization,
    and the shared helpers.  */
export class MessageDAO {
    constructor (
        protected core: DB
    ) {}

    /*  internal helper: attach the question tags a session may use to a
        message, replacing the ones attached before  */
    private async assignTags (db: Executor, session: Session, messageId: string, questionTagIds: string[]): Promise<void> {
        /*  ensure the session may use every given tag  */
        for (const questionTagId of questionTagIds) {
            const tag = await db.query.questionTags.findFirst({ where: eq(schema.questionTags.questionTagId, questionTagId) })
            if (tag === undefined || !(await this.core.permitted(session, "read", "QuestionTag", tag)))
                throw new AuthorizationError(session, "read", "QuestionTag")
        }

        /*  detach the tags attached before  */
        await db.delete(schema.messageQuestionTags).where(eq(schema.messageQuestionTags.messageId, messageId))

        /*  attach the given tags  */
        if (questionTagIds.length > 0)
            await db.insert(schema.messageQuestionTags)
                .values(questionTagIds.map((questionTagId) => ({ messageId, questionTagId })))
    }

    /*  internal helper: load a message with its texts, its question tags, and
        the like of the session user on it  */
    private load (db: Executor, session: Session, messageId: string) {
        return db.query.messages.findFirst({
            where: eq(schema.messages.messageId, messageId),
            with:  {
                texts:        true,
                questionTags: true,
                liker:        { where: session.user === null ? sql`false` : eq(schema.messageLiker.userId, session.user.userId) }
            }
        })
    }

    /*  create a new message, sent by the session user, with its original text
        and question tags, where its sender name and initial state are decided
        by the event settings (see "senderNameOf" and "initialStateOf" above)  */
    async create (session: Session, draft: MessageDraft, text: string, questionTagIds: string[] = []): Promise<Graph<Message>> {
        const db    = this.core.require()

        /*  load the event whose settings decide the sender name and the initial state  */
        const event = this.core.found(await db.query.events.findFirst({ where: eq(schema.events.eventId, draft.eventId) }), "Event", draft.eventId)
        const type  = draft.type ?? "Chat"

        /*  complete the draft by the sender, the sender name, and the initial state  */
        const data: Draft<Message> = {
            ...draft,
            type,
            state:      initialStateOf(session, event, type, draft.sentimentScore ?? null),
            senderName: senderNameOf(session, event, type, draft.senderName),
            senderId:   session.user?.userId ?? null
        }

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "Message", data)

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  store the draft  */
            const [ row ] = await tx.insert(schema.messages).values(data).returning({ messageId: schema.messages.messageId })

            /*  store the original text  */
            await tx.insert(schema.messageTexts).values({ messageId: row.messageId, language: data.originalLanguage, text })

            /*  attach the tags the session may use  */
            if (questionTagIds.length > 0)
                await this.assignTags(tx, session, row.messageId, questionTagIds)

            /*  return the stored row with its relations  */
            return this.core.found(await this.load(tx, session, row.messageId), "Message", row.messageId)
        })
    }

    /*  list the messages of an event the session may read in their creation
        order, each with its texts, its question tags, and the like of the
        session user on it  */
    async list (session: Session, eventId: string): Promise<Graph<Message>[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.messages.findMany({
            where:   eq(schema.messages.eventId, eventId),
            orderBy: asc(schema.messages.timestamp),
            with:    {
                texts:        true,
                questionTags: true,
                liker:        { where: session.user === null ? sql`false` : eq(schema.messageLiker.userId, session.user.userId) }
            }
        })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "Message", rows)
    }

    /*  read a message with its texts, its question tags, and the like of the
        session user on it  */
    async read (session: Session, messageId: string): Promise<Graph<Message> | undefined> {
        /*  load the row, if it exists  */
        const row = await this.load(this.core.require(), session, messageId)

        /*  authorize the read on the stored row  */
        if (row !== undefined)
            await this.core.authorize(session, "read", "Message", row)
        return row
    }

    /*  update the changed attributes of a message and, if loaded, its
        question tags and its text of the original language, where a new text
        is marked as an edit, drops the stale translations, and resubmits an
        accepted message to the moderation if the event moderates messages of
        its type (SPEC-SM resubmit); the like count is derived and hence
        never written here  */
    async update (session: Session, message: Graph<Message>): Promise<Graph<Message>> {
        const db      = this.core.require()
        const id      = message.messageId

        /*  load the stored row with its texts and tags as the baseline of the diff  */
        const row     = this.core.found(await this.load(db, session, id), "Message", id)

        /*  determine the changed attributes, the changed original text, and the changed tag set  */
        const changes: MessageChanges = this.core.changesOf(schema.messages, row, message, "likes")
        const text    = message.texts?.find((t) => t.language === row.originalLanguage)?.text
        if (text !== undefined && text !== row.texts.find((t) => t.language === row.originalLanguage)?.text)
            changes.text = text
        const tags    = message.questionTags?.map((tag) => tag.questionTagId)
        const stored  = row.questionTags.map((tag) => tag.questionTagId)
        if (tags !== undefined && !(tags.length === stored.length && tags.every((tag) => stored.includes(tag))))
            changes.questionTags = tags
        if (Object.keys(changes).length === 0)
            return row

        /*  authorize the update on the stored row for the changed attributes  */
        await this.core.authorize(session, "update", "Message", row, changes)
        const { text: newText, questionTags, ...columns } = changes
        const data: Partial<Message> = { ...columns }

        /*  a new text marks the message as edited and resubmits an accepted one to the moderation  */
        if (newText !== undefined) {
            data.edited ??= "significant"
            if (row.state === "accepted") {
                const event = this.core.found(await db.query.events.findFirst({ where: eq(schema.events.eventId, row.eventId) }), "Event", row.eventId)
                if (moderated(event, row.type)) {
                    await this.core.authorize(session, "resubmit", "Message", row)
                    data.state = "pending"
                }
            }
        }

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  write the changes, version-checked (optimistic locking)  */
            const [ updated ] = await tx
                .update(schema.messages)
                .set({ ...data, version: this.core.bump(schema.messages.version) })
                .where(and(eq(schema.messages.messageId, id), eq(schema.messages.version, message.version)))
                .returning({ messageId: schema.messages.messageId })
            this.core.stored(updated, "Message", id)

            /*  replace the texts by the new original text, dropping the stale translations  */
            if (newText !== undefined) {
                await tx.delete(schema.messageTexts).where(eq(schema.messageTexts.messageId, id))
                await tx.insert(schema.messageTexts).values({ messageId: id, language: row.originalLanguage, text: newText })
            }

            /*  replace the tag set by the given one  */
            if (questionTags !== undefined)
                await this.assignTags(tx, session, id, questionTags)

            /*  return the stored row with its relations  */
            return this.core.found(await this.load(tx, session, id), "Message", id)
        })
    }

    /*  delete a message: as its position in the stream is kept by a
        placeholder (SPEC-FR deleted-placeholder), the message itself survives
        marked as deleted while its texts are dropped  */
    async delete (session: Session, message: Message): Promise<Graph<Message>> {
        const db  = this.core.require()
        const id  = message.messageId

        /*  load the stored row  */
        const row = this.core.found(await db.query.messages.findFirst({ where: eq(schema.messages.messageId, id) }), "Message", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "Message", row)

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  mark the message as deleted, version-checked (optimistic locking)  */
            const [ updated ] = await tx
                .update(schema.messages)
                .set({ edited: "deleted", version: this.core.bump(schema.messages.version) })
                .where(and(eq(schema.messages.messageId, id), eq(schema.messages.version, message.version)))
                .returning({ messageId: schema.messages.messageId })
            this.core.stored(updated, "Message", id)

            /*  drop the texts of the deleted message  */
            await tx.delete(schema.messageTexts).where(eq(schema.messageTexts.messageId, id))

            /*  return the stored row with its relations  */
            return this.core.found(await this.load(tx, session, id), "Message", id)
        })
    }

    /*  like a message on behalf of the session user, or revoke the like
        again, keeping the derived like count of the message in sync (which,
        as a derived attribute, does not count as a change of the message)  */
    async like (session: Session, message: Message, liked: boolean): Promise<Graph<Message>> {
        const db  = this.core.require()
        const id  = message.messageId

        /*  load the stored row  */
        const row = this.core.found(await db.query.messages.findFirst({ where: eq(schema.messages.messageId, id) }), "Message", id)

        /*  a like needs the session user it is tracked for  */
        if (session.user === null)
            throw new AuthorizationError(session, "update", "Message")
        const userId = session.user.userId

        /*  authorize the like as an update of the like count  */
        await this.core.authorize(session, "update", "Message", row, { likes: row.likes + (liked ? 1 : -1) })

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  record or revoke the like  */
            await (liked ?
                tx.insert(schema.messageLiker).values({ messageId: id, userId }).onConflictDoNothing() :
                tx.delete(schema.messageLiker).where(and(eq(schema.messageLiker.messageId, id), eq(schema.messageLiker.userId, userId))))

            /*  keep the derived like count in sync  */
            await tx.update(schema.messages).set({ likes: likeCount }).where(eq(schema.messages.messageId, id))

            /*  return the stored row with its relations  */
            return this.core.found(await this.load(tx, session, id), "Message", id)
        })
    }
}

