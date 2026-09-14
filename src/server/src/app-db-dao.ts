/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import path                               from "node:path"
import postgres                           from "postgres"
import { drizzle, type PostgresJsDatabase, type PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js"
import { migrate }                        from "drizzle-orm/postgres-js/migrator"
import type { PgDatabase, PgColumn, PgTable } from "drizzle-orm/pg-core"
import { sql, getTableColumns, type SQL } from "drizzle-orm"
import Log                                from "./app-log.js"
import * as schema                        from "./app-db-ddl.js"
import type { Entity, Row, Draft }        from "./app-db-types.js"
import { authorize, AuthorizationError, type Session, type Operation } from "./app-db-auth.js"
import { EventLifecycleDAO }              from "./app-db-dao-sm-event.js"
import { AgendaPointDAO }                 from "./app-db-dao-dm-agenda-point.js"
import { ChannelDAO }                     from "./app-db-dao-dm-channel.js"
import { ResourceDAO }                    from "./app-db-dao-dm-resource.js"
import { ResourceProviderParamDAO }       from "./app-db-dao-dm-resource-provider-param.js"
import { UserDAO }                        from "./app-db-dao-dm-user.js"
import { RoleDAO }                        from "./app-db-dao-dm-role.js"
import { MessageLifecycleDAO }            from "./app-db-dao-sm-message.js"
import { MessageTextDAO }                 from "./app-db-dao-dm-message-text.js"
import { QuestionTagDAO }                 from "./app-db-dao-dm-question-tag.js"
import { AuthorizationTokenLifecycleDAO } from "./app-db-dao-sm-authorization-token.js"
import { SessionTokenDAO }                from "./app-db-dao-dm-session-token.js"
import { EventStatisticDAO }              from "./app-db-dao-dm-event-statistic.js"
import { ChannelStatisticDAO }            from "./app-db-dao-dm-channel-statistic.js"
import { UserStatisticLifecycleDAO }      from "./app-db-dao-sm-user-statistic.js"

/*  a query executor: the connection pool or a transaction on it  */
export type Executor = PgDatabase<PostgresJsQueryResultHKT, typeof schema>

/*  the error raised when an object was changed or deleted concurrently,
    i.e. its version no longer matches the stored one (optimistic locking)  */
export class ConflictError extends Error {
    constructor (
        public readonly entity: Entity,
        public readonly id:     string,
        options?: ErrorOptions
    ) {
        super(`${entity} "${id}" changed concurrently`, options)
        this.name = "ConflictError"
    }
}

/*  the persistence layer, bridging the application to the PostgreSQL database
    via postgres.js (low-level driver with an explicit, tuned connection pool)
    and Drizzle (high-level, type-safe query API). It is the core the Data
    Access Objects (DAOs) of the SPEC-DM entities ("app-db-dao-dm-*.ts") and
    of the SPEC-SM lifecycles ("app-db-dao-sm-*.ts") operate on: it provides
    the connection, the authorization bridge, and the shared helpers, and
    exposes the DAOs as its fields, so that "db.event.create(...)" creates an
    event and "db.event.publish(...)" transitions it. The DAOs operate on
    objects: a creation takes a draft and returns the stored row, an update
    takes the changed row, writes the attributes differing from the stored row,
    and returns the stored row, and every write of a row checks and increments
    its version (optimistic locking), raising a ConflictError on a concurrent
    change. As SPEC-AM knows no system role, the system-driven operations of
    the service (login challenge, translation, statistics) run under the
    administrator session.  */
export default class DB {
    private sql: ReturnType<typeof postgres>            | null = null
    private db:  PostgresJsDatabase<typeof schema>      | null = null

    /*  the DAOs of the SPEC-DM entities, carrying their SPEC-SM lifecycles  */
    readonly event                 = new EventLifecycleDAO(this)
    readonly agendaPoint           = new AgendaPointDAO(this)
    readonly channel               = new ChannelDAO(this)
    readonly resource              = new ResourceDAO(this)
    readonly resourceProviderParam = new ResourceProviderParamDAO(this)
    readonly user                  = new UserDAO(this)
    readonly role                  = new RoleDAO(this)
    readonly message               = new MessageLifecycleDAO(this)
    readonly messageText           = new MessageTextDAO(this)
    readonly questionTag           = new QuestionTagDAO(this)
    readonly authorizationToken    = new AuthorizationTokenLifecycleDAO(this)
    readonly sessionToken          = new SessionTokenDAO(this)
    readonly eventStatistic        = new EventStatisticDAO(this)
    readonly channelStatistic      = new ChannelStatisticDAO(this)
    readonly userStatistic         = new UserStatisticLifecycleDAO(this)

    constructor (
        private log: Log,
        private url: string
    ) {}

    /*  apply all pending schema migrations, driven by the SQL files and the
        journal which Drizzle Kit generated into "etc/migrations" from the
        schema definition in "app-db-ddl.ts". This is intentionally a static
        method, as it runs in the cluster primary before any worker process
        exists, and hence outside the lifecycle of a regular DB instance.
        Drizzle records every applied migration in its own bookkeeping table,
        so a re-run against an already up-to-date database is a no-op.  */
    static async migrate (log: Log, url: string): Promise<void> {
        /*  use a dedicated, single-connection pool: the migrator guards its
            run with a PostgreSQL advisory lock, which a multi-connection pool
            could acquire and release on two different backends  */
        const sql = postgres(url, {
            max:             1,
            connect_timeout: 10
        })

        /*  resolve the migrations directory relative to the transpiled
            artifacts, mirroring the source tree layout ("dst" and "etc" are
            siblings both in the working copy and in the container image)  */
        const migrationsFolder = path.resolve(import.meta.dirname, "../etc/migrations")
        try {
            log.write("info", `applying database schema migrations from ${migrationsFolder}`)
            await migrate(drizzle(sql), { migrationsFolder })
            log.write("info", "database schema is up-to-date")
        }
        finally {
            await sql.end({ timeout: 10 })
        }
    }

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

    /*  ==== SHARED HELPERS (for the entity and lifecycle DAO modules) =======  */

    /*  ensure the query API is available  */
    require (): PostgresJsDatabase<typeof schema> {
        if (this.db === null)
            throw new Error("database not connected")
        return this.db
    }

    /*  ensure a loaded object of an entity exists  */
    found<T> (obj: T | undefined, entity: Entity, id: string): T {
        if (obj === undefined)
            throw new Error(`${entity} "${id}" not found`)
        return obj
    }

    /*  ensure a version-checked write of an object of an entity returned the
        stored row, i.e. hit the version it was based on  */
    stored<T> (obj: T | undefined, entity: Entity, id: string): T {
        if (obj === undefined)
            throw new ConflictError(entity, id)
        return obj
    }

    /*  the incremented version of a row (optimistic locking)  */
    bump (version: PgColumn): SQL {
        return sql`${version} + 1`
    }

    /*  the attributes of an object which differ from its stored row: only the
        columns of the table are compared (so loaded relations are ignored), the
        version and the derived attributes are excluded, and dates are compared
        by value  */
    changesOf<T extends PgTable> (table: T, row: T["$inferSelect"], obj: T["$inferSelect"],
        ...derived: string[]): Partial<T["$inferSelect"]> {
        const changes: Record<string, unknown> = {}
        const before = row as Record<string, unknown>
        const after  = obj as Record<string, unknown>
        for (const key of Object.keys(getTableColumns(table))) {
            if (key === "version" || derived.includes(key))
                continue
            const same = before[key] instanceof Date && after[key] instanceof Date ?
                (before[key] as Date).getTime() === (after[key] as Date).getTime() : before[key] === after[key]
            if (!same)
                changes[key] = after[key]
        }
        return changes as Partial<T["$inferSelect"]>
    }

    /*  ==== AUTHORIZATION ====================================================  */

    /*  authorize an operation of a session on an object of an entity according
        to the authorization model (see "app-db-auth.ts"): a creation is judged
        on its insert data, every other operation on the row, where an update
        additionally states the attributes it changes  */
    authorize<E extends Entity> (session: Session, operation: "create",
        entity: E, obj: Draft<Row<E>>): Promise<void>
    authorize<E extends Entity> (session: Session, operation: Exclude<Operation, "create">,
        entity: E, obj: Row<E>, changes?: Partial<Row<E>>): Promise<void>
    authorize (session: Session, operation: Operation,
        entity: Entity, obj: unknown, changes?: object): Promise<void> {
        return authorize(this.require(), session, operation, entity, obj, changes)
    }

    /*  decide whether a session may perform an operation on a row of an
        entity, mapping a denial onto false instead of an error  */
    async permitted<E extends Entity> (session: Session, operation: Exclude<Operation, "create">,
        entity: E, obj: Row<E>, changes?: Partial<Row<E>>): Promise<boolean> {
        try {
            await this.authorize(session, operation, entity, obj, changes)
            return true
        }
        catch (err) {
            if (err instanceof AuthorizationError)
                return false
            throw err
        }
    }

    /*  reduce the rows of an entity to the ones a session may read  */
    async readable<E extends Entity, T extends Row<E>> (session: Session, entity: E, objs: T[]): Promise<T[]> {
        const result: T[] = []
        for (const obj of objs)
            if (await this.permitted(session, "read", entity, obj))
                result.push(obj)
        return result
    }
}

