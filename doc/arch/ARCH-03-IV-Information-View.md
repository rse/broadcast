
#   ARCHITECTURE: INFORMATION VIEW (ARCH-IV)

✳   Created:  **2026-06-18 10:18**
✎   Modified: **2026-06-18 10:18**

##  ASPECT: Event-Centric Persistence <a id="ARCH-IV-event-persistence"></a>

-   Concern:    Persistence
-   Entities:   SPEC-DM-event, SPEC-DM-channel, SPEC-DM-resource, SPEC-DM-role
-   Owner:      ARCH-FV-service
-   Lifecycle:  created in planning, edited while running, deleted explicitly by a manager

The service persists every event together with its channels, resources, and roles as one aggregate in PostgreSQL via
Drizzle, **BECAUSE** the data model is event-centric and all entities hang off the owning event.

##  ASPECT: Message and Translation Store <a id="ARCH-IV-message-store"></a>

-   Concern:    Persistence
-   Entities:   SPEC-DM-message, SPEC-DM-messagetext, SPEC-DM-questiontag
-   Owner:      ARCH-FV-service
-   Lifecycle:  created on submission, translated and moderated, anonymized or deleted on finish

Each message is stored once with its language-specific texts and tags, retaining the original language alongside translated
variants, **BECAUSE** the human original must always be distinguishable from AI-translated text.

##  ASPECT: Live Message Flow <a id="ARCH-IV-message-flow"></a>

-   Concern:    Flow
-   Entities:   SPEC-DM-message
-   Owner:      ARCH-FV-relay
-   Lifecycle:  published to MQTT topics, fanned out to subscribers, persisted by the service

Messages, likes, and state changes flow as MQTT messages on per-event topics through the relay to all subscribed clients while
the service persists authoritative state, **BECAUSE** real-time fan-out to thousands of clients is the system's core data flow.

##  ASPECT: Configuration Propagation <a id="ARCH-IV-config-flow"></a>

-   Concern:    Flow
-   Entities:   SPEC-DM-event
-   Owner:      ARCH-FV-service
-   Lifecycle:  changed by an operator, published to all clients, applied without reload

Event configuration changes are persisted and immediately published over MQTT so connected clients reconcile their view,
**BECAUSE** live toggles such as enabling chat must reach the audience within seconds.

##  ASPECT: Token and Session Ownership <a id="ARCH-IV-auth-ownership"></a>

-   Concern:    Ownership
-   Entities:   SPEC-DM-authtoken, SPEC-DM-sessiontoken, SPEC-DM-user
-   Owner:      ARCH-FV-auth
-   Lifecycle:  issued at provisioning or login, used for access, deleted on finish

The authentication module exclusively owns authorization tokens, session tokens, and the helper user records, enforcing one
active session per user per event, **BECAUSE** access secrets must have a single authoritative owner.

##  ASPECT: Statistics Snapshots <a id="ARCH-IV-stats-retention"></a>

-   Concern:    Retention
-   Entities:   SPEC-DM-eventstatistic, SPEC-DM-channelstatistic, SPEC-DM-userstatistic
-   Owner:      ARCH-FV-statistics
-   Lifecycle:  written every five minutes while running, retained for reporting after finish

Statistics are appended as immutable periodic snapshots during a running event and retained past finish for the manager's
trend reporting, **BECAUSE** trends require a durable time series independent of the anonymized live data.

##  ASPECT: Anonymization on Finish <a id="ARCH-IV-anonymization"></a>

-   Concern:    Retention
-   Entities:   SPEC-DM-message, SPEC-DM-user, SPEC-DM-authtoken, SPEC-DM-sessiontoken
-   Owner:      ARCH-FV-service
-   Lifecycle:  triggered on event finish, irreversibly removing personal data

On event finish the service runs the anonymization procedure that reduces likes to counts, anonymizes sender names, and
deletes tokens, users, and moderator roles, **BECAUSE** privacy by design forbids retaining personal data beyond the event.
