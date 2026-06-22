/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import postgres                  from "postgres"
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import { eq }                    from "drizzle-orm"
import Log                       from "./app-log.js"
import * as schema               from "./app-db-ddl.js"
import type { NewEvent }         from "./app-db-ddl.js"

/*  the persistence layer, bridging the application to the PostgreSQL database
    via postgres.js (low-level driver with an explicit, tuned connection pool)
    and Drizzle (high-level, type-safe query API). This is intentionally a thin
    connection wrapper with only a couple of example Data Access Objects (DAOs);
    the full per-aggregate DAO surface grows in later tasks.  */
export default class DB {
    private sql: ReturnType<typeof postgres>            | null = null
    private db:  PostgresJsDatabase<typeof schema>      | null = null

    constructor (
        private log: Log,
        private url: string
    ) {}

    /*  establish the connection pool and the Drizzle query API  */
    async connect (): Promise<void> {
        /*  establish the low-level postgres.js connection pool with an
            explicit, tuned configuration (mirroring the 10s timeout style
            used for the MQTT broker connection)  */
        this.log.write("info", "connecting to PostgreSQL database")
        const sql = postgres(this.url, {
            max:             10,
            idle_timeout:    30,
            connect_timeout: 10,
            onnotice:        (notice) => {
                this.log.write("debug", `PostgreSQL: ${notice.message}`)
            }
        })

        /*  probe the connection so a misconfiguration fails fast at startup  */
        await sql`SELECT 1`
        this.sql = sql

        /*  establish the high-level Drizzle query API layer  */
        this.db = drizzle(sql, { schema })
        this.log.write("info", "connected to PostgreSQL database")
    }

    /*  gracefully close the connection pool  */
    async disconnect (): Promise<void> {
        if (this.sql !== null) {
            await this.sql.end({ timeout: 10 })
            this.sql = null
            this.db  = null
            this.log.write("info", "disconnected from PostgreSQL database")
        }
    }

    /*  internal helper: ensure the query API is available  */
    private require (): PostgresJsDatabase<typeof schema> {
        if (this.db === null)
            throw new Error("database not connected")
        return this.db
    }

    /*  ==== EXAMPLE DATA ACCESS OBJECTS (DAOs) ===========================  */

    /*  DAO: create a new event and return its generated id  */
    async createEvent (event: NewEvent): Promise<string> {
        const db = this.require()
        const [ row ] = await db
            .insert(schema.events)
            .values(event)
            .returning({ eventId: schema.events.eventId })
        return row.eventId
    }

    /*  DAO: read an event together with its channels, agenda points, and
        messages aggregate, navigating the relations via the Drizzle query API  */
    async readEventAggregate (eventId: string) {
        const db = this.require()
        return db.query.events.findFirst({
            where: eq(schema.events.eventId, eventId),
            with: {
                channels:     { with: { resources: true } },
                agendaPoints: true,
                messages:     { with: { texts: true } }
            }
        })
    }
}
