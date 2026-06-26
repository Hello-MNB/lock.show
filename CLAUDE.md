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
