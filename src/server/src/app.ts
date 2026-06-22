/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import cluster                        from "node:cluster"
import { Command, CommanderError, Option } from "commander"
import Log                            from "./app-log.js"
import Service                        from "./app-service.js"
import DB                             from "./app-db-dao.js"
import { loadConfig, redactConfig, type Config, type ConfigCliOverrides } from "./app-config.js"
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
    workers?:       number
}

/*  the backoff delay (in milliseconds) before respawning a worker that
    died unexpectedly, to avoid a tight crash-loop hammering the broker/DB  */
const respawnDelay = 1000

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
        .option("-w, --workers        <count>", "number of worker processes", (value: string) => {
            const n = Number(value)
            if (!Number.isInteger(n) || n < 1)
                throw new CommanderError(1, "broadcast.invalidWorkers",
                    `option '-w, --workers <count>' must be a positive integer, got "${value}"`)
            return n
        })
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
        logLevel:      fromCli("logLevel"),
        workers:       fromCli("workers")
    }

    /*  load, merge, and validate the layered configuration, then adjust the
        logger to the resolved log level and emit a redacted dump for tracing
        (performed once, in whichever process reaches here; the primary then
        forks workers which inherit this resolved configuration)  */
    const config = loadConfig(cli)
    log.logLevel(config.logLevel)
    log.write("debug", `configuration: ${JSON.stringify(redactConfig(config))}`)

    /*  dispatch into the cluster primary (supervisor) or a worker (service):
        the primary always pre-forks "workers" worker processes -- even for a
        single worker -- so the process model stays uniform  */
    await (cluster.isPrimary ? primary(config) : worker(config))
}

/*  the cluster primary (supervisor): pre-forks the configured number of
    worker processes, supervises their lifecycle (respawning unexpectedly
    dead workers with a short backoff), and forwards termination signals  */
const primary = async (config: Config): Promise<void> => {
    log.setWorker(`primary:${process.pid}`)
    process.title = `broadcast server [primary:${process.pid}]`
    log.write("info", `pre-forking ${config.workers} worker process(es)`)

    /*  track whether we are shutting down, so a worker exit during shutdown
        is not mistaken for an unexpected death that needs respawning  */
    let shuttingDown = false

    /*  fork a single worker process  */
    const fork = () => cluster.fork()

    /*  respawn an unexpectedly dead worker after a short backoff delay  */
    const respawn = () => {
        if (shuttingDown)
            return
        setTimeout(() => {
            if (!shuttingDown)
                fork()
        }, respawnDelay).unref()
    }

    /*  observe worker lifecycle  */
    cluster.on("exit", (w, code, signal) => {
        const how = signal === null ? `code ${code}` : `signal ${signal}`
        if (shuttingDown)
            log.write("info", `worker process ${w.process.pid} exited (${how})`)
        else {
            log.write("warning", `worker process ${w.process.pid} died unexpectedly (${how}), respawning`)
            respawn()
        }
    })

    /*  pre-fork the configured number of workers  */
    for (let i = 0; i < config.workers; i++)
        fork()

    /*  gracefully handle termination by forwarding it to all workers and
        exiting once the last worker is gone  */
    const shutdown = () => {
        if (shuttingDown)
            return
        shuttingDown = true
        log.write("info", "shutting down, terminating worker processes")
        for (const w of Object.values(cluster.workers ?? {}))
            w?.kill("SIGTERM")
        const settle = setInterval(() => {
            if (Object.keys(cluster.workers ?? {}).length === 0) {
                clearInterval(settle)
                log.write("info", "graceful process termination")
                process.exit(0)
            }
        }, 100)
        settle.unref()
    }
    process.on("SIGINT",  () => { shutdown() })
    process.on("SIGTERM", () => { shutdown() })
}

/*  a cluster worker (service): runs the actual messaging/persistence service,
    connecting in parallel with its sibling workers to the MQTT broker and
    receiving load-balanced traffic via the broker's shared subscriptions  */
const worker = async (config: Config): Promise<void> => {
    log.setWorker(`worker:${process.pid}`)
    process.title = `broadcast server [worker:${process.pid}]`

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
        log.write("info", "graceful process termination")
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
