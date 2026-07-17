# 17 · Interactivity, Motion Depth & the Missing Utility Screens

_Codex role — senior interaction designer. Becomes §17 of the LOCK master spec._
_Grounded in the behavioral ground-truth prototype (`scratchpad/lock-full-prototype.html`), the Radar signal spec (`ENTITY-STRUCTURE-AND-SMART-SCREENS-AUDIT.md` PART 5), the widget kit + per-screen law (PART 9 · PART 10), and `LOCK-PRODUCT-SPECIFICATION.md` §8. §8 defines *what each screen is and holds*; **this section defines how it moves, responds, and feels** — the interaction layer §8 defers to "see the prototype." It does not repeat §8; it deepens it._

**How to read this file.** Every motion value, easing, duration, and gesture threshold in PART A is **lifted from the real prototype** (path:line where load-bearing) — a developer can build the feel without opening the HTML. PART B specs the utility screens the prototype never drew. Markers: **`OWED`** = an exact DS v1.6.25 value that lives only on Drive (`00_CURRENT/LOCKSHOW_Design_System_CURRENT.html`) and must be filled by Codex; **`OPEN`** = a product/owner decision not yet made. Neither blocks building the interaction — they refine the finish.

---

## 17.0 · The motion system (build these tokens once, reference everywhere)

The prototype uses a **small, disciplined easing vocabulary**. Do not introduce new curves per component — bind these five tokens and reuse them. This is the single control point for the app's "feel."

### 17.0.1 · Easing tokens

| Token | Curve | Personality | Used by |
|---|---|---|---|
| `--ease-orbit` | `cubic-bezier(.2,.8,.25,1)` | The signature LOCK ease — fast out, long settle. Confident, "instrument-grade." | Orbit logos, inspector slide-in, source-card rise, mobile sheet transform (proto :63) |
| `--ease-ui` | `cubic-bezier(.2,.7,.3,1)` | The standard UI ease — quick, neutral, unfussy. | Screen change, planet focus/recede (uni transform), sheet slide-up, rail (proto :209,300,982) |
| `--ease-bloom` | `cubic-bezier(.2,.9,.3,1)` | The reward ease — snappy entry, soft landing. | Confirm bloom, celebrate card, hero card, `cardpop` (proto :920,931,1017) |
| `--ease-fill` | `cubic-bezier(.3,.8,.3,1)` | Slow, deliberate growth. | Milestone journey fill bar (proto :878) |
| `--ease-overshoot` | `cubic-bezier(.2,1.4,.4,1)` | Playful overshoot past 1.0 — used **once**, for the seal mint. | `sealpop` on the "Verified" seal (proto :933). Do not reuse elsewhere. |

> `OWED` — Codex to confirm these five against DS v1.6.25 named motion tokens (the prototype names only `--ease-orbit`; the other four are inferred from repeated inline curves and should be promoted to named tokens).

### 17.0.2 · Duration ladder (the only durations allowed)

| Band | Duration | Meaning | Examples (proto) |
|---|---|---|---|
| **Micro** | 140–200ms | Hover, press, chip toggle, tooltip, node hover | `.navitem .14s` · `.rf .16s` · `.pnode transform .2s` · tooltip `.18s` |
| **Transition** | 260–300ms | Enter/exit of a panel, planet focus/recede, sheet, scene fade | inspector `inspIn .26s` · `.uni transform .3s` · scrim `.22s` · sheet `.28s` |
| **Emerge** | 300–460ms | Staggered arrival — orbit logos, satellites, cards | `satEmerge .3s` · `orbit-emerge .46s` · `card-rise .26s` |
| **Reward** | 500–700ms | Confirm bloom, lock-in, celebrate, seal | `cardpop .5s` · `logo-lock .6s` · `sealpop .7s` · `bloom .42s` |
| **Fill / slow** | 1000ms | Milestone fill, count-up settle | `jfill width 1s` |
| **Ambient** | 1.8–9s loop | Living background — never triggered, always breathing | `sweep 9s` · `starglow 4.5s` · `sonar 5s` · `pfloat 6s` · `fdpulse 2s` |

**Rule:** an *interaction* (something the user triggered) uses Micro→Reward. An *ambient* loop is décor and is the **first thing killed** under reduced-motion. Never animate an interaction slower than 700ms — it stops feeling like a response.

### 17.0.3 · `prefers-reduced-motion` — the global contract

The prototype's reduced-motion block (proto :409–411) kills every **ambient loop** and every **transform-based idle**, but **keeps opacity fades** so the UI still reads as responsive. Build the same three-tier rule everywhere:

| Tier | Full motion | Reduced motion |
|---|---|---|
| **Ambient loops** (sweep, sonar, starfield, starglow, pfloat, fdpulse, twinkle, logo-invite, jglow/jpulse, shimmer, scanbar) | play, infinite | **`animation:none`** — frozen at rest state |
| **Interaction transforms** (planet focus scale, orbit emerge, sheet slide, bloom, lock-in) | full transform + duration | **collapse to an instant opacity swap** — the element still appears/updates, but does not travel or scale |
| **State feedback** (fade-in of overlays, color change on confirm, toast) | fade `.18–.3s` | **keep** — a 180ms opacity fade is safe and preserves "something happened" |

Every `@keyframes` that moves geometry needs a reduced-motion sibling that only changes opacity. Every JS-triggered effect (`bloomAt`, confetti) must early-return on `reducedMotion()` (proto :1487,1497,2590) and instead flip straight to the success state.

### 17.0.4 · The gold budget (motion-relevant)

Lime `#C8F04D` is reserved for **action + confirmed** and is the *only* color allowed to bloom, glow, or pulse on success. Gold `#F2C063` (`state.found`) may pulse **only** as the quiet "found, waiting" invitation (`fdpulse`, `logo-invite`, `foundpulse`) — a slow 2–2.8s breath, never a hard flash. Amber `#E39A4B` (`state.needsReview`) never animates — a static invitation, never shame. `OPEN` — owner leans toward retiring gold/amber for lime+neutral (§7.0/§8.2 of the audit); if retired, the found-state breath becomes a neutral `--mist` pulse (already the `fdpulse` shadow color, proto :321), no motion change required.

---

# PART A — INTERACTIVITY & MOTION DEPTH (per screen)

Each screen below is specified as **buildable interaction rules**: every interactive element as `trigger → immediate feedback (<100ms) → result state`; a **motion table**; a **gesture table** (mobile); and a **state-transition map**. The universal law from PART 9/10 holds on every screen: **one screen, one job, one next action; exactly one primary lime CTA on screen at any instant; immediate feedback on every action; warm, firewall-safe microcopy.**

The universal interaction primitives (reused on all screens):

- **Press feedback (all buttons/tappables):** on `:active`, scale to `.97` + shadow tighten over ~120ms `--ease-ui`; release springs back. Tap target ≥ 44px (PART 10). Never a button with no press state.
- **Toast / save confirm:** a small pill rises from bottom (mobile) or lower-right (desktop), `pop .5s --ease-bloom`, holds ~2.4s, fades. Carries an **undo** where the action is reversible (7s window on Passport-affecting confirms — §8.3).
- **Skeleton loading:** `shimmer 1.4s linear infinite` on a `--surface2→--raise` gradient (proto :626). Reduced-motion → static `--surface2` block, no shimmer.
- **Overlay/scrim entry:** `fade .18–.3s ease` + `backdrop-filter: blur(3–6px)` (proto :338,841). Scrim tap = dismiss (except where a decision is required).

---

## 17.A.1 · Onboarding (`/onboarding`) — the discover→confirm narrative in motion

§8.1 defines the 3 steps and copy. The **motion is the message**: Step 2 must *feel* like a machine reading the artist's public life, so that Step 3's findings feel *earned, not typed*.

### Interaction model
| Element | Trigger | Immediate feedback (<100ms) | Result state |
|---|---|---|---|
| Name / link fields | focus | border lifts to `--accent`, label rises | active input; primary stays disabled until **both** non-empty (helper: "Add your name and one link to start.") |
| Primary "Find my footprint →" | tap (enabled) | press-scale `.97` | advances to Step 2; scan auto-runs |
| Source tiles (Step 2) | none (auto) | tiles light **one-by-one**, greyscale→color | see motion table; auto-advances ~3.2s |
| Scan bar | none (auto) | a lime sweep runs left→right, looping | `scanbar 1.15s linear infinite` (proto :1120) |
| Caption line | none (auto) | cycles the scan lines ~900ms each | 6 lines then Step 3 |
| Found rows (Step 3) | none (arrival) | rows stagger in, "✦ Found" chip pops per source | static found-grid; nothing is confirmed here |
| "Open my Radar & confirm →" | tap | press-scale | closes overlay (`fade` out), lands on Radar with ✦ items waiting |
| "I'll explore a sample first" | tap | quiet underline | Radar with sample data |

### Motion table
| Moment | Property | Duration · easing | Reduced-motion |
|---|---|---|---|
| Step→step swap | opacity+translateY | `slidein .28s --ease-ui` (proto :209) | opacity only |
| Source tile light-up | greyscale(1)→0, opacity .38→1, scale .88→1 | `.45s cubic-bezier(.2,.8,.3,1)` staggered ~180ms each (proto :1111) | tiles appear lit instantly, no stagger |
| "✦ Found" chip on tile | scale .4→1, opacity 0→1 | `.3s` (proto :1115) | appears at rest |
| Scan bar | translateX loop | `scanbar 1.15s linear ∞` | **frozen** (hidden) — show a static "Reading…" label instead |
| Step-dot fill | width/color | `.3s` (proto :1089) | color swap only |
| Overlay in/out | opacity + blur | `fade .2s` | keep (fade is safe) |

**Firewall.** The tally ("8 findings") is a count of the artist's *own* found items, each method-labeled; never a grade. The animation discloses scope honestly ("a wider multi-source auto-scan is in development"). No score/gauge ever animates.

**Mobile.** Identical single-column card. Scan tiles wrap to a 4-col grid; the caption + scan bar sit below. No gestures required — this is a linear, auto-advancing narrative. One primary CTA, full-width, pinned to the card bottom.

**DoD (motion).** Step 2 auto-advances and is fully legible with motion off (static "Reading your public footprint…" + a determinate "5 of 5 sources" text). Tiles stagger only with motion on. No page scroll at 390 and 1360.

---

## 17.A.2 · Artist Radar + Inspector — the central interactive engine

This is the deepest interaction surface in the product. §8.2/§8.3 define the 4-zone canvas, the six planets, and the 3-layer inspector. Below is the **complete motion + gesture + state model** — the "orbit widget" the owner asked to be explained (U32).

### 17.A.2.a · The living background (ambient, always breathing)

Six loops run continuously on the dark universe island; all six are in the reduced-motion kill-list (proto :410).

| Layer | Animation | Meaning (never a gauge) |
|---|---|---|
| Radar sweep | `sweep 9s linear ∞`, conic wedge, radial mask (proto :306) | "we continuously watch your public footprint." Points at nothing, measures nothing. |
| Sonar | `sonar 5s ease-out ∞`, ring 14%→94% (proto :391) | the star "pinging" outward — alive, scanning |
| Starfield | `twinkle 5s ease-in-out ∞` (proto :386) | depth |
| Center star | `starglow 4.5s ease-in-out ∞`, lime shadow 24px↔40px (proto :357) | the artist's proof "breathing" — the one gold/lime aura |
| Planet bob | `pfloat 6s ease-in-out ∞`, ±2.5px (proto :310) | planets feel afloat, not pinned |
| Found dot | `fdpulse 2s ease-in-out ∞` (proto :321) | "something here is waiting for you" |

Constellation threads (`.constel line`, proto :398) transition `stroke .4s, opacity .4s` when a planet's state changes; **Ready/Developing threads flow energy inward** via `flowLit`/`flowDev` (dash-offset march, proto :403–404) — growth made visible. Reduced-motion freezes the flow (`.cl-lit,.cl-dev animation:none`) but keeps the state color.

### 17.A.2.b · Planet focus / recede — the core gesture

**Trigger:** tap a planet (`openPlanet`). **Immediate feedback (<100ms):** the tapped planet's `.pnode` lifts (transform+shadow `.2s`); the whole universe reflows.

| Effect | Property | Duration · easing |
|---|---|---|
| Universe subtle zoom toward selection | `.uni` transform | `.3s --ease-ui` (proto :300) |
| **Non-selected planets recede** | opacity→~40% (desktop) / dim to ~22% off-lens, `filter` | `.3s` opacity+filter (proto :308) — **fade, never removed** |
| Selected planet node emphasis | box-shadow/border | `.2s` |
| Source logos **orbit-emerge** around the planet | scale .2→1, opacity 0→1, fanned inward (~84° spread) toward the star | `orbit-emerge .46s --ease-orbit both`, **staggered** per logo (proto :576) |
| Inspector slides in (desktop right rail) | translateX 14px→0, opacity .3→1 | `inspIn .26s --ease-orbit` (proto :443) |
| Proof card rises under planet (mobile "focus card") | translateY 8px→0, scale .96→1 | `card-rise .26s --ease-orbit` (proto :594) |

**Recede rule (firewall + design):** off-focus planets fade but **stay interactive and full-order** — dimming is a focus aid, reversible, never a judgement and never a reorder. Tapping the center star or the scrim returns all planets to 100%.

### 17.A.2.c · The orbit-logo widget (the heart of U32)

On planet select, its evidence sources become **logos orbiting the planet**. Each logo is a live control.

| Logo state | Visual | Motion | Trigger → result |
|---|---|---|---|
| **Found (waiting)** | gold ring | `logo-invite 2s ease-in-out ∞` (proto :577) — slow breath | tap → opens the found-row (exact wording + concrete source + proves/doesn't-prove) in the inspector |
| **Confirmed** | lime ✓ | static, settled | tap → shows method label + human source line; long-press → method detail |
| **Emerging** | — | `orbit-emerge .46s --ease-orbit` staggered | arrival on planet select |
| **Locking in** (confirm) | lime bloom | `logo-lock .6s --ease-orbit` — scale 1→1.18→1, 30px lime flash (proto :586) | the "minting a moment" — see 17.A.2.e |
| **Dismissed ("not me")** | fades out | `orbit-dismiss` — opacity→0, scale→.4 (proto :588) | recorded, **not deleted** (name-ambiguity honesty) |

The orbit ring itself can slowly rotate (`orbit-spin`/`orbit-spin-rev`, proto :565–566) as pure décor; reduced-motion stops it. A **scrim** (`orbit-scrim`, `fade .2s`, proto :553) sits behind the orbiting set on mobile so the focused planet reads as modal; tap-scrim = recede.

### 17.A.2.d · The 3-layer inspector (desktop rail · mobile sheet)

Content per §8.3 (Meaning / Found proof / Next action). Motion:

- **Desktop:** persistent right rail, always visible, always holds the single primary CTA. On planet change it re-renders with `inspIn .26s --ease-orbit` (or `slidein-r .26s --ease-ui`, proto :341). It never leaves.
- **Mobile:** a **bottom-sheet** (`.rwinsp`, `.psheet`). Closed = translated off-screen (`translateY(calc(100% + 240px))`, proto :543). Open = `slidein-up .26s --ease-ui` (proto :982) / transform `.28s --ease-orbit`. A **grab handle** (`.insp-grab`) sits at the top. The scrim (`.rwscrim`, opacity `.22s`, proto :548) darkens behind.
- **The one-CTA guarantee:** `holdsCTA = !mobileMQ() || sheetOpen` (proto :1955). Desktop inspector always holds the CTA; on mobile the inspector holds it **only when the sheet is open**, otherwise the **bottom dock** (`radarDock`) carries the next-best move. Net: exactly one primary lime CTA on screen at every instant (proto :1972–1973).

### 17.A.2.e · Confirm → lock-in bloom (the reward moment)

The single most important micro-interaction in the app. **Trigger:** tap "Review your {dimension}" → confirm a found row (`confirmTop`).

| Stage | Effect | Motion |
|---|---|---|
| 1 · button press | scale `.97` | 120ms `--ease-ui` |
| 2 · node flips ✦→✓ | `litpop` — scale .6→1.18→1, 34px lime shadow bloom (proto :326) | ~500ms `--ease-bloom` |
| 3 · orbit logo locks | `logo-lock .6s --ease-orbit` (proto :586) | overlaps stage 2 |
| 4 · bloom burst at planet center | `bloomAt(x,y)` → a lime radial scales .2→26, fades (proto :916, :1497) | `bloom .42s --ease-bloom`; **early-returns on reduced-motion** |
| 5 · optional celebrate | confetti `fall` + `celebrate-card pop .5s` (proto :913,931) | reserved for milestone-crossing confirms only, not every tap |
| 6 · named receipt toast | "**Added to your Passport**" _or_ "**Saved privately**" + **7s undo** | `pop .5s --ease-bloom`; honest destination (only verified/supporting + passport-ok reach the Passport — §8.3) |
| 7 · thread relights | the planet's constellation thread → lime, energy flows inward (`flowLit`) | `stroke .4s` |

Reduced-motion path: node swaps ✦→✓ instantly (opacity), no bloom, no confetti; the receipt toast still fades in (feedback preserved).

### 17.A.2.f · Scene lens & filter lens

| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Scene segmented control (Melodic/Progressive/Afro/All) | tap segment (`pickScene`) | active pill raises, `.14s` (proto :426) | re-weights which planets carry the **★ genre-primary ring** — a *reading lens on the same evidence*, **never a data change**. Threads/planets keep values; only the ★ moves. |
| Show-lens (All · Needs my review · Ready to publish) | tap (`pickFilter`) | pill raises `.16s` (proto :296) | off-lens planets dim to ~22% `.3s` (reversible); "Needs my review" opens the batch-confirm entry |

The scene control sits **top-center and never overlays the act card** (proto :417 grid area `scene`). ★ additive only — non-primary planets keep full opacity/interactivity/order.

### 17.A.2.g · Gesture table (mobile "Radar Focus")

Real handler at proto :1940–1947.

| Gesture | Threshold (from prototype) | Action |
|---|---|---|
| **Tap planet** | — | focus in place, logos orbit, sheet available |
| **Tap orbit logo** | — | small proof card |
| **Long-press logo** | ~500ms `OWED` (prototype uses tap→method; long-press is the §8.3/PART10 target) | method label detail |
| **Swipe left / right** on universe or inspector | `\|dx\| > 48px` **and** `\|dx\| > \|dy\| × 1.4` (proto :1945) | `cyclePlanet(±1)` — next/prev planet, universe reflows |
| **Pull-down / grab-handle drag** on sheet | drag past handle | `closeSheet` — sheet slides out `.28s`, planets return to 100% |
| **Tap scrim** | — | `closeSheet` |
| **Tap center star** | — | overview (deselect all) |

`OWED` — the sheet **drag-follow** (finger tracks the sheet 1:1 before the release threshold) is a target refinement; the prototype animates open/closed but does not finger-track. Spec: while dragging, `translateY` follows touch delta; release past ~30% height or with downward velocity → close, else snap back `.28s --ease-orbit`.

### State-transition map (Radar planet)
| State | Face | Thread | Trigger in → | Motion |
|---|---|---|---|---|
| **Needs you** | amber ring, ✦ found-dot pulsing | amber | found item exists / empty | `fdpulse` on dot |
| **Developing** | teal ring | teal, flowing | some confirmed, gaps remain | `flowDev` |
| **Ready** | lime, ✓ | lime, glowing+flowing | all confirmed, no gaps | `flowLit` |
| **Locked / Not needed yet** | faint, no orbit evidence | faint | Kit before Live backed | static; warm copy "opens once your live draw is backed" |
| selected | node lifts, logos orbit | — | tap | focus motion (17.A.2.b) |
| confirming | ✦→✓ bloom | relights | confirm | lock-in (17.A.2.e) |
| dismissed | logo fades | unchanged | "not me" | `orbit-dismiss`, recorded not deleted |

**DoD (Radar motion).** Six ambient loops present and all in the reduced-motion kill-list; planet focus fades others to 40% (never removes); orbit logos emerge staggered + lock-in blooms; exactly one primary CTA (inspector XOR dock) at all times; swipe cycles at the 48px/1.4 threshold; pull-down/scrim close; scene ★ re-weights without changing data; zero score/rank/%/gauge; no h-scroll at 390/1360.

---

## 17.A.3 · Passport (artist multi-view · edit vs buyer-preview)

§8.4. Light surface, a single dark hero island. The interaction job: **switch faces cheaply, preview the true public read, publish/share.**

### Interaction model
| Element | Trigger | Feedback | Result |
|---|---|---|---|
| **View-switcher chip** ("Viewing as: {view} ▾") | tap (`toggleView`) | chip depresses, popover fades in `fade .18s` | popover "Show this Passport as" + radio rows (Booker/Representation/Production/Private) with ✓ on active |
| View row | tap (`pickView`) | ✓ moves | **ledger re-orders per face** — proof cards restack; the "what {noun} sees" line + lead proof swap |
| Gaps bar (artist-only) | tap (`toggleGaps`) | chevron rotates `.3s` | expands the private item + "Add it" ghost |
| "Publish Passport" (draft) | tap (`publish`) | press-scale; **seal mint** | standing → "Live for buyers · refreshed {date}"; the "LOCK · Verified" seal does `sealpop .7s --ease-overshoot` (proto :933) — the one overshoot in the app |
| Proof card | hover (desktop) | lifts `.18s` | source-peek affordance (mirrors Buyer, 17.A.6) |
| "Preview on Passport" | tap | — | jumps to the true public read |

### Motion table
| Moment | Duration · easing | Reduced-motion |
|---|---|---|
| Face switch (ledger re-order) | cards fade+restack `.26s --ease-ui` | instant restack, opacity only |
| Popover open | `fade .18s` | keep |
| Gaps expand | height/chevron `.3s` | keep (no travel — height only) |
| Publish → seal mint | `sealpop .7s --ease-overshoot` + `spin` (proto :924) | seal appears at rest, no spin |
| Hero island | static dark; no per-load animation (atmos band removed app-wide, U29) | — |

**Firewall.** Verified strengths only; draw = bands, readiness = binaries, each with a method chip. No gap on any buyer face. **No firewall strip / no narration** (U33) — enforced by the absence of any score/rank component, never announced. De-technicalised provenance (method chips + seal, not "✓ 2 published" badges, U23).

**Mobile.** View-switcher chip in the page header (not in-card tabs). Popover becomes a bottom-sheet (`slidein-up .26s`). Single column; hero island first-viewport. One primary CTA (Publish, or Preview).

**DoD.** Four faces from one pool re-order on switch; header view-switcher shared with the Radar scene-switch pattern; publish → seal mint (overshoot, motion-off safe); gaps bar artist-only; no firewall strip.

---

## 17.A.4 · Requests (artist inbox → decision cockpit)

§8.13 / PART 10 §10.4. Each request is a **decision widget**, not a list row: one-sentence fit summary, missing-info, safety cue, three actions.

### Interaction model
| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Request card | tap / expand | details slide open `.26s --ease-ui` | shows event, date, LOCK's one-sentence fit line, "no contact shared yet" safety cue, missing-info flags |
| **"Say I may be available"** (primary) | tap | press-scale; toast | reply logged; card → "✓ Availability sent" chip; **this is the Gate reaction path** |
| "Ask one question" | tap | inline field opens | a bounded question back to the buyer |
| "Not for me" | tap | card collapses, muted | declined, logged |
| Swipe (mobile) | swipe right = available / left = not-for-me | card slides with finger | `OWED` threshold — reuse Radar's `\|dx\|>48 & \|dx\|>\|dy\|×1.4`; require a confirm tap for a booking-affecting swipe (no accidental send) |

### State-transition map
| State | Visual | Motion |
|---|---|---|
| new | lime dot, raised | subtle `foundpulse 2.8s` (proto :1011) — "needs you" |
| opened | expanded details | slide `.26s` |
| replied | "✓ Availability sent" | `cardpop .5s --ease-bloom` |
| asked | "Awaiting reply" chip | static |
| declined | muted, collapsed | fade |
| empty | "No requests yet — when a buyer checks your date, it lands here." | — |

**Firewall.** The reaction insight that later returns to the artist is **method-safe text only, never a count/%/score** (CLAUDE.md — the most fragile spot). A request never shows a "match score"; fit is a one-sentence human reason.

**DoD.** Cards carry fit-line + missing-info + safety cue; three actions; new-state pulse; reply mutates the card in place; swipe requires confirm; zero score.

---

## 17.A.5 · Access — "Who can act for you" (`/artist/access`)

§8.5. A calm consent surface. Motion is minimal by design — trust, not spectacle.

| Element | Trigger | Feedback | Result |
|---|---|---|---|
| "Invite someone" | tap (`accessInvite`) | sheet/dialog `slidein-up .26s` | invite form (name + scope checkboxes) |
| Scope toggle | tap | checkbox fills `.16s`, lime | scope added; live "what they'll be able to do" line updates |
| "End access" | tap (`accessRevoke`) | confirm dialog | card → "Access ended", actions removed |
| "Resend invite" | tap (`accessResend`) | toast "Invite resent" | pending card unchanged |

State map: **Active** (since date) · **Pending** (waiting) · **Ended** (no actions) · **Empty** (invite prompt). No score, no rank. Entity law: never "grant/ownership" language toward the artist — consent-based, scoped, revocable by either side.

**DoD.** Invite/active/pending/ended/empty; scope toggles update the live description; revoke behind a confirm; no ownership language.

---

## 17.A.6 · Buyer / Public Passport (`/passport/:id`) — the 60-second decision, in motion

§8.7. **No login.** The interaction job: answer fit·trust·readiness·availability in the first viewport, and make trust **inspectable** via the source-peek.

### Interaction model
| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Persona toggle (Booking a show / Representing) | tap | segment slides `.16s` | copy + section titles + CTA swap (draw↔career; "Check availability"↔"Discuss representation") |
| **Proof-unit source-peek** | hover (desktop) / tap (mobile) | a small peek card rises `card-rise .26s --ease-orbit` | shows **where it comes from** + **what the method label means** — trust made inspectable |
| Sticky availability CTA | scroll | stays pinned (mobile) | tap → availability request (§8.8) |
| "Send to partner" | tap | copy-link toast | shareable URL copied |

### Motion table
| Moment | Duration · easing | Reduced-motion |
|---|---|---|
| Persona swap | `.16s` segment + `.2s` content cross-fade | opacity only |
| Source-peek in/out | `card-rise .26s --ease-orbit` / fade out `.18s` | fade only |
| Sticky CTA | no animation, position:sticky | — |
| Hero | static dark island (no atmos animation) | — |

**Firewall.** Verified strengths only; draw = bands, readiness = binaries, each method-labeled. No gap, no score/rank/prediction. **Remove the leftover `.fwstrip` footer** (U33). Peer bands never shown buyer-side unless method-safe and requested. The source-peek explains provenance, never quality.

**Mobile.** Single column; sticky compact availability CTA; source-peek is tap (not hover). Non-pro register for private/corporate (warm, non-industry).

**DoD.** First viewport answers the four questions; persona swap changes copy+CTA; source-peek on every proof unit; sticky CTA; no firewall strip; no login.

---

## 17.A.7 · Source-Confirmer (`/confirm/:token`) — warm one-minute confirmation

§8.9. **Accountless**, one statement, one decision. The entire surface is one centered card — **no nav, no shell** (retire `/producer`, D3). Motion = warmth, not gamification.

### Interaction model
| Element | Trigger | Feedback | Result |
|---|---|---|---|
| "Yes — this is accurate" (primary) | tap (`cfConfirm`) | press-scale; **quiet lime settle** (no confetti — this is someone else's reward, keep it dignified) | Done state: "Recorded — thank you" + the statement now carries **Producer-confirmed** |
| "Partly right — needs a fix" | tap | inline correction field opens `.26s` | confirms most + notes the correction |
| "No — this isn't accurate" | tap (`cfDecline`) | warn-tint press | records a decline (won't show as confirmed) |
| "What happens after I answer?" | tap | expandable opens `.3s` | legal + name-visibility detail (moved out of the primary flow) |
| "Replay this link" | tap (`cfReset`) | — | back to Ask |

State map: **Ask** (three large choices) → **Done** (receipt + "Revocable anytime" + replay). Motion is restrained: the Done state fades in (`fade .3s`); the "Producer-confirmed" chip may do a single gentle `cardpop`, no bloom-burst. Reduced-motion → instant.

**Firewall.** This one statement only — never an endorsement, never a score/rating. Adds only the canon **Producer-confirmed** label. Revocable; the artist controls publishing.

**DoD.** Single card, no shell; three warm choices incl. inline "partly"; Done receipt with revoke route; legal in an expandable; motion restrained + motion-off safe.

---

## 17.A.8 · Representation — Roster cockpit

§8.10. A **cockpit of artist-bound action cards** ("who needs help today"), never a CRM table.

| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Roster action card | tap | expands `.26s` | what-changed line + why + method/band chips + ArtistAccess scopes |
| **Urgent card** (a buyer is waiting) | arrival | `foundpulse 2.8s` + amber flag | "A buyer is waiting on you…" — always sorts first |
| "Publish update" / "Answer request" (one per card) | tap | press-scale; toast | row → "✓ Update published" / "✓ Availability sent" (`cardpop .5s`) |
| Filter (urgent / ready / needs-approval) | tap | pill raises `.16s` | list re-filters, cards fade-restack `.26s` |
| "Invite artist" | tap | sheet | invite by ArtistAccess (consent, not ownership) |

**Firewall / entity law.** **No roster rank** (never-rank-roster). Reaction insight = method-safe text only. No CRM tables. ArtistAccess = a grant the artist can revoke — never ownership language. **DoD.** Each row = one artist-bound card (what changed · why · one action); urgent state pulses+sorts first; action mutates the row; consent+scope shown; no rank.

---

## 17.A.9 · Production — Lineup board

§8.11. An event/lineup **board** of time-ordered slots, not rows. Booking = acting as a Buyer (open a Passport → availability request).

| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Event card | tap | expands to timeline | slots top-to-bottom by set-time |
| **Slot chip** (Open/Requested/Confirmed) | tap | press-scale | Open → "Confirm for this slot" opens a Passport/act picker |
| "＋ New event / open slot" | tap | sheet `slidein-up .26s` | Draft event card created (`cardpop`) |
| Suggested-act card | tap | — | fit *reason* (never a rank) + open its Passport |
| Slot confirm | tap | slot → "✓ Confirmed · {act}" | `cardpop .5s --ease-bloom` |

State map (per slot): **Open** ("needs an act") · **Requested** ("Awaiting reply") · **Confirmed** ("✓ {act}"). Note: event/lineup **creation** UI is target (view-only in the real app today). **Firewall.** Production never owns an artist's evidence — it reads Passports; suggested acts carry a fit *reason*, never a rank/score. **DoD.** Time-ordered slots; open/requested/confirmed states; create-event/open-slot; one CTA per slot; Production-as-Buyer path; no evidence ownership.

---

## 17.A.10 · The inline-edit widget (full spec — the D1 fix, reused everywhere)

The single most reused interactive primitive after the button. It opens **in place** (never a new page), on the Radar inspector (§8.3), the Act-Identity Editor (§8.6), and Account (17.B.5). Per PART 10 §10.4 every field is QA'd with: **empty · typing · long value · Hebrew · URL · invalid.**

### The seven states (per field)
| State | Visual | Motion | Copy example |
|---|---|---|---|
| **Display** | value + "Edit" affordance | — | value shown; "Edit" ghost |
| **Open in place** | field replaces value, focus, caret | field grows in `.16s`, border → `--accent` | placeholder / current value prefilled |
| **Typing** | active border, live validation | border stays lime; counter ticks (textarea) | live char-count "82 / 120" |
| **Valid / dirty** | "● Editing" chip + Save + Cancel | chip fades in `.18s` | "Save — right here" |
| **Saving** | button → spinner, field locks | `shimmer` on the row `.16s` | "Saving…" |
| **Saved** | "✓ Saved" chip, value returns to display | `cardpop .5s --ease-bloom` on the row | "✓ Saved" (auto-fades ~2.4s) |
| **Error** | red hairline + human message + Retry | field shakes once (2px, 120ms) — **skipped on reduced-motion** | "That link doesn't look right — paste the full address (https://…). [Retry]" |

### Per-field behavior
| Field | Validation | Empty helper | Invalid message |
|---|---|---|---|
| Stage name | non-empty | "Your Act's name — what a buyer reads first." | "Add a name so buyers know who they're booking." |
| City | non-empty | "Where you're based." | — |
| One-line positioning | ≤120 chars, live counter | "One line on what you do." | "Keep it to one line — {n} left." |
| Genre | from set / free | "Your scene — it also lights the planets that matter most." | — |
| Link / URL | URL shape, `dir=ltr` | "Paste a public link." | "That link doesn't look right — paste the full address." |
| Draw fields | **band select only** | — | (never free-typed — firewall) |

**Interaction law.** Field-level save (each row independent); **undo** on save (a quiet "Undo" in the saved toast); confirmed radar nodes expose an "edit" affordance that **re-opens the fill widget pre-filled**; a "what becomes public" chip on each field; nothing publishes until the Passport is refreshed. **Firewall.** Draw saves as bands only; no score/rank field can exist. **DoD (per field):** empty=friendly helper · typing=active border+live validation · invalid=human explanation · saved=visible confirmation+undo · loading · error-retry · Hebrew/RTL + long-value + URL cases all pass.

---

# PART B — THE MISSING UTILITY SCREENS

These are the screens the prototype never drew — the plumbing that a real product needs and that §8 does not cover. **All utility screens are LIGHT / paper theme** (dark is reserved for Radar/Passport atmosphere only — DS v1.6.23 "dark is atmosphere, not camouflage"). **Mobile = bottom-sheets, one primary CTA, 44px targets.** Language is human — **no internal terms** (no "org", "role_assignment", "entitlement" on screen). Each is spec'd like §8: **PURPOSE · DESKTOP · MOBILE · COMPONENTS · STATES · INTERACTIONS · MICROCOPY (EN + HE where derivable) · FIREWALL · DoD.**

Shared tokens (light): paper `#F3F5EF` · white card `#FFFFFF` · forest panel `#18221A` · ink text `#0A0D0B` · slate muted `#687269` · lime CTA `#C8F04D` · mist border `#DDE3D9`. `OWED` — exact card border/elevation, radius scale (`--r`, `--r2`), light-card muted/faint, and CTA primary/secondary/ghost paddings + the 44px rule's exact values live only in DS v1.6.25 (Drive) — fill from `LOCKSHOW_Design_System_CURRENT.html`.

---

## 17.B.1 · Signup

**PURPOSE.** Create an account with the least friction, then hand off to the right onboarding (artist → §8.1; buyer needs no account). One decision: email or Google.

**DESKTOP.** Centered light card (max ~420px) on paper. Brand lockup · H1 "Create your account" · Google button (full-width, secondary) · "or" divider · email + password fields · primary "Create account" · legal microcopy · footer "Already have an account? Log in".
**MOBILE.** Same card full-bleed with 16px gutters; primary CTA pinned; Google button first (thumb-reachable). No bottom-sheet needed (this is a full page).

**COMPONENTS.** Brand lockup · Google OAuth button (with G mark) · email field · password field (show/hide toggle) · primary CTA · inline error region · legal line.

**STATES.** default · field-focus (lime border) · password-too-short (inline helper) · email-taken ("That email already has an account — log in instead" + link) · submitting (CTA → spinner, `shimmer` on card) · success (→ onboarding) · OAuth-cancelled (return to default, quiet note) · offline (see 17.B.10).

**INTERACTIONS.** Google → OAuth popup/redirect → on return, route by role (`state.from` honored). Email → validate → create → route. Enter submits. Password show/hide toggles.

**MICROCOPY (EN / HE).** H1 "Create your account" / "פתיחת חשבון" · Google "Continue with Google" / "המשך עם Google" · email "Email" / "אימייל" · password "Password" / "סיסמה" · helper "At least 8 characters." / "לפחות 8 תווים." · CTA "Create account" / "יצירת חשבון" · legal "By continuing you agree to our Terms and Privacy Policy." / "בהמשך אתה מאשר את תנאי השימוש ומדיניות הפרטיות." · footer "Already have an account? **Log in**" / "כבר יש לך חשבון? **התחברות**".

**FIREWALL.** Neutral — no evidence surface. Do not pre-collect anything that implies a score.
**DoD.** Email + Google paths; validation states; email-taken → login link; `state.from` deep-link honored; light theme; one primary CTA; keyboard-submittable; HE strings externalized.

---

## 17.B.2 · Login (email + Google OAuth)

**PURPOSE.** Return an existing user to where they were. One job, two paths.

**DESKTOP / MOBILE.** Mirror of Signup: brand · H1 "Log in" · Google button · email + password · "Forgot password?" link · primary "Log in" · footer "New here? Create an account".

**COMPONENTS.** Google button · email · password (show/hide) · forgot-password link · primary CTA · inline error.

**STATES.** default · focus · wrong-credentials ("Email or password doesn't match. Try again or reset your password.") · submitting · success (→ `state.from` or role home) · OAuth-cancelled · rate-limited ("Too many attempts — wait a moment and try again.") · offline.

**INTERACTIONS.** Enter submits; Google OAuth; "Forgot password?" → 17.B.3; on success honor deep-link `state.from` (§8.13).

**MICROCOPY (EN / HE).** H1 "Log in" / "התחברות" · "Forgot password?" / "שכחת סיסמה?" · error "Email or password doesn't match." / "האימייל או הסיסמה לא תואמים." · CTA "Log in" / "התחברות" · footer "New here? **Create an account**" / "חדש כאן? **פתיחת חשבון**".

**FIREWALL.** Neutral. **DoD.** Both paths; wrong-credential + rate-limit states; forgot-password link; deep-link honored; light theme; one CTA.

---

## 17.B.3 · Forgot / Reset password

**PURPOSE.** Recover access safely in two steps: request a link → set a new password.

**DESKTOP / MOBILE.** Step 1 (request): H1 "Reset your password" · email field · primary "Send reset link" · "Back to login". Step 2 (from email link): H1 "Set a new password" · new password + confirm · primary "Save new password".

**COMPONENTS.** email field · CTA · confirmation panel · (step 2) two password fields with match validation · show/hide.

**STATES.** request-default · submitting · **sent** ("Check your email — we sent a reset link to {email}. It expires in 60 minutes." — always shown even if the email doesn't exist, to avoid account enumeration) · link-expired ("This link has expired — request a new one.") · step2-default · passwords-mismatch · saving · success (→ login) · offline.

**INTERACTIONS.** Send → always show the neutral "sent" panel (enumeration-safe). Step 2 validates match + length, saves, routes to login with a success toast.

**MICROCOPY (EN / HE).** "Reset your password" / "איפוס סיסמה" · CTA "Send reset link" / "שליחת קישור לאיפוס" · sent "Check your email — we sent a reset link to {email}." / "בדוק את האימייל — שלחנו קישור לאיפוס אל {email}." · expired "This link has expired — request a new one." / "הקישור פג תוקף — בקש קישור חדש." · step2 "Set a new password" / "בחר סיסמה חדשה" · mismatch "The two passwords don't match." / "הסיסמאות אינן תואמות." · CTA "Save new password" / "שמירת סיסמה חדשה".

**FIREWALL.** Neutral; enumeration-safe (never reveal whether an email exists). **DoD.** Two steps; enumeration-safe "sent"; expired-link state; match+length validation; success → login; light theme.

---

## 17.B.4 · Invite → Accept (org / team)

**PURPOSE.** A person clicks an invite link (`/invite/:token`) and joins a workspace with a role — the team-formation moment. Human language only ("Maya invited you to join {Workspace}"), never "role_assignment".

**DESKTOP / MOBILE.** Centered card: inviter avatar + "**{Inviter}** invited you to join **{Workspace}**" · a one-line "what you'll be able to do" (role in plain words) · primary "Accept & join" · secondary "Not now". If not signed in → first create/log in (17.B.1/2), then land back here (token preserved).

**COMPONENTS.** inviter chip · workspace name · plain-role line · Accept CTA · decline ghost · expired/used panel.

**STATES.** valid (accept) · **needs-auth** (prompt to sign in first, token held) · accepting (spinner) · **accepted** (→ that workspace home with a welcome toast) · **expired** ("This invite has expired — ask {Inviter} to send a new one.") · **already-used** ("This invite was already used.") · **wrong-account** ("This invite is for {email}. You're signed in as {other} — switch accounts?").

**INTERACTIONS.** Accept → join, route to workspace, toast "You've joined {Workspace}". Decline → neutral confirmation. Auth-gate preserves `:token` through signup/login.

**MICROCOPY (EN / HE).** "**{Inviter}** invited you to join **{Workspace}**" / "**{Inviter}** הזמין אותך להצטרף ל-**{Workspace}**" · role line "You'll be able to {help with bookings / manage the roster / …}." / "תוכל {לעזור עם הזמנות / לנהל את הרוסטר / …}." · CTA "Accept & join" / "אישור והצטרפות" · decline "Not now" / "לא עכשיו" · expired "This invite has expired — ask {Inviter} to send a new one." / "ההזמנה פגה — בקש מ-{Inviter} הזמנה חדשה."

**FIREWALL.** Neutral; no ranking of members. Role shown in plain capability words, never internal enum. **DoD.** Valid/expired/used/wrong-account/needs-auth states; token survives auth; accept routes to workspace + toast; plain-language role; light theme.

---

## 17.B.5 · Account Settings (person-level)

**PURPOSE.** The person (not the Act, not the workspace) edits their own basics and controls their account. Reachable from the top-right hub (§ PART 6). `OPEN` — owner U26: whether this is a full screen or folds into the hub; spec here as a screen with the hub linking in.

**DESKTOP.** Light page, single column of setting rows (reuse the inline-edit widget, 17.A.10): **Name** · **WhatsApp** · **Language** (EN/HE select — this is where language lives, removed from every workflow per U1) · **Marketing preferences** (toggle) · a divider · **Danger zone**: "Delete account".
**MOBILE.** Same rows full-width; "Delete account" opens a bottom-sheet confirm.

**COMPONENTS.** inline-edit rows (name, WhatsApp) · language select · marketing toggle · delete-account row + confirm sheet · save toasts.

**STATES.** per-row (display/editing/saving/saved/error — 17.A.10) · marketing toggle (on/off, saves immediately with a toast) · language change (applies + confirms; RTL flips for HE) · **delete confirm** (bottom-sheet: "This removes your account and your Acts' evidence. This can't be undone." + type-to-confirm or explicit "Delete my account" + "Cancel") · deleting · deleted (→ signed-out marketing page).

**INTERACTIONS.** Inline field save; toggle saves live; language switch re-renders (RTL for HE); delete → confirm sheet → hard confirm → sign out.

**MICROCOPY (EN / HE).** H1 "Account" / "חשבון" · "Name" / "שם" · "WhatsApp" / "וואטסאפ" · "Language" / "שפה" · marketing "Send me product updates and tips" / "שלחו לי עדכונים וטיפים על המוצר" · delete "Delete account" / "מחיקת חשבון" · confirm "This removes your account and your Acts' evidence. This can't be undone." / "פעולה זו מוחקת את החשבון ואת הראיות של האקטים שלך. אי אפשר לבטל." · CTA "Delete my account" / "מחק את החשבון שלי".

**FIREWALL.** Neutral. Marketing prefs are opt-in-honest (see 17.B.8). **DoD.** Editable name/WhatsApp/language/marketing with inline-edit DoD; language RTL flip; delete behind a hard confirm → sign-out; light theme; HE strings.

---

## 17.B.6 · Org / Team management (members, roles, seats)

**PURPOSE.** A workspace owner/admin manages who's on the team, their role, and seats — human language, no CRM feel. (This is `/org/members` today — §8.10 `/team`.)

**DESKTOP.** Light page: H1 "{Workspace} team" · seat line ("3 of 5 seats used") · "Invite teammate" primary · a **members list** (avatar · name · role chip · status) · per-member menu (change role, remove). 
**MOBILE.** Members as stacked cards; invite as a bottom-sheet; per-member actions in a sheet.

**COMPONENTS.** seat meter (used/total, **plain text — not a graded bar**) · invite CTA · member row (avatar, name, role chip, status: active/invited) · role picker (plain words) · remove-member confirm.

**STATES.** default list · invite-sheet (email + role) · pending member ("Invited — waiting to accept") · seats-full ("All seats are used — upgrade to add more" → 17.B.7) · changing-role (saving/saved) · remove-confirm · empty (owner-only, "Invite your first teammate").

**INTERACTIONS.** Invite → creates `/invite/:token` (17.B.4) → toast. Change role → saves inline. Remove → confirm → row fades. Seats-full → routes to Billing.

**MICROCOPY (EN / HE).** H1 "{Workspace} team" / "צוות {Workspace}" · seats "3 of 5 seats used" / "3 מתוך 5 מושבים בשימוש" · CTA "Invite teammate" / "הזמנת חבר צוות" · pending "Invited — waiting to accept" / "הוזמן — ממתין לאישור" · full "All seats are used — upgrade to add more." / "כל המושבים בשימוש — שדרג כדי להוסיף." · remove "Remove {name} from the team?" / "להסיר את {name} מהצוות?".

**FIREWALL.** No member **rank/leaderboard**. Roles in plain capability language. Seat count is a plain fact, never a grade. **DoD.** Members list with role chips + status; invite → token flow; inline role change; seats used/total; seats-full → upgrade; remove-confirm; light theme.

---

## 17.B.7 · Billing / Plan / Upgrade (free-pilot state)

**PURPOSE.** Show the current plan, let a workspace upgrade / add seats. **STAGE-honest:** LOCK is pre-validation — monetisation is **measured, not required**; the founding cohort is a **free pilot**. No price/ICP is locked until the Gate. So the default state is a clean "You're on the founding pilot," not a hard paywall.

**DESKTOP.** Light page: current-plan card ("Founding pilot · free during the pilot") · a plan picker (cards: Solo / Team / Company) with plain feature lists + seat counts · "Request upgrade" primary (`OPEN` — whether upgrade is self-serve checkout or an operator-approved request; today it's a request → admin approves, §8.12). Seat add-on row.
**MOBILE.** Plan cards stack; picker as a sheet; one primary CTA.

**COMPONENTS.** current-plan card · plan cards (name · what you get · seats · price-or-"free during pilot") · seat stepper · "Request upgrade" CTA · pilot badge.

**STATES.** **pilot-free** (default — "You're on the founding pilot. It's free while we build with you.") · comparing plans · upgrade-requested ("Request sent — we'll set this up with you.") · seats-add-requested · (post-Gate, `OPEN`) paid/active · payment-needed.

**INTERACTIONS.** Pick plan → highlight + feature diff. "Request upgrade" → logs request → admin cockpit (§8.12) → toast. Seat stepper adjusts requested seats.

**MICROCOPY (EN / HE).** pilot "You're on the **founding pilot** — free while we build with you." / "אתה בפיילוט המייסדים — חינם בזמן שאנחנו בונים יחד." · CTA "Request upgrade" / "בקשת שדרוג" · requested "Request sent — we'll set this up with you." / "הבקשה נשלחה — נסדר את זה יחד." · note "No card needed during the pilot." / "אין צורך בכרטיס אשראי בזמן הפיילוט."

**FIREWALL / honesty.** Do **not** price or assume the deep-scan cost (target architecture, unmeasured — CLAUDE.md). Intent (a request) is **never** shown as revenue (§8.12). Free-pilot is the honest default. **DoD.** Pilot-free default; plan picker with plain features + seats; upgrade = request → admin (or `OPEN` checkout); "no card during pilot"; light theme; no cost claims about unbuilt scan.

---

## 17.B.8 · Consent / cookie banner

**PURPOSE.** Honest, minimal consent — the app's firewall/honesty ethos extends to privacy. Not a dark-pattern wall.

**DESKTOP.** A slim bottom bar (not a full-screen blocker) on paper: one line + "Accept" (primary) + "Only essentials" (equal-weight secondary) + "Manage" link. 
**MOBILE.** A bottom-sheet with the same three choices; **"Accept" and "Only essentials" are visually equal** (no tricked hierarchy).

**COMPONENTS.** message line · Accept · Only-essentials · Manage (opens a small preferences sheet with toggles: essential [locked on], analytics, marketing).

**STATES.** shown (first visit) · manage-open (toggles) · saved (bar dismisses, `fade`) · already-consented (never shown again).

**INTERACTIONS.** Accept / Only-essentials both dismiss + persist. Manage → toggle sheet → Save. Choice persists; re-openable from Account.

**MICROCOPY (EN / HE).** "We use only what's needed to run LOCK, plus optional analytics to improve it. You choose." / "אנחנו משתמשים רק במה שנדרש להפעלת LOCK, ובנוסף אנליטיקה אופציונלית לשיפור. אתה בוחר." · "Accept" / "אישור" · "Only essentials" / "רק החיוני" · "Manage" / "ניהול".

**FIREWALL.** Honest, symmetric choices (no dark patterns). Analytics here are the product-funnel events (§8.12) — never a grade of the user. **DoD.** Non-blocking bar/sheet; equal-weight accept/essentials; manage toggles with essentials locked; persists; re-openable; light theme.

---

## 17.B.9 · Notifications inbox (incl. the availability-request reaction)

**PURPOSE.** One place for what's happened — the most important item being the **availability-request reaction** (the Gate signal) and confirmations. Method-safe throughout.

**DESKTOP.** Bell in the top chrome → a dropdown panel (recent) + a full `/notifications` page. Light. List of notification rows grouped by day: icon · human line · timestamp · optional inline action.
**MOBILE.** Bell → full-screen list; or a bottom-sheet for the recent few. Pull-to-refresh.

**COMPONENTS.** notification row (icon · text · time · unread dot) · inline action (e.g. "Reply" on a request) · mark-all-read · empty state · day groupings.

**STATES.** unread (lime dot, subtly raised) · read (muted) · **availability-request** ("A buyer asked about your date — {event}, {date}." → "Reply" → Requests, 17.A.4) · **confirmation** ("{Name} confirmed a statement on your Passport." — method-safe, **no count/score**) · **published/reaction** (method-safe text only) · empty ("Nothing yet — this is where buyer interest and confirmations land."). loading (skeleton) · offline.

**INTERACTIONS.** Open row → routes to the source screen. Inline "Reply" → Requests. Mark-all-read. New arrival while open → row slides in `slidein .28s` + unread pulse (`foundpulse`), reduced-motion → appears at rest.

**MICROCOPY (EN / HE).** availability "A buyer asked about your date — {event}, {date}." / "מזמין שאל לגבי התאריך שלך — {event}, {date}." · action "Reply" / "מענה" · confirmation "{Name} confirmed a statement on your Passport." / "{Name} אישר הצהרה בפספורט שלך." · empty "Nothing yet — buyer interest and confirmations land here." / "עדיין אין כלום — כאן ינחתו התעניינות של מזמינים ואישורים." · mark-all "Mark all read" / "סמן הכל כנקרא".

**FIREWALL (critical).** The reaction insight returning to the artist is **method-safe text only — never a count, %, or score** (CLAUDE.md — the most fragile spot). "A buyer asked about your date," never "3 buyers viewed / 80% interest." No leaderboard of who reacted. **DoD.** Grouped inbox; unread/read; availability-request row with inline reply; confirmation rows method-safe; empty/loading/offline; new-arrival motion (reduced-motion safe); **zero count/score in any reaction line.**

---

## 17.B.10 · 404 / global error / offline

**PURPOSE.** Keep a lost or broken moment warm, honest, and recoverable — one clear way back. Never a technical stack trace on screen (U8).

**DESKTOP / MOBILE.** Centered light card: a calm mark, a short human line, one primary CTA ("Back to home" / retry), one quiet secondary. Same layout for all three; copy differs.

**COMPONENTS.** illustration/mark (brand, subtle) · headline · one-line explanation · primary CTA · secondary link.

**STATES.**
- **404** — "This page moved or never existed." · primary "Back to my home" · secondary "Go to my Passport".
- **Global error (500 / crash boundary)** — "Something broke on our side — not your fault." · primary "Try again" (re-mount) · secondary "Back to home". No stack trace, no error code on screen (log it silently).
- **Offline** — a slim top banner (not a takeover): "You're offline — we'll reconnect automatically." Actions that need the network disable with a tooltip; queued where safe. On reconnect, banner turns "Back online" and fades.

**INTERACTIONS.** Retry re-attempts the failed route/action. Offline banner auto-updates on `online`/`offline` events; disabled CTAs show "Reconnecting…" not a dead click.

**MICROCOPY (EN / HE).** 404 "This page moved or never existed." / "הדף הזה עבר או לא היה קיים." · error "Something broke on our side — not your fault." / "משהו נשבר אצלנו — לא באשמתך." · offline "You're offline — we'll reconnect automatically." / "אתה במצב לא מקוון — נתחבר מחדש אוטומטית." · back "Back to my home" / "חזרה לדף הבית".

**FIREWALL.** Neutral; no technical content on screen (U8). **DoD.** Warm 404/500/offline; one primary recovery CTA each; offline as a non-blocking banner with auto-reconnect + disabled-not-dead actions; no stack trace/error code on screen; light theme.

---

## 17.B.11 · Loading / skeleton states pattern (the app-wide rule)

**PURPOSE.** One consistent loading language so nothing ever looks frozen or blank. This is a **pattern**, applied on every screen, not a screen.

**THE PATTERN.**
- **Skeletons, not spinners, for content.** A loading list/card renders its shape as `--surface2→--raise` gradient blocks with `shimmer 1.4s linear infinite` (proto :626), matching the real layout's boxes (proto :2003 shows the evidence-capture skeleton). Reduced-motion → static `--surface2` blocks, **no shimmer**.
- **Spinners only for a single in-flight action** (a button mid-submit): the button label → a small spinner, button stays sized (no layout shift).
- **Optimistic where safe.** Confirms, toggles, and saves apply immediately and reconcile — the UI never waits on the round-trip for a reversible action (undo covers the rare failure).
- **The honest-AI loading line.** Anywhere the extraction runs, show the honest state, never a fake progress bar: "AI is labeling your evidence" + "Every claim waits for your confirmation." (proto :2000–2001). A pulse dot (`.pulsedot`), not a percentage.
- **Timing:** if a load resolves under ~200ms, **don't** show a skeleton (avoids a flash); show it only past ~200ms. Keep skeletons for max ~10s, then fall to an error/retry state (17.B.10).

**MOTION table.**
| Element | Animation | Reduced-motion |
|---|---|---|
| Skeleton block | `shimmer 1.4s linear ∞` | static block |
| In-flight button | inline spinner | static "Saving…" text |
| AI-labeling line | `.pulsedot` breath | static dot |
| Content arrival | `fade .18s` / `slidein .28s` | fade only |

**MICROCOPY (EN / HE).** AI "AI is labeling your evidence." / "ה-AI מסמן את הראיות שלך." · sub "Every claim waits for your confirmation." / "כל טענה ממתינה לאישור שלך." · generic "Loading…" / "טוען…".

**FIREWALL.** No fake progress bar that implies a measured %; the AI line is honest and method-safe. **DoD.** Skeleton (shape-matched, shimmer, reduced-motion static) for content; spinner only for single actions; optimistic reversible actions; honest AI line (no % bar); ≥200ms threshold before showing; ~10s → error fallback.

---

# 17.C · Cross-cutting acceptance (applies to every screen above)

1. **One primary lime CTA on screen at any instant** — enforced structurally (Radar's `holdsCTA`; utility screens have a single primary).
2. **Immediate feedback (<100ms) on every interactive element** — press-scale, focus border, or optimistic apply. No dead clicks.
3. **`prefers-reduced-motion` has a defined equivalent for every animation** — ambient loops off, interaction transforms collapse to opacity, feedback fades kept (17.0.3).
4. **Firewall by design, never narrated** — no score/rank/%/gauge/headcount/leaderboard component exists; reaction-to-artist is method-safe text only; no firewall strip.
5. **Light theme for all utility screens; dark only for Radar/Passport atmosphere.**
6. **Human language only** — no internal terms on screen (org/role/entitlement/enum).
7. **Mobile = bottom-sheets + gestures, never a new page per tap; 44px targets; no horizontal scroll at 390.**
8. **Motion tokens reused, not re-invented** — the five easings + the duration ladder are the only vocabulary.

---

## 17.D · Provenance & open items (what I could / couldn't derive)

**Derived from the prototype (ground-truth, path:line cited above):** every easing, duration, keyframe, and the swipe threshold in PART A. The five-token easing system, the duration ladder, and the reduced-motion three-tier contract are generalisations of the prototype's repeated inline values — faithful, but promoted to named tokens (flagged `OWED` for Codex to confirm as DS v1.6.25 named motion tokens).

**Could NOT be derived — carried as `OWED` (need DS v1.6.25 from Drive):** exact light-card border/elevation/radius scale, CTA primary/secondary/ghost paddings, the 44px rule's exact hit-area values, named motion tokens, and the master logo SVG. The prototype is dark-themed and the utility screens (PART B) are new — their exact light-token values are not in the repo (only the A13 core hexes are).

**Could NOT be derived — carried as `OPEN` (product/owner decisions):** (a) gold/amber retire-vs-keep (§7.0 — affects only the found-state pulse color, not the motion); (b) Account as a full screen vs folded into the hub (U26); (c) Billing upgrade = self-serve checkout vs operator-approved request (today it's a request); (d) post-Gate paid billing states (no price/ICP locked pre-Gate — CLAUDE.md STAGE); (e) the sheet **drag-follow** (finger-tracking) refinement — the prototype animates open/closed but does not 1:1 track the finger; spec'd as a target in 17.A.2.g; (f) long-press-logo → method (prototype uses tap→method; long-press is the PART 10 target).

**Not built, spec'd honestly (per CLAUDE.md honesty firewall):** the deep multi-source discovery scan animation in Onboarding (17.A.1) shows the intended experience (vision) with honest method-labels ("a wider auto-scan is in development"); event/lineup **creation** in Production (17.A.9) is target, view-only today.

_File: `docs/spec/17-interactivity-and-screens.md` · Codex role · becomes §17 of the LOCK master spec._
