/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import crypto                    from "node:crypto"
import { and, eq }               from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, AuthorizationToken } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  mint a random six-digit token in the "NNN-NNN" format (SPEC-DR token-format)  */
const mintToken = (): string => {
    const digits = crypto.randomInt(0, 1000000).toString().padStart(6, "0")
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
}

/*  the Data Access Object (DAO) of the SPEC-DM entity AuthorizationToken
    (SPEC-DM-authtoken): the one-time second factor of the login, minted in
    the "NNN-NNN" format. It is one of the DAO modules of the persistence
    layer "app-db-dao.ts", whose core provides the connection, the
    authorization, and the shared helpers.  */
export class AuthorizationTokenDAO {
    constructor (
        protected core: DB
    ) {}

    /*  create a new authorization token for a user and event, minting its
        "NNN-NNN" value (SPEC-DR token-format) and re-minting it on the rare
        collision with an existing token  */
    async create (session: Session, draft: Omit<Draft<AuthorizationToken>, "token">): Promise<AuthorizationToken> {
        const db   = this.core.require()

        /*  mint the token value  */
        const data: Draft<AuthorizationToken> = { ...draft, token: mintToken() }

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "AuthorizationToken", data)

        /*  store the draft, re-minting the token on the rare collision  */
        for (let attempt = 0; attempt < 100; attempt++, data.token = mintToken()) {
            const [ row ] = await db.insert(schema.authorizationTokens).values(data).onConflictDoNothing().returning()
            if (row !== undefined)
                return row
        }
        throw new Error("failed to mint a unique authorization token")
    }

    /*  list the authorization tokens of an event the session may read,
        optionally confined to a user  */
    async list (session: Session, eventId: string, userId?: string): Promise<AuthorizationToken[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.authorizationTokens.findMany({
            where: and(
                eq(schema.authorizationTokens.eventId, eventId),
                userId === undefined ? undefined : eq(schema.authorizationTokens.userId, userId))
        })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "AuthorizationToken", rows)
    }

    /*  read an authorization token  */
    async read (session: Session, token: string): Promise<AuthorizationToken | undefined> {
        const db  = this.core.require()

        /*  load the row, if it exists  */
        const row = await db.query.authorizationTokens.findFirst({ where: eq(schema.authorizationTokens.token, token) })

        /*  authorize the read on the stored row  */
        if (row !== undefined)
            await this.core.authorize(session, "read", "AuthorizationToken", row)
        return row
    }

    /*  delete an authorization token  */
    async delete (session: Session, token: AuthorizationToken): Promise<void> {
        const db  = this.core.require()

        /*  load the stored row  */
        const row = this.core.found(await db.query.authorizationTokens.findFirst({ where: eq(schema.authorizationTokens.token, token.token) }), "AuthorizationToken", token.token)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "AuthorizationToken", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.authorizationTokens)
            .where(and(eq(schema.authorizationTokens.token, token.token), eq(schema.authorizationTokens.version, token.version)))
            .returning({ token: schema.authorizationTokens.token })
        this.core.stored(stored, "AuthorizationToken", token.token)
    }
}

