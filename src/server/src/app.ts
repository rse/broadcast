/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import path                  from "node:path"
import { Command, CommanderError, Option } from "commander"
import Log, { type LogLevel } from "./app-log.js"
import Service          from "./app-service.js"
import DB               from "./app-db-dao.js"
import pkg              from "../package.json" with { type: "json" }

/*  the type of the top-level (global) command-line options  */
export type GlobalOpts = {
    logLevel:  LogLevel
    mqttUrl:   string
    dbUrl:     string
    directory: string
}

/*  globally initialize the logger  */
const log = new Log("broadcast", "info")

/*  the main entry point (wrapped in a regular async function to avoid
    top-level await in the long-running daemon process)  */
const main = async (): Promise<void> => {
    /*  establish the top-level program  */
    const program = new Command()
    program
        .name("broadcast-server")
        .usage("[options]")
        .version(`broadcast-server ${pkg.version}`, "-V, --version", "show version information")
        .addOption(new Option("-l, --log-level <level>", "log level")
            .choices([ "error", "warning", "info", "debug" ]).default("info"))
        .option("-m, --mqtt-url  <url>",  "MQTT broker URL", "wss://example:example@127.0.0.1:1883/pr/api/server/?topic=broadcast")
        .option("-D, --db-url    <url>",  "PostgreSQL database URL", process.env.BROADCAST_DB_URL ?? "postgres://127.0.0.1:5432/broadcast")
        .option("-d, --directory <path>", "static content directory", path.resolve(import.meta.dirname, "../../client/dst"))
        .showHelpAfterError()
        .exitOverride()

    /*  parse the command-line options  */
    program.parse(process.argv)
    const opts = program.opts<GlobalOpts>()
    log.logLevel(opts.logLevel)

    /*  establish the persistence layer  */
    const db = new DB(log, opts.dbUrl)
    await db.connect()

    /*  establish the messaging/service layer  */
    const service = new Service(log, opts.mqttUrl, opts.directory)
    await service.connect()

    /*  gracefully handle termination  */
    const shutdown = async () => {
        log.write("info", "shutting down")
        await service.disconnect()
        await db.disconnect()
        process.exit(0)
    }
    process.on("SIGINT",  () => { shutdown().catch(() => process.exit(1)) })
    process.on("SIGTERM", () => { shutdown().catch(() => process.exit(1)) })
}
main().catch((err: unknown) => {
    if (err instanceof CommanderError) {
        if (err.exitCode === 0)
            process.exit(0)
        else
            process.exit(err.exitCode)
    }
    const message = err instanceof Error ? err.message : String(err)
    log.write("error", message)
    process.exit(1)
})
