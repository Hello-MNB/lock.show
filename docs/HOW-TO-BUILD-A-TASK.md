# HOW TO BUILD A TASK — the permanent decomposition + self-verify method
_Owner-ordered governance (R00, 18 Jul 2026). Why: T-59 (naked bands) · T-61 (truncated captions) · T-62 (unlabeled rail) · the history-line × scene-rail collision all reached the owner's phone because verify checked SEMANTICS (score? canon term?) but never SPACE (fit? overlap? cut-off?). The owner's eye is the FINAL gate, not the first line of defense. This file makes fit-defects the builder's job._

## PART 0 — THE FOUNDATION LAW (owner standing principle, 18 Jul)

**Progress must never outrun the foundation.** Taxonomy, terminology, entities, needs, messaging, and the DESIGN SYSTEM are the ground truth and stay complete and current in the core docs. When the build gets ahead of the spec, STOP and backfill the spec from what was built; the owner ratifies; only then is it foundation. A capability that exists in code but not in the spec is a **drift risk, not a feature**. "If the foundation is firm, we can always improve."

**The gap-detection rule (run BEFORE building any screen):** check that the screen's taxonomy, terminology, entities, messaging, and design-system tokens are fully specced in the core docs. If ANY is missing or would have to be invented to proceed, **STOP and flag it as a foundation gap for owner ratification — never fill a spec gap with an invention. A gap filled by guessing is where AI drifts.** (Exhibits: G-8 milestone ladder, G-9 history-line slot, G-10 mobile scene rail — all built before specced, all backfilled 18 Jul.)

## PART 1 — Task decomposition (every task, no exceptions)

1. **NAME THE TASK:** one T-number · one spec section cited · one done-sentence. If the done-sentence doesn't fit one line, it is TWO tasks — split.
2. **DECOMPOSE INTO MICRO-TASKS.** Each micro-task has:
   - ONE file territory (one screen/component — never two writers in one file)
   - ONE spec section
   - ONE done-sentence
   - ONE cheap-agent budget
   "Build the Radar" is FORBIDDEN (§20.E) — that is at least four micro-tasks: structure · inspector · animation · data-wiring. Any whole-screen instruction decomposes the same way.
3. **WRITE THE DoD BEFORE BUILDING** — all 8 points (CODE · MOBILE · DESKTOP · LEXICON · INTERACT · NAV · A11Y · FIREWALL), each with the SPECIFIC assertion for THIS micro-task, not the generic list. Example — a micro-task that adds a caption: FIREWALL = "caption is the method label, never the band value"; FIT = "caption fits its container at 360px and 1360px — no truncation, no overlap with neighbors."
4. **BUILD → SELF-VERIFY (Part 2) → only then mark status.**

## PART 2 — The self-verify ladder (run ALL levels before anything is witness-ready)

- **L0 · SEMANTIC** — the existing `npm run verify` (score/rank/%/headcount · canon terms · act isolation · security · i18n purity · guardrail inspectors). Must be green.
- **L1 · FIT — the mandatory layer this file adds.** For every screen touched, render at BOTH 360px and 1360px and PROGRAMMATICALLY assert:
  - no text node is truncated (`scrollWidth <= clientWidth` on every caption/label; clamp boxes must fully contain their text)
  - no two interactive/text elements overlap (bounding-box intersection across the same control layer/rail; containment excluded)
  - no horizontal scroll (`document.scrollWidth <= viewport`)
  - every tap target ≥ 44px on mobile (elements carrying the `.tap-target` hit-area expansion are compliant by construction and excluded from the raw-box count)
  - exactly ONE primary CTA visible
  Report the numbers: "truncated: 0 · overlaps: 0 · h-scroll: none · taps<44 (real): 0 · primary CTAs: 1". Any nonzero → the micro-task is NOT done. Fix before proceeding.
  **Automation:** `scripts/test-fit.mjs` runs these assertions headlessly on the DEMO build (fixtures, no network) as part of `npm run verify` (`test:fit`). If a machine lacks the Playwright browser it prints a loud SKIP — on such a machine the ladder is run by hand with the exact assertions above before any witness handoff.
- **L2 · STATE** — every editable field through its 7 states (§10.4): empty · typing · invalid · saved · undo · loading · error-retry. Probed with: empty · long value · Hebrew · URL · invalid.
- **L3 · NAV** — forward AND backward path, no dead ends (§10.6).
- **L4 · TWO-VIEW** — coaching/gap/why vocabulary ABSENT from every Passport file and the server payload (guardrails inspector #6 — mechanical).
- **L5 · SCREENSHOT PROOF** — capture the screen at both widths and describe the render in plain language AS IF WITNESSING IT AS THE OWNER: does it fit, read warm, look like the prototype? If I would flag it as owner, I flag it as builder — bad work never passes forward to the witness step.

## PART 3 — The honesty rule

MOBILE and DESKTOP go green **only after the OWNER witnesses** — unchanged. But L1–L5 run FIRST, with results reported, so the owner's walk CONFIRMS clean work instead of DISCOVERING defects.

> **The standard:** A screen reaches the owner's witness walk only after L0–L5 are green and I have described the rendered result myself. Fit-defects (truncation, overlap, cut-off, horizontal scroll) are MY job to catch, not the owner's. The owner confirms taste and warmth; I guarantee it fits and functions.

## PART 4 — THE CLOSE-OUT SELF-AUDIT (standing rule, owner 18 Jul — run at the END of EVERY task, autonomously)

Drift enters two ways: the build does something the spec doesn't say, or the build defines something the spec never receives. `verify` catches neither — it checks semantics, not spec-fidelity. So every task CLOSES with a **SPEC-FIDELITY REPORT** before anything is marked witness-ready:

1. **FORWARD CHECK — build matches spec.** For each screen/behavior built: quote the governing spec section and confirm the build matches it (taxonomy, terminology, entity view, messaging, DS tokens). Any mismatch = a defect; fix or flag before witness.
2. **BACKWARD CHECK — spec captures build.** Anything DEFINED to proceed (a term, a state name, a placement, a token, a copy string that became vocabulary) must be WRITTEN INTO the core docs — spec §, §4 glossary for terms, the design-system doc for tokens. Lives only in code → foundation gap: backfill in place, mark **ratify: R00**. A capability in code but not in the spec is drift, not a feature (Part 0).
3. **CONTRADICTION CHECK — the spec agrees with itself.** Scan the touched sections for internal contradictions the change created or exposed (exhibit: "Milestone journey M1–M8" vs "never M1–M8 on screen" — internal codes vs display names; clarified in one line so a future session doesn't "fix" it wrongly). Resolve in one line, in place.
4. **FOUNDATION-COMPLETENESS CHECK — the five pillars.** Taxonomy · terminology · entities · needs/messaging · design system: none may be THINNER after the task than before it. If the build advanced past a pillar, the pillar updates in the SAME task (or is stop-and-flagged where the update needs an owner/Codex ruling). The foundation never lags the build.
5. **REPORT — PROVE, DON'T CLAIM (owner standing rule, 18 Jul).** Every spec/foundation change in a close-out report ships with PROOF: (1) exact file + line number(s) + the commit SHA containing the change; (2) BEFORE and AFTER text quoted verbatim; (3) a one-line "verify yourself" pointer (the grep, or the GitHub permalink at that SHA). **A change reported without file+line+SHA+before/after is treated as NOT DONE.** "I updated §8.2" is a claim; "§8.2 line 651, commit 0400161, was X now Y, see {permalink}" is proof. Always state the file-of-record path + branch HEAD SHA — if the reader holds an exported copy that lags HEAD, say so explicitly (a lagging export reads exactly like an unlanded fix). If everything matched and nothing needed backfill: say so explicitly — "forward clean, backward clean, no contradictions."

Autonomy boundary: run this without being asked; fix forward mismatches and backfill backward gaps autonomously (marked ratify: R00); STOP and flag anything needing an owner ruling, a migration, a production merge, real non-seed data, or the payment flag.

## PART 5 — Automation status

**L1 is AUTOMATED** (`scripts/test-fit.mjs`, wired into `npm run verify`): the repo's build environment carries Playwright + Chromium, and the DEMO build renders every core screen from fixtures with no network — so truncation/overlap/h-scroll/tap/CTA assertions run headlessly on every verify, failing the build exactly like a score-defect. Live-data screens additionally get a manual L1 pass (the same assertions over the live-backed local run) before witness handoff, because demo fixtures cannot reproduce every live data shape (the history-line collision only appears when recent confirmations exist).

_Standing-loop wiring: the AUTONOMOUS OPERATING LOOP's TEST stage now reads "L0 verify → **L1 fit (automated + live-shape manual)** → L2 states → L3 nav → L4 two-view → L5 screenshot-proof → then Team-D adversarial → then owner witness." Recorded in TASK-REGISTER._

## PART 6 — TEAM DOCTRINE: maximum controlled parallelism at minimum tokens (owner, 18 Jul)

**Parallelism is capped by exactly two constraints, never by ambition:** (1) **COLLISION** — two teams never touch the same file; max teams = the non-overlapping file territories available right now; (2) **TOKEN WASTE** — an expensive model never does cheap work. Max speed at min cost = the most zero-file-overlap teams, each on the cheapest model that can do its tier.

**The team brief (complete, self-contained — a team never asks, re-reads the whole spec, or guesses; guessing = drift + waste). Contains, and nothing more:**
- TEAM ID + its ONE file territory (explicit file/dir list — its sandbox)
- the EXACT spec sections it needs (quoted or line-cited — never "read the spec")
- the screens/defects in scope, by ID
- its done-sentence (one line) + its DoD (the applicable 8 points, made specific)
- its model tier
- its self-verify obligation (L0–L5 + close-out audit, silent)
- STOP conditions (owner ruling · migration · merge · real data · payment flag)
A team never reads outside its territory or its cited sections.

**Model tiering:** BUILDER (clear-spec code) = cheapest capable model · VERIFIER (L1 fit / checklist runs) = cheap, mechanical · ARCHITECT (genuine judgment — spec gaps, schema choices) = expensive model ONLY where judgment is real, and those STOP for owner ruling anyway. Report the tier per team so waste is visible.

**Shared-component law:** if a wave's teams all depend on a shared component (`src/components/**`), the shared piece is built FIRST, solo, then the teams parallelize on top. Shared = collision risk by definition.

**Wave close = ONE witness batch.** MOBILE/DESKTOP green only after the owner looks.

## PART 7 — THE OWNER-TASK SHAPE (standing rule, owner 20 Jul)

A non-dev item is either **advanced by the agent** or **reduced to a one-line owner decision with a recommendation** — it is NEVER allowed to just sit as a blocker. Whenever something genuinely needs the owner, it is handed to her in EXACTLY this shape, always:

1. **WHAT** it is — one sentence, plain language, no jargon.
2. **EXACTLY what to do** — numbered steps, written as if she has never done it before ("1. Go to resend.com → API Keys. 2. …"), naming the exact site, project, and variable.
3. **HOW to verify** it worked — what to check, what success looks like.
4. **WHY it matters** — what breaks or stays blocked if skipped.

**An owner task without all four parts is not ready to hand her.** For decisions (not actions), the same discipline collapses to: the single concrete choice + the recommendation + the reason — "pick A or B; I recommend A because X" — never an open-ended "pending". Keys/secrets: steps run in the provider's UI (Vercel/Resend/etc.), and a secret value never appears in chat, in a commit, or in a client bundle.

## PART 8 — THE FIXED SHAPE OF EVERY TASK (standing rule, owner 20 Jul — five parts, always present)

_Why: a task without a success definition and a completeness checklist is where drift and gaps enter — "done" gets declared on partial work. Every task — owner→agent, or agent-decomposed — carries all five, explicitly:_

1. **SUCCESS FORMULA** — what makes THIS task genuinely succeed, not merely compile. One to three lines naming the real outcome. (Exemplar, site hero: "succeeds when the right visitor knows in 5 seconds which door is theirs and wants to click it — not when the section merely renders.") **The formula is the bar; "it builds" is not the bar.**
2. **COMPLETENESS CHECKLIST** — the parameters that make the task WHOLE, tailored to the task, drawn from the standing dimensions: navigation · interactivity · content/lexicon (EN+HE) · fit (360 & 1360) · interaction states · a11y · firewall · signals · design-system tokens · entry/auth if relevant. List only the ones that apply, each as a checkable line.
3. **PARAMETER AUDIT (BEFORE building)** — audit the task's parameters against the core docs at HEAD: taxonomy, terminology, entities, messaging, design-system tokens, and every checklist item — each marked **present / thin / missing**. MISSING or THIN → STOP and backfill the spec in place (mark `ratify: R00`) — never fill a spec gap with invention (Part 0). The audit output is part of the report.
4. **BUILD + SELF-VERIFY** — build to the formula and checklist; run L0–L5 with reported fit numbers + the Part-4 close-out foundation audit (forward/backward/contradiction/completeness). MOBILE/DESKTOP stay awaiting-owner-witness (Part 3).
5. **REPORT AGAINST THE PARAMETERS** — the close-out report walks EACH parameter: the success formula (met? evidence), each checklist line (pass/fail), the parameter audit (present/backfilled per item), and where every change was DOCUMENTED in the core docs (file+line+SHA — prove-don't-claim, Part 4.5). **A report that says "done" without walking the parameters is not accepted.**

**THE DOCUMENTATION RULE (critical):** everything a task defines or backfills is documented **in the core docs, IN PLACE, never as a new or duplicate document** (docs/INDEX.md is the owning-doc map: one domain → one owning doc). The only new files ever created are named standing checklists (e.g. SCREEN-BUILD-CHECKLIST) — and once they exist they are updated in place, never re-created. About to create a doc that resembles an existing one? **STOP — update the existing one.**

## PART 9 — WAVE CLOSE = DONE-REPORT + FORWARD-LAYOUT (standing rule, owner 20 Jul)

Every wave-close report has TWO halves; nothing new starts until R00 releases from Half 2.

**HALF 1 — WHAT WAS DONE (against the parameters, per Part 8):** each completed task walks its success formula (met? evidence) · checklist lines (pass/fail) · fit numbers · what was documented where (file+line+SHA, prove-don't-claim) · witness status (MOBILE/DESKTOP stay awaiting-owner-witness).

**HALF 2 — WHAT ENTERS WORK NEXT (the forward layout R00 approves from):** a table of next candidate tasks, ordered by correct build architecture (foundations + shared pieces first, dependents after, parallelizable sets grouped). Each row carries: task + T-number + parent entity/wave · build-order rank + why (what must precede it, what it unblocks) · architecture fit (file territory; parallel-to vs must-sequence-after) · **SPEC STATUS** · the task's own success formula + completeness checklist (Part-8 shape) · what R00 must do to release it (approve / ratify / rule / nothing).

**THE SPEC-COMPLETENESS GATE (per task, before it can enter work):**
- **SPEC-COMPLETE** at HEAD → ready to dispatch on R00's word.
- **NEEDS-SPEC** → the spec-first pass runs FIRST (audit parameters, backfill in place, mark `ratify: R00`, prove file+line+SHA), R00 is shown, THEN build. **Never build a task whose parameters aren't fully specified.**
- **OWNER-GATED** → name the exact ruling it waits on; do not build.

R00 reads Half 2 and says which tasks enter work. Only released tasks are built.

## PART 10 — THE COMPLETION METRIC + MAX-PARALLEL LAW (standing rule, owner 20 Jul)

**The two-number metric (never one):** every task and the product overall report **% BUILT** (code exists to the spec) and **% VERIFIED** (passed L0–L5 with fit numbers AND owner-witnessed). A task is 100% only when BOTH are 100 — and VERIFIED's last mile (MOBILE/DESKTOP) closes ONLY after R00 witnesses. "100% built · 60% verified — awaiting owner witness" is the honest shape. At every wave close report: a per-task line · an OVERALL product line (built screens/total · verified screens/total from the screen/entity registry) · a one-line "what the gap is" (which built-but-unverified tasks a witness pass would convert to done). **Never report VERIFIED for anything the owner hasn't witnessed.**

**Max-parallel law:** default to the MOST teams that share zero files, every wave — the cap is collision, not caution. Before each wave: map candidate tasks to file territories; every zero-overlap set dispatches at once; only shared-writer or hard-dependency tasks sequence; shared components build solo FIRST. Report per wave: how many teams ran parallel and why any task sequenced. "Can we go faster?" is answered either "yes — dispatching N teams" or "no — these share files X; here's why."

**The witness-backlog honesty note:** if the true bottleneck is the WITNESS/RULING queue rather than build capacity, say so plainly at wave close: "build is ahead; N tasks are 100% built awaiting your witness — that pass is the fastest way forward, not more teams." Never add parallel teams to mask a witness backlog — that stacks more unwitnessed work.
