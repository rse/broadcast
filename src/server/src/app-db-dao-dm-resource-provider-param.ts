/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq }               from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, ResourceProviderParam } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity ResourceProviderParam
    (SPEC-DM-resourceparam): a provider parameter of a resource, identified
    by its composite key. It is one of the DAO modules of the persistence
    layer "app-db-dao.ts", whose core provides the connection, the
    authorization, and the shared helpers.  */
export class ResourceProviderParamDAO {
    constructor (
        protected core: DB
    ) {}

    /*  internal helper: the condition identifying a provider parameter by its key  */
    private paramKey (param: Pick<ResourceProviderParam, "resourceId" | "providerId" | "key">) {
        return and(
            eq(schema.resourceProviderParams.resourceId, param.resourceId),
            eq(schema.resourceProviderParams.providerId, param.providerId),
            eq(schema.resourceProviderParams.key,        param.key))
    }

    /*  create a new provider parameter of a resource  */
    async create (session: Session, draft: Draft<ResourceProviderParam>): Promise<ResourceProviderParam> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "ResourceProviderParam", draft)

        /*  store the draft  */
        const [ row ] = await db.insert(schema.resourceProviderParams).values(draft).returning()
        return row
    }

    /*  list the provider parameters of a resource the session may read  */
    async list (session: Session, resourceId: string): Promise<ResourceProviderParam[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.resourceProviderParams.findMany({ where: eq(schema.resourceProviderParams.resourceId, resourceId) })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "ResourceProviderParam", rows)
    }

    /*  update the changed value of a provider parameter of a resource  */
    async update (session: Session, param: ResourceProviderParam): Promise<ResourceProviderParam> {
        const db      = this.core.require()

        /*  load the stored row  */
        const row     = this.core.found(await db.query.resourceProviderParams.findFirst({ where: this.paramKey(param) }), "ResourceProviderParam", param.key)

        /*  determine the changed attributes  */
        const changes = this.core.changesOf(schema.resourceProviderParams, row, param)
        if (Object.keys(changes).length === 0)
            return row

        /*  authorize the update on the stored row for the changed attributes  */
        await this.core.authorize(session, "update", "ResourceProviderParam", row, changes)

        /*  write the changes, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .update(schema.resourceProviderParams)
            .set({ ...changes, version: this.core.bump(schema.resourceProviderParams.version) })
            .where(and(this.paramKey(param), eq(schema.resourceProviderParams.version, param.version)))
            .returning()
        return this.core.stored(stored, "ResourceProviderParam", param.key)
    }

    /*  delete a provider parameter of a resource  */
    async delete (session: Session, param: ResourceProviderParam): Promise<void> {
        const db  = this.core.require()

        /*  load the stored row  */
        const row = this.core.found(await db.query.resourceProviderParams.findFirst({ where: this.paramKey(param) }), "ResourceProviderParam", param.key)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "ResourceProviderParam", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.resourceProviderParams)
            .where(and(this.paramKey(param), eq(schema.resourceProviderParams.version, param.version)))
            .returning({ key: schema.resourceProviderParams.key })
        this.core.stored(stored, "ResourceProviderParam", param.key)
    }
}

