
Specification
=============

Data Model
----------

The data model is event centric. It defines the data model as followed:

![data model overview](./2-specification-datamodel.svg "data model overview").

### Entity Event

An event is the master entity.

It defines the following attributes:

| attribute                    | description                                                                                                                                                                                                                                                                                                                                                           |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| eventId                      | Unique ID of an event. It is part of the URL in order to access a specific event by HTML-links.                                                                                                                                                                                                                                                                       |
| name                         | A display name for the event e.g. "Townhall 1/23".                                                                                                                                                                                                                                                                                                                    |
| description                  | An information to describe the event.                                                                                                                                                                                                                                                                                                                    |
| language                     | The targeted language of the event. It should state the events mothers language - beside the possibility to translate chats and questions on the fly and the fact that video streams might have a different speech translation.                                                                                                                                       |
| begin                        | The planned starting time and date of the event.                                                                                                                                                                                                                                                                                                                      |
| end                          | The planned ending time and date of the event.                                                                                                                                                                                                                                                                                                                        |
| state                        | The state of the event. Newly created events are in state ___planning___ and are not visible for attendees. The ___published___ state lets attendees see the event already, yet it is not started. The state ___running___ represents an event currently held where attendees can attend. A ___finished___ event was held and further access is not possible for attendees. |
| loginInfo                    | An attendee will get this HTML-Markup as additional text when attending an event. The event manager can provide more information about the event including HTML links and other useful content.                                                                                                                                                                       |
| loginInfoToBeAccepted        | Whether the login information has to be explicity accepted to continue.                                                                                                                                                             |
| interactionInfo              | Event attendees will get this additional information when attending an event where interaction is enabled (either chat or questions). Writing chats or questions could get additional HTML-Markup e.g. for text moderation rules or a code of conduct.                                                                                                                |
| interactionInfoToBeAccepted  | Whether the interaction information has to be explicity accepted to continue.                       |
| activeProvider               | An event can have different channels and tracks. A track belongs to a provider. Providers are a good way to manage different content deliveries. In case a CDN encounters problems - the "Manager" can switch to a different provider as a fallback. Attendees should be routed to the correct tracks of providers on change.  |
| allowAccessAnonymous         | An event might accept anonymous attendees. In that case attendees can access the event without authorization.                                                                                                                                                                                                                                                         |
| accessEmailPattern           | Beside the accessList-Relation an event can grant anyone access to an event when his given email matches this pattern.                                                                                                                                                                                                                                                |
| chatEnabled                  | The event allows attendees to send chat messages.                                                                                                                                                                                                                                                                                                                     |
| chatAllowAnonymous           | The event allows attendees to send chat messages as 'Anonymous'.                                                                                                                                                                                                                                                                                                      |
| chatName                     | An attendees name is visible at his chat messages for others. The name can be ___full___ displaying a proper "Firstname Lastname" syntax on chat messages. The ___firstname___ represents only the corresponding value displayed at the message while ___anonymous___ does not show the name to others but "Anonymous" instead.                                        |
| chatReply                    | Chat messages might be replied by other attendees.                                                                                                                                                                                                                                                                                                                    |
| chatThrottling               | Chat messages might be restricted to a specific amount per user per minute in order to avoid denial of service attacks.                                                                                                                                                                                                                                               |
| chatModerator                | Event chat messages will be moderated by a "Moderator" role before being visible to the audience. Having this option set to "false" will set Entity _Messages_ directly into state ___accepted___ when sent from an attendee.                                                                                                                                         |
| questionsEnabled             | The event allows attendees to ask questions (a special type of chat message).                                                                                                                                                                                                                                                                                         |
| questionsAllowAnonymous      | The event allows attendees to send questions as 'Anonymous'.                                                                                                                                                                                                                                                                                                          |
| questionsName                | An attendees name is visible at his questions for others. The name can be ___full___ displaying a proper "Firstname Lastname" syntax on questions. The ___firstname___ represents only the corresponding value displayed at the question while  ___anonymous___ does not show the name to others but "Anonymous" instead.                                              |
| questionsThrottling          | Questions might be restricted to a specific amount per user per time in order to avoid denial of service attacks.                                                                                                                                                                                                                                                     |
| questionsPrivate             | Event questions should not be displayed to other attendees. Only the "Moderator" will get the those.                                                                                                                                                                                                                                                        |
| questionsModerator           | Event questions will be moderated by a "Moderator" role before they will be visible to the audience.                                                                                                                                                                                                                                                                  |
| expireAuthTokenOnFirstUse    | Entity _AuthTokens_ can be generated on event creation. Events can configure if those AuthTokens expire after first use. This would support one time tokens from the start with a normal authorization process (token generation and validation) after the first use.                                                                                                 |
| sentimentSenderAnalysis      | This toggle enables or disables client side sentiment analysis (light weighted)                                                                                                                                                                                                                                                                                       |
| sentimentSenderAutoPrevent   | In case the client side sentiment analysis is enabled and a check would document an improper input - the submission of that input could be prevented by default.                                                                                                                                                                                                      |
| sentimentModeratorAnalysis   | This toggle enables or disables server side sentiment analysis (full blown)                                                                                                                                                                                                                                                                                           |
| sentimentModeratorAutoAccept | In case the server side sentiment analysis is enabled, "Moderators" could be supported by auto accepting proper input without an interaction from the "Moderator".                                                                                                                                                                                                    |
| sentimentModeratorAutoReject | In case the server side sentiment analysis is enabled, "Moderators" could be supported by auto rejecting improper input without an interaction from the "Moderator".                                                                                                                                                                                                  |

It defines the following relations:

| relation   | description                                                                                                          |
|------------|----------------------------------------------------------------------------------------------------------------------|
| streams    | A list of all language specific content distributors e.g. 3Q, YouTube, Twitch. (see Entity _Stream_)                 |
| roles      | A list of all "Manager", "Presenter", "Moderator" and "Administrator" roles for the specific event. (see Entity _Role_) |
| accessList | A list of all invited attendees identified by their email. (see Entity _User_)                                       |
| messages   | A list of all messages written by attendees during an event. (see Entity _Message_)                                  |
| statistics | A list of all event statistics that will be created periodically when an event started until it finishes.            |
| availableQuestionTags | A list of all tags available for use on questions. |

### Entity Channel

A Channel is responsible for mapping logical content delivery video streams and linking them to an event.

It defines the following attributes:

| attribute         | description                                                                                                                                                       |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| channelId          | A unique channel id used as foreign key.                                                                                                                           |
| name              | A display name for the channel e.g. "Digital Townhall" or "Filmstudio SpyCams" |
| default           | Whether this channel is activated by default when entering an event |

Entity _Channel_ has the following relations.

| relation   | description                                                                                                |
|------------|------------------------------------------------------------------------------------------------------------|
| tracks | A list of all tracks for the channel. |

### Entity Track

A Track is responsible for mapping physical content delivery video streams and linking them to a channel.

It defines the following attributes:

| attribute         | description                                                                                                                                                       |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| trackId          | A unique track id used as foreign key.                                                                                                                           |
| provider          | Name of the externally defined provider. The combination of provider and track name has to be unique.                                                                                                                          |
| name              | A display name for the track e.g. "DE" or "DE mit UT" |
| streamURL         | The URL of the underlying video stream at the provider. |
| default           | Whether this track is activated by default when entering an event within the channel. Should be "true" for a provider only once. |

Entity _Track_ has the following relations.

| relation   | description                                                                                                |
|------------|------------------------------------------------------------------------------------------------------------|
| statistics | A list of all track statistics that will be created periodically when an event started until it finishes.            |

### Entity Role

A Role gives a specific user special rights in the application. See the Role Management section for further detail on the roles.

It defines the following attributes:

| attribute | description                                                                                                              |
|-----------|--------------------------------------------------------------------------------------------------------------------------|
| type      | Defines the proper role for the person. The following roles can be set: ___Manager___ and ___Moderator___ for the event. |
| email     | Is a string with the email address of the authorized person.                                                             |

Entity _Role_ has no further relations.

### Entity User

A User is a helper entity in order to enable event based logins. Users must be added to an events accessList in order to access a specific event. \
In case that the event defined a _accessEmailPattern_ new Users can be generated during login process. This way the initial _accessList_ of an event can be pre-filled but does not have to.

It defines the following attributes:

| attribute | description                                                                                                                           |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------|
| userId    | A unique user id used as foreign key.                                                                                                 |
| email     | The users concrete email address. It is used to send users authorization tokens by email at login attempts.                           |
| firstname | The users firstname is optional and will be used for display reasons in case the users use chat or question features during an event. |
| lastname  | The users lastname is optional and will be used for display reasons in case the users use chat or question features during an event.  |

It defines the following relations:

| relation     | description                                                  |
|--------------|--------------------------------------------------------------|
| likes        | A list of all event messages that the user marked as "like". |
| sentMessages | A list of all messages that the user has sent.               |

### Entity Message

A Message entity is used to track all messages of "Attendees" and "Moderators". Note that the specific message text is language specific and will be translated into other languages (currently "de" and "en"). See Entity MessageText for further details.

It defines the following attributes:

| attribute        | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| messageId        | A unique message id used as foreign key for the translated MessageTexts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| type             | A message can either be a ___Chat___ message, a ___Support___ message, or a ___Question___. The private type can only be used by "Moderators" when replying ___Chats___ or ___Questions___ as a way to answer the original message sender.                                                                                                                                                                                                                                                                                                      |
| timestamp        | The timestamp of the message when the sender sent it into the system.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| state            | A message has different states. It is ___pending___ when a sender sent his message to the system. A "Moderator" can then set the message to ___accepted___ or ___rejected___. Rejected messages will be deleted entirely on event finish. Accepted messages will be visible to (and can be liked by) the "Attendee" if configured. "Moderators" can also move "accepted" messages to a "Presenter" by setting the state to ___forwarded___. The "Presenter" can mark messages for him as ___processed___ or ___suspended___ if he processed the message or will not process it in the live event. |
| originalLanguage | The sender of a message entered a message in a specific language. We store that language in order to notice the difference between human written and ai generated messages. This difference should be visible to everyone at any time.                                                                                                                                                                                                                                                                                                                                      |
| senderName       | This is the message senders name that should be displayed for others. Messages sent by "Moderators" will be displayed with a different name ("Moderator") instead of the configured event naming pattern (see _chatName_ and _questionsName_ as well as _chatAllowAnonymous_ and _questionsAllowAnonymous_ in Entity _Event_).                                                                                                                                                                                                                                              |
| presenterHint    | A "Moderator" can add a hint for the presenter when he sets the state to ___forwarded___. This hint should help the presenter with processing the message in the live event. An example could be: a hint to which live event attendee the question should be directed to.                                                                                                                                                                                                                                                                                                    |
| likes            | The number of likes will be calculated on event finish. Due to GDPR reasons the likers will be removed at the end and the number of likes will be stored as number and are conservated this way.                                                                                                                                                                                                                                                                                                                                                                            |
| sentimentScore   | If sentiment analysis is enabled on server side, the result of the analysis is stored and can be used for displaying reasons. We expect the score to be a floating point between -1 and 1 where all scores below -0.1 are considered as improper.                                                                                                                                                                                                                                                                                                                           |

It defines the following relations:

| relation | description                                                                                                                                                                                                                                                                                |
|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sender  | The sender of a message is the author and must be an event "Attendee".                                                                                                                                                                                                                     |
| liker   | Each event "Attendee" can like messages of others. Likes can be canceled as well.                                                                                                                                                                                                          |
| event   | The message is directly related to the specific event. It is necessary to keep track of this because the senders will be deleted for GDPR reasons when the event is finished.                                                                                                              |
| replyTo | Messages can be a reply to another message. Typically messages of type ___Chat___ can be replies to other chat messages. In special cases a "Moderator" can reply to any message and he might also only reply visible to the sender (see type ___Support___) |
| questionTags | Messages can be tagged with zero or more tags. |

### Entity MessageText

A MessageText is a language specific text of a _Message_ Entity.

It defines the following attributes:

| attribute     | description                                                                                                                                           |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| messageTextId | A unique message text id used as foreign key.                                                                                                         |
| language      | This field states the language the text of the message is in.                                                                                         |
| text          | This is the text of the message in the stated language. Hint: see _originalLanguage_ in entity _Message_ to determine the user written original text. |

It defines the following relations:

| relation  | description                                        |
|-----------|----------------------------------------------------|
| messageId | A _MessageText_ is related to its _Message_ entity |

### Entity QuestionTag

A QuestionTag is a string attached to a _Message_ Entity.

It defines the following attributes:

| attribute     | description                                                                                                                                           |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| text          | A unique tag name |
| moderatorOnly | Whether this tag can be used by a Moderator or Manager role only |
| group         | Logical group this tag belongs to. |

### Entity AuthorizationToken

An authorization token is a simple second factor to ensure that the attendee of an event is in access of the email address as first factor. Being invited to an event (see relation _accessList_ in entity _Event_) allows the proper email address to receive a generated one time token.
Using this correct token as a one time password grants access to the event. \
An _AuthorizationToken_ can be pre-generated on event creation.

It defines the following attributes:

| attribute  | description                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| token      | The generated one time token for the next login attempt. In special cases this token is pre-generated and might not be invalidated on first use.                                                                                                                                                                                                                                                                                              |
| validUntil | The generated token wont last forever. By default a login must be completed within 5 minutes. Pre-generated tokens last until event ends and have validUntil not set. If the attribute ___expireAuthTokenOnFirstUse___ in entity _Event_ is set to "false" the token never expires.        |
| state      | Issued tokens have a proper state to ensure some debugging options and anonymous data sums. A token is ___issued___ when he got created during event creation. ___sent___ is set by the system when a token got sent to the user by email. The state ___used___ is the final state when a token got used for a successful or unsuccessful login attempt. |

It defines the following relations:

| relation | description                         |
|----------|-------------------------------------|
| userId   | The user  the token was issued for. |
| event    | The event the token was issued for. |

### Entity SessionToken

A session token is the result of a successful login of a user to an event.

It defines the following attributes:

| attribute | description                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sessionId | A unique identifier for the session of a user for an event.                                                                                                                                                                                                                                                                                                                                                                                   |
| issuedAt  | The timestamp the user successfully entered the event.                                                                                                                                                                                                                                                                                                                                                                                        |

It defines the following relations:

| relation | description                           |
|----------|---------------------------------------|
| userId   | The user  the session was issued for. |
| event    | The event the session was issued for. |

### Entity EventStatistic

An event generates periodically cumulated statics when the event started until it gets finished. Plan is to create each five minutes a snapshot of the number counts.

An EventStatistic defines the following attributes:

| attribute                    | description                                                                                                                                                                                                                                     |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| timestamp                    | The unique timestamp when this _EventStatistic_ was created.                                                                                                                                                                                    |
| numberOfIssuedAuthTokens  | A bare count of the number of _AuthorizationTokens_ of _type_ ___issued___ of the event at the given _timestamp_.                                                                                                                           |
| numberOfSentAuthTokens       | A bare count of the number of _AuthorizationTokens_ of _type_ ___sent___ of the event at the given _timestamp_.                                                                                                                                 |
| numberOfUsedAuthTokens       | A bare count of the number of _AuthorizationTokens_ of _type_ ___used___ of the event at the given _timestamp_.                                                                                                                                 |
| numberOfSessionTokens        | A bare count of the number of _SessionTokens_ of the event at the given _timestamp_.                                                                                                                                                            |
| numberOfConnections        | A bare count of the number of active mqtt sessions of the event at the given _timestamp_. The difference between the session and mqtt is the activity when an attendee leaves the event, he still has a session but no mqtt connection anymore. |

Entity _EventStatistic_ has no further relations.

### Entity TrackStatistic

A TrackStatistic is responsible for presenting bare counts of viewers for the related entity _Track_.

It defines the following attributes:

| attribute       | description                                                                                  |
|-----------------|----------------------------------------------------------------------------------------------|
| timestamp       | The unique timestamp when this _TrackStatistic_ was created.                                |
| numberOfViewers | A bare count of the number of viewers of the concrete event channel track at the given _timestamp_. |

Entity _TrackStatistic_ has no further relations.

### Entity UserStatistic

A _UserStatistic_ is responsible for tracking information about the related entity _User_.

It defines the following attributes:

| attribute       | description                                                                                  |
|-----------------|----------------------------------------------------------------------------------------------|
| timestamp       | The unique timestamp when this _UserStatistic_ was created.                                |
| country         | ISO country code from GeoIP based tracking. |
| browserType     | Type of browser (e.g. Edge, Firefox, Safari, etc). |
| deviceType      | Type of device (e.g. Desktop, Tablet, Mobile). |
| viewportWidth   | Width in pixels of the browser viewport. |
| viewportHeight   | Height in pixels of the browser viewport. |

Entity _UserStatistic_ has no further relations.

