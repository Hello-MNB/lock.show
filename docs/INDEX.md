# LOCK — DOCS-INDEX (the one-table control: one domain → one owning doc → one owner)

_Rule: new information goes ONLY to its owning doc. Two docs claiming one truth = drift (the "28" lesson). States: `current` · `mirror-only` · `archived` · `draft-unsigned`._

| Domain | Owning doc | Owner | State |
|---|---|---|---|
| Product law | docs/LOCK-PRODUCT-SPECIFICATION.md (§0–21) | Maria (rulings) / Claude (text) | current |
| Repo rulebook | CLAUDE.md | Maria | current |
| Tasks · teams · loop · cadence | docs/TASK-REGISTER.md | Claude | current |
| Owner queue | docs/OWNER-PENDING.md | Claude | current |
| Session continuity | docs/SESSION-MEMORY.md | Claude | current |
| Failure→rule ledger | docs/LESSONS.md | Claude | current |
| Site ops + site versions | docs/SITE-MANAGEMENT.md | Claude (Team S/G) | current |
| Release gaps / build register | docs/releases/DEPLOY-GAPS.md (+ releases/, DEPLOY-LOG) | Claude | current |
| Owner witness walks | docs/qa/WITNESS-CHECKLISTS.md | Team B | current |
| Design system | docs/design-system/ (A13 tokens etc.) + spec §5/§5.11 | Claude (absorbed from Codex) | current |
| Localization | spec §15 + docs/LOCALIZATION-MATRIX.md | Claude | current |
| DB truth | supabase/migrations/ + GIGPROOF-DB-STRUCTURE.md | Team F (owner applies) | current |
| Measurement canon | spec §14 + src/lib/analytics.js (code) → docs/registry/events.json (T-40) | Team F | current / T-40 pending |
| Decisions | docs/adr/ (ADR-xxxx files) | Maria decides / Claude records | NEW — ADR-1 pending M-14 |
| Universe coverage gaps (Radar/Passport vs registry) | docs/UNIVERSE-GAP-REPORT.md (T-53) | Claude researches / Maria rules (R-11, T-49, registry schema) | current — decision material |
| Task method + self-verify ladder (L0–L5, fit law) | docs/HOW-TO-BUILD-A-TASK.md (T-66) | Claude (owner-ordered governance) | current — binding on every task |
| Per-screen witness-readiness standard | docs/SCREEN-BUILD-CHECKLIST.md (T-67) + spec §7.7.a map | Claude (owner-ordered governance) | current — every screen passes it before witness |
| Architecture map | ARCHITECTURE.md | Team G | ❌ T-38 (Wave 3) |
| Security boundaries | SECURITY-BOUNDARY-MATRIX.md | Team G | ❌ T-39 |
| Risk register (current) | docs/RISK-REGISTER.md | Claude + Maria | ❌ T-42 |
| Data retention/deletion | docs/legal/ + policy | counsel + Claude | ⚠️ T-43 (drafts partial) |
| Legal drafts | docs/legal/ | counsel (M-4) | draft-unsigned |
| Test logins | docs/team/TEST-LOGINS.md | Claude | current (never in artifacts) |
| Measurement narrative (Drive) | Cowork's plan | Cowork | mirror-only (repo §14 is canon) |
| Accounts registry (Drive) | Cowork's registry | Cowork | mirror-only pending repo canon |
| Legacy site | website/ | — | archived-in-place (S0: unreferenced; archive move planned) |
