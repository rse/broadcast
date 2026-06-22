/*
**  Broadcast - Live Event Video Broadcasting Portal
**  Copyright (c) 2025-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

import * as Vite         from "vite"
import VuePlugin         from "@vitejs/plugin-vue"
import TailwindPlugin    from "@tailwindcss/vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import SvgLoader         from "vite-svg-loader"

export default Vite.defineConfig(({ command, mode }) => ({
    logLevel: "info",
    base: "",
    root: "src",
    plugins: [
        VuePlugin(),
        TailwindPlugin(),
        SvgLoader(),
        nodePolyfills({
            include: [ "events", "stream", "path", "fs", "os", "buffer" ],
            globals: { Buffer: true, process: true }
        })
    ],
    css: {
        devSourcemap: mode === "development"
    },
    server: {
        proxy: {
            "/api": {
                target:       "http://127.0.0.1:12346",
                ws:           true,
                changeOrigin: true
            }
        }
    },
    build: {
        target:                 "es2022",
        outDir:                 "../dst",
        assetsDir:              "",
        emptyOutDir:            (mode === "production"),
        chunkSizeWarningLimit:  8000,
        assetsInlineLimit:      0,
        sourcemap:              (mode === "development"),
        minify:                 (mode === "production"),
        reportCompressedSize:   false,
        rollupOptions: {
            input: "src/index.html",
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: (assetInfo) => {
                    let spec = "[name].[ext]"
                    if (assetInfo.names[0].match(/\.(?:ttf|woff2?|eot)$/))
                        spec = `app-font-${assetInfo.names[0]}`
                    return spec
                }
            },
            onwarn: (entry, next) => {
                if (entry.message.match(/node_modules.+Use of eval in/))
                    return
                else
                    return next(entry)
            }
        }
    }
}))
