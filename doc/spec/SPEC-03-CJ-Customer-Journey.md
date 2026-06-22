
#   SPECIFICATION: CUSTOMER JOURNEY (SPEC-CJ)

✳   Created:  **2026-06-18 10:18**
✎   Modified: **2026-06-18 10:18**

##  STEP: Receives personal event invitation URL <a id="SPEC-CJ-invitation"></a>

-   Stage:      Awareness
-   Actor:      SPEC-PE-attendee
-   Goal:       Learn that an event is happening and that access is granted
-   Touchpoint: Invitation email containing the individual event URL
-   Action:     The attendee reads the invitation and clicks the personalized event link.
-   Emotion:    Curious (4)

##  STEP: Opens event page and reviews login info <a id="SPEC-CJ-arrival"></a>

-   Stage:      Consideration
-   Actor:      SPEC-PE-attendee
-   Goal:       Understand what the event is and how to join
-   Touchpoint: Event landing screen in the web browser
-   Action:     The attendee reads the optional login message and any links before deciding to log in.
-   Emotion:    Interested (3)
-   Pain Point: Uncertainty whether the link is genuine and what data will be collected.

##  STEP: Authenticates via email token <a id="SPEC-CJ-authenticate"></a>

-   Stage:      Decision
-   Actor:      SPEC-PE-attendee
-   Goal:       Gain access to the live video stream
-   Touchpoint: Login dialog with email and token challenge
-   Action:     The attendee enters the email, receives a 6-digit token by mail, and submits it.
-   Emotion:    Slightly impatient (3)
-   Pain Point: Waiting for the token email and re-checking the inbox adds friction before the event.

##  STEP: Watches stream and interacts <a id="SPEC-CJ-participate"></a>

-   Stage:      Onboarding
-   Actor:      SPEC-PE-attendee
-   Goal:       Follow the event and contribute questions, chat, and likes
-   Touchpoint: Main attendee screen with video and interaction sidebar
-   Action:     The attendee watches the stream, posts questions or chat messages, and likes others' messages.
-   Emotion:    Engaged (4)
-   Pain Point: Messages may be delayed by moderation, so the attendee is unsure whether input arrived.

##  STEP: Configures and runs the event <a id="SPEC-CJ-operate"></a>

-   Stage:      Onboarding
-   Actor:      SPEC-PE-manager
-   Goal:       Set up, start, and control an event end-to-end
-   Touchpoint: Manager configuration screen and Ventari Excel import/export
-   Action:     The manager imports attendees, configures channels and options, and starts the event.
-   Emotion:    Focused (3)
-   Pain Point: Coordinating streaming providers, access lists, and tokens before going live is error-prone.

##  STEP: Moderates and supports the presenter <a id="SPEC-CJ-moderate"></a>

-   Stage:      Retention
-   Actor:      SPEC-PE-moderator
-   Goal:       Keep interaction clean and forward the best questions to the presenter
-   Touchpoint: Moderator Kanban board of chat and question messages
-   Action:     The moderator approves, rejects, and forwards messages and sends hints to the presenter.
-   Emotion:    Pressured (4)
-   Pain Point: High message volume under time pressure makes it hard to keep an overview.

##  STEP: Exports anonymized results after event <a id="SPEC-CJ-export"></a>

-   Stage:      Advocacy
-   Actor:      SPEC-PE-manager
-   Goal:       Capture and share the event's interaction outcomes
-   Touchpoint: Manager export function producing a downloadable file
-   Action:     The manager exports anonymized messages with timestamps, states, and like counts.
-   Emotion:    Satisfied (4)
