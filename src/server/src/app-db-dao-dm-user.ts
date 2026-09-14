/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq, isNull }       from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, Graph, User } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity User (SPEC-DM-user):
    a person within an event, or the administrator outside any event. It is
    one of the DAO modules of the persistence layer "app-db-dao.ts", whose
    core provides the connection, the authorization, and the shared helpers.  */
export class UserDAO {
    constructor (
        protected core: DB
    ) {}

    /*  create a new user  */
    async create (session: Session, draft: Draft<User>): Promise<User> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "User", draft)

        /*  store the draft  */
        const [ row ] = await db.insert(schema.users).values(draft).returning()
        return row
    }

    /*  list the users of an event (its access list), each with its roles  */
    async list (session: Session, eventId: string): Promise<Graph<User>[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.users.findMany({
            where: eq(schema.users.eventId, eventId),
            with:  { roles: true }
        })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "User", rows)
    }

    /*  read a user with its roles  */
    async read (session: Session, userId: string): Promise<Graph<User> | undefined> {
        const db  = this.core.require()

        /*  load the row, if it exists  */
        const row = await db.query.users.findFirst({
            where: eq(schema.users.userId, userId),
            with:  { roles: true }
        })

        /*  authorize the read on the stored row  */
        if (row !== undefined)
            await this.core.authorize(session, "read", "User", row)
        return row
    }

    /*  read the user of an email address within an event, or outside any
        event (the administrator user), with its roles  */
    async readByEmail (session: Session, eventId: string | null, email: string): Promise<Graph<User> | undefined> {
        const db  = this.core.require()

        /*  load the row, if it exists  */
        const row = await db.query.users.findFirst({
            where: and(
                eventId === null ? isNull(schema.users.eventId) : eq(schema.users.eventId, eventId),
                eq(schema.users.email, email)),
            with:  { roles: true }
        })

        /*  authorize the read on the stored row  */
        if (row !== undefined)
            await this.core.authorize(session, "read", "User", row)
        return row
    }

    /*  update the changed attributes of a user  */
    async update (session: Session, user: User): Promise<User> {
        const db      = this.core.require()
        const id      = user.userId

        /*  load the stored row  */
        const row     = this.core.found(await db.query.users.findFirst({ where: eq(schema.users.userId, id) }), "User", id)

        /*  determine the changed attributes  */
        const changes = this.core.changesOf(schema.users, row, user)
        if (Object.keys(changes).length === 0)
            return row

        /*  authorize the update on the stored row for the changed attributes  */
        await this.core.authorize(session, "update", "User", row, changes)

        /*  write the changes, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .update(schema.users)
            .set({ ...changes, version: this.core.bump(schema.users.version) })
            .where(and(eq(schema.users.userId, id), eq(schema.users.version, user.version)))
            .returning()
        return this.core.stored(stored, "User", id)
    }

    /*  delete a user with its roles, tokens, and likes, unlinking its statistics  */
    async delete (session: Session, user: User): Promise<void> {
        const db  = this.core.require()
        const id  = user.userId

        /*  load the stored row  */
        const row = this.core.found(await db.query.users.findFirst({ where: eq(schema.users.userId, id) }), "User", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "User", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.users)
            .where(and(eq(schema.users.userId, id), eq(schema.users.version, user.version)))
            .returning({ userId: schema.users.userId })
        this.core.stored(stored, "User", id)
    }
}

