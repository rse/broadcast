
#   ARCHITECTURE: TECHNOLOGY STACK (ARCH-TS)

| Component                      | Product                                | Tier   | When       | Coverage                                                          |
| ------------------------------ | -------------------------------------- | ------ | ---------- | ---------------------------------------------------------------- |
| Client Language                | **TypeScript**                         | Client | Build-Time | *Business Model, Data Conversion, Environment Detection*         |
| Client Task Runner             | **STX**                                | Client | Build-Time | *Dialog Automation*                                              |
| Client Build Tool              | **Vite**                               | Client | Build-Time | *Markup Loading, Markup Generation*                              |
| Client Linting                 | **ESLint**                             | Client | Build-Time | *Smoke Testing*                                                  |
| Styling Framework              | **Tailwind CSS**                       | Client | Build-Time | *Interface Theme, Interface Layouting, Interface Effects*       |
| UI Framework                   | **Vue.js**                             | Client | Run-Time   | *Dialog Structure, Dialog Life-Cycle, Interface Mask, Data Binding* |
| Widget Framework               | **Reka UI**                            | Client | Run-Time   | *Interface Widgets, Interface States, Interface Interactions*   |
| Client Typography              | **TypoPRO**                            | Client | Run-Time   | *Interface Theme*                                               |
| Client Iconography             | **Fontawesome**                        | Client | Run-Time   | *Interface Widgets*                                             |
| Date Management                | **Luxon**                              | Client | Run-Time   | *Value Formatting, Value Parsing, Localization (L10N)*         |
| Client Messaging               | **MQTT-Plus**                          | Client | Run-Time   | *Client Networking, Dialog Communication*                      |
| Client HTTP Client             | **OFetch**                             | Client | Run-Time   | *Client Networking*                                            |
| Client Logging                 | **Pino**                               | Client | Run-Time   | *Execution Tracing*                                            |
| Client Sentiment Analysis      | **natural + @nlpjs/core + multilang-sentiment** | Client | Run-Time   | *Request Validation*                                  |
| Client Language Identification | **tinyld + franc + lande**             | Client | Run-Time   | *Request Validation*                                           |
| Server Language                | **TypeScript**                         | Server | Build-Time | *Component Management, Request Processing*                     |
| Server Task Runner             | **STX**                                | Server | Build-Time | *Environment Detection*                                       |
| Server Linting                 | **ESLint**                             | Server | Build-Time | *Request Validation*                                          |
| Server Messaging               | **MQTT-Plus**                          | Server | Run-Time   | *Server Networking, Component Communication*                  |
| Static Content Server          | **Junction**                           | Server | Run-Time   | *Server Networking, Request Processing*                       |
| Argument Parsing               | **Commander.js**                       | Server | Run-Time   | *Argument Parsing*                                            |
| Server Logging                 | **Pino**                               | Server | Run-Time   | *Execution Tracing*                                           |
| Unique Identifier Generation   | **nanoid**                             | Server | Run-Time   | *Peer Information*                                            |
| AI/LLM Connectivity            | **@ai-sdk**                            | Server | Run-Time   | *Client Networking*                                           |
| Server HTTP Client             | **OFetch**                             | Server | Run-Time   | *Client Networking*                                           |
