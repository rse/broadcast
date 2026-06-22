
#   ARCHITECTURE: CONCURRENCY VIEW (ARCH-CO)

✳   Created:  **2026-06-18 10:18**
✎   Modified: **2026-06-18 10:18**

##  UNIT: Router Process <a id="ARCH-CO-router"></a>

-   Kind:         Process
-   Hosts:        ARCH-FV-router
-   Multiplicity: 1 per data center entry point
-   Coordination: stateless round-robin distribution

The router runs as a single front-door process per data center distributing connections across environments and proxy
instances, **BECAUSE** a stateless balancer can spread load without holding per-connection state.

##  UNIT: Proxy Pool <a id="ARCH-CO-proxy-pool"></a>

-   Kind:         Pool
-   Hosts:        ARCH-FV-proxy
-   Multiplicity: 0..n instances per environment
-   Coordination: shared-nothing behind the router

The proxy layer runs as a pool of independent, stateless reverse-proxy instances per environment, **BECAUSE** request handling
must scale out horizontally to absorb connection spikes.

##  UNIT: Relay Pool <a id="ARCH-CO-relay-pool"></a>

-   Kind:         Pool
-   Hosts:        ARCH-FV-relay
-   Multiplicity: 0..n MQTT broker instances per environment
-   Coordination: MQTT topic subscriptions and broker bridging

The relay layer runs as a pool of Mosquitto/MQTT-Plus broker instances each maintaining thousands of WebSocket connections and
fanning out per-event topics, **BECAUSE** sustaining up to 10000 concurrent connections requires horizontal broker scaling.

##  UNIT: Service Event Loop <a id="ARCH-CO-service-loop"></a>

-   Kind:         EventLoop
-   Hosts:        ARCH-FV-service, ARCH-FV-auth, ARCH-FV-translation
-   Multiplicity: 0..n Node.js instances per environment
-   Coordination: MQTT message passing and database transactions

The service runs as Node.js single-threaded event loops that react to MQTT messages and serialize state changes through
database transactions, **BECAUSE** an event-loop model handles many concurrent I/O-bound interactions without shared-memory
races.

##  UNIT: Statistics Scheduler <a id="ARCH-CO-stats-scheduler"></a>

-   Kind:         Thread
-   Hosts:        ARCH-FV-statistics
-   Multiplicity: 1 active per running event
-   Coordination: timer-driven, writes via database transactions

A scheduled task within the service captures a statistics snapshot every five minutes for each running event, **BECAUSE**
periodic cumulative counts must be produced on a fixed cadence independent of user activity.

##  UNIT: Database Server <a id="ARCH-CO-database"></a>

-   Kind:         Process
-   Hosts:        ARCH-FV-database
-   Multiplicity: 1 primary per environment
-   Coordination: ACID transactions with optimistic concurrency via the ORM

PostgreSQL runs as the single authoritative persistence process per environment serializing concurrent writes through
transactions, **BECAUSE** a single source of truth with ACID guarantees keeps event state consistent under concurrency.
