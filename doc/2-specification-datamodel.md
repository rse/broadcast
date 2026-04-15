The data model is event centric. It defines the data model as followed:

![data model overview](./2-specification-datamodel.svg "data model overview").

### Entity Event

An event is the master entity.

It defines the following attributes:

| attribute                    | description                                                                                                                                                                                                                                                                                                                                                 |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| eventId                      | Unique ID of an event. It is part of the URL in order to access a specific event by HTML-links.                                                                                                                                                                                                                                                             |
| title                        | A display title for the event e.g. "Townhall 1/23".                                                                                                                                                                                                                                                                                                         |
| description                  | An information to describe the event.                                                                                                                                                                                                                                                                                                                       |
| language                     | The targeted language of the event. It should state the events mothers language - beside the possibility to translate chats and questions on the fly and the fact that video streams might have a different speech translation.                                                                                                                             |
| begin                        | The planned starting time and date of the event.                                                                                                                                                                                                                                                                                                            |
| end                          | The planned ending time and date of the event.                                                                                                                                                                                                                                                                                                              |
| state                        | The state of the event. Newly created events are in state _planning_ and are not visible for attendees. The _published_ state lets attendees see the event already, yet it is not started. The state _running_ represents an event currently held where attendees can attend. A _finished_ event was held and further access is not possible for attendees. |
| loginInfo                    | An attendee will get this HTML-Markup as additional text when attending an event. The event manager can provide more information about the event including HTML links and other useful content.                                                                                                                                                             |
| loginInfoToBeAccepted        | Whether the login information has to be explicitly accepted to continue.                                                                                                                                                                                                                                                                                    |
| interactionInfo              | Event attendees will get this additional information when attending an event where interaction is enabled (either chat or questions). Writing chats or questions could get additional HTML-Markup e.g. for text moderation rules or a code of conduct.                                                                                                      |
| interactionInfoToBeAccepted  | Whether the interaction information has to be explicitly accepted to continue.                                                                                                                                                                                                                                                                              |
| allowAccessAnonymous         | An event might accept anonymous attendees. In that case attendees can access the event without authorization.                                                                                                                                                                                                                                               |
| accessEmailPattern           | Beside the ___accessList___-Relation an event can grant anyone access to an event when his given email matches this pattern.                                                                                                                                                                                                                                |
| chatEnabled                  | The event allows attendees to send chat messages.                                                                                                                                                                                                                                                                                                           |
| chatAllowAnonymous           | The event allows attendees to send chat messages as 'Anonymous'.                                                                                                                                                                                                                                                                                            |
| chatName                     | An attendees name is visible at his chat messages for others. The name can be _full_ displaying a proper "Firstname Lastname" syntax on chat messages. The _firstname_ represents only the corresponding value displayed at the message while _anonymous_ does not show the name to others but "Anonymous" instead.                                         |
| chatReply                    | Chat messages might be replied by other attendees.                                                                                                                                                                                                                                                                                                          |
| chatThrottling               | Chat messages might be restricted to a specific amount per user per minute in order to avoid denial of service attacks.                                                                                                                                                                                                                                     |
| chatModerator                | Event chat messages will be moderated by a "Moderator" role before being visible to the audience. Having this option set to "false" will set Entity `Message` directly into state _accepted_ when sent from an attendee.                                                                                                                                    |
| supportEnabled               | The event allows attendees to have the possibility to chat with a support (a special type of chat message), if he has some technical problems.                                                                                                                                                                                                              |
| appEnabled                   | It is possible to integrate a third-party application.                                                                                                                                                                                                                                                                                                      |
| appTitle                     | The title of the third-party application, that is displayed the user.                                                                                                                                                                                                                                                                                       |
| appURL                       | The URL of the third-party application.                                                                                                                                                                                                                                                                                                                     |
| appAdminURL                  | The URL of the third-party application for admin and control access                                                                                                                                                                                                                                                                                         |
| presenterHint                | A "Moderator" can add a hint for the presenter.                                                                                                                                                                                                                                                                                                             |
| presenterHintState           | A "Moderator" can set the __presenterHint__ active (_raced_), then the __presenterHint__ is visible for the "Presenter", or he can deactivate (_unraced_) it, then it is not visible to the "Presenter". The "Presenter" also can confirm the hint (_unraced_).                                                                                             |
| questionsEnabled             | The event allows attendees to ask questions (a special type of chat message).                                                                                                                                                                                                                                                                               |
| questionsAllowAnonymous      | The event allows attendees to send questions as 'Anonymous'.                                                                                                                                                                                                                                                                                                |
| questionsName                | An attendees name is visible at his questions for others. The name can be _full_ displaying a proper "Firstname Lastname" syntax on questions. The _firstname_ represents only the corresponding value displayed at the question while  _anonymous_ does not show the name to others but "Anonymous" instead.                                               |
| questionsThrottling          | Questions might be restricted to a specific amount per user per time in order to avoid denial of service attacks.                                                                                                                                                                                                                                           |
| questionsPrivate             | Event questions should not be displayed to other attendees. Only the "Moderator" will get the those.                                                                                                                                                                                                                                                        |
| questionsModerator           | Event questions will be moderated by a "Moderator" role before they will be visible to the audience.                                                                                                                                                                                                                                                        |
| expireAuthTokenOnFirstUse    | Entity `AuthorizationToken` can be generated on event creation. Events can configure if those `AuthorizationToken` expire after first use. This would support one time tokens from the start with a normal authorization process (token generation and validation) after the first use.                                                                     |
| sentimentSenderAnalysis      | This toggle enables or disables client side sentiment analysis (light weighted)                                                                                                                                                                                                                                                                             |
| sentimentSenderAutoPrevent   | In case the client side sentiment analysis is enabled and a check would document an improper input - the submission of that input could be prevented by default.                                                                                                                                                                                            |
| sentimentModeratorAnalysis   | This toggle enables or disables server side sentiment analysis (full blown)                                                                                                                                                                                                                                                                                 |
| sentimentModeratorAutoAccept | In case the server side sentiment analysis is enabled, "Moderators" could be supported by auto accepting proper input without an interaction from the "Moderator".                                                                                                                                                                                          |
| sentimentModeratorAutoReject | In case the server side sentiment analysis is enabled, "Moderators" could be supported by auto rejecting improper input without an interaction from the "Moderator".                                                                                                                                                                                        |

It defines the following relations:

| relation              | description                                                                                                             |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------|
| channels              | A list of all language specific content distributors e.g. 3Q, YouTube, Twitch. (see Entity `Stream`)                    |
| roles                 | A list of all "Manager", "Presenter", "Moderator" and "Administrator" roles for the specific event. (see Entity `Role`) |
| accessList            | A list of all invited attendees identified by their email. (see Entity `User`)                                          |
| messages              | A list of all messages written by attendees during an event. (see Entity `Message`)                                     |
| statistics            | A list of all event statistics that will be created periodically when an event started until it finishes.               |
| availableQuestionTags | A list of all tags available for use on questions.                                                                      |
| activeAgendaPoint     | Currently active Agenda Point.                                                                                          |
| agendaPoints          | A list of all Agenda Points for the Event.                                                                              |

### Entity AgendaPoint

A `AgendaPoint` is the textual description of the current phase in an `Event`.

It defines the following attributes:

| attribute     | description                                   |
|---------------|-----------------------------------------------|
| agendaPointId | A unique agenda point id used as foreign key. |
| text          | description of the current phase of the Event |
| orderPosition | the ordering of the phases                    |

It defines the following relations:

| relation         | description                                                                                                                                   |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| corresondingTags | A list of all `QuestionTag`s corresponding to the `AgendaPoint`s, potentially used for tagging questions (`Message` with __type__ _Question_) |

### Entity Channel

A `Channel` is responsible for mapping logical content delivery video streams and linking them to an event.

It defines the following attributes:

| attribute | description                                                                                                |
|-----------|------------------------------------------------------------------------------------------------------------|
| channelId | A unique channel id used as foreign key.                                                                   |
| name      | A display name for the channel e.g. "Digital Townhall" or "Filmstudio SpyCams"                             |
| active    | A Flag, if the `Channel` is the current active one. Only ONE `Channel` of the event can be active at once. |
| default   | Whether this channel is activated by default when entering an event                                        |

Entity `Channel` has the following relations.

| relation   | description                                                                                                                                                           |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| resources  | A list of all `Resource`s for the channel. This could either be a video stream or a static website, e.g. pdf slides for a training                                    |
| statistics | A list of all `ChannelStatistics`s that will be created periodically when an event started until it finishes, e.g. number of users that have selected this `Channel`. |

### Entity Resource

A `Resource` is responsible for mapping physical content delivery resources and linking them to a channel.

It defines the following attributes:

| attribute  | description                                                                                                                     |
|------------|---------------------------------------------------------------------------------------------------------------------------------|
| resourceId | A unique resource id used as foreign key.                                                                                       |
| providerId | A unique provider id that comes from the configuration file of the event.                                                       |
| active     | A Flag, if the `Resource` is the active `Resource` of the `Channel`. Only ONE `Resource` of a  `Channel` can be active at once. |

Entity `Resource` has the following relations.

| relation | description                                                                                                                                                    |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| params   | A list of all `ResourceProviderParam`s (key value pairs that comes from the configuration file of the event), that are assigned to the corresponding `Channel` |

### Entity ResourceProviderParam

A `ResourceProviderParam` is a key value pair that is defined in the configuration file of the event and belongs exactly
to one `Resource` and one provider (___providerId___). The ___providerId___ is defined in the configuration file of the
event as well.

It defines the following attributes:

| attribute  | description                                                                                       |
|------------|---------------------------------------------------------------------------------------------------|
| resourceId | A unique id from the corresponding `Resource`.                                                    |
| providerId | A unique provider id that comes from the configuration file of the event.                         |
| key        | The param key corresponding to the `Resource` that comes from the configuration file of the event |
| value      | The value, the user ("Administrator") entered for the __key__.                                    |

Entity `ResourceProviderParam` has no further relations.

### Entity Role

A `Role` gives a specific user special rights in the application. See the Role Management section for further detail on
the roles.

It defines the following attributes:

| attribute | description                                                                                                      |
|-----------|------------------------------------------------------------------------------------------------------------------|
| roleId    | A unique role id used as foreign key.                                                                            |
| type      | Defines the proper role for the person. The following roles can be set: "Manager" and "Moderator" for the event. |
| email     | Is a string with the email address of the authorized person.                                                     |

Entity `Role` has no further relations.

### Entity User

A `User` is a helper entity in order to enable event based logins. Users must be added to an events ___accessList___ in
order to
access a specific event. \
In case that the event defined a ___accessEmailPattern___ new Users can be generated during login process. This way the
initial ___accessList___ of an event can be pre-filled but does not have to.

It defines the following attributes:

| attribute | description                                                                                                                           |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------|
| userId    | A unique user id used as foreign key.                                                                                                 |
| email     | The users concrete email address. It is used to send users authorization tokens by email at login attempts.                           |
| firstname | The users firstname is optional and will be used for display reasons in case the users use chat or question features during an event. |
| lastname  | The users lastname is optional and will be used for display reasons in case the users use chat or question features during an event.  |

It defines the following relations:

| relation     | description                                                                                              |
|--------------|----------------------------------------------------------------------------------------------------------|
| likes        | A list of all event messages that the user marked as "like".                                             |
| sentMessages | A list of all messages that the user has sent.                                                           |
| statistics   | A list of all user statistics that will be created periodically when an event started until it finishes. |

### Entity Message

A `Message` entity is used to track all messages of "Attendees" and "Moderators". Note that the specific message text is
language specific and will be translated into other languages (currently "de" and "en"). See Entity `MessageText` for
further details.

It defines the following attributes:

| attribute         | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| messageId         | A unique message id used as foreign key for the translated MessageTexts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| type              | A message can either be a _Chat_ message, a _Support_ message, or a _Question_. The private type can only be used by "Moderators" when replying _Chats_ or _Questions_ as a way to answer the original message sender.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| timestamp         | The timestamp of the message when the sender sent it into the system (when it was created, not when it was accepted on anything else).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| timestampAnswered | The timestamp of the message when the message was answered (the __state__ was set to _answered_).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| state             | A message has different states. It is _pending_ when a sender sents his message to the system, if a "Moderator" sents a message, it is automatically _accepted_. A "Moderator" can then set the message of a user to _accepted_ or _rejected_. Rejected messages will be deleted entirely on event finish. Accepted messages will be visible to (and can be liked by) the "Attendee" if configured. "Moderators" can also move _accepted_ messages to a "Presenter" by setting the state to _forwarded_. The "Presenter" can mark messages for him as _answered_ or _suspended_ if he answered the message or will not process it in the live event. Message of ___type___ _Question_ has all states, Message of ___type___ _Chat_ has only _pending_, _accepted_, _rejected_ and Message of ___type___ _Support_ has only _accepted_. |
| originalLanguage  | The sender of a message entered a message in a specific language. We store that language in order to notice the difference between human written and ai generated messages. This difference should be visible to everyone at any time.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| senderName        | This is the message senders name that should be displayed for others. Messages sent by "Moderators" will be displayed with a different name ("Moderator") instead of the configured event naming pattern (see ___chatName___ and ___questionsName___ as well as ___chatAllowAnonymous___ and ___questionsAllowAnonymous___ in Entity `Event`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| presenterHint     | A "Moderator" can add a hint for the presenter when he sets the state to _forwarded_. This hint should help the presenter with processing the message in the live event. An example could be: a hint to which live event attendee the question should be directed to.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| likes             | The number of likes will be calculated on event finish. Due to GDPR reasons the likers will be removed at the end and the number of likes will be stored as number and are conservated this way.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| sentimentScore    | If sentiment analysis is enabled on server side, the result of the analysis is stored and can be used for displaying reasons. We expect the score to be a floating point between -1 and 1 where all scores below -0.1 are considered as improper.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| edited            | Indicates wether the message is still original (_none_) or was changed (_insignificant_, _significant_) or deleted (_deleted_). If message was set to state _forwarded_, it is no longer possible to edit or delete it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

It defines the following relations:

| relation     | description                                                                                                                                                                                                                                                         |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sender       | The sender of a message is the author and must be an event "Attendee".                                                                                                                                                                                              |
| liker        | Each event "Attendee" can like messages of others. Likes can be canceled as well.                                                                                                                                                                                   |
| event        | The message is directly related to the specific event. It is necessary to keep track of this because the senders will be deleted for GDPR reasons when the event is finished.                                                                                       |
| replyTo      | A `Message` can be a reply to another message. Typically messages of ___type___ _Chat_ can be replies to other chat messages. In special cases a "Moderator" can reply to any message and he might also only reply visible to the sender (see ___type___ _Support_) |
| predecessor  | A `Message` can have another message as predecessor. Typically this is use for sorting messages manually, done by a "Moderator" . Typically this is only used for `Message`s with  __state__ _forwarded_                                                            |
| questionTags | `Message`s of __type__ _Question_ can be tagged with zero or more tags.                                                                                                                                                                                             |

### Entity MessageText

A `MessageText` is a language specific text of a `Message` Entity.

It defines the following attributes:

| attribute     | description                                                                                                                                               |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| messageTextId | A unique message text id used as foreign key.                                                                                                             |
| language      | This field states the language the text of the message is in.                                                                                             |
| text          | This is the text of the message in the stated language. Hint: see ___originalLanguage___ in entity `Message` to determine the user written original text. |

It defines the following relations:

| relation | description                                        |
|----------|----------------------------------------------------|
| message  | A `MessageText` is related to its `Message` entity |

### Entity QuestionTag

A `QuestionTag` is a string attached to a `Message` Entity. This is only possible if the `Message` Entity has the __type
__ _Question_.

It defines the following attributes:

| attribute     | description                                                          |
|---------------|----------------------------------------------------------------------|
| questionTagId | A unique question tag id used as foreign key.                        |
| text          | A unique tag name                                                    |
| moderatorOnly | Whether this tag can be used by a "Moderator" or "Manager" role only |
| group         | Logical group this tag belongs to.                                   |

Entity `QuestionTag` has no further relations.

### Entity AuthorizationToken

An authorization token is a simple second factor to ensure that the attendee of an event is in access of the email
address as first factor. Being invited to an event (see relation ___accessList___ in entity `Event`) allows the proper
email
address to receive a generated one time token.
Using this correct token as a one time password grants access to the event. \
An `AuthorizationToken` can be pre-generated on event creation.

It defines the following attributes:

| attribute  | description                                                                                                                                                                                                                                                                                                                                  |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| token      | The generated one time token for the next login attempt. In special cases this token is pre-generated and might not be invalidated on first use.                                                                                                                                                                                             |
| validUntil | The generated token wont last forever. By default a login must be completed within 5 minutes. Pre-generated tokens last until event ends and have ___validUntil___ not set. If the attribute ___expireAuthTokenOnFirstUse___ in entity `Event` is set to "false" the token never expires.                                                    |
| state      | Issued tokens have a proper state to ensure some debugging options and anonymous data sums. A token is _issued_ when he got created during event creation. _sent_ is set by the system when a token got sent to the user by email. The state _used_ is the final state when a token got used for a successful or unsuccessful login attempt. |

It defines the following relations:

| relation | description                         |
|----------|-------------------------------------|
| user     | The user  the token was issued for. |
| event    | The event the token was issued for. |

### Entity SessionToken

A session token is the result of a successful login of a user to an event.

It defines the following attributes:

| attribute | description                                                 |
|-----------|-------------------------------------------------------------|
| sessionId | A unique identifier for the session of a user for an event. |
| issuedAt  | The timestamp the user successfully entered the event.      |

It defines the following relations:

| relation | description                           |
|----------|---------------------------------------|
| user     | The user  the session was issued for. |
| event    | The event the session was issued for. |

### Entity EventStatistic

An event generates periodically cumulated statics when the event started until it gets finished. Plan is to create each
five minutes a snapshot of the number counts.

An `EventStatistic` defines the following attributes:

| attribute                | description                                                                                                                                                                                                                                         |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| eventStatisticId         | A unique event statistic id used as foreign key.                                                                                                                                                                                                    |
| timestamp                | The unique timestamp when this `EventStatistic` was created.                                                                                                                                                                                        |
| numberOfIssuedAuthTokens | A bare count of the number of `AuthorizationTokens` of ___type___ _issued_ of the event at the given ___timestamp___.                                                                                                                               |
| numberOfSentAuthTokens   | A bare count of the number of `AuthorizationTokens` of ___type___ _sent_ of the event at the given ___timestamp___.                                                                                                                                 |
| numberOfUsedAuthTokens   | A bare count of the number of `AuthorizationTokens` of ___type___ _used_ of the event at the given ___timestamp___.                                                                                                                                 |
| numberOfSessionTokens    | A bare count of the number of `SessionTokens` of the event at the given ___timestamp___.                                                                                                                                                            |
| numberOfConnections      | A bare count of the number of active mqtt sessions of the event at the given ___timestamp___. The difference between the session and mqtt is the activity when an attendee leaves the event, he still has a session but no mqtt connection anymore. |

Entity `EventStatistic` has no further relations.

### Entity ChannelStatistic

A `ChannelStatistic` is responsible for presenting bare counts of viewers for the related entity `Channel`.

It defines the following attributes:

| attribute          | description                                                                                                |
|--------------------|------------------------------------------------------------------------------------------------------------|
| channelStatisticId | A unique channel statistic id used as foreign key.                                                         |
| timestamp          | The unique timestamp when this `ChannelStatistic` was created.                                             |
| numberOfViewers    | A bare count of the number of viewers of the concrete `Channel` of the event at the given ___timestamp___. |

Entity `ChannelStatistic` has no further relations.

### Entity UserStatistic

A `UserStatistic` is responsible for tracking information about the related entity `User`.

It defines the following attributes:

| attribute       | description                                                 |
|-----------------|-------------------------------------------------------------|
| userStatisticId | A unique user statistic id used as foreign key.             |
| timestamp       | The unique timestamp when this `UserStatistic` was created. |
| country         | ISO country code from GeoIP based tracking.                 |
| browserType     | Type of browser (e.g. Edge, Firefox, Safari, etc).          |
| deviceType      | Type of device (e.g. Desktop, Tablet, Mobile).              |
| viewportWidth   | Width in pixels of the browser viewport.                    |
| viewportHeight  | Height in pixels of the browser viewport.                   |

Entity `UserStatistic` has no further relations.

