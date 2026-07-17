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

**Marks:** ✅ done · ⚠️ partial/unwitnessed (note says what's missing) · ❌ not built · — not applicable (non-screen task).

---

## NOW — the one task in progress

### T-18 · Endless-skeleton hang fix + ship (with T-17) — §10.6 (no dead-ends) · §13.4.4
Owner hit 17 Jul: `/artist/home` stuck on skeleton bars ("the screen disappears all the time").
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ✅ | — | ⚠️ | — | — | ✅ | — | ✅ |
- **CODE ✅** — two layers: every data request now aborts at 15s (global), and the home screen has a 20s watchdog → both land on the existing error-retry screen. A skeleton can no longer be a dead-end. Honest note: the root hang can't be reproduced in my sandbox (live-DB browser access is blocked here) — the fix guarantees *recovery*, and **Maria confirms live** after deploy (OWNER-PENDING M-3).

### T-17 · Genre personalization: canon chips ↔ Radar scene rail — §8.2 (scene lens) · §8.6 · §2.7
Owner directive 17 Jul: "genres = dropdown = the Radar filter — correlated, personalized."
| CODE | MOBILE | DESKTOP | LEXICON | INTERACT | NAV | A11Y | FIREWALL |
|---|---|---|---|---|---|---|---|
| ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ |
- **CODE ✅** — ONE canon vocabulary (`constants.GENRES`, 12 scenes) feeds BOTH the Act-editor chip picker (max 3, first = primary, legacy free-text preserved as a chip, EN+HE strings) AND a new "Your standing in" scene rail on the Radar that re-weights the gold ★ through the already-ratified `genreWeights` engine — additive emphasis only, never a grade (§2.7). Playwright-proven in demo. MOBILE/DESKTOP witness → Maria after deploy.

---

## NEXT-UP QUEUE HEAD (returns to NOW after the ship)

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
When a booking manager reacts, the artist should get an email. The in-app notification works today; the email cannot exist until there is an email account to send from.
- **What Maria does:** sign up at resend.com (free ≤3,000/month) → create an API key → put it in Vercel (I'll give the exact click-path when you have it). **Never paste the key in chat.**

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

## TEAMS — five development teams (owner directive 17 Jul: "5 teams, minimum tokens that allow work, procedures, NO DRIFT")

**Token allocation — measured minimums, not guesses** (basis: Team B's real sweep = ~41k tokens per screen-QA agent). Budgets are per-agent ceilings; an agent that needs more STOPS and reports instead of drifting.

| Team | Mandate | Tasks fed | Agent shape | Budget/agent | Budget/wave |
|---|---|---|---|---|---|
| **A · Screens-Build** | Gap-diff a screen vs its spec DoD, then close the gaps | T-02…T-07 · T-31 · T-33 | 1 differ + 1 fixer per screen · low/medium effort | ≤ 60k | ≤ 150k per screen |
| **B · QA-Checklists** | §10.2/§10.3/LEXICON/INTERACT/NAV/A11Y passes; produce Maria's one-page witness checklists + 390/1360 screenshots | every screen task | 1 QA agent per screen · low effort | ≤ 50k | ≤ 250k per 5-screen sweep |
| **C · Launch-Ops** | The non-screen A-Z: HE pass, a11y, utility screens, purge, GA4, bots, fonts | T-19…T-23 · T-26 · T-32 | 1 agent per task · low/medium | ≤ 80k | ≤ 200k per batch |
| **D · Critic-Verify** | Rule 8: independent adversarial verification of EVERY task start-to-end; SHIP / DO-NOT-SHIP verdict | all teams' output | 1 verifier per task · high effort | ≤ 70k | — |
| **E · Ship-Regression** | verify suite + embed/site builds + replica tests + deploy watch + live smoke after every production merge | every ship | 1 agent per ship · low | ≤ 40k | — |

**Procedures (binding, NO DRIFT):**
- **DEVELOP:** work exists ONLY as a numbered register task (no unnumbered work, ever) · one atomic task per agent · the agent reads the task's spec sections FIRST · all work on the work branch · `npm run verify` (10 inspectors) green before hand-off.
- **TEST:** builder self-test with reproduction (Playwright/replica — screenshots or it didn't happen) → **Team D independent adversarial verification** of the whole flow start-to-end → explicit SHIP verdict. No task is reported on a self-test alone (rule 8).
- **REPORT:** to the owner ONLY after Team D's verdict · plain language · evidence attached · register updated in the SAME commit · OWNER-PENDING refreshed and appended to every reply.
- **SHIP:** production merges to `main` are owner-authorized only · Team E runs live smoke immediately after every deploy · owner gets the exact live URLs to re-test (M-3 pattern).
- **BUDGET:** an agent hitting its ceiling stops and reports partial state — it never silently expands scope.

**Active now:** Team D verifying T-34 (share/deep-link repair) · Team B's first sweep folded (T-31/T-32/T-33).

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
**State:** 🔨 agent dispatched 17 Jul. **Who:** Team A agent + Team D verify before ship (rule 8).


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


## Register maintenance log
- 2026-07-17 · Register created from real state; T-01…T-16 assigned (T-01…T-11 = owner's build order; T-12…T-16 = pre-register work needing permanent numbers).
- 2026-07-17 (later) · Owner: "does this cover A-Z for full launch?" → LAUNCH A-Z section added (T-19…T-30). Owner: "set up teams" → TEAMS section; Team B launched. T-17 (genre↔scene correlation) + T-18 (skeleton-hang fix) built, verify-green, in NOW awaiting ship. `docs/OWNER-PENDING.md` created — appears at the end of every reply (standing directive). T-15 applied+verified live (owner "apply it", 17 Jul) → moved to DONE. Team B QA sweep folded → T-31/T-32/T-33 opened. Resend live (key in Vercel, test email delivered); first REAL USER confirmed (shydavid, techno/trance DJ, 11 Jul). T-34 opened (share/deep-link repair — owner screenshot evidence). TEAMS restructured to FIVE with measured token budgets + binding NO-DRIFT procedures (owner directive). T-35 (viewport-fit) + T-36 (nav e2e) opened per owner directives. Standing rules 9-10 added (doc links every reply · micro-task breakdown). WORK BREAKDOWN waves 1-3 allocated. Next number: **T-37**.
