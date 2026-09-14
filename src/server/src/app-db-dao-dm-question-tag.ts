/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, asc, eq }          from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, QuestionTag } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity QuestionTag
    (SPEC-DM-questiontag): a tag attachable to questions and agenda points.
    It is one of the DAO modules of the persistence layer "app-db-dao.ts",
    whose core provides the connection, the authorization, and the shared
    helpers.  */
export class QuestionTagDAO {
    constructor (
        protected core: DB
    ) {}

    /*  create a new question tag  */
    async create (session: Session, draft: Draft<QuestionTag>): Promise<QuestionTag> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "QuestionTag", draft)

        /*  store the draft  */
        const [ row ] = await db.insert(schema.questionTags).values(draft).returning()
        return row
    }

    /*  list the question tags of an event the session may use  */
    async list (session: Session, eventId: string): Promise<QuestionTag[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.questionTags.findMany({
            where:   eq(schema.questionTags.eventId, eventId),
            orderBy: [ asc(schema.questionTags.group), asc(schema.questionTags.text) ]
        })

        /*  reduce to the rows the session may read  */
        return this.core.readable(session, "QuestionTag", rows)
    }

    /*  update the changed attributes of a question tag  */
    async update (session: Session, questionTag: QuestionTag): Promise<QuestionTag> {
        const db      = this.core.require()
        const id      = questionTag.questionTagId

        /*  load the stored row  */
        const row     = this.core.found(await db.query.questionTags.findFirst({ where: eq(schema.questionTags.questionTagId, id) }), "QuestionTag", id)

        /*  determine the changed attributes  */
        const changes = this.core.changesOf(schema.questionTags, row, questionTag)
        if (Object.keys(changes).length === 0)
            return row

        /*  authorize the update on the stored row for the changed attributes  */
        await this.core.authorize(session, "update", "QuestionTag", row, changes)

        /*  write the changes, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .update(schema.questionTags)
            .set({ ...changes, version: this.core.bump(schema.questionTags.version) })
            .where(and(eq(schema.questionTags.questionTagId, id), eq(schema.questionTags.version, questionTag.version)))
            .returning()
        return this.core.stored(stored, "QuestionTag", id)
    }

    /*  delete a question tag, detaching it from the messages and agenda points  */
    async delete (session: Session, questionTag: QuestionTag): Promise<void> {
        const db  = this.core.require()
        const id  = questionTag.questionTagId

        /*  load the stored row  */
        const row = this.core.found(await db.query.questionTags.findFirst({ where: eq(schema.questionTags.questionTagId, id) }), "QuestionTag", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "QuestionTag", row)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.questionTags)
            .where(and(eq(schema.questionTags.questionTagId, id), eq(schema.questionTags.version, questionTag.version)))
            .returning({ questionTagId: schema.questionTags.questionTagId })
        this.core.stored(stored, "QuestionTag", id)
    }
}

