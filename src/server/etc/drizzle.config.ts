/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { defineConfig } from "drizzle-kit"

/*  Drizzle Kit configuration for generating and applying SQL migrations from
    the schema definition in "src/app-db-ddl.ts". The database connection string
    is read from the project-namespaced BROADCAST_DB_URL environment variable,
    the very same source the server itself defaults to.  */
export default defineConfig({
    dialect:    "postgresql",
    schema:     "./src/app-db-ddl.ts",
    out:        "./etc/migrations",
    dbCredentials: {
        url:    process.env.BROADCAST_DB_URL ?? ""
    }
})

