/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, asc, eq }          from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, UserStatistic } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity UserStatistic
    (SPEC-DM-userstatistic): a snapshot of the viewer information of a user
    of an event, retained unlinked after the event finishes. It is one of
    the DAO modules of the persistence layer "app-db-dao.ts", whose core
    provides the connection, the authorization, and the shared helpers.  */
export class UserStatisticDAO {
    constructor (
        protected core: DB
    ) {}

    /*  record a new user statistics snapshot  */
    async create (session: Session, draft: Draft<UserStatistic>): Promise<UserStatistic> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "UserStatistic", draft)

        /*  store the draft  */
        const [ row ] = await db.insert(schema.userStatistics).values(draft).returning()
        return row
    }

    /*  list the statistics snapshots of the users of an event over time,
        the unlinked ones of a finished event included  */
    async list (session: Session, eventId: string): Promise<UserStatistic[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.userStatistics.findMany({
            where:   eq(schema.userStatistics.eventId, eventId),
            orderBy: asc(schema.userStatistics.timestamp)
        })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "UserStatistic", rows)
    }

    /*  prune a user statistics snapshot  */
    async delete (session: Session, statistic: UserStatistic): Promise<void> {
        const db  = this.core.require()
        const id  = statistic.userStatisticId

        /*  load the stored row  */
        const row = this.core.found(await db.query.userStatistics.findFirst({ where: eq(schema.userStatistics.userStatisticId, id) }), "UserStatistic", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "UserStatistic", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.userStatistics)
            .where(and(eq(schema.userStatistics.userStatisticId, id), eq(schema.userStatistics.version, statistic.version)))
            .returning({ userStatisticId: schema.userStatistics.userStatisticId })
        this.core.stored(stored, "UserStatistic", id)
    }
}

