# INTERACTIVE SCREENS — BUILD PLAN (owner order 14 Jul: build interactive screens, focused)
CONTRACT (every screen, Codex model): ① what LOCK found/knows ② why it matters to THIS user
③ the safest next action ④ what becomes public/private/shared ⑤ done in ≤3 clicks.
NOT menu→list→form→save. YES private-intelligence → guided-action → controlled-public-context.
Sequenced as build waves. Each screen = component + interaction + states (loading/empty/error/dirty).

## WAVE 1 — P0 interactive core (pre-Q8, rides the app train)
| # | Screen (route) | Entity | Interactive behavior to build | Effort |
|---|---|---|---|---|
| 1 | **Act Identity Editor** (`/artist/act/edit`, opened from Identity planet) | Artist | THE broken screen. Inline-editable act identity: stage name · city · genre · format · positioning · photo · links · bookable formats. Field-level save + dirty/error/saved states. Live "what becomes public" chip per field. Prefilled from current values. Per active Act. ≤3 clicks from radar. | L |
| 2 | **Radar one-action landing** (`/artist/home`) | Artist | On arrival: ONE guided next action card (not a dashboard) — derived from real state (add evidence / confirm source / publish / share). "Why this matters" line. Secondary actions collapsed. | M |
| 3 | **Buyer post-Passport actions** (`/passport/:id`, no login) | Buyer | Kill the dead-end: after viewing, interactive "Check availability" (server-authored request) + "Share" + "Save link" — all no-login. Confirmation state inline. | M |
| 4 | **Roster guided action** (`/agency`) | Representation | Each artist row = one artist-bound next action (build on G4) rendered as a guided card: what changed · why · action. Reply-to-request deep link. | M |
| 5 | **Production event-first entry** (`/production`) | Production | Default view = Events/slots (not Team). "Create event / open slot" interactive. + fix signup path so Production is reachable at onboarding. | M |
| 6 | **Source Confirm single action** (`/confirm/:token`) | Confirmer | Keep the one accountless interactive confirm/partly/reject/not-me flow; RETIRE `/producer` + `/producer/received` workspace shell. | S |

## WAVE 2 — P1 interactive polish (after Wave 1 verified)
- Settings Hub (`/settings/*`): consolidate account + workspace/org into one tabbed guided surface.
- Representation role modules: Manager vs Booking-Agent views inside ONE workspace (role-adapted cards, not separate screen-sets).
- Evidence Capture as guided drawer from Radar (not a separate destination).
- Claim Review as guided drawer/full-screen task from Radar; keep deep link.
- Buyer subtype microcopy (promoter / private / corporate) on the request flow.

## WAVE 3 — P2 (post-Gate)
- Full Act management (rename/archive/versions). Territory/period authority editor. Buyer team workspace. Production slot depth.

## BUILD METHOD (per screen)
1. Codex specs the interaction (its Interactive-Screen-Model audit) → 2. Claude builds component +
states + i18n EN/HE + tokens → 3. screenshot proof (mobile-first 360/390) → 4. verify green →
5. Codex design DOD → 6. rides the app train (RC2) → Q8.
GATES: Wave 1 depends on owner approving the canonical entity ruling (workspace-creation +
/producer retirement touch entity behavior). Screens 1,2,3 are ruling-INDEPENDENT — buildable now.
