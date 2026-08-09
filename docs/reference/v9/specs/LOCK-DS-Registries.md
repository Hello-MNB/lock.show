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


## Finalized foundations (U-DS2/4/5)
**Radius scale — FINAL:** 3 (marks) · 6 (tiny) · 10 (controls) · 12 (inputs/rows) · 14 (cards) · 16 (feature cards) · 22 (frame) · 999 (pills). Any other value is FORBIDDEN for new work. (The 4-value proposal was rejected: 10/12/14 carry distinct semantic tiers used 163/223/136 times.)
**Status colors — canonical constants (semantic, not drift):** success #6FD99A · developing #46DCC2 · found/amber #F2C063 · warning #E28438 · danger-text #C94F3F · danger-solid #B23B2E (white text) · brand2 (scan/live pulse) var(--brand2,#77E7B2). Scrim: rgba(5,8,6,.55–.62) — the purple rgba(10,8,18) legacy scrim is retired.
**Motion registry (U-DS4):** durations 150ms (hover/press) · 300ms (sheet/expand: ease) · 400ms (popIn: ease) · 1s loop (scanPulse/dotPulse — Live + scan only). Easing: ease everywhere; no springs. Reduced motion: all loops stop, transitions drop to 0ms, state changes remain via color/mark. Artist surfaces = calm (no loops outside scan); Show-Day = lime dotPulse allowed.
**RTL readiness rule (U-DS5, registered now, built Phase 2):** mono data (dates, IDs, times, versions) stays LTR inside RTL; directional carets/Back mirror; timeline/stage-lane direction mirrors; media controls do NOT mirror; EN screens must not encode direction in raw left/right paddings where flex order suffices.