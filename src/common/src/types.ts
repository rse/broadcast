/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/*  the role of a participant in a broadcast  */
export type Role =
    "viewer"    |
    "presenter" |
    "moderator" |
    "operator"

/*  the lifecycle state of a broadcast  */
export type BroadcastState =
    "scheduled" |
    "live"      |
    "paused"    |
    "ended"

/*  a single broadcast (live event)  */
export type Broadcast = {
    id:          string
    title:       string
    description: string
    state:       BroadcastState
    startsAt:    string            /*  ISO-8601 timestamp  */
    endsAt:      string | null     /*  ISO-8601 timestamp  */
}

/*  a participant connected to a broadcast  */
export type Participant = {
    id:          string
    name:        string
    role:        Role
}

/*  a free-form chat/comment message  */
export type Message = {
    id:          string
    broadcastId: string
    author:      Participant
    text:        string
    sentiment?:  Sentiment
    language?:   string            /*  ISO-639-1 language code  */
    timestamp:   string            /*  ISO-8601 timestamp  */
}

/*  a sentiment-analysis result  */
export type Sentiment = {
    score:       number            /*  normalized [ -1, +1 ]  */
    label:       "negative" | "neutral" | "positive"
}

/*  the generic envelope of every message exchanged over the MQTT relay  */
export type Envelope<T = unknown> = {
    type:        string
    from:        string            /*  participant or service id  */
    timestamp:   string            /*  ISO-8601 timestamp  */
    payload:     T
}
