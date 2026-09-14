/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { and, eq, ne }           from "drizzle-orm"
import * as schema               from "./app-db-ddl.js"
import type { Draft, Graph, Channel } from "./app-db-types.js"
import type { Session }          from "./app-db-auth.js"
import type DB                   from "./app-db-dao.js"

/*  the Data Access Object (DAO) of the SPEC-DM entity Channel
    (SPEC-DM-channel): a logical content stream of an event, of which one is
    active at a time. It is one of the DAO modules of the persistence layer
    "app-db-dao.ts", whose core provides the connection, the authorization,
    and the shared helpers.  */
export class ChannelDAO {
    constructor (
        protected core: DB
    ) {}

    /*  create a new channel, deactivating the other channels of the event if
        it is active (SPEC-DR single-channel), or activating it if the event
        has no active channel yet (SPEC-DR initial-channel)  */
    async create (session: Session, draft: Draft<Channel>): Promise<Channel> {
        const db = this.core.require()

        /*  authorize the creation on the draft  */
        await this.core.authorize(session, "create", "Channel", draft)

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  deactivate the sibling rows first, as only one may be active  */
            if (draft.active === true)
                await tx.update(schema.channels)
                    .set({ active: false, version: this.core.bump(schema.channels.version) })
                    .where(eq(schema.channels.eventId, draft.eventId))

            /*  derive the activation, as one has to be active once one exists  */
            const active = draft.active === true || (await tx.query.channels.findFirst({
                where: and(eq(schema.channels.eventId, draft.eventId), eq(schema.channels.active, true))
            })) === undefined

            /*  store the draft  */
            const [ row ] = await tx.insert(schema.channels).values({ ...draft, active }).returning()
            return row
        })
    }

    /*  list the channels of an event, each with its resources and their
        provider parameters, as far as the session may read them  */
    async list (session: Session, eventId: string): Promise<Graph<Channel>[]> {
        const db   = this.core.require()

        /*  load the candidate rows  */
        const rows = await db.query.channels.findMany({
            where: eq(schema.channels.eventId, eventId),
            with:  { resources: { with: { params: true } } }
        })

        /*  reduce the channels, then their resources and parameters, to the readable ones  */
        const channels = await this.core.readable(session, "Channel", rows)
        for (const channel of channels) {
            channel.resources = await this.core.readable(session, "Resource", channel.resources)
            for (const resource of channel.resources)
                resource.params = await this.core.readable(session, "ResourceProviderParam", resource.params)
        }
        return channels
    }

    /*  update the changed attributes of a channel, deactivating the other
        channels of the event if it becomes active, but rejecting its direct
        deactivation (SPEC-DR single-channel)  */
    async update (session: Session, channel: Channel): Promise<Channel> {
        const db      = this.core.require()
        const id      = channel.channelId

        /*  load the stored row  */
        const row     = this.core.found(await db.query.channels.findFirst({ where: eq(schema.channels.channelId, id) }), "Channel", id)

        /*  determine the changed attributes  */
        const changes = this.core.changesOf(schema.channels, row, channel)
        if (Object.keys(changes).length === 0)
            return row

        /*  reject the direct deactivation, as one has to stay active  */
        if (changes.active === false)
            throw new Error(`Channel "${id}" is active and can be deactivated only by activating another channel`)

        /*  authorize the update on the stored row for the changed attributes  */
        await this.core.authorize(session, "update", "Channel", row, changes)

        /*  bundle multiple operations into a single transaction  */
        return db.transaction(async (tx) => {
            /*  deactivate the sibling rows first, as only one may be active  */
            if (changes.active === true)
                await tx.update(schema.channels)
                    .set({ active: false, version: this.core.bump(schema.channels.version) })
                    .where(eq(schema.channels.eventId, row.eventId))

            /*  write the changes, version-checked (optimistic locking)  */
            const [ stored ] = await tx
                .update(schema.channels)
                .set({ ...changes, version: this.core.bump(schema.channels.version) })
                .where(and(eq(schema.channels.channelId, id), eq(schema.channels.version, channel.version)))
                .returning()
            return this.core.stored(stored, "Channel", id)
        })
    }

    /*  delete a channel with its resources, rejecting the deletion of the
        active one while other channels of the event exist (SPEC-DR
        single-channel)  */
    async delete (session: Session, channel: Channel): Promise<void> {
        const db  = this.core.require()
        const id  = channel.channelId

        /*  load the stored row  */
        const row = this.core.found(await db.query.channels.findFirst({ where: eq(schema.channels.channelId, id) }), "Channel", id)

        /*  authorize the deletion on the stored row  */
        await this.core.authorize(session, "delete", "Channel", row)

        /*  reject the deletion of the active row, as one has to stay active  */
        if (row.active && (await db.query.channels.findFirst({
            where: and(eq(schema.channels.eventId, row.eventId), ne(schema.channels.channelId, id))
        })) !== undefined)
            throw new Error(`Channel "${id}" is active and can be deleted only after activating another channel`)

        /*  delete the row, version-checked (optimistic locking)  */
        const [ stored ] = await db
            .delete(schema.channels)
            .where(and(eq(schema.channels.channelId, id), eq(schema.channels.version, channel.version)))
            .returning({ channelId: schema.channels.channelId })
        this.core.stored(stored, "Channel", id)
    }
}

