# B4-20.50 Artist Taxonomy Registry — Independent Verification & Gap Report
**Date:** 8 July 2026 · **Verifier:** Claude (docs-first audit, full workbook download)
**Subject:** Google Sheet `B4-20.50 — Artist Taxonomy Registry` v1.1 (modified 2 Jul) + companion brief v1.1 (7 Jul)

> ⚠️ **PARTIALLY STALE (correction 18 Jul 2026, T-53):** finding **G1 "Registry B tab is empty" no longer
> describes the repo state** — a field-grain registry exists in-repo as `docs/registry/F1.csv` (483 rows ·
> 376 fields · 18 segments) + `F2-F6-DELTAS.csv`. Still true: D1 (DB has no `field_id`), G4 (certainty-ladder
> conflict), and the Sheet-side hygiene items. Current analysis: `docs/UNIVERSE-GAP-REPORT.md` (T-53); rulings
> pending: M-17. This file is retained as the 8-Jul audit of record.

## VERIFIED ✅ (checked against the actual workbook, all 22 tabs)
| Check | Result |
|---|---|
| Location in canon folder | ✅ canon root → `35 — DESIGN · UX-UI · BRAND` → `PASSPORT & RADAR` → sheet |
| Coverage counters (README) | ✅ EXACT: 6 families (F1–F6) · 55 subtypes · 32 DJ specializations · 42 instruments · 121 legacy labels |
| Firewall compliance | ✅ No score/rank/percentile columns anywhere; Claims Schema repeats the ban per field; R/C/S/N/A vocabulary locked; "gap computed at render time, never stored" |
| Canon rule alignment | ✅ N/A≠ZERO (gap rule) · per-offer evidence non-inheritance (= per-Act evidence canon) · multi-offer artist (= multi-Act) · maturity ≠ quality |
| Audit tab | ✅ 16 findings A01–A16, 14 fixed in v1.1, sensible corrections; v1.0 module model properly superseded |
| Companion brief (7 Jul, canon root) | ✅ current, aligned with v1.1, contains ready GPT prompt + 4 open R00 decisions |

## GAPS FOUND — sheet-internal (fix inside the workbook)
| # | Gap | Severity | Fix |
|---|---|---|---|
| G1 | **Registry B tab is empty** — 1 example row (`community.owned_band`) and its row doesn't even align with its own 6-column header. Claims Schema FKs to `Registry B.field_id`, so the whole claims contract hangs on an empty table. Brief §4.2 estimates several hundred rows needed | 🔴 CRITICAL (known open task, now precisely scoped) | Run the brief's §6 GPT prompt, or I build it family-by-family (F1 first) |
| G2 | **Registry A (Artists tab) does not exist** — zero rows, zero tab | 🔴 (by design — blocked on G1 per the brief's dependency chain) | After G1 |
| G3 | **Vocabulary contradiction:** workbook Claims Schema says visibility = `mirror-only`; frozen migration 021 + the 7-Jul brief both say canon locked `working-only` (Mirror retired). The newest doc (brief) and 021 agree — the workbook tab is the outlier | 🟠 | Update Claims Schema tab wording to `working-only` (takes effect with 021 lockstep) |
| G4 | **Two certainty ladders:** Claims Schema tab: `COUNTERPARTY_CONFIRMED > ARTIFACT_SUPPORTED > OAUTH_VERIFIED > SELF_REPORTED`; brief §6: 10-value set (`OBSERVED/EXTRACTED/CALCULATED/INFERRED/HUMAN_REVIEWED/...`). Both are canon-plausible; they must be reconciled BEFORE Registry B is filled (certainty_default is a Registry B column) | 🟠 | R00 ruling or merge proposal (I recommend: 4-door ladder for claim.certainty, 10-value set for extraction provenance — two different fields) |
| G5 | README + audit A13 say Legacy tabs are "retained and **hidden**" — both legacy tabs are **visible** | 🟡 | Hide `Legacy Modules` + `Legacy Labels Registry` in the sheet |
| G6 | README authoritative-tab manifest lists 16 tabs; workbook has 22. Unlisted: `Controlled Vocabulary`, `Claims Schema`, `Registry B` (canonical!) + 2 legacy | 🟡 | Add 3 rows to README manifest |
| G7 | `radar_segments` exists only as column headers (brief decision #4) | 🟡 | Awaiting R00 |

## GAPS FOUND — registry ↔ app/DB drift
| # | Gap | Severity |
|---|---|---|
| D1 | **DB has no `field_id`** — `claims.claim_type` is free text; no evidence-field registry table exists in Supabase. The registry's whole L1/L2 layer (families, subtypes, contexts, Registry B) has ZERO representation in the DB; app genre tags are free text | 🔴 future migration 029 (after G1/G4), app lockstep |
| D2 | DB `verification_status` (`verified/supporting/self-reported/not-assessable`) ≠ registry certainty ladder — no migration introduces it yet | 🟠 bundle with D1 |
| D3 | Missing DB columns vs Claims Schema: `passport_eligibility` (approximated today by visibility+artist_approved), `updated_at` on claims, `method_label` vs `method_label_template`, `verified_at` vs `reviewed_at` naming | 🟡 bundle with D1 |
| D4 | App radar (radarUniverse.js) is hand-built for the DJ case; not driven by Radar Applicability (18 segments × 6 families) or Activation Rules | 🟡 expected — becomes real when Registry B fills |
| D5 | Columns that DO match already: `public_band`, `public_wording`, `artist_approved`, `visibility` values, `expires_at`, `evidence_id`→`source_artifact_ref` ✅ — the 022 migration anticipated this schema well | ✅ |

## DRIFT PREVENTION (folder hygiene)
| # | Item | Action |
|---|---|---|
| H1 | `GIGPROOF-ARTIST-TAXONOMY-REGISTRY.md` (1 Jul, PASSPORT & RADAR folder) describes the **superseded v1.0 M1–M8 architecture**. The brief's supersession notice covers it, but the stale file itself carries no marker — someone opening it cold will build against dead architecture | Rename with `[SUPERSEDED v1.0 — see Completion Brief]` prefix (update-in-place per Drive rule, no duplicate) |
| H2 | The registry (a DATA canon SSOT) lives under the DESIGN folder (`35 — DESIGN · UX-UI · BRAND`) | Acceptable if intentional (Passport & Radar grouping); flag only — moving files is R00's call |
| H3 | Everything else single-sourced ✅ — no duplicate taxonomy workbooks found in Drive search |

## RECOMMENDED SEQUENCE
1. R00 answers the brief's 4 open decisions (§7) + G4 certainty ruling.
2. Fill Registry B field-grain (G1) — F1 family first.
3. Sheet hygiene: G3, G5, G6, H1 (10 minutes of edits).
4. I write migration 029 (taxonomy reference tables + claims alignment) — after 027/028.
