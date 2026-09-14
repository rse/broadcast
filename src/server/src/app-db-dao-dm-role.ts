/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq }               from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, Role }      from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity Role (SPEC-DM-role):
    a grant of rights held by a user. It is one of the DAO modules of the
    persistence layer "app-db-dao.ts", whose core provides the connection,
    the authorization, and the shared helpers.  */
export class RoleDAO {
    constructor (
        protected core: DB
    ) {}

    /*  grant a role to a user  */
    async create (session: Session, draft: Draft<Role>): Promise<Role> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "Role", draft)

        /*  store the draft  */
        const [ row ] = await db.insert(schema.roles).values(draft).returning()
        return row
    }

    /*  list the roles of a user the session may read  */
    async list (session: Session, userId: string): Promise<Role[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.roles.findMany({ where: eq(schema.roles.userId, userId) })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "Role", rows)
    }

    /*  revoke a role from its user  */
    async delete (session: Session, role: Role): Promise<void> {
        const db  = this.core.require()
        const id  = role.roleId

        /*  load the stored row  */
        const row = this.core.found(await db.query.roles.findFirst({ where: eq(schema.roles.roleId, id) }), "Role", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "Role", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.roles)
            .where(and(eq(schema.roles.roleId, id), eq(schema.roles.version, role.version)))
            .returning({ roleId: schema.roles.roleId })
        this.core.stored(stored, "Role", id)
    }
}

