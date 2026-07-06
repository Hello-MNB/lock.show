# GIGPROOF Website Architecture
> **V1 LAUNCH BRIEF** — updated 06 Jul 2026
> Brief for Codex: Build the public marketing website from scratch.
> Source of truth: this doc + `WEBSITE-DESIGN-SYSTEM.md` + Drive build brief (File `1QPdZM5WdhTB2WO0gCfPUV6nzIwiKtl_X`).
> Do NOT reference old HTML prototypes or Base44 era screens.

---

## 0. Overview

The public marketing website is a **multi-page static site** (no build tool, no framework).
It lives in `/website/` — **separate Vercel project** from the React/Vite app (Q1 decision).

Stack: **Raw HTML5 + CSS (single `styles.css`) + vanilla JS** — no bundler, no npm.

### 0.1 Open Decision Log

| ID | Decision | Status | Notes |
|---|---|---|---|
| D-009 | **React / Next.js vs Raw HTML for marketing site** | ✅ **CLOSED: Next.js (App Router)** — 06 Jul 2026 | New Next.js project for public marketing website. React+Vite app stays as-is. Two Vercel projects: gigproof.co (Next.js marketing) + app.gigproof.co (React+Vite app). See `docs/WEBSITE-BUILD-CANON.md §1` for full framework rationale. |
| D-008 | hreflang + locale URLs | OPEN | Scaffold only at launch. URL-based `/en/` `/he/` when HE ships. |
| D-005 | Passport pages noindex | OPEN | Default noindex until policy approved. |

### 0.2 Maria's Approved Decisions (06 Jul 2026)

| # | Decision |
|---|---|
| ✅ APPROVED | **Pricing page** — include `/pricing` in site map |
| ✅ APPROVED | **Radar page** — include `/radar` AS IS as a draft (content to be updated later) |
| ✅ APPROVED | **Full page hierarchy** — all topics get their own full page, proper HTML structure, SEO schema per page type |
| ✅ APPROVED | **Design direction** — current visual style is approved direction (not final, brand system to be refined) |
Fonts: Google Fonts CDN (Heebo, Archivo Black, Space Mono).
Deployed: **Separate Vercel static project** (not same project as the app).
App URL (for CTAs): `https://v6-b4-artist-pre-booking-intelligen.vercel.app`

**Q6 DECISION — EN SHIPS FIRST:**
- English is the launch language. HE/RU/DE added after Maria approves EN version.
- Build lang-toggle UI in Step 1 but stub non-EN strings with EN text initially.
- Default HTML: `<html lang="en" dir="ltr">` on all pages at launch.
- `dir="rtl"` activates only when user switches to HE via lang-btn.

**Contact form:** mailto link only — no backend. Clicking send opens the user's email client (Q2 decision).
**Pricing / CTAs:** "Request beta access" — no price shown anywhere (Q3 decision).
**CTA destination:** role-specific, goes directly to app (Q5 decision).

---

## 1. Site Map & Routing

```
/website/
├── index.html              → /                    (Homepage)
├── artists.html            → /artists              (For Artists)
├── bookers.html            → /bookers              (For Booking Managers)
├── producers.html          → /producers            (For Producers — מפיקים)   [approved 06 Jul]
├── pricing.html            → /pricing              (Pricing — Beta)            [approved 06 Jul]
├── radar.html              → /radar                (Artist Radar demo — DRAFT) [approved 06 Jul]
├── how-it-works.html       → /how-it-works         (Process / The Method)
├── methodology.html        → /methodology          (Method Label explainer)
├── passport/
│   └── index.html          → /passport/demo        (Sample Passport — demo)
├── contact.html            → /contact              (Contact / About)
├── faq.html                → /faq                  (FAQ — standalone)
└── styles.css              (shared — ONE file for all pages)
```

> ⚠️ REPO BUG (06 Jul 2026): Current `/website/index.html` has `lang="he" dir="rtl"` — WRONG.
> Must be `lang="en" dir="ltr"` per Q6 decision. Fix before any other work on this file.
>
> ⚠️ REPO BUG: `passport-demo.html` exists at root — wrong path. Must be `passport/index.html`.
> All nav links that say `href="passport-demo.html"` must be corrected to `/passport/demo`.

> ⚠️ ROUTE: The demo passport page is `/passport/demo` (subfolder, `passport/index.html`)
> NOT `/passport-demo`. Any link in code or copy must use `/passport/demo`.

**External link (not a website page):**
- `[Request beta access →]` CTA → `https://v6-b4-artist-pre-booking-intelligen.vercel.app`

**Navigation active states:**
| Page | `<a>` that gets `class="active"` |
|---|---|
| index.html | Home (mobile drawer only) |
| artists.html | "Artists / לאמנים" |
| bookers.html | "Booking Managers / לאמרגנים" |
| how-it-works.html | "How It Works / איך זה עובד" |
| passport/index.html | "Sample Passport / דוגמת פספורט" |
| contact.html | no nav item — reached via footer |

**Nav CTA by page:**
- Default (all pages): `btn-stamp` "Request beta access →" → app URL
- bookers.html: `btn-outline` "See sample passport" → `/passport/demo`

---

## 2. Shared Components (every page)

### 2.1 Navbar (sticky, paper bg)

```
[Logo: SVG door-stamp + GIGPROOF wordmark]
                  [Artists] [Bookers] [How It Works] [Sample Passport]
                  [EN|HE btn]   [Request beta access →]   [☰]
```

- Sticky top, `background: var(--paper)`, `border-bottom: var(--rule)`
- Logo = SVG door-stamp icon (32×32) + wordmark "GIGPROOF" (Archivo Black)
- Door stamp logo text: **"מאומת · GIGPROOF"** — NEVER "ראשים מאומתים" (Maria ruling, 01 Jul 2026)
- Nav links: 4 items bilingual, one `.active` per page
- Right side: lang-btn + primary CTA btn + hamburger (visible ≤720px)
- Mobile: hamburger → `.nav-drawer` sliding panel (full-width, paper bg, vertical stack + CTA)
- Hamburger closes on link click or outside tap

### 2.2 Footer (night bg, 4-col grid)

```
┌──────────────────────────────────────────────────────────────┐  night bg
│  [Logo + tagline]    [Product]    [For You]    [Legal]       │
│                                                               │
│  ─────────────────────────────────────────────────────────   │
│  "Pre-booking intelligence for live music."                   │
│  "GIGPROOF is a working product name.                         │
│   No booking guarantee, ranking or prediction."               │
└──────────────────────────────────────────────────────────────┘
```

- Grid: `2fr 1fr 1fr 1fr` at desktop → stacks at mobile
- Col 1: Logo + tagline `Pre-booking intelligence for live music.`
- Col 2: Product (Sample Passport → `/passport/demo`, How It Works)
- Col 3: For You (Artists → `/artists`, Booking Managers → `/bookers`)
- Col 4: Legal / Contact (Contact → `/contact`, Privacy, Terms)
- Bottom: disclaimer in `--tally` mono, `border-top: var(--rule-night)`
- Disclaimer (canonical): `GIGPROOF is a working product name. No booking guarantee, ranking or prediction.`

---

## 3. Page Wireframes

### 3.1 `index.html` — Homepage

> EN copy is primary. See §9 Copy Reference for canonical string values.

```
[NAVBAR]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HERO                                              section-night + grain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [door-stamp SVG watermark, 300px, 8% opacity, rotated, decorative]
  [hero image: gigproof-live-hero.png — behind/beside text, 40% opacity overlay]

  EYEBROW (Space Mono, tally): "PRE-BOOKING INTELLIGENCE FOR LIVE MUSIC"

  H1 (clamp 2rem→4.4rem, paper text):
    "Turn live activity into bookable evidence."

  hero-sub (1.1rem, paper 80%):
    "GIGPROOF helps independent artists prove professional momentum—and helps
     booking decision-makers evaluate unfamiliar talent with clearer context,
     visible methods and less guesswork."

  [CTA ROW]
    [btn-ink: "I'm an artist — request access →"]
    [btn-ghost: "I manage bookings →" → /bookers]

  [TRUST ROW — 3 mono chips, paper border]
    "✓ No scores or rankings"
    "✓ Artist-controlled publication"
    "✓ Evidence freshness shown"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROOF FLOW STRIP                                  section-sm, paper bg, border-top/bottom
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [horizontally scrollable mono bar]
  PRIVATE RADAR  →  SUPPORTED CLAIMS  →  PUBLIC PASSPORT  →  PROFESSIONAL ACTION
  (Space Mono, small caps, tally → stamp at active step)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE PROBLEM                                       section-alt (paper-2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "THE PROBLEM"
  H2: "Great work deserves more than another link."

  [problem-grid: 3 cols, border, overflow:hidden]
  ┌────────────────┬────────────────┬────────────────┐
  │  01            │  02            │  03            │
  │ Evidence is    │ Reach is not   │Recommendations │
  │ scattered      │ local draw     │ carry risk     │
  │                │                │                │
  │ body copy      │ body copy      │ body copy      │
  └────────────────┴────────────────┴────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE METHOD                                        section (paper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "A VISIBLE METHOD, NOT A BADGE"
  H2: "Every claim answers four questions."

  [steps-grid: 4 cols at desktop, 2 at ≤720px, 1 at ≤480px]
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │   01     │  │   02     │  │   03     │  │   04     │
  │  CLAIM   │  │ CONTEXT  │  │  METHOD  │  │FRESHNESS │
  │ What the │  │ The show │  │ How it   │  │ When it  │
  │ data says│  │ conditions│  │ was      │  │ was      │
  │          │  │           │  │ verified │  │ reviewed │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
  [link: "See how verification works →" → /how-it-works]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SAMPLE PROOF UNIT                                 section-alt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "THE PROOF UNIT"
  H2: "Every claim — method, context, date."

  [2-col layout]
  LEFT: [proof-unit component]
    ┌────────────────────────────────────┐
    │ CLAIM    │ 60–100                  │  ← band pill, Space Mono
    │ CONTEXT  │ Standalone · cap 180    │
    │ METHOD   │ ✓ TICKET EXPORT         │  ← stamp color
    │ REVIEWED │ OCT 2025                │  ← tally
    └────────────────────────────────────┘

  RIGHT: [4-item explanation sidebar]
    Claim: What the draw range covers
    Context: The conditions of the show
    Method: How it was verified
    Freshness: When it was reviewed
    [link "See a full sample passport →" → /passport/demo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHO IT'S FOR                                      section (paper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "ONE TRUTH LAYER · THREE JOBS"
  H2: "Start from the decision you need to make."

  [for-grid: 3 cols, 20px gap — artist / booker / producer]
  ┌────────────────────┬────────────────────┬────────────────────┐
  │ FOR ARTISTS        │ FOR BOOKING MGRs   │ FOR PRODUCERS      │
  │ 3px stamp border   │ 3px ink border     │ 3px tally border   │
  │                    │                    │                    │
  │ Build proof you    │ Evaluate before    │ Frame event risk   │
  │ control.           │ you recommend.     │ clearly.           │
  │ · Private Radar    │ · 30-sec evidence  │ · Event-context    │
  │ · Claim-first      │   scan             │   evaluation       │
  │   evidence capture │ · Private notes    │ · Commercial       │
  │ · Controlled       │ · Availability     │   request flow     │
  │   Passport sharing │   requests         │ · Authority-labelled│
  │                    │                    │   confirmation     │
  │ [→ /artists]       │ [→ /bookers]       │ [→ /how-it-works]  │
  └────────────────────┴────────────────────┴────────────────────┘
  NOTE: אמרגן ≠ מפיק — never merge in copy or UI. All three are distinct roles.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TRUST PILLARS                                     section-night + grain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "BUILT ON TRUST"
  H2: "Private intelligence stays private."

  [pillars-grid: 4 cols at desktop, 2 at 880px, 1 at 480px]
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │  01      │ │  02      │ │  03      │ │  04      │
  │Separate  │ │Bounded   │ │Real      │ │Visible   │
  │consent   │ │claims    │ │authority │ │freshness │
  │          │ │          │ │          │ │          │
  │body copy │ │body copy │ │body copy │ │body copy │
  └──────────┘ └──────────┘ └──────────┘ └──────────┘
  (pillar-num in stamp mono 1.6rem)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FAQ                                               section (paper, max-width: 800px centered)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "FAQ"
  H2: "Common questions."

  [accordion — 6 canonical items from §A.7 — see §9 for exact copy]
  1. What is a Bookability Passport?           [+/−]
  2. How does GIGPROOF help independent artists?  [+/−]
  3. Is GIGPROOF an EPK or booking marketplace?   [+/−]
  4. Does GIGPROOF rank or score artists?      [+/−]
  5. What information becomes public?          [+/−]
  6. Who can use GIGPROOF?                     [+/−]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL CTA / BETA OFFER                            section-night, centered, max-width 620px
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW (stamp mono): "ARTIST BETA"
  H3 (paper): "Private Radar + publishable Bookability Passport"

  [feat-list, paper border]
  · Claim-first evidence capture
  · Method-labelled Proof Units
  · Artist-controlled publication
  · Tagged share links and request inbox
  · Post-performance evidence refresh

  [btn-stamp: "Request closed-beta access →" → app URL]

  [disclaimer chip, mono, tally]:
  "No booking guarantee. No ranking. No marketplace listing."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FOOTER]
```

---

### 3.2 `artists.html` — For Artists

```
[NAVBAR] (active: artists)

PAGE HEADER                                       page-header-stamp (stamp purple bg)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW (Space Mono, paper): "FOR ARTISTS · לאמנים"
  H1 (paper text): "Build proof you control."
  hero-sub (paper 80%): "You own the data. You decide what gets published and when."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE PROBLEM (FOR ARTISTS)                         section-alt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [problem-grid: 3 cols]
  01: Evidence is scattered across platforms
  02: Reach doesn't equal local draw
  03: Booking managers can't evaluate unfamiliar acts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT YOU GET                                      section (paper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "WHAT YOU GET"
  H2: "Your Radar. Your Passport. Your call."

  [feat-list: vertical stack, border-separated]
  ┌─────────────────────────────────────────────┐
  │ [SVG] Private Artist Radar                  │
  │       Shows your evidence gaps + next action│
  ├─────────────────────────────────────────────┤
  │ [SVG] Bookability Passport                  │
  │       Verified strengths, method-labeled    │
  ├─────────────────────────────────────────────┤
  │ [SVG] WhatsApp-ready share link             │
  │       390px test-passed, no login required  │
  ├─────────────────────────────────────────────┤
  │ [SVG] Availability request inbox            │
  │       Booking managers can send requests    │
  └─────────────────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW VERIFICATION WORKS                            section-night + grain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "VERIFICATION"
  H2: "Producer-confirmed in 30 seconds."

  [timeline: numbered, sequential]
  1. Log a gig — date, venue, format
  2. Send magic link to the producer (no producer account needed)
  3. Producer confirms one bounded statement
  4. Claim becomes method-labeled in your Passport
  5. You approve what gets published — claim by claim
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIVACY / CONTROL                                 section (paper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "YOUR CONTROL"
  H2: "Your Radar is private. Your Passport is your choice."

  Copy: The Radar (Mirror) shows evidence states — internal only.
  The Passport is public only for claims you explicitly publish.
  Each claim needs a separate publication consent.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BETA OFFER                                        section-night, centered, max-width 620px
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "ARTIST BETA"
  H3: "Private Radar + publishable Bookability Passport"

  [btn-stamp: "Request closed-beta access →" → app URL]
  [btn-ghost: "See sample passport →" → /passport/demo]

  [disclaimer chip]:
  "No booking guarantee. No ranking. No marketplace listing."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FOOTER]
```

---

### 3.3 `bookers.html` — For Booking Managers

```
[NAVBAR] (active: bookers, CTA → /passport/demo)

PAGE HEADER                                       page-header-night (night bg)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "FOR BOOKING MANAGERS · לאמרגנים"
  H1 (paper): "Evaluate before you recommend."
  sub (paper 80%): "Free for booking managers. No account required to view a Passport."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE RISK                                          section-alt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "THE REAL PROBLEM"
  H2: "Your name is on every recommendation."

  [problem-grid: 3 cols]
  01: Recommending someone who won't draw
  02: Links don't answer the real question
  03: No time to investigate every unfamiliar artist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT YOU SEE IN A PASSPORT                        section (paper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "WHAT'S IN A PASSPORT"
  H2: "30-second evidence scan. Method-labeled. Dated."

  [feat-list: 4 rows]
  [SVG] Draw range — band only, never an exact figure
  [SVG] Clear method label on every claim
  [SVG] Review date + evidence freshness shown
  [SVG] No signup needed to view
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT GIGPROOF IS NOT                              section-night, max-width 680px, centered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  H2 (paper): "No score. No ranking. No promise."
  Copy: GIGPROOF does not rank artists, predict outcomes, or guarantee bookings.
  It presents verified, method-labeled evidence — you make the call.
  [link "See what it does show →" → /passport/demo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CTA / NEXT STEP                                   section (paper), centered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  H2: "Got a link from an artist?"
  Copy: "Open it. No signup. Everything is labeled."
  [btn-stamp "See a sample passport →" → /passport/demo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FOOTER]
```

---

### 3.4 `how-it-works.html` — Process Page

```
[NAVBAR] (active: how-it-works)

PAGE HEADER                                       page-header (plain paper bg)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "THE PROCESS · איך זה עובד"
  H1: "From performance to verified Passport."
  sub: "Three players. One labeled claim. Your call on what to publish."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THREE PLAYERS                                     section-alt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "THREE PLAYERS"
  H2: "Every role is distinct. Never merged."

  [players-grid: 3 cols A / B / C]
  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
  │      A        │ │      B        │ │      C        │
  │ ARTIST        │ │ PRODUCER      │ │ BOOKING MGR   │
  │ אמן           │ │ מפיק          │ │ אמרגן         │
  │               │ │               │ │               │
  │ Builds proof  │ │ Confirms one  │ │ Evaluates via │
  │ Owns claims   │ │ bounded claim │ │ Passport.     │
  │ Controls pub- │ │ No account    │ │ Free. No      │
  │ lication      │ │ needed        │ │ signup.       │
  └───────────────┘ └───────────────┘ └───────────────┘
  ⚠️ אמרגן ≠ מפיק — NEVER merged in copy or UI. Different risk profiles.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP BY STEP                                      section, max-width 740px, centered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "THE STEPS"
  H2: "One verified claim, step by step."

  [timeline: numbered, sequential, border-left line]
  ┌─● 1 ─────────────────────────────────────┐
  │  Sign up + create artist workspace       │
  ├─● 2 ─────────────────────────────────────┤
  │  Log a gig (venue, date, show format)    │
  ├─● 3 ─────────────────────────────────────┤
  │  Send a magic link to the producer       │
  ├─● 4 ─────────────────────────────────────┤
  │  Producer confirms in ~30 seconds        │
  │  (no producer account, bounded link)     │
  ├─● 5 ─────────────────────────────────────┤
  │  Artist approves claim for publication   │
  ├─● 6 ─────────────────────────────────────┤
  │  Passport updates with method-labeled,   │
  │  dated, producer-confirmed claim         │
  └──────────────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

METHOD LABEL EXPLAINER                            section (paper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "THE METHOD LABEL"
  H2: "Every claim shows how it was verified."

  [3-col method grid]
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │TICKET EXPORT │ │SETTLEMENT    │ │PRODUCER      │
  │              │ │SHEET         │ │CONFIRMED     │
  │ Ticket data  │ │ Venue payout │ │ Producer     │
  │ exported     │ │ doc confirms │ │ confirms via │
  │ from platform│ │ attendance   │ │ magic link   │
  └──────────────┘ └──────────────┘ └──────────────┘
  [link "See methodology detail →" → /methodology (optional page)]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSENT SUMMARY                                   section-night + grain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "YOUR DATA"
  H2: "Separate consent for every step."
  Copy: Account · Data connection · Publication · Counterparty name · Marketing (optional)
  Each is a distinct, contextual consent — never bundled.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FAQ (process-specific)                            section, max-width 800px, centered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [accordion — 3–4 process-specific items]
  1. Does the producer need an account?
  2. Can I choose which claims appear in my Passport?
  3. What if the producer doesn't respond?
  4. How long until a claim appears on my Passport?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL CTA                                         section, centered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [btn-stamp "Request beta access →" → app URL]
  [btn-outline "See a sample passport →" → /passport/demo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FOOTER]
```

---

### 3.5 `passport/index.html` — Sample Passport (`/passport/demo`)

> This is the most complex page. It demonstrates what a real Passport looks like.
> Lior Azulay is a FICTIONAL artist. All data is fabricated for illustration only.
> SEO: `<meta name="robots" content="noindex, nofollow">` — per D-005 (Passport search-indexing policy not yet approved).

```
[NAVBAR]

DISCLAIMER BANNER                                 always-visible, below nav, NOT dismissible
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [disclaimer-banner: void-red tint, full width, small mono]
  ⚠ "Sample only — Lior Azulay is a fictional artist. All data fabricated for illustration."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASSPORT HEADER                                   section-night (dark bg)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [2-col: stamp col + bio col]

  LEFT: [door-stamp SVG, 130px, rotated -7deg, paper tint]
        Stamp text: "מאומת · GIGPROOF" — NEVER "ראשים מאומתים"

  RIGHT:
    H1: "Lior Azulay / ליאור אזולאי"
    Genre chip (mono): "Electronic · אלקטרוניקה"
    Stage tag (mono): "Stage: Developing"

    [geo-chips row]
    [Tel Aviv] [Haifa] [≤50km]

    [passport-meta: 4 items, border-separated]
    Published:         March 2026
    Documented shows:  3
    Verification:      ✓ Producer-confirmed (stamp color)
    GP-ID:             GP-2026-0412 (Space Mono, tally)

    ⚠️ FIREWALL: Never expose "Documented shows" as a score or rating.
       "Documented shows: 3" is a count. Never show it as a progress bar.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DRAW BLOCK                                        section-alt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [draw-block: bordered container]

  EYEBROW (mono): "DRAW · קהל"

  [band-pill-lg: "60–100"] ← Space Mono, 3rem, ink bg, paper text

  sub: "Across 3 verified shows (Tel Aviv · Haifa · Jan–Mar 2026)"

  [method-badges row, stamp bg, mono, small]
  ✓ Club 45    ✓ Voltage TLV

  [draw-context-card: bordered inner box]
  Geo radius:     ≤50km from TLV
  Capacity range: 120–180
  Date range:     3 months (Jan–Mar 2026)
  Show type:      Standalone shows only

  ⚠️ FIREWALL (ABSOLUTE):
     NO gauge. NO fill bar. NO "bookability %". NO exact figure.
     NO "ראשים" anywhere. Band pill "60–100" ONLY.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EVIDENCE TABLE                                    section (paper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "EVIDENCE · ראיות"
  H3: "3 documented shows"

  [proof-unit × 3, stacked, each = claim + context + method + date]

  ┌─────────────────────────────────────────────┐
  │ Club 45 · Tel Aviv · Jan 2026 · VRF-401     │
  ├──────────┬──────────────────────────────────┤
  │ CLAIM    │ [band-pill: 70–100]              │
  │ CONTEXT  │ Standalone · cap 180 · Tuesday   │
  │ METHOD   │ ✓ Producer-confirmed             │
  │          │   Shai Levi  (stamp color)       │
  │ REVIEWED │ Jan 2026 (tally)                 │
  └──────────┴──────────────────────────────────┘

  ┌─────────────────────────────────────────────┐
  │ Voltage TLV · Tel Aviv · Feb 2026 · VRF-407 │
  ├──────────┬──────────────────────────────────┤
  │ CLAIM    │ [band-pill: 60–90]               │
  │ CONTEXT  │ B2B with 2nd act · cap 150 · Fri │
  │ METHOD   │ ✓ Producer-confirmed             │
  │          │   Noam Barak (stamp color)       │
  │ REVIEWED │ Feb 2026 (tally)                 │
  └──────────┴──────────────────────────────────┘

  ┌─────────────────────────────────────────────┐
  │ [Haifa venue · Mar 2026 · VRF-415]          │
  │ CLAIM / CONTEXT / METHOD / REVIEWED          │
  └─────────────────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STREAMING CONTEXT                                 section-alt (secondary strip — NOT draw)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "STREAMING · הקשר נוסף"
  Note (mono, tally): "Secondary context only. Not a draw signal."
  [Spotify monthly listeners — text ONLY, no band pill, no fill bar]
  ⚠️ FIREWALL: Streaming is context strip ONLY. Never a draw number.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVAILABILITY / BOOKING REQUEST                    section (paper), centered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "INTERESTED?"
  H3: "Send an availability request to the artist"
  [compact form: name + email + venue + message]
  [btn-stamp: "Send request"]
  Note (mono, tally): "Request goes to artist. No GIGPROOF intermediary."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NO-GUARANTEE BAR                                  section-sm, paper-2, centered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [disclaimer chip, mono]
  "No booking guarantee, ranking or prediction.
   Evidence freshness shown on every public unit."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FOOTER]
```

---

### 3.6 `contact.html` — Contact

> Q2 DECISION: Form is a `mailto:` link. No backend. Clicking send opens user's email client.

```
[NAVBAR]

PAGE HEADER                                       page-header (plain paper bg)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "CONTACT · צרו קשר"
  H1: "Questions? Ideas? Collaboration?"
  sub: "Closed beta — we read everything."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTACT GRID                                      section, 2-col at desktop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LEFT (form):
    ┌────────────────────────────────────────┐
    │ Name (text input)                      │
    │ Email (email input)                    │
    │ Role (select):                         │
    │   Artist / Booking manager /           │
    │   Producer / Press / Other             │
    │ Message (textarea)                     │
    │ [btn-stamp: "Send" — mailto: link]     │
    └────────────────────────────────────────┘
    Implementation: <form action="mailto:hello@gigproof.com" method="post">
    Fallback: email address visibly displayed as backup.

  RIGHT (info):
    Email address (mono)
    Response time note (closed beta — 1–2 days)
    Beta context copy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FOOTER]
```

---

### 3.7 `faq.html` — Standalone FAQ (OPTIONAL — low-effort, high-trust)

> Build only if Step 3 homepage is approved. Reuses FAQ content from §9.

```
[NAVBAR]

PAGE HEADER                                       page-header (plain paper bg)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EYEBROW: "FAQ"
  H1: "Common questions about GIGPROOF."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FAQ FULL                                          section (paper, max-width: 800px)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [accordion: 6 canonical items + up to 4 process Q&As]
  (see §9 for canonical Q&A copy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CTA                                               section-night, centered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [btn-stamp "Request beta access →" → app URL]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FOOTER]
```

---

## 4. Component Inventory

| Component | index | artists | bookers | how-it-works | passport/demo | contact | faq (opt) |
|---|---|---|---|---|---|---|---|
| Navbar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Footer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| page-header | — | stamp | night | plain | — | plain | plain |
| section-night + grain | hero, pillars, CTA | verify, CTA | "Not" section | consent | — | — | CTA |
| section-alt (paper-2) | problem, proof-unit | problem | risk | players | draw-block, streaming | — | — |
| proof-unit | 1 sample | — | — | — | 3 units | — | — |
| band-pill-lg | — | — | — | — | draw-block | — | — |
| band-pill | in proof-unit | — | — | — | in each proof-unit | — | — |
| problem-grid (3-col) | ✓ | ✓ | ✓ | — | — | — | — |
| method-grid (4-col) | ✓ | — | — | method-3 | — | — | — |
| feat-list | ✓ (beta) | ✓ | ✓ | — | — | — | — |
| for-grid (3-col) | ✓ | — | — | — | — | — | — |
| pillars-grid (4-col) | ✓ | — | — | — | — | — | — |
| timeline | — | ✓ | — | ✓ | — | — | — |
| players-grid (3-col A/B/C) | — | — | — | ✓ | — | — | — |
| draw-block | — | — | — | — | ✓ | — | — |
| geo-chip | — | — | — | — | ✓ | — | — |
| contact-form | — | — | — | — | avail.req | ✓ | — |
| disclaimer-banner | — | — | — | — | ✓ (fixed) | — | — |
| accordion / FAQ | ✓ (6) | — | — | ✓ (4) | — | — | ✓ (10) |
| door-stamp SVG | hero watermark | — | — | — | ✓ (130px) | — | — |
| proof-flow strip | ✓ | — | — | — | — | — | — |
| image: live-hero | ✓ (hero) | — | — | — | — | — | — |
| image: evidence-review | — | ✓ | — | ✓ | — | — | — |

---

## 5. Language System

### Q6 Decision — EN Ships First

**EN is the launch default.** HE added after Maria approves English site.
Non-EN strings are stubbed with EN copy initially. RU/DE deferred to post-Beta.

```html
<!-- HTML element at launch -->
<html lang="en" dir="ltr">

<!-- After HE launch: toggles to -->
<html lang="he" dir="rtl">
```

### Toggle Mechanism
```javascript
// Default: 'en' at V1 launch (Q6 decision — EN ships first)
const lang = localStorage.getItem('gp_lang') || 'en';

function applyLang(lang) {
  document.querySelectorAll('.lang-he-inline').forEach(el =>
    el.style.display = lang === 'he' ? '' : 'none');
  document.querySelectorAll('.lang-en-inline').forEach(el =>
    el.style.display = lang === 'en' ? '' : 'none');
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  localStorage.setItem('gp_lang', lang);
}
```

### Markup Pattern
```html
<span class="lang-en-inline">Proof you control</span>
<span class="lang-he-inline" style="display:none">הוכחה שאתה שולט בה</span>
```
> At launch: EN visible by default, HE hidden. Toggle swaps both.

### Rules
- EN is the launch default. HE toggle is built but stubs with EN strings until HE pass approved.
- HE authored native-first when written — NOT translated from EN.
- `<html lang="en" dir="ltr">` at launch. `dir="rtl"` activates only on HE toggle.
- Space Mono eyebrows/labels: EN-only (design-language mono strings stay EN regardless of language).
- `אמרגן ≠ מפיק` — preserved in every HE string; never merge or translate as the same word.
- **NEVER use "ראשים", "ספירת ראשים", or "heads at the door"** anywhere (Maria ruling, 01 Jul 2026).
- D-008 (locale URL pattern, hreflang) is OPEN. Build single-language routes at launch. Hreflang scaffold = commented HTML comment only.
- **Future i18n URL pattern (D-008 planning note):** When HE activates, best practice for AI/GEO engines
  is URL-based locale routing (`/en/`, `/he/`) with matching hreflang tags — NOT JS-only switching.
  Current JS toggle approach is acceptable at launch (single language); upgrade to URL-based when HE ships.
  Do NOT implement subfolder routing now — file it as a pre-HE-launch task.
- **Language priority note (music industry research):** Current roadmap EN → HE → RU → DE is correct for
  Israeli market. Spanish has the fastest-growing global music audience (Latin, Reggaeton, US demographic)
  and may be worth prioritizing over RU/DE post-Beta. Maria decides after HE is live.

---

## 6. Responsive Breakpoints

| Breakpoint | Change |
|---|---|
| `≤720px` | Hide nav links + nav CTAs. Show hamburger → `.nav-drawer`. `problem-grid` → 1-col. `method-grid` → 2-col. `for-grid` → 1-col. `contact-grid` → 1-col. |
| `≤880px` | `pillars-grid`: 4-col → 2-col. `players-grid`: 3-col → 1-col. |
| `≤480px` | `pillars-grid`: 2-col → 1-col. `method-grid`: 2-col → 1-col. |
| All | `h1` uses `clamp(2rem, 5.5vw, 4.4rem)`. Section padding scales from `--px` (80px) to `--p` (24px) on mobile. |

**WhatsApp test:** `passport/index.html` must render cleanly at 390px. The draw-block, band-pill-lg, and proof-units must be fully readable without horizontal scroll. Test at 390px before Step 11.

---

## 7. Build Notes for Codex

### Technical Rules
1. **Do not add a build tool.** No webpack, no Vite for `/website/`. Pure HTML/CSS/JS.
   Raw static HTML is already pre-rendered and fully crawlable by AI search engines (Google Overviews,
   Perplexity, Gemini). It is SSG-equivalent by default. Do NOT suggest switching to React or Next.js
   for the marketing site — that would require a build tool and adds complexity with no crawling benefit.
2. **One `styles.css`** shared by all pages. No per-page stylesheets.
3. **EN default at launch** — `<html lang="en" dir="ltr">` on every page. HE toggle via JS (§5).
4. **No framework JS** — vanilla only. No jQuery, no Alpine.
5. **Semantic HTML throughout** — use proper elements, not `<div>` soup.
   AI crawlers (AEO/GEO) map content structure from semantic tags.
   - Page wrapper: `<main>`
   - Sections: `<section aria-label="[section name]">`
   - Standalone content blocks (proof units, FAQ items): `<article>`
   - Navigation: `<nav aria-label="primary">`
   - One `<h1>` per page. `<h2>` for main sections. `<h3>` for subsections.
   - Proof Units: `<article class="proof-unit">` with inner labeled fields readable as content.
6. **Font loading** — one `<link>` in `<head>` for Google Fonts:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Heebo:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
   ```
7. **Images** — All images use `width` + `height` attributes and `loading="lazy"` (except hero above the fold).
   Hero image: `loading="eager"`. Provide explicit dimensions to prevent layout shift (Core Web Vitals / CLS).
   ```html
   <img src="assets/gigproof-live-hero.png" alt="GIGPROOF — live show context" width="1200" height="630" loading="eager">
   ```
8. **Door-stamp SVG** — inline SVG in navbar logo + decorative watermarks. Keep inline (not `<img>`).
   Stamp text: **"מאומת · GIGPROOF"** — NEVER "ראשים מאומתים".
9. **Contact form** — `mailto:` link. No backend, no JS handleSubmit. `<form action="mailto:hello@gigproof.com" method="post">`.
10. **Disclaimer banner on passport/index.html** — always visible, NOT dismissible.
11. **Active nav state** — set via class on current page's link, not JS detection.
12. **Section ordering** — see wireframes above. Do not reorder without PM review.
13. **netlify.toml must NOT exist** in this project.

### Build Order (13 Steps)

```
⚠️ FIX FIRST (before any new work):
  · index.html: change `lang="he" dir="rtl"` → `lang="en" dir="ltr"`
  · Move passport-demo.html → passport/index.html
  · All nav href="passport-demo.html" → href="/passport/demo"

STEP 1  · Scaffold — fix existing bugs above / CSS variables / lang-toggle JS
          Also create: sitemap.xml (all indexable pages) + robots.txt (noindex /passport/demo + /contact)
STEP 2  · Shared components — NavBar, Footer, ProofUnit, BandPill, DoorStamp, RuledSeparator
STEP 3  · Home page (/) — all sections per §3.1 wireframe
STEP 4  · Demo Passport (/passport/demo) — needed earliest for outreach
STEP 5  · For Artists (/artists)
STEP 6  · For Booking Managers (/bookers)
STEP 7  · For Producers (/producers) — role: מפיק, confirms claims via magic link
STEP 8  · How It Works (/how-it-works) + Methodology (/methodology)
STEP 9  · Pricing (/pricing) — beta offer, no price shown, "Request beta access"
STEP 10 · Radar (/radar) — import Codex v63 draft AS IS; mark as DRAFT in code comment
STEP 11 · Contact (/contact) + FAQ (/faq)
STEP 12 · HE/EN language toggle — wire across all pages (stubs with EN for now)
STEP 13 · Mobile responsive pass — test at 375px + 390px WhatsApp test on /passport/demo
STEP 14 · SEO/AEO pass — verify all <head> tags, JSON-LD, canonical URLs, semantic HTML per §8
STEP 15 · Submit sitemap.xml to Google Search Console after deploy
STEP 16 · Maria review → final EN copy corrections → deploy
```

**sitemap.xml scope (Step 1):**
Include: `/`, `/artists`, `/bookers`, `/producers`, `/pricing`, `/how-it-works`, `/methodology`, `/radar`, `/faq`
Exclude: `/passport/demo`, `/contact` (noindex pages)

**robots.txt template:**
```
User-agent: *
Allow: /
Disallow: /passport/
Disallow: /contact

Sitemap: https://[domain]/sitemap.xml
```

---

## 8. SEO / AEO / GEO Requirements

> Every page gets at minimum: `<title>`, `<meta description>`, Open Graph, `<link rel="canonical">`.
> JSON-LD structured data per page type for AEO/GEO (AI answer engine + generative engine optimization).

### 8.1 Per-Page SEO Spec

**`/` — Homepage**
```
<title>GIGPROOF — Pre-Booking Intelligence for Live Music</title>
<meta name="description" content="Turn live performance history into verified, method-labeled evidence. GIGPROOF helps independent artists prove professional momentum and booking managers evaluate unfamiliar talent.">
<link rel="canonical" href="https://[domain]/">
<meta name="robots" content="index, follow">
OG title:       GIGPROOF — Pre-Booking Intelligence for Live Music
OG description: [same as meta description]
OG image:       gigproof-live-hero.png (1200×630)
OG type:        website
JSON-LD:        WebSite + Organization + FAQPage (from §9 FAQ)
```

**`/artists` — For Artists**
```
<title>For Artists — Build Your Bookability Passport | GIGPROOF</title>
<meta name="description" content="Turn your real show history into verified, method-labeled proof that booking managers trust. No scores, no ranking — just evidence you control.">
<link rel="canonical" href="https://[domain]/artists">
<meta name="robots" content="index, follow">
OG image:       gigproof-evidence-review.png
JSON-LD:        WebPage
```

**`/bookers` — For Booking Managers**
```
<title>For Booking Managers — Evaluate Artists Before You Recommend | GIGPROOF</title>
<meta name="description" content="See method-labeled, producer-confirmed evidence from an artist's real shows before you put your name on the line. Free. No signup required.">
<link rel="canonical" href="https://[domain]/bookers">
<meta name="robots" content="index, follow">
JSON-LD:        WebPage
```

**`/how-it-works` — How It Works**
```
<title>How GIGPROOF Works — From Performance to Verified Passport</title>
<meta name="description" content="Three players, one labeled claim. See how artist evidence becomes a producer-confirmed, method-labeled, WhatsApp-ready Bookability Passport.">
<link rel="canonical" href="https://[domain]/how-it-works">
<meta name="robots" content="index, follow">
JSON-LD:        HowTo + FAQPage (process FAQ from §9)
```

**`/passport/demo` — Sample Passport**
```
<title>Sample Bookability Passport — Lior Azulay (Fictional Demo) | GIGPROOF</title>
<meta name="description" content="See what a GIGPROOF Bookability Passport looks like. Fictional artist, real format — method-labeled, producer-confirmed, no scores, no ranking.">
<link rel="canonical" href="https://[domain]/passport/demo">
<meta name="robots" content="noindex, nofollow">
<!-- D-005: Passport pages default noindex until search-indexing policy approved. -->
JSON-LD:        none (demo/sample page)
```

**`/contact` — Contact**
```
<title>Contact GIGPROOF — Closed Beta Inquiries</title>
<meta name="description" content="Questions about GIGPROOF? Artist, booking manager, or press? Reach out during our Israel closed beta.">
<link rel="canonical" href="https://[domain]/contact">
<meta name="robots" content="noindex, follow">
JSON-LD:        none
```

**`/faq` — FAQ (Optional)**
```
<title>FAQ — Common Questions About GIGPROOF</title>
<meta name="description" content="Everything you want to know about GIGPROOF Bookability Passports, evidence verification, and how pre-booking intelligence works.">
<link rel="canonical" href="https://[domain]/faq">
<meta name="robots" content="index, follow">
JSON-LD:        FAQPage (all Q&As from §9)
```

**`/producers` — For Producers (מפיקים)** *(approved 06 Jul 2026)*
```
<title>For Producers — Confirm What You Saw | GIGPROOF</title>
<meta name="description" content="Producers confirm one bounded statement about a show they ran — via a 30-second magic link, no account required. Reduce event risk with labeled evidence.">
<link rel="canonical" href="https://[domain]/producers">
<meta name="robots" content="index, follow">
OG image:       gigproof-persona-producer-v1.webp
JSON-LD:        WebPage + FAQPage (producer-specific Q&As)
```

**`/pricing` — Pricing (Beta)** *(approved 06 Jul 2026)*
```
<title>Pricing — GIGPROOF Artist Beta Access</title>
<meta name="description" content="GIGPROOF is in closed beta. No public pricing — request access to join the Israel artist beta and start building your Bookability Passport.">
<link rel="canonical" href="https://[domain]/pricing">
<meta name="robots" content="index, follow">
JSON-LD:        WebPage
<!-- No price data in schema — no price shown per Q3 decision. -->
```

**`/radar` — Artist Radar (DRAFT)** *(approved 06 Jul 2026)*
```
<title>Artist Radar — Private Evidence Dashboard | GIGPROOF (Preview)</title>
<meta name="description" content="The Artist Radar is your private evidence dashboard — see what's supported, what needs a source, and what's ready to publish in your Bookability Passport.">
<link rel="canonical" href="https://[domain]/radar">
<meta name="robots" content="noindex, follow">
<!-- DRAFT PAGE: noindex until content is updated and Maria approves indexing. -->
JSON-LD:        none (draft)
```

**`/methodology` — Method Label Explainer** *(approved 06 Jul 2026)*
```
<title>The Method — How GIGPROOF Labels Evidence | GIGPROOF</title>
<meta name="description" content="Every claim in a GIGPROOF Bookability Passport carries four answers: what it is, the context, how it was verified, and when it was reviewed. No badge — just method.">
<link rel="canonical" href="https://[domain]/methodology">
<meta name="robots" content="index, follow">
JSON-LD:        WebPage + FAQPage (methodology Q&As)
```

### 8.2 Open Graph Template (all pages)

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="GIGPROOF">
<meta property="og:title" content="[per-page title]">
<meta property="og:description" content="[per-page description]">
<meta property="og:url" content="https://[domain]/[path]">
<meta property="og:image" content="https://[domain]/assets/[image].png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[per-page title]">
<meta name="twitter:description" content="[per-page description]">
<meta name="twitter:image" content="https://[domain]/assets/[image].png">
```

### 8.3 JSON-LD Schemas

**WebSite + Organization (homepage `<head>` only):**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GIGPROOF",
  "url": "https://[domain]",
  "description": "Pre-booking intelligence for live music. Method-labeled evidence for independent artists and booking managers.",
  "publisher": {
    "@type": "Organization",
    "name": "GIGPROOF",
    "url": "https://[domain]"
  }
}
```

**HowTo (how-it-works page):**
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to build a Bookability Passport with GIGPROOF",
  "description": "Turn live show history into verified, method-labeled evidence for booking managers.",
  "step": [
    {"@type": "HowToStep", "name": "Sign up and create artist workspace"},
    {"@type": "HowToStep", "name": "Log a gig with venue, date, and format"},
    {"@type": "HowToStep", "name": "Send a magic link to the producer"},
    {"@type": "HowToStep", "name": "Producer confirms in ~30 seconds (no account needed)"},
    {"@type": "HowToStep", "name": "Approve which claims appear in your Passport"},
    {"@type": "HowToStep", "name": "Passport updates with method-labeled, dated claim"}
  ]
}
```

**FAQPage (homepage + faq page — use canonical Q&As from §9):**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a Bookability Passport?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A buyer-facing evidence profile that presents supported live-demand and commercial signals with their context, source method and review date."
      }
    },
    // ... (all 6 Q&As from §9.3)
  ]
}
```

### 8.4 AEO / GEO Copy Guidance

These patterns help AI assistants (ChatGPT, Gemini, Perplexity, Claude) extract and cite accurate answers:

- Every FAQ answer is written as a **self-contained direct answer** — no "as mentioned above" references.
- The homepage hero copy answers the implicit query: "what is GIGPROOF" / "what is a Bookability Passport."
- The How It Works page answers: "how does artist verification work" / "how do booking managers evaluate artists."
- Every method label is accompanied by a plain-language definition within the same HTML block.
- The `<meta name="description">` for each page answers a specific user intent question, not a marketing tagline.

### 8.5 hreflang Scaffold (D-008 — NOT ACTIVE AT LAUNCH)

```html
<!-- D-008 OPEN — locale URL pattern not decided. Scaffold only, inactive. -->
<!-- Activate only after D-008 decision and Maria approval of HE strings. -->
<!--
<link rel="alternate" hreflang="en" href="https://[domain]/">
<link rel="alternate" hreflang="he" href="https://[domain]/he/">
<link rel="alternate" hreflang="x-default" href="https://[domain]/">
-->
```

---

## 9. Copy & Content Reference

> Codex implements copy EXACTLY as written here. Maria reviews before launch (Step 11). Do not improvise or rewrite.

### 9.1 Decisions Table (all resolved 01 Jul 2026)

| # | Decision | Resolution |
|---|---|---|
| Q1 | Website deployment | New Vercel project — website separate from app |
| Q2 | Contact form backend | mailto: link — no backend. Form opens email client. |
| Q3 | Pricing shown? | No price shown. All CTAs say "Request beta access." |
| Q4 | Who writes copy? | Code drafts EN copy — Maria reviews before launch |
| Q5 | CTA destination | Directly to app — role-specific CTA per persona page |
| Q6 | Launch language | EN ships first. HE + RU + DE added after EN approval. |

### 9.2 Homepage Copy Bank (§A.7 — primary source)

**Hero:**
```
Eyebrow:  PRE-BOOKING INTELLIGENCE FOR LIVE MUSIC
H1:       Turn live activity into bookable evidence.
Sub:      GIGPROOF helps independent artists prove professional momentum—and helps booking
          decision-makers evaluate unfamiliar talent with clearer context, visible methods
          and less guesswork.
CTA-1:    I'm an artist — request access →
CTA-2:    I manage bookings →
Chips:    ✓ No scores or rankings  ✓ Artist-controlled publication  ✓ Evidence freshness shown
```

**Proof Flow Strip:**
```
PRIVATE RADAR  →  SUPPORTED CLAIMS  →  PUBLIC PASSPORT  →  PROFESSIONAL ACTION
```

**The Problem:**
```
H2:  Great work deserves more than another link.
01:  Evidence is scattered
02:  Reach is not local draw
03:  Recommendations carry risk
```

**The Method (4-question framework):**
```
Eyebrow:  A VISIBLE METHOD, NOT A BADGE
H2:       Every claim answers four questions.
01:       CLAIM
02:       CONTEXT
03:       METHOD
04:       FRESHNESS
```

**Who It's For:**
```
Eyebrow:  ONE TRUTH LAYER · THREE JOBS
H2:       Start from the decision you need to make.

FOR ARTISTS:            Build proof you control.
  → Private Artist Radar · Claim-first evidence capture · Controlled Passport sharing

FOR BOOKING MANAGERS:   Evaluate before you recommend.
  → 30-second evidence scan · Private notes · Availability requests

FOR PRODUCERS:          Frame event risk clearly.
  → Event-context evaluation · Commercial request flow · Authority-labelled confirmation
```

**Trust Pillars:**
```
H2:  Private intelligence stays private.
01:  Separate consent
02:  Bounded claims
03:  Real authority
04:  Visible freshness
```

**Beta Offer Block:**
```
Label:    ARTIST BETA
H3:       Private Radar + publishable Bookability Passport
Bullets:  Claim-first evidence capture
          Method-labelled Proof Units
          Artist-controlled publication
          Tagged share links and request inbox
          Post-performance evidence refresh
CTA:      Request closed-beta access →
Disclaimer: No booking guarantee. No ranking. No marketplace listing.
```

**Footer:**
```
Tagline:    Pre-booking intelligence for live music.
Disclaimer: GIGPROOF is a working product name. No booking guarantee, ranking or prediction.
```

### 9.3 Canonical FAQ Q&As (§A.7 — 6 items)

All 6 are used on Homepage accordion + FAQ standalone page. Write as self-contained direct answers.

| Q | A |
|---|---|
| What is a Bookability Passport? | A buyer-facing evidence profile that presents supported live-demand and commercial signals with their context, source method and review date. |
| How does GIGPROOF help independent artists? | Turns fragmented ticket exports, settlement sheets, repeat invitations and source confirmations into professional evidence. |
| Is GIGPROOF an EPK or booking marketplace? | No. It is pre-booking intelligence. No rankings, listings or booking guarantees. |
| Does GIGPROOF rank or score artists? | No. No rankings, predictions, percentiles or booking probabilities. |
| What information becomes public? | Only supported strengths selected and approved by the artist. |
| Who can use GIGPROOF? | Artists build proof. Booking managers evaluate. Producers assess fit and may confirm one bounded statement. |

### 9.4 Door Stamp Ruling (Maria, 01 Jul 2026)

> "אני לא מאשרת את השפה של ספירת ראשים — לעולם לא להשתמש בה"

- **FORBIDDEN everywhere:** "ראשים" · "ספירת ראשים" · "heads at the door" · "ראשים מאומתים"
- **Door stamp text override:** "מאומת · GIGPROOF" (pending Maria confirmation for exact final wording)
- **Draw language:** use "קהל" · "נוכחות" · "draw range" in English
- **Step 11 BLOCKER:** Maria confirms alternative door stamp text before deploy.

---

## 10. Image Assets

> Two approved real image assets (not AI-generated). Use as specified.

| File | Location | Usage |
|---|---|---|
| `gigproof-live-hero.png` | `G:\My Drive\...\Screens By Codex\assets\gigproof-live-hero.png` | Homepage hero background/beside H1. Opacity overlay 40%. Also OG image. |
| `gigproof-evidence-review.png` | `G:\My Drive\...\Screens By Codex\assets\gigproof-evidence-review.png` | `/artists` page + `/how-it-works`. Show product in context. |

**Copy to:** `/website/assets/gigproof-live-hero.png` and `/website/assets/gigproof-evidence-review.png`

OG image dimensions: export at 1200×630px from source. Place in `/website/assets/og/`.

---

## 11. Firewall Checklist for Codex

These are non-negotiable. Check before every PR or deploy.

- [ ] No `score`, `rating`, `percentile`, `rank`, `bookability_pct`, `fill_value`, or `completion_pct` in any HTML class or text
- [ ] Band pill renders as text ("60–100") in Space Mono — never as a filled bar or gauge
- [ ] "ראשים", "ספירת ראשים", "heads at the door", "ראשים מאומתים" = 0 occurrences in all files
- [ ] Every draw value appears with: band pill + method badge + context card + review date
- [ ] Streaming data appears in context strip only — never as a draw signal
- [ ] Passport demo page has `<meta name="robots" content="noindex, nofollow">`
- [ ] Contact form uses `mailto:` — no backend endpoint
- [ ] No price shown anywhere
- [ ] "Request beta access" is the default CTA label (not "Sign up", "Start for free", etc.)
- [ ] Door stamp text is "מאומת · GIGPROOF" (not "ראשים מאומתים")
- [ ] `/passport/demo` is the URL (not `/passport-demo`)
- [ ] `netlify.toml` does not exist in the project

---

## 12. Migration Brief — From Codex Drive Folder to Repo

> How Code goes from what Codex produced in Drive to the live repo at `C:\Users\user\GIGPROOF\website\`.
> **Do NOT copy files blindly — the Drive releases are REFERENCE ONLY. The repo is the build target.**

### 12.1 What Codex produced in Drive

Codex delivered outputs to:
```
G:\My Drive\Work Projects\V6 - Maria's Talent Growth System\
  B4 - [APP NAME] - Artist Booking Intelligence & Growth System\
    Screens By Codex\PUBLIC WEBSITE\
      assets\         ← image files (PNG + WebP) — use these
      source\         ← versioned CSS files v42–v62 — DO NOT use directly
      releases\       ← v61, v62, v63 HTML packages — use as content reference
      robots.txt      ← reference
      sitemap.xml     ← reference (regenerate from canonical sitemap below)
```

### 12.2 Step-by-step migration

**Step 1 — Copy assets (Maria or Code does this once)**

Copy the following from Drive `assets\` → `C:\Users\user\GIGPROOF\website\assets\`:

Prefer `.webp` over `.png` for every file that has both.

```
gigproof-live-hero.webp
gigproof-evidence-review.webp
gigproof-artist-ecosystem.webp
gigproof-persona-artist-v1.webp
gigproof-persona-manager-v1.webp
gigproof-persona-producer-v1.webp
gigproof-icons.svg
maya-vale-passport-hero-v2.png        (no webp version — keep PNG)
maya-vale-profile-v2.png              (no webp version — keep PNG)
maya-vale-live-proof-v2.png           (no webp version — keep PNG)
shidapu-roy-sason-profile-official-v1.jpg
shidapu-goa-atmosphere-hero-v1.webp
artist-dj-club-v1.webp                (if webp exists; else PNG)
artist-dj-festival-v1.webp
artist-dj-open-format-v1.webp
artist-live-electronic-v1.webp
artist-live-band-v1.webp
```

Also create `website/assets/og/` and add OG variants:
```
gigproof-live-hero-og.png     ← export at 1200×630 from source PNG
```

**Step 2 — Use v62 HTML releases as CONTENT reference only**

Open `releases\v62\` HTML files. Extract:
- Navigation structure
- Section copy and headings
- Proof Unit component HTML
- Band pill markup
- Any interactive demo HTML

Do NOT copy their `<link rel="stylesheet">` references — those point to versioned Drive CSS files. All styles go in the repo's single shared `website/styles.css`.

Do NOT copy `<meta lang="he">` or RTL attributes — EN ships first (Q6).

**Step 3 — Consolidate styles from reference files**

Reference CSS files to read (do NOT copy verbatim):
- `source/public-professional-system-v62.css` — the most current base
- `source/public-design-system-v60.css` — fallback if v62 is missing a token

Extract CSS custom properties (design tokens) into the repo's `website/styles.css`:

```css
:root {
  --color-paper:  #EFEBDF;
  --color-ink:    #16150F;
  --color-stamp:  #5B3FD6;
  --color-night:  #0E0E13;
  --color-tally:  #7A766A;
  --color-void:   #B23B2E;
  --radius:       2px;
  --font-body:    'Heebo', sans-serif;
  --font-display: 'Archivo Black', sans-serif;
  --font-mono:    'Space Mono', monospace;
}
```

All other styles live in `styles.css` as flat CSS — no build tool, no preprocessor.

**Step 4 — Fix critical bugs before any new work**

```
index.html line 2:  change lang="he" dir="rtl" → lang="en" dir="ltr"
passport-demo.html: move to website/passport/index.html
All nav hrefs:      "passport-demo.html" → "/passport/demo"
```

**Step 5 — Build new pages, don't port old ones**

The Drive HTML files are reference, not source. Build each new page from scratch using:
- The sitemap from §1
- The per-page wireframes from §3
- The SEO specs from §8
- The copy bank from §9

Pages already in repo that need review before expanding:
- `index.html` → fix lang bug → review vs v62 reference → update
- `artists.html` → review vs v62 reference → update to match §3
- `bookers.html` → review vs v62 reference → update to match §3
- `contact.html` → keep simple, fix any lang bug
- `how-it-works.html` → review vs v62 reference → update to match §8 SEO spec

Pages new to repo (not yet created):
- `producers.html`
- `pricing.html`
- `radar.html`
- `methodology.html`
- `faq.html`
- `passport/index.html` (renamed from passport-demo.html)

**Step 6 — Generate sitemap.xml in the repo**

Generate `website/sitemap.xml` with these canonical URLs (use [domain] placeholder until domain is confirmed):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://[domain]/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://[domain]/artists</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://[domain]/bookers</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://[domain]/producers</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://[domain]/how-it-works</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://[domain]/methodology</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://[domain]/pricing</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://[domain]/faq</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <!-- EXCLUDED: /radar (noindex draft), /passport/demo (noindex), /contact (noindex) -->
</urlset>
```

**Step 7 — Generate robots.txt in the repo**

```
User-agent: *
Allow: /
Disallow: /passport/
Disallow: /contact

Sitemap: https://[domain]/sitemap.xml
```

**Step 8 — Deploy to Vercel**

- Vercel project: the static site project (separate from the React/Vite app)
- Root directory: `website/` (or configure Vercel to serve from `/website`)
- No build command — static HTML
- Environment variables: none needed for static site
- After deploy: submit `sitemap.xml` to Google Search Console

### 12.3 What Code does NOT touch in Drive

Code works only in `C:\Users\user\GIGPROOF`. It does not write to Drive. If Code needs content from a Drive file, it reads it via file tools and extracts what it needs into the repo. It never modifies Drive files.

---

## 13. Drive Cleanup — Files to Delete

> Claude has no write access to Drive. This is a delete list for Maria to action manually,
> or for Code to complete if granted Drive access via the MCP.

### 13.1 Files safe to delete now

**Superseded CSS files** — `Screens By Codex\PUBLIC WEBSITE\source\`:

Delete everything except `public-design-system-v60.css` and `public-professional-system-v62.css`:

```
public-design-system-v42.css
public-design-system-v43.css
public-design-system-v44.css
public-design-system-v45.css
public-design-system-v46.css
public-design-system-v47.css
public-design-system-v48.css
public-design-system-v49.css
public-design-system-v50.css
public-design-system-v51.css
public-design-system-v52.css
public-design-system-v53.css
public-design-system-v54.css
public-design-system-v55.css
public-design-system-v56.css
public-design-system-v57.css
public-design-system-v58.css
public-design-system-v59.css
public-professional-system-v61.css   ← superseded by v62
(any file not explicitly listed as "keep" above)
```

**Superseded release package** — `Screens By Codex\PUBLIC WEBSITE\releases\`:

```
GIGPROOF_Public_Website_v61.zip     ← superseded by v62/v63
v61\  (entire folder if it exists)  ← superseded by v62/v63
```

**Windows system files** — scattered throughout:

```
All desktop.ini files — harmless but useless noise
```

### 13.2 Files to KEEP

```
source\public-design-system-v60.css          ← last stable reference
source\public-professional-system-v62.css    ← current reference
releases\v62\  (entire folder)               ← content reference for migration
releases\v63\  (entire folder)               ← newest content reference
assets\  (entire folder)                     ← all images, keep until confirmed in repo
robots.txt                                   ← reference
sitemap.xml                                  ← reference (superseded by repo version after Step 6)
```

### 13.3 Post-cleanup state (expected)

```
PUBLIC WEBSITE\
  assets\               ← all image files (copy to repo first before deleting anything here)
  source\
    public-design-system-v60.css
    public-professional-system-v62.css
  releases\
    v62\
    v63\
  robots.txt
  sitemap.xml
```
