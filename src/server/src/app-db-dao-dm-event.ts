/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, asc, eq }          from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, Event }     from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity Event
    (SPEC-DM-event): the master entity every other entity hangs off. It is
    one of the DAO modules of the persistence layer "app-db-dao.ts", whose
    core provides the connection, the authorization, and the shared helpers.  */
export class EventDAO {
    constructor (
        protected core: DB
    ) {}

    /*  create a new event  */
    async create (session: Session, draft: Draft<Event>): Promise<Event> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "Event", draft)

        /*  store the draft  */
        const [ row ] = await db.insert(schema.events).values(draft).returning()
        return row
    }

    /*  list the events the session may read: every event for the
        administrator, the own event for an event role  */
    async list (session: Session): Promise<Event[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.events.findMany({ orderBy: asc(schema.events.begin) })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "Event", rows)
    }

    /*  read an event  */
    async read (session: Session, eventId: string): Promise<Event | undefined> {
        const db  = this.core.require()

        /*  load the row, if it exists  */
        const row = await db.query.events.findFirst({ where: eq(schema.events.eventId, eventId) })

        /*  authorize the read on the stored row  */
        if (row !== undefined)
            await this.core.authorize(session, "read", "Event", row)
        return row
    }

    /*  update the changed attributes of an event  */
    async update (session: Session, event: Event): Promise<Event> {
        const db      = this.core.require()

        /*  load the stored row  */
        const row     = this.core.found(await db.query.events.findFirst({ where: eq(schema.events.eventId, event.eventId) }), "Event", event.eventId)

        /*  determine the changed attributes  */
        const changes = this.core.changesOf(schema.events, row, event)
        if (Object.keys(changes).length === 0)
            return row

        /*  authorize the update on the stored row for the changed attributes  */
        await this.core.authorize(session, "update", "Event", row, changes)

        /*  write the changes, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .update(schema.events)
            .set({ ...changes, version: this.core.bump(schema.events.version) })
            .where(and(eq(schema.events.eventId, event.eventId), eq(schema.events.version, event.version)))
            .returning()
        return this.core.stored(stored, "Event", event.eventId)
    }

    /*  delete an event entirely, with everything hanging off it  */
    async delete (session: Session, event: Event): Promise<void> {
        const db  = this.core.require()

        /*  load the stored row  */
        const row = this.core.found(await db.query.events.findFirst({ where: eq(schema.events.eventId, event.eventId) }), "Event", event.eventId)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "Event", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.events)
            .where(and(eq(schema.events.eventId, event.eventId), eq(schema.events.version, event.version)))
            .returning({ eventId: schema.events.eventId })
        this.core.stored(stored, "Event", event.eventId)
    }
}

