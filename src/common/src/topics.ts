/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/*  the well-known MQTT topic structure used by the messaging/relay layer  */
export const TopicPrefix = "broadcast"

/*  derive the MQTT topic for the state of a particular broadcast  */
export function topicState (broadcastId: string): string {
    return `${TopicPrefix}/${broadcastId}/state`
}

/*  derive the MQTT topic for the chat/comment stream of a broadcast  */
export function topicMessages (broadcastId: string): string {
    return `${TopicPrefix}/${broadcastId}/messages`
}

/*  derive the MQTT topic for the participant presence of a broadcast  */
export function topicPresence (broadcastId: string): string {
    return `${TopicPrefix}/${broadcastId}/presence`
}
