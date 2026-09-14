/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, asc, eq }          from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, ChannelStatistic } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity ChannelStatistic
    (SPEC-DM-channelstatistic): a periodic snapshot of the viewers of a
    channel. It is one of the DAO modules of the persistence layer
    "app-db-dao.ts", whose core provides the connection, the authorization,
    and the shared helpers.  */
export class ChannelStatisticDAO {
    constructor (
        protected core: DB
    ) {}

    /*  record a new channel statistics snapshot  */
    async create (session: Session, draft: Draft<ChannelStatistic>): Promise<ChannelStatistic> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "ChannelStatistic", draft)

        /*  store the draft  */
        const [ row ] = await db.insert(schema.channelStatistics).values(draft).returning()
        return row
    }

    /*  list the statistics snapshots of a channel over time  */
    async list (session: Session, channelId: string): Promise<ChannelStatistic[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.channelStatistics.findMany({
            where:   eq(schema.channelStatistics.channelId, channelId),
            orderBy: asc(schema.channelStatistics.timestamp)
        })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "ChannelStatistic", rows)
    }

    /*  prune a channel statistics snapshot  */
    async delete (session: Session, statistic: ChannelStatistic): Promise<void> {
        const db  = this.core.require()
        const id  = statistic.channelStatisticId

        /*  load the stored row  */
        const row = this.core.found(await db.query.channelStatistics.findFirst({ where: eq(schema.channelStatistics.channelStatisticId, id) }), "ChannelStatistic", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "ChannelStatistic", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.channelStatistics)
            .where(and(eq(schema.channelStatistics.channelStatisticId, id), eq(schema.channelStatistics.version, statistic.version)))
            .returning({ channelStatisticId: schema.channelStatistics.channelStatisticId })
        this.core.stored(stored, "ChannelStatistic", id)
    }
}

