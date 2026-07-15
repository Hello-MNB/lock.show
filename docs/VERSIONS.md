# LOCK — VERSION MANIFEST (what is live RIGHT NOW, per track)

_The single answer to "what version is each surface on?" Updated as part of EVERY release
(release-checklist step, same as DEPLOY-LOG). Rewritten 13 Jul 2026 from current truth
(GOVERNANCE WAVE 3, V12). Owner audit 12 Jul: marketing-site updates are a FIRST-CLASS
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

## CURRENT STATE (13 Jul 2026)

### Candidate (the rel-2026.07.13 train — NOT yet deployed)
| Track | Version | Where | State |
|---|---|---|---|
| App + Site (one train) | rel-app-2026.07.13 + rel-site-2026.07.13 | branch `claude/b4-gigproof-discovery-e7749o` — **RC0 frozen at 2a2c955** (state: PREVIEW-DEPLOYABLE; per SYNC §32 re-freeze happens per fix wave) | **candidate — not yet deployed**; ladder: PREVIEW-DEPLOYABLE → QA-READY → Q8-READY → PRODUCTION-READY (docs/releases/DEPLOY-GAPS.md) |

### Live production (last deployed state per docs/DEPLOY-LOG.md)
| Track | Version | SHA | DS implemented | Live-verified |
|---|---|---|---|---|
| App | rel-2026.07.10 (incl. firewall hotfix eafcd4e) | **a874ab5** — last app production deploy (10 Jul) | pre-DS dark legacy (A13 mapping = this train) | ✅ bundle fingerprints (DEPLOY-LOG) |
| Site | **rel-site-2026.07.14 (11-page rebuild + flat hero + entity messaging + free-pilot page)** | **5890621** — deployed 14 Jul via Vercel API (dpl_BphgsZD5…; rollback anchor: 6183e81 / dpl_3mrHo21…) | Codex rebuild brief + owner no-frames ruling (wave-6 palette pending) | ✅ Production-QA round 1 GREEN (14/14 routes 200 incl. /managers+/production; new copy live; old hero absent; no price language; OAuth-fixed embed bundle index-Dhjy-W_p.js served at /app/signup+login; robots/sitemap OK; 0 console errors) |
| Embed | embed@rel-app-2026.07.10 | e027958 | = app | ✅ bundle hash |

### Reference tracks
| Track | Version | Where | State |
|---|---|---|---|
| DS | **v1.6.20 (Codex)** — CURRENT authority | Drive 00_CURRENT | owner-directed; v1.2.0 remains the historical site base |
| DB | applied: 032 (verified) · 033 · **034 ✓ in effect (DB CHECK = app CANON = 29 events, Cowork-verified SYNC §29; repo file regenerated as-applied)** · **035 ✓ (Cowork-verified, SYNC §28 — G3 unblocked)**; 021 FROZEN | Supabase qexfndiyallwqhhzeerd | structural renames: no number until authored, after Supabase Pro backups |
| Infra | previews OFF (one-time preview hook for this train) · smart build-skip · OAuth published | 6f5ce8e | operational |

### Known governance notes
- Git tags are LOCAL-ONLY (integration 403) — **SHA = the authoritative rollback anchor**; tags =
  convenience aliases pending remote-tag verification (see DEPLOY-LOG top note).
- Gap lifecycle truth (what is CODE-COMPLETE vs OPEN on the candidate): the register in
  docs/releases/DEPLOY-GAPS.md, not this file.

## NEXT PROMOTION (rel-*.2026.07.13 — one atomic train; ladder per SYNC §32, corrected 14 Jul per GPT audit)
| Step | Gate |
|---|---|
| **PREVIEW-DEPLOYABLE** — RC frozen, `npm run verify` green | RC anchor record (SYNC §34): frozen SHA + docs-only equivalence |
| **QA-READY** — private preview live, G16 isolation ACTIVE | G11+G12+G16 closed before any write-path URL distribution |
| **Q8-READY** — all lanes green on ONE frozen SHA | Cowork Q1–Q7 EN/HE + Codex Q4 + GPT delta audit + CFRO final-RC check |
| **Maria Q8 walk on that exact SHA** — BEFORE production promotion | owner word, recorded |
| **PRODUCTION-READY → atomic merge + deploy + live smoke** | tag/SHA rollback anchor → DEPLOY-LOG row + this file refreshed |
