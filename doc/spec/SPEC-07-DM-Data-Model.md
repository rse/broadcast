
#   SPECIFICATION: DATA MODEL (SPEC-DM)

✳   Created:  **2026-06-18 10:18**
✎   Modified: **2026-06-18 10:18**

##  ENTITY: `Event` <a id="SPEC-DM-event"></a>

The master entity describing a single live broadcast event and all of its configuration,
**BECAUSE** the entire data model is event-centric and every other entity hangs off an event.

### ATTRIBUTES

-   `eventId`: `unique uuid`:<br/>
    Unique identifier of the event used in the access URL,
    **BECAUSE** attendees reach a specific event by an unguessable link.

-   `title`: `string`:<br/>
    Display title of the event such as "Townhall 1/23",
    **BECAUSE** attendees and managers need a human-readable label.

-   `description`: `string`:<br/>
    Free-text description of the event,
    **BECAUSE** organizers describe the purpose and content of the event.

-   `language`: `string`:<br/>
    Targeted mother language of the event,
    **BECAUSE** it sets the default language despite on-the-fly translation of interaction.

-   `begin`: `datetime`:<br/>
    Planned start date and time of the event,
    **BECAUSE** attendees and operators must know when the event starts.

-   `end`: `datetime`:<br/>
    Planned end date and time of the event,
    **BECAUSE** scheduling and the finish procedure depend on the planned end.

-   `state`: `enum(planning,published,running,finished)`:<br/>
    Lifecycle state controlling attendee visibility and access,
    **BECAUSE** an event progresses from private setup to live to archived.

-   `loginInfo`: `string`:<br/>
    HTML markup shown to attendees at login,
    **BECAUSE** managers convey event information and links at entry.

-   `loginInfoToBeAccepted`: `boolean`:<br/>
    Whether the login information must be explicitly accepted,
    **BECAUSE** some events require acknowledged consent before joining.

-   `interactionInfo`: `string`:<br/>
    HTML markup shown when interaction is enabled,
    **BECAUSE** conduct rules must be presented before chat or questions.

-   `interactionInfoToBeAccepted`: `boolean`:<br/>
    Whether the interaction information must be explicitly accepted,
    **BECAUSE** some events require acknowledged conduct rules before interacting.

-   `allowAccessAnonymous`: `boolean`:<br/>
    Whether anonymous attendees may access the event without authorization,
    **BECAUSE** public events accept unauthenticated viewers.

-   `accessEmailPattern`: `string`:<br/>
    Pattern that grants access to any matching email beyond the access list,
    **BECAUSE** events can admit whole email domains without enumerating users.

-   `chatEnabled`: `boolean`:<br/>
    Whether attendees may send chat messages,
    **BECAUSE** chat is an optional interaction channel per event.

-   `chatAllowAnonymous`: `boolean`:<br/>
    Whether chat messages may be sent as "Anonymous",
    **BECAUSE** events differ in how much chat identity is revealed.

-   `chatName`: `enum(full,firstname,anonymous)`:<br/>
    How the attendee name appears on chat messages,
    **BECAUSE** the event controls the displayed chat identity.

-   `chatReply`: `boolean`:<br/>
    Whether chat messages may be replied to,
    **BECAUSE** threaded replies are appropriate only for some events.

-   `chatThrottling`: `integer`:<br/>
    Maximum chat messages per user per minute,
    **BECAUSE** rate limiting prevents denial-of-service abuse.

-   `chatModerator`: `boolean`:<br/>
    Whether chat messages are moderated before becoming visible,
    **BECAUSE** organizers may require approval of chat content.

-   `supportEnabled`: `boolean`:<br/>
    Whether attendees may chat with support for technical problems,
    **BECAUSE** events may offer a dedicated support channel.

-   `appEnabled`: `boolean`:<br/>
    Whether a third-party application is integrated,
    **BECAUSE** events may embed an interactive app.

-   `appTitle`: `string`:<br/>
    Display title of the embedded third-party application,
    **BECAUSE** the embedded app needs a label for attendees.

-   `appURL`: `string`:<br/>
    URL of the embedded third-party application,
    **BECAUSE** the client must load the app from a defined location.

-   `appAdminURL`: `string`:<br/>
    Administration URL of the embedded third-party application,
    **BECAUSE** moderators control the app through a separate admin view.

-   `presenterAlert`: `string`:<br/>
    Alert text a moderator can raise for the presenter,
    **BECAUSE** the moderator must signal urgent information to the presenter.

-   `presenterAlertState`: `enum(raised,unraised)`:<br/>
    Whether the presenter alert is currently visible to the presenter,
    **BECAUSE** the alert is toggled on by the moderator and confirmed off.

-   `questionsEnabled`: `boolean`:<br/>
    Whether attendees may ask questions,
    **BECAUSE** questions are an optional interaction channel per event.

-   `questionsAllowAnonymous`: `boolean`:<br/>
    Whether questions may be sent as "Anonymous",
    **BECAUSE** events differ in how much question identity is revealed.

-   `questionsName`: `enum(full,firstname,anonymous)`:<br/>
    How the attendee name appears on questions,
    **BECAUSE** the event controls the displayed question identity.

-   `questionsThrottling`: `integer`:<br/>
    Maximum questions per user per time window,
    **BECAUSE** rate limiting prevents abuse of the question channel.

-   `questionsPrivate`: `boolean`:<br/>
    Whether questions are hidden from other attendees and seen only by moderators,
    **BECAUSE** some events keep questions private to the moderation team.

-   `questionsModerator`: `boolean`:<br/>
    Whether questions are moderated before becoming visible,
    **BECAUSE** organizers may require approval of questions.

-   `expireAuthTokenOnFirstUse`: `boolean`:<br/>
    Whether pre-generated authorization tokens expire after first use,
    **BECAUSE** events choose between one-time and reusable pre-generated tokens.

-   `sentimentSenderAnalysis`: `boolean`:<br/>
    Whether lightweight client-side sentiment analysis is enabled,
    **BECAUSE** the event can check input at the source before sending.

-   `sentimentSenderAutoPrevent`: `boolean`:<br/>
    Whether improper input is prevented from submission on the client,
    **BECAUSE** the event can block misconduct before it reaches the server.

-   `sentimentModeratorAnalysis`: `boolean`:<br/>
    Whether full server-side sentiment analysis is enabled,
    **BECAUSE** the event can check input before it is stored.

-   `sentimentModeratorAutoAccept`: `boolean`:<br/>
    Whether proper input is auto-accepted on the server,
    **BECAUSE** moderators can be relieved of approving positive input.

-   `sentimentModeratorAutoReject`: `boolean`:<br/>
    Whether improper input is auto-rejected on the server,
    **BECAUSE** moderators can be relieved of rejecting negative input.

### RELATIONS

-   `channels`: [`Channel`](#SPEC-DM-channel)(`0..n`):<br/>
    Language-specific content distributors of the event,
    **BECAUSE** an event delivers content through one or more logical channels.

-   `roles`: [`Role`](#SPEC-DM-role)(`0..n`):<br/>
    Manager, Moderator, and Presenter roles for the event,
    **BECAUSE** event-specific rights are granted through roles.

-   `accessList`: [`User`](#SPEC-DM-user)(`0..n`):<br/>
    Invited attendees identified by email,
    **BECAUSE** access is granted to an explicit list of users.

-   `messages`: [`Message`](#SPEC-DM-message)(`0..n`):<br/>
    Messages written during the event,
    **BECAUSE** all chat, question, and support input belongs to the event.

-   `statistics`: [`EventStatistic`](#SPEC-DM-eventstatistic)(`0..n`):<br/>
    Periodic cumulative statistics snapshots,
    **BECAUSE** trend visualization requires periodic counts.

-   `availableQuestionTags`: [`QuestionTag`](#SPEC-DM-questiontag)(`0..n`):<br/>
    Tags available for use on questions,
    **BECAUSE** the event defines the vocabulary for tagging questions.

-   `activeAgendaPoint`: [`AgendaPoint`](#SPEC-DM-agendapoint)(`0..1`):<br/>
    The currently active agenda point,
    **BECAUSE** attendees see which phase of the event is current.

-   `agendaPoints`: [`AgendaPoint`](#SPEC-DM-agendapoint)(`0..n`):<br/>
    All agenda points of the event,
    **BECAUSE** the event has an ordered agenda of phases.

##  ENTITY: `AgendaPoint` <a id="SPEC-DM-agendapoint"></a>

The textual description of a phase in an event,
**BECAUSE** attendees and moderators track which part of the event is currently active.

### ATTRIBUTES

-   `agendaPointId`: `unique uuid`:<br/>
    Unique identifier of the agenda point,
    **BECAUSE** it is referenced as a foreign key.

-   `text`: `string`:<br/>
    Description of the current phase of the event,
    **BECAUSE** the phase must be presented in human-readable form.

-   `orderPosition`: `integer`:<br/>
    Ordering position of the phase,
    **BECAUSE** agenda points have a defined sequence.

### RELATIONS

-   `correspondingTags`: [`QuestionTag`](#SPEC-DM-questiontag)(`0..n`):<br/>
    Question tags corresponding to this agenda point,
    **BECAUSE** questions can be associated with the agenda phase they relate to.

##  ENTITY: `Channel` <a id="SPEC-DM-channel"></a>

A logical content delivery stream linking video streams to an event,
**BECAUSE** an event groups its streams by language and resolution into channels.

### ATTRIBUTES

-   `channelId`: `unique uuid`:<br/>
    Unique identifier of the channel,
    **BECAUSE** it is referenced as a foreign key.

-   `name`: `string`:<br/>
    Display name of the channel such as "Digital Townhall",
    **BECAUSE** attendees choose between named channels.

-   `active`: `boolean`:<br/>
    Whether the channel is the currently active one,
    **BECAUSE** only one channel of an event is active at once.

-   `default`: `boolean`:<br/>
    Whether this channel is activated by default on entering an event,
    **BECAUSE** attendees need a defined initial channel.

### RELATIONS

-   `resources`: [`Resource`](#SPEC-DM-resource)(`1..n`):<br/>
    Physical resources backing the channel,
    **BECAUSE** a channel is delivered by one or more provider resources.

-   `statistics`: [`ChannelStatistic`](#SPEC-DM-channelstatistic)(`0..n`):<br/>
    Periodic viewer statistics of the channel,
    **BECAUSE** organizers track viewers per channel over time.

##  ENTITY: `Resource` <a id="SPEC-DM-resource"></a>

A physical content delivery resource such as a provider stream or static website linked to a channel,
**BECAUSE** a channel must map to concrete provider endpoints to be playable.

### ATTRIBUTES

-   `resourceId`: `unique uuid`:<br/>
    Unique identifier of the resource,
    **BECAUSE** it is referenced as a foreign key and in the access URL.

-   `providerId`: `string`:<br/>
    Provider identifier from the event configuration file,
    **BECAUSE** a resource binds to a specific configured streaming provider.

-   `active`: `boolean`:<br/>
    Whether this resource is the active resource of the channel,
    **BECAUSE** only one resource of a channel is active at once for provider switching.

### RELATIONS

-   `params`: [`ResourceProviderParam`](#SPEC-DM-resourceparam)(`0..n`):<br/>
    Provider key-value parameters assigned to this resource,
    **BECAUSE** each provider needs configured parameters to address its stream.

##  ENTITY: `ResourceProviderParam` <a id="SPEC-DM-resourceparam"></a>

A key-value parameter belonging to exactly one resource and provider, defined in the event configuration file,
**BECAUSE** provider endpoints are parameterized by values an administrator supplies.

### ATTRIBUTES

-   `resourceId`: `unique uuid`:<br/>
    Identifier of the owning resource,
    **BECAUSE** the parameter belongs to exactly one resource.

-   `providerId`: `unique string`:<br/>
    Provider identifier from the configuration file,
    **BECAUSE** the parameter is scoped to one provider.

-   `key`: `unique string`:<br/>
    Parameter key defined in the configuration file,
    **BECAUSE** each provider parameter is identified by its key.

-   `value`: `string`:<br/>
    Value the administrator entered for the key,
    **BECAUSE** the concrete endpoint requires the supplied value.

##  ENTITY: `Role` <a id="SPEC-DM-role"></a>

A grant of special rights to a specific user within an event,
**BECAUSE** the application is role-based and rights are granted through roles.

### ATTRIBUTES

-   `roleId`: `unique uuid`:<br/>
    Unique identifier of the role,
    **BECAUSE** it is referenced as a foreign key.

-   `type`: `enum(Manager,Moderator,Presenter)`:<br/>
    The role granted to the person for the event,
    **BECAUSE** each role carries a distinct set of rights.

-   `email`: `string`:<br/>
    Email address of the authorized person,
    **BECAUSE** roles are granted by email without permanent accounts.

##  ENTITY: `User` <a id="SPEC-DM-user"></a>

A helper entity enabling event-based logins for invited or pattern-matched attendees,
**BECAUSE** the system holds no permanent accounts yet must identify attendees per event.

### ATTRIBUTES

-   `userId`: `unique uuid`:<br/>
    Unique identifier of the user,
    **BECAUSE** it is referenced as a foreign key.

-   `email`: `string`:<br/>
    Concrete email address of the user,
    **BECAUSE** authorization tokens are sent to this address at login.

-   `firstname`: `string`:<br/>
    Optional first name of the user,
    **BECAUSE** it is displayed on the user's chat and question messages.

-   `lastname`: `string`:<br/>
    Optional last name of the user,
    **BECAUSE** it is displayed on the user's chat and question messages.

### RELATIONS

-   `likes`: [`Message`](#SPEC-DM-message)(`0..n`):<br/>
    Messages the user marked as liked,
    **BECAUSE** likes are tracked per user until anonymization.

-   `sentMessages`: [`Message`](#SPEC-DM-message)(`0..n`):<br/>
    Messages the user has sent,
    **BECAUSE** authorship links a message to its sending user.

-   `statistics`: [`UserStatistic`](#SPEC-DM-userstatistic)(`0..n`):<br/>
    Periodic statistics about the user,
    **BECAUSE** viewer information is captured per user over time.

##  ENTITY: `Message` <a id="SPEC-DM-message"></a>

A single chat, support, or question item tracked for attendees and moderators,
**BECAUSE** all event interaction is represented uniformly as messages with language-specific texts.

### ATTRIBUTES

-   `messageId`: `unique uuid`:<br/>
    Unique identifier of the message,
    **BECAUSE** it is the foreign key for the translated message texts.

-   `type`: `enum(Chat,Support,Question)`:<br/>
    The kind of message,
    **BECAUSE** each type has a distinct lifecycle and visibility.

-   `timestamp`: `datetime`:<br/>
    Time the sender created the message,
    **BECAUSE** ordering and export require the creation time.

-   `timestampAnswered`: `datetime`:<br/>
    Time the message was answered,
    **BECAUSE** the presenter records when a question was answered.

-   `state`: `enum(pending,accepted,rejected,forwarded,answered,suspended)`:<br/>
    Moderation and processing state of the message,
    **BECAUSE** the message moves through a defined moderation and presentation lifecycle.

-   `originalLanguage`: `string`:<br/>
    Language the sender originally wrote the message in,
    **BECAUSE** the difference between human-written and AI-translated text must always be visible.

-   `senderName`: `string`:<br/>
    Display name shown to others for the sender,
    **BECAUSE** the visible name depends on event naming and anonymity options.

-   `presenterAnnotation`: `string`:<br/>
    Hint a moderator attaches for the presenter on forwarding,
    **BECAUSE** the presenter benefits from routing guidance on a forwarded message.

-   `likes`: `integer`:<br/>
    Computed number of likes conserved on event finish,
    **BECAUSE** the like total must survive removal of liker relations for GDPR.

-   `sentimentScore`: `float`:<br/>
    Server-side sentiment score between -1 and 1,
    **BECAUSE** the analysis result is stored for display and auto-moderation.

-   `edited`: `enum(none,insignificant,significant,deleted)`:<br/>
    Whether and how the message was changed or deleted,
    **BECAUSE** edits must be marked for others and edits stop once forwarded.

### RELATIONS

-   `sender`: [`User`](#SPEC-DM-user)(`0..1`):<br/>
    The authoring attendee of the message,
    **BECAUSE** a message has an author until the sender is removed on finish.

-   `liker`: [`User`](#SPEC-DM-user)(`0..n`):<br/>
    Attendees who liked the message,
    **BECAUSE** likes are tracked per liking user before anonymization.

-   `event`: [`Event`](#SPEC-DM-event)(`1`):<br/>
    The event the message belongs to,
    **BECAUSE** the event link must persist even after senders are deleted.

-   `replyTo`: [`Message`](#SPEC-DM-message)(`0..1`):<br/>
    The message this message replies to,
    **BECAUSE** chat replies and moderator answers chain messages together.

-   `predecessor`: [`Message`](#SPEC-DM-message)(`0..1`):<br/>
    The preceding message in a manual ordering,
    **BECAUSE** moderators sort forwarded messages for the presenter.

-   `questionTags`: [`QuestionTag`](#SPEC-DM-questiontag)(`0..n`):<br/>
    Tags attached to a question message,
    **BECAUSE** questions can be tagged with zero or more tags for context.

-   `messageText`: [`MessageText`](#SPEC-DM-message)(`1..n`):<br/>
    The message texts of this message,
    **BECAUSE** each message text can be translated to multiple languages.

##  ENTITY: `MessageText` <a id="SPEC-DM-messagetext"></a>

A language-specific text of a message,
**BECAUSE** a message is translated into multiple languages while retaining one original.

### ATTRIBUTES

-   `messageTextId`: `unique uuid`:<br/>
    Unique identifier of the message text,
    **BECAUSE** it is referenced as a foreign key.

-   `language`: `string`:<br/>
    Language the text is written in,
    **BECAUSE** each text variant is identified by its language.

-   `text`: `string`:<br/>
    The message text in the stated language,
    **BECAUSE** the displayed content depends on the chosen language.

### RELATIONS

##  ENTITY: `QuestionTag` <a id="SPEC-DM-questiontag"></a>

A named tag attachable to question messages,
**BECAUSE** questions are categorized by topic or addressed person for routing and grouping.

### ATTRIBUTES

-   `questionTagId`: `unique uuid`:<br/>
    Unique identifier of the question tag,
    **BECAUSE** it is referenced as a foreign key.

-   `text`: `unique string`:<br/>
    Unique tag name,
    **BECAUSE** tags are identified and displayed by their name.

-   `moderatorOnly`: `boolean`:<br/>
    Whether only a Moderator or Manager may use the tag,
    **BECAUSE** some tags are reserved for the moderation team.

-   `group`: `string`:<br/>
    Logical group the tag belongs to such as a topic or person,
    **BECAUSE** tags are organized into meaningful groups.

##  ENTITY: `AuthorizationToken` <a id="SPEC-DM-authtoken"></a>

A one-time second factor proving an attendee controls the email address used as first factor,
**BECAUSE** email-verified access is the core mechanism limiting the audience.

### ATTRIBUTES

-   `token`: `string`:<br/>
    The generated one-time token for the next login attempt,
    **BECAUSE** the attendee proves control of the email by returning this token.

-   `validUntil`: `datetime`:<br/>
    Expiry time of the token, unset for pre-generated tokens,
    **BECAUSE** ordinary tokens expire within minutes while pre-generated ones last until event end.

-   `state`: `enum(issued,sent,used)`:<br/>
    Lifecycle state of the token,
    **BECAUSE** debugging statistics and anonymized sums need the token state.

### RELATIONS

-   `user`: [`User`](#SPEC-DM-user)(`1`):<br/>
    The user the token was issued for,
    **BECAUSE** a token authorizes exactly one user.

-   `event`: [`Event`](#SPEC-DM-event)(`1`):<br/>
    The event the token was issued for,
    **BECAUSE** a token grants access to exactly one event.

##  ENTITY: `SessionToken` <a id="SPEC-DM-sessiontoken"></a>

The result of a successful login of a user to an event,
**BECAUSE** an active session must be tracked to enforce single concurrent access.

### ATTRIBUTES

-   `sessionId`: `unique uuid`:<br/>
    Unique identifier of the session,
    **BECAUSE** the active session of a user for an event must be addressable.

-   `issuedAt`: `datetime`:<br/>
    Time the user successfully entered the event,
    **BECAUSE** the session start time is recorded for tracking.

### RELATIONS

-   `user`: [`User`](#SPEC-DM-user)(`1`):<br/>
    The user the session was issued for,
    **BECAUSE** a session belongs to exactly one user.

-   `event`: [`Event`](#SPEC-DM-event)(`1`):<br/>
    The event the session was issued for,
    **BECAUSE** a session grants access to exactly one event.

##  ENTITY: `EventStatistic` <a id="SPEC-DM-eventstatistic"></a>

A periodic cumulative snapshot of event-wide counts,
**BECAUSE** trend visualization of audience size and authentication flow requires regular snapshots.

### ATTRIBUTES

-   `eventStatisticId`: `unique uuid`:<br/>
    Unique identifier of the event statistic,
    **BECAUSE** it is referenced as a foreign key.

-   `timestamp`: `datetime`:<br/>
    Time the snapshot was created,
    **BECAUSE** statistics are plotted over time.

-   `numberOfIssuedAuthTokens`: `integer`:<br/>
    Count of issued authorization tokens at the timestamp,
    **BECAUSE** debugging statistics track issued tokens.

-   `numberOfSentAuthTokens`: `integer`:<br/>
    Count of sent authorization tokens at the timestamp,
    **BECAUSE** debugging statistics track sent tokens.

-   `numberOfUsedAuthTokens`: `integer`:<br/>
    Count of used authorization tokens at the timestamp,
    **BECAUSE** debugging statistics track used tokens.

-   `numberOfSessionTokens`: `integer`:<br/>
    Count of session tokens at the timestamp,
    **BECAUSE** logged-in users are derived from session tokens.

-   `numberOfConnections`: `integer`:<br/>
    Count of active MQTT connections at the timestamp,
    **BECAUSE** active viewers differ from sessions once an attendee leaves.

##  ENTITY: `ChannelStatistic` <a id="SPEC-DM-channelstatistic"></a>

A periodic count of viewers for a channel,
**BECAUSE** organizers need per-channel popularity over time.

### ATTRIBUTES

-   `channelStatisticId`: `unique uuid`:<br/>
    Unique identifier of the channel statistic,
    **BECAUSE** it is referenced as a foreign key.

-   `timestamp`: `datetime`:<br/>
    Time the snapshot was created,
    **BECAUSE** channel statistics are plotted over time.

-   `numberOfViewers`: `integer`:<br/>
    Count of viewers of the channel at the timestamp,
    **BECAUSE** the per-channel viewer count is the tracked metric.

##  ENTITY: `UserStatistic` <a id="SPEC-DM-userstatistic"></a>

Tracked viewer information about a user,
**BECAUSE** audience composition informs reporting and default localization.

### ATTRIBUTES

-   `userStatisticId`: `unique uuid`:<br/>
    Unique identifier of the user statistic,
    **BECAUSE** it is referenced as a foreign key.

-   `timestamp`: `datetime`:<br/>
    Time the snapshot was created,
    **BECAUSE** user statistics are recorded over time.

-   `country`: `string`:<br/>
    ISO country code from GeoIP tracking,
    **BECAUSE** country selects the default application language on first use.

-   `browserType`: `string`:<br/>
    Type of browser used,
    **BECAUSE** browser distribution informs compatibility decisions.

-   `deviceType`: `string`:<br/>
    Type of device used,
    **BECAUSE** device distribution informs responsive design priorities.

-   `viewportWidth`: `integer`:<br/>
    Width in pixels of the browser viewport,
    **BECAUSE** viewport sizing informs layout decisions.

-   `viewportHeight`: `integer`:<br/>
    Height in pixels of the browser viewport,
    **BECAUSE** viewport sizing informs layout decisions.
