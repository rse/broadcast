
#   ARCHITECTURE: TECHNOLOGY STACK (ARCH-TS)

✳   Created:  **2026-06-19 00:15**
✎   Modified: **2026-06-22 15:45**

##  COMPONENT: Client Language <a id="ARCH-TS-client-language"></a>

-   Product:      TypeScript
-   Coverage:     Business Model, Data Conversion, Environment Detection
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Build-Time

All client-side code is authored in strongly-typed TypeScript and compiled to browser JavaScript, **BECAUSE** a single
strongly-typed language catches contract mismatches against the shared common module at compile time.

##  COMPONENT: Client Task Runner <a id="ARCH-TS-client-task-runner"></a>

-   Product:      STX
-   Coverage:     Dialog Automation
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Build-Time

The STX task runner drives the client build, lint, and run tasks from a per-module `stx.conf`, **BECAUSE** a single task
runner gives every module a consistent developer entry point.

##  COMPONENT: Client Build Tool <a id="ARCH-TS-client-build-tool"></a>

-   Product:      Vite
-   Coverage:     Markup Loading, Markup Generation
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Build-Time

Vite serves the client in development with fast HMR and bundles the runtime stack into the optimized static client artifact,
**BECAUSE** it provides a fast development server and an optimized production bundle for the Vue stack.

##  COMPONENT: Client Linting <a id="ARCH-TS-client-linting"></a>

-   Product:      ESLint
-   Alternatives: OxLint, HTMLHint, StyleLint
-   Coverage:     Smoke Testing
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Build-Time

ESLint enforces code quality and style for the client TypeScript, complemented by the faster OxLint, HTMLHint for HTML, and
StyleLint for Stylus, **BECAUSE** multiple focused linters keep each language layer clean and consistent.

##  COMPONENT: Styling Framework <a id="ARCH-TS-styling-framework"></a>

-   Product:      Tailwind CSS
-   Alternatives: Stylus
-   Coverage:     Interface Theme, Interface Layouting, Interface Effects
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Build-Time

Tailwind CSS provides the utility-first styling for theme, layout, and effects, with Stylus as the preferred preprocessor
for authoring custom CSS, **BECAUSE** utility-first styling speeds consistent UI work while Stylus covers bespoke styling.

##  COMPONENT: UI Framework <a id="ARCH-TS-ui-framework"></a>

-   Product:      Vue.js
-   Coverage:     Dialog Structure, Dialog Life-Cycle, Interface Mask, Data Binding
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Run-Time

Vue.js provides the reactive, component-based UI framework rendering the panel, attendee, studio, moderator, and manager
screens, **BECAUSE** a reactive component model is the natural fit for the browser-delivered, real-time experience.

##  COMPONENT: Widget Framework <a id="ARCH-TS-widget-framework"></a>

-   Product:      Reka UI
-   Coverage:     Interface Widgets, Interface States, Interface Interactions
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Run-Time

Reka UI supplies the headless, unstyled widget primitives composed into the application's interface elements, **BECAUSE**
headless widgets provide accessible interaction behavior while leaving the visual styling fully under design control.

##  COMPONENT: Client Typography <a id="ARCH-TS-client-typography"></a>

-   Product:      TypoPRO
-   Coverage:     Interface Theme
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Run-Time

TypoPRO supplies the web typography and font assets for the client interface, **BECAUSE** consistent, self-hosted typography
is needed across the branded UI.

##  COMPONENT: Client Iconography <a id="ARCH-TS-client-iconography"></a>

-   Product:      Fontawesome
-   Coverage:     Interface Widgets
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Run-Time

Fontawesome provides the icon set used throughout the client interface, **BECAUSE** a comprehensive icon library covers the
UI's iconography needs out of the box.

##  COMPONENT: Date Management <a id="ARCH-TS-date-management"></a>

-   Product:      Luxon
-   Coverage:     Value Formatting, Value Parsing, Localization (L10N)
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Run-Time

Luxon handles date and time parsing, formatting, and localization across the client UI, **BECAUSE** robust, locale-aware
date handling is required for event schedules and timestamps in German and English.

##  COMPONENT: Client Messaging <a id="ARCH-TS-client-messaging"></a>

-   Product:      MQTT-Plus
-   Alternatives: MQTT.js
-   Coverage:     Client Networking, Dialog Communication
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Run-Time

MQTT-Plus handles the client's MQTT-over-WebSocket communication with the relay layer on top of the base MQTT.js
functionality, **BECAUSE** MQTT is the messaging protocol for the real-time relay layer and MQTT-Plus adds the needed handling.

##  COMPONENT: Client HTTP Client <a id="ARCH-TS-client-http-client"></a>

-   Product:      OFetch
-   Coverage:     Client Networking
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Run-Time

OFetch provides the client's HTTP/REST request/response communication, **BECAUSE** REST calls complement the MQTT channel
for request/response-style interactions.

##  COMPONENT: Client Logging <a id="ARCH-TS-client-logging"></a>

-   Product:      Pino
-   Coverage:     Execution Tracing
-   Realizes:     ARCH-FV-client
-   Tier:         Client
-   When:         Run-Time

Pino provides the leveled logging facility wrapping the browser console with structured, prefixed, and time-stamped output,
**BECAUSE** a single logging library shared with the server keeps client- and server-side tracing consistent.

##  COMPONENT: Client Sentiment Analysis <a id="ARCH-TS-client-sentiment"></a>

-   Product:      natural + @nlpjs/core + multilang-sentiment
-   Coverage:     Request Validation
-   Realizes:     ARCH-FV-client-nlp
-   Tier:         Client
-   When:         Run-Time

The natural, @nlpjs/core, and multilang-sentiment libraries perform local sentiment analysis on attendee input in the
browser, **BECAUSE** filtering sentiment at the source reduces server load and can prevent improper submissions.

##  COMPONENT: Client Language Identification <a id="ARCH-TS-client-langid"></a>

-   Product:      tinyld + franc + lande
-   Coverage:     Request Validation
-   Realizes:     ARCH-FV-client-nlp
-   Tier:         Client
-   When:         Run-Time

The tinyld, franc, and lande libraries perform local language identification on attendee input in the browser, **BECAUSE**
detecting the message language client-side enables on-the-fly handling without an initial server round-trip.

##  COMPONENT: Server Language <a id="ARCH-TS-server-language"></a>

-   Product:      TypeScript
-   Coverage:     Component Management, Request Processing
-   Realizes:     ARCH-FV-service
-   Tier:         Server
-   When:         Build-Time

All server-side code is authored in strongly-typed TypeScript, **BECAUSE** a single strongly-typed language across client
and server catches contract mismatches against the shared common module at compile time.

##  COMPONENT: Server Task Runner <a id="ARCH-TS-server-task-runner"></a>

-   Product:      STX
-   Coverage:     Environment Detection
-   Realizes:     ARCH-FV-service
-   Tier:         Server
-   When:         Build-Time

The STX task runner drives the server build, lint, and run tasks from a per-module `stx.conf`, **BECAUSE** a single task
runner gives every module a consistent developer entry point.

##  COMPONENT: Server Linting <a id="ARCH-TS-server-linting"></a>

-   Product:      ESLint
-   Alternatives: OxLint
-   Coverage:     Request Validation
-   Realizes:     ARCH-FV-service
-   Tier:         Server
-   When:         Build-Time

ESLint enforces code quality and style for the server TypeScript, complemented by the faster OxLint, **BECAUSE** focused
linters keep the server codebase clean and consistent.

##  COMPONENT: Server Messaging <a id="ARCH-TS-server-messaging"></a>

-   Product:      MQTT-Plus
-   Alternatives: MQTT.js
-   Coverage:     Server Networking, Component Communication
-   Realizes:     ARCH-FV-relay, ARCH-FV-service
-   Tier:         Server
-   When:         Run-Time

MQTT-Plus handles the server's MQTT messaging for the relay layer on top of the base MQTT.js functionality, **BECAUSE**
MQTT is the messaging protocol for the real-time relay layer and MQTT-Plus adds the needed handling.

##  COMPONENT: Database <a id="ARCH-TS-database"></a>

-   Product:      PostgreSQL
-   Coverage:     Persistence, Data Retention
-   Realizes:     ARCH-FV-database
-   Tier:         Server
-   When:         Run-Time

PostgreSQL stores the authoritative, durable state of every event together with its channels, messages, tokens, and
statistics snapshots, **BECAUSE** the event-centric data model is inherently relational and demands transactional
integrity, EU-resident self-hosting, and rich query support for moderation and reporting.

##  COMPONENT: Persistence Layer <a id="ARCH-TS-persistence-layer"></a>

-   Product:      Drizzle
-   Alternatives: Kysely, Prisma, MikroORM, Sequelize
-   Coverage:     Persistence, Data Conversion
-   Realizes:     ARCH-FV-database
-   Tier:         Server
-   When:         Run-Time

Drizzle provides the type-safe SQL query builder and schema definition layer between the server's TypeScript code and
PostgreSQL, with its schema generated spec-first from the data model, **BECAUSE** a thin, zero-overhead typed layer
preserves end-to-end TypeScript type-safety and full PostgreSQL feature access without the runtime cost of a heavy ORM.

##  COMPONENT: Static Content Server <a id="ARCH-TS-static-content-server"></a>

-   Product:      Junction
-   Coverage:     Server Networking, Request Processing
-   Realizes:     ARCH-FV-junction
-   Tier:         Server
-   When:         Run-Time

Junction serves the static client content over MQTT+ from the backend, **BECAUSE** the client must be distributed alongside
the same messaging infrastructure used for live data.

##  COMPONENT: Argument Parsing <a id="ARCH-TS-argument-parsing"></a>

-   Product:      Commander.js
-   Coverage:     Argument Parsing
-   Realizes:     ARCH-FV-service
-   Tier:         Server
-   When:         Run-Time

Commander.js parses the server's command-line options and arguments to bootstrap application parameters, **BECAUSE** a
mature CLI parser covers option handling at server startup without custom code.

##  COMPONENT: Server Logging <a id="ARCH-TS-server-logging"></a>

-   Product:      Pino
-   Alternatives: pino-pretty
-   Coverage:     Execution Tracing
-   Realizes:     ARCH-FV-service
-   Tier:         Server
-   When:         Run-Time

Pino provides the server's structured, high-performance logging facility, with pino-pretty rendering human-readable output
during development, **BECAUSE** low-overhead structured logging is required for tracing the live messaging service.

##  COMPONENT: Unique Identifier Generation <a id="ARCH-TS-unique-id"></a>

-   Product:      nanoid
-   Coverage:     Peer Information
-   Realizes:     ARCH-FV-service
-   Tier:         Server
-   When:         Run-Time

nanoid generates the compact, collision-resistant unique identifiers for server-side peers and entities, **BECAUSE** short
URL-safe identifiers are needed without the size and overhead of full UUIDs.

##  COMPONENT: AI/LLM Connectivity <a id="ARCH-TS-ai-connectivity"></a>

-   Product:      @ai-sdk
-   Coverage:     Client Networking
-   Realizes:     ARCH-FV-translation
-   Tier:         Server
-   When:         Run-Time

The @ai-sdk library connects the server to an external AI/LLM service for on-the-fly translation of message texts,
**BECAUSE** chat and questions must be made available in both German and English.

##  COMPONENT: Server HTTP Client <a id="ARCH-TS-server-http-client"></a>

-   Product:      OFetch
-   Coverage:     Client Networking
-   Realizes:     ARCH-FV-auth
-   Tier:         Server
-   When:         Run-Time

OFetch provides the server's HTTP/REST client used to call the external GraphQL mail-sending API, **BECAUSE** authorization
token emails are dispatched through an external mail gateway over REST.
