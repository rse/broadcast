---
Created:  2026-06-18 10:18
Modified: 2026-10-21 17:58
---

ARCH: Development Aspects (DA)
==============================

##  ASPECT: Client/Common/Server Split {{module-split}}

-   CATEGORY:  Structure
-   GUIDED-BY: [[PRINCIPLE:shared-contracts]]

The codebase is organized into `src/client`, `src/common`, and
`src/server` modules, with shared types and topic definitions living in
the common module imported by both sides, BECAUSE client and server must
agree on contracts without duplicating them.

##  ASPECT: TypeScript Everywhere {{typescript}}

-   CATEGORY:  Standardization
-   GUIDED-BY: [[PRINCIPLE:shared-contracts]]

All client-side and server-side code is written in strongly typed
TypeScript against shared type definitions, BECAUSE a single typed
language across the stack catches contract mismatches at compile time.

##  ASPECT: STX Task Running {{stx-tasks}}

-   CATEGORY: Tooling

Build, lint, and run tasks are driven uniformly by the STX task runner
with per-module `stx.conf` files, BECAUSE a single task runner gives
every module a consistent developer entry point.

##  ASPECT: Vite Client Build {{vite-build}}

-   CATEGORY: Build

The client is built and served in development by Vite, bundling the
Vue, Pinia, Reka UI, Tailwind, and Stylus stack into the static client
artifact, BECAUSE one build configuration for development and
production keeps the developed client equal to the delivered static
bundle.

##  ASPECT: Layered Linting {{linting}}

-   CATEGORY: Standardization

Code quality is enforced with ESLint and the faster OxLint for
TypeScript, HTMLHint for HTML, and StyleLint for Stylus, BECAUSE
multiple focused linters keep each language layer clean and consistent.

##  ASPECT: Dependency Layering {{dependency-layering}}

-   CATEGORY: Dependency

The common module must depend on neither client nor server, while both
client and server may depend on common, BECAUSE a one-directional
dependency keeps the shared contract free of platform-specific concerns.

##  ASPECT: Git Codeline {{codeline}}

-   CATEGORY: Codeline

The project is versioned in a single Git repository hosted on the
self-administered Gitea, BECAUSE self-hosted version control keeps
source under full organizational control.

##  ASPECT: Repository Access {{repository-access}}

-   CATEGORY: Codeline

Access to the repository is granted by the Software Administrator,
BECAUSE the Software Administrator manages the software configuration
and hence controls who may change the solution.

##  ASPECT: Identifier Naming {{identifier-naming}}

-   CATEGORY: Standardization

Data-model entities are named in PascalCase and their attributes in
camelCase, BECAUSE these are the prevailing TypeScript conventions for
types and their members, so the entities map onto the code unrenamed.

##  ASPECT: Identifier Referencing {{identifier-referencing}}

-   CATEGORY: Standardization

Data-model entities and attributes are referred to by exactly their
identifiers, set in code font, wherever code or documents mention them
(e.g. `Event.accessList`, `Message.senderName`), BECAUSE a single
identifier form lets a reader grep from a document straight into the
code.
