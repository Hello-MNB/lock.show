import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Local dev: web on 5173, AI/api on 8787. /api/* is proxied to the local server.
// VitePWA adds an installable manifest + a service worker (offline app-shell).
//
// MODE `embed` (8 Jul 2026, founder decision — public signup): builds the app
// under /app/ straight into website-next/public/app, so the PUBLIC website
// project serves the real app same-origin (lock.show/app).
// PWA is OFF in embed — a service worker under the marketing origin would cache
// the app with root-scoped fallbacks and serve stale shells. The standalone
// build (dedicated Vercel project, app.lock.show) keeps the PWA.
export default defineConfig(({ mode }) => {
  const embed = mode === 'embed'
  return {
    base: embed ? '/app/' : '/',
    plugins: [
      react(),
      ...(embed ? [] : [VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'LOCK',
          short_name: 'LOCK',
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
          // Apply new versions IMMEDIATELY — without these, an installed PWA
          // kept serving the OLD cached app for a full extra visit, trapping
          // users (incl. Maria, 9 Jul) on stale code after every deploy.
          // skipWaiting: the new SW activates at once; clientsClaim: it takes
          // control of already-open tabs; cleanupOutdatedCaches: purge old.
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
        },
        devOptions: { enabled: false },
      })]),
    ],
    ...(embed ? { build: { outDir: 'website-next/public/app', emptyOutDir: true } } : {}),
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  }
})
