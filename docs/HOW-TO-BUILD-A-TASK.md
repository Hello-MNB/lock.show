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

## PART 4 — Automation status

**L1 is AUTOMATED** (`scripts/test-fit.mjs`, wired into `npm run verify`): the repo's build environment carries Playwright + Chromium, and the DEMO build renders every core screen from fixtures with no network — so truncation/overlap/h-scroll/tap/CTA assertions run headlessly on every verify, failing the build exactly like a score-defect. Live-data screens additionally get a manual L1 pass (the same assertions over the live-backed local run) before witness handoff, because demo fixtures cannot reproduce every live data shape (the history-line collision only appears when recent confirmations exist).

_Standing-loop wiring: the AUTONOMOUS OPERATING LOOP's TEST stage now reads "L0 verify → **L1 fit (automated + live-shape manual)** → L2 states → L3 nav → L4 two-view → L5 screenshot-proof → then Team-D adversarial → then owner witness." Recorded in TASK-REGISTER._
