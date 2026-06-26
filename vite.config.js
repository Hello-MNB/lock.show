import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local dev: the web app runs on 5173, the AI/api server on 8787.
// /api/* is proxied to the local express server so the Anthropic key
// never reaches the browser. On deploy these become serverless routes.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
