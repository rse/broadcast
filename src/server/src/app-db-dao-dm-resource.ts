/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq, ne }           from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, Graph, Resource } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity Resource
    (SPEC-DM-resource): a provider resource backing a channel, of which one
    is active at a time. It is one of the DAO modules of the persistence
    layer "app-db-dao.ts", whose core provides the connection, the
    authorization, and the shared helpers.  */
export class ResourceDAO {
    constructor (
        protected core: DB
    ) {}

    /*  create a new resource, deactivating the other resources of the channel
        if it is active (SPEC-DR single-resource), or activating it if the
        channel has no active resource yet (SPEC-DR initial-resource)  */
    async create (session: Session, draft: Draft<Resource>): Promise<Resource> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "Resource", draft)

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  deactivate the sibling rows first, as only one may be active  */
            if (draft.active === true)
                await tx.update(schema.resources)
                    .set({ active: false, version: this.core.bump(schema.resources.version) })
                    .where(eq(schema.resources.channelId, draft.channelId))

            /*  derive the activation, as one has to be active once one exists  */
            const active = draft.active === true || (await tx.query.resources.findFirst({
                where: and(eq(schema.resources.channelId, draft.channelId), eq(schema.resources.active, true))
            })) === undefined

            /*  store the draft  */
            const [ row ] = await tx.insert(schema.resources).values({ ...draft, active }).returning()
            return row
        })
    }

    /*  list the resources of a channel the session may read  */
    async list (session: Session, channelId: string): Promise<Resource[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.resources.findMany({ where: eq(schema.resources.channelId, channelId) })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "Resource", rows)
    }

    /*  read a resource with the provider parameters the session may read  */
    async read (session: Session, resourceId: string): Promise<Graph<Resource> | undefined> {
        const db  = this.core.require()

        /*  load the row, if it exists  */
        const row = await db.query.resources.findFirst({
            where: eq(schema.resources.resourceId, resourceId),
            with:  { params: true }
        })

        /*  authorize the read and reduce the parameters to the readable ones  */
        if (row !== undefined) {
            await this.core.authorize(session, "read", "Resource", row)
            row.params = await this.core.readable(session, "ResourceProviderParam", row.params)
        }
        return row
    }

    /*  update the changed attributes of a resource, deactivating the other
        resources of the channel if it becomes active, but rejecting its direct
        deactivation (SPEC-DR single-resource)  */
    async update (session: Session, resource: Resource): Promise<Resource> {
        const db      = this.core.require()
        const id      = resource.resourceId

        /*  load the stored row  */
        const row     = this.core.found(await db.query.resources.findFirst({ where: eq(schema.resources.resourceId, id) }), "Resource", id)

        /*  determine the changed attributes  */
        const changes = this.core.changesOf(schema.resources, row, resource)
        if (Object.keys(changes).length === 0)
            return row

        /*  reject the direct deactivation, as one has to stay active  */
        if (changes.active === false)
            throw new Error(`Resource "${id}" is active and can be deactivated only by activating another resource`)

        /*  authorize the update on the stored row for the changed attributes  */
        await this.core.authorize(session, "update", "Resource", row, changes)

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  deactivate the sibling rows first, as only one may be active  */
            if (changes.active === true)
                await tx.update(schema.resources)
                    .set({ active: false, version: this.core.bump(schema.resources.version) })
                    .where(eq(schema.resources.channelId, row.channelId))

            /*  write the changes, version-checked (optimistic locking)  */
            const [ stored ] = await tx
                .update(schema.resources)
                .set({ ...changes, version: this.core.bump(schema.resources.version) })
                .where(and(eq(schema.resources.resourceId, id), eq(schema.resources.version, resource.version)))
                .returning()
            return this.core.stored(stored, "Resource", id)
        })
    }

    /*  delete a resource with its provider parameters, rejecting the deletion
        of the active one while other resources of the channel exist (SPEC-DR
        single-resource)  */
    async delete (session: Session, resource: Resource): Promise<void> {
        const db  = this.core.require()
        const id  = resource.resourceId

        /*  load the stored row  */
        const row = this.core.found(await db.query.resources.findFirst({ where: eq(schema.resources.resourceId, id) }), "Resource", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "Resource", row)

        /*  reject the deletion of the active row, as one has to stay active  */
        if (row.active && (await db.query.resources.findFirst({
            where: and(eq(schema.resources.channelId, row.channelId), ne(schema.resources.resourceId, id))
        })) !== undefined)
            throw new Error(`Resource "${id}" is active and can be deleted only after activating another resource`)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.resources)
            .where(and(eq(schema.resources.resourceId, id), eq(schema.resources.version, resource.version)))
            .returning({ resourceId: schema.resources.resourceId })
        this.core.stored(stored, "Resource", id)
    }
}

