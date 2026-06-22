
#   ARCHITECTURE: FUNCTIONALITY VIEW (ARCH-FV)

✳   Created:  **2026-06-18 10:18**
✎   Modified: **2026-06-18 10:18**

##  COMPONENT: Web Client <a id="ARCH-FV-client"></a>

-   Kind:           Subsystem
-   Responsibility: Render the attendee and operator UI and drive all user interaction.
-   Interface:      Browser application over HTTPS and MQTT-over-WebSocket
-   Depends On:     ARCH-FV-relay, ARCH-FV-client-nlp

The Vue.js single-page application renders the panel, attendee, studio, moderator, and manager screens, plays the video
stream, and exchanges live data over MQTT, **BECAUSE** msg.Broadcast delivers its entire experience in the browser.

##  COMPONENT: Client NLP <a id="ARCH-FV-client-nlp"></a>

-   Kind:           Module
-   Responsibility: Perform lightweight client-side sentiment and language detection on input.
-   Interface:      In-browser library API

The client NLP module runs local sentiment analysis and language identification on attendee input before it is sent,
**BECAUSE** filtering at the source reduces server load and can prevent improper submissions.

##  COMPONENT: Router <a id="ARCH-FV-router"></a>

-   Kind:           Connector
-   Responsibility: Route incoming requests across proxy instances of an environment.
-   Interface:      TCP/HTTP/WS front door

The router (HAProxy with NFTables) directs incoming HTTP and WebSocket traffic to proxy instances using round-robin and
separates the dev, QA, and production environments, **BECAUSE** traffic must be balanced and environments isolated at the edge.

##  COMPONENT: Proxy <a id="ARCH-FV-proxy"></a>

-   Kind:           Connector
-   Responsibility: Proxy environment HTTP and WebSocket requests to the relay layer.
-   Interface:      HTTP/WS reverse proxy
-   Depends On:     ARCH-FV-relay

The proxy layer (HAProxy) forwards requests of a specific environment to the relay layer and scales horizontally per
environment, **BECAUSE** request handling must scale independently of the messaging layer.

##  COMPONENT: Relay <a id="ARCH-FV-relay"></a>

-   Kind:           Connector
-   Responsibility: Maintain thousands of bidirectional WebSocket/MQTT connections.
-   Interface:      MQTT broker over WebSocket (Mosquitto, MQTT-Plus)
-   Depends On:     ARCH-FV-service

The relay layer brokers MQTT messages between clients and the service layer over many concurrent WebSockets and scales
horizontally, **BECAUSE** real-time fan-out to up to 10000 attendees is the central performance challenge.

##  COMPONENT: Service <a id="ARCH-FV-service"></a>

-   Kind:           Service
-   Responsibility: Execute all business logic for events, messages, auth, and statistics.
-   Interface:      MQTT topics and REST API
-   Depends On:     ARCH-FV-database, ARCH-FV-translation, ARCH-FV-auth, ARCH-FV-statistics

The service layer is the main server holding event, moderation, access, and configuration logic, reacting to MQTT messages
and persisting state, **BECAUSE** the authoritative business rules must live in a single server tier.

##  COMPONENT: Authentication Service <a id="ARCH-FV-auth"></a>

-   Kind:           Module
-   Responsibility: Issue and validate authorization and session tokens.
-   Interface:      Service-internal API
-   Depends On:     ARCH-FV-database

The authentication module generates one-time tokens, sends them via the email gateway, validates logins, and enforces a
single active session per user per event, **BECAUSE** email-verified, single-session access is the core security mechanism.

##  COMPONENT: Translation Service <a id="ARCH-FV-translation"></a>

-   Kind:           Module
-   Responsibility: Produce language-specific message texts via an external LLM.
-   Interface:      Service-internal API over the AI SDK

The translation module translates message texts into the supported languages on the fly while preserving the original,
**BECAUSE** chat and questions must be available in both German and English.

##  COMPONENT: Statistics Service <a id="ARCH-FV-statistics"></a>

-   Kind:           Module
-   Responsibility: Generate periodic event, channel, and user statistics snapshots.
-   Interface:      Service-internal scheduled API
-   Depends On:     ARCH-FV-database

The statistics module periodically captures cumulative counts of tokens, sessions, connections, and viewers during a running
event, **BECAUSE** trend dashboards require regular snapshots over the event's lifetime.

##  COMPONENT: Junction Orchestrator <a id="ARCH-FV-junction"></a>

-   Kind:           Component
-   Responsibility: Serve the static client content and orchestrate backend delivery over MQTT+.
-   Interface:      CLI and MQTT-Plus backend

The Junction component serves the static client bundle and orchestrates its delivery to the relay over MQTT+, **BECAUSE** the
client must be distributed alongside the same messaging infrastructure used for live data.

##  COMPONENT: Database <a id="ARCH-FV-database"></a>

-   Kind:           Component
-   Responsibility: Persist all business objects and static assets.
-   Interface:      SQL via Drizzle

The PostgreSQL database with the filesystem stores all events, messages, tokens, statistics, and static assets accessed
through the Drizzle persistence layer, **BECAUSE** the authoritative, durable state of every event must be persisted in one tier.
