# LOCKED SCOPE — next SITE version + next APP version (rel-*.2026.07.13)

_Owner order 12 Jul: "לבנות SCOPE ברור לגרסה הבאה של אתר וגם לגרסה הבאה של האפליקציה."
This is the scope CONTRACT. Anything not listed under IN is OUT — adding an item mid-train
requires Maria's word and a new row in this file. Detail per item: rel-2026.07.13-PLAN.md.
QA/QC: protocol Q1–Q8 (plan §4) — the version is not valid until it passes._

## SITE — rel-site-2026.07.13 · SCOPE

**Goal (one sentence, updated 12 Jul night by owner):** a beta-signup engine — vocabulary-true,
polished landing pages where every audience understands LOCK without jargon AND is moved to
register for the beta (the marketing-skills test: is the offer attractive?). Pricing hidden
until post-Gate.

**IN (9 items, closed list — count corrected 13 Jul, was mislabeled "7"):**
| # | Item | Where |
|---|---|---|
| S1 | Terminology wave live: buyer ≠ אמרגן glosses gone, FAQ distinction, llms.txt corrected, EN purity (already built on branch) | faq, layout, page, llms.txt, messages |
| S2 | Arrow unification (one arrow style sitewide) | global components |
| S3 | Footer regrouping | footer |
| S4 | Waitlist form type floor (readability minimum) | waitlist form |
| S5 | ONE private/corporate acknowledgment line, warm register, no venue jargon | /bookers |
| S6 | ONE clarifying line: this flow = Source Confirmer (magic link, no account) ≠ production company | /producers |
| S7 | OG/social exports committed + metadata wired — ONLY IF Codex delivers files in time; otherwise moves to next train without blocking | public/ + metadata |
| S8 | **Pricing page UNPUBLISHED (owner word, 12 Jul night — beta-signup focus):** removed from nav/footer/sitemap/llms.txt + `/pricing` → `/artists` redirect; page file KEPT in repo for one-commit restore | nav, footer, sitemap, llms.txt, vercel.json |
| S9 | **Beta-signup landing upgrade (owner word, 12 Jul night):** Codex passes over the WHOLE site — content + design — with ONE goal: attractive offer → beta signups; every page's primary CTA drives the waitlist/signup; Claude Code implements Codex's deltas + wires signup measurement | all marketing pages |

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
| N3 | Artist home + Radar (private) — **owner: CRITICAL screen, the journey's heart** | /artist/home | Interactive core verified ✓ + next-action ladder drives publish→share ✓. **OWNER SPEC (12 Jul night): the Radar shows the artist WHO THEY ARE · who they are relative to their GENRE · WHERE TO FOCUS · and the VALUE OF EACH PLANET — planets carry DIFFERENT WEIGHTS per genre.** Implementation: genre→planet-weight map (Codex defines the table per genre family; Claude implements weighted planet emphasis + weighted next-action ordering + "this matters most in your genre" guidance). FIREWALL: weights = focus guidance only — never a score/percentile/genre-rank/comparison. Remaining: weight map · DS binding · 360px ergonomics · radar-v4 momentum visual |
| N4 | Evidence capture | /evidence | states; per-Act correctness (non-default Act bug noted 9 Jul) |
| N5 | Claim review (approve→Passport) | claim review flow | approval-gate clarity; method labels |
| N6 | Readiness | /artist/readiness | new voice ✓; interactive next-step |
| N7 | Passport self + publish | /artist/passport | publish sheet; share; two-persona preview |
| N8 | Producer-confirm request | /artist/passport → request sheet | wire to REAL magic link (was A4) |
| N9 | Requests inbox | /artist/requests | producer-reply landing ✓; states |
| N10 | Plan / entitlement visibility — free pilot, no charge (reworded 13 Jul per G17 free-pilot ruling; was "Payment / offer · Bit reference flow") | /artist/offer | entitlement display only; no payment CTA, no Bit acceptance at launch |
| N11 | Settings (incl. WhatsApp share) | settings | wave-A strings ✓; states |
| N12 | Context switcher: + New Act · Add workspace | switcher | A2+A3 land here |

**Entity-architecture readiness (owner, 12 Jul: "לוודא שהארכיטקטורה נכונה כדי שנוכל להתפתח"):**
verified correct for growth — Person→Workspace→Role (027) · per-Act evidence proven in DB ·
ArtistAccess separate from membership · approval-gate firewall on all 4 read paths · booker/
confirmer need no workspace. Known structural debts, scheduled NOT blocking: workspace_type
value `'producer'`→`'production'` + role-enum renames (a FUTURE structural migration — it gets a
number only when authored, after Supabase Pro backups; 033 is already taken by
waitlist_outreach_roles) · uniform switching (target) · "Add workspace" UI (N12, this train).

**Migration status (refreshed 13 Jul, per SYNC §28):** 032 APPLIED+VERIFIED · 033 APPLIED ·
034 DRAFTED, not applied (additive-only event-CHECK widening; Cowork guides Maria to apply) ·
035 APPLIED ✓ (Cowork-verified — G3 add-workspace live-block cleared). Future structural
renames get migration numbers only when actually authored — never pre-reserved.

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
| A6 | Roster from consented grants (ArtistAccess) | manager office · /agency — migration 032 APPLIED+VERIFIED ✅ |
| A7 | Requests inbox with real data | production · /production — migration 032 APPLIED+VERIFIED ✅ |
| A8 | Dormant payment-infrastructure auditability (activated_by trail); no launch payment action (reworded 13 Jul per G17 free-pilot ruling) | operator · /admin |
| A9 | DS v1.6.1/A13 token binding, mobile-first re-ground batch-by-batch + real screenshots back to Codex | all screens — GATED on Claude's DS audit |
| A10 | Remaining funnel events (11) + embed rebuild (parity rule) | all |

**OUT (explicit):** DB/enum renames (workspace_type 'producer'→'production' = future structural
migration, numbered only when authored, after Supabase Pro backups) · artist reply-channel · open booker discovery · comparison mode ·
Radar v5 emotional layer · receipts/invoices · Hebrew-completion pass (141 keys) · any new
entity screen not listed.

**Dependencies:** Maria — ✅ **canon-lock APPROVED 12 Jul** (מאשר-מקור ratified · wave-A cleared ·
Act proceeds with the already-live term אקט; formal taste-ratification pending, non-blocking) —
**A1 is CLEARED for the train** · Cowork — one-time preview hook, 032 ✅ APPLIED+VERIFIED
(A6/A7 unblocked), 035 ✅ APPLIED (Cowork-verified — G3 unblocked), apply 034 (drafted,
additive-only, guide Maria), Q3–Q5 lanes · Codex — nothing blocks the app scope; imagery/OG are site-S7 only.

**DOD:** `npm run verify` green (nav 34 · i18n purity · build · demo) · migrations 032 + 035 ✅
applied+verified (034 additive, pending Cowork-guided apply) · Q1–Q8 on preview then live
(incl. 360px mobile pass on Radar/roster/Passport/recipient) · embed hash parity · owner pass.

## TRACEABILITY MATRIX (V2, added 13 Jul) — every scope row → gap register / pre-register closure / N/A
_Rule: every S/N/A row must trace to a G item in docs/releases/DEPLOY-GAPS.md, OR to evidence it
closed before the gap register existed, OR carry an explicit N/A reason. Rows that could not be
honestly traced are marked UNTRACED — they are verification debt, not silently assumed done._

| Scope row | Traces to |
|---|---|
| S1 terminology wave | Closed pre-register — built on branch (plan §0 "Terminology wave — BUILT"; canon-lock approved 12 Jul) |
| S2 arrow unification | G5 — CODE-COMPLETE (00b75e6) |
| S3 footer regrouping | G5 — CODE-COMPLETE (00b75e6) |
| S4 waitlist type floor | G5 — CODE-COMPLETE (00b75e6) |
| S5 private/corporate line on /bookers | Closed pre-register — S5 block live in `website-next/app/bookers/page.tsx` (Codex wording, DS v1.6.8) |
| S6 Source-Confirmer line on /producers | Closed pre-register — S6 block live in `website-next/app/producers/page.tsx` (Codex wording, DS v1.6.8) |
| S7 OG/social exports | N/A for gap register — explicitly conditional on Codex file delivery; slips to next train without blocking (by its own scope wording) |
| S8 pricing unpublish | Closed pre-register — `/pricing` → `/artists` redirect live in `website-next/vercel.json`; page file kept for restore |
| S9 beta-signup landing upgrade | UNTRACED — needs Claude verification (no G row; depends on Codex sitewide deltas; implementation state not evidenced in the register) |
| N1 signup + role select | Closed pre-register (wave-A labels = A1) · Google click-test = owner lane, outside the register |
| N2 onboarding | Partially closed pre-register (AI chain live-verified 12 Jul) · states + mobile polish: UNTRACED — needs Claude verification (no G row) |
| N3 artist home + Radar | G1 + G2 — CODE-COMPLETE (92e4abd) |
| N4 evidence capture | G13 (per-Act isolation proof — BUILDING) · states polish: UNTRACED — needs Claude verification |
| N5 claim review | G12 (truthful provenance — CODE-COMPLETE 395d8ba) · approval-gate firewall closed pre-register (migration 031 + eafcd4e) · UI clarity polish: UNTRACED |
| N6 readiness | Voice closed pre-register · interactive next-step: UNTRACED — needs Claude verification (no G row) |
| N7 passport self + publish | G7 (share events — CODE-COMPLETE 7bc1bc6) · publish-sheet polish: UNTRACED |
| N8 producer-confirm request | Closed pre-register — A4 verified pre-existing with evidence (a41389e) · token-lifecycle hardening = G15 (BUILDING) |
| N9 requests inbox | Producer-reply landing closed pre-register (✓ in row) · states: UNTRACED — needs Claude verification |
| N10 plan/entitlement visibility | G8 — CODE-COMPLETE (7bc1bc6) · posture governed by G17 free-pilot ruling (OWNER-ACCEPTED) |
| N11 settings | Wave-A strings closed pre-register (✓ in row) · states: UNTRACED — needs Claude verification |
| N12 context switcher | Add workspace = G3 — CODE-COMPLETE (7bc1bc6; migration 035 applied ✓) · + New Act = A3, closed pre-register (a41389e) |
| A1 terminology + voice wave | Closed pre-register — built on branch; canon-lock APPROVED 12 Jul |
| A2 add workspace real | G3 — CODE-COMPLETE (7bc1bc6; migration 035 applied ✓, Cowork-verified) |
| A3 + New Act | Closed pre-register — createAct db layer + Radar act-sheet inline create (a41389e) |
| A4 producer-confirm magic link | Closed pre-register — verified pre-existing with evidence (a41389e) · hardening = G15 (BUILDING) |
| A5 roster next-best-action | G4 — CODE-COMPLETE (7bc1bc6) |
| A6 roster from consented grants | Unblocked (032 applied+verified) · QA proof rides G22 probe · build state: UNTRACED — needs Claude verification |
| A7 production requests inbox | Unblocked (032 applied+verified) · QA proof rides G22 probe · build state: UNTRACED — needs Claude verification |
| A8 dormant payment auditability | Closed pre-register — activated_by verified pre-existing (a41389e) · posture = G17 free-pilot ruling (OWNER-ACCEPTED) |
| A9 DS token binding batch | UNTRACED — needs Claude verification (no G row; gated on Claude's DS audit; DS authority now Codex v1.6.20) |
| A10 funnel events + embed rebuild | Embed = G9 (OPEN, QA-stage) · share events = G7 (CODE-COMPLETE 7bc1bc6) · remaining ~9 funnel events: UNTRACED — needs Claude verification |

## RELEASE-SAFETY LAYER (V3, added 13 Jul)
G11–G22 in DEPLOY-GAPS are **mandatory launch-quality requirements**; they add no product
features but bind the release DOD and must close before PREVIEW-READY or production as
classified. A candidate SHA that satisfies every S/N/A scope row but leaves a P0 item of
G11–G22 open is NOT releasable.
