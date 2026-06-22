<!--
**
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
**
-->

<template>
    <div class="app">
        <header class="header">
            <i class="fas fa-broadcast-tower"></i>
            <span class="title">Broadcast</span>
            <span class="state" v-bind:class="connected ? 'on' : 'off'">
                {{ connected ? "connected" : "disconnected" }}
            </span>
        </header>
        <main class="messages" ref="list">
            <div class="message" v-for="msg of messages" v-bind:key="msg.id">
                <span class="author">{{ msg.author.name }}</span>
                <span class="text">{{ msg.text }}</span>
                <span class="meta">
                    <span class="lang" v-if="msg.language">{{ msg.language }}</span>
                    <span class="sentiment" v-if="msg.sentiment"
                        v-bind:class="msg.sentiment.label">{{ msg.sentiment.label }}</span>
                    <span class="time">{{ formatTime(msg.timestamp) }}</span>
                </span>
            </div>
        </main>
        <footer class="composer">
            <input class="input" type="text"
                v-model="draft"
                v-on:keyup.enter="send"
                placeholder="Type a message..." />
            <button class="button" v-on:click="send">
                <i class="fas fa-paper-plane"></i>
            </button>
        </footer>
    </div>
</template>

<style lang="stylus">
.app
    width: 100vw
    height: 100vh
    display: flex
    flex-direction: column
    background-color: var(--color-std-bg-1)
    color: var(--color-std-fg-3)

    .header
        display: flex
        align-items: center
        gap: 0.5rem
        padding: 0.75rem 1rem
        background-color: var(--color-std-bg-3)
        .title
            font-weight: 600
            color: var(--color-std-fg-5)
        .state
            margin-left: auto
            font-size: 0.8rem
            &.on
                color: var(--color-acc-fg-3)
            &.off
                color: var(--color-std-fg-1)

    .messages
        flex: 1
        overflow-y: auto
        padding: 1rem
        display: flex
        flex-direction: column
        gap: 0.5rem
        .message
            display: flex
            align-items: baseline
            gap: 0.5rem
            .author
                font-weight: 600
                color: var(--color-acc-fg-3)
            .text
                flex: 1
                color: var(--color-std-fg-4)
            .meta
                display: flex
                gap: 0.5rem
                font-size: 0.75rem
                color: var(--color-std-fg-1)
                .sentiment.positive
                    color: #80c080
                .sentiment.negative
                    color: #c08080

    .composer
        display: flex
        gap: 0.5rem
        padding: 0.75rem 1rem
        background-color: var(--color-std-bg-2)
        .input
            flex: 1
            padding: 0.5rem 0.75rem
            border: none
            border-radius: 0.25rem
            background-color: var(--color-std-bg-4)
            color: var(--color-std-fg-5)
            font-family: var(--font-family)
        .button
            padding: 0.5rem 0.9rem
            border: none
            border-radius: 0.25rem
            background-color: var(--color-acc-bg-3)
            color: var(--color-std-fg-5)
            cursor: pointer
            &:hover
                background-color: var(--color-acc-bg-4)
</style>

<script lang="ts">
import { defineComponent } from "vue"
import { DateTime }        from "luxon"
import type { Message }    from "broadcast-common"
import Service             from "./app-service.js"
import Log                 from "./app-log.js"

export default defineComponent({
    name: "App",
    data () {
        return {
            /*  reactive component state  */
            broadcastId: "demo",
            messages:    [] as Message[],
            draft:       "",
            connected:   false,

            /*  non-reactive service handle  */
            service:     null as Service | null
        }
    },
    async mounted () {
        /*  establish the messaging/service layer  */
        const log = new Log("broadcast")
        this.service = new Service(log, "wss://127.0.0.1:8443/pr/api/client/")
        await this.service.connect()
        this.connected = true

        /*  consume the "broadcast/hello" service  */
        const reply = await this.service.hello("World")
        log.write("info", `broadcast/hello reply: ${reply}`)
    },
    async beforeUnmount () {
        /*  tear down the messaging/service layer  */
        if (this.service !== null) {
            await this.service.disconnect()
            this.service = null
            this.connected = false
        }
    },
    methods: {
        /*  format an ISO-8601 timestamp for display  */
        formatTime (timestamp: string): string {
            return DateTime.fromISO(timestamp).toFormat("HH:mm:ss")
        },

        /*  send the currently drafted message  */
        send (): void {
            const text = this.draft.trim()
            if (text === "")
                return
            this.draft = ""
        }
    }
})
</script>
