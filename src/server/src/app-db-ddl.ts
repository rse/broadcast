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
    either way through the Drizzle query API. The inferred row types exported at the
    bottom are independent of the simplified "broadcast-common" Hello-World types.  */

import {
    pgTable, pgEnum, uuid, text, boolean, integer, doublePrecision,
    timestamp, primaryKey, index, uniqueIndex
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

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
    "Presenter"
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
    title:                       text("title").notNull(),
    description:                 text("description").notNull().default(""),
    language:                    text("language").notNull(),
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
    chatThrottling:              integer("chatThrottling").notNull().default(0),
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
    questionsThrottling:         integer("questionsThrottling").notNull().default(0),
    questionsPrivate:            boolean("questionsPrivate").notNull().default(false),
    questionsModerator:          boolean("questionsModerator").notNull().default(false),

    /*  authorization tokens  */
    expireAuthTokenOnFirstUse:   boolean("expireAuthTokenOnFirstUse").notNull().default(false),

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
    value:                       text("value").notNull().default("")
}, (t) => [
    primaryKey({ columns: [ t.resourceId, t.providerId, t.key ] })
])

/*  ==== ENTITY: Role (SPEC-DM-role) ======================================  */

export const roles = pgTable("Role", {
    roleId:                      uuid("roleId").primaryKey().defaultRandom(),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" }),
    type:                        roleTypeEnum("type").notNull(),
    email:                       text("email").notNull()
}, (t) => [
    index("Role_eventId_idx").on(t.eventId)
])

/*  ==== ENTITY: User (SPEC-DM-user) ======================================  */
/*  a helper entity enabling event-based logins; no permanent accounts.  */

export const users = pgTable("User", {
    userId:                      uuid("userId").primaryKey().defaultRandom(),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" }),
    email:                       text("email").notNull(),
    firstname:                   text("firstname"),
    lastname:                    text("lastname")
}, (t) => [
    index("User_eventId_idx").on(t.eventId)
])

/*  ==== ENTITY: Message (SPEC-DM-message) ================================  */
/*  the central interaction entity (chat, support, question).  */

export const messages = pgTable("Message", {
    messageId:                   uuid("messageId").primaryKey().defaultRandom(),
    eventId:                     uuid("eventId").notNull()
        .references(() => events.eventId, { onDelete: "cascade" }),
    type:                        messageTypeEnum("type").notNull(),
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
    sender:                      uuid("sender")
        .references(() => users.userId, { onDelete: "set null" }),

    /*  self-references (0..1 each): a message can reply to / follow another
        message; the FK constraints are declared in the relations below.  */
    replyTo:                     uuid("replyTo"),
    predecessor:                 uuid("predecessor")
}, (t) => [
    index("Message_eventId_idx").on(t.eventId),
    index("Message_eventId_state_idx").on(t.eventId, t.state),
    index("Message_sender_idx").on(t.sender),
    index("Message_replyTo_idx").on(t.replyTo),
    index("Message_predecessor_idx").on(t.predecessor)
])

/*  ==== ENTITY: MessageText (SPEC-DM-messagetext) ========================  */
/*  a language-specific text variant of a message.  */

export const messageTexts = pgTable("MessageText", {
    messageTextId:               uuid("messageTextId").primaryKey().defaultRandom(),
    message:                     uuid("message").notNull()
        .references(() => messages.messageId, { onDelete: "cascade" }),
    language:                    text("language").notNull(),
    text:                        text("text").notNull()
}, (t) => [
    uniqueIndex("MessageText_message_language_idx").on(t.message, t.language)
])

/*  ==== ENTITY: QuestionTag (SPEC-DM-questiontag) ========================  */

export const questionTags = pgTable("QuestionTag", {
    questionTagId:               uuid("questionTagId").primaryKey().defaultRandom(),
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
    validUntil:                  timestamp("validUntil", { withTimezone: true }),
    state:                       tokenStateEnum("state").notNull().default("issued"),
    user:                        uuid("user").notNull()
        .references(() => users.userId, { onDelete: "cascade" }),
    event:                       uuid("event").notNull()
        .references(() => events.eventId, { onDelete: "cascade" })
}, (t) => [
    index("AuthorizationToken_user_idx").on(t.user),
    index("AuthorizationToken_event_idx").on(t.event)
])

/*  ==== ENTITY: SessionToken (SPEC-DM-sessiontoken) ======================  */

export const sessionTokens = pgTable("SessionToken", {
    sessionId:                   uuid("sessionId").primaryKey().defaultRandom(),
    issuedAt:                    timestamp("issuedAt", { withTimezone: true }).notNull().defaultNow(),
    user:                        uuid("user").notNull()
        .references(() => users.userId, { onDelete: "cascade" }),
    event:                       uuid("event").notNull()
        .references(() => events.eventId, { onDelete: "cascade" })
}, (t) => [
    index("SessionToken_user_idx").on(t.user),
    index("SessionToken_event_idx").on(t.event)
])

/*  ==== ENTITY: EventStatistic (SPEC-DM-eventstatistic) ==================  */

export const eventStatistics = pgTable("EventStatistic", {
    eventStatisticId:            uuid("eventStatisticId").primaryKey().defaultRandom(),
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
    channelId:                   uuid("channelId").notNull()
        .references(() => channels.channelId, { onDelete: "cascade" }),
    timestamp:                   timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    numberOfViewers:             integer("numberOfViewers").notNull().default(0)
}, (t) => [
    index("ChannelStatistic_channelId_idx").on(t.channelId)
])

/*  ==== ENTITY: UserStatistic (SPEC-DM-userstatistic) ====================  */

export const userStatistics = pgTable("UserStatistic", {
    userStatisticId:             uuid("userStatisticId").primaryKey().defaultRandom(),
    userId:                      uuid("userId").notNull()
        .references(() => users.userId, { onDelete: "cascade" }),
    timestamp:                   timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    country:                     text("country"),
    browserType:                 text("browserType"),
    deviceType:                  text("deviceType"),
    viewportWidth:               integer("viewportWidth"),
    viewportHeight:              integer("viewportHeight")
}, (t) => [
    index("UserStatistic_userId_idx").on(t.userId)
])

/*  ==== RELATIONS (declared in both directions for navigability) =========  */

export const eventsRelations = relations(events, ({ one, many }) => ({
    channels:                    many(channels),
    roles:                       many(roles),
    accessList:                  many(users),
    messages:                    many(messages),
    statistics:                  many(eventStatistics),
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
    event:                       one(events, {
        fields:                  [ roles.eventId ],
        references:              [ events.eventId ]
    })
}))

export const usersRelations = relations(users, ({ one, many }) => ({
    event:                       one(events, {
        fields:                  [ users.eventId ],
        references:              [ events.eventId ]
    }),
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
        fields:                  [ messages.sender ],
        references:              [ users.userId ]
    }),
    replyTo:                     one(messages, {
        relationName:            "messageReply",
        fields:                  [ messages.replyTo ],
        references:              [ messages.messageId ]
    }),
    replies:                     many(messages, { relationName: "messageReply" }),
    predecessor:                 one(messages, {
        relationName:            "messagePredecessor",
        fields:                  [ messages.predecessor ],
        references:              [ messages.messageId ]
    }),
    successors:                  many(messages, { relationName: "messagePredecessor" }),
    texts:                       many(messageTexts),
    questionTags:                many(messageQuestionTags),
    liker:                       many(messageLiker)
}))

export const messageTextsRelations = relations(messageTexts, ({ one }) => ({
    message:                     one(messages, {
        fields:                  [ messageTexts.message ],
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
        fields:                  [ authorizationTokens.user ],
        references:              [ users.userId ]
    }),
    event:                       one(events, {
        fields:                  [ authorizationTokens.event ],
        references:              [ events.eventId ]
    })
}))

export const sessionTokensRelations = relations(sessionTokens, ({ one }) => ({
    user:                        one(users, {
        fields:                  [ sessionTokens.user ],
        references:              [ users.userId ]
    }),
    event:                       one(events, {
        fields:                  [ sessionTokens.event ],
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
    user:                        one(users, {
        fields:                  [ userStatistics.userId ],
        references:              [ users.userId ]
    })
}))

/*  ==== INFERRED ROW TYPES (independent of broadcast-common) =============  */

export type Event                 = typeof events.$inferSelect
export type NewEvent              = typeof events.$inferInsert
export type AgendaPoint           = typeof agendaPoints.$inferSelect
export type NewAgendaPoint        = typeof agendaPoints.$inferInsert
export type Channel               = typeof channels.$inferSelect
export type NewChannel            = typeof channels.$inferInsert
export type Resource              = typeof resources.$inferSelect
export type NewResource           = typeof resources.$inferInsert
export type ResourceProviderParam = typeof resourceProviderParams.$inferSelect
export type NewResourceProviderParam = typeof resourceProviderParams.$inferInsert
export type Role                  = typeof roles.$inferSelect
export type NewRole               = typeof roles.$inferInsert
export type User                  = typeof users.$inferSelect
export type NewUser               = typeof users.$inferInsert
export type Message               = typeof messages.$inferSelect
export type NewMessage            = typeof messages.$inferInsert
export type MessageText           = typeof messageTexts.$inferSelect
export type NewMessageText        = typeof messageTexts.$inferInsert
export type QuestionTag           = typeof questionTags.$inferSelect
export type NewQuestionTag        = typeof questionTags.$inferInsert
export type AuthorizationToken    = typeof authorizationTokens.$inferSelect
export type NewAuthorizationToken = typeof authorizationTokens.$inferInsert
export type SessionToken          = typeof sessionTokens.$inferSelect
export type NewSessionToken       = typeof sessionTokens.$inferInsert
export type EventStatistic        = typeof eventStatistics.$inferSelect
export type NewEventStatistic     = typeof eventStatistics.$inferInsert
export type ChannelStatistic      = typeof channelStatistics.$inferSelect
export type NewChannelStatistic   = typeof channelStatistics.$inferInsert
export type UserStatistic         = typeof userStatistics.$inferSelect
export type NewUserStatistic      = typeof userStatistics.$inferInsert
