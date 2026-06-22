
## About

**Broadcast** is a small but flexible web portal for displaying the
broadcasted video streams of a live event and providing its companion
chat, question, and voting (likes) interactions. It supports
email-verified access control, live switching between streaming
providers, and real-time moderated interaction, and is designed to scale
up to 10K parallel attendees. It is a TypeScript monorepo with a Vue
browser client, a Node.js server, and a shared common layer, using MQTT
over WebSocket for real-time messaging and PostgreSQL (via Drizzle) for
persistence.

## Repository Layout

- `doc/spec/`: Specification documents (SPEC-*) — solution vision, personas, customer journey, functional/non-functional requirements, business rules, data and state models, glossary, use/test cases, and UI/dialog/visual design.
- `doc/arch/`: Architecture documents (ARCH-*) — context, functionality, information, concurrency, development, deployment, and operations views, plus quality perspectives, decision records, and the technology stack.
- `src/client/src`: Browser front-end — Vue single-page application (`app.vue`) with its styling, logging, and client-side service layer.
- `src/common/src`: Shared TypeScript layer used by both client and server — common types, MQTT topic conventions, and re-exports.
- `src/server/src`: Node.js back-end — CLI entry point (`app.ts`), service layer, configuration loading, logging, and the PostgreSQL/Drizzle data-access layer (DAO/DDL).

## Tool Build System

Build orchestration uses `@rse/stx`, not plain npm scripts. The only npm
script is `npm start`, which invokes stx with `etc/stx.conf`. Common
targets:

```
npm start patch-apply         # (internal) apply patch set for NPM dependencies
npm start upd                 # automatically update all NPM dependencies
npm start lint                # static code analysis (linting) of all components
npm start build               # build all components for production (depends on lint)
npm start dev                 # run all components in development mode (continuous file watching)
npm start client              # run the client component (production preview)
npm start broker              # run the broker component (Junction, via Docker)
npm start server              # run the server component
npm start server-db-generate  # generate the server database schema (Drizzle)
npm start server-db-push      # push the server database schema (Drizzle)
npm start server-db-migrate   # run the server database migrations (Drizzle)
npm start prune               # remove all development-only NPM dependencies
npm start clean               # remove all generated artifacts (reverse of "npm start build")
npm start distclean           # remove all generated artifacts (reverse of "npm install" and "npm start build")
```
