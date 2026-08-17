# LOCK SHOW Public Website Audit and Code Handoff

Status: OBSERVED LIVE AUDIT - NOT RELEASE PASS
Observed: 2026-08-17, `https://www.lock.show/`
Owner surface: Folder 95 Public Website
Brand authority: B4-35.10 and B4-35.20
GTM/claim authority: B4-70.10
Final Product, Brand, Business and Launch authority: Maria

This package is implementation evidence for Claude Code. It is not a competing
Drive authority and does not authorize deployment.

## Source Pack

- Control Tower v3.10: https://docs.google.com/document/d/15Ag69XaPZBrArMlbkAxwcPGBomKwO9qgtSDENVnLt7o/edit
- Brand Foundation v4.4: https://docs.google.com/document/d/1tT1aTLIWmPr2IHMWed_Y0UH7lofYaZ4al-QlwRj2Dpg/edit
- Product Language and Localization: https://docs.google.com/document/d/1S1ec242nwfxPkisTSMxUJ99g41gG-s8igk_IYyq79dc/edit
- Design System: https://docs.google.com/document/d/1ZgEA4QkgqOSCeWtcCIYFke_9iIrh7hxSvVBsHlbeVDs/edit
- GTM and Messaging: https://docs.google.com/document/d/1_gU-kyyM6ea2BGmk4XPAXzACDvtzfipcqGQkB_op0bg/edit
- Public Website role: https://docs.google.com/document/d/1wKgzwmCdOc0D2KxaIp2FgdgwOQxHI6kR-ZqCnLXpTRU/edit
- Website Delivery Index: https://docs.google.com/spreadsheets/d/1Bcv504jyNXcxAUI5MM0i7Mx9R5sICkENU3y_1Ssnlqo/edit

## Founder Decision: Brand Name

The public and spoken brand is **LOCK SHOW**. Never use `LOCK` alone.
`LOCK.SHOW` is allowed only for the domain or an explicitly approved logo or
wordmark lockup. Apply this rule to visible copy, navigation, footer, titles,
metadata, JSON-LD, alt text, ARIA labels, social metadata, WhatsApp labels and
publicly surfaced implementation strings.

Do not resolve the separate human-review claim by renaming `LOCK operator`.
The underlying review behavior remains a Product/claim decision.

## Live Coverage Observed

DOM/content inspection: Home, Artists, Booking Managers, Producers, Pricing,
Passport Demo, RADAR, How It Works, Methodology, FAQ, Contact, Signup and Login.

Visual captures:

- `01-home-desktop-live.jpg`
- `02-login-live.jpg`
- `03-signup-live.jpg`
- `04-passport-demo-live.jpg`
- `05-bookers-live.jpg`

The captures are evidence, not approval. Mobile, tablet, keyboard, real screen
reader, form delivery and analytics-event verification remain open.

## Verified High-Priority Defects

### WEB-BRAND-001 - Standalone LOCK is pervasive

Observed on every inspected public route, in the header/footer, titles and
structured data. Home JSON-LD names the website `LOCK`. Signup and Login use
`LOCK` and the title `LOCK - proof before booking`.

Expected: LOCK SHOW public name; LOCK.SHOW only where the approved lockup or
domain is intentionally used.

### WEB-POS-001 - Public positioning narrows the venture

Home and most entity pages describe a gig-proof/Bookability Passport product.
B4-35.10 v4.4 defines a broader entity-aware operating, intelligence,
representation, collaboration and growth system. The website may lead with a
bounded entry offer, but must not present it as the permanent product category.

### WEB-CLAIM-001 - Unsupported or over-broad promises

Observed examples include `always free`, `two minutes`, `twenty seconds`,
`nothing else ever asked`, `we check everything`, `reviewed by a human`, and
permanent `no scores/no rankings/no predictions ever` wording. Each claim needs
a current CLAIM-ID, source, scope and approved status. Product constraints must
not be invented by public copy.

### WEB-RADAR-001 - RADAR page contradicts current Product authority

The live page says `one clear list`, `one next step`, `no charts`, and frames
the six areas around what a booking manager wants. Current authority defines
RADAR as a private, rich, interactive Entity-aware intelligence/work
environment. Rewrite from the Artist's psychology and job; do not impose a
universal Next Best Action or visual ban.

### WEB-HANDOFF-001 - Website-to-app continuity is stale

Signup/Login visibly expose `PREVIEW - ef98d91 - 2026-07-27`, use legacy
`gigproof-live-hero.webp`, standalone LOCK branding and `proof before booking`
positioning. These screens do not continue the current website promise or the
current Brand/Product definition.

### WEB-LOC-001 - Hebrew control is not full localization

The public navigation control says it changes menu/footer while page content
stays English. Israel launch requires real HE/RTL and EN/LTR routes or states,
including metadata, forms, validation, mixed-script and return navigation.

### WEB-ENTITY-001 - Representation is not a first-class path

Navigation and core site architecture cover Artists, Booking Managers and
Producers. Representation/office appears only as future pricing copy despite
being a core launch user and Product workspace.

### WEB-PASSPORT-001 - Demo is a static proof ledger, not the current recipient product

The demo is visually tidy but lacks strong Artist media, platform universe,
recipient/purpose context, permission/version/expiry state and meaningful
recipient actions. It does not yet demonstrate the RADAR-to-PASSPORT
transformation contract.

### WEB-ASSET-001 - Visual asset coverage and governance are incomplete

Most inspected pages expose only symbol images; Home uses a background image,
Booking Managers uses one contextual photograph, and several pages have no
entity-specific photography. Home, Booking Managers, Producers and Pricing had
no observed `og:image`. Real-person and third-party logo rights must be recorded
before publication.

### WEB-COPY-001 - Some copy is emotionally forceful or role-reductive

Examples include `An empty floor remembers your name, not theirs` and language
that treats all booking decisions as the same risk pattern. Preserve emotional
relevance without shame, fear manipulation or collapsing different buyer,
representation and production contexts.

## Sequential Claude Code Queue

Only one implementation task is active at a time. Each task receives builder
self-check, independent QA, REVISE/retest and an evidence record.

1. `WEB-01` close the current audit and claim/asset decision register.
2. `WEB-02` Brand Naming Sweep: replace standalone LOCK across public surfaces,
   metadata and schemas; preserve LOCK.SHOW only where permitted.
3. `WEB-03` Claim Contract: map every material public claim to CLAIM-ID/status;
   remove or qualify unsupported promises without inventing Product limits.
4. `WEB-04` Information Architecture and Entity Value: update Home and create a
   first-class Representation path while preserving the bounded Artist entry.
5. `WEB-05` Website-to-App Handoff: align signup/login identity, context, copy,
   route, source/campaign continuation and first-value destination.
6. `WEB-06` Full HE/RTL and EN/LTR localization including metadata, forms,
   validation, mixed script and accessible language switching.
7. `WEB-07` RADAR and PASSPORT public explanation: reconcile with current
   Product/Experience authority and remove legacy limitations.
8. `WEB-08` Visual/Asset Pack implementation after approved art direction and
   rights records. Do not generate fake people, fake testimonials or fake proof.
9. `WEB-09` SEO/AEO/GEO and structured data: titles, descriptions, canonical,
   hreflang, OG assets, schema, sitemap, robots and index boundaries by surface.
10. `WEB-10` Measurement and consent: CTA, signup-context, onboarding and first-
    value events; consent behavior; GA/GTM evidence; no silent PII.
11. `WEB-11` Cross-route acceptance at 360/390/768/1440, HE/EN, keyboard,
    focus, contrast, reduced motion, links, forms, reverse paths and recovery.

## DoD for Each Task

- Exact source versions and changed files are recorded.
- No new Product, Brand, claim, price or legal decision is invented.
- Forward, reverse, recovery and return paths pass where applicable.
- 360/390/768/1440 and HE/RTL plus EN/LTR evidence exists for visual work.
- Accessibility, structured data and analytics checks are reproducible.
- Independent QA returns PASS, PASS WITH NAMED CONDITIONS or REVISE with exact
  defect IDs and retest steps.
- No deploy occurs until Maria approves the named release and residual risks.

## KPI Evidence

- Brand naming defects: zero standalone public `LOCK` occurrences.
- Claim traceability: 100% of material claims mapped to a current status.
- Handoff continuity: source, Entity, locale and campaign survive signup and
  land at the intended first-value route.
- Navigation/link integrity: zero dead internal links or dead primary CTAs.
- Localization: all P0 routes complete in HE/RTL and EN/LTR.
- Accessibility: no critical automated defects and all P0 keyboard paths pass.
- Performance: Core Web Vitals and asset budgets recorded per route.
- Measurement: every P0 conversion step emits the approved event without PII.

## Asset Pack Contract

Codex/Brand-Art Direction may supply generated or commissioned visual assets
only after slot dimensions, Entity, emotional job, crop/focal point, rights,
alt text, surface, locale and revocation/replacement owner are defined. Claude
Code consumes the approved pack; it must not invent people, logos, testimonial
evidence or arbitrary stock imagery.
