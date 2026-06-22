
#   ARCHITECTURE: DEPLOYMENT VIEW (ARCH-DP)

✳   Created:  **2026-06-18 10:18**
✎   Modified: **2026-06-18 10:18**

##  NODE: Client Device <a id="ARCH-DP-client-device"></a>

-   Kind:     Device
-   Platform: Recent web browser on desktop, tablet, or mobile
-   Hosts:    ARCH-FV-client, ARCH-FV-client-nlp
-   Network:  Public internet over HTTPS and WSS

The attendee and operator devices run the web client and local NLP entirely in the browser, **BECAUSE** the solution requires
no installation and must run on both managed and unmanaged devices.

##  NODE: Cloudflare CDN <a id="ARCH-DP-cdn"></a>

-   Kind:     Managed
-   Platform: Cloudflare edge network
-   Network:  Public edge, TLS 443

A Cloudflare CDN edge distributes the static client bundle and static resources close to users, **BECAUSE** static content must
be delivered quickly and stably to a large, distributed audience.

##  NODE: Edge Router <a id="ARCH-DP-router"></a>

-   Kind:     Server
-   Platform: Linux with HAProxy and NFTables
-   Hosts:    ARCH-FV-router
-   Network:  Public ingress, TLS 443, environment separation

The edge router terminates inbound HTTP and WebSocket traffic and round-robins it to per-environment proxies, **BECAUSE** a
single hardened entry point must balance load and isolate environments.

##  NODE: Proxy Tier <a id="ARCH-DP-proxy"></a>

-   Kind:     Server
-   Platform: Linux with HAProxy
-   Hosts:    ARCH-FV-proxy
-   Network:  Private network behind the router

The proxy tier runs several HAProxy instances per environment forwarding to the relay tier, **BECAUSE** per-environment scaling
of request handling needs multiple proxy instances.

##  NODE: Relay Tier <a id="ARCH-DP-relay"></a>

-   Kind:     Server
-   Platform: Linux with Mosquitto and MQTT-Plus
-   Hosts:    ARCH-FV-relay
-   Network:  Private network, WSS upstream

The relay tier runs several MQTT broker instances per environment holding the live WebSocket connections, **BECAUSE**
sustaining thousands of bidirectional connections requires a dedicated, scalable messaging tier.

##  NODE: Service Tier <a id="ARCH-DP-service"></a>

-   Kind:     Container
-   Platform: Junction container running Node.js
-   Hosts:    ARCH-FV-service, ARCH-FV-auth, ARCH-FV-translation, ARCH-FV-statistics, ARCH-FV-junction
-   Network:  Private network to relay and database

The service tier runs the Node.js business services and the Junction orchestrator in containers per environment, **BECAUSE**
containerized services give reproducible, independently scalable business logic.

##  NODE: Database Tier <a id="ARCH-DP-database"></a>

-   Kind:     Server
-   Platform: Linux with PostgreSQL and filesystem storage
-   Hosts:    ARCH-FV-database
-   Network:  Private network, no public exposure

The database tier runs PostgreSQL with filesystem asset storage as the authoritative persistence node, **BECAUSE** durable
state must reside on a protected, non-public node.

##  NODE: Hetzner Data Center <a id="ARCH-DP-datacenter"></a>

-   Kind:     Cluster
-   Platform: Hetzner infrastructure in Nürnberg, Germany
-   Hosts:    ARCH-FV-router, ARCH-FV-proxy, ARCH-FV-relay, ARCH-FV-service, ARCH-FV-database
-   Network:  EU-resident private network with public ingress

All server-side tiers are hosted in the Hetzner Nürnberg data center separated into dev, QA, and production environments,
**BECAUSE** EU-resident self-hosting satisfies GDPR and minimizes per-event cost versus public cloud.
