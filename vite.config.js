import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Local dev: web on 5173, AI/api on 8787. /api/* is proxied to the local server.
// VitePWA adds an installable manifest + a service worker (offline app-shell).
// The SW + manifest are generated in EVERY build (incl. `build:demo`), so the
// public demo on Netlify is installable on a phone (Add to Home Screen).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'GIGPROOF',
        short_name: 'GIGPROOF',
        description: 'Pre-booking proof — evaluate an artist via method-labeled evidence.',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#0E0F13',
        background_color: '#0E0F13',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,woff,ttf}'],
        navigateFallback: '/index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
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
