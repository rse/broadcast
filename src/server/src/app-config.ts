/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import fs           from "node:fs"
import path         from "node:path"
import * as dotenvx  from "@dotenvx/dotenvx"
import { parse as parseYAML } from "yaml"
import * as v        from "valibot"
import deepmerge     from "deepmerge"
import objectPath    from "object-path"

/*  the canonical, schema-first configuration declaration: this single
    valibot schema defines the configuration's shape, its validation rules,
    and (by its key names) the surface of recognized BROADCAST_* environment
    variable overrides. It is intentionally "strict", so any unrecognized
    key (a typo in the YAML file or a stray BROADCAST_* variable) fails fast
    at startup instead of being silently ignored.  */
export const ConfigSchema = v.strictObject({
    adminUsername: v.pipe(v.string(), v.minLength(1)),
    adminPassword: v.pipe(v.string(), v.minLength(1)),
    mqttUrl:       v.pipe(v.string(), v.minLength(1)),
    dbUrl:         v.pipe(v.string(), v.minLength(1)),
    directory:     v.pipe(v.string(), v.minLength(1)),
    logLevel:      v.picklist([ "error", "warning", "info", "debug" ]),
    workers:       v.pipe(
        /*  coerce a string-valued source (an env or YAML "4") to a number,
            then require a positive integer worker count  */
        v.union([ v.number(), v.pipe(v.string(), v.transform(Number)) ]),
        v.number(), v.integer(), v.minValue(1)
    )
})

/*  the resulting, validated configuration type (inferred from the schema)  */
export type Config = v.InferOutput<typeof ConfigSchema>

/*  the optional top-precedence overrides coming from the command-line  */
export type ConfigCliOverrides = {
    config?:        string
    env?:           string
    adminUsername?: string
    adminPassword?: string
    mqttUrl?:       string
    dbUrl?:         string
    directory?:     string
    logLevel?:      string
    workers?:       number
}

/*  the base-layer defaults (lowest precedence), supplying every value the
    server needs to start without any external configuration at all  */
const defaults: Record<string, unknown> = {
    mqttUrl:   "wss://example:example@127.0.0.1:1883/pr/api/server/?topic=broadcast",
    dbUrl:     "postgres://127.0.0.1:5432/broadcast",
    directory: path.resolve(import.meta.dirname, "../../client/dst"),
    logLevel:  "info",
    workers:   1
}

/*  redact the credentials (userinfo) of a URL so it can be safely logged  */
export const redactUrl = (url: string): string => {
    try {
        const u = new URL(url)
        if (u.username !== "" || u.password !== "") {
            u.username = "***"
            u.password = ""
        }
        return u.toString()
    }
    catch {
        return url
    }
}

/*  internal helper: recognize a plain object (used both for the top-level
    YAML mapping check and as deepmerge's notion of a mergeable value)  */
const isPlainObject = (x: unknown): x is Record<string, unknown> =>
    typeof x === "object" && x !== null && !Array.isArray(x)

/*  internal helper: recursively deep-merge plain objects (later sources win),
    so a nested "xxx.yyy.zzz" override only touches its leaf key and leaves
    sibling keys of the same parent object untouched. Array-valued (and any
    other non-plain-object) values are overwritten wholesale by the source,
    rather than deepmerge's default of concatenating arrays.  */
const deepMerge = (target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> =>
    deepmerge(target, source, {
        isMergeableObject: isPlainObject,
        arrayMerge:        (_target, source) => source
    }) as Record<string, unknown>

/*  internal helper: transform a single "FOO_BAR" underscore-separated key
    segment into its "fooBar" camelCase counterpart  */
const camelCase = (s: string): string =>
    s.toLowerCase().replace(/_(?<ch>[a-z0-9])/g, (_, ch: string) => ch.toUpperCase())

/*  internal helper: derive the nested-path overrides from all BROADCAST_*
    environment variables. A variable overrides config parameter xxx.yyy.zzz,
    where a double underscore "__" separates the nesting path segments and a
    single underscore "_" separates the words within one camelCase segment.
    Thus BROADCAST_ADMIN_USERNAME maps to the leaf "adminUsername", while a
    future BROADCAST_FOO__BAR_BAZ would nest to "foo.barBaz".  */
const envOverrides = (env: Record<string, string | undefined>): Record<string, unknown> => {
    const overrides: Record<string, unknown> = {}
    for (const name of Object.keys(env)) {
        if (!name.startsWith("BROADCAST_"))
            continue
        const value = env[name]
        if (value === undefined)
            continue
        const rest = name.slice("BROADCAST_".length)
        if (rest === "")
            continue
        const segments = rest.split("__").map(camelCase)
        objectPath.set(overrides, segments, value)
    }
    return overrides
}

/*  internal helper: strip undefined-valued keys, so an option that was not
    actually provided on the command-line does not override a lower layer  */
const compact = (obj: Record<string, unknown>): Record<string, unknown> => {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(obj))
        if (obj[key] !== undefined)
            out[key] = obj[key]
    return out
}

/*  load, merge, and validate the server configuration from its four layers
    (in increasing precedence): built-in defaults, the optional YAML config
    file (--config), the BROADCAST_* environment variables (from the ambient
    environment and the optional --env / default .env file), and finally the
    explicit command-line option overrides.  */
export const loadConfig = (cli: ConfigCliOverrides): Config => {
    /*  layer 2 (env source): load the default ".env" from the current working
        directory if present, then additionally the explicit --env file whose
        values override the default ".env" (both feed process.env)  */
    dotenvx.config({ quiet: true, ignore: [ "MISSING_ENV_FILE" ] })
    if (cli.env !== undefined)
        dotenvx.config({ path: cli.env, quiet: true, override: true })

    /*  start the merge from the built-in defaults  */
    let merged: Record<string, unknown> = { ...defaults }

    /*  layer 2 (YAML config file): parse and merge the optional --config file  */
    if (cli.config !== undefined) {
        const text = fs.readFileSync(cli.config, "utf8")
        const parsed = parseYAML(text) as unknown
        if (parsed !== null && parsed !== undefined) {
            if (!isPlainObject(parsed))
                throw new Error(`configuration file "${cli.config}" must contain a YAML mapping at its top level`)
            merged = deepMerge(merged, parsed)
        }
    }

    /*  layer 3 (environment): merge the BROADCAST_* environment overrides  */
    merged = deepMerge(merged, envOverrides(process.env))

    /*  layer 4 (command-line): merge the explicit CLI option overrides  */
    merged = deepMerge(merged, compact({
        adminUsername: cli.adminUsername,
        adminPassword: cli.adminPassword,
        mqttUrl:       cli.mqttUrl,
        dbUrl:         cli.dbUrl,
        directory:     cli.directory,
        logLevel:      cli.logLevel,
        workers:       cli.workers
    }))

    /*  validate (and coerce) the fully merged configuration against the
        schema, turning any structural or value violation into a fatal,
        human-readable startup error  */
    try {
        return v.parse(ConfigSchema, merged)
    }
    catch (err: unknown) {
        if (err instanceof v.ValiError) {
            const issues = err.issues
                .map((issue) => {
                    const dotPath = (issue.path ?? [])
                        .map((p: { key?: unknown }) => String(p.key))
                        .join(".")
                    return `${dotPath === "" ? "<root>" : dotPath}: ${issue.message}`
                })
                .join("; ")
            throw new Error(`invalid configuration: ${issues}`, { cause: err })
        }
        throw err
    }
}

/*  render the resolved configuration for logging, with the secret password
    masked and the credentials of all URL-valued parameters redacted  */
export const redactConfig = (config: Config): Record<string, unknown> => ({
    ...config,
    adminPassword: "***",
    mqttUrl:       redactUrl(config.mqttUrl),
    dbUrl:         redactUrl(config.dbUrl)
})
