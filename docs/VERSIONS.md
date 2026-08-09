# LOCK — VERSION MANIFEST (what is live RIGHT NOW, per track)

_The single answer to "what version is each surface on?" Updated as part of EVERY release
(release-checklist step, same as DEPLOY-LOG). Rewritten 13 Jul 2026; CURRENT STATE re-audited 9 Aug 2026. Owner audit 12 Jul: marketing-site updates are a FIRST-CLASS
versioned track, not a footnote._

## Naming scheme (codified 12 Jul)
| Track | Scheme | Example |
|---|---|---|
| App (app.lock.show) | `rel-app-YYYY.MM.DD[-n]` | rel-app-2026.07.10 |
| **Marketing site (lock.show)** | `rel-site-YYYY.MM.DD[-n]` | rel-site-2026.07.11-2 |
| Embed (lock.show/app) | mirrors an app release | embed@rel-app-2026.07.10 |
| Design System (Codex) | semver `vX.Y.Z` | v1.6.20 |
| Database schema | migration head `NNN` | 033 |

Every app/site release row also records **which DS version it implements** (design↔code traceability).

## CURRENT STATE (9 Aug 2026 — audited)

### Live production
| Surface | Version | SHA | How it shipped | Verified |
|---|---|---|---|---|
| **Marketing site** `www.lock.show` | `rel-site-2026.07.27` | branch `a77393f` | alias-promotion of `lock-site-5zsfbixyd` (main NOT advanced) | ✅ 200 all pages · canonical www · sitemap 10 · X-Robots on /app · uniform 620px heroes |
| **App** `app.lock.show` | `rel-2026.07.21` | main `ef98d91` | owner merge word 21 Jul | ✅ 200 |
| **Embed** `lock.show/app` | rebuilt from production source | in `a77393f` | shipped with the site train (P0 conflict-marker fix) | ✅ 200, single bundle, zero markers |
| **Shop** `shop.lock.show` | Shopify (Lock Show, Basic, ILS) | — | owner connected the subdomain | ✅ 200 |

### Not deployed (built, verified, waiting)
The work branch `claude/b4-gigproof-discovery-e7749o` is **77 commits ahead of `main`**. It holds: the Artist entity (11 screens), Radar A+B, Passport v2 explorer, Artist Home step 1 (10-state widget law), the 3 pilot lanes (T-86/87/88), signup fixes, and all governance/analysis docs. **Nothing merges until the owner's witness walk.** Preview: cut per commit via the Vercel integration.

### Database
Head applied = **040 pending, 039 applied**. Applied: 001–035, 037, 039 (+034 ✓ in effect). **Authored NOT applied: 038** (production events — C6 deferred by owner) and **040** (buyer-funnel events — Gate-relevant, recommended next). Planned: **041→059** per `docs/DATA-LAYER-GAP-MAP.md` (additive-only, each with a `.down.sql`, owner applies).
⚠ **Drift warning:** migration 039's file header contradicts this manifest about its own applied state. We read migration files, not the live DB (no DB credentials in this container). Verify against Supabase before citing any schema fact as certain.

### Quality gates
`npm run verify` = **21 checks** (nav · isolation · canon-drift · analytics-contract · security · guardrails · ds-drift · widget-states · embed-integrity · seo-contract · site-nav · hero-contract · visual-regression · component-styles · i18n-purity · registry · deltas · event-registry · build · build:demo · fit). CI runs the full chain on every push (`.github/workflows/verify.yml`).

### Design authority
Current bundle = **LOCK Prototype v9** (`docs/reference/v9/`, 22 files, hash-pinned, status **DESIGN_REVIEW**). Not build authority until the owner accepts it per persona/wave. Gap analysis vs canon and built code: `docs/V9-GAP-ANALYSIS.md`.

### Infrastructure note
`.env.local` was lost when the container recycled — production is unaffected (all keys live in the Vercel vault), but deploys and DB reads from this session are blocked until it is restored.

## PROMOTION LADDER (the standing gate sequence for any train — re-titled 9 Aug; the 07.13 train it was written for shipped long ago)
| Step | Gate |
|---|---|
| **PREVIEW-DEPLOYABLE** — RC frozen, `npm run verify` green | RC anchor record (SYNC §34): frozen SHA + docs-only equivalence |
| **QA-READY** — private preview live, G16 isolation ACTIVE | G11+G12+G16 closed before any write-path URL distribution |
| **Q8-READY** — all lanes green on ONE frozen SHA | Cowork Q1–Q7 EN/HE + Codex Q4 + GPT delta audit + CFRO final-RC check |
| **Maria Q8 walk on that exact SHA** — BEFORE production promotion | owner word, recorded |
| **PRODUCTION-READY → atomic merge + deploy + live smoke** | tag/SHA rollback anchor → DEPLOY-LOG row + this file refreshed |
