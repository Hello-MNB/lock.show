# P1 — Refresh-Logout Bug: Root Cause + Fix Spec

Owner report (14 Jul 2026): logged in at `www.lock.show/app/login` as
`artist@gigproof.test`, edited artist details, pressed **REFRESH**, and was
ejected from the app ("העיף אותי מהמערכת"). Prior refresh-logout fix
(`await loadProfile` on boot, commit `a8d58a5`) is already an ancestor of the
live build — so this is a DIFFERENT bug.

## VERDICT

**Root cause: SPA deep-link has no server-side fallback on the embed. This is a
hosting / static-export routing gap — NOT an auth/session bug.** It is candidate
**(a) "stale/mis-served embed"**, but the precise mechanism is a missing SPA
catch-all rewrite, not a stale JS bundle.

Candidates (b) localStorage not persisting, (c) autoRefreshToken failure,
(d) `loadProfile` throwing → RequireRole bounce, (e) PKCE `detectSessionInUrl`
misfire are all **ruled out**: on a deep-path reload the LOCK app bundle is never
served, so none of that code runs. The session in `localStorage` is intact; the
app simply never boots to read it.

## EVIDENCE

### 1. The session/auth code is identical across all surfaces
`src/features/auth/AuthProvider.jsx` is **byte-identical** between the embed
build (`370a6a8`), the standalone-live commit (`a874ab5`), and HEAD:

```
git diff --stat 370a6a8 a874ab5 -- src/features/auth/ src/lib/supabase.js src/main.jsx
  (no changes to AuthProvider/supabase/main — only OrgContext analytics import + db.js)
```
So a code-level session difference between embed and standalone is impossible.
The boot logic (`RealAuthProvider`, `AuthProvider.jsx:57-100`) correctly awaits
`getSession()` + `loadProfile` before clearing `loading`, and `getProfile`
(`src/lib/db.js:9-18`) returns `null`/throws into a try/catch that always reaches
`setLoading(false)` — robust. None of it is reached on the failing reload.

### 2. Live HTTP behaviour — the actual reload the browser performs
Reloading a client route issues a real GET to the server for that exact path.
Live results (14 Jul 2026, `curl` via agent proxy):

| Path (www.lock.show — EMBED) | HTTP | Bundle served |
|---|---|---|
| `/app/` | 200 | LOCK app (`index-Dhjy-W_p.js`) |
| `/app/login` | 200 | LOCK app |
| `/app/settings` | **404** | Next **marketing** (`/_next/`) |
| `/app/artist/home` | **404** | Next marketing |
| `/app/onboarding` | **404** | Next marketing |
| `/app/artist/passport` | **404** | Next marketing |
| `/app/passport/demo` | **404** | Next marketing |
| `/app/discover` | **404** | Next marketing |

The artist-edit screen is `/app/settings` (`src/features/auth/Settings.jsx`,
routed at `App.jsx:148`) — or `/app/onboarding` / `/app/artist/home`. **All of
them 404 and serve the marketing 404 page on hard reload.** That is the "threw
me out of the system": the LOCK SPA is replaced by the marketing site's 404.

### 3. Why `/app/` and `/app/login` survive but nothing else does
`website-next/next.config.ts:23` sets `output: 'export'` (Next **static
export** — no server, no runtime rewrites). Next copies `public/` verbatim into
`out/`, so only paths that have a **physical file** exist:

```
website-next/public/app/index.html          → /app, /app/
website-next/public/app/login/index.html     → /app/login
website-next/public/app/signup/index.html    → /app/signup
```

`login/` and `signup/` are hand-created shell copies (a prior whack-a-mole patch
for exactly this problem). Every OTHER client route
(`/settings`, `/artist/*`, `/onboarding`, `/evidence/:id`, `/passport/:id`,
`/agency/*`, `/producer/*`, `/admin`, `/discover`, …) has no file → Vercel
serves `out/404.html`. There is **no SPA catch-all** (`vercel.json` has only
`cleanUrls: true`, no `rewrites`).

### 4. Reproduction note (Playwright)
A live browser drive was attempted with Playwright/Chromium
(`/opt/pw-browsers`). The bundled Chromium **can** reach the loopback agent
proxy (GET `http://127.0.0.1:41991/__agentproxy/status` → 200 in-browser) but
the egress proxy **resets every CONNECT tunnel** to any external host
(`example.com` and `www.lock.show` both → `net::ERR_CONNECTION_RESET`, zero
proxy-side relay failures logged), even with `--ssl-version-max=tls1.2`,
`--disable-quic`, and cert-ignore. Driving a real browser through egress is
blocked in this environment. The mechanism was therefore reproduced at the
authoritative layer — the exact HTTP GETs a browser reload triggers (table
above) — which is precisely and only what determines the outcome, since a 404
marketing page never runs any app JS.

### 5. The standalone is broken the same way (systemic)
`app.lock.show/login` → **404**, `app.lock.show/settings` → **404** (only `/` →
200). The repo-root `vercel.json` also has no `rewrites`. So the SPA-fallback
gap exists on **both** deployments; the owner hit it on the embed because that
is the surface used and they were on a deep path.

## THE FIX (spec for Claude Code — DO NOT rely on the per-route shell hack)

### Fix A (LAUNCH-CRITICAL, embed) — add SPA catch-all rewrite
Edit **`website-next/vercel.json`**:

```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/app/:path*", "destination": "/app/index.html" }
  ]
}
```

- Vercel `rewrites` run **after** the filesystem check, so `/app/assets/*`,
  `/app/`, `/app/login` (real files) are still served directly; only the
  currently-404ing deep routes fall through to `/app/index.html`, which then
  boots the SPA and React Router (basename `/app`) resolves the path
  client-side. `/app/*` is exclusively the embedded app — no marketing route
  lives under `/app`, so there is no collision.
- Once shipped, the hand-created `public/app/login/index.html` and
  `public/app/signup/index.html` shells become redundant (harmless to keep;
  cleaner to delete).
- **CAVEAT to verify on deploy:** with `output: 'export'`, `next.config`
  rewrites are silently dropped (see the file's own comment about silent Vercel
  failures) — but `vercel.json` rewrites are applied by Vercel's platform
  routing layer independently of the framework. Confirm post-deploy:
  `curl -s -o /dev/null -w '%{http_code}' https://www.lock.show/app/settings`
  must return **200** and serve `index-*.js`, not `/_next/`.

### Fix B (LAUNCH-CRITICAL, standalone) — same gap on app.lock.show
Add a root SPA fallback for the Vite deployment. Root **`vercel.json`**:

```json
{
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }],
  "ignoreCommand": "…(keep existing)…"
}
```
Verify: `app.lock.show/settings` must return 200 after deploy.

### Fix C (DURABLE — recommended target, POST-fix) — kill the skew class
The embed is a SECOND copy of the SPA committed as a static bundle
(`website-next/public/app/assets/index-Dhjy-W_p.js`, last rebuilt at `370a6a8`);
the standalone serves a different bundle (`index-BsilpHPv.js`). Two bundles for
one app = recurring version skew (see TECH-UPGRADE-PLAN.md §Embed-vs-standalone).
Durable options:
1. **Single canonical domain:** make `www.lock.show/app/*` a `308` redirect (or
   Vercel proxy `rewrite` to `https://app.lock.show/:path*`) to the standalone
   SPA. One deploy, one bundle, skew impossible. (Verify PWA scope / OAuth
   `redirectTo` origins still line up.)
2. **If the same-origin embed must stay:** add a CI **embed-sync gate** that
   rebuilds `vite build --mode embed` and fails if the committed
   `public/app/assets/*` hash differs — the embed can never silently go stale.

Ship A + B now (launch-critical); adopt C before scaling.
