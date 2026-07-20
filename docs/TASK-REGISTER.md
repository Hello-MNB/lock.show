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
14. **Artifact governance (owner order, 14 Jul 2026 — moved here from SESSION-MEMORY.md during the 21 Jul doc-hygiene pass, its content unchanged):** maintain ONLY three canonical claude.ai artifacts — **Version Map** (a65d12d9-a66d-442c-9077-306eb05fddd6) · **Entities/Flows** (f702abc5-beb4-41a6-9f60-a2f8d239b6c6) · **Full App Prototype** (1c9b0030-9b25-4e1a-87ee-5d18823a661b). No new standalone artifact is ever published without explicit owner approval (**NO-NEW-DOCS rule**, 14 Jul) — extend these three or an existing repo doc instead. Claude NEVER renames, overwrites, or modifies any artifact outside these three — especially other projects' artifacts (**ARTIFACT-SCOPE rule**, 14 Jul, after a real incident overwriting non-LOCK artifacts). Deletion of a stale artifact is always the owner's own action; Claude only lists candidates.

**Marks:** ✅ done · ⚠️ partial/unwitnessed (note says what's missing) · ❌ not built · — not applicable (non-screen task).
**Deployment-state labels (PM-audit upgrade, 17 Jul — never blur code-state with live-state):** `in-code` (work branch) · `merged` (on main) · `deployed-live` (production answered a live probe). A status may claim `deployed-live` ONLY with an L7 probe as evidence.

---

## NOW — DAY-1 TRAIN SHIPPED 18 Jul (3rd train of the day) — LIVE-VERIFIED BOTH SURFACES

**Ship record (owner "ship them"):** main merge `534606a` + embed → push `669b970`. **Live-verified:** app.lock.show `index-DW8JAc3W.js` + embed `index-BVRJUysA.js` both carry the D3 (history bottom-end) + D4 (tap-target sweep) fingerprints — no skew. Ships: T-66 fit fixes · T-68 D1–D5 · T-69 foundation backfills (G-8/G-9/G-10 + §4.1a canon + foundation law). Quarantine held (4 site files stay on branch). **MOBILE/DESKTOP marks: still awaiting the owner's witness word** (rule 4) — she has the live build to walk now.

## Prior — PHASE-N TRAIN SHIPPED 18 Jul (2nd train of the day) — LIVE-VERIFIED BOTH SURFACES

**Ship record:** main merge `d30e74f` + embed `3f2fab8` → single push trigger. **Live-verified (L-7):** app.lock.show bundle `index-BQIX2P5b.js` carries N2 ("night does not break at soundcheck", "paid demand") · N3 ("live-room proof") · N4 EN+HE ("מאז", "אישורים חדשים") · T-61/T-62 ("Show"/"הצג") · prior-train strings intact. **Embed `index-RY69YSvd.js` (lock.show/app) carries Phase-N too — no surface skew.** Rule-12 quarantine held again (4 site files stay on branch). Labels: T-61 · T-62 · T-63(a) · N2–N5 all **deployed-live**. **MOBILE/DESKTOP marks stay "awaiting owner witness"** (rule 4) — the owner's phone walk of the 4-item batch is the open step; probe-poll false-negative lesson: long template strings split in minified bundles — fingerprint with short literals.

## Prior — TRAIN SHIPPED TO PRODUCTION 18 Jul: T-52+T-55+T-59 (+T-58 reveal, T-60 label) — LIVE-VERIFIED

**Ship record (owner-authorized merge, 18 Jul):** main `e36edc9` (merge) + `a6a4eba` (embed rebuild) → `git push origin main` (THE trigger, T-50 P1; no hooks fired). **Live-verified (L-7):** production bundle `index-CPUm3Qf-.js` on app.lock.show carries the train fingerprints ("Returning accounts" · "what we found") — replaced `index-P14llzut.js`. **Face verified** (live-DB witness, DOM assertions): bare-band captions on the Radar face = **0** · visible "Central in your genre" labels = **1**. Embed rebuilt in the same train (no surface skew). **Rule-12 quarantine held:** the 4 site files (3 nav-lane pages → M-16 · consent-banner GA4 guard → M-15) were excluded from the merge and remain on the work branch; back-merge of main into the branch deferred so the quarantined site work is not clobbered — reconcile at the next train. Deployment labels: T-52 · T-55 · T-58 · T-59 · T-60 all **deployed-live**.

## Prior — T-51 spec update SHIPPED (owner R00 order) · Wave 5 re-staged behind the updated §8.2/§8.3

**T-51 · Spec: Radar universe / taxonomy layer (owner order 17 Jul — SPEC ONLY, no build/design/migration)** — DONE, verify-green (13 checks). Updated `docs/LOCK-PRODUCT-SPECIFICATION.md` in place: **§8.2** two jobs (COLLECT + UPGRADE) + the loop (scan→✦→✓→advise→add→scan again) + the **8-family→planet emphasis model** (table verbatim from `genreWeights.js`, "eight Radars, same six planets") + scanner-honesty block (§2.8 applied) · **§8.3** coaching-line spec (R00 canonical example verbatim; names-scene/ONE-thing/why-buyer-cares/warm/derived-never-stored; explicit allowed-vs-forbidden pair; renders in Inspector layer 1, no new surface) + per-node `why_a_buyer_cares` i18n law · **§16.A.5** `whatsapp-group` source row (audience planet, band-only via `bandFromCount`, self-band/self-reported PROVES honesty) · **NEW §16.A.5b Registry B** (field_id · genre_family · applicability R/C/O/N · planet_key · why_a_buyer_cares; N = never shown/asked/counted; 5 worked example rows) · **§16.A.6.a** taxonomy-migration STRUCTURE (≥038, diff-first, additive, dual-read, structure-now/content-OWED — NOT authored, NOT run) · **§18.2** OWED sheet content (owner R00) + HE-labels OPEN + **R-10** asset-value method-label OPEN (R16 reads YES: band + method label per §5.10). Firewall untouched — nothing required a score/rank/comparison. **CONSEQUENCE: Wave 5 Radar builds (T-03…T-06) now build to the UPDATED §8.2/§8.3 — the W4-4 conformance table must be re-diffed against the new spec before dispatch.**

## Prior — Wave 5 staging (Radar builds from the W4-4 conformance plan) · WAVE 4 SHIPPED

**Wave 4 record (17 Jul, 754k actual, 7/7 SHIP):** **T-44 `merged`** — operator activate control + Admin Gate tiles built (funnel counts, firewall-verified); artist mark-paid flow proven in demo → **the Gate is now RECORDABLE** · **T-46 ✅ wired** — DS-drift inspector in the gate (tokens sync · rogue-hex · asset law; existing legit hexes allowlisted with TODO migration) · **T-47 ✅ wired** — component-styles registry generated from code, --check in gate · **T-03 conformance table delivered** (wave transcript; feeds Wave 5 Radar builds) · **T-39 ✅** security-boundary matrix · **T-42 ✅** risk register · **T-43 ✅** retention-policy draft (lawyer pack M-4) · **T-45 ✅** reverse sweep (coverage table in transcript). **The verify gate now runs 13 checks.** Routed cleanups: vite process-group kill in the W4-1 helper script · hex allowlist file-scoping (T-46 backlog).

## Prior — WAVE 4 dispatch record

| µ | Task | Team | Type |
|---|---|---|---|
| W4-1 | T-44 Gate pay-path: artist mark-paid verify + operator activate + Gate tiles | A1+F | build + D-verify |
| W4-2 | T-46 DS-drift inspector (tokens sync · rogue-hex census · asset law) | A1 | build + D-verify |
| W4-3 | T-47 component-styles registry, generated from code | G | build + D-verify |
| W4-4 | T-03 Radar desktop gap-diff vs §8.2 DoD (read-only → build plan) | A1 | audit |
| W4-5 | T-39 security-boundary matrix | G | docs |
| W4-6 | T-42 risk register + T-43 retention-policy draft (lawyer pack) | G | docs |
| W4-7 | T-45 reverse coverage sweep (every spec § → an owner) | G | audit |

package.json verify-hook wiring for W4-2/W4-3 = orchestrator at wave close (single-writer, avoids territory collision).

## Prior — Wave 3 SHIPPED

**Wave 3 record (17 Jul, 725k, 6/6 SHIP):** T-01 login fixes `merged` (9 humane error keys EN+HE, 7 states) · T-35 p2 `merged` (/settings −1521px, /act/edit fit) · **T-38 ARCHITECTURE.md ✅ EXISTS** · **T-40 event registry ✅ generated-from-code + wired into verify** · T-25 email path built DARK (`EMAIL_ENABLED` unset; from-address at wiring = spec §14.6.5 `notifications@lock.show`) · T-41+hygiene built `in-code`, **HELD on main per rule 12 → one word (M-15) ships it**. Verifier security note → M-12 reinforced: rotate the key BEFORE any flag flip.

### Prior: S0 site-audit wave (5 read-only agents)

_Wave 2 SHIPPED 17 Jul (4/4 Team-D SHIP, live-smoked: fonts self-hosted confirmed live — zero Google Fonts requests). The table below is kept as the shipped record:_

### Shipped Wave 2 record

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

| # | Task | State | Evidence |
|---|---|---|---|
| T-17 | Genre chips ↔ Radar scene rail (§8.2/§8.6) | deployed-live | owner's own screenshot 17 Jul + demo Playwright |
| T-18 | Skeleton-hang fix (§10.6/§13.4.4) | deployed-live | owner's screenshot shows Radar rendering; live probe 200 |
| T-34 | Share/deep-link repair (§7.6) | deployed-live | Team D SHIP + live URL probes |
| T-31 | 44px tap targets (§10.2/§5.7) | deployed-live | Team D SHIP (21/22 sampled) |
| T-33 | Passport mobile rows (§8.7) | deployed-live | Team D SHIP (14/14 rows assert) |
| T-21p | Consent banner equal-weight+docked (§15.2) | deployed-live | Team D SHIP |

All await the owner's witness (rule 4) to progress toward DONE.

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

**Post-Gate (NOT queued, per directive):** monetization ON/prices · growth loops (incl. two named
backlog items merged 21 Jul 2026 from the retired TASK-STATUS-BOARD.md P2 list, still true and not
tracked elsewhere by name: Spotify catalog integration into discovery/evidence — key verified; a
value-vs-genre view for managers — needs genre taxonomy filled, Registry B) · international ·
platformization (§16.B.12-16, §19).

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
9. **LOOP** — return to 1.

**SPEC-RETURN & ANTI-DRIFT CADENCE (owner directive 17 Jul — "prove the autonomy is justified"):**
- **Every µ-task:** the builder reads its cited spec sections BEFORE code (loop step 3) + guardrails pass.
- **Every wave close:** full 10-inspector gate · rule-12 cargo check on the merge diff · register statuses synced in the ship commit.
- **Every 3 waves, ANY owner challenge, or ANY regression:** the full ANTI-DRIFT CHECKLIST below, reported to the owner as a checklist with evidence.
- **Every 10 waves:** deep pass — re-read changed spec sections end-to-end · architecture review (territories, file ownership, dependency direction) · SESSION-MEMORY refresh.

**THE ANTI-DRIFT CHECKLIST (the autonomy proof, run + reported):**
□ 10-inspector gate green · □ canon-drift in-sync (app==DB) · □ zero unnumbered work in commits · □ working tree committed+pushed · □ register NOW/BLOCKED = reality · □ every shipped µ-task carries a Team-D verdict · □ rule-12 cargo check ran on last merge · □ rule-11 boundary attestation (no real-data/email/money/live-DB actions without owner word) · □ docs synced (MEMORY · OWNER-PENDING · SITE-MANAGEMENT · LESSONS) · □ open debts listed honestly · □ all prior-wave findings ROUTED (nothing produced-then-dropped).

**PROCESS PATCHES (17 Jul hole-hunt — owner: "find the holes that permit drift"):**
- **P-1 attribution:** wave-close commits are made PER TERRITORY (one commit per µ-task's files), and Team D verifiers receive the µ-task's explicit file-scope list — no more commingled-checkpoint archaeology.
- **P-2 lessons injection:** `docs/LESSONS.md` (new ledger) is referenced in every workflow agent's brief — past failures become standing instructions, not memories.
- **P-3 witness-debt gate:** when unwitnessed live screens exceed EIGHT, screen-building waves PAUSE (ops/infra waves may continue) until the owner witnesses — debt cannot compound silently.
- **P-4 preview-first option:** app changes can ship to a PREVIEW deployment for owner testing before main when the change is owner-visible UX (the site already must, rule 12).
- **Known holes accepted-open (honest):** L4 spec-conformance diffs not yet run for the Radar screens (T-03…T-06, queued Wave 4) · app-side rollback never rehearsed (T-27) · no production error-monitoring (§19.2, deliberately post-Gate) · bundle 538kB>500kB (perf pass queued) · B1 login-QA findings produced but not yet folded into T-01 (routing debt — Wave 3).

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
**Order:** S0 audits → S1 → owner taste-pick → S2‖S3 → S4 → owner preview-approve → S5‖S6‖S7 → S8 → Team D → ship on owner GO. Program cost ≈ 570k + S0 ≈ 220k + verification.
**State:** S0 COMPLETE 17 Jul (5 agents · 438k · all reported). **Digest → S1 inputs:**
- **Owner's instincts all VALIDATED by measurement:** font hierarchy broken (THREE different H2 systems across pages: sans-900 vs serif-400 vs sans-400) · container widths inconsistent (home sections 600–1100px vs subpages 1120 vs nav 1100 — no single grid) · lime over-used on home (401k px² incl. giant decorative blobs; 2 lime primaries in the first viewport) and as wallpaper on /producers · images missing on most pages (only home/artists/bookers have any).
- **Content:** /artists and /bookers are EXCELLENT (pure single-audience voice, benefit-led — keep as the gold standard). Home: 3 different labels for the SAME signup CTA (P1); "The Design Principle" kicker = builder-speak; JSON-LD carries technical strings Google can surface.
- **Broken facts:** `llms.txt` advertises /managers and /production — both 404 (routes don't exist; real route is /producers). Footer links 34px + logo 23px tap targets (<44). 
- **Mobile:** all real pages PASS h-scroll/hero/stacking — the approved site is structurally mobile-sound.
- **Infra:** legacy `website/` confirmed UNREFERENCED + undeployed → archive plan ready (no deletion without owner visibility). Vercel config audit archived in wave transcript.
- **Routing:** hygiene fixes (llms.txt routes · footer/logo tap sizes) join T-41's named train — pending owner GO (M-15); design-level items (H2 unification · one grid · lime discipline · one CTA label · images) = S1 brief inputs for the taste-pick. Site ops doc created: `docs/SITE-MANAGEMENT.md` (version log · deploy truths · rule-12 pipeline · owner brand bar · Codex-DS absorption · housekeeping).

**S0 audit µ-tasks (read-only, owner brief 17 Jul):**
| µ | Audit | Criteria (owner's words operationalized) | Budget |
|---|---|---|---|
| S0-content | Content/messaging per page | marketing-human not technical · ONE audience per container, never mixed · CTA clarity | ≤50k |
| S0-design | Brand as a super-brand | lime only where it should be · uniform font hierarchy · identical full-screen content width · image usage | ≤50k |
| S0-mobile | Mobile-first conformance | 390px-first per page · no h-scroll · hero legibility | ≤45k |
| S0-flows | Internal links + signup/login | every internal link valid · site→app entries work end-to-end · legal pages | ≤45k |
| S0-infra | Repo folder order + Vercel professional config | legacy website/ archive plan (no silent deletions) · Vercel projects/settings/domains audit (read-only) | ≤40k |


### T-38 · Consolidated ARCHITECTURE.md — §13 (engineering) · §3 (entity model)
The one professional document found MISSING in the 17 Jul documents inventory: a single consolidated architecture map (app structure · server · DB · embed · site · team territories · dependency direction). Partial pieces exist (PASSPORT-ARCHITECTURE.md, CODEX-FUNCTIONAL-CONTRACTS.md, GIGPROOF-DB-STRUCTURE.md, spec §13) — T-38 consolidates, it does not duplicate. **Who:** Team G, Wave 3. Budget ≤60k.


### T-39 · SECURITY-BOUNDARY-MATRIX.md — §13.5
One page: every surface (public passport · app · server API · DB · site) × every actor (anon · artist · buyer · confirmer · operator · service-role) → what each may reach, with the enforcing mechanism (RLS/grant/CSP/rate-limit) and its test. Consolidates what security-denial already proves. **Who:** Team G, Wave 3-4. ≤50k.

### T-40 · Machine-readable event registry — §14.3
`docs/registry/events.json` generated FROM `src/lib/analytics.js` (name · actor · surface · Gate-relevance), regenerated by a script wired into verify — so external tools (Cowork's measurement plan) consume the same canon the code enforces, never a hand-copied list. **Who:** Team F, Wave 3-4. ≤40k.

### T-41 · Site security headers — §13.5.5 (site half, was OWED)
`website-next/vercel.json` gains CSP/nosniff/referrer/permissions headers (site-appropriate CSP — GA + fonts). Ships as a named site train (rule 12 — infra, no visual change, still cargo-checked). **Who:** Team C2, Wave 3. ≤30k. Verified live 17 Jul: app.lock.show has FULL headers `deployed-live`; www.lock.show has HSTS only.


### T-42 · Current Risk Register — §16.B.14 (risk)
docs/RISK-REGISTER.md: live venture risks (platform concentration · key-person · legal-gate · token-budget · single-repo) each with likelihood/impact/mitigation/owner. The archived one is stale. **Who:** Team G + Maria review. ≤40k.

### T-43 · Data-retention & deletion policy — §15.1
One page, counsel-ready: what data · why · how long · deletion path (pairs with T-22 purge job). Feeds the M-4 lawyer pack. **Who:** Team G draft → counsel. ≤40k.


### T-44 · The Gate pay-path, end-to-end (Cowork E#1 — the one catch that matters) — §1.6 · §14.4
**Owner ruling 17 Jul: real payment PROVIDER connects only when development ends.** The Gate's "pay" half is the MANUAL pilot path and must work pre-Gate: artist marks "I've paid" (Bit reference → `payment_reference_created`) → operator activates (`entitlement_activated`). Mechanics exist (OfferPayment.jsx + entitlements 007 + both events in the 29-canon); `/artist/offer` currently redirects while `PAYMENTS_ENABLED` off, and the operator activation UI + Admin Gate tiles are T-11 backlog. **Task:** verify the artist mark-paid flow works flag-on in DEMO, build the operator activate control + Gate tiles (product-event numbers — firewall-fine), witness. Without this the Gate literally cannot be recorded as met. **Who:** A1+F, Wave 4. ≤120k.

### T-45 · Reverse coverage sweep (Cowork E#4) — every spec sub-section → an owner
One-time agent sweep: list every §0–21 sub-section → confirm each has an owning doc, a task number, or an explicit post-Gate/not-needed mark. Output: coverage table appended here; gaps become tasks. **Who:** Team G, Wave 4. ≤60k.


### T-46 · DS-drift inspector (the mechanical cure for "constant design drift") — §5.6 (3-tier token control) · §5.11
Owner observation 17 Jul: design drifts repeatedly. Root causes are structural: (1) `tailwind.config.js` and `src/tokens.ts` are kept in sync BY HAND (drift by design), (2) raw hex colors / arbitrary px values can enter components unchecked, (3) the SITE runs a separate styling world from the app DS. **Build:** `scripts/test-ds-drift.mjs` wired into verify — (a) parses tailwind.config + tokens.ts and FAILS on any value mismatch; (b) greps src/** for rogue hex colors and off-scale font sizes outside an allowlist (tokens files, index.css); (c) counts `.btn-primary` semantics unchanged. Like the firewall inspectors: the DS stops relying on discipline and becomes law. **Who:** Team A1 + G, Wave 4. ≤60k.


### T-47 · Component styling registry — GENERATED from code — §5.8 (widget kit) · §5.6
Owner directive 17 Jul: "styling documented for every component; hermetic, unambiguous in every development." Hand-written style docs drift (the "28" disease, design edition). **Build:** `scripts/generate-component-styles.mjs` → `docs/design-system/COMPONENT-STYLES.md` — parses `src/index.css` primitives (.btn/.btn-primary/.btn-ghost/.chip/.field/.card/.tap-target…) + `src/components/ui.jsx` widget exports (Wordmark, GpIcon, StatusChip, BottomSheet, PageShell, Field, EmptyState/ErrorState…) and emits per-component: class recipe · token dependencies · state set · usage law line. `--check` mode wired into verify (regenerate+diff, like T-40). Together with T-46 (token-sync + rogue-value inspector) and the ASSET-REGISTRY law, the DS becomes MECHANICALLY hermetic: styling truth is generated from code, assets have one source, and the gate fails on any deviation. **Who:** Team A1+G, Wave 4. ≤70k.


### T-48 · Site navigation program — docs/SITE-NAVIGATION-SPEC.md (owning doc) · §7 (nav) · §4.5 (voice)
Owner directive 17 Jul: characterize site nav + entity transitions end-to-end; no pages without navigation; break to µ-tasks and build. **Spec written (SITE-NAVIGATION-SPEC.md, S0-grounded).** µ-tasks:
| µ | What | Team | State |
|---|---|---|---|
| N1 | "Not you?" cross-entity lane on /artists /bookers /producers (law 5) | S | ✅ built · **Team D: SHIP** (break-test passed) · preview live · awaiting owner taste word (M-16) |
| N2 | Nav-conformance test (laws 1-3, re-runnable crawl) | S/B | ✅ built · **Team D: SHIP** — 14 pages / 24 links green; proven to FAIL on a hidden page |
| N3 | Home CTA-label unification (law 4) | S1 design lane | queued (taste-gated) |
| N4 | llms.txt dead routes | held hygiene train | awaiting M-15 |
Ships per rule 12: preview URL → owner approval → named train.


### T-49 · Public Passport redesign — HOLD for the owner's brief (owner 17 Jul: "the Passport screen is not good in my view — I'll update what I want soon")
No speculative design work on the Passport surface (public views OR the T-07 self-view, which shares the design) until the owner's brief arrives. When it does: brief → spec update (§8.7/§8.4) → design → preview → taste-approval → build. **Who:** A2 + S1 lane, on owner brief. T-07 build order now FOLLOWS T-49.


### T-50 · Deploy-architecture repair program — root causes from 17 Jul evidence — §19.6 · SITE-MANAGEMENT
**Measured symptom:** 20 site deployments in one day (14 CANCELED, 6 READY); 5 failure emails to the owner; duplicate/confusing states.
**Root causes (each evidenced today):**
1. **Dual origin** — the app is served BOTH at app.lock.show AND inside lock.show/app → every app change needs two ships, rescue hacks, double testing. (The deepest cause.)
2. **130 generated build files committed in git** (the embed) — app changes force rebuild-and-commit of artifacts into the SITE, triggering site deploys for app work.
3. **Duplicate triggers** — git-push auto-deploys AND manual deploy hooks both fire → duplicates that smart-skip then CANCELs (reads like failure; emails the owner).
4. **Every work-branch push previews BOTH projects** — agent-session pushes (57 today) spam previews; 4 of the owner's 5 failure emails were previews of mid-surgery branch states.
5. App rollback never rehearsed (T-27 open).
**Repair plan:**
| Phase | Fix | Needs |
|---|---|---|
| P1 (done with this commit) | Trigger law: git-push = THE only production trigger; hooks = explicit previews only. Team E deploy-log per ship. Documented in SITE-MANAGEMENT. | none |
| P2 | Preview-skip: site ignoreCommand also skips PREVIEW builds when website-next/ unchanged → kills preview spam + failure emails | rides the hygiene train (M-15) |
| P3 | **ADR-1 (M-14): canonical origin app.lock.show** → lock.show/app/* becomes a 301 redirect → KILLS causes 1+2 outright: no embed, no artifact commits, no rescue bounce, one ship path | owner's one sentence |
| P4 | T-27 rollback rehearsal (app) on a preview + runbook update | scheduled Wave 6 |
**After P3 the deploy story is:** one app project (auto-deploy from main) + one site project (taste-trains only) + zero generated files in git.


### T-51 · Spec update: Radar universe / taxonomy layer (owner R00 order, 17 Jul) — §8.2 · §8.3 · §16.A · §18
**Owner order (verbatim scope):** SPEC ONLY — "Do not build. Do not design. Do not run the migration." Context: R00 16 Jul — the Radar COLLECTS the artist's universe AND helps IMPROVE it; the startup's meaning is PRE-BOOKING. Two spec failures fixed: (1) the universe was free text with no governed registry; (2) the Radar spec described collection but not upgrade ("A Radar that only collects is a form. A form is not the product.").
**Delivered (all in `docs/LOCK-PRODUCT-SPECIFICATION.md`, in place):** §8.2 two-jobs + loop + 8-family→planet emphasis table (verbatim `genreWeights.js`) + scanner honesty · §8.3 coaching-line spec (canonical example, 6 rules, allowed/forbidden pair, Inspector layer-1 only) + per-node `why_a_buyer_cares` law · §16.A.5 `whatsapp-group` row + band/PROVES note · §16.A.5b Registry B (5-column schema, N-rule, 5 worked examples) · §16.A.6.a migration structure (≥038, diff-first, spec-only) · §18.2 OWED/OPEN records incl. R-10 · date line bumped.
**Status:** CODE ✅ (docs change, verify-green 13/13) · deployment label `in-code` on the work branch · FIREWALL ✅ (nothing added requires a score/rank/comparison; §2.1/§2.7 untouched) · other marks n/a (no screen). **Still open from this task:** the Sheet content fill (OWED, owner R00) · HE-label ratification (OPEN) · R-10 ruling (OPEN). **Downstream:** Wave 5 (T-03…T-06) re-diffs against the updated §8.2/§8.3 before dispatch; the taxonomy migration waits for explicit owner authorization.

### T-52 · Gate-tile `is_demo` read filter — the 037 paired-sequence completion (audit catch, 18 Jul) — §14.3.2
**Found by:** the owner-ordered second-pass audit of T-51. Migration 037 was applied 17 Jul, but the pre-agreed paired step (SESSION-MEMORY: "owner applies 037 → THEN ship the `.eq('is_demo', false)` Gate-metric filter") was never executed — the operator Gate tiles counted seed/demo events (43 demo rows) as if real outside demand. The tiles' own note honestly said "Seed/test accounts are not yet excluded," confirming the gap. 037's header mandates the filter before counts are trusted.
**Fix (shipped `in-code` this commit):** `src/features/admin/gateCounts.js` adds `.eq('is_demo', false)` to every Gate-event count · `gateNote` EN/HE updated to disclose the exclusion ("Seed and test-account activity is excluded from these counts" / "פעילות חשבונות בדיקה מסוננת מהספירה"). Safe order: column exists live (applied+verified) before the filter ships — the paired sequence holds.
**Status:** CODE ✅ (verify-green 13/13) · LEXICON ✅ (EN+HE) · FIREWALL ✅ (operator product-event counts, never per-person) · deployment `in-code` on the work branch — rides the next authorized app merge. Remaining polish (not a blocker): per-tile "demo-excluded" badge (§14.3.2 item 3; section-level note covers it today).

### T-53 · Artist-universe gap research (owner order 18 Jul: "research old Drive docs + your docs, identify the gaps we didn't identify") — RESEARCH DONE
**Deliverable:** `docs/UNIVERSE-GAP-REPORT.md` (INDEX row added). Sources actually read: Drive B4-20.50 Sheet (all 22 tabs) · B4-35.50 v1.9 per-persona spec · "The Universal Artist Passport" (superseded vision) · CODEX value-engine handoff v1.6.13 · repo registry F1.csv/F2-F6-DELTAS + radarUniverse.js + passportKit.jsx + 8 architecture docs.
**Headline findings:** (1) the universe is fully documented — 376 fields / 18 segments EXIST in-repo as `docs/registry/F1.csv` — but Radar renders ≈5% and Passport ≈13% of passport-eligible fields; DB has no `field_id`; (2) Registry B is NOT empty (contradicts the 8-Jul audit + T-51 spec text) — four competing schemas need one ruling; (3) the Passport cure is already in old canon (Proof Unit anatomy · 30-second proof story · per-viewer lenses · minimum credible-Passport gate) — never implemented; (4) display-language analysis: buyer-side person-numbers stay absolute; artist-private expressiveness is solvable with count-based vocabulary; artist-private completion-% = clean owner decision **R-11**; (5) new doc-level gaps: certainty-vocab conflict, brief↔workbook count drifts, education missing from the whole model, segment-name drift.
**Follow-ups:** P-A spec update (no ruling needed — queued as **T-54**) · R-11 + registry-schema + certainty + Sheet-R00 rulings → OWNER-PENDING M-17 · T-49 decision material delivered (§3 of the report) · build wiring P-E waits for ≥038 authorization.

### T-55 · Signal-measurement audit + Gate-critical wiring (owner order + approval 18 Jul) — DONE
**Part 1 (audit, chat-delivered):** traced all 29 canon events to call sites. Returning customers = NOT measured (owner's named gap confirmed); near-payment intent wired but dormant (M-8 flag); bridge absent; GA4 present in app shell incl. Passport routes; §8.12 built = Gate tiles only.
**Owner decisions:** GA4 scoped OUT of evidence surfaces · retention = priority · wire the bridge · payment flag STAYS OFF (ready for the flip).
**Part 3 (wired, this commit — all firewall-safe, first-party):**
- **Retention (FIRING):** `AuthProvider` emits `login {via:'session-restore', returning:true}` once per tab-session on restored sessions (first-party seen-marker) · `Login` carries `via/returning` · `Passport` view carries `return_visit` · `fetchRetention()` read model + **2 new cockpit retention tiles** (returning accounts · repeat Passport opens; demo-excluded; EN+HE).
- **Bridge (FIRING):** `captureFirstTouch()` in `main.jsx` (utm_* · referrer · landing · `?s=1` share marker, once per browser, localStorage) → attached to `signup_completed` — share→signup join now computable.
- **GA4 scope-out (BUILT):** `ConsentBanner.jsx` never loads gtag on `/passport|/confirm|/evidence` routes; same guard in site `consent-banner.tsx` (SITE file — rides the M-15 hygiene train per rule 12, not shipped to production with app merges).
- **Payment:** untouched per ruling — `payment_reference_created` dormant behind `VITE_PAYMENTS_ENABLED`, fires on flip; `entitlement_activated` live-capable.
**Part 2 (spec, in place, provenance-stamped):** §21.1 per-family measurement status · §14.1.5 "what actually fires" + §14.1.4 evidence-surface scope-out rule · §8.12 built-vs-pending tile table. NO new document.
**Status:** CODE ✅ verify-green 13/13 · LEXICON ✅ EN+HE · FIREWALL ✅ (counts of product events, operator-only; first-party markers carry no identity) · label `in-code` on the work branch. Unwired-by-design remainder recorded in §14.1.5 (edge events, Relationship family needs a canon migration — owner-gated).

### T-56 · Live witness walk: login + onboarding (owner pre-merge order, 18 Jul) — DONE, all steps PASS
**Method:** sandbox Chromium cannot reach live Supabase directly → ran the real app locally against the LIVE backend (anon key pulled via Supabase management API), with every Supabase call relayed through Node over the agent proxy (TLS verified via the proxy CA — no verification disabled). Seed account only (`artist@gigproof.test`). 8 screenshots delivered to owner.
**Witnessed:** login screen → sign-in → artist home (loaded Radar: scene rail · genre-★ planets · source nodes · next-action) → /onboarding step 1 (prefilled MG/Tel Aviv, no consent re-ask — ledger honored) → step 2 (link + "Soundcloud recognized") → "Scan it — open my Radar" → /artist/home. **DB proof per step:** profile_item created (public-verified) · evidence_artifact created (link/public-profile/consistent-frequency) · analytics: `login{via:password}` · `login{via:session-restore,returning:true}` (**T-55 retention event witnessed firing live**) · `onboarding_completed` · `radar_opened`.
**Restored:** walk profile_item + evidence_artifact deleted (evidence table back to pre-walk state; profile_items back to 5) · artist row untouched (owner's own MG/Tel Aviv kept) · all 5 walk analytics rows marked `is_demo=true`.
**Findings:** (1) 🟠 **ongoing seed-actor analytics rows default `is_demo=false`** — the 037 backfill was one-time; new seed activity would pollute live counts (this walk proved it; I marked rows manually). Durable fix = mark-at-write for `@gigproof.test` actors or a DB trigger — queue as **T-57**. (2) The mid-walk skeleton frames were relay-latency artifacts, not app hangs — the same screen renders fully loaded (shots 03/08); the 20s watchdog never tripped.

### T-58 · Onboarding step-3 "here's what we found" reveal — ✅ BUILT (owner "go", 18 Jul)
Step 3 added in its honest real-data form: after a link is saved, the reveal shows THE captured link as a ✦ found row (platform logo + "captured just now") + the §2.8 honest-scope line + "Open my Radar & confirm". No link → completes from step 2 (a reveal never fabricates findings). 3-segment progress; EN+HE keys (`revealTitle/Sub/RowSub/Found/Scope/Cta` + 3rd step label); completion event unchanged (`onboarding_completed` fires at finish). The animated multi-source scan stays TARGET (§8.1 provenance note added). Verify-green.

### T-59 · Radar face: draw-bands render as naked numbers on the platform ring — ✅ FIXED (owner "fix it", 18 Jul)
**Mechanism (verified in code + live seed data):** `derivePlatformNodes()` (`RadarUniverse.jsx:69-85`) routes CLAIMS onto the platform ring via `detectPlatform(c.source_type)` — `"ticket-export"` matches the `ticket` mark, `"producer-vouch"` matches `venue` — and line 82 sets the ring caption to **`c.value` raw**. For `draw-band` claims the value IS a band → "220–340" and "400–600" (the seed's real ticket-export + producer-vouch claims) float on the orbit face with NO method label and no room-fit line. **Violates §5.10** (a band always pairs with its method label + human line) — the owner's reading "it reads as a score on the orbit" is correct. **FIX SHIPPED (this commit):** `derivePlatformNodes` claims branch stores `method` (never the value); the ring caption/title/aria render the i18n METHOD LABEL ("Evidence-supported" / "Producer-confirmed") for claim nodes; links keep host captions. The band lives only in the planet panel with its method chip (§5.10). Verify-green.

### T-60 · Genre-★ text label — ✅ FIRST-priority planet only (owner ruling, 18 Jul)
**Verdict:** firing exactly per the ratified model. The seed's default Act carries `genre="melodic techno"` (no festival hint; act genre wins over the artist string) → family `dj-club` → primaries **live · audience · prokit** — precisely the 3 labeled planets in the owner's screenshot. Every family defines exactly 3 primary planets (§8.2 table), so 3 stars is always the intended output; G2 guard intact; picking the "Trance" scene chip legitimately moves the ★ to music·live·proof. **RULED + SHIPPED (this commit):** ring+★ stay on ALL primary planets; the "Central in your genre" TEXT renders only on the family's first-priority planet (`genrePrimaryList[0]`); the other primaries keep the wording in aria-label (accessibility unchanged).

### T-61 · Ring caption truncation (owner catch 18 Jul — CONFIRMED, fix on owner word)
The caption box is `max-w-[72px] truncate` (`RadarUniverse.jsx:562`); T-59's method labels ("EVIDENCE-SUPPORTED", "PRODUCER-CONFIRMED") don't fit → "EVIDENCE-SUPPOR…". Pre-existing for long hosts too ("INSTAGRAM.CO…") — T-59 made a standing defect prominent. L-8 logged (fit-check law). **Proposed fix:** two-line wrap (no truncate) in a wider box (~88–96px), centered, `line-clamp-2`; verify longest EN+HE strings at 390px + 1360px with screenshots before ship.

### T-62 · Lens rail has no visible label + hardcoded EN aria (owner catch 18 Jul — CONFIRMED, fix on owner word)
The scene rail carries its visible label ("Your standing in", `:408`); the lens rail (All · Needs you · Ready + worlds dropdown) has NONE — only `aria-label="radar filters"`, a **hardcoded English string** (localization-matrix violation). Spec §8.2 names it the "Show" rail. **Proposed fix:** same visible mono label pattern as the scene rail ("Show" / HE "הצג"), i18n keys EN+HE, aria from i18n.

### T-63 · "MG" vs "Maya Vale" (owner question 18 Jul — REAL SYNC BUG surfaced by seed data, fix on owner word)
Live DB: `artists.stage_name="MG"` (owner's live edit / onboarding path writes artists only) but the default **`act.stage_name="Maya Vale"`** (original seed; Act editor writes act only). Both surfaces render truthfully from DIFFERENT columns — center star reads the artist ("MG"), the act switcher reads the act ("Maya Vale"). Not a rendering bug: a **dual-write consistency gap** for the default Act (020: act.id=artists.id, two stage_name columns, no sync). Any real user editing via onboarding vs the Act editor can desync the same way. **Proposed fix:** single source per canon (Act owns identity): identity writes mirror to the default act (or act-first reads everywhere); pick + ship on owner word.

### RULE 4 — STRENGTHENED (owner directive 18 Jul): the 8-point DoD is per-screen LAW
**No screen is DONE on CODE-green alone.** Per screen, every screen: CODE · MOBILE · DESKTOP · LEXICON · INTERACT · NAV · A11Y · FIREWALL — and **MOBILE/DESKTOP remain "awaiting owner witness" until the owner has looked**. The agent BATCHES witness items for the owner (one page per screen, `docs/qa/WITNESS-CHECKLISTS.md`). Any string change ships with a fit check (L-8). **Current witness batch (awaiting owner):** Radar face desktop+mobile (T-59/T-60/T-17) · onboarding 3-step (T-58) · admin Gate+retention tiles (T-52/T-55) · login/onboarding walk re-check on her phone (M-3).

### T-64 · REAL-DATA LAUNCH PROGRAM (owner R00 planning order, 18 Jul — PLAN ONLY, nothing built)
**The law held throughout:** Radar (private) = the whole truth — gaps + scene-aware coaching (the COACH). Passport (buyer) = strengths only (the PROOF). Improvement frames: scene-standard OR own-history — NEVER peer/percentile/"relative to others" (§2.9).
**PHASE N — BUILDABLE NOW (no scanner, no real-data dependency — the artist's own data):**
| # | Task | Notes |
|---|---|---|
| N1 | T-61 caption fit · T-62 lens-rail label · T-63 stage-name sync | staged, on owner word (+ a/b for T-63) |
| N2 | **Per-item universe map** — every planet node renders own state + `why_a_buyer_cares` + ONE next step (§8.2 registry-driven, §8.3 node law; reads F1.csv seed rows) | full fill richer after M-17; buildable now |
| N3 | **Scene-aware coaching lines** (§8.3) — computed at render from family emphasis + node state; scene-standard framing only | i18n EN+HE; never stored |
| N4 | **Own-history frame** — "since {month}: N new confirmations" from the artist's OWN claims/events timeline (additive counts, §5.10 progress vocabulary) | zero new data needed |
| N5 | **Two-view firewall assertions** — mechanical check: coaching/gap strings absent from Passport DOM + buildSafePayload (extends test:guardrails) | the §20 pattern |
| N6 | Witness batches per strengthened rule 4 — every N-task ships with MOBILE/DESKTOP "awaiting owner witness" | 8-point DoD |
**PHASE G — CORRECTED BY R00 RULING (18 Jul): counsel is NOT a gate.** The legal drafts are PUBLISHED, Amendment-13 consent capture is BUILT, counsel review runs in PARALLEL — the signed final rides in when it arrives and blocks neither Phase N nor real-artist beta onboarding. Anti-over-gating law adopted: before marking anything OWNER-GATED, check it genuinely prevents progress; caution ≠ gate. Remaining genuine items: G2 = one verified live Anthropic extraction on a seed artifact (test, not build) · the deep scanner is a BUILD status (Phase S), not a permission gate · narrow verify: shydavid consent row + withdrawal path (5-minute check, blocks nothing).
**PHASE S — POST-COUNSEL BUILDS (in order):** S1 `thirdparty-evidence` consent surface at the connect moment (§15.2.2) → S2 the §9.1 deep scan (locale queries → Tavily → opus-4-8 extraction w/ `same_person_confidence` + source + date + proves/doesn't-prove → dedup → ✦found → confirm / "not me" recorded; DB ready — 028 `discovered` applied; needs endpoint + cron worker; COST MEASURED before any pricing per CLAUDE.md) → S3 operator hand-QA queue, flag-gated, BEFORE user-facing → S4 incremental re-scans (`last_discovery_scan_at`) → S5 open real-artist onboarding.
**DoD block for every PHASE-N screen (Part 3 law, verbatim into each task):** Radar may show gaps+coaching+weakness as warm invitations (§4.5/§6.8), never a verdict · Passport shows strengths only — gaps ABSENT from the DOM · no surface ranks the artist against another person · coaching framed scene-standard or own-history only · every band carries its method label (T-59 rule, permanent).

### T-65 · PHASE N WAVE — the improvement layer, BUILT (owner R00 "start Phase N", 18 Jul) — all verify-green, witnessed with assertions
**Rulings executed first:** T-61 ✅ (captions wrap two centered lines, max-w-96px, no truncate — DOM assertion: 0 truncated captions) · T-62 ✅ (visible "Show"/"הצג" label on the lens rail + i18n aria — assertion: label present) · T-63(a) ✅ (`upsertArtist` mirrors identity fields to the default Act on write, `one_line→positioning` mapped, best-effort; + one-time seed sync: act.stage_name="MG" now matches — the owner's observed mismatch is gone).
**Phase N delivered (two-view DoD on every item):**
- **N2 ✅ per-item why-a-buyer-cares** — every derived field node carries `why` → 16 registry-informed i18n lines EN+HE (ticket export = "the only proof of paid demand", WhatsApp = "a private room you own", rider = "why the night doesn't break at soundcheck"…), rendered under the node in the planet panel. Artist-private only.
- **N3 ✅ scene-aware coaching line** — Inspector Layer 1: "In {the artist's actual scene}, {why this planet matters}" — 6 per-planet lines EN+HE, scene-standard facts only, computed at render, never stored; G2: no declared scene → no line. Witnessed live: "In melodic techno, live-room proof matters more than follower count…".
- **N4 ✅ own-history frame** — `ownHistory()` (additive, positive-only: null when nothing new) → "Since {month}: N new confirmations" on the Radar. Witnessed live: "Since July: 3 new confirmations".
- **N5 ✅ two-view firewall inspector** — guardrails inspector #6: coaching/why/history/gap vocabulary must be ABSENT from `src/features/passport/**` + `server/index.js`. **Break-tested:** planted `S.coach[` in Passport.jsx → caught, exit 1 → reverted, green. Verify gate now runs 6 inspectors.
- **N6 ✅ witness batch prepared** (below). MOBILE/DESKTOP on every N-task = **awaiting owner witness** per strengthened rule 4.
**shydavid verification (R00's narrow item):** ✅ consent rows EXIST (privacy-policy + data-processing, accepted 11 Jul, v3-inline-gates ledger) · withdrawal path exists in code (Settings → deletion request writes a `withdrawn` ledger row) · passport unpublished. Note, not a blocker: rows carry legacy scope names; forward writes use canon `privacy-processing`.
**OWNER WITNESS BATCH (M-5, phone + desktop):** 1) Radar face — wrapped captions, "Show" label, history line, single genre label · 2) planet panel — coaching line + why-lines per node · 3) onboarding 3-step reveal · 4) admin Gate + Retention tiles.
**STOP honored:** production merge NOT executed (listed STOP) — the wave is verify-green on the work branch, ready for the merge word. Nothing else is blocked; nothing was over-gated.

### T-66 · HOW-TO-BUILD-A-TASK governance + the L1 FIT inspector (owner order 18 Jul) — DONE
**Created `docs/HOW-TO-BUILD-A-TASK.md`** (INDEX row added): decomposition method (one T-number/one done-sentence/micro-tasks with single territories; whole-screen instructions forbidden per §20.E) · the **L0–L5 self-verify ladder** (L1 FIT = the missing layer: truncation/overlap/h-scroll/tap/one-CTA assertions at 360+1360) · the honesty rule ("the owner confirms taste and warmth; I guarantee it fits and functions").
**Part 4 answer: L1 is AUTOMATED** — `scripts/test-fit.mjs` renders the DEMO build headlessly (fixtures, no network; deterministic demo-role route) and asserts fit at both widths; wired into `npm run verify` (**the gate now runs 14 checks**). Loud SKIP with manual-procedure pointer on machines without the browser. Tap-target assertion = WARN in v1 (raw boxes <44 excluding `.tap-target` expansions; promote to FAIL after a sweep — follow-up). Live-data shapes additionally get a manual L1 pass before witness handoff (demo can't reproduce every live state).
**Retro-run on the live Radar (the proof):** DESKTOP-1360 → **overlaps: 1 — "Your standing in…" × "Since July: 3 new confirm…"** (exactly the collision the owner reported, caught programmatically) · MOBILE-360 → **truncated: 1 — "Readiness (private)"** (a defect the owner had NOT yet reported). **Both fixed per the file's own law** (history line → bottom-end corner; quick-link labels wrap): post-fix fit = truncated 0 · overlaps 0 · h-scroll none · one CTA, both widths, demo + live shapes. Fixes are `in-code` on the branch — ride the next authorized train.
**Standing loop updated:** TEST stage now reads L0 verify → **L1 fit (automated + live-shape manual)** → L2 states → L3 nav → L4 two-view → L5 screenshot-proof → Team-D adversarial → owner witness. CLAUDE.md pointer proposed as **M-18** (owner edits her own file).

### T-67 · Entity→screen map + SCREEN-BUILD-CHECKLIST + Artist-entity audit (owner order 18 Jul) — DONE
**Spec deepened IN PLACE:** §7.7.a — the binding ENTITY→SCREEN MAP (7 rows: main canvas · engine · secondaries with nav-in/back · shell · signals, every cell cited to §8/§17.B) + 4 FLAGGED-THIN items for owner ruling (Representation secondaries [AG1–AG4 canon adoption] · Production creation flows · buyer `/discover` · roster mini-Radar). Nothing invented.
**Created `docs/SCREEN-BUILD-CHECKLIST.md`** (INDEX row added): 9 sections — NAV · MAIN-INTERACTIVITY · CONTENT/LEXICON · FIT(L1) · STATES · A11Y · FIREWALL · SIGNALS ("a screen is not done if its signals are silent") · SELF-VERIFY — each assertion project-specific and cited.
**Artist-entity audit run (Part 3):** table delivered in chat. **The known history-line × scene-rail collision IS caught** (Radar · FIT · desktop → overlaps:1 on live production; fix already in-code from T-66). New finds beyond the owner's report: "Readiness (private)" truncation at 360 (fixed in-code) · Settings fires no persisted signal (canon defines none — recorded as canon-consistent, not silent-failure) · Inspector L2 state-probe (long/Hebrew/URL/invalid per field) never run systematically — queued as the next witness-prep task.

### T-68 · ARTIST DAY-1 FIX CYCLE — the 5 HIGH defects (D-register formalized; owner order 18 Jul) — BUILT, awaiting owner witness
**Defect IDs (permanent):** D1 "Readiness (private)" truncation @360 · D2 consent-banner "Privacy Policy" sub-44 touch target · **D3 history-line × scene-rail collision @1360 (fixed FIRST per order)** · D4 sub-44 touch targets ×7 (hub trigger · bell · SideNav links · "Edit ›" · center genre tag · Manage-Passport row · center act-switch) · D5 fit-coverage gap (onboarding absent from the automated route).
**Fixes:** D3 history line → bottom-end corner · D1 quick-link labels wrap · D2+D4 `.tap-target` hit-area expansion (zero visual change) + `min-h-[44px]` on the Manage-Passport row · D5 onboarding added as fit screen 3. **Hardened along the way:** the fit inspector now NAMES offenders, the touch assertion is correctly scoped to the mobile pass (44px is a touch law; `<select>` can't host pseudo-expansion), and — with the sweep at zero — **taps<44 promoted WARN→FAIL**.
**Self-verify (ladder):** L0 verify GREEN (14 checks, fit now FAIL-level) · L1 demo: 6/6 screen-renders "truncated 0 · overlaps 0 · h-scroll none · one CTA" · L1 live-shape: DESKTOP-1360 + MOBILE-360 both "truncated 0 · overlaps 0 · h-scroll none" · L2 n/a (no field logic touched) · L3 nav unchanged (hit-areas only) · L4 inspector #6 green · L5 after-screenshots captured + described.
**Status:** `in-code` on the branch — NOT merged (owner: witness first). MOBILE/DESKTOP NOT marked green — the 5 fixes are BATCHED for the owner's witness walk with before/after notes.

### T-69 · Foundation closure: G-8/G-9/G-10 backfilled + DS currency audit + the foundation law (owner order 18 Jul) — DONE, shipped with the Day-1 train
**Owner standing principle RECORDED** (HOW-TO-BUILD-A-TASK Part 0): progress never outruns the foundation; build-ahead-of-spec = STOP → backfill → owner ratifies; a code capability absent from the spec is a drift risk, not a feature. + the gap-detection rule (pre-build foundation check; never fill a spec gap with an invention).
**Backfills (spec in place, each marked ratify: R00):** G-8 → §8.2 milestone table (8 waypoints, EN+HE from built i18n, exact lighting conditions, render + firewall law) + §4.1a canon glossary entry (the names are terminology now; HE = built values pending R00) · G-9 → §8.2 own-history line spec (the four-corner ONE-TENANT law born from D3; data source; firewall; mobile in-flow) · G-10 → §8.2 mobile scene-rail spec (in-flow scrollable chip row, ≥44px chips, why D3 can't occur at ≤md).
**DS currency audit (Part 3):** CURRENT — color/spacing/type tokens (gold·teal·amber·na-bg·lime discipline) in tailwind+A13; node marks ✓✦?+ documented; dashed/solid law present. **THIN (flagged, NOT invented — R00/Codex ruling):** the Radar EFFECT layer is undocumented in docs/design-system/ — `.glow-found`, `.bloom-confirm` (~420ms), `dark-island`, constellation-thread state colors (amber=needs · teal=developing · lime=ready), sonar/sweep/starfield motion — all live only in `src/index.css`; AND the generated COMPONENT-STYLES registry does not cover feature components (RadarUniverse absent) — generator scope gap. Both queued for ruling.

### T-70 · Close-out self-audit installed + run on today's work (owner order 18 Jul) — DONE
**Standing rule added:** HOW-TO-BUILD-A-TASK Part 4 — the 5-step SPEC-FIDELITY REPORT (forward · backward · contradiction · foundation-completeness · report), run autonomously at the close of EVERY task; autonomy boundary restated (fix/backfill autonomously w/ ratify:R00; STOP on rulings/migrations/merges/real-data/pay-flag). Old automation section renumbered Part 5.
**Today's fidelity run:** G-8/G-9/G-10 physically confirmed in §8.2/§4.1a (grep-verified, incl. both HE name tables) · **M1–M8 contradiction resolved in place** (one line: internal codes vs §4.1a display names — §8.2 and §5.10 agree; marked do-not-"fix") · **G-DS completed exhaustively:** Artist screens use 5 undocumented effect classes — `glow-found` ·`bloom-confirm` ·`shadow-glow-gold` ·`shadow-card` (partially) ·`dark-island` — plus `tap-target` (documented once); sonar/sweep/starfield motion + thread-state colors also undocumented → ONE consolidated DS gap for R00/Codex ruling (adopt into the DS doc from index.css as-built values — backfill candidate, needs the DS-owner lane). Forward check: D1–D5 + Phase-N verified against their governing sections (report in chat). Verify green.

### T-71 · Prove-don't-claim rule + R16 verification round (owner order 18 Jul) — DONE
**Rule installed** (HOW-TO-BUILD-A-TASK Part 4 step 5): every spec change ships file+line+SHA+before/after+verify-pointer; a change without proof = NOT DONE; the file-of-record + HEAD SHA stated in every report; a lagging export is called out explicitly.
**R16's finding explained WITH proof:** the M1–M8 clarification DID land (line 651, commit `0400161`) — R16's line numbers (615/407) match the **T-54-era exported copy** (file_uuid 83e8d83b, exported before T-69/T-70 shifted the file). Not an unlanded fix — a stale export. Cure: fresh export sent + the rule now requires stating export lag.
**Completed per order:** the internal-codes clause now sits in ALL THREE M1–M8 lines (§5.10 line 421 · §8.2 line 653 · §9.4 line 976, commits `0400161`+`0303d10`) · G-8/9/10 proven with line+SHA (see report) · **G-DS recorded IN THE SPEC** (§5.11, visible "ratify: R00" marker, commit `0303d10`) — R16 was right that the earlier record lived only in the register.

### T-72 · Artist entity Medium/Low close-out (owner cadence step, 18 Jul) — BUILT, awaiting owner witness
**D6 (§8.3 per-field DoD):** invalid inputs now carry HUMAN explanations (url/link: "A link starts with https://…"; number: "A whole number above zero" — EN+HE) · every field save gets a **7s Undo** (previous value restored; item-creating fills excluded by design) · url-kind saves gated on validity (probe caught save-enabled-on-invalid). **L2 probe PASSED end-to-end in-browser:** empty→save disabled ✓ · invalid→hint ✓ · Hebrew/long accepted ✓ · save→undo visible ✓ · undo→node returns to invitation ✓.
**D7:** the OPEN Inspector panel is now fit-route screen 3 — and immediately caught+fixed a real defect (BottomSheet "×" close under 44px; now `.tap-target`+44). **D8:** onboarding fit-clean both widths (route screen 4). Fit route now 8 renders/run, all "truncated 0 · overlaps 0 · h-scroll none".
**ARTIST ENTITY: CHECKLIST-COMPLETE, AWAITING WITNESS** — every §7.7.a Artist screen passes NAV/ENGINE/LEXICON/FIT/STATES/A11Y/FIREWALL/SIGNALS; only the owner-witness marks remain. `in-code`, unmerged (cadence: witness → merge).

### T-73 · Team doctrine + wave plan (owner order 18 Jul) — doctrine recorded, plan PROPOSED (not started)
Doctrine → HOW-TO-BUILD-A-TASK Part 6 (two constraints · brief shape · model tiers · shared-component law · one witness batch per wave). Wave plan delivered in chat for wave-by-wave approval; Buyer/Passport wave detailed first (Gate-path priority). No building started.

### T-74 · Full-app per-screen FIT measurement (owner prove-don't-claim demand, 18 Jul) — 38 renders measured, honest correction issued
**CORRECTION (own overstatement, caught by the owner's per-screen-numbers demand):** T-72's "Artist entity: checklist-complete" covered the CORE (radar · panel · onboarding · dashboard · access · act-edit — all clean) but the Artist SECONDARIES were never fit-measured: **artist·claims = truncated 23 @360 / taps<44 34** (worst screen in the app) · **artist·evidence = truncated 8 @360**. Retracted → "Artist CORE checklist-complete; secondaries measured, defect list opened."
**Full measurement (19 screens × 2 widths, demo build; numbers in chat):** clean = login · radar · onboarding · access · act-edit · settings@1360 etc. **Defects found on never-audited screens:** admin·cockpit (truncated 9 @360, taps 16) · buyer·discover (taps 13) · representation·roster (taps 13) · passport·public (taps 5 both views) · production·events (taps 3) · 1-tap smalls on signup/forgot/requests/readiness/settings/passport·request. **NOT-MEASURED (honest):** /confirm/:token · /invite/:token · /reset-password (token-gated) · request-sent receipt · agency+production sub-routes · notifications inbox — no token/deep-state path in the demo harness yet.
**These numbers ARE the wave fix-lists** (each defect belongs to its entity's wave territory). Nothing fixed in this task (owner: witness first); no merge; no migration.

### T-75 · Artist secondaries fix cycle (autonomous dev continuation, owner away 18 Jul) — BUILT, in the witness batch
The T-74 defect list closed inside the approved entity: **claims** truncated 23→0 · taps 34→0 (the truncated confirm-button wording also violated §8.3's exact-wording law — now full wrap; visibility chips/producer-ask/edit-hint/back all ≥44) · **evidence** truncated 8→0 · **requests** taps 1→0 (row height) · **readiness** taps 1→0. Post-fix: all four screens "truncated:0 · overlaps:0 · h-scroll:none · taps<44:0" at 360 AND 1360. Verify green. `in-code`, unmerged — joins tomorrow's witness batch (before/after: the claims screen was the worst screen in the app; now clean).
**T-57 ✅ BUILT (same session):** `analytics.js` marks `is_demo: true` at write when the actor is a `@gigproof.test` seed — ends the hand-patching the T-56 walk exposed. Residual (noted): rare server-side `claim_confirmed` writes for seed artists carry no actor and stay unmarked — operator-patchable, low volume.
**NOT touched (cadence respected):** passport/auth/admin/roster tap baselines — they belong to Waves B/C and wait for wave approval.

### T-76 · WAVE-B (staged 18 Jul night · **DISPATCHED 20 Jul on the owner's "Run forward" order** — the witness gates the MERGE, never the BUILD · **BUILD COMPLETE, verify-green; awaiting owner witness** — see the 2026-07-20 maintenance-log entry for the full wave record)
_All spec citations line-anchored at HEAD `2167491`. Standing for every task below: model tiers per Part-6 doctrine · self-verify L0–L5 + close-out audit silent with numbers reported · prove-don't-claim (file+line+SHA) · MOBILE/DESKTOP never self-greened · STOP on owner ruling / migration / merge / real data / payment flag. **Cross-wave single-writer law: `src/lib/i18n/en.js`+`he.js` and any `src/components/**` change are ORCHESTRATOR-ONLY, applied solo at wave close — no team touches them (the collision every team would otherwise have)._**

**T-77 · B1 — Buyer/Passport secondaries** · territory `src/features/passport/**` (6 files, exclusively) · spec §8.7 L808–846 · §8.8 L847–864 · §8.4 four-faces L730–757 · §5.10 L403–425 · builder-cheap · verifier-cheap pass at close.
| µ | done-sentence | file | budget |
|---|---|---|---|
| B1-a | passportKit's §5.10 warmth layer is complete (venue-context draw lines · positive-only binaries · method chip + human sub-text · warm dates) and shared by all views | `passportKit.jsx` ONLY — runs FIRST (kit is the views' shared base) | ~40k |
| B1-b | the four §8.4 faces re-order + re-language correctly (Booking · Representing · Production · Private/corporate registers; U34 switcher pattern; same facts, never different numbers) | `Passport.jsx` + `PassportBookingView.jsx` + `PassportRepView.jsx` | ~60k |
| B1-c | request→receipt is state-complete (§10.4 seven states · duplicate-submit guard · fit 360/1360 · the 5 sub-44 taps → 0) | `AvailabilityRequest.jsx` + `RequestConfirmation.jsx` | ~50k |
DoD: NAV·LEXICON(D9 warm register)·FIT(0/0/none/≥44)·STATES·A11Y·FIREWALL(strengths-only, gaps absent from DOM — inspector #6)·SIGNALS(`passport_view`+`return_visit`·reaction·request FIRING). Sequence: B1-a → then B1-b ∥ B1-c. Collision: none outside its dir.

**T-78 · B2 — Source-Confirmer + token fixture** · territory `src/features/producer/ProducerConfirm.jsx` + `scripts/test-fit.mjs` (fixture section only) · spec §8.9 L865–886 · builder-cheap.
| µ | done-sentence | file |
|---|---|---|
| B2-a | a DEMO token fixture renders /confirm/:token in the harness so the ceremony is fit-measurable and owner-witnessable | `scripts/test-fit.mjs` (+ demo fixture data path if needed — flag if it needs `demo.js`, which is orchestrator territory) |
| B2-b | the one-minute ceremony passes the checklist (yes/partial/no/wrong-person states · warm voice · no shell · a bounded receipt) | `ProducerConfirm.jsx` |
| B2-c | the post-submit receipt + expired/used/revoked states render honestly (§8.9 states list) at both widths | `ProducerConfirm.jsx` (sequential after B2-b — same file) |
DoD: NAV(no-shell law)·LEXICON(מאשר-מקור canon)·FIT·STATES·FIREWALL(no general-endorsement language)·SIGNALS(server-side `claim_confirmed`). Collision: none.

**T-79 · B3 — Representation roster** · territory `src/features/agency/**` (5 files) · spec §8.10 L887–904 · builder-cheap; **the AG1–AG4 depth adoption = ARCHITECT STOP (owner thin-flag ruling ①) — this task cleans the BUILT shells only.**
| µ | done-sentence | file |
|---|---|---|
| B3-a | roster cockpit checklist-clean (fit: truncated 1→0 · taps 13→0; one action per card; no rank anywhere) | `AgencyDashboard.jsx` |
| B3-b | requests inbox states + nav-back clean | `AgencyRequestsInbox.jsx` |
| B3-c | roster radar surfaces checklist-clean (never-rank-roster law) | `AgencyRadarUniverse.jsx` + `RadarFeed.jsx` |
| B3-d | roster next-action derivation honest (what-changed · why · one action) | `rosterNextAction.js` |
DoD: +FIREWALL(no roster rank · reaction = method-safe text) · SIGNALS(⚠ Relationship family NOT-WIRED — canon migration gap, recorded, not invented). **Collision caution: reads `src/lib/orgs.js` — never writes it (see B4).**

**T-80 · B4 — Production lineup** · territory `src/features/production/ProductionDashboard.jsx` (+`src/lib/orgs.js` ONLY via its isolated micro) · spec §8.11 L905–924 · builder-cheap except the migration.
| µ | done-sentence | file | tier |
|---|---|---|---|
| B4-a | events board checklist-clean on BUILT read-only state (fit: taps 3→0; slot states render; one CTA per slot) | `ProductionDashboard.jsx` | builder |
| B4-b | any `orgs.js` change (shared with agency) runs SOLO, never beside B3 | `src/lib/orgs.js` | builder, solo-slot |
| **B4-M (C6)** | **the production event/lineup-slot tables migration: AUTHORED with paired `.down.sql` + a plain-language card (tables · columns · reversible) — NEVER RUN. VERIFIED FACT at staging: zero production/lineup tables exist in migrations 001–037, so creation flows genuinely require it. Numbered at authoring (next free ≥038, diff-first §16.A.6.a rules)** | `supabase/migrations/` | **ARCHITECT · STOP — owner approves the SQL before it touches anything; owner applies it herself as always** |
| B4-c | create-event/open-slot UI (§8.11 TARGET) — **BLOCKED behind B4-M approval+apply**; staged, not dispatchable until then | `ProductionDashboard.jsx` | builder |
DoD: +FIREWALL(never owns artist evidence · fit reasons never rank). Collision: B4-b vs ALL of B3 (orgs.js) — solo-slot law.

**T-81 · B5 — Admin cockpit completion** · territory `src/features/admin/**` · spec §8.12 L925–960 (BUILT-vs-PENDING table L953–960) · builder-cheap.
| µ | done-sentence | file |
|---|---|---|
| B5-a | the pilot funnel bar renders (counts only, source events already FIRING per §14.1.5; demo-excluded; source·timeframe stated) | `gateCounts.js` + `AdminDashboard.jsx` |
| B5-b | fit debt cleared (truncated 9→0 · taps 16→0 at 360) | `AdminDashboard.jsx` (sequential after B5-a — same file) |
| B5-c | publish-freshness + risk tiles (stale vs unpublished; §8.12 DoD) — AI-cost ledger flagged: needs a server read path → **flag, don't invent** (server/index.js is outside this territory) | `AdminDashboard.jsx` |
DoD: +FIREWALL(product-event counts only · intent ≠ revenue) · SIGNALS(tiles read the FIRING canon). Collision: none.

**THE PARALLEL MAP (max non-colliding set):** **B1 ∥ B2 ∥ B3 ∥ B5 — four teams, zero shared files.** B4 joins the same wave ONLY with B4-b (orgs.js) held to a solo slot (before or after B3's run) — else B4 sequences after B3. B4-M is owner-gated regardless and B4-c is blocked behind it. i18n + shared-component changes: orchestrator-only, wave close. Witness batch at wave close = one batch, per entity, before/after per screen.

### T-82 · RADAR COMPLETENESS BUILD (owner approval 20 Jul: "approve R-1 through R-5 — R-1 first; hold R-6/R-7 for M-17")
From the Thread-1 completeness audit (20 Jul). Territory: `RadarUniverse.jsx` + `radarUniverse.js` (one builder, sequential R-1→R-4) · shared piece `ui.jsx` BottomSheet pull-down built SOLO-FIRST by orchestrator (09f4c79) · R-5 (`ArtistDashboard.jsx` pickNextAction family-order, §8.2 L669) = orchestrator solo slot AFTER the builder lands (claimPlanet export collision — single-writer law). R-6/R-7 registry nodes: **HELD for M-17**, not dispatched.
| µ | scope | spec |
|---|---|---|
| R-1 | mobile Radar-Focus gestures: focus-fade 40% · swipe planet-cycle · long-press method peek · tap-center overview · pull-down close (shared piece done) | §8.2 L620 |
| R-2 | Locked Professional Kit ("Not needed yet" until live proof backed; unlock CTA routes to live) | §8.2 L648 · §8.3 chip |
| R-3 | constellation threads (state-colored, fixed geometry, grades nothing) | §8.2 L651 |
| R-4 | desktop persistent right-rail inspector; one-primary-CTA law (rail XOR dock) | §8.2 L613–618 |
| R-5 | NBA walks planetEmphasisOrder candidates first | §8.2 L669 · §21.3 |

**SUCCESS FORMULA (Part-8 shape, retro-applied 20 Jul):** T-82 succeeds when a FIRST-TIME artist on a phone feels the designed Radar — planet focus that responds to touch (swipe/pull/press), a Kit that honestly says "not yet," growth visible as threads, and on desktop a persistent inspector — not when the gestures merely fire in code. The bar is the §8.2 Radar-Focus feel at 360px, witnessed.
**COMPLETENESS CHECKLIST:** ☐ interactivity (swipe cycle · pull-down · long-press peek · tap-center · focus-fade reversible) ☐ nav (locked-Kit CTA routes to live proof; no dead end) ☐ lexicon EN+HE (locked-state words via i18n manifest) ☐ fit 360+1360 (threads/rail cause no overflow; one primary CTA rail-XOR-dock) ☐ states (locked/needs-you/developing/ready render distinctly) ☐ a11y (reduced-motion on all new motion; aria states kept) ☐ firewall (no counts on faces; threads = state color only, fixed geometry) ☐ DS tokens (state colors = existing amber/teal/lime tokens).
**PARAMETER AUDIT (pre-build, vs HEAD):** gestures §8.2 L620 present · locked sequencing L648+§8.3 chip present, unlock-rule data-shape THIN (builder ordered to derive from real shapes + state the rule for ratify, not invent semantics) · threads L651 present · 4-zone L613–618 present · locked-state i18n vocabulary THIN (manifest path mandated) · no missing parameter required spec backfill beyond the shared BottomSheet piece (built solo-first, 09f4c79).

### T-83 · PASSPORT v2 (owner pick 20 Jul: concepts 2+1+4+7 + hero 3 — "this is the T-49 direction"; spec-first honored: §5.10 ROOM GRAMMAR backfilled + ratify:R00 at 09f4c79 BEFORE build)
Territory: `src/features/passport/**` (one builder; may create components in-dir) · i18n manifest → orchestrator at close. P-1 warm-line-lead (§5.10) · P-2 30-second proof story (§8.7) · P-3 provenance-forward cards (source-type display, logo≠quality) · P-4 freshness pulse (§5.10 dates, §21.6) · P-5 HERO room grammar (the ratified §5.10 block, verbatim — canonical bands only, non-ladder law, fallback honest). Two-view inspector #6 must stay green; witness gates the merge.

**SUCCESS FORMULA (Part-8 shape, retro-applied 20 Jul):** T-83 succeeds when a buyer opening a Passport FEELS the artist's value in the first 30 seconds — a story that reads, a room that lights, provenance that leads — and every emotional beat is the same bounded truth (band+method) it always was; not when the sections merely render. The bar is "bands as benches" is GONE while the firewall inspector still passes mechanically.
**COMPLETENESS CHECKLIST:** ☐ content/lexicon EN+HE (story-beat labels · source-type human lines · 4 room names — via manifest) ☐ fit 360+1360 (room row wraps 2×2 at 360, no h-scroll; story strip compact) ☐ interactivity (faces still switch; hero only on canonical-band draw) ☐ states (fresh/verified/stale date chips; fallback warm-line when free-form band) ☐ a11y (room aria = band+method words, never bigger/better; logo≠quality aria) ☐ firewall (two-view inspector #6 green; no negative binaries in DOM; fixed editorial order never ranking) ☐ DS tokens (lime accents, no red-for-stale, currentColor SVG).
**PARAMETER AUDIT (pre-build, vs HEAD):** §5.10 warm-line + dates present · §8.7 proof-story present (target text) · provenance display types present (§5.10 pairing rule + Drive-inspiration source-node types, repo-anchored) · room grammar was MISSING → STOPPED and backfilled to §5.10 FIRST (ratify: R00, commit 09f4c79) — the Part-8 exemplar · canonical band strings present in code (BANDS.capacity) — builder ordered to match exactly, free-form falls back.

## Register maintenance log
- 2026-07-17 · Register created from real state; T-01…T-16 assigned (T-01…T-11 = owner's build order; T-12…T-16 = pre-register work needing permanent numbers).
- 2026-07-17 (later) · Owner: "does this cover A-Z for full launch?" → LAUNCH A-Z section added (T-19…T-30). Owner: "set up teams" → TEAMS section; Team B launched. T-17 (genre↔scene correlation) + T-18 (skeleton-hang fix) built, verify-green, in NOW awaiting ship. `docs/OWNER-PENDING.md` created — appears at the end of every reply (standing directive). T-15 applied+verified live (owner "apply it", 17 Jul) → moved to DONE. Team B QA sweep folded → T-31/T-32/T-33 opened. Resend live (key in Vercel, test email delivered); first REAL USER confirmed (shydavid, techno/trance DJ, 11 Jul). T-34 opened (share/deep-link repair — owner screenshot evidence). TEAMS restructured to FIVE with measured token budgets + binding NO-DRIFT procedures (owner directive). T-35 (viewport-fit) + T-36 (nav e2e) opened per owner directives. Standing rules 9-10 added. WORK BREAKDOWN waves 1-3 allocated. TEAMS scaled 5→10. AUTONOMOUS OPERATING LOOP formalized (owner directive: run autonomous, all-level test ladder L0-L8, task-closure loop). T-37 registered. Rules 12-13 added. 17 Jul hole-hunt: LESSONS.md + P-1..P-4; T-38 opened. PM-audit verification: canon 29 CONFIRMED live (auditor stale), app headers CONFIRMED deployed-live, spec copies IDENTICAL; 3-state labels adopted; T-39/T-40/T-41 opened; ADR-1 canonical origin → owner M-14. Cowork v2 audit adopted: DOCS-INDEX created (docs/INDEX.md) · ADR folder opened (ADR-0001 pending M-14) · T-42 risk register · T-43 retention policy. Cowork E-notes folded: E#1 pay-path → T-44 (the real catch) · E#2 confirmer screen VERIFIED BUILT (ProducerConfirm ceremony exists; T-36 walked /confirm/:token; witness queued with screen QA) · E#3 post-Gate deferrals confirmed correct (buyer→pay path needs none of §8.5/8.10/8.11 pre-Gate) · E#4 → T-45 reverse sweep · E#5 entity-artifact sync owner = Team G (INDEX). Owner ruling recorded: real payment provider = post-development; pilot pay = manual Bit path. T-46 DS-drift inspector + T-47 generated component-styles registry + ASSET-REGISTRY.md created (owner: hermetic design law). T-48 site-nav program opened (spec doc + µ-tasks N1-N4). T-49 opened as a HOLD (owner Passport brief incoming; T-07 sequenced behind it). T-50 deploy-architecture repair program opened (evidence: 20 deploys/14 canceled today).
- 2026-07-17 (night) · **T-51 registered + DONE** — owner R00 spec-only order executed (Radar universe/taxonomy layer into the spec; details in the T-51 entry). Wave 5 re-staged behind the updated §8.2/§8.3.
- 2026-07-18 · **Owner-ordered AUDIT+FIX on T-51** — second-pass audit of my own work. Verified clean: family table = `genreWeights.js` exactly · R00 verbatims exact · i18n keys (`genreFocus`/`genrePrimary`) exist · PROVES quotes match code · §16.A.5b/§18.2 numbering + markdown render sound · firewall clean. **Caught + fixed:** (1) 🔴 **T-52** — the 037 paired read-filter never shipped (Gate tiles counted demo rows as real; now filtered + disclosed EN/HE); (2) 🟠 spec still claimed migration head 035 and `is_demo` "OWED" in 10 places (§0 TOC · §11.4 · §13.2/13.2.1/13.8 · §14.3.2 · §14.4 rule 4 · §14.7 ×2 · §18.0 · §20 example · §21 readiness) — all updated to head=037/next≥038, §14.3.2 rewritten BUILT with honest remaining-delta; (3) 🟠 `docs/VERSIONS.md` DB row had never recorded the 037 apply (the spec cites it as head authority) — manifest updated.
- 2026-07-18 · **T-53 registered + research DONE** (universe gap report; owner order). New owner items → OWNER-PENDING (R-11 + M-17); T-54 reserved for the no-ruling spec update.
- 2026-07-20 · **WAVE-B EXECUTED** (owner "Run forward" order: witness gates the merge, never the build). Five parallel sonnet builders dispatched + all completed; orchestrator ran i18n application + verify at close. **T-77 ✅BUILT** (passportKit warmth layer: methodLabelHint peek · contextLine venue-context over bands · positive-only binaries [`sells_tickets:false` now ABSENT from buyer DOM] · warm dates via `humanizeReviewDate`; PersonaToggle 2→4 faces; NEW `PassportProductionView.jsx` + `PassportPrivateView.jsx`; request form per-field hints + past-date invalid + duplicate-submit guard; **4 draft-copy judgment calls flagged for owner, not canonized** — CTA/tagline strings, private-face section order, turnkey 3-of-3 threshold, production chips register). **T-78 ✅BUILT** (confirmer: submitting state per button · expired/used/revoked/invalid dead-link states · closeNote exits · confirm screen ADDED to test-fit [now 5 screens×2]; B2's server-contract flag RESOLVED by orchestrator against `server/index.js`: 404=invalid/410=expired only; used/revoked ride the 200 payload correctly — comment pinned in `ProducerConfirm.jsx`, commit db5facb). **T-79 ✅BUILT** (agency: 1 truncate + 13→0 sub-44 taps · 3 dormant i18n keys wired · no-rank sweep verified [chronological roster, severity-ordered signals] · 2 method-label ambiguity flags → thin-flag list). **T-80/B4-a ✅BUILT** (production tabs 3→0 taps · empty-state single-CTA · dead prop removed; **B4-b NOT NEEDED** — both B3 and B4-a reported zero orgs.js patches; **B4-M/C6 ✅AUTHORED-NOT-APPLIED** commit 3730b62: `038_production_events.sql`+`.down.sql`, production_event+lineup_slot, org-RLS via 008 pattern, plain-language card delivered to owner, NEVER RUN; B4-c stays blocked behind C6 approval+apply). **T-81 ✅BUILT** (funnel bar driven by `FUNNEL_EVENTS` canon w/ `is_demo=false` · 9 truncates fixed · freshness tile honest [published-vs-unpublished only, stale-detection gap stated in-copy] · risk tile + AI-cost ledger FLAGGED OUT not faked — both need read models/server paths, owner decision pending). **Close: verify green 14/14 exit 0** incl. fit sweep 5×2 all-zeros (commit 30a18f7). **Deviation recorded:** B2+B5 wrote their i18n keys directly into en.js/he.js instead of manifests (single-writer law breach; no collision materialized — keys landed in disjoint sections; content audited clean at close; brief wording to tighten next wave). B1+B3 manifests applied by orchestrator (70c34d1, 30a18f7). MOBILE/DESKTOP: **awaiting-owner-witness** on every touched screen — nothing self-greened. NOT merged; C6 NOT run.
- 2026-07-18 · **T-54 DONE** (owner: "present the advanced updated spec including what I'm asking, for checking with other software") — spec updated in place, verify-green: §8.2 REGISTRY-DRIVEN NODES target (F1.csv = node source; 18 segments as in-planet groups; N/A law; registry-fed coaching) · §5.10 count-based progress vocabulary (X-of-Y, discrete-step rings, per-planet tallies — no ruling needed; % stays behind R-11) · §8.7 UNIVERSE TRANSLATION target (Proof-Unit law for all content classes · 30-second proof story · missing content classes list · lenses = selection+language · minimum credible-Passport publish gate · widened buyer action set — design still HOLD behind T-49 taste brief) · §16.A.5b Registry-B reality correction (F1.csv exists; 4 schemas → M-17) · §18.2 R-11/M-17/education-gap rows. Spec now 4,210 lines. Files exported to owner for external checking. Next number: **T-84** (T-82 Radar completeness + T-83 Passport v2 assigned 20 Jul). (…T-75 secondaries+T-57 · T-76 Wave-B staged in full [T-77…T-81, C6 isolated as B4-M]; NOTHING dispatched — awaiting per-task approval after the Passport witness.) (18 Jul later: T-55 wiring DONE · T-56 witness PASS · T-57 opened [seed is_demo mark-at-write] · T-58 queued [onboarding reveal] · T-59 CONFIRMED [naked bands on ring — fix on owner word] · T-60 verdict [genre-★ per-spec; label refinement optional].)
- 2026-07-21 (owner traceability order) · **REQUEST→WORK LEDGER, verified current:** ① one-viewport interactive law → IX specs (§8.0–§8.13, DONE) + BUILD-RADAR (DONE: humanized captions/coach-first/NBA-reason) + BUILD-PASSPORT (EvidenceExplorer panes, IN FLIGHT) · ② "Radar terribly technical" → BUILD-RADAR DONE · ③ no-technical-content law (site+app) → law in SITE-REWRITE-BRIEF (ratify: R00) + CONTENT-SWEEP inventory A1–A19/B1–B8 with warm proposals AWAITING OWNER APPROVAL · ④ nav close: fold+link → NAV-CLOSE IN FLIGHT; GO-SITE verified already-live · ⑤ direction-C site design → complete mockup delivered, AWAITING approve-C · ⑥ data cleanup → owner-applied, DONE (1980 date · canonical band · org rename) · ⑦ **NEW (this entry): "תצוגת BANDS אינה עונה לצורך" — the raw BandPill capsule presentation is insufficient as the band's display form.** Routed into BUILD-PASSPORT's warmth mandate (human line leads, mono truth beneath, room-grammar hero when canonical) + a close-check on the suspected strikethrough/legibility rendering of band text in the current build + R-11 (the display-language ruling this connects to) stays open for the owner. Every verdict above traces to a running or done task; none is untracked.
- 2026-07-21 (owner site-design verdicts, m13-c3 — DOCUMENTED, all 10): ① hero: remove the green filter, cleaner photo ② remove "What happened, who checked it, when — nothing else." ③ remove "Tel Aviv · live electronic set" ④ "The rooms you filled, the nights that sold out" = wrong artist messaging — pull more HUMAN messages from Codex DS ⑤ "No algorithm scores artists here…" = spec content not marketing — replace ⑥ the booking-manager/producer paragraph — REMOVE entirely (appears 2×) ⑦ owner demands PROFESSIONAL QA on every design artifact → standing: every design deliverable passes MARKETING-SITE-CHECKLIST + visual self-QA + screenshots BEFORE reaching the owner ⑧ two consecutive dark containers at page bottom = container-contrast violation — fix ⑨ footer: no visible phone (icons instead) + no exposed email (contact form/obfuscation) + overall footer UX lift ⑩ font-family mixing audit — enforce the 3 canon families. Target: 10/10 per container, 10/10 marketing read for the whole page.
- 2026-07-21 · **T-85 · FREE-PILOT STEP-0 COMPLETENESS AUDIT** (owner frame: full app, free = pricing not scope): three tables delivered (entity×screen · navigation · spec-gap) + per-persona analytics matrix (delivered prior message, unchanged). Grounding: the Part-1 nav map (35/35 machine-asserted, 1 orphan found+fixed), the IX-entities §8.9–8.13 audits, the A1–A5+RADAR-FACE wave closes — all spec-read-fresh this session at HEAD. ~~FLAG: Launch-Plan doc missing~~ → RESOLVED: `docs/LOCK-Launch-Plan-To-Gate.md` landed on owner order (`66c3b2a`) + INDEX row. STATUS: audit delivered; owner verified Table 1 ("Artist 11/11 is real") and released the Table-3 gap lanes (below).
- 2026-07-21 · **T-86 · P-SIGNALS — buyer-funnel signals (Launch-Plan Module 3) · BUILT, verify-green, awaiting witness+040 approval.** Spec-first: new §14.1.6 EXTENSION (spec L2410–2493, `ratify:R00`) — `passport_view` gains `face` prop; 4 new events `proof_unit_expanded` · `method_label_peeked` · `persona_toggled` · `availability_request_started` (all subject=Buyer, ids/roles/enum props only, cockpit-only). Migration **040 authored NEVER RUN** (`supabase/migrations/040_buyer_funnel_events.sql` + full-inverse `.down.sql`, 034 pattern) — card to owner; until she applies it the 4 new events persist to localStorage only (DB insert soft-fails, the pre-034 precedent). 6 fire sites wired: `analytics.js:24-42,140-155` · `Passport.jsx:41-52,88` · `passportKit.jsx:67-115,376-451` · `AvailabilityRequest.jsx:24-32`. Canon-drift green at 33 events (app==040==events.json).
- 2026-07-21 · **T-87 · P-SIGNUP — site→app free-signup E2E (Launch-Plan Module 4) · BUILT, verify-green, awaiting witness.** 11-hop table walked live (Playwright vs the real embed build; real Supabase POSTs fired). 3 fixes: ① `/artists` CTAs missing utm attribution (`artists/page.tsx:242,901`) ② Signup had no per-field i18n validation states — native browser bubbles only, EN-only in HE mode; added `noValidate` + 6 per-field messages EN+HE mirroring Login's B1 pattern (`Signup.jsx:26-38,55,140-166`) ③ raw "Failed to fetch" leaked on failed submit — wired `classifyAuthError` + `errorNetwork`/`errorRateLimited` keys EN+HE (`Signup.jsx:10,94-104`). PAYMENTS gate verified OFF end-to-end (no dead pay links). OWNER LIVE-TEST OWED: Google OAuth · already-registered-confirmed branch · email-confirm return hop. CLEANUP OWED (owner, Supabase Auth): delete test rows `test-artist-e2e@example.com` + `e2e-embed-*@example.com`. FLAGGED FOLLOW-UP (out of lane territory): identical raw-error leak in `ui.jsx:124` SocialAuthButtons.
- 2026-07-21 · **T-88 · P-POLISH — confirmer correction box + Maya Vale rename (Launch-Plan Module 5) · BUILT, verify-green, awaiting witness.** ① §8.9 "Partly right" now opens an inline bounded correction field (200-char, warm copy EN+HE, one-focus ceremony, cancel-without-loss, receipt quotes the note) — `ProducerConfirm.jsx`; **honest gap: the correction reaches the server but nothing persists it** (`server/index.js:772` drops unknown keys; confirmations table has no column) — persisting needs a future authored-never-run migration + server write, flagged in code, owner call. ② All ~30 demo.js "Shai Perlman" refs → **Maya Vale** (identity strings only; story/genre untouched) + site hero "Lior Noy"→Maya Vale (`page.tsx:427`) + §8.4 gap-notes closed. Fit all-zeros both widths; full aux suite green.
- 2026-07-21 · **T-89 · MASTER FIX PLAN (owner order: every screen × every entity, current·target·checklist·machine-vs-taste·fix tasks; approve-from module by module) · COMPILING** — 3 read-only teams (Artist / Buyer / Rep+Production+Confirmer+Admin), spec-read-fresh per screen with §+line cites. Plan rows land IN THIS REGISTER when compiled; NO fixing before owner approval. Part 1 of the same order DONE: artifact `1c9b0030` recovered = `docs/prototypes/00_CURRENT/lock-full-prototype.html` (was already committed, verified identical); `flows-per-entity-v1.html` updated in place to current (`d877ca1`); all 3 LOCK artifacts sent as downloads. Next number: **T-90**.
