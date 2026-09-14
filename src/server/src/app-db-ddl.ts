/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/*  Drizzle schema definition (DDL) derived faithfully from the SPEC data model
    (SPEC-DM). Table names match the SPEC entity names verbatim (singular,
    PascalCase) and column names match the SPEC attribute names verbatim
    (camelCase); both are emitted as quoted SQL identifiers. Every entity becomes
    a "pgTable", every "enum(...)" attribute becomes a "pgEnum", and every relation
    is declared in both directions via "relations()" so the data can be navigated
    either way through the Drizzle query API. A relation with arity 1 or 0..1 on
    one side is realized by a foreign-key column "<relation>Id" on that side (a
    column named like the relation itself would collide with it in the query
    API), a relation with arity 0..n on both sides by a relation table. Every
    entity additionally carries the technical attribute "version", the counter
    of its updates, which the persistence layer checks and increments on every
    update for optimistic locking. The TypeScript types inferred from this
    schema are exported by "app-db-types.ts".  */

import {
    pgTable, pgEnum, uuid, text, boolean, integer, doublePrecision,
    timestamp, primaryKey, index, uniqueIndex
} from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"

/*  ==== ENUMERATIONS (SPEC-DM "enum(...)" attributes) ====================  */

export const eventStateEnum = pgEnum("EventState", [
    "planning",
    "published",
    "running",
    "finished"
])

export const nameDisplayEnum = pgEnum("NameDisplay", [
    "full",
    "firstname",
    "anonymous"
])

export const alertStateEnum = pgEnum("AlertState", [
    "raised",
    "unraised"
])

export const roleTypeEnum = pgEnum("RoleType", [
    "Manager",
    "Moderator",
    "Presenter",
    "Attendee",
    "Administrator"
])

export const messageTypeEnum = pgEnum("MessageType", [
    "Chat",
    "Support",
    "Question"
])

export const messageStateEnum = pgEnum("MessageState", [
    "pending",
    "accepted",
    "rejected",
    "forwarded",
    "answered",
    "suspended"
])

export const messageEditedEnum = pgEnum("MessageEdited", [
    "none",
    "insignificant",
    "significant",
    "deleted"
])

export const tokenStateEnum = pgEnum("TokenState", [
    "issued",
    "sent",
    "used"
])

/*  ==== ENTITY: Event (SPEC-DM-event) ====================================  */
/*  the master aggregate root: every other entity hangs off an event.  */

export const events = pgTable("Event", {
    eventId:                     uuid("eventId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    title:                       text("title").notNull(),
    description:                 text("description").notNull().default(""),
    language:                    text("language").notNull().default("en"),
    begin:                       timestamp("begin", { withTimezone: true }).notNull(),
    end:                         timestamp("end",   { withTimezone: true }).notNull(),
    state:                       eventStateEnum("state").notNull().default("planning"),

    /*  login/interaction information  */
    loginInfo:                   text("loginInfo").notNull().default(""),
    loginInfoToBeAccepted:       boolean("loginInfoToBeAccepted").notNull().default(false),
    interactionInfo:             text("interactionInfo").notNull().default(""),
    interactionInfoToBeAccepted: boolean("interactionInfoToBeAccepted").notNull().default(false),

    /*  access control  */
    allowAccessAnonymous:        boolean("allowAccessAnonymous").notNull().default(false),
    accessEmailPattern:          text("accessEmailPattern").notNull().default(""),

    /*  chat configuration  */
    chatEnabled:                 boolean("chatEnabled").notNull().default(false),
    chatAllowAnonymous:          boolean("chatAllowAnonymous").notNull().default(false),
    chatName:                    nameDisplayEnum("chatName").notNull().default("full"),
    chatReply:                   boolean("chatReply").notNull().default(false),
    chatThrottling:              integer("chatThrottling").notNull().default(1),
    chatModerator:               boolean("chatModerator").notNull().default(false),

    /*  support configuration  */
    supportEnabled:              boolean("supportEnabled").notNull().default(false),

    /*  embedded third-party application  */
    appEnabled:                  boolean("appEnabled").notNull().default(false),
    appTitle:                    text("appTitle").notNull().default(""),
    appURL:                      text("appURL").notNull().default(""),
    appAdminURL:                 text("appAdminURL").notNull().default(""),

    /*  presenter alert  */
    presenterAlert:              text("presenterAlert").notNull().default(""),
    presenterAlertState:         alertStateEnum("presenterAlertState").notNull().default("unraised"),

    /*  questions configuration  */
    questionsEnabled:            boolean("questionsEnabled").notNull().default(false),
    questionsAllowAnonymous:     boolean("questionsAllowAnonymous").notNull().default(false),
    questionsName:               nameDisplayEnum("questionsName").notNull().default("full"),
    questionsThrottling:         integer("questionsThrottling").notNull().default(1),
    questionsPrivate:            boolean("questionsPrivate").notNull().default(false),
    questionsModerator:          boolean("questionsModerator").notNull().default(false),

    /*  authorization tokens  */
    expireAuthTokenOnFirstUse:   boolean("expireAuthTokenOnFirstUse").notNull().default(true),

    /*  sentiment analysis  */
    sentimentSenderAnalysis:     boolean("sentimentSenderAnalysis").notNull().default(false),
    sentimentSenderAutoPrevent:  boolean("sentimentSenderAutoPrevent").notNull().default(false),
    sentimentModeratorAnalysis:  boolean("sentimentModeratorAnalysis").notNull().default(false),
    sentimentModeratorAutoAccept: boolean("sentimentModeratorAutoAccept").notNull().default(false),
    sentimentModeratorAutoReject: boolean("sentimentModeratorAutoReject").notNull().default(false),

    /*  the currently active agenda point (0..1); the FK constraint itself is
        declared on "AgendaPoint" to avoid a circular table dependency  */
    activeAgendaPointId:         uuid("activeAgendaPointId")
})

/*  ==== ENTITY: AgendaPoint (SPEC-DM-agendapoint) ========================  */

export const agendaPoints = pgTable("AgendaPoint", {
    agendaPointId:               uuid("agendaPointId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" }),
    text:                        text("text").notNull(),
    orderPosition:               integer("orderPosition").notNull()
}, (t) => [
    index("AgendaPoint_eventId_idx").on(t.eventId)
])

/*  ==== ENTITY: Channel (SPEC-DM-channel) ================================  */

export const channels = pgTable("Channel", {
    channelId:                   uuid("channelId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" }),
    name:                        text("name").notNull(),
    active:                      boolean("active").notNull().default(false),
    default:                     boolean("default").notNull().default(false)
}, (t) => [
    index("Channel_eventId_idx").on(t.eventId)
])

/*  ==== ENTITY: Resource (SPEC-DM-resource) ==============================  */

export const resources = pgTable("Resource", {
    resourceId:                  uuid("resourceId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    channelId:                   uuid("channelId").notNull()
        .references(() => channels.channelId, { onDelete: "cascade" }),
    providerId:                  text("providerId").notNull(),
    active:                      boolean("active").notNull().default(false)
}, (t) => [
    index("Resource_channelId_idx").on(t.channelId)
])

/*  ==== ENTITY: ResourceProviderParam (SPEC-DM-resourceparam) ============  */
/*  a key-value parameter belonging to exactly one resource and provider.  */

export const resourceProviderParams = pgTable("ResourceProviderParam", {
    resourceId:                  uuid("resourceId").notNull()
        .references(() => resources.resourceId, { onDelete: "cascade" }),
    providerId:                  text("providerId").notNull(),
    key:                         text("key").notNull(),
    version:                     integer("version").notNull().default(0),
    value:                       text("value").notNull().default("")
}, (t) => [
    primaryKey({ columns: [ t.resourceId, t.providerId, t.key ] })
])

/*  ==== ENTITY: User (SPEC-DM-user) ======================================  */
/*  a helper entity identifying a person within an event for event-based
    logins and roles; no permanent accounts, except the administrator user,
    which holds the Administrator role and exists outside any event.  */

export const users = pgTable("User", {
    userId:                      uuid("userId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    eventId:                     uuid("eventId")
        .references(() => events.eventId, { onDelete: "cascade" }),
    email:                       text("email").notNull(),
    firstname:                   text("firstname").notNull().default(""),
    lastname:                    text("lastname").notNull().default("")
}, (t) => [
    index("User_eventId_idx").on(t.eventId)
])

/*  ==== ENTITY: Role (SPEC-DM-role) ======================================  */
/*  a grant of rights held by a user (the SPEC-DM User "roles" relation),
    scoped to the event of the user, or global for the administrator user.  */

export const roles = pgTable("Role", {
    roleId:                      uuid("roleId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    userId:                      uuid("userId").notNull()
        .references(() => users.userId, { onDelete: "cascade" }),
    type:                        roleTypeEnum("type").notNull().default("Attendee")
}, (t) => [
    index("Role_userId_idx").on(t.userId)
])

/*  ==== ENTITY: Message (SPEC-DM-message) ================================  */
/*  the central interaction entity (chat, support, question).  */

export const messages = pgTable("Message", {
    messageId:                   uuid("messageId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" }),
    type:                        messageTypeEnum("type").notNull().default("Chat"),
    timestamp:                   timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    timestampAnswered:           timestamp("timestampAnswered", { withTimezone: true }),
    state:                       messageStateEnum("state").notNull().default("pending"),
    originalLanguage:            text("originalLanguage").notNull(),
    senderName:                  text("senderName").notNull(),
    presenterAnnotation:         text("presenterAnnotation").notNull().default(""),
    likes:                       integer("likes").notNull().default(0),
    sentimentScore:              doublePrecision("sentimentScore"),
    edited:                      messageEditedEnum("edited").notNull().default("none"),

    /*  the authoring attendee (0..1): SET NULL on the GDPR anonymization that
        deletes the sender while the message itself survives.  */
    senderId:                    uuid("senderId")
        .references(() => users.userId, { onDelete: "set null" }),

    /*  self-references (0..1 each): a message can reply to / follow another
        message; the FK constraints are declared in the relations below.  */
    replyToId:                   uuid("replyToId"),
    predecessorId:               uuid("predecessorId")
}, (t) => [
    index("Message_eventId_idx").on(t.eventId),
    index("Message_eventId_state_idx").on(t.eventId, t.state),
    index("Message_senderId_idx").on(t.senderId),
    index("Message_replyToId_idx").on(t.replyToId),
    index("Message_predecessorId_idx").on(t.predecessorId)
])

/*  ==== ENTITY: MessageText (SPEC-DM-messagetext) ========================  */
/*  a language-specific text variant of a message.  */

export const messageTexts = pgTable("MessageText", {
    messageTextId:               uuid("messageTextId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    messageId:                   uuid("messageId").notNull()
        .references(() => messages.messageId, { onDelete: "cascade" }),
    language:                    text("language").notNull(),
    text:                        text("text").notNull()
}, (t) => [
    uniqueIndex("MessageText_messageId_language_idx").on(t.messageId, t.language)
])

/*  ==== ENTITY: QuestionTag (SPEC-DM-questiontag) ========================  */

export const questionTags = pgTable("QuestionTag", {
    questionTagId:               uuid("questionTagId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" }),
    text:                        text("text").notNull(),
    moderatorOnly:               boolean("moderatorOnly").notNull().default(false),
    group:                       text("group").notNull().default("")
}, (t) => [
    uniqueIndex("QuestionTag_eventId_text_idx").on(t.eventId, t.text)
])

/*  the AgendaPoint(0..n) <-> QuestionTag(0..n) "correspondingTags" relation  */
export const agendaPointCorrespondingTags = pgTable("AgendaPoint_correspondingTags", {
    agendaPointId:               uuid("agendaPointId").notNull()
        .references(() => agendaPoints.agendaPointId, { onDelete: "cascade" }),
    questionTagId:               uuid("questionTagId").notNull()
        .references(() => questionTags.questionTagId, { onDelete: "cascade" })
}, (t) => [
    primaryKey({ columns: [ t.agendaPointId, t.questionTagId ] })
])

/*  the Message(0..n) <-> QuestionTag(0..n) "questionTags" relation  */
export const messageQuestionTags = pgTable("Message_questionTags", {
    messageId:                   uuid("messageId").notNull()
        .references(() => messages.messageId, { onDelete: "cascade" }),
    questionTagId:               uuid("questionTagId").notNull()
        .references(() => questionTags.questionTagId, { onDelete: "cascade" })
}, (t) => [
    primaryKey({ columns: [ t.messageId, t.questionTagId ] })
])

/*  the Message(0..n) "liker" <-> User(0..n) "likes" relation  */
export const messageLiker = pgTable("Message_liker", {
    messageId:                   uuid("messageId").notNull()
        .references(() => messages.messageId, { onDelete: "cascade" }),
    userId:                      uuid("userId").notNull()
        .references(() => users.userId, { onDelete: "cascade" })
}, (t) => [
    primaryKey({ columns: [ t.messageId, t.userId ] })
])

/*  ==== ENTITY: AuthorizationToken (SPEC-DM-authtoken) ===================  */

export const authorizationTokens = pgTable("AuthorizationToken", {
    token:                       text("token").primaryKey(),
    version:                     integer("version").notNull().default(0),
    validUntil:                  timestamp("validUntil", { withTimezone: true }).default(sql`now() + interval '1 day'`),
    state:                       tokenStateEnum("state").notNull().default("issued"),
    userId:                      uuid("userId").notNull()
        .references(() => users.userId, { onDelete: "cascade" }),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" })
}, (t) => [
    index("AuthorizationToken_userId_idx").on(t.userId),
    index("AuthorizationToken_eventId_idx").on(t.eventId)
])

/*  ==== ENTITY: SessionToken (SPEC-DM-sessiontoken) ======================  */

export const sessionTokens = pgTable("SessionToken", {
    sessionId:                   uuid("sessionId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    issuedAt:                    timestamp("issuedAt", { withTimezone: true }).notNull().defaultNow(),
    userId:                      uuid("userId").notNull()
        .references(() => users.userId, { onDelete: "cascade" }),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" })
}, (t) => [
    index("SessionToken_userId_idx").on(t.userId),
    index("SessionToken_eventId_idx").on(t.eventId)
])

/*  ==== ENTITY: EventStatistic (SPEC-DM-eventstatistic) ==================  */

export const eventStatistics = pgTable("EventStatistic", {
    eventStatisticId:            uuid("eventStatisticId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" }),
    timestamp:                   timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    numberOfIssuedAuthTokens:    integer("numberOfIssuedAuthTokens").notNull().default(0),
    numberOfSentAuthTokens:      integer("numberOfSentAuthTokens").notNull().default(0),
    numberOfUsedAuthTokens:      integer("numberOfUsedAuthTokens").notNull().default(0),
    numberOfSessionTokens:       integer("numberOfSessionTokens").notNull().default(0),
    numberOfConnections:         integer("numberOfConnections").notNull().default(0)
}, (t) => [
    index("EventStatistic_eventId_idx").on(t.eventId)
])

/*  ==== ENTITY: ChannelStatistic (SPEC-DM-channelstatistic) ==============  */

export const channelStatistics = pgTable("ChannelStatistic", {
    channelStatisticId:          uuid("channelStatisticId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    channelId:                   uuid("channelId").notNull()
        .references(() => channels.channelId, { onDelete: "cascade" }),
    timestamp:                   timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    numberOfViewers:             integer("numberOfViewers").notNull().default(0)
}, (t) => [
    index("ChannelStatistic_channelId_idx").on(t.channelId)
])

/*  ==== ENTITY: UserStatistic (SPEC-DM-userstatistic) ====================  */
/*  owned by its event and linked to its user until the event finishes, where
    the anonymization unlinks it (SPEC-SM userstatistic) and it is retained
    unlinked (SPEC-DM retention of the personal attributes).  */

export const userStatistics = pgTable("UserStatistic", {
    userStatisticId:             uuid("userStatisticId").primaryKey().defaultRandom(),
    version:                     integer("version").notNull().default(0),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" }),
    userId:                      uuid("userId")
        .references(() => users.userId, { onDelete: "set null" }),
    timestamp:                   timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    country:                     text("country"),
    browserType:                 text("browserType"),
    deviceType:                  text("deviceType"),
    viewportWidth:               integer("viewportWidth"),
    viewportHeight:              integer("viewportHeight")
}, (t) => [
    index("UserStatistic_eventId_idx").on(t.eventId),
    index("UserStatistic_userId_idx").on(t.userId)
])

/*  ==== RELATIONS (declared in both directions for navigability) =========  */

export const eventsRelations = relations(events, ({ one, many }) => ({
    channels:                    many(channels),
    accessList:                  many(users),
    messages:                    many(messages),
    statistics:                  many(eventStatistics),
    userStatistics:              many(userStatistics),
    availableQuestionTags:       many(questionTags),
    agendaPoints:                many(agendaPoints, { relationName: "eventAgendaPoints" }),
    authorizationTokens:         many(authorizationTokens),
    sessionTokens:               many(sessionTokens),
    activeAgendaPoint:           one(agendaPoints, {
        relationName:            "activeAgendaPoint",
        fields:                  [ events.activeAgendaPointId ],
        references:              [ agendaPoints.agendaPointId ]
    })
}))

export const agendaPointsRelations = relations(agendaPoints, ({ one, many }) => ({
    event:                       one(events, {
        relationName:            "eventAgendaPoints",
        fields:                  [ agendaPoints.eventId ],
        references:              [ events.eventId ]
    }),
    activeForEvent:              many(events, { relationName: "activeAgendaPoint" }),
    correspondingTags:           many(agendaPointCorrespondingTags)
}))

export const channelsRelations = relations(channels, ({ one, many }) => ({
    event:                       one(events, {
        fields:                  [ channels.eventId ],
        references:              [ events.eventId ]
    }),
    resources:                   many(resources),
    statistics:                  many(channelStatistics)
}))

export const resourcesRelations = relations(resources, ({ one, many }) => ({
    channel:                     one(channels, {
        fields:                  [ resources.channelId ],
        references:              [ channels.channelId ]
    }),
    params:                      many(resourceProviderParams)
}))

export const resourceProviderParamsRelations = relations(resourceProviderParams, ({ one }) => ({
    resource:                    one(resources, {
        fields:                  [ resourceProviderParams.resourceId ],
        references:              [ resources.resourceId ]
    })
}))

export const rolesRelations = relations(roles, ({ one }) => ({
    user:                        one(users, {
        fields:                  [ roles.userId ],
        references:              [ users.userId ]
    })
}))

export const usersRelations = relations(users, ({ one, many }) => ({
    event:                       one(events, {
        fields:                  [ users.eventId ],
        references:              [ events.eventId ]
    }),
    roles:                       many(roles),
    sentMessages:                many(messages),
    likes:                       many(messageLiker),
    statistics:                  many(userStatistics),
    authorizationTokens:         many(authorizationTokens),
    sessionTokens:               many(sessionTokens)
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
    event:                       one(events, {
        fields:                  [ messages.eventId ],
        references:              [ events.eventId ]
    }),
    sender:                      one(users, {
        fields:                  [ messages.senderId ],
        references:              [ users.userId ]
    }),
    replyTo:                     one(messages, {
        relationName:            "messageReply",
        fields:                  [ messages.replyToId ],
        references:              [ messages.messageId ]
    }),
    replies:                     many(messages, { relationName: "messageReply" }),
    predecessor:                 one(messages, {
        relationName:            "messagePredecessor",
        fields:                  [ messages.predecessorId ],
        references:              [ messages.messageId ]
    }),
    successors:                  many(messages, { relationName: "messagePredecessor" }),
    texts:                       many(messageTexts),
    questionTags:                many(messageQuestionTags),
    liker:                       many(messageLiker)
}))

export const messageTextsRelations = relations(messageTexts, ({ one }) => ({
    message:                     one(messages, {
        fields:                  [ messageTexts.messageId ],
        references:              [ messages.messageId ]
    })
}))

export const questionTagsRelations = relations(questionTags, ({ one, many }) => ({
    event:                       one(events, {
        fields:                  [ questionTags.eventId ],
        references:              [ events.eventId ]
    }),
    messages:                    many(messageQuestionTags),
    agendaPoints:                many(agendaPointCorrespondingTags)
}))

export const agendaPointCorrespondingTagsRelations = relations(agendaPointCorrespondingTags, ({ one }) => ({
    agendaPoint:                 one(agendaPoints, {
        fields:                  [ agendaPointCorrespondingTags.agendaPointId ],
        references:              [ agendaPoints.agendaPointId ]
    }),
    questionTag:                 one(questionTags, {
        fields:                  [ agendaPointCorrespondingTags.questionTagId ],
        references:              [ questionTags.questionTagId ]
    })
}))

export const messageQuestionTagsRelations = relations(messageQuestionTags, ({ one }) => ({
    message:                     one(messages, {
        fields:                  [ messageQuestionTags.messageId ],
        references:              [ messages.messageId ]
    }),
    questionTag:                 one(questionTags, {
        fields:                  [ messageQuestionTags.questionTagId ],
        references:              [ questionTags.questionTagId ]
    })
}))

export const messageLikerRelations = relations(messageLiker, ({ one }) => ({
    message:                     one(messages, {
        fields:                  [ messageLiker.messageId ],
        references:              [ messages.messageId ]
    }),
    user:                        one(users, {
        fields:                  [ messageLiker.userId ],
        references:              [ users.userId ]
    })
}))

export const authorizationTokensRelations = relations(authorizationTokens, ({ one }) => ({
    user:                        one(users, {
        fields:                  [ authorizationTokens.userId ],
        references:              [ users.userId ]
    }),
    event:                       one(events, {
        fields:                  [ authorizationTokens.eventId ],
        references:              [ events.eventId ]
    })
}))

export const sessionTokensRelations = relations(sessionTokens, ({ one }) => ({
    user:                        one(users, {
        fields:                  [ sessionTokens.userId ],
        references:              [ users.userId ]
    }),
    event:                       one(events, {
        fields:                  [ sessionTokens.eventId ],
        references:              [ events.eventId ]
    })
}))

export const eventStatisticsRelations = relations(eventStatistics, ({ one }) => ({
    event:                       one(events, {
        fields:                  [ eventStatistics.eventId ],
        references:              [ events.eventId ]
    })
}))

export const channelStatisticsRelations = relations(channelStatistics, ({ one }) => ({
    channel:                     one(channels, {
        fields:                  [ channelStatistics.channelId ],
        references:              [ channels.channelId ]
    })
}))

export const userStatisticsRelations = relations(userStatistics, ({ one }) => ({
    event:                       one(events, {
        fields:                  [ userStatistics.eventId ],
        references:              [ events.eventId ]
    }),
    user:                        one(users, {
        fields:                  [ userStatistics.userId ],
        references:              [ users.userId ]
    })
}))

