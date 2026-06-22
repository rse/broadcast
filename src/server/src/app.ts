/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import { Command, CommanderError, Option } from "commander"
import Log                            from "./app-log.js"
import Service                        from "./app-service.js"
import DB                             from "./app-db-dao.js"
import { loadConfig, redactConfig, type ConfigCliOverrides } from "./app-config.js"
import pkg                            from "../package.json" with { type: "json" }

/*  the type of the top-level (global) command-line options  */
export type GlobalOpts = {
    config?:        string
    env?:           string
    logLevel?:      string
    adminUsername?: string
    adminPassword?: string
    mqttUrl?:       string
    dbUrl?:         string
    directory?:     string
}

/*  globally initialize the logger (bootstrapped at the "info" level, then
    re-adjusted to the resolved configuration's log level below)  */
const log = new Log("broadcast", "info")

/*  the main entry point (wrapped in a regular async function to avoid
    top-level await in the long-running daemon process)  */
const main = async (): Promise<void> => {
    /*  establish the top-level program (the runtime parameters now live in
        the layered configuration, so the command-line options carry no
        defaults and act purely as top-precedence overrides)  */
    const program = new Command()
    program
        .name("broadcast-server")
        .usage("[options]")
        .version(`broadcast-server ${pkg.version}`, "-V, --version", "show version information")
        .addOption(new Option("-l, --log-level <level>", "log level")
            .choices([ "error", "warning", "info", "debug" ]))
        .option("-c, --config         <file>", "configuration file (YAML format)")
        .option("-e, --env            <file>", "environment file (dotenv format)")
        .option("-u, --admin-username <name>", "administrator user name")
        .option("-p, --admin-password <pass>", "administrator password")
        .option("-m, --mqtt-url       <url>",  "MQTT broker URL")
        .option("-D, --db-url         <url>",  "PostgreSQL database URL")
        .option("-d, --directory      <path>", "static content directory")
        .showHelpAfterError()
        .exitOverride()

    /*  parse the command-line options and treat each option as a configuration
        override only when it was actually provided on the command-line  */
    program.parse(process.argv)
    const opts = program.opts<GlobalOpts>()
    const fromCli = <K extends keyof GlobalOpts>(name: K): GlobalOpts[K] | undefined =>
        program.getOptionValueSource(name) === "cli" ? opts[name] : undefined
    const cli: ConfigCliOverrides = {
        config:        opts.config,
        env:           opts.env,
        adminUsername: fromCli("adminUsername"),
        adminPassword: fromCli("adminPassword"),
        mqttUrl:       fromCli("mqttUrl"),
        dbUrl:         fromCli("dbUrl"),
        directory:     fromCli("directory"),
        logLevel:      fromCli("logLevel")
    }

    /*  load, merge, and validate the layered configuration, then adjust the
        logger to the resolved log level and emit a redacted dump for tracing  */
    const config = loadConfig(cli)
    log.logLevel(config.logLevel)
    log.write("debug", `configuration: ${JSON.stringify(redactConfig(config))}`)

    /*  establish the persistence layer  */
    const db = new DB(log, config.dbUrl)
    await db.connect()

    /*  establish the messaging/service layer  */
    const service = new Service(log, config.mqttUrl, config.directory)
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
