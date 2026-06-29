# GIGPROOF — Project Guardrails (read this every task)
PM: R16 (Cowork) · Owner: Maria (R00) · Stack: React + Vite + Tailwind · Supabase (project ref `qexfndiyallwqhhzeerd`) · Vercel · Anthropic API (stubbed for now).
Full canon (Google-native, source of truth): Drive `35 · GIGPROOF — תיאור קצר · ייחודיות · דגשים` + `35 · Screen Spec 01` + `35 · Screen Feature Registry` + `40 · Technical Spec` + `40 · Profile Capture Build Guide`.

## WHAT THIS PRODUCT IS (never drift from this)
A pre-booking proof tool: helps Israeli booking managers/אמרגנים evaluate an unfamiliar artist via standardized, method-labeled evidence — BEFORE they risk their name. Talent ≠ bookability; GIGPROOF gives the talented-but-invisible artist a proof + marketing substitute. It is NOT a generic EPK, NOT a booking-ops CRM.

## ★ FIREWALL — HARD RULES (a build that breaks these is wrong)
- **NO overall score, NO percentile, NO rank, NO "bookability %", NO booking probability/prediction, NO guarantee.**
- **NO exact head-count / attendance number anywhere.** Draw is shown ONLY as **bands / binaries** (draw_band, sells_tickets yes/developing/not-assessable, fee_band, community_size_band), each with a **method label**.
- Bounded statuses only where status shows: **חזק · מתפתח · חסר-הוכחה · לא-ניתן-להעריך**.
- Streaming/social = secondary **context**, never proof of draw.
- **Never fabricate** a value, source, producer confirmation or testimonial. Unsupported = "self-reported", or omit.
- **Mirror (artist, private)** shows gaps + next actions; **Passport (public, buyer)** shows verified **strengths only**. The artist approves what crosses Mirror→Passport. Never expose private exact values, community member PII, gaps, or rejections on the Passport.

## STACK / DATA
- Use the canonical schema at `./supabase/schema.sql` (run it in Supabase SQL editor). Migrations live in `./supabase/migrations/`. It already encodes bands + RLS + no-score. Do not add a score/headcount column.
- Auth: email+password + Google/Facebook OAuth (configured in Supabase dashboard).
- Hebrew RTL primary throughout. English language toggle available. Mobile-first. One primary CTA per screen, sticky.
- AI claim-processing = **stub** (deterministic placeholder) until a real Anthropic API key is added later via `.env` (never in chat/git). The stub and real implementation share the `AiClaimProcessor` interface at `src/lib/ai/interface.ts`.

## ARCHITECTURE (see ARCHITECTURE.md for full rules)
- `/src/lib/db/` — ONLY place that talks to Supabase. Typed.
- `/src/lib/ai/` — claim engine behind `AiClaimProcessor` interface.
- `/src/features/*` — artist, evidence, claims, mirror, passport, requests, agency, auth.
- `/src/components/ui/` — design-system primitives only.
- `/src/tokens.ts` — single source of visual truth (colors, spacing, radii).
- Server-side `/api/passport/:id` enforces the firewall physically.

## BUILD ORDER
Follow `./BUILD-TASKS.md` one task at a time. After each task: confirm it builds, then stop and report (the PM reviews against this canon before the next task).

## DEFINITION OF DONE (no demo)
Real accounts · real evidence upload · AI-stub creates reviewable claims · artist approves → Mirror/Passport · public Passport built from an approved snapshot · availability-request (no login) reaches the artist. No hard-coded artist, no fake numbers, no score, draw as bands only.

## REPO BOUNDARY (strict — enforce every session)
**Allowed in this repo:** source code + `CLAUDE.md` + `BUILD-TASKS.md` + `ARCHITECTURE.md`. Nothing else.
**NOT allowed in this repo:** venture docs, screen specs, terminology glossaries, GTM, legal, PM/strategy docs, audit reports, gap maps, correction guides. Those live in Google Drive only.
**Drive is the source of truth** for: Screen Spec 01 · Feature Registry · Technical Spec · Terminology/Glossary · GAP-MAP · VENTURE-PM · GTM · Legal. Reference them by name in CLAUDE.md but do not copy them into the repo.

## ANTI-DRIFT RULES (read before every code session)
1. Read `CLAUDE.md` before starting any task.
2. Open `BUILD-TASKS.md` — work only the next `⬜ Not started` task. Never skip, never chain.
3. Never add a score, percentile, headcount, or prediction field/display anywhere. Firewall is absolute.
4. Never create a DB column without a migration file in `supabase/migrations/`.
5. Never add a hardcoded UI string — use `T('key')` from `LangContext` (both `he.js` + `en.js` must be updated together).
6. Never import Supabase directly in feature code — route through `/src/lib/db/` only.
7. Never call `console.log` in production paths — use `logEvent()` from the analytics stub.
8. Run `npm run build` after completing every task. Report ✅ only if the build passes with zero errors.
9. Stop and report to PM after each task. PM reviews before the next task begins.
