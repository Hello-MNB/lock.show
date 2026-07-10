# LOCK — Radar & Navigation VISUAL spec for Codex

_Purpose (owner directive, 10 Jul): Codex has read ABOUT the Radar but never SEEN it — so it cannot
recommend design. This doc + the screenshots in `docs/design-system/current-screens/` are the ground
truth of what the live app looks like today: the Radar, current desktop navigation, current mobile
navigation, and entity switching — plus the known visual gaps, so Codex can critique and improve from
reality. Screenshots are from the demo build (persona: DJ PERLMAN), captured 10 Jul 2026._

## 0. The screenshots (open these first)
| File | What it shows |
|---|---|
| `radar-desktop.png` | **THE RADAR** — artist home, desktop 1440px, full page |
| `radar-mobile.png` | The Radar at 390px — full page |
| `nav-mobile-bottombar.png` | Mobile shell: top bar + bottom tab nav (Radar·Passport·Requests·Account) |
| `nav-desktop-settings.png` | Desktop shell on a paper-task screen (Settings) — sidebar + top bar |
| `entity-switcher-open-desktop.png` | The workspace/entity switcher (top-right) opened |
| `agency-roster-desktop.png` / `agency-roster-mobile.png` | Agency home — the roster universe (Radar's sibling) |
| `agency-radarfeed-desktop.png` | Agency's next-action feed (`/agency/radar`) — currently a separate tab |
| `passport-public-desktop.png` / `passport-public-mobile.png` | The public buyer Passport (two-persona) |
| `booker-home-desktop.png` / `production-home-desktop.png` | The other entity homes, for transition context |

## 1. What the Radar IS (so the design brief is unambiguous)
The Radar is the **artist's private home** — an **orbit universe**, not a chart:
- **Center star** = the artist/Act (stage name + genre chip; tapping it opens the Act switcher —
  multi-Act is canon: one person, several Acts, evidence per-Act).
- **6 planets** orbit it = the evidence worlds: Identity & Story · Music & Catalogue · Live Show ·
  Audience & Community · Professional Kit · Career Proof.
- **Sub-nodes** (small satellites) = individual evidence items (e.g. "8 live sets on…", instagram.com,
  "sells tickets…"). A ✦ gold dot = something FOUND awaiting the artist's confirmation.
- **Lenses** (top chips): ALL · NEEDS YOU · READY (+ a worlds filter) — bounded review states, never a %.
- **ONE next-action card** pinned below ("Recommended next action → Confirm your new claims · Continue").
  This is the growth loop: every small contribution = a visible "career kick."
- Below the universe: Readiness (private) + Issue official Passport cards; a standing footer:
  *"This view is private. Booking managers see only the Passport — verified strengths you approved,
  never gaps."*
- **FIREWALL, absolute:** planet states are bounded (established / developing / needs-you / found /
  not-assessable) with icons + verbs. NEVER a score, gauge, rank, %, or progress-to-100.

**The approved direction** (owner-loved) is `docs/prototypes/00_CURRENT/radar-v4.html` — same universe,
plus: **method ladder** (Missing → Self-declared → Source-linked → Evidence-supported →
Producer-confirmed) where "Strengthen" climbs a label and the planet brightens; real platform logos;
media scenes inside planets; stage-lighting atmosphere; momentum/"career-kick" feedback on every action.
**Design task: take the live implementation to the v4 prototype's emotional level, within the DS.**

## 2. Current DESKTOP navigation (see `radar-desktop.png`, `nav-desktop-settings.png`)
- **Fixed start-side sidebar, 248px** (logical CSS — flips for RTL): wordmark top, then per-entity tabs
  (artist: Radar · Passport · Requests · Account), active tab = ink text + 2px lime start-edge bar.
- **Top bar (56px, sticky):** right side only — language toggle (EN/עב) · notification bell (lime dot) ·
  **workspace switcher** ("ARTIST WORKSPACE · Shai Perlman ▾") · Settings link. Wordmark appears ONCE
  (sidebar), never in the top bar.
- The whole shell is **dark** today (this is the divergence — DS says paper for work surfaces; the
  Radar/media moments may stay dark per the Surface Language Contract).

## 3. Current MOBILE navigation (see `nav-mobile-bottombar.png`, `radar-mobile.png`)
- **Bottom tab bar, fixed, 64px + safe-area:** same per-entity tabs, icon + 10px label, active = lime
  top-edge tick. **No sidebar; no hamburger.**
- Top bar: language · bell · compact workspace chip ("D ▾") · Settings.
- The universe scales to a single column; planets keep touch-size (44px+); lens chips scroll horizontally.

## 4. Entity switching (see `entity-switcher-open-desktop.png`)
- One person = several workspaces (Artist / Manager…). The **switcher lives top-right on every
  breakpoint** (canon: switching is a context change, never a re-registration, never bottom-left).
- Switching swaps the ENTIRE screen-set: nav tabs recompute, and the person lands on the new workspace's
  home (`homePathFor` contract, 34 journeys tested). Agency workspace gets: Roster · Radar · Requests ·
  Account; its home is the **roster universe** (artists as orbiting worlds with bounded state rings —
  same visual language as the artist Radar, no ranking).

## 5. Known visual gaps — where Codex should aim (from our audits)
1. **Dark-everything vs the Surface Language Contract** — task surfaces (Settings, Requests, forms)
   should re-ground to paper; the Radar/universe is a legitimate dark "media/proof" moment. Codex owns
   the per-surface token VALUES that make this executable (sync doc ask #1–2).
2. **The Radar is emotionally flatter than radar-v4** — missing: method-ladder feedback, real platform
   logos everywhere, media scenes in planets, the "career kick" moment on confirm. This is the main
   design lift.
3. **Planet-tap UX** — drill-in opens panels; the earlier "planet inside planet inside container"
   nesting was flagged by the owner as uncomfortable; v4's flat sheet pattern is the direction.
4. **Agency split-intelligence** — the agency's one-next-action feed lives on a separate tab
   (`agency-radarfeed-desktop.png`) instead of on the roster home; the DS Application Contract should
   put one priority action ON the home (per its own Roster Home spec).
5. **Empty states are text-only** — DS requires the media treatment + one suggested input (per-entity
   `lockshow-*` atmosphere assets now exist — use them).
6. **Next-action card collides with content** on smaller viewports (see mobile shot) — needs a governed
   placement/priority rule in the DS.
7. **Icon/label scale on sub-nodes** — tiny mono labels (8–9px) under sub-nodes truncate
   ("INSTAGRAM.CO…") — needs the DS icon/label contract applied.

## 6. What we need back from Codex (Radar-specific)
A **Radar design recommendation** consistent with DS v1.4.2+ and the firewall: per-surface treatment
(dark universe on paper page? full dark screen?), the planet/sub-node/state visual spec using the
5-state tokens (in canon vocabulary), the next-action card placement rule, the drill-in pattern
(sheet vs panel), and the empty-state composition using the `lockshow-*` atmosphere assets — for BOTH
desktop and mobile, EN and HE/RTL.
