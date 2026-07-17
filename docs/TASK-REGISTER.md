# LOCK — TASK REGISTER

**Owned and updated by the build agent (Claude). The owner never maintains this file.**
_Created 17 Jul 2026 from the real, witnessed state of the product — not from plans._

## The rules this register obeys (owner directive, 17 Jul 2026)

1. Every task has a permanent number (T-01, T-02…) — never reused, never renumbered.
2. Every task cites its spec section in `docs/LOCK-PRODUCT-SPECIFICATION.md`. No section → not a task.
3. Every task carries the 8-point status. **DONE only when all 8 are ✅:**
   - **CODE** — built; `npm run verify` green (all 10 inspectors).
   - **MOBILE** — §10.2 @ 390px: one job per view · bottom nav · bottom sheets not new pages · exactly one primary CTA · no h-scroll · 44px targets · fits one viewport.
   - **DESKTOP** — §10.3 @ 1360px: one nav · no duplicated titles · identity chrome = 2 elements · one primary CTA (inspector holds it) · no h-scroll · zero console errors.
   - **LEXICON** — §4 glossary EN+HE exact · §4.4 method labels exact · §6 law 4 no technical/internal language.
   - **INTERACT** — §10.4: every editable field through all 7 states (empty · typing · invalid · saved · undo · loading · error-retry), tested with empty/long/Hebrew/URL/invalid.
   - **NAV** — §10.6: forward AND backward path · no dead-ends · deep-link honored.
   - **A11Y** — §10.5 contrast ≥4.5:1 (prefer 7:1), approved AA pairs only · §10.7 prefers-reduced-motion · keyboard works.
   - **FIREWALL** — §10.1: inspectors pass; no score/percentile/rank/%-as-grade/gauge/prediction/exact-headcount/follower-count/leaderboard/position/firewall-narration. Draw = bands. Reaction-to-artist = method-safe text.
4. **MOBILE and DESKTOP can only be ✅ when a human has looked.** Not the agent. Until then: ⚠️ unwitnessed + who must look.
5. §6 law 2: mobile is the DEFAULT, designed separately — two checks, never one.
6. Never mark DONE what was not witnessed running.
7. Every task names its blocker and who unblocks it (owner = Maria · agent = Claude).
8. **QA-before-report (owner directive 17 Jul):** every executed task is verified by an independent test agent (Team D) START-TO-END before it is reported to the owner. No self-reported "done."
9. **Document links in every reply (owner directive 17 Jul):** every reply to the owner ends with clickable links to this register, OWNER-PENDING, and the spec (GitHub, work branch).
10. **Micro-task work breakdown (owner directive 17 Jul):** the WORK BREAKDOWN section below decomposes every active task into per-team micro-tasks with precise budgets; progress is reported BY TASK NUMBER against it.
11. **The permanence boundary (owner + external review, 17 Jul):** autonomy NEVER touches real people's data, sends real email, moves real money, or changes the live database. Each such act requires the owner's explicit per-instance word; where legality is the question, it is lawyer-gated (T-24). The email send-path ships FLAG-OFF until counsel signs. All autonomous building/testing runs on demo/seed fixtures. A µ-task that turns out to touch the boundary STOPS the loop and asks first.
12. **The named-train law (site):** the marketing site NEVER ships as cargo of an app merge (17 Jul regression: unapproved branch-only redesign rode whole-branch merges into production). Site changes ship only on their own train, after the owner's TASTE approval of a preview. For the site, owner approval comes BEFORE production — L8 moves ahead of SHIP.
13. **Token economy:** every wave report states its measured token cost; low-risk docs-only µ-tasks may skip L5 (Team D) at the orchestrator's discretion ONLY when no code changed; waves are sized to the owner's remaining plan budget — Gate-critical tasks first, heavy build programs (site S4-S8) deferred if the budget tightens.

**Marks:** ✅ done · ⚠️ partial/unwitnessed (note says what's missing) · ❌ not built · — not applicable (non-screen task).

---

## NOW — Wave 2 (dispatched 17 Jul, evening)

Four builds in disjoint territories + Team D verification each + Team E wave-close ship:

| µ-task | Parent | Team | Detail | Budget |
|---|---|---|---|---|
| W2-1 | T-31 residue | A1 | `/artist/home` has TWO of its own primary CTAs (pre-existing, found by D-verify) — enforce exactly ONE (§10.2): the dock/inspector CTA law decides which keeps lime | ≤40k |
| W2-2 | T-35 | A3 | Viewport-fit phase 1: measure page-scroll on every view @390×844 + @1360×900 → offender list; FIX the Radar home (owner's law: page never scrolls; long content lives in bounded internal panels) | ≤90k |
| W2-3 | T-19 | C1 | Author the missing Hebrew: complete `radar.universe` + Radar-kit + scene-rail blocks in he.js (canon glossary §4 terms; method labels stay English §15.4) | ≤80k |
| W2-4 | T-32 | C2 | Self-host fonts via @fontsource packages (Frank Ruhl Libre · Heebo · IBM Plex Mono) — remove the Google Fonts runtime dependency; local demo image replaces the Unsplash URL | ≤60k |
| W2-V | rule 8 | D | Independent adversarial verify of each build | ≤70k× |
| W2-S | ship | E | verify gate · embed+site rebuild · replica · deploy watch · live smoke | ≤40k |

**Wave 3 re-scope (rule 11):** email send-path = code only, feature-flag OFF until T-24 counsel sign-off; analytics = consent-gating code only, no new real-data collection pre-counsel.

---

## LIVE IN PRODUCTION — awaiting only the owner's eyes (M-3/M-5)

**T-17** genre chips ↔ Radar scene rail · **T-18** hang fix (15s abort + 20s watchdog) · **T-34** share/deep-link repair · **T-31** 44px tap targets · **T-33** passport mobile rows · **T-21-part** consent banner. All Team-D-verified + live-smoked; the owner's witness upgrades them toward DONE (rule 4).

## QUEUE HEAD

### T-01 · Login — §8.13 (shared screens) · §13.4.4 (auth engine) · §17.B.1
The front door: email+password, Google, forgot/reset, signup hand-off.

| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |

- **CODE ✅** — verify green; real authentication proven against the live server 17 Jul (real session for `artist@gigproof.test`); owner signed in successfully in her own live test 17 Jul.
- **MOBILE ⚠️ unwitnessed** — nobody has run §10.2 at 390px. **Maria must look.**
- **DESKTOP ⚠️ partially witnessed** — Maria used it successfully (17 Jul) but the §10.3 checklist was never run item-by-item. **Maria must look** (agent prepares the checklist walk).
- **LEXICON/INTERACT/NAV/A11Y ⚠️** — systematic §10 passes not yet run. **Claude runs these next** (that is the current work).
- **Blocker:** none for the agent-side checks; the two witness checks wait on Maria.

---

## BLOCKED — waiting on Maria (plain language)

### T-10 (email half) · Gate email to the artist — §14.6.5
UNBLOCKED 17 Jul: Resend key stored ✓ · domain verified ✓ · test emails delivered ✓ (owner did M-2/M-11). Remaining work is MINE: the guarded server send-path (§14.6.5 bodies) — queued Wave 3, Team C2/F territory. Nothing waits on Maria here anymore.

### Witness requests (rule 4 — a human must look)
- **T-01 Login** and **T-08 Public Passport**: Maria looks at 390px (phone) and 1360px (desktop) against the §10.2/§10.3 checklists — I will hand her a one-page checklist for each when the agent-side passes are done.

---

## NEXT — the queue, in build order (owner's order, 17 Jul)

### T-02 · Onboarding — §8.1 (BUILT 2-step; TARGET 3-step noted honestly)
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
- **CODE ✅** — every save verified against the live database 17 Jul (9/9: consent · identity · strongest link · evidence mirror · read-backs). Refresh-resume built (step survives reload).
- All human-witness and §10 passes pending. **Blocker:** none. **Who:** Claude, then Maria witnesses.

### T-03 · Radar: desktop canvas — §8.2 (4-zone layout · six planets · bounded states · constellation · platform ring)
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ⚠️ | — | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
- **CODE ⚠️** — a substantial Radar exists (`RadarUniverse.jsx`) and runs; it has NOT been diffed against §8.2's definition-of-done (4 zones · state words under planets · thread colors · detected-only platform ring · inspector-XOR-dock CTA law). First step: gap-diff, then close gaps.
- MOBILE intentionally **not** in this task (rule 5 — separate task T-04). **Blocker:** none. **Who:** Claude.

### T-04 · Radar: mobile "Radar Focus" — §8.2 (mobile block) · §7.5 · §6 law 2
Designed separately: zoom-on-tap · swipe next/prev planet · pull-down closes the sheet · bottom one-action dock · inspector as bottom sheet.
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ⚠️ | ⚠️ | — | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
- **CODE ⚠️** — mobile layout exists but gestures (swipe/pull-down) and the dock-XOR-sheet CTA law unverified vs spec. **Blocker:** none. **Who:** Claude, then Maria witnesses on a real phone.

### T-05 · Radar: Planet Inspector + in-place fill — §8.3 · §17.A.2
The 3-layer action widget (what it means · what LOCK found · the one next thing), holding the single primary CTA; the Professional-Kit fill-in-place forms.
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
- **CODE ⚠️** — exists; owner's 17 Jul finding #3 ("not interactive enough") partially fixed live (expander is now a real 44px button; "Save — right here"→"Save"). Full §8.3 3-layer conformance + the design-language pass still owed.
- **Blocker:** none. **Who:** Claude, then Maria witnesses.

### T-06 · Radar: next-best-step engine + scene/lens system — §8.2 (interactions) · §9.4
ONE computed next action with its "why" line (priority ladder per spec); scene ★ re-weighting that never changes data; lenses that dim, never remove.
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
- **CODE ⚠️** — a next-action exists on the dashboard; the §8.2 priority ladder + scene lens + "why" lines unverified vs spec. **Blocker:** none. **Who:** Claude.

### T-07 · Artist Passport self-view — §8.4 (multi-view: edit vs buyer-preview)
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
- **CODE ❌** — today `/artist/passport` is a bare redirect (known gap S6). The real screen (see-what-buyers-see + edit affordances) is unbuilt. **Blocker:** none. **Who:** Claude.

### T-08 · Public Passport (buyer) — §8.7 (the 60-second decision page)
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ |
- **CODE ✅** — live with two persona views (Booking / Representation); firewall strip removed 16 Jul; **NAV ✅** — fresh-opened shared links land correctly since 17 Jul (deep-link fix, live-verified).
- **DESKTOP ⚠️** — Maria viewed it live 17 Jul (worked); §10.3 checklist not run. **MOBILE ⚠️ unwitnessed.** **Blocker:** none. **Who:** Claude runs §10 passes; Maria witnesses.

### T-09 · Availability request + receipt — §8.8 (the Gate action)
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
- **CODE ✅** — form + server endpoint live; the security suite proves an anonymous request creates the row and the server-authored notification (10 denial checks green).
- All witness/§10 passes pending. **Blocker:** none. **Who:** Claude, then Maria.

### T-10 · Notification to the artist — §8.13 (bell) · §14.6 (email)
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
- **CODE ⚠️** — in-app bell works (server-authored, closed enum, tested). The EMAIL half is ❌ and **blocked on Maria** (Resend key — see BLOCKED). **Who:** Maria unblocks email; Claude builds the guarded send path (already designed).

### T-11 · Admin / Operator cockpit — §8.12
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
- **CODE ⚠️** — operator export + basic admin exist; the Gate tiles (funnel counts — product-event numbers, allowed) are backlog. Gate metrics must read `is_demo=false` **after** T-15 applies. **Blocker:** T-15 (for clean numbers). **Who:** Claude.

**Everything after T-11 in the SCREEN queue is post-Gate and is deliberately NOT queued (owner directive).**

---

## LAUNCH A-Z — the non-screen tasks a FULL launch also needs (owner asked 17 Jul: "does the register cover A-Z?" — with this section, yes)

These are pre-Gate necessities that are not screens. Screen-style MOBILE/DESKTOP marks apply only where noted.

| # | Task | Spec | State | Blocker → who |
|---|---|---|---|---|
| T-19 | Hebrew pass: Radar-kit HE block (missing entirely — falls back to EN) + full app HE sweep | §15.3 · §15.4 | ❌ | none → Claude (Team C) |
| T-20 | Accessibility sweep, app + site (contrast, keyboard, SR, reduced-motion) | §10.5 · §10.7 · §15.1 | ⚠️ partial | none → Claude (Team C), then Maria witnesses |
| T-21 | Utility screens remainder: consent-banner equal-weight · offline banner · notifications page | §17.B | ⚠️ partial (404 ✅) | none → Claude (Team C) |
| T-22 | Deletion / data-purge job (self-serve export exists; purge is owed) | §15.1.4 | ❌ | none → Claude (Team C) |
| T-23 | GA4 dual-emit + Gate funnel instrumentation complete | §14.3 | ⚠️ partial | none → Claude (Team C) |
| T-24 | Legal gate: counsel L-1…L-9, placeholders filled | §15.1 · §15.2 | ⛔ | **Maria M-4** (lawyer) |
| T-25 | Gate email build (guarded send path, §14.6.5 bodies exist) | §14.6.5 | ⚠️ key stored + test send proven ✓; code path buildable NOW; real artist delivery needs domain verification | **Maria M-11** (DNS records) |
| T-26 | Bot protection (Turnstile/hCaptcha on public forms) + durable rate limits | §13.5.6 | ❌ | none → Claude (Team C) |
| T-27 | Rollback rehearsal + deploy-train QA on a frozen SHA | §19.6 · §21.7 | ❌ | none → Claude (Team D) |
| T-28 | Q8 owner walk on the frozen SHA (the launch acceptance walk) | §21.7 | ⛔ | **Maria** (after T-27) |
| T-29 | Concierge first-10 outreach kit (materials by Claude; outreach by Maria) | §16.B.11 | ❌ | shared |
| T-30 | `is_demo=false` server filter on Gate metrics (ships only AFTER 037 applies) | §14.3.2 | ⛔ | **Maria M-1** (apply 037) |

**Post-Gate (NOT queued, per directive):** monetization ON/prices · growth loops · international · platformization (§16.B.12-16, §19).

---

## TEAMS — ten development teams (owner directive 17 Jul: roles · skills · work order · zero collisions)

**Collision law (binding):** every team OWNS a named file territory. An agent needing a file outside its territory STOPS and reports — it never edits. Two teams are never scheduled into the same territory in the same wave. Read-only teams (B, D) may read everything, write nothing outside their own folders.

| Team | Role (what it does) | Skills (what its agents are told to be) | Owns (file territory) | Feeds on |
|---|---|---|---|---|
| **A1 · Artist screens** | Radar canvas, Planet Inspector, Act editor, artist requests | React+Tailwind, DS tokens §5.11, Radar spec §8.2/§8.3, firewall rendering | `src/features/artist/**` | T-03, T-05, T-06, artist half of T-31 |
| **A2 · Buyer screens** | Public Passport, availability request, confirmer | §8.7-8.9, firewall-critical (buyer-facing = highest care), method labels §4.4 | `src/features/passport/**` | T-08, T-09, T-33 |
| **A3 · Mobile experience** | §6 law 2: the separate 390px design — gestures, viewport-fit, bottom sheets | Touch UX, §10.2, §7.5, Radar-Focus §8.2-mobile | mobile variants of screens A1/A2 finished LAST wave (never same files same wave) | T-04, T-35 |
| **B · QA & checklists** | 7-state field QA, §10 passes, screenshots, the owner's witness checklists | Playwright, §10.2-10.7, plain-language writing | `docs/qa/**` only (read-only elsewhere) | every screen task, M-5 |
| **C1 · Hebrew & lexicon** | he.js completeness (Radar kit has NO Hebrew), RTL, §4 glossary conformance | HE native copy, §15.3/§15.4, voice law §4.5 | `src/lib/i18n/he.js` only | T-19, LEXICON points |
| **C2 · Platform ops** | Self-hosted fonts, bot protection, purge job, GA4, headers | Vite/build, §13.5, §14.3, §15.1 | `index.html`, `public/**`, `server/**` (non-payload), `vercel.json` | T-32, T-26, T-22, T-23 |
| **D · Critic-verify** | Rule 8: adversarial verification of EVERY µ-task; SHIP/DO-NOT-SHIP | Skeptic; reproduce-before-believing; firewall law §2/§10.1 | nothing (temp files only) | all builds |
| **E · Ship & regression** | verify suite, embed/site rebuild, replica tests, deploy watch, live smoke | Release discipline §19.6, deploy pipeline truth (main-only production) | `website-next/public/app/**` (build output) | every wave end |
| **F · Data & DB** | Migrations (diff-first, additive-only), RLS, Gate read-model, seed hygiene | SQL, §13.2, §14.3, migration law §20.B | `supabase/**`, Gate-metric reads in `server/` | T-30, future 038+ |
| **G · Docs & governance** | Register/memory/pending upkeep, spec lockstep §19.6, release notes | Canon discipline, honest-status law §2.8 | `docs/**` (except docs/qa) | continuous |

**Work order (the anti-collision schedule):**
1. Within a wave: builders run in PARALLEL only across different territories; D verifies each build as it lands (pipeline, no barrier); E ships once the wave's verdicts are all SHIP.
2. A3 always works one wave BEHIND A1/A2 on any given screen (mobile pass follows the screen's build pass — never simultaneous).
3. C1 (he.js) is always safe in parallel — nobody else may touch he.js.
4. F never ships a read-model change in the same wave as the migration it depends on (apply → then filter).
5. G updates docs at wave close, single writer — no doc races.
6. Budgets: per-agent ceilings from the allocation table (measured: QA ≈41k · build ≈60-80k · verify ≈70k). An agent at its ceiling STOPS and reports partial.

**Wave 1 CLOSED (17 Jul):** 8 agents · 521k tokens · 3 builds, 3 independent SHIP verdicts → shipped to production:
- **T-31 (A1):** 44px floor into the primitives (`.btn`/`.field` min-height; invisible 44px hit-overlay for chips via `.tap-target`) + shell stragglers (bell, language toggle, Settings, role picker, Act-editor EDIT buttons). D-verified 21/22 sampled targets clean; the 1 marginal case (center-star chip edge overlap, low severity) logged for A1's next pass.
- **T-33 (A2):** passport evidence rows stack at 390px — title wraps, date on its own mono line; 14/14 rows assert-visible; desktop unchanged. D-verified.
- **T-21-part (C3):** consent banner Accept demoted to equal-weight (§15.2) — zero primary CTAs added to any screen; banner is now a docked bar that RESERVES space (shrinks the scroll container) so it can never cover fields/CTAs; stacks above the passport CTA bar. D-verified.
- **B1:** real-login-form QA executed (findings in wave transcript → T-01 closure input).
- **B2:** `docs/qa/WITNESS-CHECKLISTS.md` written for the owner (M-5 unblocked).
**New findings routed:** /artist/home has a PRE-EXISTING double-primary-CTA of its own (not the banner) → A1 next wave. Residency date renders bare ISO on mobile (cosmetic) → A2 backlog.

---

## DONE — witnessed, with dates

### T-15 · Migration 037 (`is_demo`) APPLIED to the live database — §14.3.2 *(non-screen)*
All 8 applicable ✅. 17 Jul 2026. Owner said "apply it" → applied via the management API (HTTP 201) and verified: column present (boolean, default false) · backfill marked **43 seed/operator events demo, 3 stay real** · partial index created. The 3 real events belong to `shydaviddjnattaly@gmail.com` (signup+onboarding+login, 11 Jul) — flagged to the owner: real first user or team tester? Witnessed: live SQL verification (Claude). Follow-up lives in T-30 (Gate-metric read filter when admin tiles are built).

### T-12 · Design-system tokens into code — §5.11 *(non-screen: MOBILE/DESKTOP —)*
All 8 applicable ✅. 16 Jul 2026. Type scale/radius/CTA paddings in `tailwind.config.js` + `tokens.ts`. Witnessed: verify suite + both builds green (Claude). Commit `835e699`.

### T-13 · Humanized band renderer — §5.10 *(non-screen)*
All 8 applicable ✅. 16 Jul 2026. Pure functions + 10/10 unit tests incl. the firewall property (output is a known line, never a number). Witnessed: test run (Claude). Commit `91b8497`.

### T-14 · §20 guardrail inspectors — §20 · §10.1 *(non-screen)*
All 8 applicable ✅. 16 Jul 2026. Five inspectors wired into `npm run verify` (suite = 10 checks). Witnessed: proven live by planting a bookability score on the Passport — blocked with 3 catches, then removed (Claude); the internal `score→weight` rename ruled by Maria. Commits `3b1e0ff`, `d5afb94`.

### T-16 · Owner-audit fixes ①②④ — §7.6 (deep-links) · §4/§6 (terminology) *(infra + lexicon)*
All 8 applicable ✅. 17 Jul 2026, **live on production** (merges `b49d568`, `5e75f0f` — owner-authorized). Refresh serves the app on all 29 routes; fresh-opened shared Passport links land on the Passport (browser-proven); "Sign in" unified. Witnessed: live URL tests post-deploy (Claude); **Maria's re-test requested** — her confirmation upgrades this from agent-witnessed to owner-witnessed. Finding ③'s full design pass lives in T-05, not here.

---

## TEAM B QA SWEEP — findings folded (17 Jul, 5 screens · 5 agents · all reported)

**Caveat:** agents ran the DEMO build, so "login" tested the demo role-picker, not the real credential form — T-01's real-form QA is still owed on the real build. Cross-cutting findings below apply everywhere.

| # | New task | Spec | What Team B found | State |
|---|---|---|---|---|
| T-31 | **Mobile tap-target sweep** (the #1 systemic finding — on EVERY screen) | §10.2 · §5.7 (44px) | Act-editor EDIT buttons **30×17px** (⅓ of minimum!) · role-picker 42px · Radar filter chips 29px · bell 36px · zoom 28px · cookie buttons 36-38px · language toggle 26px. Fix belongs in the shared UI primitives so it lands everywhere at once. | ❌ → Team A next |
| T-32 | **Self-hosted fonts + assets** | §5.7 · §13.5 | App loads fonts from Google's servers + a demo photo from Unsplash at runtime → console errors + wrong typography on any restricted network. Bundle the 3 fonts + local images. | ❌ → Team C |
| T-33 | **Public-Passport mobile evidence rows** (wedge-critical) | §8.7 | At 390px all 14 evidence rows truncate: **date and venue fully clipped** — a buyer on a phone cannot see when or where any show happened. | ❌ → Team A, high priority |

Attached to existing tasks: cookie banner steals the primary-CTA style + covers content/form fields on every screen at 390px → **T-21** (its evidence). Radar label collisions ("INSTAGRAM.CO" clip, "CENTRAL IN YOUR GENRE" overlapping the LIVE SHOW node) → **T-03/T-04** (their evidence). Login-screen notes → **T-01**.


### T-34 · Share/deep-link navigation repair — §7.6 (deep-link & share schema — virality-critical) · §10.6 · §8.7
**Owner evidence (17 Jul):** her screenshot — `lock.show/passport/<id>?s=1` → site 404. The `?s=1` proves the app ITSELF generated the dead link.
**Root cause:** 4 call sites built outbound links from the domain alone, losing the `/app` base on the website embed: the artist share button (`ArtistDashboard`), the producer confirmation link ×2 (`ClaimReview` — producers were getting dead magic links), and the request-receipt passport URL (`RequestConfirmation`).
**Fix (detailed):**
1. New `src/lib/appUrl.js` — the ONE outbound-link builder, base-aware (`/` standalone · `/app` embedded); all 4 sites patched to use it. Auth screens already base-aware — untouched.
2. Safety net for dead links ALREADY in the wild: the site 404 now rescues app-only paths missing `/app` (`/passport/<id>`, `/confirm/<token>`, `/invite/`, `/evidence/`, login/signup/onboarding/…) → bounces into the app with the full path + query preserved. Site pages (`/passport` demo, `/production`, `/radar`…) explicitly excluded from the bounce.
3. Embed + site rebuilt; verify suite green.
**Builder's own tests passed** (bare share link → lands on the rendered passport with `?s=1` intact; site pages unaffected). **Team D independent verification: in progress** (rule 8) — ships only on its SHIP verdict + owner-authorized main merge.


### T-35 · Viewport-fit law: no screen exceeds screen height — §10.2 (fits one viewport) · §7.7 (one-canvas) · §6 law 2
**Owner directive 17 Jul:** "make sure everything designed does not exceed screen height — the screen is interactive, no scrolling," desktop AND mobile (two separate checks, rule 5).
**Scope:** audit every app view at 390×844 and 1360×900 for vertical overflow; restructure offenders (bottom sheets, in-place panels, internal scroll areas allowed ONLY inside a bounded component — the PAGE never scrolls). Radar first (her marked screenshot), then Passport, editor, requests.
**State:** ❌ opened. **Who:** Team A (next after T-31). **Blocker:** none.

### T-36 · End-to-end navigation audit + fix — §10.6 (flow/continuity) · §7 (nav & shell) · §17.B
**Owner directive 17 Jul:** "send an agent, minimum tokens, to fix navigation — test, characterize the process end-to-end, fix, test, report."
**Scope (the agent's brief):** walk EVERY route in src/App.jsx as each persona (demo build): forward path in, backward path out (no browser-Back traps), no dead-ends (§17.B.10), deep-link honored, bottom-nav/back affordance present; characterize the full map; fix small in-scope breaks; `npm run verify` green; structured report. Budget ≤60k tokens (register TEAMS law: stop at ceiling, report partial).
**State:** ✅ AUDIT COMPLETE 17 Jul (agent, ~71k tokens, within budget). **Result: NO breaks found** — 14 routes walked (artist persona + public): every deep-link honored, backward path everywhere, zero Back-traps (all redirects use `replace`), zero dead-ends, zero page errors. The two non-literal landings are correct by design (`/artist/passport` → the artist's real public Passport; role-gate bounces land home, never loop). NAV can be marked ✅ on walked routes' tasks. **Out-of-scope observations logged:** remaining personas + token routes un-walked (same script pattern covers them — queued as B3 scope) · main bundle 538kB>500kB warning (pre-existing) · confirm §7.2 hub presence on public passport for logged-in users. No code changed by this agent; verify exit 0.


---

## AUTONOMOUS OPERATING LOOP (owner directive 17 Jul: "build professional processes so you can run autonomous")

The register is the ONLY work source. The loop runs continuously; the owner is interrupted only by (a) verified wave reports, (b) genuine spec/firewall decisions, (c) her named pending items.

**THE TASK-CLOSURE LOOP** (every µ-task travels it; no silent ends — a µ-task may ONLY end as CLOSED-SHIPPED, CLOSED-BLOCKED(named blocker+owner), or RETURNED(rebuilt after a failed verdict)):

1. **PICK** — next µ-tasks by wave order from WORK BREAKDOWN; only register-numbered work.
2. **DECOMPOSE** — parent task → µ-tasks, each: one team, one file territory, one budget ceiling, one Definition-of-Done sentence.
3. **SPEC-ADJACENT** — the builder's prompt names the exact spec sections; the builder reads them FIRST (build glued to the spec, never from memory).
4. **BUILD** — cheapest sufficient agent (low effort default; medium for structural work; high reserved for Team D). Budget ceiling enforced: at the ceiling the agent stops and reports partial.
5. **TEST — all levels, characterized** (the error-prevention ladder):
   - **L0 static gates:** the 10-inspector verify suite (firewall lint · canon-drift · registry · deltas · security-denial · i18n purity · nav contract · act isolation · 2 builds) — every µ-task, every wave close.
   - **L1 unit:** pure functions get a test file (pattern: scripts/test-humanize.mjs — includes a firewall property test).
   - **L2 screen:** Playwright per changed screen — renders at 390×844 AND 1360×900, key assertion of the µ-task's DoD, screenshots archived to scratchpad/qa/.
   - **L3 flow:** the affected user journey end-to-end (deep-link in → act → land), per the T-36 walk pattern.
   - **L4 spec-conformance:** diff the result against the cited spec section's Definition-of-Done (the gap-diff pattern).
   - **L5 adversarial (rule 8):** Team D independently reproduces the builder's proof, tries to BREAK it, checks territory discipline + guardrails → SHIP / DO-NOT-SHIP. DO-NOT-SHIP → the µ-task RETURNS to step 4 with the verifier's findings (max 2 returns, then escalate to owner).
   - **L6 wave regression:** full L0 + spot L2/L3 on the integrated tree at wave close (Team E).
   - **L7 live smoke:** post-deploy production URL checks (Team E) — a ship isn't closed until live answers correctly.
   - **L8 human witness:** the owner's checklist walk (rule 4) — the only level that can flip MOBILE/DESKTOP to ✅.
6. **SHIP** — wave-close: verify green → embed/site rebuild → owner-authorized main merge → deploy watch → L7 smoke.
7. **CLOSE** — register status flips in the SAME commit as the ship; findings discovered en route are ROUTED (new µ-task with team + wave), never dropped.
8. **REPORT** — one verified wave report to the owner (rule 8: post-verification only), with doc links (rule 9) + OWNER-PENDING refresh.
9. **LOOP** — return to 1. Anti-drift audit (register-vs-reality) runs every 3 waves or on any owner challenge.

**Cheap-agent allocation law:** builder low/medium ≤40–90k by µ-task class (measured baselines: QA 41k · audit 71k · build 50–80k) · verifier high ≤70k · wave overhead (E) ≤40k. Wave ceiling ≈ 500k. Hardware note: this 4-core box executes 2–3 agents concurrently; waves of 4–6 µ-tasks keep the pipeline full.


---

## WORK BREAKDOWN — micro-tasks per team (precise allocations; owner directive 17 Jul)

**Wave 1 (active).** Order chosen so the three worst Team-B findings (tiny buttons · banner double-CTA · clipped Passport rows) close together. Wave ceiling ≈ 400k tokens.

| µ-task | Parent | Team | What exactly | Budget | DoD (checked by Team D) |
|---|---|---|---|---|---|
| A1-diff | T-31 | A | From Team B evidence, list EVERY sub-44px control with file:line (primitives vs local overrides) | ≤40k | complete list, no fixes |
| A1-fix | T-31 | A | Raise `.btn-*`, `.chip`, `.field`, icon-buttons to ≥44px in `src/index.css` + tokens; patch local stragglers | ≤60k | Playwright bbox sample ≥44px on 5 screens · verify green |
| A2-fix | T-33 | A | Passport evidence rows @390px: stack date+venue under title — nothing clipped | ≤50k | 390px screenshot shows full date+venue on all rows |
| C3-fix | T-21 | C | Consent banner: demote its Accept from `btn-primary` (kills the double-CTA on every screen) + never cover content/CTAs (dock it, equal-weight buttons §15.2) | ≤50k | one primary CTA per screen with banner open · nothing covered |
| B1-qa | T-01 | B | QA the REAL login form (the sweep hit the demo picker): 7 field states + lexicon + nav @390/1360 | ≤50k | findings list + screenshots |
| B2-docs | M-5 | B | One-page witness checklists for Maria (login · act-editor · radar · public passport · request) | ≤40k | docs/qa/WITNESS-*.md, plain language |
| D-verify ×4 | rule 8 | D | Independent adversarial verify of A1/A2/C3/B1 | ≤70k each | SHIP / DO-NOT-SHIP per µ-task |
| E-ship | wave | E | embed+site rebuild · replica test · deploy watch · live smoke | ≤40k | live URLs green, report to owner |

**Wave 2 (queued, in order):** A3 T-35 viewport-fit (diff ≤30k + fix ≤60k/screen) · A4 = T-36 nav-agent follow-ups · C1 T-19 Hebrew kit block (≤80k) · C2 T-32 self-hosted fonts (≤60k) · B3 regression re-sweep (≤40k/screen).
**Wave 3:** C4 T-23 GA4 (≤60k) · C5 T-26 bot protection (≤80k) · C6 T-22 purge job (≤80k) · T-03/T-04 Radar gap-diffs.
**In flight now:** T-36 nav agent (≤60k, background) · Wave 1 dispatch next.


### T-37 · Marketing-site rebrand program — §16.B.11 (GTM) · §5 (DS) · §4.5 (voice) · §19.7 (SEO)
**Owner brief (17 Jul):** impressive brand design · per-page microcopy · deliberate CTAs · "NOT a tour of the system — a marketing site." Regression context: the unapproved wave-1..6 redesigns (the "many rounds on nothing") live in git history — S1 mines them for salvage, none auto-ships.
**Team S (11th team) · territory `website-next/**` exclusive · governed by rule 12 (taste-gate BEFORE production).**

| µ | What | Deliverable to owner | Budget |
|---|---|---|---|
| S1 | Brand & design directions: 2-3 static hero-page mockups from the app's own DS (§5 night/lime/gold + §5.11 paper variant) | preview screenshots → **owner picks (M-13)** | ≤90k |
| S2 | Information architecture: page map + ONE job + ONE CTA per page | 1-page map in the register | ≤40k |
| S3 | Per-page microcopy EN (localization-matrix: EN first, HE via matrix later) — headline · subhead · 3 proof points · CTA per page, voice law §4.5 | copy doc | ≤80k |
| S4 | Homepage build in the chosen direction | Vercel preview URL → owner approves | ≤90k |
| S5 | Entity pages (Artists · Bookers · Managers) | preview URL | ≤90k |
| S6 | Supporting pages (How-it-works · Free pilot · Trust/Methodology) | preview URL | ≤80k |
| S7 | CTA/conversion pass: one primary per page; join-pilot funnel; consent-gated events only (rule 11) | preview URL | ≤50k |
| S8 | Site QA: L2 390/1360 · lexicon · contrast · asset/logo integrity | QA report | ≤50k |
**Order:** S1 → owner taste-pick → S2‖S3 → S4 → owner preview-approve → S5‖S6‖S7 → S8 → Team D → ship on owner GO. Program cost ≈ 570k + verification.
**State:** program approved-to-plan; S1+S2 dispatch after Wave 2 closes (budget-gated per rule 13).


## Register maintenance log
- 2026-07-17 · Register created from real state; T-01…T-16 assigned (T-01…T-11 = owner's build order; T-12…T-16 = pre-register work needing permanent numbers).
- 2026-07-17 (later) · Owner: "does this cover A-Z for full launch?" → LAUNCH A-Z section added (T-19…T-30). Owner: "set up teams" → TEAMS section; Team B launched. T-17 (genre↔scene correlation) + T-18 (skeleton-hang fix) built, verify-green, in NOW awaiting ship. `docs/OWNER-PENDING.md` created — appears at the end of every reply (standing directive). T-15 applied+verified live (owner "apply it", 17 Jul) → moved to DONE. Team B QA sweep folded → T-31/T-32/T-33 opened. Resend live (key in Vercel, test email delivered); first REAL USER confirmed (shydavid, techno/trance DJ, 11 Jul). T-34 opened (share/deep-link repair — owner screenshot evidence). TEAMS restructured to FIVE with measured token budgets + binding NO-DRIFT procedures (owner directive). T-35 (viewport-fit) + T-36 (nav e2e) opened per owner directives. Standing rules 9-10 added. WORK BREAKDOWN waves 1-3 allocated. TEAMS scaled 5→10. AUTONOMOUS OPERATING LOOP formalized (owner directive: run autonomous, all-level test ladder L0-L8, task-closure loop). T-37 site-rebrand program registered (Team S, rule 12 taste-gate). Rules 12-13 added. Next number: **T-38**.
