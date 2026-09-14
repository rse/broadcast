/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/*  TypeScript types of the SPEC data model (SPEC-DM), inferred from the Drizzle
    schema definition (DDL) in "app-db-ddl.ts": the value unions of the
    "enum(...)" attributes, the row types of the entities and of the tables
    realizing their n:m relations (each under the SPEC-DM entity name), the
    "Draft<Foo>" insert type of a row (attributes with a database default
    optional), and the "Graph<Foo>" type of a row with its optionally loaded
    relations. They are independent of the simplified "broadcast-common"
    Hello-World types.  */

import type * as schema from "./app-db-ddl.js"

/*  ==== ENUMERATIONS (SPEC-DM "enum(...)" attributes) ====================  */

export type EventState    = (typeof schema.eventStateEnum.enumValues)[number]
export type NameDisplay   = (typeof schema.nameDisplayEnum.enumValues)[number]
export type AlertState    = (typeof schema.alertStateEnum.enumValues)[number]
export type RoleType      = (typeof schema.roleTypeEnum.enumValues)[number]
export type MessageType   = (typeof schema.messageTypeEnum.enumValues)[number]
export type MessageState  = (typeof schema.messageStateEnum.enumValues)[number]
export type MessageEdited = (typeof schema.messageEditedEnum.enumValues)[number]
export type TokenState    = (typeof schema.tokenStateEnum.enumValues)[number]

/*  ==== TABLES ===========================================================  */

/*  the tables by their SPEC-DM entity name: the 15 entities plus the three
    tables realizing the n:m relations  */
type Tables = {
    Event:                       typeof schema.events
    AgendaPoint:                 typeof schema.agendaPoints
    Channel:                     typeof schema.channels
    Resource:                    typeof schema.resources
    ResourceProviderParam:       typeof schema.resourceProviderParams
    Role:                        typeof schema.roles
    User:                        typeof schema.users
    Message:                     typeof schema.messages
    MessageText:                 typeof schema.messageTexts
    QuestionTag:                 typeof schema.questionTags
    AuthorizationToken:          typeof schema.authorizationTokens
    SessionToken:                typeof schema.sessionTokens
    EventStatistic:              typeof schema.eventStatistics
    ChannelStatistic:            typeof schema.channelStatistics
    UserStatistic:               typeof schema.userStatistics
    AgendaPointCorrespondingTag: typeof schema.agendaPointCorrespondingTags
    MessageQuestionTag:          typeof schema.messageQuestionTags
    MessageLiker:                typeof schema.messageLiker
}
export type Table  = keyof Tables
export type Entity = Exclude<Table, "AgendaPointCorrespondingTag" | "MessageQuestionTag" | "MessageLiker">

/*  the row type of a table by its name  */
export type Row<T extends Table> = Tables[T]["$inferSelect"]

/*  the table whose row type is exactly R (the mutual assignability rules
    out a wider or narrower type, which resolves to never)  */
type TableOf<R> = { [T in Table]: R extends Row<T> ? Row<T> extends R ? T : never : never }[Table]

/*  the insert type of a row: the attributes with a database default are optional  */
export type Draft<R> = Tables[TableOf<R>]["$inferInsert"]

/*  ==== ENTITIES (row types) =============================================  */

export type Event                       = Row<"Event">
export type AgendaPoint                 = Row<"AgendaPoint">
export type Channel                     = Row<"Channel">
export type Resource                    = Row<"Resource">
export type ResourceProviderParam       = Row<"ResourceProviderParam">
export type Role                        = Row<"Role">
export type User                        = Row<"User">
export type Message                     = Row<"Message">
export type MessageText                 = Row<"MessageText">
export type QuestionTag                 = Row<"QuestionTag">
export type AuthorizationToken          = Row<"AuthorizationToken">
export type SessionToken                = Row<"SessionToken">
export type EventStatistic              = Row<"EventStatistic">
export type ChannelStatistic            = Row<"ChannelStatistic">
export type UserStatistic               = Row<"UserStatistic">
export type AgendaPointCorrespondingTag = Row<"AgendaPointCorrespondingTag">
export type MessageQuestionTag          = Row<"MessageQuestionTag">
export type MessageLiker                = Row<"MessageLiker">

/*  ==== RELATIONS ========================================================  */

/*  the relations of every table, named exactly like the "relations()"
    declarations of "app-db-ddl.ts" (a mismatch surfaces as an undefined
    property only): a 0..1 relation is null when empty, a 0..n one an array  */
type Relations = {
    Event: {
        channels:              Graph<Channel>[]
        accessList:            Graph<User>[]
        messages:              Graph<Message>[]
        statistics:            Graph<EventStatistic>[]
        userStatistics:        Graph<UserStatistic>[]
        availableQuestionTags: Graph<QuestionTag>[]
        agendaPoints:          Graph<AgendaPoint>[]
        authorizationTokens:   Graph<AuthorizationToken>[]
        sessionTokens:         Graph<SessionToken>[]
        activeAgendaPoint:     Graph<AgendaPoint> | null
    }
    AgendaPoint: {
        event:                 Graph<Event>
        activeForEvent:        Graph<Event>[]
        correspondingTags:     Graph<AgendaPointCorrespondingTag>[]
    }
    Channel: {
        event:                 Graph<Event>
        resources:             Graph<Resource>[]
        statistics:            Graph<ChannelStatistic>[]
    }
    Resource: {
        channel:               Graph<Channel>
        params:                Graph<ResourceProviderParam>[]
    }
    ResourceProviderParam: {
        resource:              Graph<Resource>
    }
    Role: {
        user:                  Graph<User>
    }
    User: {
        event:                 Graph<Event> | null
        roles:                 Graph<Role>[]
        sentMessages:          Graph<Message>[]
        likes:                 Graph<MessageLiker>[]
        statistics:            Graph<UserStatistic>[]
        authorizationTokens:   Graph<AuthorizationToken>[]
        sessionTokens:         Graph<SessionToken>[]
    }
    Message: {
        event:                 Graph<Event>
        sender:                Graph<User> | null
        replyTo:               Graph<Message> | null
        replies:               Graph<Message>[]
        predecessor:           Graph<Message> | null
        successors:            Graph<Message>[]
        texts:                 Graph<MessageText>[]
        questionTags:          Graph<MessageQuestionTag>[]
        liker:                 Graph<MessageLiker>[]
    }
    MessageText: {
        message:               Graph<Message>
    }
    QuestionTag: {
        event:                 Graph<Event>
        messages:              Graph<MessageQuestionTag>[]
        agendaPoints:          Graph<AgendaPointCorrespondingTag>[]
    }
    AuthorizationToken: {
        user:                  Graph<User>
        event:                 Graph<Event>
    }
    SessionToken: {
        user:                  Graph<User>
        event:                 Graph<Event>
    }
    EventStatistic: {
        event:                 Graph<Event>
    }
    ChannelStatistic: {
        channel:               Graph<Channel>
    }
    UserStatistic: {
        event:                 Graph<Event>
        user:                  Graph<User> | null
    }
    AgendaPointCorrespondingTag: {
        agendaPoint:           Graph<AgendaPoint>
        questionTag:           Graph<QuestionTag>
    }
    MessageQuestionTag: {
        message:               Graph<Message>
        questionTag:           Graph<QuestionTag>
    }
    MessageLiker: {
        message:               Graph<Message>
        user:                  Graph<User>
    }
}

/*  the graph type of a row: the row with its relations, each present only
    when loaded (via the "with" clause of a relational query)  */
export type Graph<R> = R & Partial<Relations[TableOf<R>]>

