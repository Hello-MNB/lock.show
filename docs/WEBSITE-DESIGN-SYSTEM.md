# GIGPROOF Website Design System — CODEX identity (v2)

> Brief for the website-building agent. This file is the single source of truth for all visual,
> copy and interaction decisions on the marketing site.
>
> Extracted 7 Jul 2026 from the CODEX prototypes (all values below are real, none invented):
> - **Site prototype (primary reference):** `G:\My Drive\Work Projects\V6 - Maria's Talent Growth System\B4 - [APP NAME] - Artist Booking Intelligence & Growth System\Screens By Codex\PUBLIC WEBSITE\` — v0.63.0 (`source/*.css`, `pages/*.html`, `assets/`)
> - **App design system (same identity family):** `…\Screens By Codex\BRANDING AND DESIGN SYSTEM\` — release `00_CURRENT/GIGPROOF_Design_System_v1.2.0.html`, `01_SOURCE/design-system-spec-v18.css`, `01_SOURCE/design-system-states.css`, `02_ASSETS/`
>
> Where the site prototype and the app spec differ, the **site prototype wins** for site-specific
> patterns; each such case is noted inline in one line.

---

## 0. Identity ruling

**Canonical identity = CODEX's own design system — "Proof Lime".**
Deep green-black ink, warm paper, one lime accent, Georgia serif display, Manrope body, DM Mono
labels, soft governed radii, photography treated as evidence.

**Retired (do not revert):** the v1 "Paper + Ink + Stamp" system — purple stamp `#5B3FD6`,
Archivo Black wordmark, Space Mono labels, 2px radius, grain textures, no-shadow rule. It was
extracted from an older prototype and is superseded in full by this document (Maria's ruling,
7 Jul 2026). If any page, component or Tailwind config still carries those values, replace them.

---

## 1. How it FEELS

The goal is a site that *feels* different, not just looks correct. Every bullet below is
grounded in something real in the prototype — imitate the feeling, not just the hex codes.

1. **Quiet editorial confidence.** Display headings are Georgia serif at weight 400 — never
   bold — with tight leading (`line-height .93–.96`) and negative tracking (`-.055em`). The
   register is a well-set magazine, not a SaaS landing page: "Talent is visible.
   *Professional value often is not.*"
2. **Evidence, not hype.** Even marketing surfaces speak in records: "Supported by
   ticket-system exports", "Method and context visible", "Reviewed 29/06/2026",
   "Producer-confirmed · reviewed 26/06/2026". Numbers appear as context ("180–300 capacity
   electronic events · March–June 2026"), never as scores.
3. **Protective toward the reader.** The copy repeatedly tells people what GIGPROOF will *not*
   do to them: "GIGPROOF does not publish rank, percentile, booking probability or popularity
   leaderboards." A manager capability card promises roster clarity "without flattening the
   roster into a score." Protection is part of the brand voice, not fine print.
4. **One lime moment.** Lime is the single "act / verified / live" signal on any surface:
   the primary CTA, the eyebrow on dark, the status dot with its glow (`box-shadow:0 0 16px
   var(--lime)`). The v1.2.0 contract states it directly: "No dark primary on dark panels.
   Lime is the single dominant action." Everything else stays in calm greens.
5. **Contained and bounded.** Heroes are rounded cards (`border-radius:20–22px`) framed by a
   visible `1px #344037` border, floating on the `#EEF1EB` canvas with soft shadow. The app
   contract: "Every shadow is paired with a visible boundary." Nothing bleeds or glows without
   an edge.
6. **Generous air, slow rhythm.** Section padding is `clamp(72px,9vw,136px)`; intros cap at
   900–1120px; card grids breathe with 8–16px gaps inside hairline-divided frames. Whitespace
   does the emphasis work that other sites do with color.
7. **Humane softness with hierarchy.** Radii step 9 → 13 → 15 → 18 (controls → chips/cards →
   panels → large cards; heroes 20–22). The spec's own rule: "Radius communicates hierarchy,
   never decoration."
8. **Photography as testimony, not decoration.** Real stage/crowd/portrait imagery is graded
   down into the identity (`filter:saturate(.7–.82) contrast(1.03–1.08)`), pinned under ink
   gradients, and *captioned like evidence*: "MAYA VALE · ELECTRONIC LIVE ARTIST". The spec:
   "Image never substitutes for provenance."
9. **Dark is backstage, light is daylight paper.** The page alternates deep green-ink sections
   (method, demo, final CTA, footer) with paper sections. Dark sections use flat color +
   hairlines + a single radial lime glow (`radial-gradient(circle at 50% 110%,#c8f04d2b,
   transparent 42%)`) — never grain, never noise.

---

## 2. Color system

### CSS custom properties (paste into `:root`)

```css
:root {
  /* ---- Ink family (dark surfaces) ---- */
  --ink:         #0A0D0B;   /* base dark — header, hero, final CTA */
  --ink-2:       #0B100C;   /* dark section bg (method, demo); persona pages use #0B120D */
  --panel:       #111612;   /* raised dark panel (paths, method band) */
  --footer:      #080B09;   /* footer bg */
  --forest:      #18221A;   /* dark card / signal block */
  --forest-card: #172019;   /* dark card variant (pricing featured, persona active) */

  /* ---- Paper family (light surfaces) ---- */
  --paper:       #F3F5EF;   /* light section bg */
  --canvas:      #EEF1EB;   /* page canvas behind contained heroes/cards */
  --mist:        #DDE3D9;   /* strongest light-alt section */
  --mist-2:      #E5E9E2;   /* audiences section bg (site also uses #E9EDE6 for pricing) */

  /* ---- Lime (the single accent) ---- */
  --lime:        #C8F04D;   /* verified / act / live */
  --lime-hover:  #DBFF75;   /* lime hover (footer CTA hover in v61) */
  --lime-ink:    #11160F;   /* THE ONLY text color on lime (site uses #11160F/#12170F/#10150F) */
  --lime-dark:   #657530;   /* lime-family text on LIGHT backgrounds (from spec v18) */

  /* ---- Text ---- */
  --body:        #151B16;   /* body text on light */
  --muted:       #687269;   /* secondary text on light */
  --muted-dark:  #929B94;   /* secondary text on dark (site range #8F9A91–#A9B2AB) */

  /* ---- Lines ---- */
  --line-paper:  #D4DBD2;   /* hairline on light (site also #CBD2CA, #CCD3CB) */
  --line-dark:   #344037;   /* hairline + border on dark (section hairlines #2A342D) */

  /* ---- Status tints (from design-system-states.css) ---- */
  --st-success-bg:#E5F5DF; --st-success-fg:#285B31; --st-success-line:#B8DDB0;
  --st-warning-bg:#FFF2D9; --st-warning-fg:#76501D; --st-warning-line:#E8CE99;
  --st-missing-bg:#F2E6DC; --st-missing-fg:#8A5432;  /* warm brown — missing evidence */
  --st-danger-bg: #FFF0ED; --st-danger-fg:#8B3328; --st-danger-line:#EFB8B0; /* form errors only */
  --st-info-bg:   #EAF1F7; --st-info-fg:#31556E; --st-info-line:#BFD0DD;
  --st-neutral-bg:#ECEFEB; --st-neutral-fg:#566159; --st-neutral-line:#D2D8D2;
  --st-disabled-bg:#ECEFEB; --st-disabled-fg:#9AA29C;

  /* ---- Focus ---- */
  --focus-ring: 0 0 0 3px rgba(200,240,77,.35);
}
```

Notes:
- The site's v60 isolation layer defines near-duplicate tokens (`--public-lime:#C5F43D`,
  `--public-ink:#101712`, `--public-paper:#F1F3EE`, `--public-muted:#6F7972`). Treat them as
  the SAME tokens — the v1.2.0 spec's rule applies: "Similar greens are not new tokens;
  implementation must map them back to the canonical palette." New builds use the canonical
  values above.
- One-line diff note: app spec `--mist:#DDE3D9`; the site prototype prefers lighter alt
  surfaces `#EEF1EB/#E5E9E2/#E9EDE6` for full sections — site wins on section backgrounds,
  `--mist` remains for the strongest alt band.

### Tailwind config equivalent (`tailwind.config.js` extend)

```js
colors: {
  ink:      '#0A0D0B',
  'ink-2':  '#0B100C',
  panel:    '#111612',
  footer:   '#080B09',
  forest:   { DEFAULT: '#18221A', card: '#172019' },
  paper:    '#F3F5EF',
  canvas:   '#EEF1EB',
  mist:     { DEFAULT: '#DDE3D9', 2: '#E5E9E2' },
  lime:     { DEFAULT: '#C8F04D', hover: '#DBFF75', ink: '#11160F', dark: '#657530' },
  body:     '#151B16',
  muted:    { DEFAULT: '#687269', dark: '#929B94' },
  line:     { paper: '#D4DBD2', dark: '#344037' },
},
```

### Color usage rules

| Token | Use for | NEVER use for |
|---|---|---|
| `--lime` | Primary CTA bg, eyebrow text on dark, status dot + glow, active markers, ✓ marks on dark | Body text, large fills behind long text, more than ONE dominant action per surface |
| `--lime-ink` | Text/icons ON lime — **lime NEVER gets white text** (contract: "Ink on Proof Lime") | Anything not on lime |
| `--lime-dark` (#657530) | Lime-family text on LIGHT bg (✓ marks use #6E8A2D/#729326 in prototype) | Text on dark bg (use `--lime`) |
| `--ink` / `--ink-2` / `--panel` | Dark section bg, header, footer | Text on dark (use white/#F4F6F1) |
| `--forest` / `--forest-card` | Dark cards on light sections, signal blocks, secondary dark buttons | Page-wide backgrounds |
| `--paper` / `--canvas` | Light sections; canvas behind contained heroes | — |
| `--body` #151B16 | Body text on light | Text on dark |
| `--muted` | Secondary text, metadata on light | Headings, primary content |
| `--st-missing-*` | Missing/unknown evidence states — **warm brown, never red**: missing is a workflow state, not a failure | Errors |
| `--st-danger-*` | Form validation errors only | Missing evidence, draw display |
| `--line-dark` #344037 | Borders on dark AND borders of contained hero cards on canvas | — |
| White `#FFFFFF` | Card bg on light sections (`.modern-problem-grid article`), text on dark | Text on lime |

**Absolute rules:**
- Lime NEVER gets white text. Only `--lime-ink` (dark) on lime.
- "No dark primary on dark panels. Lime is the single dominant action." (v1.2.0)
- Missing/unknown = warm brown, never red. Red-family tints are for form errors only.
- No new greens. Map anything similar back to this palette.

---

## 3. Typography

### Font roles

```css
:root {
  --sans:  Manrope, Inter, "Segoe UI", Arial, sans-serif;  /* body, UI, buttons, H1 */
  --serif: Georgia, "Times New Roman", serif;              /* display H2+, leads, serif accents */
  --mono:  "DM Mono", "SFMono-Regular", Consolas, monospace; /* eyebrows, labels, metadata */
  --he:    Heebo, Manrope, sans-serif;                     /* Hebrew localization pass (RTL) */
}
```

Georgia is a system font — nothing to load. Load the rest:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Heebo:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### The three-voice system (this IS the identity — get it exact)

1. **H1 is Manrope, very tight, with a serif `em` accent** for the emotional phrase:
   ```css
   h1 { font-family: var(--sans); font-size: clamp(48px,4.8vw,72px);
        line-height: .96; letter-spacing: -.055em; text-wrap: balance; }
   h1 em { font-family: var(--serif); font-weight: 400; font-style: italic; color: #B6C0B8; }
   ```
   Prototype: "Turn artist activity into *booking-ready proof.*"
   (The pre-v52 homepage ran H1 up to `clamp(58px,6.5vw,104px)/.89` with `-.075em`; the v52
   unified hero contract capped it at `clamp(48px,4.8vw,72px)` — use the v52 values.)

2. **H2 and all section display is Georgia serif, weight 400, never bold:**
   ```css
   h2 { font-family: var(--serif); font-weight: 400;
        font-size: clamp(44px,5.5vw,78px); line-height: .96; letter-spacing: -.055em; }
   /* final-CTA scale: clamp(52px,7vw,94px)/.93, letter-spacing -.06em */
   /* inner-page h2:   clamp(42px,5vw,72px)/1.03 */
   /* card serif h3:   22–31px/1.1–1.2 */
   ```

3. **DM Mono for every eyebrow, label, number and metadata line:**
   ```css
   .eyebrow { font: 700 9px var(--mono); letter-spacing: .12em; text-transform: uppercase; }
   /* on light: color #6C786E · on dark: color var(--lime) or #647068 */
   /* step numbers 01/02/03: font: 600 8px "DM Mono"; metadata/legal: 7–8px */
   ```

### Body and support text

```css
body        { font-family: var(--sans); color: var(--body); }
.lead       { font: 400 17px/1.65 var(--serif); color: #677169; } /* serif leads under H2s; on dark #A9B2AB */
.card-text  { font: 400 13px/1.55 var(--sans); color: var(--muted); }
.faq-answer { font: 400 14px/1.6 var(--serif); color: #647067; }
```

### Type rules (from v1.2.0)

- Serif is display-only: "Never use for small copy."
- Long-form body never shrinks below 16px; marketing card support text may run 12–15px.
- "Metadata never carries meaning alone" — a DM Mono line always accompanies a readable claim.
- Hebrew: Heebo replaces Manrope AND Georgia (no Hebrew serif); DM Mono stays for Latin
  codes/dates. Never invent Hebrew copy — he.js is a separate native-authored pass.

### Tailwind equivalent

```js
fontFamily: {
  sans:  ['Manrope', 'Inter', 'sans-serif'],
  serif: ['Georgia', 'Times New Roman', 'serif'],
  mono:  ['"DM Mono"', 'Consolas', 'monospace'],
  he:    ['Heebo', 'Manrope', 'sans-serif'],
},
fontSize: {
  eyebrow: ['9px',  { letterSpacing: '.12em', fontWeight: '700' }],
  meta:    ['8px',  { letterSpacing: '.08em', fontWeight: '600' }],
  lead:    ['17px', { lineHeight: '1.65' }],
  // display sizes use clamp() — set in CSS
},
```

---

## 4. Layout & rhythm

### Containers & spacing

```css
:root {
  --content: 1120px;                     /* content max-width (site --public-content) */
  --gutter:  clamp(20px, 6vw, 86px);     /* horizontal page gutter */
  --section: clamp(72px, 9vw, 136px);    /* section vertical padding */
  /* the modern-* layer equivalently uses: padding: 110px clamp(22px,7vw,112px) */
}
```

### Breakpoints

App layout contract (v1.2.0): **1440+ · 1024–1439 · 768–1023 · 320–767** —
"12 columns; max canvas 1440px; 24–32px gutters; contextual side region allowed."

Site implementation collapses that into two working media queries (site wins for the site):

| Query | What changes |
|---|---|
| `@media (max-width: 960px)` | Nav → hamburger drawer; all 2/3/4-col grids → 1–2 col; hero grid → stacked (image row above/below copy); heroes margin 18px |
| `@media (max-width: 560px)` | Header 64–66px; gutters 18–22px; sections 72px; hero title 46px; buttons full-width; hero margin 12px, radius 16px |

Plus targeted queries at 600/700/760/900/1100px for individual components.

### Radii scale (governed — "Radius communicates hierarchy, never decoration.")

| Radius | Use |
|---|---|
| **9px** | Controls: buttons, inputs, selects, small icon buttons (`--ds-radius-control:9px`) |
| **13–14px** | Chips-panels, signal blocks, small cards, mobile drawer |
| **15–16px** | Panels, problem cards (`--ds-radius-card:16px`) |
| **17–18px** | Large cards, pricing cards, section images (`--public-radius-md:18px`) |
| **20–22px** | Contained hero stages, proof card (site-only scale) |
| **999px** | Status chips, badges, legal chips |

Never exceed 22px. Never go back to the retired ≤4px flat look.

### The shadow rule

> "Every shadow is paired with a visible boundary." — GIGPROOF Design System v1.2.0

No free-floating shadows. Real pairs from the prototype:

```css
/* contained hero stage */
border: 1px solid #344037; border-radius: 20px;
box-shadow: 0 18px 55px rgba(16,31,20,.08);

/* hero proof card */
border: 1px solid #FFFFFF28; border-radius: 20px;
box-shadow: 0 35px 100px #0009; transform: rotate(1.2deg);

/* card hover */
border-color: #A8B49F; box-shadow: 0 18px 42px #24322812;
/* shared hover token: --ds-shadow-hover: 0 14px 34px #15201917 */
```

### Contained hero contract (v52 — one hero grammar for every page)

> **STATUS: RE-RATIFIED by owner 27 Jul 2026 — one desktop hero height.**
> On desktop (≥1024px) EVERY marketing-page hero renders the ONE shared height
> token `--hero-height-desktop: 620px` (the v52 canon value below), enforced
> ±0px at 1440×900 by `scripts/test-hero-contract.mjs`. The four
> `website-next/styles/hero.css` variants (feature / primary / standard /
> compact) remain as MOBILE-ONLY differentiation (<1024px). Feature
> block-padding on desktop is the v52 canon pad `clamp(48px,5vw,74px)`.

```css
.modern-site { --hero-height:620px; --hero-radius:20px;
               --hero-pad:clamp(48px,5vw,74px); --hero-title:clamp(48px,4.8vw,72px); }
main { background: #EEF1EB; }           /* canvas behind the stage */
.hero-stage { min-height: var(--hero-height); margin: 28px 4vw 0;
              border: 1px solid #344037; border-radius: var(--hero-radius);
              overflow: hidden; box-shadow: 0 18px 55px rgba(16,31,20,.08); }
```

Persona pages split the stage into two half-rounded halves (copy `22px 0 0 22px` + image
`0 22px 22px 0`), stacking at 960px into `18px 18px 0 0` over `0 0 18px 18px`.

### Dark-section pattern (what the prototype ACTUALLY does — no grain)

```css
.section-dark { background: #0B100C; color: #F3F6F2;
                border-top: 1px solid #2A342D; border-bottom: 1px solid #2A342D; }
/* final CTA adds ONE lime glow: */
.section-final { background: radial-gradient(circle at 50% 110%, #C8F04D2B, transparent 42%), #0A0D0B; }
/* hero adds ONE blurred lime orb: */
.hero-glow { position:absolute; width:430px; height:430px; border-radius:50%;
             right:-160px; bottom:-200px; background:#C8F04D22; filter:blur(70px); }
```

The retired grain-texture overlay is gone. Dark sections are flat color + hairlines + at most
one lime light source.

### Homepage section rhythm (reference order from the v63 homepage)

dark contained hero (photo + proof card) → paper "visibility gap" (2-col tension) → dark
method band (photo + numbered 01–03 list) → mist audiences (persona image + 3 view cards) →
**lime control section** (the one full-lime moment) → paper pricing teaser → paper FAQ →
dark final CTA → footer `#080B09`.

---

## 5. Copy voice

### Rules

1. **Eyebrow style:** DM Mono, ALL CAPS, `·` middle-dot separators, protective/factual:
   `PRE-BOOKING INTELLIGENCE FOR LIVE MUSIC` · `ONE ARTIST · THREE INTELLIGENT VIEWS` ·
   `YOUR CAREER · YOUR CONTROL` · `DIRECT ANSWERS` · `CLOSED BETA · ISRAEL` ·
   `FOR ARTIST MANAGERS` · `THE OUTCOME`.
2. **Headline register:** serif, short, declarative, present tense. Often a two-beat
   contrast where the second beat is the serif-italic `em`. Verbs of agency: Turn, See,
   Approve, Start, Understand, Prepare, Show, Make.
3. **The reader is protected, never scored.** Every product claim carries its limits nearby.
4. **Method-labeled proof:** every proof mention names source + method + freshness:
   "Supported by ticket-system exports", "Method and context visible",
   "Producer-confirmed · reviewed 26/06/2026", "Reviewed DD/MM/YYYY", "recorded privately",
   "Public claims show source, method, freshness and artist approval."
5. **Personas named separately, never merged:** artists · artist managers · event producers.
   In Hebrew: `אמרגן` and `מפיק` are NEVER merged into one term. Never use "ראשים".
6. **Banned words (EN):** score, rank, ranking, percentile, leaderboard, rating, guarantee,
   prediction, predictive, "bookability %", "top artists", gauge. Allowed framing instead:
   bands/ranges ("180–300 capacity"), binaries (confirmed / not confirmed), method-safe text.
7. **Status vocabulary (from the manager desk):** Pitchable · supported · Needs confirmation ·
   Needs action · Current · Context verified. Never numeric.

### Protective microcopy — verbatim reference set (reuse as-is)

- "GIGPROOF does not publish rank, percentile, booking probability or popularity leaderboards."
- "No booking, ticket-sales or popularity prediction."
- "No universal artist score, rank or percentile."
- "What GIGPROOF does not claim." (section heading on Methodology)
- "Compare signals inside the right genre, format, territory and career stage—not a universal artist rank."
- "Present a professional story without publishing private gaps or raw values."
- "Professional proof without taking control from the artist."
- "Only supported strengths selected and approved by the artist. Raw files, exact private values, gaps and internal recommendations remain private."
- "Artists control what they share." (footer, every page)
- Any draw/claim display must also carry the standing disclaimer: it "does not predict or
  guarantee a booking outcome."

### Reference copy blocks (quoted verbatim from the v63 pages — the standard to match)

**Homepage hero:**
> Eyebrow: `Pre-booking intelligence for live music`
> H1: "Turn artist activity into *booking-ready proof.*"
> Lead: "GIGPROOF connects music, audience, live activity and career assets into a private
> growth Radar and a professional Passport—helping artists improve and helping the industry
> understand their value."
> CTAs: **Start my private Radar** · **Evaluate an example Passport**
> Confidence strip: "See your position in the right context" · "Approve every professional
> claim" · "Turn proof into the next useful action"

**Hero proof card (the product shown as evidence):**
> `BOOKABILITY PASSPORT` — Maya Vale *(canonical demo-persona name, owner ruling 21 Jul 2026 —
> supersedes the "Lior Noy" sample name quoted verbatim in this block since its authoring; the
> live site (`website-next/app/page.tsx`) still renders "Lior Noy" as of this doc-hygiene pass —
> flagged for the site-build task to rename, see docs/SESSION-MEMORY.md)* — "Live electronic
> artist · Tel Aviv" — chip: "Reviewed 29/06/2026"
> `ATTRIBUTED DRAW` — "Repeat ticket activity across three club dates" — "180–300 capacity
> electronic events · March–June 2026" — "**Supported by ticket-system exports** / Method and
> context visible"
> `COMMERCIAL SIGNAL` — "Invited back for a second headline date" — "Producer-confirmed ·
> reviewed 26/06/2026"
> CTA: **Open the professional view**

**The visibility gap (problem section):**
> Eyebrow: `THE VISIBILITY GAP`
> H2: "Talent is visible. *Professional value often is not.*"
> Lead: "Music, followers, live history, communities, media and professional assets live in
> different places. The complete artist story is hard to see—and even harder to communicate
> at the right moment."
> Tension lines: "**Artists** cannot clearly see what is helping or holding them back." /
> "**Managers** struggle to demonstrate readiness and momentum." / "**Producers** need a
> faster way to understand relevance for an event."

**Artist control (the lime section):**
> Eyebrow: `YOUR CAREER · YOUR CONTROL`
> H2: "Show your value without giving everything away."
> Lead: "Your private workspace helps you improve. Your professional Passport presents a
> focused story for the people considering you for an opportunity. You decide when it is
> ready to share."
> Cards: "You choose the view" · "Useful professional context" · "Stronger conversations" ·
> "Always ready to update"

**Manager persona page:**
> Eyebrow: `FOR ARTIST MANAGERS`
> H1: "Turn roster development into a stronger market story."
> Lead: "See which artists are gaining professional strength, where important assets are
> missing and how each Passport can support a more persuasive booking conversation."
> Capability card (note the built-in firewall): "See each artist's current evidence,
> positioning, authority and outstanding decisions **without flattening the roster into a
> score.**"
> FAQ: "Does the manager own the artist data?" → "No. The artist remains the proof owner.
> Management access, approval and commercial authority are recorded separately."
> Final CTA: "Make every introduction easier to understand."

**Final CTA + footer:**
> H2: "Understand your context. Approve your proof. Start the right conversation."
> Footer lead: "Make the next booking conversation easier to trust." — "Pre-booking
> intelligence for independent artists and the professionals evaluating them."
> Footer bottom (DM Mono): "Built for better live-music booking conversations." ·
> "Artists control what they share." · "© 2026 GIGPROOF"

**FAQ positioning answer (category firewall):**
> "Is GIGPROOF an EPK or booking marketplace?" → "No. An EPK presents creative materials and
> a marketplace lists talent. GIGPROOF helps artists understand, improve and present the
> professional signals around their music, audience and live career."

---

## 6. Imagery direction

### Asset inventory (master library)

Masters: `…\Screens By Codex\BRANDING AND DESIGN SYSTEM\02_ASSETS\`
Runtime copies: `…\Screens By Codex\PUBLIC WEBSITE\assets\` (same 24 files).
Ship `.webp` (54–125 KB); `.png` are masters. Measured dimensions:

| File | Size (px) | Ratio | Role |
|---|---|---|---|
| `gigproof-live-hero.png/.webp` | 1774×887 | 2:1 | Homepage hero background (under ink gradient) |
| `gigproof-artist-ecosystem.png/.webp` | 1774×887 | 2:1 | 3-panel strip — persona page hero image via `background-size:300% 100%` + `background-position` left/center/right |
| `gigproof-evidence-review.png/.webp` | 1672×941 | 16:9 | Method section visual ("Artist and producer reviewing live-performance evidence") |
| `gigproof-persona-artist-v1.png/.webp` | 1672×941 | 16:9 | Artist persona / audiences section |
| `gigproof-persona-manager-v1.png/.webp` | 1672×941 | 16:9 | Manager persona (og:image for /managers) |
| `gigproof-persona-producer-v1.png/.webp` | 1672×941 | 16:9 | Producer persona |
| `artist-dj-club-v1.png` | 1122×1402 | 4:5 | Artist-type art (feature cards) |
| `artist-dj-festival-v1.png` | 1122×1402 | 4:5 | Artist-type art |
| `artist-dj-open-format-v1.png` | 1122×1402 | 4:5 | Artist-type art |
| `artist-live-electronic-v1.png` | 1122×1402 | 4:5 | Artist-type art |
| `artist-live-band-v1.png` | 1122×1402 | 4:5 | Artist-type art |
| `maya-vale-passport-hero-v2.png` | 1672×941 | 16:9 | Demo-artist Passport hero (Maya Vale) |
| `maya-vale-live-proof-v2.png` | 1672×941 | 16:9 | Demo-artist live-evidence visual |
| `maya-vale-profile-v2.png` | 1254×1254 | 1:1 | Demo-artist identity portrait |
| `shidapu-goa-atmosphere-hero-v1.png/.webp` | 1672×941 | 16:9 | Genre-atmosphere hero |
| `shidapu-roy-sason-profile-official-v1.jpg` | portrait | ~1:1 | Official profile photo |
| `gigproof-icons.svg` | 24×24 grid | — | 18-symbol icon sprite (below) |

### Ratio spec (v1.2.0, verbatim)

- "16:9 hero, 4:5 features, 1:1 roster; art-directed focal point."
- "4:5 feature, 3:2 evidence, 1:1 identity; safe crop stored per asset."
- Evidence previews: "3:2 preview with source, date and status beside it."
- Portraits: "Face toward camera, eyes visible and recognizable. 1:1 master crop with safe
  space for circular and rounded-square treatments."

### The overlay rule (non-negotiable)

> "Media backgrounds always receive a protective overlay before controls are introduced."
> "**Minimum 70% ink protection beneath labels and controls.**" — v1.2.0

Prototype recipes (reuse):

```css
/* homepage hero — copy sits on the ≥70%-ink side */
background: linear-gradient(90deg, #090C0A 0%, #0A0D0BE8 48%, #0A0D0B3D 100%),
            url('/assets/gigproof-live-hero.webp') center/cover;
/* image cards with caption at bottom */
.img-frame::after { content:''; position:absolute; inset:0;
  background: linear-gradient(0deg, #07100BD9, transparent 55%); }
/* persona hero image */
background-image: linear-gradient(0deg, #0B100CA8, transparent 55%), url(…);
```

### Grading — imagery lives inside the green identity

Every photo is graded toward the palette in CSS (values from the prototype):

```css
img { filter: saturate(.70) contrast(1.08); }   /* dark sections: .55–.75 */
img { filter: saturate(.78–.82) contrast(1.03–1.06); }  /* light sections / portraits */
```

Never place an ungraded full-color photo on a marketing surface. Never blur a private image
as a treatment — "Do not blur the actual image. Replace it completely and label the privacy
boundary." (v1.2.0)

### Which image family when

| Family | Use when |
|---|---|
| Heroes / atmosphere (16:9, 2:1) | Page-level mood: homepage hero, method band, product-page figures |
| Persona imagery (16:9) | Persona pages + audiences section — one persona per surface, captioned in DM Mono caps |
| Artist-type art (4:5) | Feature cards, artist-type explanations, editorial grids |
| Identity portraits (1:1) | Roster/identity contexts, demo-artist profile, proof-card avatars |
| Evidence stills (3:2) | Evidence thumbnails WITH source + date + status beside them |

Marketing imagery "never signals verification state" — a photo is mood; verification is
always a labeled text chip.

### Icon system — `gigproof-icons.svg` (18-symbol sprite)

IDs: `gp-artist` `gp-manager` `gp-producer` `gp-radar` `gp-passport` `gp-evidence` `gp-live`
`gp-audience` `gp-booking` `gp-growth` `gp-opportunity` `gp-introduction` `gp-source`
`gp-lock` `gp-approved` `gp-warning` `gp-search` `gp-arrow`.

Symbols carry no stroke attributes — style at the use site, exactly as the prototype does:

```html
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <use href="/assets/gigproof-icons.svg#gp-evidence"/>
</svg>
```

Rules: stroke 1.8, round caps/joins, `currentColor`, no fills. Render 16–24px; touch target
still 44px. The `gp-radar` glyph (concentric circles + sweep) is the approved 24px PRODUCT
MARK only — any Radar DATA display on the site is linear (list/rows), never a dial (see §10).

---

## 7. Component patterns

Use the prototype's own class names where they exist (`modern-*`, `persona-*`, `gp-status`,
`proof-unit`) so site CSS stays diff-able against the source.

### 7.1 Header / navbar (`.modern-header`)

```css
.modern-header { position: sticky; top: 0; z-index: 1000; height: 76px;
  padding: 0 clamp(22px,5vw,80px); display: flex; align-items: center; gap: 42px;
  background: rgba(8,13,10,.96); border-bottom: 1px solid rgba(126,145,132,.2);
  box-shadow: 0 1px 0 rgba(0,0,0,.18); backdrop-filter: blur(16px); }
.modern-brand span { width: 34px; height: 34px; display: grid; place-items: center;
  border-radius: 10px; background: var(--lime); color: #12170F;
  font-size: 9px; font-weight: 900; }          /* "GP" block mark */
.modern-header nav a { color: #9CA59E; font-size: 10px; padding: 10px 0; }
.modern-header nav a:after { /* lime underline sweep on hover */
  content:''; position:absolute; left:0; right:100%; bottom:3px; height:1px;
  background:var(--lime); transition:right .2s; }
.modern-header nav a:hover:after { right: 0; }
```

Nav structure (v63): dropdown `<details class="nav-menu">` groups — **Solutions** (For
artists / For managers / For producers) and **Product** (Artist Context Radar / Bookability
Passport / How GIGPROOF works) + Pricing + Trust. Actions: language `<select>` (EN active;
HE/RU/DE "— soon"), ghost **Sign in**, lime **Start free →**. ≤960px: hamburger
(`aria-expanded`) opens a rounded `#0C100DF7` panel, `max-height:calc(100vh - 92px)`.

### 7.2 Buttons

```css
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  min-height: 46px; padding: 0 18px; border: 0; border-radius: 9px;
  font: 800 10px var(--sans); cursor: pointer;
  transition: background-color .18s ease, border-color .18s ease,
              color .18s ease, transform .18s ease; }
.btn-primary { background: var(--lime); color: var(--lime-ink); }   /* hero/footer: 48px */
.btn-primary:hover { filter: brightness(1.04); box-shadow: 0 10px 28px #7EA6243B;
                     transform: translateY(-1px); }
.btn-dark   { background: #172019; color: #FFF; }                   /* secondary on light */
.btn-ghost-dark { background: #111612C7; border: 1px solid #FFFFFF32; color: #FFF; } /* on dark */
.btn-ghost-light { background: transparent; border: 1px solid #C8CEC7; color: #172019; }
.btn:not(:disabled):active { transform: translateY(1px) scale(.99); }
```

App contract reference: `.ds-btn` = height 48, radius 9, weight 800, lime bg, ink text.
Buttons usually end with the 18px `gp-arrow` stroke icon. One lime button per surface.

### 7.3 Badge / status chip (`.modern-badge`, `.gp-status`)

```css
.modern-badge { display: inline-flex; align-items: center; gap: 9px;
  border: 1px solid #FFFFFF22; border-radius: 999px; padding: 8px 12px;
  background: #111713AD; color: #C3CBC4;
  font: 600 8px var(--mono); letter-spacing: .08em; text-transform: uppercase; }
.modern-badge i { width: 7px; height: 7px; border-radius: 50%;
  background: var(--lime); box-shadow: 0 0 16px var(--lime); }  /* the live dot */

.gp-status { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px;
  border: 1px solid transparent; border-radius: 999px; line-height: 1;
  font: 600 8px var(--mono); }
.gp-status::before { content:''; width: 6px; height: 6px; border-radius: 50%;
  background: currentColor; }
.gp-status.fresh, .gp-status.strong { background: var(--st-success-bg);
  color: var(--st-success-fg); border-color: var(--st-success-line); }
.gp-status.developing { background: var(--st-warning-bg); color: var(--st-warning-fg);
  border-color: var(--st-warning-line); }
.gp-status.missing { background: var(--st-missing-bg); color: var(--st-missing-fg); }
.gp-status.neutral { background: var(--st-neutral-bg); color: var(--st-neutral-fg);
  border-color: var(--st-neutral-line); }
```

Chip text is always words + dates ("Reviewed 29/06/2026", "Context verified", "Needs
action") — never numbers alone. "Interaction state and evidence state are separate axes.
Loading never changes the underlying verification status." (v1.2.0)

### 7.4 Proof unit (core display unit — anatomy unchanged, CODEX skin)

Anatomy (in order) — unchanged from v1 of this doc:

```
Header: "Club 45 · Tel Aviv · Jan 2026 · VRF-401"     (DM Mono, muted)
Row 1: CLAIM    │ [band-pill: 70–100]
Row 2: CONTEXT  │ Standalone · cap 180 · Tuesday
Row 3: METHOD   │ ✓ Confirmed by producer · Shai Levi
Row 4: VRF      │ VRF-401
```

```css
.proof-unit { border: 1px solid var(--line-paper); border-radius: 15px;
  background: #FFF; overflow: hidden;
  transition: border-color .18s ease, box-shadow .18s ease; }
.proof-unit:hover { border-color: #AEB9AE; box-shadow: 0 12px 30px #18221910; }
.pu-header { padding: 12px 18px; background: var(--st-neutral-bg);
  font: 600 8px var(--mono); letter-spacing: .08em; color: var(--muted);
  border-bottom: 1px solid var(--line-paper); }
.pu-row { display: flex; gap: 16px; padding: 13px 18px;
  border-bottom: 1px solid #E3E8E1; }
.pu-row:last-child { border-bottom: none; }
.pu-label { font: 600 8px var(--mono); letter-spacing: .10em; text-transform: uppercase;
  color: var(--muted); width: 62px; flex-shrink: 0; padding-top: 2px; }
.pu-value { font-size: 13px; color: var(--body); flex: 1; }
.pu-method { font: 500 10px var(--mono); color: var(--st-success-fg); } /* method = words */
```

**Firewall rule (unchanged):** the band-pill inside a proof-unit is ALWAYS a range
(`60–100`), never a single number, never a gauge, never colored by value.

### 7.5 Band pill

```css
.band-pill { display: inline-flex; align-items: center;
  font: 500 13px var(--mono); letter-spacing: .04em;
  background: var(--forest); color: var(--paper);
  padding: 4px 12px; border-radius: 999px; }
.band-pill-lg { font-size: 40px; padding: 10px 24px; border-radius: 18px; }
```

Values are always a band: `60–100`, `50–150`, `80–120` — never `87`, never `87%`, never
`87/100`. In running copy, bands appear inline as plain context, exactly like the prototype:
"180–300 capacity electronic events · March–June 2026".

### 7.6 Hero proof card (`.modern-proof-card`) — the product-as-evidence visual

```css
.modern-proof-card { background: #F1F3ED; color: #151B16;
  border: 1px solid #FFFFFF28; border-radius: 20px; padding: 22px;
  box-shadow: 0 35px 100px #0009; transform: rotate(1.2deg); }  /* none ≤960px */
.proof-card-head { display: flex; justify-content: space-between; gap: 15px;
  padding-bottom: 18px; border-bottom: 1px solid #D8DCD6; }
.modern-signal { margin-top: 14px; background: #18221A; color: #FFF;
  border-radius: 13px; padding: 20px; }
.modern-signal > small { font: 600 7px var(--mono); color: var(--lime); } /* ATTRIBUTED DRAW */
.modern-signal h3 { font: 400 22px/1.2 var(--serif); margin: 12px 0; }
.modern-signal.compact { background: #E4E8E1; color: #172018; }
```

### 7.7 Section intro (`.modern-section-intro`)

```css
.modern-section-intro > small { font: 600 8px var(--mono); letter-spacing: .12em;
  color: #6C786E; text-transform: uppercase; }   /* lime on dark sections */
.modern-section-intro h2 { font: 400 clamp(44px,5.5vw,78px)/.96 var(--serif);
  letter-spacing: -.055em; margin: 16px 0 24px; max-width: 1000px; text-wrap: balance; }
.modern-section-intro > p { max-width: 720px; font: 400 17px/1.6 var(--serif); color: #677169; }
```

### 7.8 Card grids

```css
/* Problem grid — 3-col white cards on paper */
.modern-problem-grid { display: grid; grid-template-columns: repeat(3,1fr);
  gap: 10px; margin-top: 55px; }
.modern-problem-grid article { position: relative; min-height: 310px; padding: 28px;
  border: 1px solid #D5DAD4; border-radius: 16px; background: #FFF;
  transition: transform .2s, border-color .2s, box-shadow .2s; }
.modern-problem-grid article:hover { transform: translateY(-4px);
  border-color: #A8B49F; box-shadow: 0 18px 42px #24322812; }
/* card anatomy: DM Mono number top-left, icon top-right, title pushed down (margin-top
   ~115px), support text 12-13px muted — "editorial card with air" */

/* Audience cards — 3-col, one dark artist card with lime accents */
.audience-cards article { min-height: 410px; padding: 28px; border-radius: 17px;
  background: #F7F8F5; display: flex; flex-direction: column; }
.audience-cards article.artist-card { background: #1A241C; color: #FFF; }
.audience-cards .artist-card > span { color: var(--lime); }
.audience-cards h3 { font: 400 31px/1.12 var(--serif); }
.audience-cards li::before { content: '✓'; color: #6E8A2D; margin-right: 8px; }
.audience-cards .artist-card button { background: var(--lime); color: #12180F; }

/* Numbered step list (method) — hairline rows, DM Mono lime numbers */
.method-list article { display: grid; grid-template-columns: 38px 1fr; gap: 15px;
  padding: 16px 0; border-top: 1px solid #303731; }
.method-list article > span { font: 600 8px var(--mono); color: var(--lime); } /* 01 02 03 */

/* Onboarding 4-step ol — columns divided by hairlines, not boxes */
.modern-onboarding ol { display: grid; grid-template-columns: repeat(4,1fr);
  border-top: 1px solid #CBD2CA; }
.modern-onboarding li { padding: 24px; border-right: 1px solid #CBD2CA; }
```

### 7.9 Lime control section (`.modern-control`) — the ONE full-lime surface

```css
.modern-control { display: grid; grid-template-columns: .85fr 1.15fr; gap: 8vw;
  background: var(--lime); color: #11160F; padding: 110px clamp(22px,7vw,112px); }
.modern-control > div > small { color: #43532B; }        /* eyebrow on lime */
.modern-control > div > p { font: 400 16px/1.6 var(--serif); color: #405032; }
.modern-control button { background: #11160F; color: #FFF; }   /* dark btn on lime */
.control-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: #91AE3D; }                                   /* hairlines via gap-bg */
.control-grid article { background: var(--lime); padding: 25px; }
```

All text on lime is dark (#11160F / #43532B / #405032). Maximum one such section per page.

### 7.10 FAQ accordion (`.modern-faq` — native details/summary)

```css
.modern-faq details { border-top: 1px solid #C8CEC7; }
.modern-faq summary { list-style: none; display: flex; justify-content: space-between;
  gap: 20px; padding: 20px 0; font: 700 14px/1.35 var(--sans); cursor: pointer; }
.modern-faq summary::-webkit-details-marker { display: none; }
.modern-faq details p { font: 400 14px/1.6 var(--serif); color: #647067;
  padding: 0 40px 20px 0; }
.modern-faq details[open] { background: #FFF; border-radius: 10px;
  padding: 0 14px; margin: 0 -14px; box-shadow: 0 8px 24px #1822190B; }
.modern-faq details[open] summary span { transform: rotate(45deg); }  /* the + icon */
```

### 7.11 Pricing cards (`.pricing-grid`)

3-col; light cards `#F8FAF6`, border `#CCD3CB`, radius 18; serif price `48px/1 Georgia`;
✓ rows with `#6D9025` marks; `.featured-plan` = dark `#172019`, lime button, lifted
`translateY(-12px)` + `box-shadow 0 24px 60px #14201824`; `.plan-badge` = lime-on-`#29342B`
DM Mono pill. Producer row (`.producer-access`): icon chip `#DFF19F`, outline button —
producers review shared Passports free.

### 7.12 Footer (`.modern-footer-v2`)

```css
.modern-footer-v2 { padding: 54px clamp(22px,7vw,112px) 28px;
  background: #080B09; color: #F2F5EF; border-top: 1px solid #263027; }
/* rows: footer-lead (brand + serif H2 + lime CTA) → footer-links (4 cols:
   Product / Solutions / Trust & legal / Access + language select) → footer-bottom */
.footer-lead h2 { font: 400 clamp(38px,4.5vw,68px)/1.02 var(--serif); letter-spacing: -.05em; }
.footer-links a { color: #A5AFA7; font-size: 11px; }  .footer-links a:hover { color: var(--lime); }
.footer-legal em { padding: 4px 6px; border: 1px solid #323C34; border-radius: 999px;
  font: 500 7px var(--mono); font-style: normal; }     /* legal status chips */
.footer-bottom { border-top: 1px solid #263027; padding-top: 22px;
  font: 500 8px var(--mono); color: #626C64; }
```

Footer always carries: Trust & legal column (Artist control · Privacy · Terms ·
Accessibility · Cookie policy), the no-guarantee line, "Artists control what they share.",
and the language select with disabled "coming soon" locales.

### 7.13 Persona page scaffold (from the For_* pages)

Order: split contained hero (copy half `#0B120D` + image half) → `persona-proof-strip`
(3 numbered principles) → `persona-capabilities` (dark `#0B120D`, 3 cards, hairline
`#334039`) → `persona-product-paths` (light `#EEF1EB`, 2 path cards, last card dark) →
`persona-product-preview` (framed product mock, `border:1px solid #354139`,
`box-shadow:0 30px 80px rgba(10,18,13,.18)`) → `persona-answer-section` (FAQ) →
`persona-final-cta` (lime radial glow + serif `clamp(52px,7vw,94px)/.93` + lime CTA).

### 7.14 Forms (site inputs/selects)

```css
.form-label { font: 600 9px var(--mono); letter-spacing: .08em;
  text-transform: uppercase; color: var(--muted); }
.form-input, .form-select, .form-textarea { width: 100%; min-height: 44px;
  padding: 0 12px; border: 1px solid #AEB8AF; border-radius: 9px;
  background: #FFF; color: var(--body); font: 400 13px var(--sans);
  transition: border-color .18s ease, box-shadow .18s ease; }
.form-input:focus-visible { outline: 3px solid var(--lime); outline-offset: 3px; }
.form-input:disabled { background: var(--st-disabled-bg); color: var(--st-disabled-fg);
  cursor: not-allowed; }
/* error state: border/bg from --st-danger-*; alert block radius 10px with b + small */
/* dark selects (header/footer): bg #0D130F, border #344037, color #EEF3EF */
```

---

## 8. Interaction & motion

The universal interaction contract, verbatim from `design-system-states.css` (v1.2.0 family):

```css
/* transitions — one speed everywhere */
button, a, summary { transition: background-color .18s ease, color .18s ease,
  border-color .18s ease, box-shadow .18s ease, transform .18s ease, opacity .18s ease; }
/* narrative spec: "180–240ms layout transitions; hover feedback available." */

/* press */
button:not(:disabled):active { transform: translateY(1px) scale(.99); }

/* focus — SITE version uses lime (app internally uses a blue mix; site wins here) */
:is(button,a,input,select,textarea,summary):focus-visible {
  outline: 3px solid var(--lime); outline-offset: 3px; }

/* disabled */
button:disabled, [aria-disabled="true"] { cursor: not-allowed !important;
  opacity: .48; filter: saturate(.45); box-shadow: none !important;
  transform: none !important; }

/* hover lifts (always paired with border change) */
.card:hover { transform: translateY(-4px); border-color: #A8B49F;
  box-shadow: 0 18px 42px #24322812; }   /* path buttons -5px; audience cards -6px */

/* skeleton shimmer — content loading is ALWAYS skeleton, never a spinner */
.skeleton { position: relative; overflow: hidden; background: #E5E9E3 !important;
  color: transparent !important; border-color: transparent !important; }
.skeleton::after { content: ''; position: absolute; inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, #FFFFFFA3, transparent);
  animation: ds-shimmer 1.35s infinite; }
@keyframes ds-shimmer { to { transform: translateX(100%); } }

/* motion & contrast safety */
@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto !important; animation-duration: .01ms !important;
      animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
@media (prefers-contrast: more) { button, input, textarea, article { border-width: 2px; } }
```

Rules:
- "Skeleton mirrors final layout" / "Skeletons preserve final geometry." Empty states
  "explain why, what belongs here and the single next action."
- "Reduced-motion removes transform and preserves state change."
- Touch targets: "Minimum target: 44×44px in production, even when the visible icon is
  16–20px. Tooltip never replaces an accessible name." (Mobile buttons min-height 42–44px.)
- The only permitted spinner is the 6px dot inside `.gp-status.loading` — never for content.
- Primary hover: `filter:brightness(1.04)` + lime-tinted shadow `0 10px 28px #7EA6243B` +
  `translateY(-1px)`.
- Nav links get the lime underline sweep (left→right, `.2s`), not color-only hover.

---

## 9. RTL / LTR

**English is PRIMARY and the default (LTR).** Hebrew is a secondary, native-authored
localization pass (RTL). Never invent Hebrew strings.

```html
<html lang="en">                    <!-- default -->
<html dir="rtl" lang="he">          <!-- Hebrew pages only, when he strings are delivered -->
```

**Rule (kept from v1): prefer CSS logical properties everywhere** so RTL/LTR flips
automatically without conditional rules:

- `margin-inline-start` instead of `margin-left`
- `padding-inline-end` instead of `padding-right`
- `border-inline-start` instead of `border-left`
- `inset-inline-start` instead of `left`
- `text-align: start` instead of `text-align: left`

Directional exceptions that must be hand-checked in RTL: the split persona hero
(copy-half/image-half order), the nav underline sweep direction, `gp-arrow` icons (mirror
them), and `padding: 0 40px 20px 0` shorthands in FAQ (rewrite with logical properties).
In Hebrew, font stack switches to Heebo (see §3); DM Mono stays for Latin codes and dates.

---

## 10. Firewall enforcement in CSS

These CSS patterns are **FORBIDDEN** — if the site agent generates them, reject and rewrite:

```css
/* ❌ FORBIDDEN — these classes must never exist */
.score-ring { }           /* circular score visual */
.score-gauge { }          /* fill bar / gauge */
.progress-ring { }        /* any ring/arc */
.rating-bar { }           /* fill bar */
.bookability-pct { }      /* percentage display */
.rank-badge { }           /* rank or percentile */
.fill-bar { }             /* any completion fill */

/* ❌ FORBIDDEN CSS properties on any draw-related element */
stroke-dashoffset: ...;   /* SVG arc fill */
clip-path: circle(...);   /* gauge cutout */
background: linear-gradient(var(--pct), ...); /* fill progress */
```

These `data-` attributes are **FORBIDDEN** on any element:
```html
data-score="..."
data-pct="..."
data-fill="..."
data-rank="..."
```

**Additional radial bans (canon: Radar is LINEAR, never radial):**

```css
/* ❌ FORBIDDEN — the radial family, by any name */
.radar-dial { }           /* radar as a dial/sweep */
.radar-orbit { }          /* orbiting-signals decoration */
.radar-core { }           /* central-circle radar hub */
.twelve-web { }           /* 12-axis spider/web chart */
.readiness-ring { }       /* readiness/completeness ring */
.spider-chart, .polar-chart, .gauge-arc { }

/* ❌ FORBIDDEN on any data/score-adjacent element */
conic-gradient(...)       /* dial fills */
transform: rotate(calc(var(--value) * ...))  /* needle positioning */
```

Notes:
- The site prototype's homepage CSS contains a decorative `.transformation-radar` /
  `.radar-orbit` / `.radar-core` visual. It is NOT rendered on the shipped v63 homepage and
  it violates canon — do NOT port it. Radar is always presented as a linear feed (rows/list).
- The 24px `gp-radar` sprite glyph is the approved product mark and is exempt at icon size.
- Draw is shown ONLY as bands + binaries with method labels. Band pills are ranges
  (`60–100`), never a number, never a gauge, never colored by value.
- Standing delete rule: anything %-displayed or score-adjacent → delete on sight, never ask.

---

## 11. Build checklist

Before shipping any page, verify:

**Identity**
- [ ] No retired-identity values anywhere: no `#5B3FD6`, no Archivo Black, no Space Mono,
      no 2px-radius flat system, no grain overlays
- [ ] Fonts loaded: Manrope + DM Mono (+ Heebo when Hebrew ships); Georgia via system stack
- [ ] Display headings are Georgia weight 400 (never bold), tracking ≈ −.055em
- [ ] Eyebrows/metadata are DM Mono caps with `·` separators
- [ ] Radius scale respected: controls 9px · cards 13–18px · heroes 20–22px · chips 999px;
      nothing over 22px
- [ ] Lime appears as ONE dominant action per surface; every lime fill has dark text
      (`#11160F` family) — **never white on lime**
- [ ] Every shadow is paired with a visible border ("Every shadow is paired with a visible
      boundary")
- [ ] Dark sections: flat ink + hairlines + at most one lime glow; no grain, no noise
- [ ] Photos graded (`saturate(.7–.82) contrast(1.03–1.08)`) with ≥70% ink protection under
      any label/control

**Copy & firewall**
- [ ] No score/rank/percentile/leaderboard/prediction/guarantee language (EN or HE);
      no "ראשים" anywhere in HE strings
- [ ] `אמרגן` and `מפיק` are never merged into one term; artists / artist managers / event
      producers always named separately
- [ ] Band pills always show a range (`60–100`) — never a single number
- [ ] Method label always visible alongside any claim ("Supported by …", "Producer-confirmed
      · reviewed DD/MM/YYYY")
- [ ] Protective microcopy present: no-prediction/no-guarantee line on any draw/Passport
      surface; "Artists control what they share." in footer
- [ ] Passport-demo disclaimer banner is undismissable
- [ ] No radial/dial/ring/web visualization anywhere (§10) — Radar shown linear only

**Structure & behavior**
- [ ] `<html lang="en">` default (LTR); Hebrew pages use `dir="rtl" lang="he"` only when
      native-authored strings exist
- [ ] Logical CSS properties used for all directional spacing/borders
- [ ] Focus visible: 3px lime outline, offset 3px, on ALL interactive elements
- [ ] Press state `translateY(1px) scale(.99)`; disabled `opacity:.48 saturate(.45)`
- [ ] Touch targets ≥44px; mobile buttons min-height 42–44px
- [ ] `prefers-reduced-motion` and `prefers-contrast:more` blocks present
- [ ] Loading = skeleton shimmer mirroring final layout — no spinners
- [ ] **WhatsApp test (390px):** passport-demo renders without horizontal scroll; band-pill-lg
      centered; proof-units single-column; all text readable
- [ ] Breakpoints behave at 960px and 560px (grids collapse, hamburger appears, hero stacks)
- [ ] Images ship as `.webp` with explicit `width`/`height` attributes and meaningful `alt`
- [ ] Icons via `gigproof-icons.svg` sprite — stroke 1.8, currentColor, round caps
- [ ] Contact/waitlist forms: static `handleSubmit(event)` stub unless a backend is specified
- [ ] `netlify.toml` does NOT exist (Vercel only)
