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
| Site | rel-site-2026.07.11-inner + cleanUrls hotfix | **6183e81** — last site production deploy (12 Jul, merge of d06ac25) | v1.4.2 voice/surface law at ship time | ✅ 10/10 inner pages 200 + fingerprints (12 Jul re-verify) |
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

## NEXT PROMOTION (rel-*.2026.07.13 — one atomic train)
| Step | Gate |
|---|---|
| Candidate SHA frozen at PREVIEW-READY | all P0 gaps CODE-COMPLETE + `npm run verify` green |
| Isolated preview → Q1–Q7 (Stage 1: candidate qualification) | rel-2026.07.13-PLAN §4 |
| Atomic merge → live smoke → Maria Q8 (Stage 2: production acceptance) | owner word, recorded |
| Tag + rollback anchor recorded | DEPLOY-LOG row + this file refreshed |
