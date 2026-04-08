
Architecture
============

Architecture Overview
---------------------

![architecture overview](./4-architecture-view.svg "Architecture Overview")

- Layer (1) is the client layer and contains the web user interface of
  broadcast.

- Layer (2) is a cloud layer used for static content
  distribution to support a stable and fast delivery for this content.

- Layer (3) is a layer for routing incoming requests to a bunch of proxy
  instances. It separates the environments and uses round-robin for load
  balancing purposes.

- Layer (4) is the proxy layer for all incoming HTTP and WS Requests of
  a specific environment. It proxies the proper requests to the relay
  layer. Several instances ensure the proper scaling per environment.

- Layer (5) is the relay layer used for handling thousands of
  bidirectional web sockets. Several instances ensure the proper scaling
  and response times.

- Layer (6) is the service layer. It contains the business services of
  broadcast and therefore the main server logic.

- Layer (7) is the database and filesystem layer and contains the
  database for all business objects and all static assets.

