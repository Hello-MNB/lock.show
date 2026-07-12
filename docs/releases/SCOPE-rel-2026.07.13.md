# LOCKED SCOPE — next SITE version + next APP version (rel-*.2026.07.13)

_Owner order 12 Jul: "לבנות SCOPE ברור לגרסה הבאה של אתר וגם לגרסה הבאה של האפליקציה."
This is the scope CONTRACT. Anything not listed under IN is OUT — adding an item mid-train
requires Maria's word and a new row in this file. Detail per item: rel-2026.07.13-PLAN.md.
QA/QC: protocol Q1–Q8 (plan §4) — the version is not valid until it passes._

## SITE — rel-site-2026.07.13 · SCOPE

**Goal (one sentence):** vocabulary-true, polished marketing site where every demand-side
audience (including private clients) understands LOCK without industry jargon.

**IN (7 items, closed list):**
| # | Item | Where |
|---|---|---|
| S1 | Terminology wave live: buyer ≠ אמרגן glosses gone, FAQ distinction, llms.txt corrected, EN purity (already built on branch) | faq, layout, page, llms.txt, messages |
| S2 | Arrow unification (one arrow style sitewide) | global components |
| S3 | Footer regrouping | footer |
| S4 | Waitlist form type floor (readability minimum) | waitlist form |
| S5 | ONE private/corporate acknowledgment line, warm register, no venue jargon | /bookers |
| S6 | ONE clarifying line: this flow = Source Confirmer (magic link, no account) ≠ production company | /producers |
| S7 | OG/social exports committed + metadata wired — ONLY IF Codex delivers files in time; otherwise moves to next train without blocking | public/ + metadata |

**OUT (explicit):** Hebrew site · About page · private-client dedicated page · new imagery
beyond delivered files · How-it-works/Methodology restructure · pricing changes · any new page.

**DOD:** next build green · EN purity scan 0 Hebrew glyphs · terminology scan 0 inversions ·
Q1–Q8 pass on preview then live · owner pass.

## APP — rel-app-2026.07.13 · SCOPE

**⭐ NORTH STAR (owner, 12 Jul): ALL ARTIST SCREENS — a perfect, interactive flow on every screen.**
The artist lane is the primary lane; every other entity item ships in the same train but builds
AFTER the artist screen-set reaches the flow DOD below.

**Artist screen-set (12 screens) + FLOW DOD per screen** — a screen is DONE only when it has:
clear entry+exit · ONE primary action · all four states designed (loading / empty / error /
success) · 360px mobile-first · DS v1.6.1 tokens · supported-not-inspected voice · a visible
next-action · its funnel event · a Playwright walkthrough screenshot.

| # | Artist screen | Route | Flow gap to close |
|---|---|---|---|
| N1 | Signup + role select | /signup | wave-A labels; Google click-tested (owner) |
| N2 | Onboarding (stage name + 1 link) | /onboarding | states + mobile polish. **AI chain verified live 12 Jul:** the one link auto-enters the AI pipeline (real Anthropic labeling, firewall-bounded, stub fallback) so the Radar scanning moment shows a REAL node. Deep multi-source scan (canon ≈$1) NOT built yet — Tavily counsel-gated; incremental auto-rescan = backlog |
| N3 | Artist home + Radar (private) — **owner: CRITICAL screen** | /artist/home | Radar is already interactive in code (planet panel, in-radar batch review, filters, confirm+undo, multi-Act — verified 12 Jul). N3 completes: ONE smart next-action widget · DS v1.6.2 binding · 360px ergonomics · radar-v4 momentum visual (approved prototype) |
| N4 | Evidence capture | /evidence | states; per-Act correctness (non-default Act bug noted 9 Jul) |
| N5 | Claim review (approve→Passport) | claim review flow | approval-gate clarity; method labels |
| N6 | Readiness | /artist/readiness | new voice ✓; interactive next-step |
| N7 | Passport self + publish | /artist/passport | publish sheet; share; two-persona preview |
| N8 | Producer-confirm request | /artist/passport → request sheet | wire to REAL magic link (was A4) |
| N9 | Requests inbox | /artist/requests | producer-reply landing ✓; states |
| N10 | Payment / offer | /artist/offer | Bit reference flow; entitlement visibility |
| N11 | Settings (incl. WhatsApp share) | settings | wave-A strings ✓; states |
| N12 | Context switcher: + New Act · Add workspace | switcher | A2+A3 land here |

**Entity-architecture readiness (owner, 12 Jul: "לוודא שהארכיטקטורה נכונה כדי שנוכל להתפתח"):**
verified correct for growth — Person→Workspace→Role (027) · per-Act evidence proven in DB ·
ArtistAccess separate from membership · approval-gate firewall on all 4 read paths · booker/
confirmer need no workspace. Known structural debts, scheduled NOT blocking: workspace_type
value `'producer'`→`'production'` + role-enum renames (migration 033+, after backups) · uniform
switching (target) · "Add workspace" UI (N12, this train).

**Goal (one sentence):** every entity can actually operate its context (create workspace, work
its home screen, run its core flow) in DS-true, vocabulary-true, mobile-first screens.

**IN (10 items, closed list):**
| # | Item | Entity · screens |
|---|---|---|
| A1 | Terminology + voice wave live (built: 8 HE + 7 EN strings, signup labels, SIGNUP_ROLES fix, evaluation-language softening) | all · signup, switcher, settings, publish, readiness |
| A2 | "Add workspace" made REAL — create 2nd workspace from switcher (artist/management/production only) | all · switcher + create screen |
| A3 | + New Act | artist · switcher + /artist/home |
| A4 | Producer-confirm request wired to real magic link | artist · /artist/passport → server link |
| A5 | Next-best-action widget on roster home | manager office · /agency |
| A6 | Roster from consented grants (ArtistAccess) | manager office · /agency — needs migration 032 |
| A7 | Requests inbox with real data | production · /production — needs migration 032 |
| A8 | activated_by audit trail on payment activation | operator · /admin |
| A9 | DS v1.6.1/A13 token binding, mobile-first re-ground batch-by-batch + real screenshots back to Codex | all screens — GATED on Claude's DS audit |
| A10 | Remaining funnel events (11) + embed rebuild (parity rule) | all |

**OUT (explicit):** DB/enum renames (workspace_type 'producer'→'production' = migration 033+,
after Supabase Pro backups) · artist reply-channel · open booker discovery · comparison mode ·
Radar v5 emotional layer · receipts/invoices · Hebrew-completion pass (141 keys) · any new
entity screen not listed.

**Dependencies:** Maria — ✅ **canon-lock APPROVED 12 Jul** (מאשר-מקור ratified · wave-A cleared ·
Act proceeds with the already-live term אקט; formal taste-ratification pending, non-blocking) —
**A1 is CLEARED for the train** · Cowork — one-time preview hook, apply 032 (blocks A6/A7), Q3–Q5
lanes · Codex — nothing blocks the app scope; imagery/OG are site-S7 only.

**DOD:** `npm run verify` green (nav 34 · i18n purity · build · demo) · migration 032 applied +
regression · Q1–Q8 on preview then live (incl. 360px mobile pass on Radar/roster/Passport/
recipient) · embed hash parity · owner pass.
