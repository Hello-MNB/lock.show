# LOCK.SHOW — Top Bar System (canonical · 9 Aug 2026)
One governed shell system, 5 canonical variants. All VERIFIED IN PROTOTYPE unless marked.

## Executive ruling
Audit found ONE template-driven system, not header chaos: the app bar is a single implementation with conditional slots (workspace crumb · bell · avatar), plus four intentionally different shells. Variants before/after: **5 → 5** (no accidental drift found at variant level). Two real fixes shipped: Radar name-echo (below) and the Show Day check (already compliant — live takeover covers the bar at z30 with its own exit control).

## Canonical variants
| ID | Where | Anatomy | Excludes | Sticky |
|---|---|---|---|---|
| **BAR-AUTH** | all authenticated app screens | LOCK symbol+wordmark · `/ workspace-or-act` crumb · bell(+unread) · avatar(initials→hub) | screen titles, destination names, CTAs, state text | yes, 96px incl. status area |
| **BAR-ONBOARD** | intent/onboard/rep-onboard/prod-onboard/scan | LOCK · avatar only (no bell — nothing to notify yet) | workspace crumb, bell | yes |
| **BAR-RECIPIENT** | external Passport (all 6 policies — ONE bar, content policy differs) | LOCK · Sign in (guest) / bell+avatar (signed-in, **no unread badge** — external context stays calm) | app navigation, workspace | yes |
| **BAR-CONFIRMER** | source confirmer + terminal states | LOCK · nothing else | all utilities | yes |
| **BAR-LIVE** | Show Day | full takeover (z30) replaces BAR-AUTH: ‹ exit · pulse dot · EVENT IS LIVE · QA:NET | bell, avatar, crumb | own layer |
- Guest entry (login/signup): NO bar — in-content logo lockup owns identity. Deliberate.
- Sheets (new event, booking request): bar hidden — bounded tasks own the viewport.

## Responsibility law (non-duplication)
Top bar = GLOBAL orientation + utilities only. Bottom nav = destination. Content = meaning/identity.
- Bar never shows the active destination name (no `EVENTS` echo) ✅ verified.
- **Fix shipped:** Radar no longer shows the act crumb — its content header IS the act switcher (avatar·name·genre·▾·PRIVATE); showing SHIDAPU twice in the first viewport violated no-echo. Passport/Share/Inbox keep the crumb (their content doesn't carry act identity).
- Deep screens (Category WS, Composer, Slot, Advance, Case): BAR-AUTH stays + a content-level back/object header (‹ + object) — the two layers carry different levels (workspace vs object), verified non-duplicative.

## Context crumb map
| Screens | Crumb |
|---|---|
| roster / rep-artist / opps / rep-inbox / rep team | Zion 604 Agency |
| desk / lineup / slot / advance / prod-inbox / prod team | Zamna Productions |
| passport / share / requests | current act (SHIDAPU · N.Söf…) |
| radar | — (content owns identity) |
| admin | Operations |

## States
Unread badge: lime pill on bell (BAR-AUTH only). Workspace switch: crumb + initials update live (ML/DK/RS per context) ✅. Weak network (live): banner inside Show Day, not in bar ✅. Wrong-workspace deep link: ⚙ ENGINEERING REVIEW (router).

## Mobile & a11y
Height 96px total (52px status + 44px controls); bell/avatar 36px targets; crumb truncates with ellipsis (long-name safe); aria-labels on bell/avatar/back/exit ✅. RTL sweep 📋 P2.

## INDEX mapping
Every screen's top_bar_variant is derivable: appScreens→BAR-AUTH · onboarding set→BAR-ONBOARD · buyer→BAR-RECIPIENT · confirm→BAR-CONFIRMER · advance+advDay→BAR-LIVE · login/signup→none. Registered here as SSOT; no per-screen exceptions exist.

## Engineering questions
1. Deep-link into wrong workspace → recovery bar state (⚙). 2. Notification scope per workspace (act_id vs org_id) — counts must be scoped (⚙). 3. Live-mode routing persistence (⚙).
