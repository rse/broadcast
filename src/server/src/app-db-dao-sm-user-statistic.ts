/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq, isNotNull }    from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Executor }         from "./app-db-dao.js"
import { UserStatisticDAO }      from "./app-db-dao-dm-user-statistic.js"

/*  the Data Access Object (DAO) of the SPEC-SM lifecycle UserStatistic
    (SPEC-SM-userstatistic): the transition unlink of the anonymization,
    extending the DAO of the entity. It is one of the DAO modules of the
    persistence layer "app-db-dao.ts", whose core provides the connection,
    the authorization, and the shared helpers.  */
export class UserStatisticLifecycleDAO extends UserStatisticDAO {
    /*  unlink the linked user statistics of an event from their users
        (SPEC-SM unlink): a transition of the actor System, which the finish
        of the event performs within its transaction (see
        "app-db-dao-sm-event.ts") and which is hence authorized by the finish
        transition of the event alone  */
    async unlink (db: Executor, eventId: string): Promise<void> {
        /*  store the new state of the linked rows (version-incremented)  */
        await db
            .update(schema.userStatistics)
            .set({ userId: null, version: this.core.bump(schema.userStatistics.version) })
            .where(and(eq(schema.userStatistics.eventId, eventId), isNotNull(schema.userStatistics.userId)))
    }
}

