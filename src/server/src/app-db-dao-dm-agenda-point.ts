/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, asc, eq }          from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, Graph, AgendaPoint } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity AgendaPoint
    (SPEC-DM-agendapoint): a phase of an event with its corresponding
    question tags. It is one of the DAO modules of the persistence layer
    "app-db-dao.ts", whose core provides the connection, the authorization,
    and the shared helpers.  */
export class AgendaPointDAO {
    constructor (
        protected core: DB
    ) {}

    /*  create a new agenda point with its corresponding question tags  */
    async create (session: Session, draft: Draft<AgendaPoint>, correspondingTags: string[] = []): Promise<Graph<AgendaPoint>> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "AgendaPoint", draft)

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  store the draft  */
            const [ row ] = await tx.insert(schema.agendaPoints).values(draft).returning()

            /*  attach the tags  */
            if (correspondingTags.length > 0)
                await tx.insert(schema.agendaPointCorrespondingTags)
                    .values(correspondingTags.map((questionTagId) => ({ agendaPointId: row.agendaPointId, questionTagId })))

            /*  return the stored row with its relations  */
            const graph = await tx.query.agendaPoints.findFirst({
                where: eq(schema.agendaPoints.agendaPointId, row.agendaPointId),
                with:  { correspondingTags: true }
            })
            return this.core.found(graph, "AgendaPoint", row.agendaPointId)
        })
    }

    /*  list the agenda points of an event in their order, each with its
        corresponding question tags  */
    async list (session: Session, eventId: string): Promise<Graph<AgendaPoint>[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.agendaPoints.findMany({
            where:   eq(schema.agendaPoints.eventId, eventId),
            orderBy: asc(schema.agendaPoints.orderPosition),
            with:    { correspondingTags: true }
        })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "AgendaPoint", rows)
    }

    /*  update the changed attributes and, if loaded, the corresponding
        question tags of an agenda point  */
    async update (session: Session, agendaPoint: Graph<AgendaPoint>): Promise<Graph<AgendaPoint>> {
        const db      = this.core.require()
        const id      = agendaPoint.agendaPointId

        /*  load the stored row with its tags as the baseline of the diff  */
        const loaded  = await db.query.agendaPoints.findFirst({
            where: eq(schema.agendaPoints.agendaPointId, id),
            with:  { correspondingTags: true }
        })
        const row     = this.core.found(loaded, "AgendaPoint", id)

        /*  determine the changed attributes and whether the tag set differs  */
        const changes = this.core.changesOf(schema.agendaPoints, row, agendaPoint)
        const tags    = agendaPoint.correspondingTags?.map((tag) => tag.questionTagId)
        const stored  = row.correspondingTags.map((tag) => tag.questionTagId)
        const retag   = tags !== undefined && !(tags.length === stored.length && tags.every((tag) => stored.includes(tag)))
        if (Object.keys(changes).length === 0 && !retag)
            return row

        /*  authorize the update on the stored row for the changed attributes  */
        await this.core.authorize(session, "update", "AgendaPoint", row, changes)

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  write the changed attributes, version-checked (optimistic locking)  */
            const [ updated ] = await tx
                .update(schema.agendaPoints)
                .set({ ...changes, version: this.core.bump(schema.agendaPoints.version) })
                .where(and(eq(schema.agendaPoints.agendaPointId, id), eq(schema.agendaPoints.version, agendaPoint.version)))
                .returning({ agendaPointId: schema.agendaPoints.agendaPointId })
            this.core.stored(updated, "AgendaPoint", id)

            /*  replace the tag set by the given one  */
            if (retag) {
                await tx.delete(schema.agendaPointCorrespondingTags).where(eq(schema.agendaPointCorrespondingTags.agendaPointId, id))
                if (tags.length > 0)
                    await tx.insert(schema.agendaPointCorrespondingTags)
                        .values(tags.map((questionTagId) => ({ agendaPointId: id, questionTagId })))
            }

            /*  return the stored row with its tags  */
            const graph = await tx.query.agendaPoints.findFirst({
                where: eq(schema.agendaPoints.agendaPointId, id),
                with:  { correspondingTags: true }
            })
            return this.core.found(graph, "AgendaPoint", id)
        })
    }

    /*  delete an agenda point  */
    async delete (session: Session, agendaPoint: AgendaPoint): Promise<void> {
        const db  = this.core.require()
        const id  = agendaPoint.agendaPointId

        /*  load the stored row  */
        const row = this.core.found(await db.query.agendaPoints.findFirst({ where: eq(schema.agendaPoints.agendaPointId, id) }), "AgendaPoint", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "AgendaPoint", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.agendaPoints)
            .where(and(eq(schema.agendaPoints.agendaPointId, id), eq(schema.agendaPoints.version, agendaPoint.version)))
            .returning({ agendaPointId: schema.agendaPoints.agendaPointId })
        this.core.stored(stored, "AgendaPoint", id)
    }
}

