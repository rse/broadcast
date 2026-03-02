
Architecture
============

Architecture Overview
---------------------

![architecture overview](./4-architecture-view.svg "Architecture Overview")

- Layer (1) is the client layer and contains the web user interface of
  msg broadcast.

- Layer (2) is a cloud layer used for static content and video
  distribution to support a stable and fast delivery for those contents.

- Layer (3) is a layer for routing incoming requests to a bunch of proxy
  instances. It separates the environments and uses round-robin for load
  balancing purposes.

- Layer (4) is the proxy layer for all incoming HTTP and WS Requests of
  a specific environment. It proxies the proper requests to either the
  relay layer or the service layer. Several instances ensure the proper
  scaling per environment.

- Layer (5) is the relay layer used for handling thousands of
  bidirectional web sockets. Several instances ensure the proper scaling
  and response times.

- Layer (6) is the service layer. It contains the business services of
  msg.broadcast and therefore the main server logic.

- Layer (7) is the database layer and contains the database for all
  business objects.

Communication
-------------

    - HTTP: /*
      static content (SPA)
      . attendees
      . presenter
      . moderator
      (event-relationship logic)

    - HTTP: /manager/*
      static content (SPA)
      . manager
      (standalone/non-event-relationship logic)

### Authentication

    - C>S: auth-request
      . in: email
      . in: eventId?
      . out: -
      (REST or MQTT)

    - C>S: auth-proof
      . in: email
      . in: token
      . in: eventId?
      . out: JWT
      (REST or MQTT)

    - C>S: auth-validate
      . in: JWT
      . out: isValid
      (REST or MQTT)

    - C<S: auth-invalidate
      . in: -
      . out: -
      (MQTT)

    - C>S: auth-logout
      . in: JWT
      . out: -
      (REST or MQTT)

### Event

    - C>S: A: GET    /event/
      (REST)
    - C>S: C: PUT    /event/
      (REST)
    - C>S: R: GET    /event/<id>
      (REST)
    - C>S: U: PATCH  /event/<id>
      (REST)
    - C>S: D: DELETE /event/<id>
      (REST)

### Stream

    - C<S: event-state-changed
      (MQTT)
    - C<S: event-attendee-change (number of sessions valid on event)
      (MQTT)
    - C<S: event-reconfigured
      (MQTT)
    - C<S: stream-change
      (MQTT)

### Message

    - C>S: message-create
      (REST)
    - C>S: message-delete
      (REST)
    - C>S: message-change
      (REST)
    - C<S: message-changed (like, moderated, created)
      (MQTT)
    - C>S: message-like
      (REST)

### NLP

    - C>S: language-identify (eher client)
      (none)
    - C>S: sentiment-analyis (eher client, aber auch server)
      (REST)
    - C>S: message-translate (for preview)
      (REST)

Configuration
-------------

### Event

    - Name:  DTH-20231211
    - Begin: 2023-12-11 13:00:00
    - End:   2023-12-11 14:00:00
    - Publically-Visible: false
    - Streams:
      - 3Q:DE/<id>/enabled
      - 3Q:EN/<id>/enabled
      - YT:DE/<id>/disabled
      - YT:EN/<id>/disabled
    - Interactions:
      - Chat-Enabled: true
      - Chat-Sender-Name: false
      - Questions-Enabled: true
      - Questions-Sender-Name: false
      - Votes-Enabled: false
      - Votes-Abstain: true
      - Emotions-Enabled: false
      - ...
    - Access:
      - *
      - john.doe@msg.hroup
      - ...

### Provider

    iframe:
        <iframe width="100%" height="100%" src=""
        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

    provider:

        - id:          YT
          name:        YouTube Live Event
          home:        https://www.youtube.com/
          docs:        https://www.youtube.com/howyoutubeworks/product-features/live/
          hints:
              pros:    low latency, high performance, free of charge
              cons:    advertisement at end of stream
          params:
              - streamKey
              - streamId
              - backup
          ingest:
              rtmp:    rtmp://{{ backup ? "b" : "a" }}.rtmp.youtube.com/live2{{ backup ? "?bac" : "" }}!{{ streamKey }}
          egress:
              preview: https://www.youtube{{ privacy ? "-nocookie" : "" }}.com/watch?v={{ streamId }}&autoplay=1
              embed:   https://www.youtube{{ privacy ? "-nocookie" : "" }}.com/embed/{{ streamId }}&autoplay=1
              hls:     https://ythls.onrender.com/video/{{ streamId }}.m3u8

        - id:          CF
          name:        Cloudflare Stream
          home:        https://cloudflare.com/
          docs:        https://developers.cloudflare.com/stream/
          hints:
              pros:    low latency, high performance, low price, WebRTC support
              cons:    none
          params:
              - streamKey
              - streamId
          ingest:
              rtmp:    rtmps://live.cloudflare.com:443/live/!{{ streamKey }}
              webrtc:  https://customer-{{ customerId }}.cloudflarestream.com/{{ streamKey }}/webRTC/publish
          egress:
              rtmp:    rtmps://live.cloudflare.com:443/live/{{ streamId }}
              preview: https://customer-{{ customerId }}.cloudflarestream.com/{{ streamId }}/watch
              embed:   https://customer-{{ customerId }}.cloudflarestream.com/{{ streamId }}/iframe?autoplay=true&muted=true
              hls:     https://customer-{{ customerId }}.cloudflarestream.com/{{ streamId }}/manifest/video.m3u8{{ "llhls" ? "?protocol=llhls" : "" }}
              dash:    https://customer-{{ customerId }}.cloudflarestream.com/{{ streamId }}/manifest/video.mpd
              webrtc:  https://customer-{{ customerId }}.cloudflarestream.com/{{ streamId }}/webRTC/play

        - id:          TW
          name:        Twitch
          home:        https://twitch.tv/
          docs:        https://dev.twitch.tv/docs/
          hints:
              pros:    low latency, high performance, free of charge
              cons:    streams always publically visible, single stream per channel/user
          params:
              - streamKey
              - channelId
              - domain
              - test
          ingest:
              rtmp:    rtmp://fra06.contribute.live-video.net/app/{{ streamKey }}{{ test ? "?bandwidth_test=true" : "" }}
          egress:
              preview: https://www.twitch.tv/{{ channelId }}
              embed:   https://player.twitch.tv/?channel={{ channelId }}&parent={{ domain }}&autoplay=true&muted=true

        - id:          3Q
          name:        3Q
          home:        https://3q.video/
          docs:        https://docs.3q.video/
          hints:
              pros:    GDPR compliant german provider, stable service, decent price
              cons:    none
          params:
              - eventId
              - streamKey
              - playoutId
              - backup
          ingest:
              rtmp:    rtmp://de-origin-ingest-live{{ backup ? "-02" : "" }}.3qsdn.com/{{ eventId }}!{{ streamKey }}
          egress:
              preview: https://playout.3qsdn.com/embed/{{ playoutId }}
              embed:   ?

        - id:          MF
          name:        msg Filmstudio
          home:        https://studio.msg.team/
          docs:        https://studio.msg.team/ 
          hints:
              pros:    company resource only
              cons:    company resource only
          params:
              - streamId
              - streamKey
          ingest:
              rtmp:    rtmp://studio.msg.team:1935/live/{{ streamId }}!{{ streamKey }}
              srt:     srt://studio.msg.team:4444?streamid=live/{{ streamId }}
          egress:
              rtmp:    rtmp://studio.msg.team:1935/live/{{ streamId }}
              srt:     srt://studio.msg.team:445?streamid=live/{{ streamId }}
              preview: https://studio.msg.team/stream/#/live/{{ streamId }}/sldp
              embed:   https://studio.msg.team/stream/#/live/{{ streamId }}
              hls:     https://studio.msg.team:8443/live/{{ streamId }}/playlist.m3u8
              hls+cdn: https://frontend.msg-cdn.com/live-cdn/{{ streamId }}/playlist.m3u8

        - id:          MB
          name:        msg Broadcast
          home:        https://stream.msg-broadcast.com/
          docs:        https://stream.msg-broadcast.com/
          hints:
              pros:    company resource only
              cons:    company resource only
          params:
              - streamId
              - username
              - password
          ingest:
              rtmp:    rtmp://stream.msg-broadcast.com:1935/{{ streamId }}?username={{ username }}&password={{ password }}
              srt:     srt://stream.msg-broadcast.com:4455?pkt_size=1316&streamid=publish:{{ streamId }}:{{ username }}:{{ password }}
              whip:    https://{{ username }}:{{ password }}@stream.msg-broadcast.com/{{ streamId }}/whip
              webrtc:  https://{{ username }}:{{ password }}@stream.msg-broadcast.com/{{ streamId }}/publish
          egress:
              rtmp:    rtmp://stream.msg-broadcast.com:1935/{{ streamId }}
              srt:     srt://stream.msg-broadcast.com:4455?pkt_size=1316&streamid=read:{{ streamId }}
              whep:    https://{{ username }}:{{ password }}@stream.msg-broadcast.com/{{ streamId }}/whep
              webrtc:  https://stream.msg-broadcast.com/test/
              preview: https://stream.msg-broadcast.com/test/
              embed:   https://stream-hls.msg-broadcast.com/test/
              embed+cdn: https://stream-cdn.msg-broadcast.com/test/
              hls:     https://stream-hls.msg-broadcast.com/test/index.m3u8
              hls+cdn: https://stream-cdn.msg-broadcast.com/test/index.m3u8

        - id:          XX
          name:        Arbitrary Provider
          home:        none
          docs:        none
          hints:
              pros:    none
              cons:    none
          params:
              - ingestURL
              - previewURL
              - embedURL
          ingest:
              rtmp:    {{ ingestURL }}
          egress:
              preview: {{ previewURL }}
              embed:   {{ embedURL }}

