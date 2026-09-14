/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/*  Authorization model derived faithfully from the SPEC authorization model
    (SPEC-AM): one permission per SPEC-AM PERMISSION object, granting a role of
    the SPEC-UP User Personas a set of operations (the generic CRUD ones or the
    SPEC-SM state transitions) on one SPEC-DM entity, confined to the lifecycle
    states of the entity and to a further condition. The model is closed: an
    operation not granted by any permission is denied. As an event role
    (SPEC-DM Role) is held by a user within one event only, the "belongs to
    the event the role is held of" conditions of SPEC-AM are enforced once for
    every event role by the event scope check, ahead of the permissions, while
    the administrator (the permanent Administrator role of a user outside any
    event) bypasses this check (SPEC-DR administrator-access).  */

import { and, count, eq, gt, sql } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import * as schema                 from "./app-db-ddl.js"
import type { User, Message, MessageType, Entity, Row, Draft } from "./app-db-types.js"

/*  the roles of the SPEC-UP User Personas a session acts in  */
export type Role = "attendee" | "moderator" | "presenter" | "manager" | "administrator"

/*  the session of a caller: the role it acts in and the user it acts as,
    where the user binds the session to one event (a SPEC-DM User exists per
    event only, except the administrator user, which exists outside any event
    and hence carries no event) and is null for an anonymous attendee  */
export type Session = {
    role: Role
    user: User | null
}

/*  the operations: the generic CRUD ones plus the SPEC-SM state transitions
    a role may trigger (a state change is granted by its transition only)  */
export type Operation = // FIXME
    "create" | "read" | "update" | "delete" |
    "publish" | "start" | "start-unpublished" | "finish" |              /*  Event  */
    "accept" | "reject" | "resubmit" | "forward" | "answer" | "suspend" | /*  Message  */
    "send" | "consume" | "consume-automatic"                             /*  AuthorizationToken  */

/*  the error raised when an operation is denied by the authorization model  */
export class AuthorizationError extends Error {
    constructor (
        public readonly session:   Session,
        public readonly operation: Operation,
        public readonly entity:    Entity,
        options?: ErrorOptions
    ) {
        super(`${operation} on ${entity} denied for role "${session.role}"`, options)
        this.name = "AuthorizationError"
    }
}

type DB = PostgresJsDatabase<typeof schema>

/*  the context a permission condition decides upon: the object (a row, or
    the insert data of a creation) and the attributes an update changes  */
type Context<E extends Entity> = {
    db:        DB
    session:   Session
    operation: Operation
    obj:       Row<E> | Draft<Row<E>>
    changes:   Partial<Row<E>>
}
type Condition<E extends Entity> = (ctx: Context<E>) => boolean | Promise<boolean>

/*  a single permission (SPEC-AM PERMISSION), identified by its SPEC-AM id  */
type Permission<E extends Entity> = {
    id:         string
    role:       Role
    entity:     E
    operations: Operation[]
    states?:    string[]
    condition?: Condition<E>
}
type AnyPermission = { [E in Entity]: Permission<E> }[Entity]

/*  ==== CONDITION HELPERS ================================================  */

/*  whether an update is confined to the given attributes  */
const confinedTo = (changes: object, ...attributes: string[]): boolean => {
    const keys = Object.keys(changes)
    return keys.length > 0 && keys.every((key) => attributes.includes(key))
}

/*  whether an email matches the access email pattern of an event  */
const matches = (pattern: string | undefined, email: string | undefined): boolean =>
    pattern !== undefined && pattern !== "" && email !== undefined && new RegExp(pattern).test(email)

/*  the event an object of an entity belongs to  */
const eventRow = (db: DB, eventId: string) =>
    db.query.events.findFirst({ where: eq(schema.events.eventId, eventId) })

/*  the number of messages of a type a user sent within the last minute  */
const recentMessages = async (db: DB, sender: string, type: MessageType): Promise<number> => {
    const [ row ] = await db
        .select({ n: count() })
        .from(schema.messages)
        .where(and(
            eq(schema.messages.senderId, sender),
            eq(schema.messages.type, type),
            gt(schema.messages.timestamp, sql`now() - interval '1 minute'`)))
    return row.n
}

/*  whether a message belongs to the conversation of a user, i.e. is sent by
    the user or replies to a message the user sent  */
const inConversationOf = async (db: DB, message: Partial<Message>, userId: string | undefined): Promise<boolean> => {
    if (message.senderId === userId)
        return true
    if (message.replyToId === null || message.replyToId === undefined)
        return false
    const parent = await db.query.messages.findFirst({
        where:   eq(schema.messages.messageId, message.replyToId),
        columns: { senderId: true }
    })
    return parent?.senderId === userId
}

/*  the event a channel belongs to  */
const eventOfChannel = async (db: DB, channelId: string | null | undefined): Promise<string | undefined> => {
    const channel = await db.query.channels.findFirst({
        where:   eq(schema.channels.channelId, channelId ?? ""),
        columns: { eventId: true }
    })
    return channel?.eventId
}

/*  the resolvers of the event an object of an entity belongs to (SPEC-DM:
    every entity hangs off an event), following the owning relations where
    the object carries no event id of its own  */
type Ref = Record<string, string | null | undefined>
const eventOf: Record<Entity, (db: DB, o: Ref) => string | undefined | Promise<string | undefined>> = {
    Event:                 (_, o) => o.eventId ?? undefined,
    AgendaPoint:           (_, o) => o.eventId ?? undefined,
    Channel:               (_, o) => o.eventId ?? undefined,
    User:                  (_, o) => o.eventId ?? undefined,
    Message:               (_, o) => o.eventId ?? undefined,
    QuestionTag:           (_, o) => o.eventId ?? undefined,
    EventStatistic:        (_, o) => o.eventId ?? undefined,
    UserStatistic:         (_, o) => o.eventId ?? undefined,
    AuthorizationToken:    (_, o) => o.eventId ?? undefined,
    SessionToken:          (_, o) => o.eventId ?? undefined,
    Resource:              (db, o) => eventOfChannel(db, o.channelId),
    ChannelStatistic:      (db, o) => eventOfChannel(db, o.channelId),
    ResourceProviderParam: async (db, o) => {
        const resource = await db.query.resources.findFirst({
            where:   eq(schema.resources.resourceId, o.resourceId ?? ""),
            columns: { resourceId: true },
            with:    { channel: { columns: { eventId: true } } }
        })
        return resource?.channel.eventId
    },
    MessageText: async (db, o) => {
        const message = await db.query.messages.findFirst({
            where:   eq(schema.messages.messageId, o.messageId ?? ""),
            columns: { eventId: true }
        })
        return message?.eventId
    },
    Role: async (db, o) => {
        const user = await db.query.users.findFirst({
            where:   eq(schema.users.userId, o.userId ?? ""),
            columns: { eventId: true }
        })
        return user?.eventId ?? undefined
    }
}

/*  ==== PERMISSIONS (SPEC-AM) ============================================  */

const permissions: AnyPermission[] = [
    /*  ROLE: Attendee  */
    {
        id:         "attendee-enter-event",
        role:       "attendee",
        entity:     "Event",
        operations: [ "read" ],
        states:     [ "published", "running" ],
        condition:  ({ session, obj }) =>
            session.user?.eventId === obj.eventId
            || matches(obj.accessEmailPattern, session.user?.email)
            || obj.allowAccessAnonymous === true
    },
    {
        id:         "attendee-prove-email",
        role:       "attendee",
        entity:     "AuthorizationToken",
        operations: [ "send", "consume", "consume-automatic" ],
        condition:  ({ session, obj }) => obj.userId === session.user?.userId
    },
    { id: "attendee-watch-channel", role: "attendee", entity: "Channel",     operations: [ "read" ] },
    { id: "attendee-play-resource", role: "attendee", entity: "Resource",    operations: [ "read" ] },
    { id: "attendee-follow-agenda", role: "attendee", entity: "AgendaPoint", operations: [ "read" ] },
    {
        id:         "attendee-send-message",
        role:       "attendee",
        entity:     "Message",
        operations: [ "create" ],
        condition:  async ({ db, session, obj }) => {
            const event = await eventRow(db, obj.eventId)
            if (session.user === null || event?.state !== "running")
                return false
            const type     = obj.type ?? "Chat"
            const enabled  = type === "Chat" ? event.chatEnabled :
                type === "Question" ? event.questionsEnabled : event.supportEnabled
            const throttle = type === "Chat" ? event.chatThrottling :
                type === "Question" ? event.questionsThrottling : null
            return enabled
                && (throttle === null || await recentMessages(db, session.user.userId, type) < throttle)
        }
    },
    {
        id:         "attendee-read-message",
        role:       "attendee",
        entity:     "Message",
        operations: [ "read" ],
        states:     [ "accepted", "forwarded", "answered", "suspended" ],
        condition:  async ({ db, session, obj }) => {
            if (obj.type === "Chat")
                return true
            if (obj.type === "Question") {
                const event = await eventRow(db, obj.eventId)
                return event?.questionsPrivate === false
            }
            return inConversationOf(db, obj, session.user?.userId)
        }
    },
    {
        id:         "attendee-track-own",
        role:       "attendee",
        entity:     "Message",
        operations: [ "read" ],
        states:     [ "pending" ],
        condition:  ({ session, obj }) => obj.senderId === session.user?.userId
    },
    {
        id:         "attendee-edit-own",
        role:       "attendee",
        entity:     "Message",
        operations: [ "update", "delete", "resubmit" ],
        states:     [ "pending", "accepted" ],
        condition:  ({ session, obj }) => obj.senderId === session.user?.userId
    },
    {
        id:         "attendee-like",
        role:       "attendee",
        entity:     "Message",
        operations: [ "update" ],
        states:     [ "accepted", "forwarded", "answered", "suspended" ],
        condition:  ({ session, obj, changes }) =>
            confinedTo(changes, "likes") && obj.type !== "Support" && obj.senderId !== session.user?.userId
    },
    {
        id:         "attendee-use-tags",
        role:       "attendee",
        entity:     "QuestionTag",
        operations: [ "read" ],
        condition:  ({ obj }) => obj.moderatorOnly !== true
    },

    /*  ROLE: Moderator  */
    {
        id:         "moderator-enter-event",
        role:       "moderator",
        entity:     "Event",
        operations: [ "read" ],
        states:     [ "planning", "published", "running" ]
    },
    {
        id:         "moderator-steer-presenter",
        role:       "moderator",
        entity:     "Event",
        operations: [ "update" ],
        states:     [ "running" ],
        condition:  ({ changes }) =>
            confinedTo(changes, "presenterAlert", "presenterAlertState", "activeAgendaPointId")
    },
    { id: "moderator-read-messages", role: "moderator", entity: "Message", operations: [ "read" ] },
    { id: "moderator-decide",        role: "moderator", entity: "Message", operations: [ "accept", "reject" ] },
    {
        id:         "moderator-forward",
        role:       "moderator",
        entity:     "Message",
        operations: [ "forward", "update" ],
        states:     [ "accepted", "forwarded" ],
        condition:  ({ operation, obj, changes }) =>
            obj.type === "Question"
            && (operation !== "update" || confinedTo(changes, "presenterAnnotation", "predecessorId", "questionTags"))
    },
    { id: "moderator-process", role: "moderator", entity: "Message", operations: [ "answer", "suspend" ] },
    {
        id:         "moderator-author",
        role:       "moderator",
        entity:     "Message",
        operations: [ "create" ],
        condition:  async ({ db, obj }) => {
            const event = await eventRow(db, obj.eventId)
            return event?.state === "running"
        }
    },
    { id: "moderator-use-tags", role: "moderator", entity: "QuestionTag", operations: [ "read" ] },

    /*  ROLE: Presenter  */
    {
        id:         "presenter-enter-event",
        role:       "presenter",
        entity:     "Event",
        operations: [ "read" ],
        states:     [ "planning", "published", "running" ]
    },
    {
        id:         "presenter-confirm-alert",
        role:       "presenter",
        entity:     "Event",
        operations: [ "update" ],
        states:     [ "running" ],
        condition:  ({ changes }) =>
            confinedTo(changes, "presenterAlertState") && changes.presenterAlertState === "unraised"
    },
    {
        id:         "presenter-read-forwarded",
        role:       "presenter",
        entity:     "Message",
        operations: [ "read" ],
        states:     [ "forwarded", "answered", "suspended" ]
    },
    { id: "presenter-process", role: "presenter", entity: "Message", operations: [ "answer", "suspend" ] },

    /*  ROLE: Manager  */
    { id: "manager-configure-event", role: "manager", entity: "Event", operations: [ "read", "update" ] },
    { id: "manager-run-event",       role: "manager", entity: "Event", operations: [ "publish", "start", "start-unpublished", "finish" ] },
    { id: "manager-delete-event",    role: "manager", entity: "Event", operations: [ "delete" ] },
    { id: "manager-channels",        role: "manager", entity: "Channel", operations: [ "create", "read", "update", "delete" ] },
    {
        id:         "manager-resources",
        role:       "manager",
        entity:     "Resource",
        operations: [ "read", "update" ],
        condition:  ({ operation, changes }) => operation !== "update" || confinedTo(changes, "active")
    },
    {
        id:         "manager-roles",
        role:       "manager",
        entity:     "Role",
        operations: [ "create", "read", "delete" ],
        condition:  ({ obj }) => obj.type !== "Administrator"
    },
    { id: "manager-access-list",        role: "manager", entity: "User",             operations: [ "create", "read", "update", "delete" ] },
    { id: "manager-tokens",             role: "manager", entity: "AuthorizationToken", operations: [ "create", "read" ], states: [ "issued" ] },
    { id: "manager-tags",               role: "manager", entity: "QuestionTag",      operations: [ "create", "read", "update", "delete" ] },
    { id: "manager-agenda",             role: "manager", entity: "AgendaPoint",      operations: [ "create", "read", "update", "delete" ] },
    { id: "manager-export-messages",    role: "manager", entity: "Message",          operations: [ "read" ] },
    { id: "manager-statistics-event",   role: "manager", entity: "EventStatistic",   operations: [ "read" ] },
    { id: "manager-statistics-channel", role: "manager", entity: "ChannelStatistic", operations: [ "read" ] },
    { id: "manager-statistics-user",    role: "manager", entity: "UserStatistic",    operations: [ "read" ] },

    /*  ROLE: Administrator (the permanent role of a user outside any event,
        holding every operation on every entity of every event, except the
        granting of the Administrator role itself, which the configuration
        alone grants and revokes)  */
    { id: "administrator-events",             role: "administrator", entity: "Event",                 operations: [ "create", "read", "update", "delete", "publish", "start", "start-unpublished", "finish" ] },
    { id: "administrator-agenda",             role: "administrator", entity: "AgendaPoint",           operations: [ "create", "read", "update", "delete" ] },
    { id: "administrator-channels",           role: "administrator", entity: "Channel",               operations: [ "create", "read", "update", "delete" ] },
    { id: "administrator-resources",          role: "administrator", entity: "Resource",              operations: [ "create", "read", "update", "delete" ] },
    { id: "administrator-params",             role: "administrator", entity: "ResourceProviderParam", operations: [ "create", "read", "update", "delete" ] },
    {
        id:         "administrator-roles",
        role:       "administrator",
        entity:     "Role",
        operations: [ "create", "read", "delete" ],
        condition:  ({ obj }) => obj.type !== "Administrator"
    },
    { id: "administrator-users",              role: "administrator", entity: "User",                  operations: [ "create", "read", "update", "delete" ] },
    { id: "administrator-messages",           role: "administrator", entity: "Message",               operations: [ "create", "read", "update", "delete", "accept", "reject", "forward", "answer", "suspend", "resubmit" ] },
    { id: "administrator-message-texts",      role: "administrator", entity: "MessageText",           operations: [ "create", "read", "update", "delete" ] },
    { id: "administrator-tags",               role: "administrator", entity: "QuestionTag",           operations: [ "create", "read", "update", "delete" ] },
    { id: "administrator-auth-tokens",        role: "administrator", entity: "AuthorizationToken",    operations: [ "create", "read", "update", "delete", "send", "consume", "consume-automatic" ] },
    { id: "administrator-sessions",           role: "administrator", entity: "SessionToken",          operations: [ "create", "read", "update", "delete" ] },
    { id: "administrator-statistics-event",   role: "administrator", entity: "EventStatistic",        operations: [ "create", "read", "update", "delete" ] },
    { id: "administrator-statistics-channel", role: "administrator", entity: "ChannelStatistic",      operations: [ "create", "read", "update", "delete" ] },
    { id: "administrator-statistics-user",    role: "administrator", entity: "UserStatistic",         operations: [ "create", "read", "update", "delete" ] }
]

/*  ==== AUTHORIZATION ====================================================  */

/*  decide whether a session may perform an operation on an object of an
    entity, throwing an AuthorizationError otherwise: the object has to lie
    within the event of an event role (the administrator needs no access
    list entry and reaches every event, SPEC-DR administrator-access), and
    the first permission of the role on the entity which grants the operation
    in the lifecycle state of the object and satisfies its condition wins,
    else the closed model denies  */
export const authorize = async (
    db:        DB,
    session:   Session,
    operation: Operation,
    entity:    Entity,
    obj:       unknown,
    changes:   object = {}
): Promise<void> => {
    if (session.role !== "administrator"
        && (session.user === null || await eventOf[entity](db, obj as Ref) !== session.user.eventId))
        throw new AuthorizationError(session, operation, entity)
    const state = (obj as { state?: string }).state ?? "" // FIXME
    const ctx   = { db, session, operation, obj, changes } as Context<Entity>
    for (const p of permissions) {
        if (p.role !== session.role || p.entity !== entity || !p.operations.includes(operation))
            continue
        if (p.states !== undefined && operation !== "create" && !p.states.includes(state))
            continue
        if (p.condition !== undefined && !(await (p.condition as Condition<Entity>)(ctx)))
            continue
        return
    }
    throw new AuthorizationError(session, operation, entity)
}

