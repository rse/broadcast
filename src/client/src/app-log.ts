/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import pino          from "pino"
import { DateTime }  from "luxon"

/*  the supported log levels (in increasing verbosity)  */
export type LogLevel = "error" | "warning" | "info" | "debug"

/*  map our log levels onto the Pino log levels  */
const levels: Record<LogLevel, pino.Level> = {
    error:   "error",
    warning: "warn",
    info:    "info",
    debug:   "debug"
}

/*  map the Pino console methods onto a single formatting function  */
const writeConsole = (level: pino.Level, o: any) => {
    const time   = DateTime.now().toUTC().toFormat("yyyy-MM-dd HH:mm:ss.SSS")
    const prefix = o.prefix ?? ""
    const msg    = o.msg    ?? ""
    const method = level === "warn" ? console.warn :
        level === "error" ? console.error :
            level === "debug" ? console.debug : console.info
    method(`[${time}] ${level.toUpperCase()} [${prefix}] ${msg}`)
}

/*  a minimal leveled logger based on Pino (logging to the browser console)  */
export default class Log {
    private logger: pino.Logger

    constructor (
        private prefix: string,
        private level:  LogLevel = "info"
    ) {
        /*  establish logging facility  */
        this.logger = pino({
            level: levels[this.level],
            browser: {
                asObject: true,
                write: {
                    error: (o: any) => writeConsole("error", o),
                    warn:  (o: any) => writeConsole("warn",  o),
                    info:  (o: any) => writeConsole("info",  o),
                    debug: (o: any) => writeConsole("debug", o)
                }
            }
        })
    }

    /*  adjust the active log level at runtime  */
    logLevel (level: LogLevel): void {
        this.level = level
        this.logger.level = levels[level]
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
