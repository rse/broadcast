/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/// <reference types="vite/client" />

declare module "*.vue" {
    import type { DefineComponent } from "vue"
    const component: DefineComponent<object, object, any>
    export default component
}

declare module "*.svg" {
    const content: string
    export default content
}

declare module "@nlpjs/core"
declare module "@nlpjs/lang-en"
declare module "@nlpjs/lang-de"
declare module "@nlpjs/sentiment"
declare module "multilang-sentiment"

