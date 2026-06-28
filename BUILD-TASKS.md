# GIGPROOF — Build Tasks (ordered; one task at a time)

## Legend
- ✅ Done · 🔄 In progress · ⬜ Not started
- After each task: `npm run build` must pass. Report to PM before next task.

---

## TASK 0 — Architecture Foundation ✅
- [x] CLAUDE.md + ARCHITECTURE.md co-located with code
- [x] `src/types.ts` — domain types (Artist, Claim, ProfileItem, EvidenceArtifact, AvailabilityRequest)
- [x] `src/tokens.ts` — design tokens (single source of visual truth)
- [x] `src/lib/ai/` — AiClaimProcessor interface + StubClaimProcessor + AnthropicClaimProcessor + factory
- [x] `supabase/migrations/001_initial_schema.sql` — versioned first migration
- [x] Every Supabase call inside `src/lib/db/` (no direct supabase imports in feature code)
- [x] Feature folder structure: `src/features/{auth,artist,evidence,passport,agency,booker,setup}/`
- [x] `server/index.js` uses AiClaimProcessor factory
- [x] `/api/passport/:id` server endpoint — physically cannot return score/exact-count/gaps/private values
- [x] `Passport.jsx` reads from `/api/passport/:id` (server-enforced firewall)

## TASK 1 — Auth & Onboarding ✅
- [x] Email + password signup with email confirmation handling
- [x] Google/Facebook OAuth buttons (requires Supabase dashboard config)
- [x] Forgot password + Reset password pages
- [x] Language toggle (Hebrew / English)
- [x] 6-step onboarding: identity → links → draw bands → experience → readiness → publish
- [x] Consent page (Amendment 13 direction)
- [x] Role selection: artist / agency / booker

## TASK 2 — Evidence Capture & AI Processing ✅
- [x] Path A: file upload to evidence bucket → evidence_artifact (ticket-export)
- [x] Path C: band picker + optional public URL → evidence_artifact (self-band / public-profile)
- [x] Path B: Connect OAuth (deferred — shown as disabled)
- [x] POST /api/process-evidence → AI stub labels each artifact → writes Claim rows
- [x] Evidence list + resulting claims with source labels

## TASK 3 — Mirror (Artist Private View) ✅
- [x] ArtistDashboard: summary, publish toggle, next-actions (no score)
- [x] ArtistReadiness: 4 axes with StatusChip (חזק/מתפתח/חסר-הוכחה/לא-ניתן-להעריך)
- [x] Claims list with source labels (מאומת/נתמך/מדווח עצמי)

## TASK 4 — Claim Review & Passport Approval ✅ (code-complete; happy-path pending live DB + real service_role key)
- [x] Claims review screen in Mirror: artist can flip claim visibility mirror-only ↔ passport-ok (`ClaimReview.jsx`)
- [x] Passport snapshot: on publish, server writes immutable `passport_versions` row (`POST /api/publish/:id`)
- [x] Server Passport endpoint reads from latest snapshot, not live claims (live build kept only as fallback)
- [x] Publish flow wired in `ArtistDashboard` (publish/unpublish + "refresh public profile" re-snapshot) and `Onboarding` (best-effort snapshot)
- Note: the public Passport + publish require a real `SUPABASE_SERVICE_ROLE_KEY` (server is the firewall). Verified: endpoints build, run, and degrade honestly when the key is absent.

## TASK 5 — Public Passport (full build) ✅
- [x] Hero: photo, stage_name, one_line, verified chip, CTA above fold + sticky bottom
- [x] Proof of Draw block: bands + source label (NO exact number, NO score)
- [x] Track record: profile_items with source labels
- [x] Readiness chips: genre / set_length / regions / invoice
- [x] Firewall line at bottom
- [x] Reads from /api/passport/:id server endpoint (server-enforced) — `Passport.jsx` fetches the endpoint; now also returns the `published` flag so the page renders

## TASK 6 — Availability Request & Agency Inbox ✅
- [x] Availability request form (no login required)
- [x] Request confirmation page
- [x] Agency dashboard: roster list with StatusChip, add artist
- [x] Agency requests inbox: status management (new → replied → closed)

## TASK 7 — Supabase Setup & End-to-End Test ⬜
- [ ] User runs schema.sql (or migration 001) in Supabase SQL Editor
- [ ] User adds service_role key + Anthropic key to .env.local
- [ ] End-to-end test: signup → consent → onboarding → evidence → AI → passport → request → agency inbox

## TASK 8 — Polish & Mobile QA ⬜
- [ ] Test all screens at 375px (iPhone SE)
- [ ] Tap targets ≥ 44px everywhere
- [ ] RTL rendering correct on all screens
- [ ] LTR (English) rendering correct on all screens
- [ ] Sticky CTAs visible above fold on mobile

## TASK 9 — Deploy 🔄 (config prepped; deploy pending Maria's Vercel account)
- [x] `server/` becomes a Vercel serverless function — `api/index.js` re-exports the Express app; `server/index.js` skips `listen()` when `VERCEL=1` (local dev unchanged, verified)
- [x] `vercel.json` — `vite build` → `dist`, `/api/*` → serverless fn, SPA fallback to `index.html`
- [x] Server runtime deps (express/cors/dotenv/@anthropic-ai/sdk) moved to `dependencies` so Vercel installs them
- [ ] Vercel project connected to repo (needs Maria's Vercel account)
- [ ] Env vars set in Vercel dashboard (VITE_SUPABASE_*, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_*)
- [ ] Custom domain connected
- [ ] Production smoke test — verify `vercel.json` routing on first deploy

## TASK 10 — Operator/Admin user type + QA hardening ✅ (code-complete; live verify pending DB)
- [x] New `operator` role: `types.ts`, schema CHECK widened, migration `003_operator_admin.sql` + folded into `apply_to_supabase.sql`
- [x] Operator oversight RLS: platform-wide READ + targeted moderation UPDATE via `is_operator()` (SECURITY DEFINER)
- [x] `AdminDashboard` — stats, all-artists list with publish toggle, all requests, recent claims (firewall-safe: bands/statuses/provenance only, no scores)
- [x] `RoleHome` routes operator → `/admin`; `UserTypeSelect` exposes operator (internal; assign server-side in prod)
- [x] **`RequireRole` guards** on every role's routes (fixes: any logged-in user could open another role's screens)
- [x] **P0 fix:** `Loading` referenced an out-of-scope `T` → crashed every authenticated route on first paint. Now uses `useLang()`. Runtime-verified: login renders, console clean.
- [x] **Bug fix:** `/api/passport/:id` payload now includes `published` (Passport page would otherwise always render "not found")
- [x] **Honest server:** placeholder env values (`PASTE_…`) treated as unset → truthful `/api/health`
- [x] i18n QA: hardcoded Hebrew replaced with `T()` across auth/booker/agency/admin/artist-home/passport; he⇄en parity 227/227 (verified by script)
- [x] Edge-states: try/catch + `ErrorState` on agency dashboard, requests inbox, admin loads
- [x] Runtime smoke test (Vite preview): login renders RTL, EN toggle flips to LTR, no console errors

---
*Each task = one PM review checkpoint. Do not combine tasks.*
