# F1 ATOMIC FIELD REGISTRY — governed schema contract (Claude Code, 13 Jul)

_The repo-native registry that closes the Registry-B gap. GPT populates + audits rows; Codex
supplies logo_asset identifiers; Cowork consistency-checks; CFRO reads the value mapping.
NO parallel Drive registry — this file family is the single source._

## Answers to GPT's schema questions (binding)
1. **Column order** — exactly as in the header of `F1.csv` (below). 15 columns: the 11 binding
   ones + 4 accepted optionals (`field_id`, `source_channel`, `consent_requirement`,
   `limitation_text`). No other columns without a new ruling.
2. **role_priority_* stays OUT of F1** — internal weights live in `genreWeights.js` + the
   internal allocation model (RADAR-SOURCE-ARCHITECTURE §3). Keeping them out of a UI-consumed
   file prevents weight leakage into rendering. A separate internal registry comes later if needed.
3. **Identifier format** — `field_id` = snake_case, stable, unique per field (NOT per row).
4. **Cardinality** — one row per FIELD × SOURCE relationship. A field with 5 valid sources = 5
   rows sharing the same `field_id`, each with its own evidence_ceiling.
5. **CSV rules** — comma-delimited, RFC-4180 quoting (quote any cell containing comma/quote/newline),
   UTF-8, header row required, `·` never used as a separator inside cells (use `;`).
6. **Enums (closed lists):**
   - `source_type`: `platform | document | entity | declared`
   - `connection_method`: `oauth | upload | url | declaration | counterparty | derived`
   - `evidence_ceiling`: `verified | supporting | self-reported | not-assessable`
   - `visibility`: `working | artist | passport-eligible | buyer-context | internal`
   - `applicability`: `required | conditional | supporting | na`
7. **Genre-text heuristic ruling** — the DJ-family split regex in `genreWeights.js` is a
   **bounded temporary heuristic, explicitly accepted** until a controlled field
   (`scene_family`) ships with the registry-backed migration (034 candidate). GPT's precision
   correction is adopted; the "no free-text" claim is retracted in the architecture doc.
8. **logo_asset** — Codex-controlled identifiers only (its naming contract); `generic:<icon>`
   prefix for non-branded icons until Codex's contract lands; GPT never invents names.

## Workflow
GPT fills rows (from the completed Drive research) → commits BLOCKED for GPT (no repo access) →
GPT delivers rows as CSV text in the canon-mirror folder → Claude Code imports verbatim + runs
the firewall QC list (GPT's ⑤) → Cowork consistency pass → registry becomes the seed for
migration 034 (bilingual reference tables).
