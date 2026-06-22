
#   SPECIFICATION: DATA MODEL (SPEC-DM)

##  ENTITY: <a id="SPEC-DM-event">Event</a>

The master entity describing a single live broadcast event and all of its configuration,
**BECAUSE** the entire data model is event-centric and every other entity hangs off an event.

### ATTRIBUTES

| Attribute                       | Type                                    | Description                                                                                                                              |
| ------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **accessEmailPattern**          | string                                  | Pattern that grants access to any matching email beyond the access list, **BECAUSE** events can admit whole email domains without enumerating users. |
| **allowAccessAnonymous**        | boolean                                 | Whether anonymous attendees may access the event without authorization, **BECAUSE** public events accept unauthenticated viewers.       |
| **appAdminURL**                 | string                                  | Administration URL of the embedded third-party application, **BECAUSE** moderators control the app through a separate admin view.        |
| **appEnabled**                  | boolean                                 | Whether a third-party application is integrated, **BECAUSE** events may embed an interactive app.                                       |
| **appTitle**                    | string                                  | Display title of the embedded third-party application, **BECAUSE** the embedded app needs a label for attendees.                        |
| **appURL**                      | string                                  | URL of the embedded third-party application, **BECAUSE** the client must load the app from a defined location.                          |
| **begin**                       | datetime                                | Planned start date and time of the event, **BECAUSE** attendees and operators must know when the event starts.                          |
| **chatAllowAnonymous**          | boolean                                 | Whether chat messages may be sent as "Anonymous", **BECAUSE** events differ in how much chat identity is revealed.                      |
| **chatEnabled**                 | boolean                                 | Whether attendees may send chat messages, **BECAUSE** chat is an optional interaction channel per event.                                |
| **chatModerator**               | boolean                                 | Whether chat messages are moderated before becoming visible, **BECAUSE** organizers may require approval of chat content.               |
| **chatName**                    | enum(full,firstname,anonymous)          | How the attendee name appears on chat messages, **BECAUSE** the event controls the displayed chat identity.                             |
| **chatReply**                   | boolean                                 | Whether chat messages may be replied to, **BECAUSE** threaded replies are appropriate only for some events.                             |
| **chatThrottling**              | integer                                 | Maximum chat messages per user per minute, **BECAUSE** rate limiting prevents denial-of-service abuse.                                  |
| **description**                 | string                                  | Free-text description of the event, **BECAUSE** organizers describe the purpose and content of the event.                               |
| **end**                         | datetime                                | Planned end date and time of the event, **BECAUSE** scheduling and the finish procedure depend on the planned end.                      |
| **eventId**                     | unique uuid                             | Unique identifier of the event used in the access URL, **BECAUSE** attendees reach a specific event by an unguessable link.             |
| **expireAuthTokenOnFirstUse**   | boolean                                 | Whether pre-generated authorization tokens expire after first use, **BECAUSE** events choose between one-time and reusable pre-generated tokens. |
| **interactionInfo**             | string                                  | HTML markup shown when interaction is enabled, **BECAUSE** conduct rules must be presented before chat or questions.                     |
| **interactionInfoToBeAccepted** | boolean                                 | Whether the interaction information must be explicitly accepted, **BECAUSE** some events require acknowledged conduct rules before interacting. |
| **language**                    | string                                  | Targeted mother language of the event, **BECAUSE** it sets the default language despite on-the-fly translation of interaction.          |
| **loginInfo**                   | string                                  | HTML markup shown to attendees at login, **BECAUSE** managers convey event information and links at entry.                              |
| **loginInfoToBeAccepted**       | boolean                                 | Whether the login information must be explicitly accepted, **BECAUSE** some events require acknowledged consent before joining.          |
| **presenterAlert**              | string                                  | Alert text a moderator can raise for the presenter, **BECAUSE** the moderator must signal urgent information to the presenter.          |
| **presenterAlertState**         | enum(raised,unraised)                   | Whether the presenter alert is currently visible to the presenter, **BECAUSE** the alert is toggled on by the moderator and confirmed off. |
| **questionsAllowAnonymous**     | boolean                                 | Whether questions may be sent as "Anonymous", **BECAUSE** events differ in how much question identity is revealed.                      |
| **questionsEnabled**            | boolean                                 | Whether attendees may ask questions, **BECAUSE** questions are an optional interaction channel per event.                               |
| **questionsModerator**          | boolean                                 | Whether questions are moderated before becoming visible, **BECAUSE** organizers may require approval of questions.                      |
| **questionsName**               | enum(full,firstname,anonymous)          | How the attendee name appears on questions, **BECAUSE** the event controls the displayed question identity.                             |
| **questionsPrivate**            | boolean                                 | Whether questions are hidden from other attendees and seen only by moderators, **BECAUSE** some events keep questions private to the moderation team. |
| **questionsThrottling**         | integer                                 | Maximum questions per user per time window, **BECAUSE** rate limiting prevents abuse of the question channel.                           |
| **sentimentModeratorAnalysis**  | boolean                                 | Whether full server-side sentiment analysis is enabled, **BECAUSE** the event can check input before it is stored.                      |
| **sentimentModeratorAutoAccept**| boolean                                 | Whether proper input is auto-accepted on the server, **BECAUSE** moderators can be relieved of approving positive input.                |
| **sentimentModeratorAutoReject**| boolean                                 | Whether improper input is auto-rejected on the server, **BECAUSE** moderators can be relieved of rejecting negative input.              |
| **sentimentSenderAnalysis**     | boolean                                 | Whether lightweight client-side sentiment analysis is enabled, **BECAUSE** the event can check input at the source before sending.      |
| **sentimentSenderAutoPrevent**  | boolean                                 | Whether improper input is prevented from submission on the client, **BECAUSE** the event can block misconduct before it reaches the server. |
| **state**                       | enum(planning,published,running,finished) | Lifecycle state controlling attendee visibility and access, **BECAUSE** an event progresses from private setup to live to archived.   |
| **supportEnabled**              | boolean                                 | Whether attendees may chat with support for technical problems, **BECAUSE** events may offer a dedicated support channel.               |
| **title**                       | string                                  | Display title of the event such as "Townhall 1/23", **BECAUSE** attendees and managers need a human-readable label.                     |

### RELATIONS

| Relation                  | Target                                            | Description                                                                                                |
| ------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **accessList**            | [User](#SPEC-DM-user) (0..n)                       | Invited attendees identified by email, **BECAUSE** access is granted to an explicit list of users.        |
| **activeAgendaPoint**     | [AgendaPoint](#SPEC-DM-agendapoint) (0..1)         | The currently active agenda point, **BECAUSE** attendees see which phase of the event is current.         |
| **agendaPoints**          | [AgendaPoint](#SPEC-DM-agendapoint) (0..n)         | All agenda points of the event, **BECAUSE** the event has an ordered agenda of phases.                    |
| **availableQuestionTags** | [QuestionTag](#SPEC-DM-questiontag) (0..n)         | Tags available for use on questions, **BECAUSE** the event defines the vocabulary for tagging questions.  |
| **channels**              | [Channel](#SPEC-DM-channel) (0..n)                 | Language-specific content distributors of the event, **BECAUSE** an event delivers content through one or more logical channels. |
| **messages**              | [Message](#SPEC-DM-message) (0..n)                 | Messages written during the event, **BECAUSE** all chat, question, and support input belongs to the event. |
| **roles**                 | [Role](#SPEC-DM-role) (0..n)                       | Manager, Moderator, and Presenter roles for the event, **BECAUSE** event-specific rights are granted through roles. |
| **statistics**            | [EventStatistic](#SPEC-DM-eventstatistic) (0..n)   | Periodic cumulative statistics snapshots, **BECAUSE** trend visualization requires periodic counts.       |

##  ENTITY: <a id="SPEC-DM-agendapoint">AgendaPoint</a>

The textual description of a phase in an event,
**BECAUSE** attendees and moderators track which part of the event is currently active.

### ATTRIBUTES

| Attribute         | Type        | Description                                                                                  |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------- |
| **agendaPointId** | unique uuid | Unique identifier of the agenda point, **BECAUSE** it is referenced as a foreign key.        |
| **orderPosition** | integer     | Ordering position of the phase, **BECAUSE** agenda points have a defined sequence.           |
| **text**          | string      | Description of the current phase of the event, **BECAUSE** the phase must be presented in human-readable form. |

### RELATIONS

| Relation              | Target                                    | Description                                                                                                       |
| --------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **correspondingTags** | [QuestionTag](#SPEC-DM-questiontag) (0..n) | Question tags corresponding to this agenda point, **BECAUSE** questions can be associated with the agenda phase they relate to. |

##  ENTITY: <a id="SPEC-DM-channel">Channel</a>

A logical content delivery stream linking video streams to an event,
**BECAUSE** an event groups its streams by language and resolution into channels.

### ATTRIBUTES

| Attribute     | Type        | Description                                                                                |
| ------------- | ----------- | ----------------------------------------------------------------------------------------- |
| **active**    | boolean     | Whether the channel is the currently active one, **BECAUSE** only one channel of an event is active at once. |
| **channelId** | unique uuid | Unique identifier of the channel, **BECAUSE** it is referenced as a foreign key.           |
| **default**   | boolean     | Whether this channel is activated by default on entering an event, **BECAUSE** attendees need a defined initial channel. |
| **name**      | string      | Display name of the channel such as "Digital Townhall", **BECAUSE** attendees choose between named channels. |

### RELATIONS

| Relation       | Target                                              | Description                                                                                 |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **resources**  | [Resource](#SPEC-DM-resource) (1..n)                 | Physical resources backing the channel, **BECAUSE** a channel is delivered by one or more provider resources. |
| **statistics** | [ChannelStatistic](#SPEC-DM-channelstatistic) (0..n) | Periodic viewer statistics of the channel, **BECAUSE** organizers track viewers per channel over time. |

##  ENTITY: <a id="SPEC-DM-resource">Resource</a>

A physical content delivery resource such as a provider stream or static website linked to a channel,
**BECAUSE** a channel must map to concrete provider endpoints to be playable.

### ATTRIBUTES

| Attribute      | Type        | Description                                                                                            |
| -------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| **active**     | boolean     | Whether this resource is the active resource of the channel, **BECAUSE** only one resource of a channel is active at once for provider switching. |
| **providerId** | string      | Provider identifier from the event configuration file, **BECAUSE** a resource binds to a specific configured streaming provider. |
| **resourceId** | unique uuid | Unique identifier of the resource, **BECAUSE** it is referenced as a foreign key and in the access URL. |

### RELATIONS

| Relation   | Target                                                  | Description                                                                                |
| ---------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **params** | [ResourceProviderParam](#SPEC-DM-resourceparam) (0..n)  | Provider key-value parameters assigned to this resource, **BECAUSE** each provider needs configured parameters to address its stream. |

##  ENTITY: <a id="SPEC-DM-resourceparam">ResourceProviderParam</a>

A key-value parameter belonging to exactly one resource and provider, defined in the event configuration file,
**BECAUSE** provider endpoints are parameterized by values an administrator supplies.

### ATTRIBUTES

| Attribute      | Type          | Description                                                                          |
| -------------- | ------------- | ----------------------------------------------------------------------------------- |
| **key**        | unique string | Parameter key defined in the configuration file, **BECAUSE** each provider parameter is identified by its key. |
| **providerId** | unique string | Provider identifier from the configuration file, **BECAUSE** the parameter is scoped to one provider. |
| **resourceId** | unique uuid   | Identifier of the owning resource, **BECAUSE** the parameter belongs to exactly one resource. |
| **value**      | string        | Value the administrator entered for the key, **BECAUSE** the concrete endpoint requires the supplied value. |

##  ENTITY: <a id="SPEC-DM-role">Role</a>

A grant of special rights to a specific user within an event,
**BECAUSE** the application is role-based and rights are granted through roles.

### ATTRIBUTES

| Attribute  | Type                              | Description                                                                          |
| ---------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| **email**  | string                            | Email address of the authorized person, **BECAUSE** roles are granted by email without permanent accounts. |
| **roleId** | unique uuid                       | Unique identifier of the role, **BECAUSE** it is referenced as a foreign key.        |
| **type**   | enum(Manager,Moderator,Presenter) | The role granted to the person for the event, **BECAUSE** each role carries a distinct set of rights. |

##  ENTITY: <a id="SPEC-DM-user">User</a>

A helper entity enabling event-based logins for invited or pattern-matched attendees,
**BECAUSE** the system holds no permanent accounts yet must identify attendees per event.

### ATTRIBUTES

| Attribute     | Type        | Description                                                                          |
| ------------- | ----------- | ----------------------------------------------------------------------------------- |
| **email**     | string      | Concrete email address of the user, **BECAUSE** authorization tokens are sent to this address at login. |
| **firstname** | string      | Optional first name of the user, **BECAUSE** it is displayed on the user's chat and question messages. |
| **lastname**  | string      | Optional last name of the user, **BECAUSE** it is displayed on the user's chat and question messages. |
| **userId**    | unique uuid | Unique identifier of the user, **BECAUSE** it is referenced as a foreign key.        |

### RELATIONS

| Relation         | Target                                        | Description                                                                                 |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **likes**        | [Message](#SPEC-DM-message) (0..n)            | Messages the user marked as liked, **BECAUSE** likes are tracked per user until anonymization. |
| **sentMessages** | [Message](#SPEC-DM-message) (0..n)            | Messages the user has sent, **BECAUSE** authorship links a message to its sending user.    |
| **statistics**   | [UserStatistic](#SPEC-DM-userstatistic) (0..n) | Periodic statistics about the user, **BECAUSE** viewer information is captured per user over time. |

##  ENTITY: <a id="SPEC-DM-message">Message</a>

A single chat, support, or question item tracked for attendees and moderators,
**BECAUSE** all event interaction is represented uniformly as messages with language-specific texts.

### ATTRIBUTES

| Attribute               | Type                                                          | Description                                                                                          |
| ----------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **edited**              | enum(none,insignificant,significant,deleted)                 | Whether and how the message was changed or deleted, **BECAUSE** edits must be marked for others and edits stop once forwarded. |
| **likes**               | integer                                                      | Computed number of likes conserved on event finish, **BECAUSE** the like total must survive removal of liker relations for GDPR. |
| **messageId**           | unique uuid                                                  | Unique identifier of the message, **BECAUSE** it is the foreign key for the translated message texts. |
| **originalLanguage**    | string                                                       | Language the sender originally wrote the message in, **BECAUSE** the difference between human-written and AI-translated text must always be visible. |
| **presenterAnnotation** | string                                                       | Hint a moderator attaches for the presenter on forwarding, **BECAUSE** the presenter benefits from routing guidance on a forwarded message. |
| **senderName**          | string                                                       | Display name shown to others for the sender, **BECAUSE** the visible name depends on event naming and anonymity options. |
| **sentimentScore**      | float                                                        | Server-side sentiment score between -1 and 1, **BECAUSE** the analysis result is stored for display and auto-moderation. |
| **state**               | enum(pending,accepted,rejected,forwarded,answered,suspended) | Moderation and processing state of the message, **BECAUSE** the message moves through a defined moderation and presentation lifecycle. |
| **timestamp**           | datetime                                                     | Time the sender created the message, **BECAUSE** ordering and export require the creation time.      |
| **timestampAnswered**   | datetime                                                     | Time the message was answered, **BECAUSE** the presenter records when a question was answered.       |
| **type**                | enum(Chat,Support,Question)                                  | The kind of message, **BECAUSE** each type has a distinct lifecycle and visibility.                 |

### RELATIONS

| Relation         | Target                                    | Description                                                                                       |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **event**        | [Event](#SPEC-DM-event) (1)               | The event the message belongs to, **BECAUSE** the event link must persist even after senders are deleted. |
| **liker**        | [User](#SPEC-DM-user) (0..n)              | Attendees who liked the message, **BECAUSE** likes are tracked per liking user before anonymization. |
| **predecessor**  | [Message](#SPEC-DM-message) (0..1)        | The preceding message in a manual ordering, **BECAUSE** moderators sort forwarded messages for the presenter. |
| **questionTags** | [QuestionTag](#SPEC-DM-questiontag) (0..n) | Tags attached to a question message, **BECAUSE** questions can be tagged with zero or more tags for context. |
| **replyTo**      | [Message](#SPEC-DM-message) (0..1)        | The message this message replies to, **BECAUSE** chat replies and moderator answers chain messages together. |
| **sender**       | [User](#SPEC-DM-user) (0..1)              | The authoring attendee of the message, **BECAUSE** a message has an author until the sender is removed on finish. |

##  ENTITY: <a id="SPEC-DM-messagetext">MessageText</a>

A language-specific text of a message,
**BECAUSE** a message is translated into multiple languages while retaining one original.

### ATTRIBUTES

| Attribute         | Type        | Description                                                                          |
| ----------------- | ----------- | ----------------------------------------------------------------------------------- |
| **language**      | string      | Language the text is written in, **BECAUSE** each text variant is identified by its language. |
| **messageTextId** | unique uuid | Unique identifier of the message text, **BECAUSE** it is referenced as a foreign key. |
| **text**          | string      | The message text in the stated language, **BECAUSE** the displayed content depends on the chosen language. |

### RELATIONS

| Relation    | Target                             | Description                                                                          |
| ----------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| **message** | [Message](#SPEC-DM-message) (1)    | The message this text belongs to, **BECAUSE** each text variant is owned by exactly one message. |

##  ENTITY: <a id="SPEC-DM-questiontag">QuestionTag</a>

A named tag attachable to question messages,
**BECAUSE** questions are categorized by topic or addressed person for routing and grouping.

### ATTRIBUTES

| Attribute         | Type          | Description                                                                          |
| ----------------- | ------------- | ----------------------------------------------------------------------------------- |
| **group**         | string        | Logical group the tag belongs to such as a topic or person, **BECAUSE** tags are organized into meaningful groups. |
| **moderatorOnly** | boolean       | Whether only a Moderator or Manager may use the tag, **BECAUSE** some tags are reserved for the moderation team. |
| **questionTagId** | unique uuid   | Unique identifier of the question tag, **BECAUSE** it is referenced as a foreign key. |
| **text**          | unique string | Unique tag name, **BECAUSE** tags are identified and displayed by their name.        |

##  ENTITY: <a id="SPEC-DM-authtoken">AuthorizationToken</a>

A one-time second factor proving an attendee controls the email address used as first factor,
**BECAUSE** email-verified access is the core mechanism limiting the audience.

### ATTRIBUTES

| Attribute      | Type                | Description                                                                          |
| -------------- | ------------------- | ----------------------------------------------------------------------------------- |
| **state**      | enum(issued,sent,used) | Lifecycle state of the token, **BECAUSE** debugging statistics and anonymized sums need the token state. |
| **token**      | string              | The generated one-time token for the next login attempt, **BECAUSE** the attendee proves control of the email by returning this token. |
| **validUntil** | datetime            | Expiry time of the token, unset for pre-generated tokens, **BECAUSE** ordinary tokens expire within minutes while pre-generated ones last until event end. |

### RELATIONS

| Relation  | Target                       | Description                                                                          |
| --------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| **event** | [Event](#SPEC-DM-event) (1)  | The event the token was issued for, **BECAUSE** a token grants access to exactly one event. |
| **user**  | [User](#SPEC-DM-user) (1)    | The user the token was issued for, **BECAUSE** a token authorizes exactly one user.  |

##  ENTITY: <a id="SPEC-DM-sessiontoken">SessionToken</a>

The result of a successful login of a user to an event,
**BECAUSE** an active session must be tracked to enforce single concurrent access.

### ATTRIBUTES

| Attribute     | Type        | Description                                                                          |
| ------------- | ----------- | ----------------------------------------------------------------------------------- |
| **issuedAt**  | datetime    | Time the user successfully entered the event, **BECAUSE** the session start time is recorded for tracking. |
| **sessionId** | unique uuid | Unique identifier of the session, **BECAUSE** the active session of a user for an event must be addressable. |

### RELATIONS

| Relation  | Target                       | Description                                                                          |
| --------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| **event** | [Event](#SPEC-DM-event) (1)  | The event the session was issued for, **BECAUSE** a session grants access to exactly one event. |
| **user**  | [User](#SPEC-DM-user) (1)    | The user the session was issued for, **BECAUSE** a session belongs to exactly one user. |

##  ENTITY: <a id="SPEC-DM-eventstatistic">EventStatistic</a>

A periodic cumulative snapshot of event-wide counts,
**BECAUSE** trend visualization of audience size and authentication flow requires regular snapshots.

### ATTRIBUTES

| Attribute                    | Type        | Description                                                                          |
| ---------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| **eventStatisticId**         | unique uuid | Unique identifier of the event statistic, **BECAUSE** it is referenced as a foreign key. |
| **numberOfConnections**      | integer     | Count of active MQTT connections at the timestamp, **BECAUSE** active viewers differ from sessions once an attendee leaves. |
| **numberOfIssuedAuthTokens** | integer     | Count of issued authorization tokens at the timestamp, **BECAUSE** debugging statistics track issued tokens. |
| **numberOfSentAuthTokens**   | integer     | Count of sent authorization tokens at the timestamp, **BECAUSE** debugging statistics track sent tokens. |
| **numberOfSessionTokens**    | integer     | Count of session tokens at the timestamp, **BECAUSE** logged-in users are derived from session tokens. |
| **numberOfUsedAuthTokens**   | integer     | Count of used authorization tokens at the timestamp, **BECAUSE** debugging statistics track used tokens. |
| **timestamp**                | datetime    | Time the snapshot was created, **BECAUSE** statistics are plotted over time.         |

##  ENTITY: <a id="SPEC-DM-channelstatistic">ChannelStatistic</a>

A periodic count of viewers for a channel,
**BECAUSE** organizers need per-channel popularity over time.

### ATTRIBUTES

| Attribute              | Type        | Description                                                                          |
| ---------------------- | ----------- | ----------------------------------------------------------------------------------- |
| **channelStatisticId** | unique uuid | Unique identifier of the channel statistic, **BECAUSE** it is referenced as a foreign key. |
| **numberOfViewers**    | integer     | Count of viewers of the channel at the timestamp, **BECAUSE** the per-channel viewer count is the tracked metric. |
| **timestamp**          | datetime    | Time the snapshot was created, **BECAUSE** channel statistics are plotted over time. |

##  ENTITY: <a id="SPEC-DM-userstatistic">UserStatistic</a>

Tracked viewer information about a user,
**BECAUSE** audience composition informs reporting and default localization.

### ATTRIBUTES

| Attribute          | Type        | Description                                                                          |
| ------------------ | ----------- | ----------------------------------------------------------------------------------- |
| **browserType**    | string      | Type of browser used, **BECAUSE** browser distribution informs compatibility decisions. |
| **country**        | string      | ISO country code from GeoIP tracking, **BECAUSE** country selects the default application language on first use. |
| **deviceType**     | string      | Type of device used, **BECAUSE** device distribution informs responsive design priorities. |
| **timestamp**      | datetime    | Time the snapshot was created, **BECAUSE** user statistics are recorded over time.   |
| **userStatisticId**| unique uuid | Unique identifier of the user statistic, **BECAUSE** it is referenced as a foreign key. |
| **viewportHeight** | integer     | Height in pixels of the browser viewport, **BECAUSE** viewport sizing informs layout decisions. |
| **viewportWidth**  | integer     | Width in pixels of the browser viewport, **BECAUSE** viewport sizing informs layout decisions. |
