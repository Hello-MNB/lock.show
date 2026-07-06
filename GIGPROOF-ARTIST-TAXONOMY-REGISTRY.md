# GIGPROOF — COMPLETE ARTIST TAXONOMY REGISTRY (metafields / columns)
**Version:** v1.0 · **Date:** 1 July 2026 · **Owner:** Maria (R00) · **Architect:** R16
**Authority:** B4 MASTER CANON v3.4 · reads with GIGPROOF-ARTIST-INTELLIGENCE-MAP v2.1
**What this is:** the full column set for the smart-radar engine. It is TWO registries, not one — people confuse them.

---

## THE TWO REGISTRIES (do not merge — they answer different questions)
- **REGISTRY A — ARTIST TAXONOMY:** describes THIS ARTIST. One row per artist. Its columns are the TAGS (DJ, wedding, psytrance…). → decides WHICH fields are active.
- **REGISTRY B — FIELD APPLICABILITY:** describes EACH DATA FIELD. One row per field × module. Its columns are the RULES. → decides HOW each field behaves.
- Link: Registry A's `primary_module` + tags → look up Registry B → get the artist's live field set.

---

# REGISTRY A · ARTIST TAXONOMY — columns (one row = one artist)
*The metafields that tag an artist. Multi-select where noted. This is what the artist/AI fills at onboarding.*

| # | Column (metafield) | Type | Values / notes | Firewall note |
|---|---|---|---|---|
| A01 | `artist_id` | uuid | stable key | — |
| A02 | `stage_name` | text | — | passport-ok |
| A03 | `legal_entity` | text | for contracts/invoicing | internal |
| A04 | `primary_module` | single-select | M1–M8 (see modules) | drives field set |
| A05 | `secondary_module` | single-select nullable | M1–M8; cannot inherit primary's evidence | — |
| A06 | `functional_subtype[]` | multi-select | e.g. wedding-DJ, resident, festival, touring, session, producer-DJ | the "DJ לחתונה" layer |
| A07 | `performance_format[]` | multi-select | DJ-set · DJ+live-instrument · live-PA · band · solo-vocal+tracks · a/v · etc. | — |
| A08 | `commercial_model[]` | multi-select | ticket-led · venue/residency-led · service-led · catalog-led · licensing-led · collaboration-led · content-led · institutional-led | drives evidence type |
| A09 | `genre_primary` | single-select | from genre tree (TAG only, not a radar) | context, never rank |
| A10 | `genre_secondary[]` | multi-select | sub-scenes | — |
| A11 | `booking_context[]` | multi-select | club · festival · private · corporate · municipal · wedding · hotel · brand | — |
| A12 | `career_config` | single-select | independent · manager-led · agency-roster · label-supported | maps to representation |
| A13 | `opportunity_roles[]` | multi-select | warm-up · support · headline · closing · resident | per-gig, not a grade |
| A14 | `maturity_tier` | single-select | emerging · developing-regional · established-regional · international | ⚠ INTERNAL ONLY — never public, never a score |
| A15 | `geography_home` | single-select | country/city — valid market CONTEXT | not a ranking basis |
| A16 | `geography_active[]` | multi-select | territories with real activity | — |
| A17 | `active_overlays[]` | multi-select | O1–O10 (see overlays) | switches extra fields |
| A18 | `languages[]` | multi-select | performance/repertoire languages | — |
| A19 | `act_size` | single-select | solo · duo · trio · small-ensemble · large-ensemble | logistics fields |
| A20 | `identity_visibility` | single-select | named · anonymous/masked · virtual/avatar | IP fields |
| A21 | `taxonomy_editable` | flag | true — careers change; module reselectable | — |
| A22 | `taxonomy_confidence` | label | SELF_REPORTED / HUMAN_REVIEWED | how the tags were set |
| A23 | `created_at · updated_at` | timestamp | — | — |

**8 MODULES (A04/A05):** M1 DJ/Producer-DJ · M2 Solo Vocal · M3 Instrumentalist/Session · M4 Band/Ensemble · M5 Large Ensemble · M6 Live-Electronic/Hybrid · M7 Service/Event Act · M8 Creator/Non-Performing.
**10 OVERLAYS (A17):** O1 Ticketed-Touring · O2 Festival · O3 Resident · O4 Content-First · O5 Original-Music · O6 Cover/Tribute · O7 Cultural/Traditional · O8 International/Export · O9 Brand/Sponsorship · O10 Educational/Family.

---

# REGISTRY B · FIELD APPLICABILITY — columns (one row = one field × module)
*The metafields that configure EACH data field. This is the big table GPT builds. Every atomic field in the 18 segments gets one row per module.*

| # | Column (metafield) | Type | Values / notes | Firewall note |
|---|---|---|---|---|
| B01 | `field_id` | key | stable id, e.g. `draw.paid_tickets_band` | — |
| B02 | `field_label_he` / `field_label_en` | text | scene-native HE (Glossary SSOT) + EN | bilingual law |
| B03 | `segment_id` | ref | 01–18 (parent segment in the map) | — |
| B04 | `world_id` | ref | 1–7 nav world (Layer-3) | grouping |
| B05 | `artist_module` | ref | M1–M8 (which module this row is for) | — |
| B06 | `applicability` | enum | **R · C · S · N/A** | N/A ≠ ZERO |
| B07 | `activation_rule` | expr | for C: what turns it on (e.g. commercial_model=ticket-led) | — |
| B08 | `data_type` | enum | band · binary · text · date · count · file · link · enum | — |
| B09 | `value_set` | list | for band/enum: the allowed bands/options | bands not numbers |
| B10 | `certainty_default` | enum | OBSERVED/EXTRACTED/CALCULATED/INFERRED/HUMAN_REVIEWED/COUNTERPARTY_CONFIRMED/SELF_REPORTED/SELF_CONFIRMED_FROM_WEB/STALE/CONFLICTED | metadata, not category |
| B11 | `accepted_sources[]` | list | API · OAuth · artist-artifact · artist-confirmed-discovery · counterparty | the 4 doors |
| B12 | `evidence_strength` | ordinal | how strong a source proves THIS field (source hierarchy) | not a score of the artist |
| B13 | `method_label_template` | text | how it renders: "TICKET EXPORT · REVIEWED {date}" | "verified" never alone |
| B14 | `freshness_window` | duration | how long the value stays current before STALE | drives freshness chip |
| B15 | `gap_rule` | expr | when ABSENCE counts as a real gap (only if R/C-active) | never for N/A |
| B16 | `next_action_rule` | text | the coach action when gap present | Mirror-only |
| B17 | `visibility` | enum | passport-ok · mirror-only · internal | firewall |
| B18 | `passport_eligibility` | bool | can a supported value cross to Passport? | Proof Unit gate |
| B19 | `proof_unit_id` | ref nullable | if it's a publishable Proof Unit, which one | Layer-2 |
| B20 | `opportunity_types[]` | list | which event types this field matters for | producer face |
| B21 | `pii_class` | enum | none · contact(isolated) · third-party(blocked) | Amendment 13 |
| B22 | `il_scene_tag` | ref nullable | מוקדמות/גרנטי/רזידנט/רפרנס… if applicable | localization |
| B23 | `weight_note` | text | applicability ≠ weight; relative importance note ONLY | ⚠ NEVER a numeric weight that sums to a score |
| B24 | `ruleset_version` | ref | which rules version labeled this | audit |

**★ COLUMNS DELIBERATELY EXCLUDED (firewall):**
- ❌ `benchmark_cohort` / `cohort_id` / `percentile_basis` — GPT proposed these; they reintroduce ranking. BANNED.
- ❌ `score` / `weight_numeric` / `fill_value` / `completion_%` — any number that grades the artist. BANNED. (`weight_note` B23 is prose guidance for the coach, never a computed grade.)
- ❌ `comparison_population` — no artist-vs-artist. BANNED.

---

## HOW THE TWO REGISTRIES WORK TOGETHER (the engine, one example)
1. Artist row (A): `primary_module=M1`, `functional_subtype=[wedding-DJ]`, `commercial_model=[service-led]`, `genre=commercial`.
2. Engine reads Registry B for M1 rows → applies `applicability` + `activation_rule` against the artist's tags.
3. Result for this wedding DJ:
   - `draw.paid_tickets_band` → **N/A** (service-led, not ticket-led) → REMOVED, not a weakness.
   - `service.client_satisfaction` → **R** → shown, gap-tracked.
   - `service.referral_conversion` → **R**; `streaming.monthly_listeners` → **S** (nice, not a gap).
4. Radar renders only active fields. Passport publishes only `passport_eligibility=true` + supported. No score, no rank, anywhere.

---

## THE FAIRNESS LAW (why this is the moat)
**N/A ≠ ZERO** — a field that's N/A for the artist's type is removed from their picture entirely: not counted, not a gap, not a weakness. A wedding DJ isn't weak for having no Spotify; a session player isn't weak for no ticket draw. **The taxonomy decides what's RELEVANT; it never RANKS the artist.** Applicability (Registry B) and comparison are different things — we do the first, never the second.

**Next Action** — Approve these two column sets. Then GPT builds Registry A as an artist-tagging form + Registry B as the field-config sheet, seeded with M1 DJ/Producer-DJ (SHIGAON) — every 18-segment field gets its M1 row with all 24 B-columns filled.
**Missing Inputs** — SHIGAON's Registry-A row (his actual tags) to seed M1 concretely; confirm the genre tree source; confirm band value-sets per field (B09) to scene reality.
**Business Impact** — This is the complete schema for a type-aware radar no competitor has: fair by construction (N/A≠ZERO), firewall-clean (no cohort/score columns exist to violate), and expandable across the whole ecosystem on one engine. Registry A makes onboarding feel bespoke; Registry B makes every field behave correctly per artist type; the excluded columns make drift structurally impossible.
