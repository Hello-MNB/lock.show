# LOCK — HOW WE BUILD FROM HERE (the method)
**v1.0 · 9 Jul 2026 · Owner: Maria (R00). Goal: get it done, verified, no bugs, minimum spend.**

## The prototype's job is DONE — here's why we stop using it as a workbench
The prototype (gigproof-desktop.html) was the **cheap-approval stage**: it let you SEE and approve the vision before a shekel of build. It did that job. Now:
- The real app is LIVE and is now the single source of truth.
- The prototype is BEHIND the app (still says GIGPROOF, lacks tonight's fixes).
- Designing in the prototype THEN re-implementing = **double work + double tokens + drift** (two versions disagreeing).

**Decision (SUPERSEDED 21 Jul 2026 — `ratify:R00`): prototype versions are DESIGN-INTENT SNAPSHOTS.** We still do not build in them — but they are neither "museum pieces" nor automatic behavioral truth. The rule (control-plane repair, from the external design↔code audit): only a snapshot registered as the current bundle in `docs/prototypes/REGISTRY.md` with status `ACCEPTED_FOR_IMPLEMENTATION` may guide build work, and product canon, permissions, entity rules and data contracts ALWAYS override visual prototype behavior. A snapshot in `DESIGN_REVIEW` informs TARGETs only. Spec stays the written law.

## How we actually work now — two clean lanes
1. **DESIGN (yours):** for a NEW screen or a look-change, you either (a) sketch it in your design tool / Figma, or (b) just tell me in words / a screenshot with arrows. Either is enough.
2. **BUILD (mine):** I implement directly in the real app. No middle prototype step.

The real app is the one place the design lives, so it can never drift from itself.

## THE PROVEN LOOP — every screen goes through this (it's what kills bugs)
This is the exact loop that caught the producer black-screen tonight. Repeat per screen/feature:
1. **SPEC** — one short definition of done, drawn from canon docs + your decision. (cheap)
2. **BUILD** — one focused agent, cheap tier, tight scope. (cheap)
3. **VERIFY** — the non-negotiable step: 5 build gates (automated) **+ a real-browser check of that exact flow** (this is what catches runtime bugs code-reading misses). (cheap, mandatory)
4. **SUPERVISE** — I cross-check the agent's claim against real output; I fix, not re-spawn. (cheap)
5. **DEPLOY** — only after PASS. Now protected by the app-wide error boundary (added tonight) so no single bug can black-screen the app.
6. **YOU REVIEW LIVE** — on app.lock.show. Your eyes are the final gate.

**Definition of Done for any screen** = renders for an EMPTY new user · no console errors · all buttons do something real · on-token design · EN+HE strings · verified in a real browser · deployed · you approved it live.

## TOKEN DISCIPLINE (your budget is a first-class constraint)
- One agent per unit of work, cheapest tier that can do it; I (opus) supervise + fix.
- NEVER re-audit what's already verified (we track it in docs).
- Verify by browser, not by re-reading files.
- Shared code (signup, routing) = one agent, not one-per-entity (re-reading shared files N times costs MORE).
- Batch related screens into one build pass.

## REMAINING SCREENS — priority order (the actual worklist)
Grouped so each batch is one clean loop. Nothing here needs the prototype.

**Batch 1 — Instrumentation (unblocks your revenue signals) — MINE, no input needed**
- M1 event writers (emit the 28 funnel events 028 created) → your Willingness-To-Pay dashboard (S1→S4 ladder).
- Plan-flags enforcement wiring (waits on your price to show numbers).

**Batch 2 — Depth on built screens — MINE**
- Production workspace: the one missing piece (confirming-org can't list its requests → tiny migration 029 + wire).
- 2-proof publish gate on the passport.
- Multi-Act per-Act field writes (edits save to the active Act).

**Batch 3 — Growth engine — MINE (counsel-gated for go-live)**
- Discovery scanner Phase A (Tavily ✅, 028 fields ✅).
- Attributed share loop.

**Batch 4 — Hebrew launch — MINE + one review session with you**
- 152 app strings + 8 site pages + home i18n wiring + native review (with the canon lexicon now in the glossary).

**Your inputs that unlock batches:** price (Batch 1 numbers) · Act HE word (Batch 4) · counsel (Batch 3 go-live) · design decisions per new screen as we reach them.

## WHAT I NEED FROM YOU TO KEEP IT "NO BUGS"
Nothing technical. Just: when a screen is deployed, glance at it live and tell me "good" or "wrong: X". That one habit + the verify loop = clean.
