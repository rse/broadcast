/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import MQTT, { type MqttClient }     from "mqtt"
import MQTTp, { type Service as Svc } from "mqtt-plus"
import { JunctionBackend }           from "@rse/junction"
import Log, { type LogLevel }        from "./app-log.js"
import { nanoid }                    from "nanoid"

/*  the typed MQTT+ API contract provided by this server  */
type API = {
    "broadcast/hello": Svc<(name: string) => string>
}

/*  the messaging/service layer, bridging the application to the MQTT broker
    via MQTT.js (low-level transport) and MQTT+ (high-level patterns)  */
export default class Service {
    private mqtt:    MqttClient      | null = null
    private api:     MQTTp<API>      | null = null
    private backend: JunctionBackend | null = null

    constructor (
        private log:       Log,
        private url:       string,
        private directory: string
    ) {}

    /*  establish the connection to the MQTT broker and provide all services  */
    async connect (): Promise<void> {
        /*  determine connect information from MQTT URL  */
        const url = new URL(this.url)
        const username    = url.username; url.username = ""
        const password    = url.password; url.password = ""
        const pathname    = url.pathname; url.pathname = ""
        const topicPrefix = (url.searchParams.get("topic") ?? "").replace(/^\//, "").replace(/\/$/, "")
        url.search = ""

        /*  establish the low-level MQTT.js transport connection  */
        this.log.write("info", `connecting to MQTT broker at ${this.url}`)
        const mqtt = MQTT.connect(this.url, {
            clientId: `broadcast-server-${nanoid()}`,
            path: pathname,
            ...(username !== undefined && username !== "" ? { username } : {}),
            ...(password !== undefined && password !== "" ? { password } : {}),
            rejectUnauthorized: false,
            wsOptions: { rejectUnauthorized: false },
            log: (...args: any[]) => {
                const msg = args.map((a) =>
                    typeof a === "string" ? a : JSON.stringify(a)
                ).join(" ")
                this.log.write("debug", `MQTT: ${msg}`)
            }

        })
        await new Promise<void>((resolve, reject) => {
            const timeout = 10 * 1000
            const timer = setTimeout(() => {
                mqtt.off("error", onError)
                mqtt.off("connect", onConnect)
                mqtt.end(true)
                reject(new Error(`timeout of ${timeout}ms while connecting to MQTT broker`))
            }, timeout)
            const onConnect = () => {
                clearTimeout(timer)
                mqtt.off("error", onError)
                resolve()
            }
            const onError = (err: Error) => {
                clearTimeout(timer)
                mqtt.off("connect", onConnect)
                reject(err)
            }
            mqtt.on("error",   onError)
            mqtt.on("connect", onConnect)
        })
        this.mqtt = mqtt
        this.log.write("info", `connected to MQTT broker at ${this.url}`)

        /*  observe MQTT broker connection situation  */
        mqtt.on("reconnect", () => {
            this.log.write("info", "reconnecting to MQTT broker")
        })
        mqtt.on("connect", () => {
            this.log.write("info", "reconnected to MQTT broker")
        })
        mqtt.on("offline", () => {
            this.log.write("warning", "disconnected from MQTT broker (now offline)")
        })
        mqtt.on("close", () => {
            this.log.write("warning", "connection to MQTT broker closed")
        })
        mqtt.on("disconnect", () => {
            this.log.write("warning", "disconnected from MQTT broker (by broker request)")
        })
        mqtt.on("error", (err: Error) => {
            this.log.write("error", `MQTT broker connection error: ${err.message}`)
        })

        /*  establish the high-level MQTT+ API layer  */
        /*  enabling MQTT+ facility  */
        this.log.write("info", "enabling MQTT+ service")
        const prefix    = topicPrefix === "" ? "" : `${topicPrefix}/`
        const prefixRe  = topicPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const prefixReP = topicPrefix === "" ? "" : `${prefixRe}\\/`
        const topicRe   = new RegExp(`^${prefixReP}(.+)\\/([^/]+)\\/([^/]+)$`)
        const api = new MQTTp<API>(mqtt, {
            timeout: 10 * 1000,
            codec:   "json",
            topicMake: (name, protocol, peerId) =>
                `${prefix}${name}/${protocol}/${peerId ?? "any"}`,
            topicMatch: (topic) => {
                const m = topic.match(topicRe)
                return m ? {
                    name: m[1],
                    operation: m[2],
                    peerId: m[3] === "any" ? undefined : m[3]
                } : null
            }
        })
        this.api = api
        api.on("log", async (log) => {
            const level = log.level as LogLevel
            if (this.log.enabled(level)) {
                await log.resolve()
                this.log.write(level, `MQTT+: ${log.msg}`)
            }
        })

        /*  provide the "broadcast/hello" service  */
        await api.service("broadcast/hello", (name: string) => {
            this.log.write("info", `broadcast/hello: ${name}`)
            return `Hello, ${name}!`
        })

        /*  provide the static client content via the Junction backend
            (re-using its "backend/fetch" serving, but without driving
            its filesystem watcher, so a Junction frontend can fetch it)  */
        this.log.write("info", `serving static content from ${this.directory} via Junction`)
        const level = this.log.getLevel()
        const backend = new JunctionBackend({
            directory: this.directory,
            mqtt,
            topic:     topicPrefix,
            logLevel:  level === "warning" ? "warn" : level,
            watch:     false,
            exclude:   [],
            timeout:   10 * 1000,
            codec:     "json"
        })
        await backend.start()
        this.backend = backend
    }

    /*  gracefully tear down the API layer and close the broker connection  */
    async disconnect (): Promise<void> {
        if (this.backend !== null) {
            await this.backend.stop()
            this.backend = null
            this.log.write("info", "stopped serving static content via Junction")
        }
        if (this.api !== null) {
            await this.api.destroy()
            this.api = null
            this.log.write("info", "disabled MQTT+ service")
        }
        if (this.mqtt !== null) {
            await this.mqtt.endAsync(true)
            this.mqtt = null
            this.log.write("info", "disconnected from MQTT broker")
        }
    }
}
