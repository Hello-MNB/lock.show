# LOCK — SITE NAVIGATION SPEC (characterization · owner directive 17 Jul)

_The owning doc for marketing-site navigation (DOCS-INDEX). Grounded in the live approved site (probed 17 Jul) + the S0 flows/mobile audits. Changes to nav ship ONLY via rule-12 taste trains._

## 1. The navigation model (three layers, every page)
1. **Header nav** (desktop) / **hamburger sheet** (mobile ≤ md): LOCK wordmark (→ `/`) · entity links · How it works · Passport demo · language toggle · **Sign in** (→ `/app/login`) · **Join free pilot** (primary CTA → `/app/signup`).
2. **Footer** (every page): 4 columns — Product (entity pages) · Trust (How it works · Methodology · FAQ) · Company (Contact · Pricing) · Legal (Terms · Privacy · Accessibility) + wordmark → `/`.
3. **In-page cross-links**: every entity page ends with (a) its ONE primary CTA and (b) the "not you?" lane — links to the sibling entity pages.

## 2. The entity map & audience transitions
| Page | Audience (ONE per page — §4.5) | Primary CTA | Cross-links to |
|---|---|---|---|
| `/` | split-hero: artist-dominant + 3 actor cards | Build your Passport → app signup | /artists · /bookers · /producers |
| `/artists` | Artist (Coach voice) | Build your Passport | /bookers · /producers ("booking someone?") |
| `/bookers` | Booking manager / event organizer (Auditor voice) — **also serves "managers"** | See a sample Passport → /passport/demo | /artists · /producers |
| `/producers` | Producer (confirmer/production) | per page | /artists · /bookers |
| `/how-it-works` · `/methodology` · `/faq` · `/pricing` | mixed-info (no persona mixing inside a container) | one CTA each | entity pages |
| `/passport/demo` | buyer preview | Check availability (demo) | /bookers |
| `/contact` + legal (`/terms` `/privacy` `/accessibility`) | all | — | footer-reachable |

**Route truths (S0-verified):** `/managers` and `/production` DO NOT exist and nothing internal links to them (only llms.txt advertised them — fix held in the hygiene train). "Managers" as an audience = `/bookers`.

## 3. End-to-end journeys (the processes, each must be walkable with zero dead-ends)
- **J1 Artist:** any page → /artists → "Build your Passport" → /app/signup → onboarding → Radar. Back: browser-back + wordmark at every step.
- **J2 Buyer:** any page → /bookers → "See a sample Passport" → /passport/demo → "Check availability" (demo receipt) → Join-pilot exit. 
- **J3 Returning user:** any page → Sign in → /app/login → role-home.
- **J4 Shared link (external entry):** lock.show/passport/<id> (any form) → rescued into the app passport (T-34, live).
- **J5 Lost visitor:** any dead URL → warm 404 (nav + footer present) → Back to LOCK / app rescue.

## 4. The laws (owner directive, testable)
1. **No page without navigation:** every route (including 404, legal, demo) renders header nav + footer. TEST: crawl all routes, assert `<nav>` + footer links present.
2. **No orphan pages:** every route is reachable from header or footer. TEST: crawl from `/`, assert route set == reachable set.
3. **No dead links:** every internal href resolves 200 (or app-rescue). TEST: S0-flows crawl, re-run per site train.
4. **One primary CTA per page** (S0 found home has 3 labels for one action — fix in S1 design lane).
5. **Entity purity + the "not you?" lane** on every entity page (cross-entity transition — partially missing today).
6. **Language toggle + Sign in on every page** (header), mobile sheet included.

## 5. Current conformance (S0-measured, honest)
✅ laws 1, 2, 3 (post-hygiene: llms.txt) · ⚠️ law 4 (home CTA labels — S1) · ⚠️ law 5 ("not you?" lanes missing on entity pages — T-48 builds them) · ✅ law 6.

## 6. Backup & change control
This spec = the nav truth. Changes: propose → preview deployment → owner taste-approval → named train → this doc updated in the ship commit. Conformance tests live with the site QA (S0-flows re-run per train).
