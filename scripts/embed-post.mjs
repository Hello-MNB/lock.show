// Post-build for the website embed (`npm run build:embed`):
// 1. Merge the app's public assets into the SITE's public root — the app
//    references some assets by absolute /assets/* paths (icon sprite, demo
//    photo URLs stored in the DB), which must resolve on the site origin.
// 2. Write physical directory indexes for the site's two CTA entry routes —
//    static-host-safe SPA fallbacks (the production host serves cleanUrls
//    directory indexes even where dynamic rewrites are unavailable).
import { cpSync, mkdirSync, copyFileSync } from 'node:fs'

cpSync('public/assets', 'website-next/public/assets', { recursive: true })
// EVERY static app route gets a physical directory index — a refresh or fresh
// open must serve the app, never the site 404 (owner audit 17 Jul: only
// login/signup were covered; /app/artist/home etc. 404'd on refresh).
// Dynamic routes (/passport/:id, /confirm/:token, /invite/:token,
// /evidence/:id) cannot have physical files — they are caught by the site's
// not-found bootstrap (website-next/app/not-found.tsx → /app/?dl=<path>).
// Keep in sync with the static (non-:param) paths in src/App.jsx.
const STATIC_APP_ROUTES = [
  'admin', 'agency', 'agency/radar', 'agency/requests',
  'artist/act/edit', 'artist/claims', 'artist/home', 'artist/offer',
  'artist/passport', 'artist/readiness', 'artist/requests',
  'consent', 'discover', 'forgot-password', 'login', 'onboarding',
  'org/billing', 'org/members', 'org/settings', 'org/upgrade',
  'producer', 'producer/received', 'production', 'production/events',
  'production/requests', 'reset-password', 'select', 'settings', 'signup',
]
for (const route of STATIC_APP_ROUTES) {
  mkdirSync(`website-next/public/app/${route}`, { recursive: true })
  copyFileSync('website-next/public/app/index.html', `website-next/public/app/${route}/index.html`)
}
console.log(`embed post-build: assets merged; ${STATIC_APP_ROUTES.length} route fallbacks written`)
