/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, asc, eq }          from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, EventStatistic } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity EventStatistic
    (SPEC-DM-eventstatistic): a periodic snapshot of the event-wide counts.
    It is one of the DAO modules of the persistence layer "app-db-dao.ts",
    whose core provides the connection, the authorization, and the shared
    helpers.  */
export class EventStatisticDAO {
    constructor (
        protected core: DB
    ) {}

    /*  record a new event statistics snapshot  */
    async create (session: Session, draft: Draft<EventStatistic>): Promise<EventStatistic> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "EventStatistic", draft)

        /*  store the draft  */
        const [ row ] = await db.insert(schema.eventStatistics).values(draft).returning()
        return row
    }

    /*  list the statistics snapshots of an event over time  */
    async list (session: Session, eventId: string): Promise<EventStatistic[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.eventStatistics.findMany({
            where:   eq(schema.eventStatistics.eventId, eventId),
            orderBy: asc(schema.eventStatistics.timestamp)
        })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "EventStatistic", rows)
    }

    /*  prune an event statistics snapshot  */
    async delete (session: Session, statistic: EventStatistic): Promise<void> {
        const db  = this.core.require()
        const id  = statistic.eventStatisticId

        /*  load the stored row  */
        const row = this.core.found(await db.query.eventStatistics.findFirst({ where: eq(schema.eventStatistics.eventStatisticId, id) }), "EventStatistic", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "EventStatistic", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.eventStatistics)
            .where(and(eq(schema.eventStatistics.eventStatisticId, id), eq(schema.eventStatistics.version, statistic.version)))
            .returning({ eventStatisticId: schema.eventStatistics.eventStatisticId })
        this.core.stored(stored, "EventStatistic", id)
    }
}

