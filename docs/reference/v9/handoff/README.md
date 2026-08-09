# LOCK.SHOW — HANDOFF README

**The development package is exactly 4 artifacts. Nothing else is required.**

| # | Artifact | Contains | DoD |
|---|---|---|---|
| 0 | `LOCK Prototype.dc.html` | The living visual+interaction spec — 47 screens, all states, all flows, clickable | Every screen renders and navigates; the prototype IS the design truth |
| 1 | `handoff/HANDOFF-1-Product-Spec.md` | Screens · flows · entity operating models · Radar→Passport bridge | Dev designs & wires every screen/flow without guessing |
| 2 | `handoff/HANDOFF-2-Design-System.md` | Tokens · components · patterns · top-bar variants · layout archetypes | Dev builds any component without inventing a style |
| 3 | `handoff/HANDOFF-3-Decisions-Contracts-QA.md` | Binding rules (A–H, D1) · OPEN decisions (D2–D6) · 7 engineering contracts · freeze + QA status · HE matrix | Anything not listed OPEN is decided; the only holes are D2–D6, explicitly tagged |

**Reading order:** README → Handoff 1 → Handoff 2 → Handoff 3 → prototype side-by-side.

Working/audit documents that fed these files live in `archive/` — historical only, NOT part of the handoff. The root `LOCK-*.md` files remain the editable working sources; the `handoff/` copies are regenerated from them before each delivery.
