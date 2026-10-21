---
Created:  2026-08-30 00:49
Modified: 2026-10-21 14:33
---

APIS: Interface Endpoints (IE)
==============================

ENDPOINT: broadcast-server
--------------------------

-   INTERFACE:   [[INTERFACE:server-cli]]
-   PERMISSIONS: [[PERMISSION:administrator-events]], [[PERMISSION:administrator-channels]],
                 [[PERMISSION:administrator-resources]], [[PERMISSION:administrator-params]],
                 [[PERMISSION:administrator-roles]]
-   OPERATION:   command
-   LOCATOR:     `broadcast-server [options]`

The sole command of the program, which pre-forks the configured number
of worker processes and supervises them, BECAUSE the server is a
long-running daemon whose process model has to stay uniform even for a
single worker.

Before pre-forking, the command loads the layered configuration of the
[[INTERFACE:server-cli]] and brings the database schema up to date,
BECAUSE no worker may operate on an outdated database schema.

A dead worker is respawned after the [[RESPAWN_DELAY]], BECAUSE the
server has to recover from a crashed worker without an operator.

The command runs until it receives a `SIGINT` or `SIGTERM` signal,
which it forwards to all workers before terminating gracefully, BECAUSE
the workers have to close their connections before the process exits.

-   OPTION: --version; ALIAS: `-V`; TYPE: `boolean`; DEFAULT: `false`;
    Prints the name and version of the program and exits,
    BECAUSE the deployed version has to be identifiable.

-   OPTION: --help; ALIAS: `-h`; TYPE: `boolean`; DEFAULT: `false`;
    Prints the usage of the program and exits,
    BECAUSE the options have to be discoverable on the command line.

-   OPTION: --log-level; ALIAS: `-l`; TYPE: [[LogLevel]]; DEFAULT: `info`;
    Overrides the `logLevel` configuration parameter,
    BECAUSE the verbosity has to be raised ad-hoc for troubleshooting.

-   OPTION: --config; ALIAS: `-c`; TYPE: `string`; CONSTRAINT: `readable YAML file`;
    The configuration file of the structure [[Configuration]], merged over the built-in defaults,
    BECAUSE a deployment has to keep its parameters in one versioned file.

-   OPTION: --env; ALIAS: `-e`; TYPE: `string`; CONSTRAINT: `readable dotenv file`;
    The environment file loaded in addition to, and overriding, the `.env` file of the current working directory,
    BECAUSE secrets have to be injected without appearing in the configuration file or the command line.

-   OPTION: --admin-email; ALIAS: `-a`; TYPE: `string`;
    Overrides the `adminEmail` configuration parameter,
    BECAUSE the administrator has to be settable per environment.

-   OPTION: --mqtt-url; ALIAS: `-m`; TYPE: `string`; DEFAULT: [[DEFAULT_MQTT_URL]];
    Overrides the `mqttUrl` configuration parameter,
    BECAUSE the broker differs per environment.

-   OPTION: --db-url; ALIAS: `-D`; TYPE: `string`; DEFAULT: [[DEFAULT_DB_URL]];
    Overrides the `dbUrl` configuration parameter,
    BECAUSE the database differs per environment.

-   OPTION: --directory; ALIAS: `-d`; TYPE: `string`; DEFAULT: [[DEFAULT_DIRECTORY]]; CONSTRAINT: `existing directory`;
    Overrides the `directory` configuration parameter,
    BECAUSE the client bundle may be deployed apart from the server.

-   OPTION: --workers; ALIAS: `-w`; TYPE: `integer`; DEFAULT: `1`; CONSTRAINT: `1..n`;
    Overrides the `workers` configuration parameter,
    BECAUSE the process count has to match the CPU resources of the environment.

-   RESULT: log; TYPE: `text`; ARITY: `*`;
    The log lines written to the standard output, each carrying the timestamp, the level, and the originating primary or
    worker process, with the credentials of all URL-valued parameters redacted,
    BECAUSE the operator has to trace the server without ever seeing a secret.

-   RESULT: exit-code; TYPE: `integer`; CONSTRAINT: `0 or 1`;
    The process exit code, `0` after a graceful termination, after `--help`, and after `--version`, and `1` after a
    usage error, an invalid configuration, a failed database migration, or a failed shutdown,
    BECAUSE the process supervisor has to tell a clean stop from a failure.
