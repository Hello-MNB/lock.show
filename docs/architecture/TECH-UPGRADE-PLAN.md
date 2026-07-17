# LOCK — Technology Upgrade Work Plan

Scope: React + Vite + Tailwind SPA (`src/`), Express claim-pipeline API
(`server/index.js`), Supabase (ref `qexfndiyallwqhhzeerd`), two Vercel
deployments (standalone `app.lock.show`; embed `www.lock.show/app` via
`website-next` static export). Every item cites real files.

Effort: S (<½ day) · M (1–3 days) · L (>3 days). Priority: **P0** launch-blocker
· **P1** soon · **P2** post-Gate. Gate = 1 booking manager reacts to a real
Passport AND one pays.

---

## LAUNCH-CRITICAL (P0)

### P0-1 · SPA deep-link fallback missing (THE refresh-logout bug)
- **Problem:** `website-next/next.config.ts:23` `output:'export'` + no
  `rewrites` in `website-next/vercel.json` → every `/app/*` route without a
  physical file 404s to the marketing page on reload. Only `/app/`,
  `/app/login`, `/app/signup` have shell files. Same gap on the standalone
  (root `vercel.json` — no rewrites; `app.lock.show/settings` → 404 live).
- **Impact:** Any hard reload / shared deep link / OAuth return to a deep path
  ejects the user from the app. Blocks the Gate (a buyer opening a shared
  `/app/passport/:id` gets a 404).
- **Fix:** add `{ "source":"/app/:path*","destination":"/app/index.html" }` to
  `website-next/vercel.json`; add root Vite SPA fallback. Full spec in
  **P1-REFRESH-LOGOUT-ROOTCAUSE.md** (Fix A + B).
- **Effort:** S · **Risk:** low (rewrites run after filesystem check) ·
  **Priority:** P0.

### P0-2 · Embed-vs-standalone version skew (recurring root cause)
- **Problem:** The app is deployed twice — a committed static copy at
  `website-next/public/app/assets/index-Dhjy-W_p.js` (last rebuilt at commit
  `370a6a8`) and a separately-built standalone bundle (`index-BsilpHPv.js` on
  `app.lock.show`). The two drift whenever `src/` changes without an embed
  rebuild — HEAD already has ~18 `src/` commits after the last embed rebuild
  (`git log 370a6a8..HEAD -- src/`).
- **Impact:** Owner-visible "the live app is behaving like an old version";
  every future session fix must be double-shipped or it silently regresses on
  one surface. This is the structural source of the class the P0-1 bug sits in.
- **Fix (durable):** collapse to a **single canonical app domain** — make
  `www.lock.show/app/*` a Vercel proxy-rewrite (or 308) to `app.lock.show`, so
  there is one build, one bundle. If the same-origin embed must remain, add a
  **CI embed-sync gate**: rebuild `vite build --mode embed` and fail the build
  if the committed `public/app/assets/*` hashes differ.
- **Effort:** M · **Risk:** med (verify PWA scope + OAuth `redirectTo` origins,
  `src/features/auth/AuthProvider.jsx:110,135` use `window.location.origin +
  BASE_URL`) · **Priority:** P0 (do the sync-gate now even if the domain
  collapse is deferred).

### P0-3 · Session-boot resilience — verify the a8d58a5 fix holds on both surfaces
- **Problem:** Boot logic (`src/features/auth/AuthProvider.jsx:57-100`) is
  sound: explicit PKCE `exchangeCodeForSession` before routing, `await
  loadProfile` inside `loading`, try/catch → always `setLoading(false)`. But
  `onAuthStateChange` (line 94-98) calls `loadProfile` **without await** and
  there is no global handler for a Supabase `SIGNED_OUT`/refresh-failure event.
- **Impact:** A genuine refresh-token expiry (e.g. after long idle) will emit
  `SIGNED_OUT` and silently null the session with no user-facing "please log in
  again" — indistinguishable from the P0-1 bug to the owner.
- **Fix:** in `onAuthStateChange`, branch on `TOKEN_REFRESHED` vs `SIGNED_OUT`;
  on `SIGNED_OUT` route to `/login` with a toast rather than a bare bounce. Add
  a boot log line so real logouts are distinguishable from 404 ejections.
- **Effort:** S · **Risk:** low · **Priority:** P0 (needed to tell real
  auth failures apart from P0-1 in pilot).

### P0-4 · Zero automated test coverage of the auth/route contract
- **Problem:** `playwright` is a devDependency (`package.json:38`) but there are
  **no test files** under `src/` and no `test` script. A nav/route contract test
  is referenced in commit history (`e769bc0`) but not runnable in CI here.
- **Impact:** Regressions like P0-1 ship undetected; each surface must be
  hand-QA'd.
- **Fix:** one Playwright smoke spec that, per surface, logs in and **reloads a
  deep route** asserting the app (not a 404) renders — this single test would
  have caught P0-1. Wire into the `verify` chain.
- **Effort:** M · **Risk:** low · **Priority:** P0.

### P0-5 · Artist-edit UX + data-model incompleteness ("UX/UI לא טוב והאפיון לא גמור")
- **Problem:** `src/features/auth/Settings.jsx` — the artist "edit details"
  surface — only edits `full_name` (line 153, → `upsertProfile`), WhatsApp
  number, and a marketing opt-in. The rich artist/Act identity (stage name,
  genre/`format`, bio, territory, links) lives on the `act` table
  (`supabase/migrations/020_acts_spine.sql:41-58`, `format` enum
  dj-set/live-set/duo/…) but has **no coherent edit screen**; onboarding writes
  some of it once and there is no return path to complete it. Save UX is a
  single name field with a flat `saved` boolean (lines 154-155), no field-level
  validation or dirty-state.
- **Impact:** Artists cannot build the "provable professional identity" the
  product promises; buyers see thin Passports → weakens the Gate.
- **Fix:** design a proper per-Act edit form (stage name, format/genre, bio,
  territory/period, links) bound to `act` + `passport_versions`, with
  field-level validation and per-Act switching (multi-Act). Load the
  `artifact-design`/Figma flow for the UX. Data model: confirm `act` carries
  territory/period authority columns (020 shows `format` but territory/period
  per GPT's entity model needs a migration diff before adding — CLAUDE.md:
  migrations 001–036 exist; diff before 037+).
- **Effort:** L · **Risk:** med (touches evidence firewall — edits must stay
  band/binary, never a score) · **Priority:** P0 for a credible pilot Passport.

---

## HIGH (P1)

### P1-1 · Observability — no error reporting
- **Problem:** `src/components/ErrorBoundary.jsx` exists but there is **no
  Sentry/PostHog/LogRocket** (grep clean). Server logs to `console.error` only
  (`server/index.js:135`). A user hitting a white-screen or a 401 leaves no
  trace for the owner.
- **Impact:** Bugs like P0-1 are only found when the owner personally trips
  them; no telemetry to distinguish 404-ejection from token-expiry in the wild.
- **Fix:** add a lightweight error sink (Sentry browser + a server error
  middleware) gated behind the existing consent banner
  (`src/components/ConsentBanner.jsx`) so it respects GA4 consent-mode defaults.
- **Effort:** M · **Risk:** low (consent) · **Priority:** P1.

### P1-2 · State management — provider nesting + refetch on every mount
- **Problem:** `src/main.jsx:15-27` nests Lang→Auth→Org→Toast; `OrgContext`
  `load()` (`src/context/OrgContext.jsx:38-58`) refetches memberships on every
  `user`/`authRole` change with no cache, and `RequireRole`/`RoleHome`
  (`App.jsx:62-118`) block on `orgLoading` for every gated route.
- **Impact:** Extra Supabase round-trips + a `<Loading/>` flash on each guarded
  navigation; a slow membership fetch delays first paint.
- **Fix:** introduce a query cache (TanStack Query) for profile/memberships, or
  memoize with a stale-while-revalidate pattern; keep the provider contract.
- **Effort:** M · **Risk:** med (routing depends on `useOrg().role` timing) ·
  **Priority:** P1.

### P1-3 · Error handling — silent catches swallow real failures
- **Problem:** `OrgContext.load` `catch { setMemberships([]) }`
  (`src/context/OrgContext.jsx:52`) and `switchOrg` swallow errors silently; a
  failed membership load looks like "no workspaces" (could route an artist to
  the wrong home). Server routes wrap in try/catch but return generic shapes.
- **Impact:** Data-load failures masquerade as empty states — hard to diagnose
  in pilot.
- **Fix:** surface load failures as a retryable error state (not silent empty);
  standardize server error envelopes.
- **Effort:** S · **Risk:** low · **Priority:** P1.

### P1-4 · PWA / offline integrity
- **Problem:** App advertises PWA meta (`public/app/index.html` apple-touch,
  mobile-web-app-capable) but there is **no `vite-plugin-pwa`/service worker**
  (grep clean). A cached shell + skewed embed (P0-2) could pin a user to an old
  bundle with no update path.
- **Impact:** If/when a service worker is added without a versioning strategy it
  will deepen the skew problem; today the PWA promise is cosmetic.
- **Fix:** decide PWA in/out. If in: `vite-plugin-pwa` with
  `registerType:'autoUpdate'` + skipWaiting, scoped per canonical domain (ties
  to P0-2).
- **Effort:** M · **Risk:** med · **Priority:** P1.

### P1-5 · Performance budget — single 745 KB app bundle
- **Problem:** `website-next/public/app/assets/index-Dhjy-W_p.js` is ~745 KB
  (one chunk); no route-level code-splitting in `src/App.jsx` (all feature
  screens are static imports, lines 15-48).
- **Impact:** Slow first load on mobile (the primary buyer/artist device);
  hurts the first-impression Passport view.
- **Fix:** `React.lazy` + `Suspense` on the route elements in `App.jsx`; set a
  Lighthouse/CI bundle budget.
- **Effort:** M · **Risk:** low · **Priority:** P1.

---

## POST-GATE (P2)

### P2-1 · Music-domain data-model depth (multi-Act / per-Act evidence / territory-period authority)
- **Problem:** `020_acts_spine.sql` threads `act_id` through 11 child tables
  (claims, evidence_artifacts, passport_versions, gigs, availability_requests,
  producer_confirmations, professional_reaction, draw_signals, radar_signal,
  entitlements) and enforces per-Act non-transferable evidence — good spine. But
  the `act` table (`020:41-58`) models `format` yet the **territory/period
  authority** axis from GPT's entity model is not yet a first-class column; a
  new Act's empty-evidence bootstrap and Passport-per-Act binding
  (`passport_version.act_id`) need UI + query coverage.
- **Impact:** Can't yet express "this Act draws in TLV in summer" as structured,
  method-labeled authority — limits buyer evaluation depth.
- **Fix:** migration 037+ adding territory/period authority to `act` (diff
  001–036 first, per CLAUDE.md), plus per-Act switcher in the artist UI (ties to
  P0-5).
- **Effort:** L · **Risk:** med (firewall: authority shown as bands/binaries,
  never a score) · **Priority:** P2.

### P2-2 · Server hardening & cost governance surfacing
- **Problem:** `server/index.js` has CORS allowlist (63-69), per-IP rate limit
  (76-96), per-user/day caps (44-46), and a monthly budget cap (54) — solid. But
  rate buckets are in-memory (`Map`, line 78) → reset on redeploy / not shared
  across instances; budget alerts are env thresholds with no dashboard.
- **Impact:** Multi-instance or frequent redeploys weaken rate limiting; cost
  overrun only visible in logs.
- **Fix:** move rate/budget state to Supabase or a KV; expose a budget read to
  the admin cockpit. (Not launch-blocking at pilot scale.)
- **Effort:** M · **Risk:** low · **Priority:** P2.

### P2-3 · Test coverage breadth
- **Problem:** Beyond the P0-4 smoke test, no unit/integration coverage of
  `src/lib/db.js` (36 KB), `orgs.js`, navigation contract, or the firewall
  invariant (no score/percentile ever rendered).
- **Fix:** Vitest units for `navigation.js` role→home mapping and a
  firewall-guard test asserting no numeric draw/score reaches the DOM.
- **Effort:** M · **Risk:** low · **Priority:** P2.

### P2-4 · Docs/reality drift
- **Problem:** CLAUDE.md states "Migrations 001–018 exist locally" but
  `supabase/migrations/` goes to **036** (+ `036_token_hash.sql.DRAFT`).
- **Fix:** refresh the migration range note to avoid a future agent recreating
  existing tables.
- **Effort:** S · **Risk:** low · **Priority:** P2.

---

## SUMMARY

- **P0 (launch-critical): 5** — P0-1 SPA fallback (the bug), P0-2 embed skew,
  P0-3 session-boot resilience, P0-4 auth/route smoke test, P0-5 artist-edit
  UX + data model.
- **Top 5 to do first:** P0-1 (ship the rewrite — fixes the live bug today),
  P0-2 (sync-gate/canonical-domain — kills the recurring skew), P0-4 (reload
  smoke test — prevents regression), P0-3 (distinguish real logouts), P0-5
  (make the artist Passport substantive enough to pass the Gate).
