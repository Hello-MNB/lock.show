# CODEX Website Ownership - SEO / AEO / GEO / GTM - 2026-07-14

Branch: `codex/live-site-redesign-20260714`  
Primary website code: `website-next/**`  
Owner: CODEX - UX/UI, brand language, marketing copy, Hebrew localization, microcopy, entity psychology, SEO/AEO/GEO and website GTM strategy.

## Role ruling

CODEX owns the market-facing website experience.

That includes:

- mobile-first UX/UI;
- navigation and footer quality;
- page architecture;
- visual system and design tokens;
- marketing copy and microcopy;
- English and Hebrew localization quality;
- entity-specific messaging;
- SEO metadata;
- AEO/GEO answer-engine readiness;
- structured-data strategy;
- conversion and GTM landing-page logic;
- visual QA handoff to Claude Code and Cowork.

CODEX does not own:

- app security;
- migrations;
- production secrets;
- database writes;
- deployment approvals;
- payment logic;
- firewall enforcement code.

## Website north star

The site must explain LOCK in 5 seconds:

> Private Radar for the artist. Public Passport for booking context. No scores. No rankings. Artist controls what goes public.

Every page must answer:

1. Who is this page for?
2. What pain does that entity feel?
3. What does LOCK help them do next?
4. What stays private?
5. What is the one primary CTA?

## Entity routing

| Page | Primary entity | Conversion job |
|---|---|---|
| `/` | All audiences | Explain the product and route visitors to their lane |
| `/artists` | Artist / Act | Join free pilot and understand Radar + Passport |
| `/managers` | Representation | Join manager beta and understand roster readiness |
| `/production` | Production office / event team | Join production beta and understand lineup context |
| `/bookers` | Buyer / private client / professional booker | Open Passport demo and understand artist fit |
| `/producers` | Source Confirmer | Explain one-link confirmation; no account |
| `/passport/demo` | All audiences | Show the product outcome emotionally and clearly |
| `/radar` | Artist | Explain the private workspace |
| `/methodology` | Trust-sensitive visitors | Explain source labels, privacy and no-score firewall |
| `/how-it-works` | All audiences | Explain the process simply |
| `/pricing` | Pilot participants | Clarify free pilot; no payment anxiety |
| `/faq` | All audiences | Answer AEO/GEO questions directly |
| `/contact` | Leads / partners | Route interested visitors to the next step |

## SEO / AEO / GEO implementation

Implemented in:

- `website-next/lib/seo.ts`
- `website-next/app/layout.tsx`
- route metadata in `website-next/app/**/page.tsx`

The registry contains:

- canonical path;
- page title;
- meta description;
- audience;
- answer intent;
- keyword cluster;
- OG image assignment.

This prevents random page metadata drift.

## GTM site strategy

Launch-stage GTM is not broad paid acquisition. It is a trust-and-conversion surface for:

1. seed artist friends;
2. artist managers / representation teams;
3. production offices;
4. buyers or private clients who open a Passport link;
5. partners/advisors reviewing the product.

The website should not oversell ticketing. Ticketing is only one source type, not the product promise.

The promise is:

> Better pre-booking context before anyone wastes time, risks trust or asks the artist for "more materials" again.

## Current open gaps

| Gap | Severity | Owner |
|---|---:|---|
| Hebrew page content still contains many `TODO_HE` markers | P0 before public Hebrew campaign | CODEX |
| Full visual QA screenshots needed from this branch | P0 before merge | Cowork + CODEX |
| Passport demo still needs a stronger show-business art direction pass | P1 | CODEX |
| Page-specific FAQ/AEO blocks can be deepened | P1 | CODEX |
| OG image set should be generated per page | P1 | CODEX |
| Search Console / GA validation after deploy | P1 | Cowork / Growth |

## Merge gate

Do not merge this branch until:

1. `npm run build` passes.
2. Desktop and mobile screenshots are captured for all major pages.
3. No visible broken glyphs.
4. Hebrew toggle does not show `TODO_HE` on production-facing routes.
5. Footer and navigation are checked on mobile.
6. Passport demo is reviewed for emotional show-business quality.

