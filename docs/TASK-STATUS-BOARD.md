# GIGPROOF — MASTER TASK STATUS BOARD (PRIORITY-SORTED)
**Version:** 2.0 · **Date:** 8 July 2026 · **Legend:** ✅ working · 🟡 partial · 🔴 not built · ⬜ n/a
**Sort:** by launch priority. **P0** = blocks real launch · **P1** = needed for a strong launch · **P2** = growth/polish after launch · **DONE** = live and verified.
**"Migration needed?"** = does going real require a live-DB schema change? Demo data never migrates; migrations are one-time schema upgrades.

## P0 — LAUNCH BLOCKERS (nothing launches without these)

| Pri | # | Task | Demo env | Real launch | Notes — what's needed for real |
|---|---|---|---|---|---|
| P0-1 | 23 | Legal gate (counsel sign-off on consent texts) | ⬜ | 🔴 OPEN RISK — public signup under DRAFT texts | No migration. **YOU:** send the ready email draft (docs/COUNSEL-EMAIL-DRAFT.md). |
| P0-2 | 3 | Pasted link → evidence → real AI labeling | ✅ (stub AI) | 🟡 LIVE but stub AI | No migration. **YOU:** add Anthropic key to Vercel v6-b4 env → Redeploy. Key already verified. |
| P0-3 | 5 | Consent handshake (invite → artist approves w/ scopes → revoke) | ✅ full | 🟡 UI live, degrades gracefully | **MIGRATION 027 — awaiting YOUR approval.** One approval also unlocks #16 + #17. |
| P0-4 | 8 | Manual payment (Bit + reference code + activation) | ✅ | ✅ LIVE mechanics | No migration. **YOU:** fixed price (rec ₪179) + Green Invoice signup for receipts. |
| P0-5 | 22 | Domain + auth email URLs | ⬜ | 🔴 | No migration. **YOU:** pick domain (rec gigproof.co) → **ME:** wire Vercel + Supabase Site URL. |
| P0-6 | 7 | Producer confirmation ceremony (magic link) | ✅ | 🟡 works only on v6-b4 URL; dead on site /app embed | No migration. Resolves with #22: app.gigproof.co → v6-b4 becomes the canonical app. |
| P0-7 | 11 | Analytics events (funnel + Gate measurement) | 🔴 | 🔴 partial (passport views + reactions record) | Small migration (M1 event types → bundle 028). Property GIGPROOF 544738110 created ✅. **YOU:** Web data stream → send G-XXXX. **ME:** site wired (env-gated) ✅ + event writers. |

## P1 — STRONG-LAUNCH BUILDS (my queue; start as P0 clears)

| Pri | # | Task | Demo env | Real launch | Notes |
|---|---|---|---|---|---|
| P1-1 | 10 | Notifications (confirmation arrived / payment activated / request received) | 🔴 | 🔴 | No migration (table since 002). Pure build — highest-value P1. |
| P1-2 | 4 | Deep discovery scan (web search by name HE/EN) | 🔴 | 🔴 | Small migration ('discovered' source + HE/EN names → 028). Tavily key verified ✅ (EN+HE). **ME:** Phase-A build (~2-3 days) — unblocked. |
| P1-3 | 12 | Google/Facebook login | ✅ (demo notice) | 🔴 OFF (safe) | No migration. **YOU:** Google OAuth client → Supabase providers. **ME:** flag ON + redeploy. |
| P1-4 | 16 | Representation workspace (roster as consented grants) | ✅ prototype | 🔴 in app | Needs 027 (P0-3) → then UI build from prototype. |
| P1-5 | 17 | Production-company workspace (INSOMNIA: team, events, lineup) | ✅ prototype | 🔴 in app | Needs 027 (P0-3) → then UI build. gigs table exists unused. |
| P1-6 | 6 | Workspace switcher actually swaps the screen-set | ✅ | 🟡 visible, switch is a no-op | No migration. Routing refactor (pairs naturally with #16/#17). |
| P1-7 | 9 | Plan enforcement (Passport/Momentum/Roster gating) | 🔴 | 🔴 display-only | Migration later (plan flags → 028). Build after price decision (P0-4). |
| P1-8 | 14b | 2-proof publish gate on public passport | ⬜ | 🔴 | No migration. Small build; passport itself is live (see DONE #14). |
| P1-9 | 21b | Hebrew localization pass (app + site) | ⬜ | 🔴 | No migration. Final pass before Hebrew launch — last P1 by design. |

## P2 — GROWTH & POLISH (after launch)

| Pri | # | Task | Demo env | Real launch | Notes |
|---|---|---|---|---|---|
| P2-1 | 15 | Multi-Act switching in app (center-star) | ✅ prototype | 🔴 in app | No migration (Act tables since 020). UI build from prototype. |
| P2-2 | 19 | Attributed share loop (share link → tickets counted → radar candidate) | ✅ prototype | 🔴 in app | No migration (share_link since 024, zero writers). Share UI + UTM + candidate creation. |
| P2-3 | 20 | Spotify catalog integration | ⬜ | 🔴 key verified ✅, not wired | No migration. Wire into discovery/evidence flow. |
| P2-4 | 18 | Value-vs-genre view for managers | ✅ prototype | 🔴 in app | No new migration BUT needs genre taxonomy data filled (Registry B) + UI build. |

## DONE — LIVE & VERIFIED

| Pri | # | Task | Demo env | Real launch | Notes |
|---|---|---|---|---|---|
| ✔ | 1 | 2-screen onboarding (name+link → radar) | ✅ | ✅ LIVE | Done. |
| ✔ | 2 | Radar universe + deferred fill-in-place nodes | ✅ | ✅ LIVE | Done. |
| ✔ | 13 | Platform logos (branded universe) | ✅ | ✅ LIVE | Done. |
| ✔ | 14 | Public passport (proof units, method labels, 30-sec scan) | ✅ | ✅ LIVE | Done except 2-proof gate (tracked as P1-8). |
| ✔ | 21 | Marketing website (design, pricing, funnel) | ⬜ | ✅ LIVE | Done in English. Hebrew pass tracked as P1-9. |

## MIGRATION SUMMARY
- **027** (written, undo-ready, **awaiting approval** = P0-3): unlocks #5, #16, #17.
- **028** (I write next, one bundle): discovery fields (#4), M1 analytics events (#11), plan flags (#9). One approval when ready.
- Everything else: NO migration — live already or pure code builds.

## CHANGELOG
- v2.0 (8 Jul 2026): Re-sorted by launch priority (P0/P1/P2/DONE) per Maria's request; split #14→14b and #21→21b to track remaining slices.
- v1.0 (8 Jul 2026): Initial board — 23 tasks by number.
