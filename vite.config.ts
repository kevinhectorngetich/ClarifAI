import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                popup: 'popup.html',
                background: 'src/background.ts',
                content: 'src/content.ts'
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    return chunkInfo.name === 'popup' ? 'popup.js' : '[name].js';
                },
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            }
        },
    },
    define: {
        global: 'globalThis',
    },
})