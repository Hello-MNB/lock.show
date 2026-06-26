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

## TASK 4 — Claim Review & Passport Approval ⬜
- [ ] Claims review screen in Mirror: artist can flip claim visibility mirror-only → passport-ok
- [ ] Passport snapshot: on publish, write `passport_versions` row (immutable snapshot)
- [ ] Server Passport endpoint reads from snapshot, not live claims

## TASK 5 — Public Passport (full build) ✅
- [x] Hero: photo, stage_name, one_line, verified chip, CTA above fold + sticky bottom
- [x] Proof of Draw block: bands + source label (NO exact number, NO score)
- [x] Track record: profile_items with source labels
- [x] Readiness chips: genre / set_length / regions / invoice
- [x] Firewall line at bottom
- [ ] Reads from /api/passport/:id server endpoint (server-enforced)

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

## TASK 9 — Deploy ⬜
- [ ] Vercel project connected to repo
- [ ] Env vars set in Vercel
- [ ] server/ becomes a Vercel serverless function (or Supabase Edge Function)
- [ ] Custom domain connected
- [ ] Production smoke test

---
*Each task = one PM review checkpoint. Do not combine tasks.*
