# GIGPROOF — Demo build & deploy (no secrets)

> ⚠️ **CANON NOTE (added 2 Jul):** `netlify.toml` must NOT exist in the repo (canon rule — real app is Vercel). Netlify Drop here is a **throwaway static demo host ONLY** (drag `dist/`, no repo config, no `netlify.toml`). The real app deploys to **Vercel**. Do not add Netlify config to the codebase.


A **demo / mock mode** that runs the whole app with **no backend** — no Supabase, no OAuth,
no token, no secrets. It uses local fixtures (sample Hebrew data) so you can host a public
URL that shows every screen and persona. Perfect for a quick "see it live" link.

## Deploy in ~30 seconds (Netlify Drop — $0, no account needed)
1. Build the demo (produces the static site in `dist/`):
   ```
   npm run build:demo
   ```
2. Open **https://app.netlify.com/drop**
3. **Drag the `dist` folder** (`C:\Users\user\gigproof\dist`) onto that page.
4. Netlify returns a public `https://…netlify.app` URL → open it on any phone.
   *(Optional: sign in to make the URL permanent; otherwise it's a temporary preview.)*

Alternatives (all $0): `npx vercel deploy --prebuilt` after `npm run build:demo`, or GitHub Pages.
Netlify Drop is fastest because it needs no git and no account.

## Install it on your phone (PWA) 📱
The demo is a **Progressive Web App** — once it's on an HTTPS URL (Netlify gives you one),
you can install it like a native app:
- **iPhone (Safari):** open the URL → Share → **Add to Home Screen**.
- **Android (Chrome):** open the URL → you'll get an **Install app** prompt (or menu → Install).
It launches full-screen (standalone), with an icon on the home screen and a basic offline shell.

What makes it installable (added via `vite-plugin-pwa`): `manifest.webmanifest` (name, theme,
`display: standalone`), a **service worker** (`sw.js`) that precaches the app shell, and app icons
(192 / 512 / maskable / apple-touch / favicon). **Verified:** the SW registers and the manifest
loads with no console errors.
> ⚠️ **Icons are clean PLACEHOLDERS** (ink background + accent ring, canon colors) — not the final
> logo, since the name/brand aren't chosen yet. Swap `public/icon-*.png` when the brand lands.

## What the demo shows
- A **persona switcher** on entry (no login): **אמן · אמרגן · מפיק · סוכנות · אופרטור**.
- **Public Passport** (the buyer/wedge view) with sample data: draw-as-hero **bands** + the
  6 **method-labels** as text+icon (incl. **★ Producer-confirmed**) + the B2 action ladder + sticky CTA.
- **Artist:** full first-run journey — **consent → 6-step onboarding** → dashboard/Mirror, readiness,
  claim review, evidence, the A8 payment banner.
- **Agency:** roster + availability-requests inbox.
- **Operator:** the `/admin` console — stats, **pending payments → "אשר והפעל"**, artists/requests/claims.
- **Producer:** the magic-link confirm screen (`/confirm/...`).
- **EN ⇄ HE** toggle with automatic LTR/RTL. Mobile-first (verified at 360px). **No console errors.**

## Onboarding-in-demo fix (done)
Originally the demo's mock artist was already filled in, so picking "artist" jumped straight to the
dashboard (the onboarding only triggers for an empty profile). **Fixed:** in demo, the **"אני אמן"**
button routes to **`/consent` → `/onboarding`**, so the demo shows the full onboarding flow
("שלב 1 מתוך 6"). The real (non-demo) flow already had onboarding — this only affected the demo path.

## How it works / notes
- Enabled by `VITE_DEMO=1`, set **only** in `.env.demo` (loaded by `--mode demo`). It is **not** in
  `.env.local`, so normal/real mode is unaffected.
- In demo mode `src/lib/supabase.js` exposes no real client; every `src/lib/db.js` function and the
  public `Passport`/`ProducerConfirm` short-circuit to fixtures in `src/lib/demo.js`.
- Demo data is **read-only-ish**: actions (publish, send request, confirm, etc.) succeed visually but
  persist nothing — there is no database.
- **Firewall intact:** fixtures contain only bands + bounded labels — no score / head-count.

## To see the *real* app (live data, all flows truly working)
Demo mode is for showing the UI. For the real thing, apply the Supabase schema + add the
`SUPABASE_SERVICE_ROLE_KEY` and seed test users — see **`SETUP-CHECKLIST.md`** (Phase 1).
