/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import pino from "pino"

/*  the supported log levels (in increasing verbosity)  */
export type LogLevel = "error" | "warning" | "info" | "debug"

/*  map our log levels onto the Pino log levels  */
const levels: Record<LogLevel, pino.Level> = {
    error:   "error",
    warning: "warn",
    info:    "info",
    debug:   "debug"
}

/*  a minimal leveled logger based on Pino  */
export default class Log {
    private logger: pino.Logger

    constructor (
        private prefix: string,
        private level:  LogLevel = "info"
    ) {
        /*  establish logging facility  */
        this.logger = pino({
            level: levels[this.level],
            formatters: {
                level: (label: string) => ({ level: label.toUpperCase() })
            },
            timestamp: pino.stdTimeFunctions.isoTime,
            transport: {
                target: "pino-pretty",
                options: {
                    colorize:      process.stdout.isTTY,
                    customColors:  "info:blue,warn:yellow,error:red,message:reset",
                    translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l",
                    messageFormat: "[{prefix}] {msg}",
                    ignore:        "pid,hostname,prefix"
                }
            }
        })
    }

    /*  adjust the active log level at runtime  */
    logLevel (level: LogLevel): void {
        this.level = level
        this.logger.level = levels[level]
    }

    /*  query the currently active log level  */
    getLevel (): LogLevel {
        return this.level
    }

    /*  check whether a particular log level is currently enabled  */
    enabled (level: LogLevel): boolean {
        return this.logger.isLevelEnabled(levels[level])
    }

    /*  emit a log message if its level is enabled  */
    write (level: LogLevel, msg: string): void {
        this.logger[levels[level]]({ prefix: this.prefix }, msg)
    }
}
