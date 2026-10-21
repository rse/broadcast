---
Created:  2026-08-30 00:49
Modified: 2026-10-21 17:58
---

APIS: Interface Model (IM)
==========================

INTERFACE: Server Command Line {{server-cli}}
------------------------------

-   KIND:      CLI
-   LOCATION:  `broadcast-server`
-   CONSUMERS: [[PERSONA:administrator]]

The command-line program starting the server process of the service
layer, BECAUSE the administrator and the deployment automation need one
uniform entry point to run the long-running server in every environment.

The program resolves its runtime parameters from the layered
configuration of built-in defaults, an optional YAML configuration file,
`BROADCAST_*` environment variables, and the command-line options (in
increasing precedence), BECAUSE the administrator and the deployment
automation have to start the very same server with different parameters
per environment without changing any file.

INTERFACE: Event Topics {{event-topics}}
-----------------------

-   KIND:      MQTT
-   LOCATION:  topic prefix `broadcast/` on the relay brokers reached through `mqttUrl`

The per-event MQTT topics over which the web client and the service
exchange the live configuration, the messages, the likes, and the
moderation outcomes in both directions, BECAUSE every live capability
is expressed as messages on per-event topics
([[DECISION:mqtt-transport]]), whose contract both sides have to honor
alike.
