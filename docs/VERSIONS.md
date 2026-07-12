# LOCK — VERSION MANIFEST (what is live RIGHT NOW, per track)

_The single answer to "what version is each surface on?" Updated as part of EVERY release
(release-checklist step, same as DEPLOY-LOG). Owner audit 12 Jul: marketing-site updates are a
FIRST-CLASS versioned track, not a footnote._

## Naming scheme (codified 12 Jul)
| Track | Scheme | Example |
|---|---|---|
| App (app.lock.show) | `rel-app-YYYY.MM.DD[-n]` | rel-app-2026.07.10 |
| **Marketing site (lock.show)** | `rel-site-YYYY.MM.DD[-n]` | rel-site-2026.07.11-2 |
| Embed (lock.show/app) | mirrors an app release | embed@rel-app-2026.07.10 |
| Design System (Codex) | semver `vX.Y.Z` | v1.5.2 |
| Database schema | migration head `NNN` | 031 |

Every app/site release row also records **which DS version it implements** (design↔code traceability).

## CURRENT STATE (12 Jul 2026)
| Track | Version | main SHA | DS implemented | Live-verified | Owner-approved |
|---|---|---|---|---|---|
| App | rel-app-2026.07.10 (+hotfix) | a874ab5/eafcd4e | pre-DS (dark legacy; A13 mapping next) | ✅ bundle fingerprints | 🟠 pending |
| **Site** | rel-site-2026.07.11-2 + cleanUrls hotfix | 6183e81 | v1.4.2 voice/surface law at ship time (token re-ground → DS v1.6.2 target) | ✅ **12 Jul evening: RESTORED + fully re-verified** — 10/10 inner pages 200, pricing fingerprint, app/embed unchanged (incident + resolution: DEPLOY-LOG) | 🟡 partial |
| Embed | embed@rel-app-2026.07.10 | e027958 | = app | ✅ bundle hash | 🟠 pending |
| DS | v1.6.0 (Codex, 12 Jul) | Drive 00_CURRENT | platform/entity matrix + per-entity DOD + demand-side terms (buyer ≠ אמרגן) | Codex QA ✓ · Claude independent audit PENDING | ✅ owner-directed |
| DB | migration 031 (021 FROZEN) | applied 10 Jul | — | ✅ owner-applied | ✅ |
| Infra | previews OFF · smart build-skip · OAuth published | 6f5ce8e | — | ✅ | — operational |

## Versioning-audit findings (12 Jul, this audit)
1. ✅ FIXED — no unified manifest existed → this file.
2. ✅ FIXED — naming was app-centric/ad-hoc → per-track scheme above.
3. ✅ FIXED — site releases now a first-class versioned track (owner's addition).
4. ✅ FIXED — releases now record the DS version they implement.
5. ✅ FIXED — DB schema head is part of the manifest.
6. 🟡 KNOWN — git tags local-only (integration 403); SHAs are the anchors until owner pushes tags.

## NEXT VERSION TARGETS (rel-*.2026.07.13 — corrective release, in build)
| Track | Targets | Gate |
|---|---|---|
| App | terminology wave (BUILT on branch) · A13 mapping layer (DS v1.6.0, after Claude audit) · +New Act · producer-confirm wiring · agency home next-action · activated_by · remaining funnel events · "Add workspace" real | verify gate + QA/QC protocol Q1–Q8 (rel-2026.07.13-PLAN §4) |
| Site | arrow unification · footer regrouping · waitlist type floor | build + sweeps |
| Embed | rebuilt with the app release (parity rule) | bundle hash |
| DB | migration 032 (roster-grants RPC + production-requests RPC) — Claude authors, Cowork applies | SQL apply + regression check |
| Approval | owner ledger pass on rel-07.10–11 before 07.13 promotes | owner |
