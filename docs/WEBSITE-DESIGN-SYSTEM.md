# GIGPROOF Website Design System
> Brief for Codex: Port these tokens + component patterns into the website rebuild.
> Source: extracted from `/website/styles.css` (the existing prototype stylesheet).
> This is the design system — use it as the single source of truth for all visual decisions.

---

## 0. Design Philosophy

**Paper + Ink + Stamp** — a physical evidence aesthetic. Everything feels like a printed document, a rubber stamp, a field report. No gradients, no shadows, no glow. Proof is tactile.

- **No box-shadows** anywhere — borders only
- **2px border-radius** throughout — almost flat, slight softness
- **Space Mono** for all stamped/labeled elements — method labels, codes, numbers, eyebrows
- **Grain texture** on dark sections — reinforces tactile feel
- **Band pill** (`60–100`) is the ONLY draw format — never a gauge, fill, ring, or polygon

---

## 1. Color System

### CSS Custom Properties (paste into `:root`)
```css
:root {
  /* Core palette */
  --paper:     #EFEBDF;                      /* primary canvas — warm off-white */
  --ink:       #16150F;                      /* near-black text + primary UI */
  --stamp:     #5B3FD6;                      /* purple — verified, CTA, accent */
  --night:     #0E0E13;                      /* dark section background */
  --tally:     #7A766A;                      /* secondary / muted text */
  --void:      #B23B2E;                      /* red — errors, warnings, disclaimer */

  /* Derived / contextual */
  --paper-2:        #E8E4D8;                /* slightly darker paper for alt sections */
  --stamp-faint:    rgba(91, 63, 214, 0.07);/* stamp tint bg for subtle highlights */
  --ink-faint:      rgba(22, 21, 15, 0.06); /* ink tint bg for subtle dividers */
  --void-faint:     rgba(178, 59, 46, 0.08);/* red tint for disclaimer banners */
}
```

### Tailwind Config Equivalent (`tailwind.config.js` extend)
```js
colors: {
  paper:   '#EFEBDF',
  'paper-2': '#E8E4D8',
  ink:     '#16150F',
  stamp:   '#5B3FD6',
  night:   '#0E0E13',
  tally:   '#7A766A',
  void:    '#B23B2E',
},
```

### Color Usage Rules
| Color | Use for | Never use for |
|---|---|---|
| `--paper` | Page background, light section bg, text on dark | Borders (use tally) |
| `--paper-2` | Alternate section bg (`.section-alt`) | Primary content areas |
| `--ink` | Body text, headings, primary borders, `.btn-ink` bg | Text on dark bg (use paper) |
| `--stamp` | Method labels, verified badges, `.btn-stamp` bg, accent numbers | Body text, decorative use |
| `--night` | Dark section bg, footer bg | Any text color |
| `--tally` | Secondary text, labels, borders, muted metadata | Headings, primary content |
| `--void` | Error states, warning banners, disclaimer text | Success, positive states |

---

## 2. Typography

### Font Loading (add to `<head>` of every page)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Heebo:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

### Font Roles
```css
:root {
  --f-he:      'Heebo', sans-serif;          /* body text — Hebrew-native, RTL-optimized */
  --f-display: 'Archivo Black', sans-serif;  /* logo wordmark ONLY */
  --f-mono:    'Space Mono', monospace;      /* ALL labels, stamps, codes, eyebrows, pills */
}
```

**Rule:** `Space Mono` is the "proof identity" font. Every stamped, labeled, or coded element uses it.

### Type Scale
```css
h1 {
  font-family: var(--f-he);
  font-size: clamp(2rem, 5.5vw, 4.4rem);
  font-weight: 700;
  line-height: 1.1;
  color: var(--ink);          /* or --paper on dark bg */
}

h2 {
  font-family: var(--f-he);
  font-size: clamp(1.5rem, 3.5vw, 2.6rem);
  font-weight: 700;
  line-height: 1.2;
}

h3 {
  font-family: var(--f-he);
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.3;
}

h4 {
  font-family: var(--f-he);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  font-weight: 500;
}

body, p {
  font-family: var(--f-he);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ink);
}

/* Eyebrow — used above every major section heading */
.eyebrow {
  font-family: var(--f-mono);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tally);
  display: block;
  margin-bottom: 12px;
}

/* Mono label — for all coded/stamped elements */
.mono-label {
  font-family: var(--f-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
}
```

### Tailwind Config Equivalent
```js
fontFamily: {
  he:      ['Heebo', 'sans-serif'],
  display: ['Archivo Black', 'sans-serif'],
  mono:    ['Space Mono', 'monospace'],
},
fontSize: {
  'eyebrow': ['0.68rem', { letterSpacing: '0.14em', fontWeight: '400' }],
  'h4':      ['0.85rem', { letterSpacing: '0.05em' }],
  'h3':      ['1.15rem', { lineHeight: '1.3', fontWeight: '600' }],
  // h1/h2 use clamp() — set in CSS directly
},
```

---

## 3. Layout & Spacing

### Layout Tokens
```css
:root {
  --r:    2px;      /* border-radius everywhere */
  --max:  1100px;   /* container max-width */
  --p:    24px;     /* mobile horizontal padding */
  --pl:   48px;     /* section-sm padding */
  --px:   80px;     /* desktop section vertical padding */
}
```

### Container
```css
.container {
  max-width: var(--max);  /* 1100px */
  margin: 0 auto;
  padding: 0 var(--p);    /* 24px sides */
}
```

### Section Types
```css
/* Standard light section */
.section {
  padding: var(--px) 0;           /* 80px top/bottom */
  background: var(--paper);
}

/* Compressed section */
.section-sm {
  padding: var(--pl) 0;           /* 48px top/bottom */
  background: var(--paper);
}

/* Alternate light section */
.section-alt {
  padding: var(--px) 0;
  background: var(--paper-2);     /* slightly darker paper */
}

/* Dark section — always add grain texture */
.section-night {
  padding: var(--px) 0;
  background: var(--night);
  color: var(--paper);
  position: relative;
  overflow: hidden;
}
/* Grain texture overlay for .section-night */
.section-night::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* grain SVG — see §8 */
  opacity: 0.04;
  pointer-events: none;
}
```

### Spacing Scale (Tailwind extend)
```js
spacing: {
  'section':    '80px',
  'section-sm': '48px',
  'container':  '1100px',
  'gutter':     '24px',
  'gutter-lg':  '48px',
},
borderRadius: {
  DEFAULT: '2px',
  'sm': '2px',
  'md': '2px',
  'lg': '4px',
  'full': '9999px',   /* for chips/pills */
},
```

---

## 4. Border System

### Border Tokens
```css
:root {
  --rule:        1px solid var(--tally);               /* standard divider */
  --rule-faint:  1px solid rgba(122, 118, 106, 0.25);  /* subtle divider */
  --rule-night:  1px solid rgba(255, 255, 255, 0.08);  /* on dark bg */
}
```

### Usage
- Standard section borders: `border-top: var(--rule)` / `border-bottom: var(--rule)`
- Grid card borders: `border: var(--rule)` with `overflow: hidden`
- Card inner rows: `border-bottom: var(--rule-faint)` for last separator
- Footer dividers: `border-top: var(--rule-night)`
- Night sections: `border-color: rgba(255,255,255,0.08)`

**No shadows. No `box-shadow`. Borders only.**

---

## 5. Button System

### CSS
```css
/* Base reset */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--f-mono);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  border-radius: var(--r);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.btn:hover { opacity: 0.85; }

/* Sizes */
.btn-lg { padding: 15px 32px; font-size: 0.85rem; }
.btn-sm { padding:  8px 16px; font-size: 0.72rem; }

/* Variants */
.btn-ink {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.btn-stamp {
  background: var(--stamp);
  color: #fff;
  border-color: var(--stamp);
}
.btn-outline {
  background: transparent;
  color: var(--ink);
  border-color: var(--ink);
}
.btn-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.30);
}
```

### Usage by Surface
| Variant | Use case |
|---|---|
| `btn-ink` | Primary CTA on light bg |
| `btn-stamp` | Verified / conversion CTA (Build Passport, Submit) |
| `btn-outline` | Secondary on light bg (See Sample) |
| `btn-ghost` | Secondary on dark/night bg |

### CTA Row Pattern
```html
<div class="cta-row">  <!-- gap: 12px, flex-wrap: wrap -->
  <a href="..." class="btn btn-ink btn-lg">עברית →</a>
  <a href="..." class="btn btn-ghost btn-lg">English</a>
</div>
```

---

## 6. Component Patterns

### 6.1 Proof Unit
The core display unit of the entire product. Always render as a 4-row bordered block.

```css
.proof-unit {
  border: var(--rule);
  border-radius: var(--r);
  overflow: hidden;
}
.pu-header {
  padding: 10px 16px;
  background: var(--ink-faint);
  font-family: var(--f-mono);
  font-size: 0.72rem;
  color: var(--tally);
  border-bottom: var(--rule-faint);
}
.pu-row {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: var(--rule-faint);
  gap: 16px;
}
.pu-row:last-child { border-bottom: none; }

.pu-label {
  font-family: var(--f-mono);
  font-size: 0.62rem;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--tally);
  width: 62px;
  flex-shrink: 0;
  padding-top: 2px;
}
.pu-value {
  font-size: 0.9rem;
  color: var(--ink);
  flex: 1;
}
.pu-method {
  font-family: var(--f-mono);
  font-size: 0.72rem;
  color: var(--stamp);
}
.pu-vrf {
  font-family: var(--f-mono);
  font-size: 0.62rem;
  color: var(--tally);
  opacity: 0.5;
}
```

**Anatomy (in order):**
```
Header: "Club 45 · Tel Aviv · Jan 2026 · VRF-401"
Row 1: CLAIM    │ [band-pill: 70–100]
Row 2: CONTEXT  │ Standalone · cap 180 · Tuesday
Row 3: METHOD   │ ✓ Confirmed by producer · Shai Levi
Row 4: VRF      │ VRF-401
```

**Firewall rule:** The band-pill inside a proof-unit is ALWAYS a range (`60–100`), never a single number, never a gauge, never colored by value.

---

### 6.2 Band Pill
```css
.band-pill {
  display: inline-flex;
  align-items: center;
  font-family: var(--f-mono);
  font-weight: 700;
  background: var(--ink);
  color: var(--paper);
  padding: 3px 10px;
  border-radius: var(--r);
  font-size: 0.9rem;
  letter-spacing: 0.04em;
}
.band-pill-lg {
  font-size: 3rem;
  padding: 8px 20px;
}
```

**Values are always a band:** `60–100`, `50–150`, `80–120` — never `87`, never `87%`, never `87/100`.

---

### 6.3 Draw Block
Used on passport-demo to show the aggregated draw evidence.

```css
.draw-block {
  border: var(--rule);
  border-radius: var(--r);
  padding: 24px;
}
.draw-band-display {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}
.draw-method {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.draw-method-badge {
  font-family: var(--f-mono);
  font-size: 0.68rem;
  background: var(--stamp);
  color: #fff;
  padding: 3px 10px;
  border-radius: var(--r);
}
.draw-context-card {
  border: var(--rule-faint);
  border-radius: var(--r);
  padding: 14px 16px;
  background: var(--stamp-faint);
}
```

---

### 6.4 Problem Grid (3-col)
```css
.problem-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: var(--rule);
  border-radius: var(--r);
  overflow: hidden;
}
.problem-card {
  padding: 28px 24px;
  border-right: var(--rule);   /* RTL: border-left */
}
.problem-card:last-child { border-right: none; }

.card-num {
  font-family: var(--f-mono);
  font-size: 1.8rem;
  color: var(--tally);
  margin-bottom: 12px;
  display: block;
}

/* Mobile */
@media (max-width: 720px) {
  .problem-grid { grid-template-columns: 1fr; }
  .problem-card { border-right: none; border-bottom: var(--rule); }
  .problem-card:last-child { border-bottom: none; }
}
```

---

### 6.5 Steps Grid (3-col)
```css
.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.step-card {
  padding: 24px;
  border: var(--rule);
  border-radius: var(--r);
}
.step-num {
  font-family: var(--f-mono);
  font-size: 2rem;
  color: var(--stamp);
  display: block;
  margin-bottom: 12px;
}
@media (max-width: 720px) {
  .steps-grid { grid-template-columns: 1fr; }
}
```

---

### 6.6 Feature List (feat-list)
```css
.feat-list {
  border: var(--rule);
  border-radius: var(--r);
  overflow: hidden;
}
.feat-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: var(--rule-faint);
}
.feat-row:last-child { border-bottom: none; }
.feat-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  color: var(--stamp);
}
.feat-content { flex: 1; }
.feat-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 4px;
}
```

---

### 6.7 For-Grid (2-col audience cards)
```css
.for-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.for-card-artist {
  border: var(--rule);
  border-top: 3px solid var(--stamp);
  border-radius: var(--r);
  padding: 28px;
}
.for-card-booker {
  border: var(--rule);
  border-top: 3px solid var(--ink);
  border-radius: var(--r);
  padding: 28px;
}
@media (max-width: 720px) {
  .for-grid { grid-template-columns: 1fr; }
}
```

---

### 6.8 Pillars Grid (4-col)
```css
.pillars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.pillar {
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--r);
}
.pillar-num {
  font-family: var(--f-mono);
  font-size: 1.6rem;
  color: var(--stamp);
  display: block;
  margin-bottom: 12px;
}
@media (max-width: 880px) {
  .pillars-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .pillars-grid { grid-template-columns: 1fr; }
}
```

---

### 6.9 Timeline (Step-by-Step)
```css
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-inline-start: 2px solid var(--stamp-faint);
  /* RTL: border-right instead of border-left */
  padding-inline-start: 24px;
}
.timeline-item {
  position: relative;
  padding-bottom: 32px;
}
.timeline-marker {
  position: absolute;
  inset-inline-start: -33px;    /* RTL: right: -33px */
  width: 20px;
  height: 20px;
  background: var(--paper);
  border: 2px solid var(--stamp);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--f-mono);
  font-size: 0.65rem;
  color: var(--stamp);
}
.timeline-body {
  padding-top: 2px;
}
```

---

### 6.10 Players Grid (3-col A/B/C)
```css
.players-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.player-card {
  border: var(--rule);
  border-radius: var(--r);
  padding: 28px;
}
.player-num {
  font-family: var(--f-mono);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--stamp);
  display: block;
  margin-bottom: 8px;
}
```

---

### 6.11 Page Header Variants
```css
/* Base page header */
.page-header {
  padding: 56px 0 44px;
  border-bottom: var(--rule);
  background: var(--paper);
}
/* Purple header (for Artists page) */
.page-header-stamp {
  background: var(--stamp);
  color: var(--paper);
}
.page-header-stamp .eyebrow { color: rgba(239, 235, 223, 0.7); }
/* Dark header (for Bookers page) */
.page-header-night {
  background: var(--night);
  color: var(--paper);
}
.page-header-night .eyebrow { color: rgba(122, 118, 106, 0.8); }
```

---

### 6.12 Geo Chip
```css
.geo-chip {
  display: inline-flex;
  font-family: var(--f-mono);
  font-size: 0.68rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 4px 10px;
  border-radius: var(--r);
  color: rgba(239, 235, 223, 0.85);
}
```

---

### 6.13 Disclaimer Banner
```css
.disclaimer-banner {
  background: rgba(178, 59, 46, 0.08);
  border-bottom: 1px solid rgba(178, 59, 46, 0.2);
  padding: 10px var(--p);
  text-align: center;
  font-family: var(--f-mono);
  font-size: 0.72rem;
  color: var(--void);
  letter-spacing: 0.04em;
}
```

---

### 6.14 Accordion / FAQ
```css
.accordion-item {
  border-bottom: var(--rule);
}
.accordion-trigger {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--f-he);
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
  text-align: start;
}
.accordion-trigger .icon {
  font-family: var(--f-mono);
  color: var(--tally);
  font-size: 1.2rem;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.accordion-item.open .icon { transform: rotate(45deg); }
.accordion-body {
  display: none;
  padding-bottom: 20px;
  color: var(--tally);
  line-height: 1.6;
}
.accordion-item.open .accordion-body { display: block; }
```

---

### 6.15 Contact Form
```css
.contact-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  align-items: start;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}
.form-label {
  font-family: var(--f-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--tally);
}
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--tally);
  border-radius: var(--r);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--f-he);
  font-size: 0.95rem;
  transition: border-color 0.15s;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--stamp);
}
.form-textarea { resize: vertical; min-height: 120px; }
@media (max-width: 720px) {
  .contact-grid { grid-template-columns: 1fr; gap: 32px; }
}
```

---

### 6.16 Navbar
```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--paper);
  border-bottom: var(--rule);
  height: 64px;
  display: flex;
  align-items: center;
}
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 var(--p);
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--ink);
  font-family: var(--f-display);
  font-size: 1.1rem;
  letter-spacing: 0.02em;
}
.nav-links {
  display: flex;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-links a {
  font-family: var(--f-mono);
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: var(--tally);
  text-decoration: none;
  transition: color 0.15s;
}
.nav-links a:hover,
.nav-links a.active { color: var(--ink); }
.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lang-btn {
  font-family: var(--f-mono);
  font-size: 0.72rem;
  border: var(--rule);
  padding: 5px 10px;
  border-radius: var(--r);
  background: none;
  color: var(--tally);
  cursor: pointer;
}
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  padding: 4px;
  background: none;
  border: none;
}
.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--ink);
}
/* Mobile */
@media (max-width: 720px) {
  .nav-links, .nav-cta { display: none; }
  .hamburger { display: flex; }
}

/* Mobile drawer */
.nav-drawer {
  position: fixed;
  inset: 0;
  background: var(--paper);
  z-index: 200;
  padding: 80px var(--p) var(--p);
  display: flex;
  flex-direction: column;
  gap: 24px;
  transform: translateX(100%);
  transition: transform 0.25s ease;
}
.nav-drawer.open { transform: translateX(0); }
.nav-drawer a {
  font-family: var(--f-he);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  padding: 12px 0;
  border-bottom: var(--rule-faint);
}
```

---

### 6.17 Footer
```css
.footer {
  background: var(--night);
  padding: var(--px) 0 0;
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 var(--p) var(--px);
}
.footer-col-title {
  font-family: var(--f-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--tally);
  margin-bottom: 16px;
}
.footer-col a {
  display: block;
  color: rgba(239, 235, 223, 0.6);
  font-size: 0.9rem;
  text-decoration: none;
  margin-bottom: 10px;
  transition: color 0.15s;
}
.footer-col a:hover { color: var(--paper); }
.footer-disclaimer {
  border-top: var(--rule-night);
  padding: 20px var(--p);
  max-width: var(--max);
  margin: 0 auto;
  font-family: var(--f-mono);
  font-size: 0.65rem;
  color: var(--tally);
  letter-spacing: 0.04em;
  text-align: center;
}
@media (max-width: 720px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .footer-grid { grid-template-columns: 1fr; }
}
```

---

### 6.18 Door-Stamp SVG
Used in navbar logo and as a decorative watermark. Inline SVG — not an `<img>` tag.

```css
/* Watermark variant (hero background) */
.door-stamp-bg {
  position: absolute;
  width: 300px;
  height: 300px;
  opacity: 0.08;
  transform: rotate(-12deg);
  pointer-events: none;
  /* position varies per section — usually top-right or center */
}
/* Passport header variant */
.door-stamp-passport {
  width: 130px;
  height: 130px;
  transform: rotate(-7deg);
  opacity: 0.9;
  color: var(--paper);
}
```

Sizes: `sm (64px)` · `md (110px)` · `lg (180px)` · `bg (300px, 8% opacity)`

---

### 6.19 Proof Flow Strip
```css
.proof-flow {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-top: var(--rule);
  border-bottom: var(--rule);
  padding: 0;
}
.proof-flow-inner {
  display: flex;
  align-items: center;
  gap: 0;
  min-width: max-content;
  padding: 16px var(--p);
}
.flow-step {
  font-family: var(--f-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--tally);
  padding: 8px 20px;
  white-space: nowrap;
}
.flow-step.active { color: var(--stamp); }
.flow-arrow {
  color: var(--rule);
  font-family: var(--f-mono);
  padding: 0 4px;
}
```

---

## 7. Grain Texture

Applied to all `.section-night` backgrounds. Inline SVG data URI:

```css
.section-night::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
}
.section-night > * { position: relative; z-index: 1; }
```

---

## 8. RTL / LTR Handling

```css
/* Default: RTL (Hebrew) */
html[dir="rtl"] {
  text-align: right;
}
html[dir="rtl"] .nav-links { flex-direction: row; }
html[dir="rtl"] .problem-card { border-right: none; border-left: var(--rule); }
html[dir="rtl"] .problem-card:last-child { border-left: none; }
html[dir="rtl"] .timeline {
  border-inline-start: 2px solid var(--stamp-faint);
}

/* Use logical properties throughout for automatic RTL support */
/* margin-inline-start instead of margin-left */
/* padding-inline-end instead of padding-right */
/* border-inline-start instead of border-left */
```

**Rule for Codex:** prefer CSS logical properties (`margin-inline-start`, `padding-inline-end`, `border-inline-start`, `inset-inline-start`) everywhere so RTL/LTR flips automatically without conditional rules.

---

## 9. Responsive Breakpoints

```css
/* Mobile-first — defaults are mobile */

/* Tablet+ */
@media (min-width: 720px) {
  /* show nav links, hide hamburger */
  /* problem-grid → 3-col */
  /* steps-grid → 3-col */
  /* for-grid → 2-col */
  /* contact-grid → 2-col */
}

/* Desktop */
@media (min-width: 880px) {
  /* pillars-grid → 4-col */
}
```

| Token | Breakpoint | Change |
|---|---|---|
| Nav hamburger | ≤720px | Show hamburger, hide links |
| problem-grid | ≤720px | 3-col → 1-col |
| steps-grid | ≤720px | 3-col → 1-col |
| for-grid | ≤720px | 2-col → 1-col |
| contact-grid | ≤720px | 2-col → 1-col |
| footer-grid | ≤720px | 4-col → 2-col |
| footer-grid | ≤480px | 2-col → 1-col |
| pillars-grid | ≤880px | 4-col → 2-col |
| pillars-grid | ≤480px | 2-col → 1-col |

**WhatsApp test (390px):** passport-demo must render without horizontal scroll. band-pill-lg should be centered, proof-units should be single-column, all text readable.

---

## 10. Firewall Enforcement in CSS

These CSS patterns are **FORBIDDEN** — if Codex generates them, reject and rewrite:

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

---

## 11. Codex Build Checklist

Before shipping any page, verify:

- [ ] `<html dir="rtl" lang="he">` on every page
- [ ] One `styles.css` — no per-page stylesheets
- [ ] Google Fonts loaded in `<head>` (Heebo + Archivo Black + Space Mono)
- [ ] Door-stamp SVG is inline — not `<img src>`
- [ ] All user-facing strings have `.lang-he-inline` + `.lang-en-inline` siblings
- [ ] `applyLang()` runs on DOMContentLoaded using `localStorage.getItem('gp_lang')`
- [ ] No `box-shadow` anywhere
- [ ] No `border-radius` > 4px on any component
- [ ] Band pills always show a range (`60–100`) — never a single number
- [ ] Method label always visible alongside any claim
- [ ] Disclaimer banner on passport-demo is undismissable
- [ ] "No booking guarantee" copy appears in footer and passport-demo footer bar
- [ ] No use of "ראשים" anywhere in HE strings
- [ ] `אמרגן` and `מפיק` are never merged into one term
- [ ] Contact form uses `handleSubmit(event)` — static JS stub, no backend
- [ ] `netlify.toml` does NOT exist
