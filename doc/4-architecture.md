
Architecture
============

Architecture Overview
---------------------

![architecture overview](./4-architecture-view.svg "Architecture Overview")

- Layer (1) is the client layer and contains the web user interface of
  broadcast.

- Layer (2) is a cloud layer used for static content
  distribution to support a stable and fast delivery for this content.

- Layer (3) is a layer for routing incoming requests to a bunch of proxy
  instances. It separates the environments and uses round-robin for load
  balancing purposes.

- Layer (4) is the proxy layer for all incoming HTTP and WS Requests of
  a specific environment. It proxies the proper requests to the relay
  layer. Several instances ensure the proper scaling per environment.

- Layer (5) is the relay layer used for handling thousands of
  bidirectional web sockets. Several instances ensure the proper scaling
  and response times.

- Layer (6) is the service layer. It contains the business services of
  broadcast and therefore the main server logic.

- Layer (7) is the database and filesystem layer and contains the
  database for all business objects and all static assets.


Technology Stack
----------------

The following technologies, frameworks, and libraries are used for
implementing broadcast.

### Client

- **Build Infrastructure**:
  - **STX** -- task runner
  - **TypeScript** -- strongly-typed language for all client-side code.
  - **Vite** -- build tool and development server.
  - **ESLint** -- linting for code quality and style.
  - **OxLint** -- linting for code quality and style (alternative).
  - **HTMLLint** -- linting for HTML.
  - **StyleLint** -- linting for Stylus files.

- **Runtime Infrastructure**:
  - **Vue.js** -- reactive component-based UI framework.
  - **Stylus** -- preferred preprocessor for authoring CSS.
  - **Tailwind CSS** -- utility-first CSS framework for styling.
  - **Luxon** -- date management
  - **MQTT-plus** -- MQTT handling for the messaging/relay layer.
  - **MQTT.js** -- MQTT base functionality.
  - **Axios** -- HTTP/REST client.
  - **TypoPRO** -- typography.
  - **Fontawesome** -- icons.
  - **natural+@nlpjs/core+multilang-sentiment** -- local sentiment analysis.
  - **tinyld+franc+lande** -- local language identification

### Server

- **Build Infrastructure**:
  - **STX** -- task runner
  - **TypeScript** -- strongly-typed language for all server-side code.
  - **ESLint** -- linting for code quality and style.
  - **OxLint** -- linting for code quality and style (alternative).

- **Runtime Infrastructure**:
  - **HAPI** -- framework for the REST API endpoints.
  - **MQTT-plus** -- MQTT handling for the messaging/relay layer.
  - **MQTT.js** -- MQTT base functionality.
  - **Commander.js** -- parsing of command-line options.
  - **Execa** -- command execution
  - **@ai-sdk** -- AI/LLM connectivity

