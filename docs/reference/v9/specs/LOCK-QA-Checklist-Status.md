# LOCK.SHOW — Master Prototype Design Audit Checklist (adopted 9 Aug 2026)
The user-supplied 46-gate checklist is adopted verbatim as the binding QA frame for every screen and for the final Claude Code handoff. This file records the CURRENT status against the final prototype gate (§46) — updated每 audit cycle.

Status: 🟢 PASS · 🟡 REFINE · 🔴 BLOCK · ⚙ ENGINEERING REVIEW · ❓ UNKNOWN

## §46 Final Prototype Gate — current standing
**Amendment F sweep (9 Aug):** Phase-7 persona-relevance + technical-leakage probe on secondary screens (Account, Admin, Roster overview) — phone-frame content clean of technical terms (preset/candidate/boolean/act_id/payload: 0 hits in-product; earlier hits were sidebar QA labels, which are tooling not product). Orientation test passes on probed screens (label + object + action present).
| Gate | Status | Evidence / gap |
|---|---|---|
| Business logic | 🟡 | canonical objects + owners mapped (Flow Register); D1–D6 owner decisions open 🟨 |
| Persona/job fit | 🟢 | Daily-Job Map per entity (Flow Register §A/B) |
| IA / object ownership | 🟢 | pointer→owner rule enforced; no dual-editable truth found in last audit |
| Flow architecture | 🟢 | 18 flows registered, no orphans/dead-ends |
| Navigation | 🟢 | Top-Bar System doc (5 canonical variants); no-echo fixed (Radar crumb); bottom nav ≤3 per entity |
| Screen hierarchy | 🟢 | persona grammars applied; anchors re-composed (Amendment E) |
| Psychological UX | 🟡 | anchors pass; secondary screens unswept |
| Microcopy | 🟡 | professional-language layer applied to anchors; full synonym-drift sweep pending |
| Information design | 🟡 | situation-first applied to anchors; card-audit on secondary screens pending |
| Visual show-business fit | 🟡 | logo-removed test passes: Radar, Category, Show Day, Library, Handoff, Pitch Kit, Opportunity (consequence chips ✓); Recipient passes with provenance drawer; secondary screens pending |
| Mobile human factors | 🟢 | 390 contracts for Artist anchors; Rep/Prod contracts 📋 |
| States / trust / permissions | 🟡 | state registry + QA switchers built; on-request lifecycle ⚙; rep authority 🟨 D1 |
| DS | 🟢 | DS Registries doc (14 patterns, 6 nav primitives, state semantics); gallery refresh 📋 |
| Accessibility | 🟡 | aria labels + non-color states on anchors; full sweep + RTL 📋 P2 |
| Index / traceability | 🟢 | hierarchical index, 15 sub-rows added, job/flow traceability in Flow Register |
| Engineering contracts | ⚙ | explicit: version store · link service · request object · Back/deep-link · show-day activation · handoff receipt · notification scoping |

## Three final questions — current answers
1. Anchors: strongest-representation ✅ (post Amendment E pass). Secondary screens: easiest-representation 🟡.
2. 30–50% word reduction: achieved on Library/Handoff/Show Day/Category; pending on Composer sections, Admin, settings screens.
3. Freeze-as-architecture: **not yet** — blocked on D1–D6 decisions + ⚙ contracts, by design not by gap.

## Standing rule
Every future build cycle ends by re-scoring this table. No screen is declared DONE without §45's 17 questions.
