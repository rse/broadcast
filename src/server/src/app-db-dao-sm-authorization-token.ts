/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq }               from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { AuthorizationToken } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import { AuthorizationTokenDAO } from "./app-db-dao-dm-authorization-token.js"

/*  the Data Access Object (DAO) of the SPEC-SM lifecycle AuthorizationToken
    (SPEC-SM-authtoken): the transitions send and consume of the login
    challenge, extending the DAO of the entity. It is one of the DAO modules
    of the persistence layer "app-db-dao.ts", whose core provides the
    connection, the authorization, and the shared helpers.  */
export class AuthorizationTokenLifecycleDAO extends AuthorizationTokenDAO {
    /*  internal helper: store the new state of an authorization token (version-checked)  */
    private async setState (token: AuthorizationToken, state: AuthorizationToken["state"]): Promise<AuthorizationToken> {
        /*  store the new state, version-checked (optimistic locking)  */
        const [ stored ] = await this.core.require()
            .update(schema.authorizationTokens)
            .set({ state, version: this.core.bump(schema.authorizationTokens.version) })
            .where(and(eq(schema.authorizationTokens.token, token.token), eq(schema.authorizationTokens.version, token.version)))
            .returning()
        return this.core.stored(stored, "AuthorizationToken", token.token)
    }

    /*  mark an issued authorization token as sent to its user (SPEC-SM send)  */
    async send (session: Session, token: AuthorizationToken): Promise<AuthorizationToken> {
        const db  = this.core.require()

        /*  load the stored row  */
        const row = this.core.found(await db.query.authorizationTokens.findFirst({ where: eq(schema.authorizationTokens.token, token.token) }), "AuthorizationToken", token.token)

        /*  ensure the transition is allowed in the current state  */
        if (row.state !== "issued")
            throw new Error(`no transition "send" of AuthorizationToken "${token.token}" allowed in state "${row.state}"`)

        /*  authorize the transition on the stored row  */
        await this.core.authorize(session, "send", "AuthorizationToken", row)

        /*  store the new state  */
        return this.setState(token, "sent")
    }

    /*  consume an authorization token in a login attempt: a sent token is
        used up (SPEC-SM consume), while an issued token carried by an
        automatic-access URL (SPEC-SM consume-automatic) is used up only if
        the event expires it on first use (SPEC-DM expireAuthTokenOnFirstUse),
        and an expired token is refused (SPEC-DR token-format)  */
    async consume (session: Session, token: AuthorizationToken): Promise<AuthorizationToken> {
        const db  = this.core.require()

        /*  load the stored row  */
        const row = this.core.found(await db.query.authorizationTokens.findFirst({ where: eq(schema.authorizationTokens.token, token.token) }), "AuthorizationToken", token.token)

        /*  refuse an already used token  */
        if (row.state === "used")
            throw new Error(`no transition "consume" of AuthorizationToken "${token.token}" allowed in state "${row.state}"`)

        /*  map the current state onto its transition  */
        const operation = row.state === "sent" ? "consume" : "consume-automatic"

        /*  authorize the transition on the stored row  */
        await this.core.authorize(session, operation, "AuthorizationToken", row)

        /*  refuse an expired token (SPEC-DR token-format)  */
        if (row.validUntil !== null && row.validUntil.getTime() < Date.now())
            throw new Error(`AuthorizationToken "${token.token}" expired`)

        /*  an automatically used token is used up only if the event so configures  */
        if (operation === "consume-automatic") {
            const event = this.core.found(await db.query.events.findFirst({ where: eq(schema.events.eventId, row.eventId) }), "Event", row.eventId)
            if (!event.expireAuthTokenOnFirstUse)
                return row
        }

        /*  store the new state  */
        return this.setState(token, "used")
    }
}

