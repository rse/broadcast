Requirements ("must")
=====================

R1.1 User authentication
------------------------

Authentication of participants via their email address (to minimize
foreign viewers) before the visibility of the video stream or
alternatively at least before participation in questions/chat.

We should allow a user to be already authenticated for a longer time,
but still check whether the event still has the user listed for access
at all.

R1.2 Limit parallel access
--------------------------

If participants need to be authenticated (already to watch the video
stream), the event can only be viewed once per participant (to minimize
outside viewers).

R1.3 Attendee scaling
---------------------

Video productions from msg Filmstudio must reach 2500 up to 10000
attendees at the same time.

R1.4 Streaming options
----------------------

Video productions in 1080p30 (1920x1080 resolution with 30 frames per
second) must be processed in german and english language.

R1.5 Attendee interaction channel
---------------------------------

### R1.5a Questions

Feedback channel for participants by asking questions (as input for the
Q&A rounds)

### R1.5b Chat

Feedback channel for participants by sending chat messages (for direct
comment on the event)

### R1.5c Likes

Feedback channel for participants by “liking” questions and chat messages.

### R1.5d Replies

Support option to disable replies to messages in chat.

### R1.5e Name appearance

Allow "Firstname Lastname" to be shown in chat (non-anonymous posting),
but still allows also the variants of optionally only "Firstname" or
anonymous. Always show the email-address in chat (at least with hover
animation). If not "Firstname Lastname" is available, optionally guess
it from email-address.

### R1.5f Display options

Support option for a user to see only his own messages/questions or also
the ones of others.

### R1.5g Enable client side sentiment analysis

Sentiment analysis should be configurable for clients in an event. If it
is enabled the attendee clients should check inputs before it is sent to
the server.

### R1.5h Enable server side sentiment analysis

Sentiment analysis should be configurable for server in an event. If it
is enabled the server should check inputs before it saves input.

### R1.5i Message Editing

Allow users to edit their chat and question messages, but mark them as edited
for others and in case of required moderation, pass it through the
moderation approval process before it is visible (again). And allow the user to delete a chat and question message.

### R1.5j Tag Question Message

Allow users to tag question message with predefined tags, in order to give a context to the question message (e.g. which
person the question should be directed to, or to add the agenda point)

R1.6 Moderator interaction
--------------------------

### R1.6a Moderate chat and questions

Moderation is optional. If enabled, moderators have to reject, approve or/and forward
attendee input.

### R1.6b Moderator supports the Presenter

Moderators can forward approved inputs to a "Presenter". So the "Presenter"
has only a few questions visible on his screen and not all approved ones.

### R1.6c Answer attendee inputs

Moderators can reply an attendee to his input and give him some answers
this way (option to support non-visible chat messages (direct messages
from moderator to user)), e.g. for questioning details or for giving
support.

### R1.6d Moderator chats and questions

Moderators can write own chats or questions, visible to others as sender
name (e.g. for prepared questions in Q&A session). The default will be
"Moderator" but can be overwritten on send.

### R1.6e Auto accept proper attendee inputs

Auto accept proper attendee inputs when the server side sentiment
analysis is positive.

### R1.6f Auto reject improper attendee inputs

Auto reject improper attendee inputs when the server side sentiment
analysis is negative.

### R1.6g Export attendee inputs

After an event finished, the Moderators can export all attendee inputs
with at least a timestamp, the state, the number of likes and the
message.

### R1.6h Moderator sends hints to the Presenter

Moderators can add some hints (texts) for the "Presenter" (e.g. "give the question to person
XYZ", "raise this question immediately", "you only have 5 minutes left", etc)

### R1.6i Moderator can sort and filter messages

Moderators can filter the messages, so that they can have a better overview. Forwarded Questions can be sorted manually
to set the order the "Presenter" has to ask the Questions.

### R1.6j Moderator can administrate and manage included app (if available)

If an app is included and it provides a administration view, it is possible for the Moderator to manage the app.

R1.7 Browser access
-------------------

Access to the event should work from any web browser (but at least a
relatively recent version) (to support both CIT and non-CIT devices).

R1.8 Individual event access
----------------------------

### R1.8a Support individual event access

The event is accessed via an individual and unguessable URL (to minimize
external viewers).

Examples for valid URLs:

- `https://msg-broadcast.com/#/event=<event>`

### R1.8b Support personalized event access

The event URL could also optionally contain the users Email(user). In
this case the "Email" should be read-only on login dialog.

Examples for valid URLs:

- `https://msg-broadcast.com/#/event=<event>&user=<email>`

### R1.8c Support automatic event access

The event URL could also optionally contain the users Email(user) and
his pre-generated access token(token) in order to auto-authenticate
users. In this case the user won't get a login dialog and can access
the event by automation. It depends on the event settings, if the
pre-generated access token could be used one or multiple times.

Examples for valid URLs:

- `https://msg-broadcast.com/#/event=<event>&user=<email>&token=<token>`

### R1.8d Support direct event resource access

Since events can be configured with different resources (each one as
stream from a CDN provider, or a static website), an direct access of such a resource should
be possible - e.g. when users reload the web page.

Examples for valid URLs:

- `https://msg-broadcast.com/#/event=<event>&resource=<resource>`
- `https://msg-broadcast.com/#/event=<event>&user=<email>&resource=<resource>`
- `https://msg-broadcast.com/#/event=<event>&user=<email>&token=<token>&resource=<resource>`

R1.9 Compliance and user consent
--------------------------------

### R1.9a Data processing in EU

All services are provided in compliance with GDPR within the EU.

### R1.9b User consent

Event attendees must provide explicit consent to take part in the event
under certain conditions (as a psychological hurdle and to legally
prevent the prohibited sharing of the underlying video stream), in
addition to prior consent via the event platform (Ventari)

### R1.9c Login message

Optionally show text, 1 or 2 links on login as message to the attendee.

### R1.9d Interaction message

Optionally show text, 1 or 2 Links on interaction (chat and question) as
message to the attendee.

R1.10 Streaming provider independent
------------------------------------

### R1.10a Configure multiple streaming provider

In order to change a streaming provider in the event of problems even
during the event multiple providers must be configured.

### R1.10b Switching streaming provider

The underlying video streaming provider can be changed, if necessary in
the event of problems even during the event (fallback provider). This
implies that attendees client software must handle this switch without
user interaction.

R1.11 Event creation
--------------------

### R1.11a Import Ventari Excel

From Ventari comes an Excel-Sheet with columns:

- "Barcode" (unique id from U2D Ventari)
- "Email"
- "Vorname" (for chat)
- "Nachname" (for chat)
- "Firma" (for statistic)
- "Bereich" (for statistic)
- "URL" (empty)
- "Teilnehmerstatus" (Eingeladen/Zugesagt/Teilgenommen/Abgesagt)

### R1.11b Return URL to Ventari

The "URL" has to be created by the system and then be updated in the
Excel-Sheet in return to Ventari. The "URL" is the unique adress to join
the meeting as a specific user. See R1.8 for more details on the URL.
The "URL" will contain the event, the user and its token. The "Token"
consists of 6 digits, formatted as "NNN-NNN".

### R1.11c Import/Export of Event

An event (with its related entities) can be exported to a serialized
format (e.g. YAML) and re-imported in order to have an easy way for
development and demonstration and for conveniently creating recurring
production events.

R1.12 Event statistics
----------------------

### R1.12a General event statistics

Provide attendee statistic curve: x=time, y=logged-in-users.

### R1.12b Debugging statistics

For debugging reasons we need additional statistics about the login
challenges: number of login challenges, number of sent tokens by email,
number of successful challenges

### R1.12c Channel statistics

Additionally show the number of viewers of each different
channel of an event e.g. how many german, english, high-resolution,
low-resolution, ...

### R1.12d User statistics

Additionally show statistics about the viewers. Country information is used to select the default language of the
application on first application use.

R1.13 Changes to Event configurations
-------------------------------------

When event configurations are made the changes should propagate directly
to all participants of a meeting. (e.g. chatEnabled is changed)

R1.14 Presenter dashboard
-------------------------

"Moderators" can forward event input (chat and questions) to a
"Presenter". see requirement R1.6.
l

Requirements ("can")
====================

R2.2 Feedback
-------------

Provide attendee feedback via real-time answering of multiple choice
questions (for more interaction during the event).

R2.3 Cost reduction
-------------------

The costs per event are minimized. The one-off development costs for the
solution are excluded from this.

R2.4 Mobile device support
--------------------------

Participants can also take part in the event on mobile phones (at least
video, possibly restrictions on interaction).

