# GIGPROOF — Website Build Canon
**Document:** WEBSITE-BUILD-CANON.md
**Version:** 1.0 · **Date:** 01 Jul 2026 · **Owner:** Maria (R00) · **Architect:** Claude (R16)
**Scope:** Web engineering canon for the public marketing website built with Claude Code.
**Rule:** Update in place. Never duplicate.
**Language:** EN (this document); all HE copy lives in the Localization Matrix.

> ⚠️ NOTE: This is the **engineering/technical reference** for Claude Code.
> It is NOT product canon. Product canon lives in `docs/canon/` and `CLAUDE.md`.
> For GIGPROOF-specific decisions, page map, copy, and firewall rules → `docs/WEBSITE-ARCHITECTURE.md`.
> This document governs HOW to build pages (skeleton patterns, JSON-LD, accessibility, performance).

---

## WHO THIS DOCUMENT IS FOR

- **Maria (R00):** Strategic decisions marked ★ require your call before Claude Code builds.
- **Claude Code:** Read §1 (framework decision) and §2 (global skeleton) before writing a single file. Read the relevant §3 page-type section before building any specific page. Never deviate from the patterns here without R00 approval.
- **Future Claude sessions:** This is the architecture record. Never rebuild from scratch — update this doc and version-bump.

---

## §1 — FRAMEWORK DECISION

### 1.1 Framework: Next.js (App Router) — CONFIRMED ✅

**Decision owner:** Claude R16 (tech authority, delegated by R00 on 06 Jul 2026)

**Why NOT plain React + Vite for the public website:**

React + Vite is CSR (Client-Side Rendering) by default — the browser gets an empty HTML shell and builds the page with JavaScript.

**Problem 1 — Search engines see an empty page.** When a crawler fetches the homepage, it gets `<div id="root"></div>`. Googlebot eventually renders JS but uses a secondary indexing queue (days to weeks delay).

**Problem 2 — AI search engines can't extract facts.** ChatGPT, Gemini, Perplexity, Claude web parse raw HTML. If HTML is empty until JS runs, they skip the page or misread it. JSON-LD structured data must be in the HTML on the first byte.

**Why Next.js over Astro:**

| | Next.js | Astro |
|---|---|---|
| Rendering | SSG + SSR + ISR | SSG (zero JS default) |
| React ecosystem | ✅ same as app | ⚠️ React optional |
| Passport page (SSR needed) | ✅ native | ⚠️ requires adapter |
| Vercel support | ✅ first-class | ✅ good |
| Component sharing with app | ✅ easy | ⚠️ friction |

**Decision: Next.js (App Router).** The public Passport (`/passport/:id`) is both a marketing surface and an app route. Same React ecosystem means ProofUnit, BandPill, and other components can eventually be shared between marketing site and app without duplication.

### 1.2 Project structure: Two separate Vercel projects

**Decision:** Keep React+Vite app as-is. New Next.js project for public marketing website.

| Project | Stack | Domain | Vercel project |
|---|---|---|---|
| Public marketing website | Next.js (App Router) | gigproof.co | new |
| Authenticated app | React + Vite | app.gigproof.co | existing |

**Rationale:** App migration to Next.js is Gate-2+ scope. At Gate-1, the app is working and deployed. Don't migrate mid-validation. Shared components between the two projects are deferred to full-beta.

**Passport demo page** at `/passport/demo` is static HTML on the marketing site. Real Passport pages (`/passport/:id`) are served from the app at Gate-1; when they become public-indexable assets at full-beta, they move to Next.js.

### 1.3 Rendering mode per page

| Page | Rendering | Why |
|---|---|---|
| `/` (Homepage) | SSG | Content changes rarely; max CDN performance |
| `/artists`, `/bookers`, `/producers` | SSG | Same |
| `/how-it-works`, `/methodology` | SSG | Reference content |
| `/pricing` | SSG | Same |
| `/faq` | SSG | Same |
| `/radar` (draft) | SSG | Draft only; noindex until updated |
| `/passport/demo` | SSG | Static demo; noindex |
| `/passport/:id` | SSR or ISR | **Gate-2+** — dynamic per artist; not in scope now |
| `/contact` | SSG | Simple page; noindex |

### 1.4 Hosting

Next.js on **Vercel** — already in use for the app. Full Next.js feature support from day one (ISR, edge functions, image optimization). No configuration overhead.

---

## §2 — GLOBAL SKELETON (every page, every time)

The following must be present on every page. Claude Code must include all of these before any page-specific content.

### 2.1 HTML document structure

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <!-- EN ships first (Q6 decision). HE pages: lang="he" dir="rtl" — deferred. -->
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- TITLE + META (unique per page — never duplicate across pages) -->
  <title>[Page-specific title] | GIGPROOF</title>
  <meta name="description" content="[Page-specific description, 150–160 chars]" />
  <link rel="canonical" href="https://[domain]/[this-page-path]" />

  <!-- OPEN GRAPH (required for WhatsApp previews, LinkedIn, Facebook) -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="[Same as title tag]" />
  <meta property="og:description" content="[Same as meta description]" />
  <meta property="og:image" content="https://[domain]/og/[page-specific-og-image].jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="https://[domain]/[this-page-path]" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content="GIGPROOF" />

  <!-- TWITTER/X CARD -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="[Same as og:title]" />
  <meta name="twitter:description" content="[Same as og:description]" />
  <meta name="twitter:image" content="[Same as og:image]" />

  <!-- STRUCTURED DATA: Organization (every page) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://[domain]/#organization",
    "name": "GIGPROOF",
    "url": "https://[domain]",
    "description": "Pre-booking proof infrastructure for the live music industry.",
    "foundingDate": "2025",
    "knowsAbout": ["live music booking", "artist proof of draw", "pre-booking intelligence"],
    "sameAs": []
  }
  </script>

  <!-- STRUCTURED DATA: WebSite (every page) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://[domain]/#website",
    "url": "https://[domain]",
    "name": "GIGPROOF",
    "publisher": { "@id": "https://[domain]/#organization" },
    "inLanguage": "en"
  }
  </script>

  <!-- PAGE-SPECIFIC structured data goes here — see §3 -->

  <!-- FAVICON + PWA -->
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />

  <!-- FONTS: preconnect before loading. Only used weights. -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap" />

  <!-- HREFLANG (scaffold only — D-008 OPEN, not active at launch) -->
  <!--
  <link rel="alternate" hreflang="en" href="https://[domain]/[path]" />
  <link rel="alternate" hreflang="he" href="https://[domain]/he/[path]" />
  <link rel="alternate" hreflang="x-default" href="https://[domain]/[path]" />
  -->
</head>
<body>
  <!-- SKIP NAVIGATION (accessibility — first element always) -->
  <a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>

  <header><!-- §2.3 --></header>

  <main id="main-content" role="main">
    <!-- Page content here -->
  </main>

  <footer><!-- §2.4 --></footer>
</body>
</html>
```

### 2.2 Title + meta rules

| Rule | Detail |
|---|---|
| Title format | `[Page topic] \| GIGPROOF` — 50–60 chars total |
| Description | 150–160 chars. Benefit-first, not feature-first. No keyword stuffing. |
| Unique per page | Duplicate titles/descriptions = crawl signal that both pages are duplicates |
| Homepage exception | `GIGPROOF — [one-line positioning]` (no pipe separator) |
| OG image | 1200×630px, WebP or JPG. Key content centered (WhatsApp crops to 1:1 center) |
| `noindex` | Only on: `/passport/demo`, `/contact`, `/radar` (draft), `/thank-you` pages |

### 2.3 Global navigation (Header)

```html
<header>
  <nav aria-label="Primary navigation">
    <a href="/" aria-label="GIGPROOF — Home">
      <!-- Logo SVG — inline, not <img>. Inline SVG is indexed by Google. -->
    </a>

    <ul role="list">
      <li><a href="/artists">For Artists</a></li>
      <li><a href="/bookers">For Booking Managers</a></li>
      <li><a href="/how-it-works">How It Works</a></li>
      <li><a href="/pricing">Pricing</a></li>
    </ul>

    <a href="[app-url]/signup" class="btn-primary">Request beta access</a>

    <!-- Mobile hamburger -->
    <button aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
      <!-- Hamburger icon -->
    </button>

    <div id="mobile-menu" hidden>
      <!-- Same links as desktop, same order -->
    </div>
  </nav>
</header>
```

**Navigation rules:**
- Logo is always a link to `/` — never just an image
- Active page gets `aria-current="page"` on its nav link
- Mobile menu: `aria-expanded` toggles true/false; `hidden` attribute toggles
- CTA is `<a>` styled as button (it navigates to a page). `<button>` only for JS actions
- Max 5–7 nav items

### 2.4 Global footer

```html
<footer aria-label="Footer">
  <!-- Logo or wordmark -->
  <!-- Short positioning line -->

  <nav aria-label="Product links">
    <a href="/artists">For Artists</a>
    <a href="/bookers">For Booking Managers</a>
    <a href="/producers">For Producers</a>
    <a href="/passport/demo">Passport Demo</a>
    <a href="/how-it-works">How It Works</a>
    <a href="/methodology">The Method</a>
  </nav>

  <nav aria-label="Company links">
    <a href="/pricing">Pricing</a>
    <a href="/faq">FAQ</a>
    <a href="/contact">Contact</a>
  </nav>

  <small>
    © [year] GIGPROOF. No booking guarantee, ranking or prediction.
    Historical evidence only.
  </small>
</footer>
```

### 2.5 Performance rules (every page)

| Rule | Implementation |
|---|---|
| Images | `<img>` with `width` + `height` attributes. WebP format. `loading="lazy"` below fold. Above-fold hero: `loading="eager"` + `fetchpriority="high"`. |
| Fonts | Preconnect. `font-display: swap`. Only used weights. |
| JS bundles | No JS on static pages unless component is interactive. Marketing pages = near-zero client JS. |
| Core Web Vitals | LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1 · TTFB ≤ 800ms |
| No render-blocking | CSS in `<head>`. JS with `defer` or `async`. |
| Image CLS | Never `width: 100%` without `aspect-ratio` or explicit height. |

### 2.6 Accessibility baseline (every page)

| Rule | Why |
|---|---|
| Skip-nav link (first element) | Keyboard users skip repeated nav |
| Semantic HTML | `<h1>` → `<h2>` → `<h3>` — never skip levels. One `<h1>` per page. |
| Every `<img>` has `alt` | Descriptive for informational images. `alt=""` for decorative ones. |
| Color contrast | Text ≥ 4.5:1 against background (WCAG AA) |
| Focus indicators | Never `outline: none` without visible replacement |
| Tap targets | Min 44×44px on mobile |
| Forms | Every `<input>` has associated `<label>`. Never use `placeholder` as a label. |
| ARIA | Native HTML first. ARIA only when native HTML can't express the role. |

### 2.7 robots.txt + sitemap + llms.txt

**robots.txt** (at `/robots.txt`):
```
User-agent: *
Allow: /
Disallow: /passport/
Disallow: /contact
Disallow: /api/

Sitemap: https://[domain]/sitemap.xml
```

**sitemap.xml** — see canonical sitemap in `WEBSITE-ARCHITECTURE.md §12.2 Step 6`.

**llms.txt** (at `/llms.txt` — 2025 standard for AI crawlers):
```
# GIGPROOF
GIGPROOF is pre-booking intelligence for live music.
It helps booking managers (אמרגנים) evaluate unfamiliar artists through
standardized, method-labeled evidence before committing to a booking.

## What GIGPROOF is
- A Bookability Passport: buyer-facing evidence profile with method labels and review dates
- An Artist Radar: private evidence dashboard for artists
- A source-confirmation system: producers confirm one bounded claim via magic link

## What GIGPROOF is NOT
Not an EPK. Not a booking CRM. Not a ranking system. Not a marketplace.
No scores, no predictions, no guarantees.

## Key pages
- Homepage: https://[domain]/
- For Booking Managers: https://[domain]/bookers
- For Artists: https://[domain]/artists
- The Method: https://[domain]/methodology
- Passport Demo: https://[domain]/passport/demo
```

---

## §3 — PAGE-TYPE SKELETONS

### 3.1 HOMEPAGE (`/`)

**Rendering:** SSG

**HEAD additions:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://[domain]/#webpage",
  "url": "https://[domain]/",
  "name": "GIGPROOF — Pre-Booking Intelligence for Live Music",
  "isPartOf": { "@id": "https://[domain]/#website" },
  "about": { "@id": "https://[domain]/#organization" }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://[domain]/#app",
  "name": "GIGPROOF",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Pre-booking proof infrastructure for the live music industry. Booking managers evaluate artists through method-labeled evidence before committing.",
  "provider": { "@id": "https://[domain]/#organization" }
}
</script>
```

**BODY structure:**
```html
<main id="main-content">
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">[One-line positioning]</h1>
    <p>[Supporting line — who it's for and what pain it solves]</p>
    <a href="/artists">[Artist CTA]</a>
    <a href="/bookers">[Booking Manager CTA]</a>
  </section>

  <section aria-labelledby="problem-heading">
    <h2 id="problem-heading">[The problem]</h2>
  </section>

  <section aria-labelledby="how-heading">
    <h2 id="how-heading">How It Works</h2>
    <ol>
      <li>[Step 1]</li>
      <li>[Step 2]</li>
      <li>[Step 3]</li>
    </ol>
  </section>

  <section aria-labelledby="audience-heading">
    <h2 id="audience-heading">[For whom]</h2>
    <article>
      <h3>[Artist headline]</h3>
      <p>[Artist value prop]</p>
      <a href="/artists">For Artists →</a>
    </article>
    <article>
      <h3>[Booking manager headline]</h3>
      <p>[Booking manager value prop]</p>
      <a href="/bookers">For Booking Managers →</a>
    </article>
  </section>

  <!-- FAQ (drives AI search visibility) -->
  <section aria-labelledby="faq-heading">
    <h2 id="faq-heading">Common Questions</h2>
    <!-- FAQPage JSON-LD — see §3.6 -->
  </section>

  <section>
    <h2>[Final CTA headline]</h2>
    <a href="[app-url]/signup">Request beta access →</a>
  </section>
</main>
```

**Rules:**
- One `<h1>`. Every other section gets `<h2>`.
- No testimonials unless real, attributed, approved by the source
- No metrics ("X artists") unless verified and current

---

### 3.2 PERSONA PAGE (`/artists`, `/bookers`, `/producers`)

**Rendering:** SSG

**HEAD additions:**
```html
<!-- BreadcrumbList -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://[domain]/" },
    { "@type": "ListItem", "position": 2, "name": "[Persona page name]", "item": "https://[domain]/[path]" }
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "[Title]",
  "description": "[Meta description]",
  "audience": { "@type": "Audience", "audienceType": "[booking manager / artist / producer]" },
  "isPartOf": { "@id": "https://[domain]/#website" }
}
</script>
```

**BODY structure:**
```html
<main id="main-content">
  <nav aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li aria-current="page">[This page name]</li>
    </ol>
  </nav>

  <section aria-labelledby="persona-heading">
    <h1 id="persona-heading">[Headline naming their specific problem]</h1>
    <p>[Their pain — in their vocabulary]</p>
    <a href="[action]">[CTA]</a>
  </section>

  <section aria-labelledby="problem-heading">
    <h2 id="problem-heading">[Problem headline]</h2>
  </section>

  <section aria-labelledby="solution-heading">
    <h2 id="solution-heading">[Solution from their perspective]</h2>
  </section>

  <section aria-labelledby="product-heading">
    <h2 id="product-heading">[What they actually see]</h2>
    <!-- Real product screenshot or illustration -->
  </section>

  <!-- FAQ: persona-specific questions (min 3) -->
  <section aria-labelledby="faq-heading">
    <h2 id="faq-heading">Questions</h2>
    <!-- FAQPage JSON-LD — see §3.6 -->
  </section>

  <section>
    <h2>[CTA headline]</h2>
    <a href="[action]">[CTA]</a>
  </section>
</main>
```

**Rules:**
- Heading hierarchy mirrors the persona's decision journey, not the company's feature list
- Never use the other persona's vocabulary on this page
- FAQ section on every persona page (minimum 3 Q&As) — drives AI search visibility

---

### 3.3 METHODOLOGY PAGE (`/methodology`)

**Rendering:** SSG

**HEAD additions:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://[domain]/methodology#article",
  "headline": "The GIGPROOF Verification Method",
  "description": "[Meta description]",
  "url": "https://[domain]/methodology",
  "publisher": { "@id": "https://[domain]/#organization" },
  "about": [
    { "@type": "Thing", "name": "source confirmation" },
    { "@type": "Thing", "name": "method labels" },
    { "@type": "Thing", "name": "proof units" }
  ]
}
</script>
```

**BODY structure:**
```html
<main id="main-content">
  <article>
    <header>
      <h1>The Method</h1>
      <p>[One-sentence summary]</p>
    </header>

    <section aria-labelledby="proof-unit-heading">
      <h2 id="proof-unit-heading">Proof Unit</h2>
      <!-- claim + context + method-label + reviewed date -->
    </section>

    <section aria-labelledby="verification-levels-heading">
      <h2 id="verification-levels-heading">Verification Levels</h2>
      <dl>
        <dt>VERIFIED</dt>
        <dd>[What it means, what source earns it]</dd>
        <dt>SUPPORTED</dt>
        <dd>[...]</dd>
        <dt>SELF-REPORTED</dt>
        <dd>[...]</dd>
      </dl>
    </section>

    <section aria-labelledby="what-we-dont-measure-heading">
      <h2 id="what-we-dont-measure-heading">What We Don't Measure</h2>
      <!-- Firewall explained in plain language — no scores, no rankings, no predictions -->
    </section>

    <section aria-labelledby="freshness-heading">
      <h2 id="freshness-heading">Evidence Freshness</h2>
    </section>
  </article>
</main>
```

**Rules:**
- Use `<dl>` for term:definition pairs (semantically correct, Google-readable)
- No CTA on this page — its job is trust, not conversion
- No promotional language. Only precise, factual explanation.

---

### 3.4 PRICING PAGE (`/pricing`)

**Rendering:** SSG

**HEAD additions:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Pricing | GIGPROOF",
  "description": "[Pricing page meta]",
  "isPartOf": { "@id": "https://[domain]/#website" }
}
</script>
<!-- DO NOT add Offer schema with specific price — price not shown per Q3 decision -->
```

**Rules:**
- No price shown anywhere — all CTAs say "Request beta access" (Q3 decision)
- Never use "upgrade" language implying a paid Passport is more trustworthy (firewall violation)
- FAQ section: minimum "What does beta include?" and "How do I request access?"

---

### 3.5 FAQ PAGE (`/faq`) or FAQ SECTION (within any page)

**Rendering:** SSG

**JSON-LD (required whenever Q&A pairs exist):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Exact question text — must match visible H3]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer — must match visible answer. Under 300 words.]"
      }
    }
  ]
}
</script>
```

**BODY structure:**
```html
<section aria-labelledby="faq-heading">
  <h2 id="faq-heading">Common Questions</h2>

  <div itemscope itemtype="https://schema.org/Question">
    <h3 itemprop="name">[Question — character-for-character match to JSON-LD "name"]</h3>
    <div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
      <p itemprop="text">[Answer — match to JSON-LD "text"]</p>
    </div>
  </div>
</section>
```

**Rules:**
- JSON-LD "name" must be character-for-character identical to the visible H3
- JSON-LD "text" must match the visible answer — AI systems flag inconsistency
- Never invent questions — only questions real users actually ask
- Min 3, max ~15. More than 15 = split into categories.

---

### 3.6 PUBLIC PASSPORT PAGE (`/passport/demo` and eventually `/passport/:id`)

**`/passport/demo` (Gate-1):** Static demo — SSG, `noindex, nofollow`. No JSON-LD.

**`/passport/:id` (Gate-2+):** SSR or ISR — rendered from live claim data.

**HEAD for live Passport:**
```html
<title>[Artist stage name] — Bookability Passport | GIGPROOF</title>
<meta name="description" content="[Artist name], [genre], [city]. Method-labeled evidence." />
<!-- Live Passports ARE indexed — they are public marketing assets -->
<!-- Only withdrawn Passports: <meta name="robots" content="noindex" /> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://[domain]/passport/[id]",
  "name": "[Artist name] — Bookability Passport",
  "description": "[Artist positioning line]",
  "isPartOf": { "@id": "https://[domain]/#website" },
  "about": {
    "@type": "Person",
    "name": "[Artist stage name]",
    "jobTitle": "[Genre/format] Artist"
  },
  "datePublished": "[published_at]",
  "dateModified": "[last_updated]"
}
</script>
```

**Rules:**
- Must pass 30-second WhatsApp scan test at 390px — no login, no friction, visible proof
- `claim.value`, `gig.exact_count`, `claim.internal_confidence` — NEVER SELECT-able by public session (RLS enforced)
- Withdrawn Passport: `noindex`, graceful message only — do not 404, do not show content

---

### 3.7 LEGAL PAGES (`/privacy`, `/terms`)

**Rendering:** SSG. Indexed (low priority 0.3 in sitemap).

**HEAD additions:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Privacy Policy | GIGPROOF",
  "isPartOf": { "@id": "https://[domain]/#website" }
}
</script>
```

**Required sections for Amendment 13 (Israeli Privacy Protection Law) compliance:**
- Who controls the data
- What data is collected
- Why it is collected
- User rights (access, correct, delete, withdraw consent)
- Contact for requests

**Rules:**
- `<time datetime>` on "last updated" date — required for freshness signals
- Must reflect GIGPROOF's actual data practices — not a generic template
- BLOCKER: Real-data launch is blocked until counsel sign-off (SEC-01, Drive Restricted folder)

---

## §4 — CLAUDE CODE BUILD CHECKLIST

**Before writing any file:**
1. Read §1 — confirm framework and rendering mode
2. Read §2 — global skeleton is required infrastructure, not optional boilerplate
3. Read relevant §3 section for the page type

**While writing:**
4. `lang="en" dir="ltr"` on all EN pages (EN ships first — Q6)
5. Every `<img>` has `alt`
6. `<h*>` in correct hierarchy — never skip levels, one `<h1>` per page
7. JSON-LD in `<head>`, not at bottom of `<body>`
8. JSON-LD "name"/"text" fields match visible content exactly — no paraphrase
9. No `<div>` where a semantic element is correct (`<section>`, `<article>`, `<nav>`, `<aside>`)
10. No score, rating, percentile, rank, gauge, fill-bar anywhere — FIREWALL

**After writing:**
11. `view-source` shows full page content (not empty div) — if empty, rendering mode is wrong
12. Validate JSON-LD at Google Rich Results Test
13. Run Lighthouse on mobile — all Core Web Vitals green before deploy

---

## §5 — OPEN ITEMS (★ R00 DECISIONS PENDING)

| # | Decision | Status | Blocks |
|---|---|---|---|
| W1 | Next.js vs Astro | ✅ **CLOSED: Next.js** (06 Jul 2026) | — |
| W2 | Same domain vs subdomain for app | ✅ **CLOSED: Two Vercel projects** — gigproof.co (Next.js marketing) + app.gigproof.co (React+Vite app) (06 Jul 2026) | sitemap, canonical URLs |
| W3 | Domain name — not yet purchased | ⚠️ **OPEN — Maria action required** | All canonical URLs, all JSON-LD @id values |
| W4 | Pricing locked? | ✅ **CLOSED: No price shown** — "Request beta access" only (Q3, 01 Jul 2026) | Pricing page |
| W5 | HE-only or HE+EN at launch? | ✅ **CLOSED: EN ships first** (Q6, 01 Jul 2026) | lang attribute, hreflang, OG locale |
| W6 | llms.txt content approved? | ⚠️ **Draft in §2.7 — Maria to review wording** | AI search visibility |

---

*GIGPROOF — Website Build Canon · v1.0 · Living document — update in place, never duplicate*
