---
Created:  2026-06-18 10:18
Modified: 2026-10-21 17:58
---

REQS: Non-Functional Requirements (NR)
======================================

-   GROUP: Audience Scale {{audience-scale}};
    The solution serves the full audience of an event at once, from the
    surge at its start to the end of the stream, BECAUSE the reach of a
    production is the very reason for broadcasting it.

-   GROUP: Live Continuity {{live-continuity}};
    A running event proceeds without interruption and stays under the
    control and insight of its managers and the administrator, BECAUSE
    a live audience tolerates neither a pause nor a problem nobody can
    see.

-   GROUP: Data Protection {{data-protection}};
    The personal data of the participants is processed lawfully,
    minimally, and guarded against any unauthorized access, BECAUSE the
    solution borrows that data for an event only.

-   REQUIREMENT: Concurrent Attendee Scale {{attendee-scale}};
    PRIORITY: MUST; CATEGORY: Performance;
    GROUP: [[GROUP:audience-scale]];
    PREMISES: [[PREMISE:audience-bound]], [[PREMISE:start-surge]];
    METRIC: 10000 concurrently connected attendees per event supported;
    The system MUST support up to 10000 attendees connected to a single
    event at the same time, BECAUSE msg Filmstudio video productions
    must reach an audience of 2500 to 10000 attendees simultaneously.

-   REQUIREMENT: Horizontal Scalability {{scalability}};
    PRIORITY: MUST; CATEGORY: Performance;
    GROUP: [[GROUP:audience-scale]];
    PREMISES: [[PREMISE:audience-bound]], [[PREMISE:start-surge]];
    METRIC: 10000 concurrent WebSocket connections per event;
    The system MUST scale horizontally, serving 10000 concurrent
    WebSocket connections per event by adding instances instead of
    enlarging a single one, BECAUSE a single instance cannot handle the
    required connection volume and response times.

-   REQUIREMENT: Streaming Quality {{streaming-quality}};
    PRIORITY: MUST; CATEGORY: Performance;
    GROUP: [[GROUP:audience-scale]];
    PREMISES: [[PREMISE:two-languages]], [[PREMISE:provider-delivery]];
    METRIC: 1920x1080 pixels at 30 fps in 2 languages;
    The system MUST process and distribute video at 1080p30 (1920x1080
    at 30 fps) in both German and English, BECAUSE productions are
    delivered in this defined quality and the two required languages.

-   REQUIREMENT: Provider Failover Continuity {{failover}};
    PRIORITY: MUST; CATEGORY: Reliability;
    GROUP: [[GROUP:live-continuity]];
    QUALIFIES: [[REQUIREMENT:provider-switch]];
    PREMISES: [[PREMISE:provider-delivery]];
    METRIC: all attendee clients on the fallback provider within 10 seconds after the switch;
    When a manager switches a running event to a fallback streaming
    provider, the system MUST move all attendee clients onto it
    automatically within 10 seconds and without user interaction,
    BECAUSE provider outages must not interrupt the live audience.

-   REQUIREMENT: Cross-Browser Compatibility {{browser-compat}};
    PRIORITY: MUST; CATEGORY: Compatibility;
    QUALIFIES: [[REQUIREMENT:browser-access]];
    PREMISES: [[PREMISE:websocket-passage]];
    METRIC: the last 2 major versions of Chrome, Edge, Firefox, and Safari;
    The system MUST run in the last 2 major versions of the web browsers
    Chrome, Edge, Firefox, and Safari without plugins, BECAUSE attendees
    use heterogeneous managed and unmanaged devices.

-   REQUIREMENT: GDPR Compliance {{gdpr}};
    PRIORITY: MUST; CATEGORY: Compliance;
    GROUP: [[GROUP:data-protection]];
    QUALIFIES: [[REQUIREMENT:gdpr-eu]];
    PREMISES: [[PREMISE:eu-hosting]], [[PREMISE:message-personal-data]];
    METRIC: 100 % of personal data processed and hosted within the EU;
    The system MUST process and host all personal data exclusively
    within the EU, BECAUSE the operator is legally bound to the European
    data-protection requirements of the GDPR.

-   REQUIREMENT: Privacy by Design {{privacy}};
    PRIORITY: MUST; CATEGORY: Security;
    GROUP: [[GROUP:data-protection]];
    PREMISES: [[PREMISE:message-personal-data]];
    METRIC: 0 attendee personal-data records retained in the database after the event finish procedure and 0 in the backups later than 7 days thereafter;
    The system MUST retain attendee personal data only until its event
    finishes, anonymizing or deleting all of it as [[RULE:anonymize]]
    defines within the automated finish procedure, BECAUSE minimizing
    personal-data retention is the core privacy guarantee of the product.

-   REQUIREMENT: Time-Limited Access Tokens {{token-strength}};
    PRIORITY: MUST; CATEGORY: Security;
    GROUP: [[GROUP:data-protection]];
    QUALIFIES: [[REQUIREMENT:authentication]], [[REQUIREMENT:automatic-url]];
    PREMISES: [[PREMISE:email-at-hand]], [[PREMISE:email-delivery]];
    METRIC: token expiry <= 5 minutes by default;
    The system MUST use time-limited authorization tokens that by
    default expire within 5 minutes, BECAUSE a long-lived token would
    let unauthorized viewers join the event.

-   REQUIREMENT: Unguessable Event URLs {{url-strength}};
    PRIORITY: MUST; CATEGORY: Security;
    GROUP: [[GROUP:data-protection]];
    QUALIFIES: [[REQUIREMENT:individual-url]];
    PREMISES: [[PREMISE:url-leakage]];
    METRIC: event identifier of the access URL drawn randomly with >= 122 bits of entropy;
    The system MUST use unguessable event URLs, BECAUSE a guessable URL
    would let unauthorized viewers reach the event.

-   REQUIREMENT: Isolated Persistence Node {{data-isolation}};
    PRIORITY: MUST; CATEGORY: Security;
    GROUP: [[GROUP:data-protection]];
    QUALIFIES: [[REQUIREMENT:gdpr-eu]];
    PREMISES: [[PREMISE:message-personal-data]];
    METRIC: 0 routes to the database port from outside the business services;
    The system MUST keep the persistence node reachable from the business
    services alone, with no route from the Internet or from the
    connection-handling tiers, BECAUSE the persisted personal data is
    protected best by a node an attacker of the public entry point
    cannot even address.

-   REQUIREMENT: Event Setup Recovery {{recovery}};
    PRIORITY: MUST; CATEGORY: Reliability;
    GROUP: [[GROUP:live-continuity]];
    PREMISES: [[PREMISE:eu-hosting]];
    METRIC: RPO <= 24 hours (<= 1 hour at the start of an event) and RTO <= 2 hours;
    The system MUST allow the event setups and their messages to be
    restored after a database loss within 2 hours from a backup at most
    24 hours old, and at most 1 hour old at the start of an event, BECAUSE
    a prepared event must not have to be re-entered under time pressure
    on the day of the broadcast.

-   REQUIREMENT: Event-Safe Maintenance {{maintenance-window}};
    PRIORITY: MUST; CATEGORY: Reliability;
    GROUP: [[GROUP:live-continuity]];
    METRIC: 0 rollouts or reconfigurations while an event runs;
    The system MUST be upgraded and reconfigured only while no event
    runs, BECAUSE a live audience cannot be asked to wait for a restart.

-   REQUIREMENT: Live Configuration Latency {{config-latency}};
    PRIORITY: SHOULD; CATEGORY: Performance;
    GROUP: [[GROUP:live-continuity]];
    QUALIFIES: [[REQUIREMENT:config-propagation]];
    METRIC: propagation to all connected clients <= 2 seconds;
    The system SHOULD propagate an event configuration change to all
    connected clients within 2 seconds, BECAUSE managers expect toggles
    such as enabling chat to take effect near-instantly for the live
    audience.

-   REQUIREMENT: Per-Event Cost Efficiency {{cost}};
    PRIORITY: SHOULD; CATEGORY: Constraint;
    PREMISES: [[PREMISE:eu-hosting]];
    METRIC: recurring cost per event below the equivalent Azure or AWS hosting cost;
    The system SHOULD minimize the recurring cost per event by
    self-hosting on Hetzner infrastructure rather than Azure or AWS,
    excluding one-off development cost, BECAUSE low operating cost per
    event is a primary economic justification for building the
    solution.

-   REQUIREMENT: Interaction Abuse Throttling {{throttling}};
    PRIORITY: SHOULD; CATEGORY: Security;
    GROUP: [[GROUP:data-protection]];
    QUALIFIES: [[REQUIREMENT:chat]], [[REQUIREMENT:questions]];
    PREMISES: [[PREMISE:interaction-abuse]];
    METRIC: <= 10 submissions per user per minute by default, configurable per event;
    The system SHOULD throttle chat and question submissions to a
    configurable maximum per user per minute, BECAUSE rate limiting
    prevents denial-of-service abuse of the interaction channels.

-   REQUIREMENT: Start-Surge Asset Delivery {{asset-delivery}};
    PRIORITY: SHOULD; CATEGORY: Performance;
    GROUP: [[GROUP:audience-scale]];
    QUALIFIES: [[REQUIREMENT:browser-access]];
    PREMISES: [[PREMISE:start-surge]];
    METRIC: client bundle delivered within 3 seconds at 10000 simultaneous joins;
    The system SHOULD deliver the static client bundle to each of 10000
    attendees joining within the same minute in at most 3 seconds,
    BECAUSE the audience arrives in a surge right at the start of the
    event and must not be held back by the download.

-   REQUIREMENT: Compile-Time Contract Safety {{contract-safety}};
    PRIORITY: SHOULD; CATEGORY: Maintainability;
    METRIC: 100 % of the client/server message contracts type-checked at build time;
    The system SHOULD catch every mismatch between the message contracts
    of client and server at build time instead of at runtime, BECAUSE a
    contract slip surfacing only during a live event is the costliest
    defect the solution can have.

-   REQUIREMENT: Live Diagnosability {{observability}};
    PRIORITY: SHOULD; CATEGORY: Maintainability;
    GROUP: [[GROUP:live-continuity]];
    QUALIFIES: [[REQUIREMENT:event-stats]], [[REQUIREMENT:debug-stats]];
    METRIC: event counters at most 5 minutes old, every login failure traceable from token states and log;
    The system SHOULD let the administrator see the attendee, channel,
    and authentication-flow counters of a running event with at most 5
    minutes delay and trace every login failure from the recorded token
    states and the log, BECAUSE capacity and access problems must be
    diagnosed while the audience is still online.

-   REQUIREMENT: Mobile Usability {{mobile-usability}};
    PRIORITY: COULD; CATEGORY: Usability;
    QUALIFIES: [[REQUIREMENT:mobile]];
    METRIC: every attendee screen rendered without horizontal scrolling or clipped controls at 360 px viewport width in portrait and landscape;
    The system COULD render the attendee experience responsively for
    mobile phones in landscape and portrait orientation, BECAUSE a
    substantial share of attendees join from mobile devices.
