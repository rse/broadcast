/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq }               from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, Graph, SessionToken } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity SessionToken
    (SPEC-DM-sessiontoken): the result of a successful login, of which one
    per user and event is active. It is one of the DAO modules of the
    persistence layer "app-db-dao.ts", whose core provides the connection,
    the authorization, and the shared helpers.  */
export class SessionTokenDAO {
    constructor (
        protected core: DB
    ) {}

    /*  create a new session token for a user and event, deleting any prior
        session token of the user for the event (SPEC-DR single-session)  */
    async create (session: Session, draft: Draft<SessionToken>): Promise<SessionToken> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "SessionToken", draft)

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  close any prior session of the user for the event (SPEC-DR single-session)  */
            await tx.delete(schema.sessionTokens).where(and(
                eq(schema.sessionTokens.userId,  draft.userId),
                eq(schema.sessionTokens.eventId, draft.eventId)))

            /*  store the draft  */
            const [ row ] = await tx.insert(schema.sessionTokens).values(draft).returning()
            return row
        })
    }

    /*  list the session tokens of an event the session may read  */
    async list (session: Session, eventId: string): Promise<SessionToken[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.sessionTokens.findMany({ where: eq(schema.sessionTokens.eventId, eventId) })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "SessionToken", rows)
    }

    /*  read a session token with its user and the roles of the user  */
    async read (session: Session, sessionId: string): Promise<Graph<SessionToken> | undefined> {
        const db  = this.core.require()

        /*  load the row, if it exists  */
        const row = await db.query.sessionTokens.findFirst({
            where: eq(schema.sessionTokens.sessionId, sessionId),
            with:  { user: { with: { roles: true } } }
        })

        /*  authorize the read on the stored row  */
        if (row !== undefined)
            await this.core.authorize(session, "read", "SessionToken", row)
        return row
    }

    /*  delete a session token, terminating the session  */
    async delete (session: Session, sessionToken: SessionToken): Promise<void> {
        const db  = this.core.require()
        const id  = sessionToken.sessionId

        /*  load the stored row  */
        const row = this.core.found(await db.query.sessionTokens.findFirst({ where: eq(schema.sessionTokens.sessionId, id) }), "SessionToken", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "SessionToken", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.sessionTokens)
            .where(and(eq(schema.sessionTokens.sessionId, id), eq(schema.sessionTokens.version, sessionToken.version)))
            .returning({ sessionId: schema.sessionTokens.sessionId })
        this.core.stored(stored, "SessionToken", id)
    }
}

