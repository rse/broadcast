/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq, inArray, notInArray } from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { EventState, Event } from "./app-db-types.js"
import type { Session, Operation } from "./app-db-auth.js"
import type { Executor }         from "./app-db-dao.js"
import { EventDAO }              from "./app-db-dao-dm-event.js"
import { likeCount }             from "./app-db-dao-dm-message.js"

/*  the Data Access Object (DAO) of the SPEC-SM lifecycle Event
    (SPEC-SM-event): the transitions publish, start, and finish, the latter
    running the anonymization, extending the DAO of the entity. It is one of
    the DAO modules of the persistence layer "app-db-dao.ts", whose core
    provides the connection, the authorization, and the shared helpers.  */
export class EventLifecycleDAO extends EventDAO {
    /*  internal helper: load an event and ensure the SPEC-SM transition its
        current state maps onto is authorized for the session  */
    private async transitionAllowed (session: Session, event: Event,
        transitions: Partial<Record<EventState, Exclude<Operation, "create">>>): Promise<Event> {
        const db  = this.core.require()

        /*  load the stored row  */
        const row = this.core.found(await db.query.events.findFirst({ where: eq(schema.events.eventId, event.eventId) }), "Event", event.eventId)

        /*  map the current state onto its transition  */
        const operation = transitions[row.state]
        if (operation === undefined)
            throw new Error(`no transition of Event "${event.eventId}" allowed in state "${row.state}"`)

        /*  authorize the transition on the stored row  */
        await this.core.authorize(session, operation, "Event", row)
        return row
    }

    /*  internal helper: store the new state of an event (version-checked)  */
    private async setState (db: Executor, event: Event, state: EventState): Promise<Event> {
        /*  store the new state, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .update(schema.events)
            .set({ state, version: this.core.bump(schema.events.version) })
            .where(and(eq(schema.events.eventId, event.eventId), eq(schema.events.version, event.version)))
            .returning()
        return this.core.stored(stored, "Event", event.eventId)
    }

    /*  publish an event (SPEC-SM publish)  */
    async publish (session: Session, event: Event): Promise<Event> {
        /*  ensure the transition is allowed and authorized  */
        await this.transitionAllowed(session, event, { planning: "publish" })

        /*  store the new state  */
        return this.setState(this.core.require(), event, "published")
    }

    /*  start an event, from published (SPEC-SM start) or directly from
        planning without ever having been published (SPEC-SM start-unpublished)  */
    async start (session: Session, event: Event): Promise<Event> {
        /*  ensure the transition is allowed and authorized  */
        await this.transitionAllowed(session, event, { published: "start", planning: "start-unpublished" })

        /*  store the new state  */
        return this.setState(this.core.require(), event, "running")
    }

    /*  finish an event (SPEC-SM finish), running its anonymization: the
        rejected messages are deleted entirely (SPEC-SM Rejected), the other
        messages are reduced to a bare like count (SPEC-DR like-count) and an
        anonymous sender, the tokens are deleted, the user statistics are
        unlinked from their users (SPEC-SM unlink), and the Moderator roles
        and then the users without a Manager role are deleted (SPEC-DR
        anonymize, manager-retained)  */
    async finish (session: Session, event: Event): Promise<Event> {
        /*  ensure the transition is allowed and authorized  */
        await this.transitionAllowed(session, event, { running: "finish" })
        const eventId = event.eventId

        /*  bundle multiple operations into a single transaction  */
        return this.core.require().transaction(async (tx) => {
            /*  the subqueries of the objects hanging off the event  */
            const messagesOfEvent = tx.select({ id: schema.messages.messageId }).from(schema.messages).where(eq(schema.messages.eventId, eventId))
            const usersOfEvent    = tx.select({ id: schema.users.userId }).from(schema.users).where(eq(schema.users.eventId, eventId))
            const managers        = tx.select({ id: schema.roles.userId }).from(schema.roles).where(eq(schema.roles.type, "Manager"))

            /*  delete the rejected messages entirely (SPEC-SM Rejected)  */
            await tx.delete(schema.messages).where(and(eq(schema.messages.eventId, eventId), eq(schema.messages.state, "rejected")))

            /*  reduce the other messages to a like count and an anonymous sender (SPEC-DR like-count, anonymize)  */
            await tx.update(schema.messages)
                .set({ likes: likeCount, senderId: null, senderName: "Anonymous", version: this.core.bump(schema.messages.version) })
                .where(eq(schema.messages.eventId, eventId))

            /*  drop the liker relations  */
            await tx.delete(schema.messageLiker).where(inArray(schema.messageLiker.messageId, messagesOfEvent))

            /*  delete the tokens of the event  */
            await tx.delete(schema.authorizationTokens).where(eq(schema.authorizationTokens.eventId, eventId))
            await tx.delete(schema.sessionTokens).where(eq(schema.sessionTokens.eventId, eventId))

            /*  unlink the user statistics from their users, the retained managers included (SPEC-SM unlink)  */
            await this.core.userStatistic.unlink(tx, eventId)

            /*  delete the Moderator roles, then the users without a Manager role (SPEC-DR manager-retained)  */
            await tx.delete(schema.roles).where(and(eq(schema.roles.type, "Moderator"), inArray(schema.roles.userId, usersOfEvent)))
            await tx.delete(schema.users).where(and(eq(schema.users.eventId, eventId), notInArray(schema.users.userId, managers)))

            /*  store the final state  */
            return this.setState(tx, event, "finished")
        })
    }
}

