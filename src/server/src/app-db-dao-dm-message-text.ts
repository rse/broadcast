/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq }               from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, MessageText } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity MessageText
    (SPEC-DM-messagetext): a language-specific text of a message. It is one
    of the DAO modules of the persistence layer "app-db-dao.ts", whose core
    provides the connection, the authorization, and the shared helpers.  */
export class MessageTextDAO {
    constructor (
        protected core: DB
    ) {}

    /*  create a new language-specific text of a message  */
    async create (session: Session, draft: Draft<MessageText>): Promise<MessageText> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "MessageText", draft)

        /*  store the draft  */
        const [ row ] = await db.insert(schema.messageTexts).values(draft).returning()
        return row
    }

    /*  list the language-specific texts of a message the session may read  */
    async list (session: Session, messageId: string): Promise<MessageText[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.messageTexts.findMany({ where: eq(schema.messageTexts.messageId, messageId) })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "MessageText", rows)
    }

    /*  update the changed attributes of a language-specific text of a message  */
    async update (session: Session, messageText: MessageText): Promise<MessageText> {
        const db      = this.core.require()
        const id      = messageText.messageTextId

        /*  load the stored row  */
        const row     = this.core.found(await db.query.messageTexts.findFirst({ where: eq(schema.messageTexts.messageTextId, id) }), "MessageText", id)

        /*  determine the changed attributes  */
        const changes = this.core.changesOf(schema.messageTexts, row, messageText)
        if (Object.keys(changes).length === 0)
            return row

        /*  authorize the update on the stored row for the changed attributes  */
        await this.core.authorize(session, "update", "MessageText", row, changes)

        /*  write the changes, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .update(schema.messageTexts)
            .set({ ...changes, version: this.core.bump(schema.messageTexts.version) })
            .where(and(eq(schema.messageTexts.messageTextId, id), eq(schema.messageTexts.version, messageText.version)))
            .returning()
        return this.core.stored(stored, "MessageText", id)
    }

    /*  delete a language-specific text of a message  */
    async delete (session: Session, messageText: MessageText): Promise<void> {
        const db  = this.core.require()
        const id  = messageText.messageTextId

        /*  load the stored row  */
        const row = this.core.found(await db.query.messageTexts.findFirst({ where: eq(schema.messageTexts.messageTextId, id) }), "MessageText", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "MessageText", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.messageTexts)
            .where(and(eq(schema.messageTexts.messageTextId, id), eq(schema.messageTexts.version, messageText.version)))
            .returning({ messageTextId: schema.messageTexts.messageTextId })
        this.core.stored(stored, "MessageText", id)
    }
}

