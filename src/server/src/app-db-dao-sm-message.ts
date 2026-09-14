/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq }               from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { MessageType, MessageState, Message } from "./app-db-types.js"
import type { Session, Operation } from "./app-db-auth.js"
import { MessageDAO }            from "./app-db-dao-dm-message.js"

/*  the states a message of a type may use (SPEC-DR type-states)  */
const typeStates: Record<MessageType, MessageState[]> = {
    Question: [ "pending", "accepted", "rejected", "forwarded", "answered", "suspended" ],
    Chat:     [ "pending", "accepted", "rejected" ],
    Support:  [ "accepted" ]
}

/*  the Data Access Object (DAO) of the SPEC-SM lifecycle Message
    (SPEC-SM-message): the moderation and presentation transitions accept,
    reject, forward, answer, and suspend, extending the DAO of the entity.
    It is one of the DAO modules of the persistence layer "app-db-dao.ts",
    whose core provides the connection, the authorization, and the shared
    helpers.  */
export class MessageLifecycleDAO extends MessageDAO {
    /*  internal helper: perform the SPEC-SM transition the current state of a
        message maps onto, provided it is authorized for the session and the
        target state is permitted for the type of the message (SPEC-DR
        type-states), storing the target state with further changes  */
    private async transition (session: Session, message: Message,
        transitions: Partial<Record<MessageState, Exclude<Operation, "create">>>, to: MessageState,
        changes: Partial<Message> = {}): Promise<Message> {
        const db  = this.core.require()
        const id  = message.messageId

        /*  load the stored row  */
        const row = this.core.found(await db.query.messages.findFirst({ where: eq(schema.messages.messageId, id) }), "Message", id)

        /*  map the current state onto its transition  */
        const operation = transitions[row.state]
        if (operation === undefined)
            throw new Error(`no transition of Message "${id}" allowed in state "${row.state}"`)

        /*  enforce the states permitted for the type of the message (SPEC-DR type-states)  */
        if (!typeStates[row.type].includes(to))
            throw new Error(`state "${to}" not permitted for Message "${id}" of type "${row.type}"`)

        /*  authorize the transition on the stored row  */
        await this.core.authorize(session, operation, "Message", row, changes)

        /*  store the target state with the further changes, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .update(schema.messages)
            .set({ ...changes, state: to, version: this.core.bump(schema.messages.version) })
            .where(and(eq(schema.messages.messageId, id), eq(schema.messages.version, message.version)))
            .returning()
        return this.core.stored(stored, "Message", id)
    }

    /*  accept a pending message (SPEC-SM accept)  */
    async accept (session: Session, message: Message): Promise<Message> {
        return this.transition(session, message, { pending: "accept" }, "accepted")
    }

    /*  reject a pending message (SPEC-SM reject)  */
    async reject (session: Session, message: Message): Promise<Message> {
        return this.transition(session, message, { pending: "reject" }, "rejected")
    }

    /*  forward an accepted question to the presenter (SPEC-SM forward); a
        hint and an ordering position are attached via "update"  */
    async forward (session: Session, message: Message): Promise<Message> {
        return this.transition(session, message, { accepted: "forward" }, "forwarded")
    }

    /*  mark a forwarded question as answered (SPEC-SM answer)  */
    async answer (session: Session, message: Message): Promise<Message> {
        return this.transition(session, message, { forwarded: "answer" }, "answered", { timestampAnswered: new Date() })
    }

    /*  mark a forwarded question as suspended (SPEC-SM suspend)  */
    async suspend (session: Session, message: Message): Promise<Message> {
        return this.transition(session, message, { forwarded: "suspend" }, "suspended")
    }
}

