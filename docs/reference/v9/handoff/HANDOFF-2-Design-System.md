# LOCK.SHOW — HANDOFF 2 · DESIGN SYSTEM (single source)
**Regenerated:** 9 Aug 2026.
**DoD:** every token, component, pattern, state, top-bar variant and layout archetype the prototype uses — a developer builds any screen's chrome and components without inventing a style. Radius scale 3/6/10/12/14/16/22/999 · text floor 9.5px · status-pill padding 2px 10px · H1 19px/800 · dialog title 15px/800 · lime = action/active only · two-tier eyebrow grammar (lime divider / grey-mono metadata).


---

## §1 DS REGISTRIES
# LOCK.SHOW — DS Registries (v1 · 9 Aug 2026)
Companion to the DS gallery (screen 39). Every new pattern registers here BEFORE propagation.

## 1 · Pattern Registry
| ID | Pattern | Anatomy | Used by |
|---|---|---|---|
| PAT-NEXT-MOVE | Conclusion + one move card | eyebrow YOUR NEXT MOVE · statement · Go › | Radar hero, Artist Workspace overview |
| PAT-BASIS | Data-basis line | mono "Based on N records · period" | Growth changes, Scene insights |
| PAT-WAITING-ON | Who has the ball | avatar · title · age · nudge | Inboxes, Advance, Case |
| PAT-ASSET-PREVIEW | Professional Asset row | title+version · owner · freshness chip · supersedes note | Advance Materials, Pitch Kit |
| PAT-DIFF | Publish diff row | kind chip (NEW/UPDATED/NO LONGER SHOWN/VISIBILITY) · title · consequence | Publish Review |
| PAT-STAGE-LANE | Running-order rail | time gutter · rail line · node dot (lime=open) · slot card | Event board (all stages) |
| PAT-LIVE-ISSUE | Live issue block | ISSUES eyebrow · statement · owner · one resolve action | Show Day |
| PAT-HANDOFF | Transmission block | headline · 6 fact rows · Send CTA · honest state (READY/SENT) | Opportunity case |
| PAT-VIS3 | Tri-state visibility | ● SHOWN / ◐ ON REQUEST / ○ HIDDEN pill | Composer (fee), future field-level |
| PAT-REQ-GROUP | Requirement vs record | disc (✓/~/○) · requirement · note · per-row action | Case Prepare, Opp prep |
| PAT-EXCEPTION | Bounded resolution | kind chip · title · basis · expandable action row + receipt | Admin exceptions |
| PAT-DEAD-LINK | Warm terminal state | title · body · one recovery CTA (6 variants) | Recipient dead link |
| PAT-KNOWN | Known vs interpreted | quiet mono method label + "Why am I seeing this?" inspection on derived rows; no repeated prose | Radar categories, Scene insights |
| PAT-CHIP-OVERFLOW | Responsive chip collection | wrap ≤ 3 lines at width, then "+N more" expander; semantic grouping precedes count | onboarding subtypes, genre pickers |

## 2 · Navigation Primitive Registry
| ID | Method | Meaning | Visual |
|---|---|---|---|
| NAV-LOCAL-TABS | `tabBtn(on)` | sibling areas of one object | solid-lime pill in trough |
| NAV-FILTER | `filterChip(on)` | narrow same collection | outlined chip, lime border active |
| NAV-VIEW-SWITCHER | `viewSwitch(on)` | same info, other lens | underline, no pill |
| NAV-ANCHOR | pvNavChips | in-page sections | non-sticky row (recipient) |
| NAV-BACK-CONTEXT | ‹ label | return to originating context | text button, names destination |
| NAV-BOTTOM | botNav | persona destinations (max 3) | icon+label |

## 3 · State Registry (semantics across components)
| State | Color logic | Feel per entity |
|---|---|---|
| Confirmed/Supported | mint #77E7B2 / #6FD99A | quiet ✓ |
| Waiting/Pending | amber #F2C063 | names WHO has the ball; never alarm |
| Stale/Needs attention | orange #E28438 | nudge (artist) / deadline (prod) |
| Conflict/Destructive | red #C94F3F | "needs your decision"; destructive confirm only |
| Live | lime --accent + dotPulse | Show Day only |
| Restricted/Private | neutral outline + PRIVATE pill | never red |
| Superseded | dimmed + "supersedes vN" note | history rows |

## 4 · Visualization Registry
| Viz | Question | Source | Mobile | Empty | A11y |
|---|---|---|---|---|---|
| Universe/spider | how does my record spread | claim coverage per category | full-width chart + tap targets | onboarding empty state | sigRows list = same data |
| Trend bars (Growth/Roster) | movement over 6 months | monthly counts (derived) | 6 bars, last=lime | zero state 📋 | headline sentence carries the number |
| Stage lanes | who plays where/when | slots per stage | time gutter rail | dashed open slots | list rows with times |
| Diff | what changes on publish | version compare | stacked rows | "no changes" | text rows (native) |
| Requirement groups | can I pitch this | brief vs record | stacked rows w/ discs | "nothing required" | text+symbols |

## 5 · Token discipline
- **Radius set normalized (4 documented):** `--r-control: 10px` (buttons/inputs) · 14px (cards) · 18px (hero/major containers) · 999px (pills). 8/12/13/16px occurrences = legacy, migrate opportunistically; no NEW values.
- Color: one meaning per color (see State Registry); lime ≤5% area; yellow never a CTA.
- Type: Manrope UI · Rubik display · DM Mono meta/IDs/times only.

## 6 · Entity Expression Profiles → see LOCK-Entity-Blueprints.md (binding).


---

## §2 TOP BAR SYSTEM
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


---

## §3 LAYOUT REGISTRY
# LOCK.SHOW — Layout Architecture Registry

Canonical screen archetypes. Every user-facing screen maps to one Layout ID; unmapped compositions are design debt. Derived from the full wireframe audit (9 Aug 2026) of the live prototype at 390px.

## Zone grammar (shared)
A CONTEXT (top bar / object header) · B MEANING (headline conclusion) · C ACTION (primary CTA) · D WORKING (main content) · E SUPPORTING (detail, collapsed by default) · F PROVENANCE (mono metadata, always last/smallest).

## Archetypes

| ID | Name | Anatomy (top→bottom) | CTA rule | Bottom nav | Used by |
|---|---|---|---|---|---|
| L1 | ROOT/HOME | B headline conclusion → C hero action card → D sections w/ eyebrow dividers → E expanders | Inside hero card | visible | Radar, Roster overview, Growth, Events home, Inboxes |
| L2 | WORKSPACE | A object header (+state chip) → local tabs (LocalTabs) → D per-tab | Contextual per tab, bottom of zone | visible | Category, Artist workspace, Event workspace, Account |
| L3 | EDITOR | Framing line ("you're composing X") → identity/hero editable → numbered sections 1–N with read-lines → sticky publish path | Full-width accent at flow end | visible | Composer, New event (accordion 1·2·3) |
| L4 | REVIEW | Diff groups (New/Updated/No longer shown/Visibility) → consequence note → C full-width accent → back link | Full-width accent | visible | Publish review, approve-on-behalf, consent sheets |
| L5 | QUEUE | State tabs (Needs reply·Waiting·Done) → filter chips → rows w/ consequence chips | Per-row | visible | All inboxes, requests, notifications |
| L6 | FOCUS/CASE | Object header → sticky meta strip (date·owner) → progress stepper (dots + STAGE n/N + name) → requirement matrix → conversation → decision | One dominant per state | visible | Opportunity case, Slot detail, Handoff |
| L7 | LIVE TAKEOVER | LIVE banner (pulse dot) → NOW clock card → NEXT → ISSUES (owner+fix+CTA) → arrivals/stages/contacts | Per-issue resolve | hidden | Show Day |
| L8 | EXTERNAL | Hero media full-bleed → relevance line → recipient-ordered sections → one sticky commercial CTA | Single sticky | none (recipient shell) | 6 Passport views, dead-link states |
| L9 | UTILITY/TERMINAL | Centered glyph → statement → 1–3 large tappable choices → receipt | Large tap cards | none | Confirmer, terminal states, errors |
| L10 | STEPPER | Step context ("Step 2 · you can edit later") → selection grid w/ glyphs → Back+Continue row (one line) | Continue right, Back left | hidden during onboarding | Artist/Rep/Prod onboarding |
| L11 | OPS DASHBOARD | Exception lane first → gate truth block (3-col) → signal tiles ("not measured yet" honest) → audit | Per-exception resolve | internal only | Admin (pending D5 compression) |

## Persona grammar
- ARTIST: L1 meaning-first, medium density, media-aware (reflective intelligence).
- REP: L1/L5/L6 attention-first, high scan density, avatar-led (commercial editorial).
- PRODUCTION: L1/L7 NOW/NEXT temporal, densest when show-critical (live operations).
- RECIPIENT: L8 only — no app chrome (curated stage).
- CONFIRMER: L9 only. ADMIN: L11.

## Canonical placements
- Eyebrow dividers: 10px/800/.14em accent + hairline — the ONLY section divider.
- Local tabs: directly under object header, never mid-page. Filter chips: under state tabs, horizontal scroll.
- Back: top-left "‹" in the object header, never a bottom button (except L10 Back+Continue row).
- Sticky elements budget: top bar + (one of: local tabs / meta strip / CTA) + bottom nav — never two mid-stickies.
- QA tooling: opacity .25 + title tooltip, mono 8-9px.

## Justified exceptions
- Radar spider chart (L1 with viz hero) — signature surface.
- Line-up stage lanes (L2 tab with timeline zone) — programme, not list.

## Drift log (fixed 9 Aug 2026)
- Opportunity case: 7 wrapped stage pills (read as filters) → L6 progress stepper (dots + STAGE 2/7 + name); stage word removed from meta strip (echo).
- Growth: stats-above-hero → L1 order (hero conclusion first).
- Composer: unnumbered accordion rows → L3 numbered page sections.


## Late additions (09 Aug 2026 — final pre-review laws)

### Button shape law — two families, never mixed
- **Standard action (44–48px):** radius 10 (var(--r-control)), full/flex width — the screen's decisions.
- **Action pill (32–38px, radius 999):** compact inline actions inside cards/rows — Retry, Resend, Edit, +24h.
- A tall pill button or a compact rectangle is a violation. Segmented-control inner tabs stay radius 10 inside their container.

### Radius scale (final, 100% conformant in prototype)
3 · 6 · 10 · 12 · 14 · 16 · 22 · 999. 10 = interactive controls · 12 = list rows · 14 = content cards · 999 = chips, avatars & pills. Any new radius must map to one of these.

### Brand color vs state color
- Lime (--accent) = single CTA per view, interactive selection, brand micro-details. **Never a status.**
- Status colors (mint ok / amber wait / orange attention / red destructive) appear only when their state is present.

### Consumer-language law (enforced 09 Aug)
No internal vocabulary in end-user copy: claim→detail/proof · counterparty→"the other side"/"someone you worked with" · canonical→main · mandate→representation/agreement · governed record→"what's already confirmed". Internal keys stay in code; labels render human. Admin + DS Gallery are team-facing and exempt.
