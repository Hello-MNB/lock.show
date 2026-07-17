# ENTITY-MODEL GAP AUDIT — app spec vs personas (owner order 14 Jul; GPT hierarchy = reference)
Reference model (GPT, adopted): Entity family → organizational form → role assignment →
authority → Act/territory/period. Families: Artist/Act · Representation · Buyer · Production;
influence/specialists = scoped contributors, NOT top-level workspaces.

## VERDICT: COMPATIBLE AT THE FOUNDATION — the app is built org-first, exactly the right shape.
Schema evidence: Person + organization + role_assignment(functional_role, authority_scope jsonb)
+ active_role_context + artist_access(scopes,status) + per-Act evidence (act_id threaded). The
site copy (rebuild W5) now speaks family-scaling language. The gaps are DEPTH, not architecture.

## GAP REGISTER (E-gaps; priority: 🚀=free-pilot relevant · 🏗️=post-Gate structural)
| # | Gap | Evidence | Fix path | Pri |
|---|---|---|---|---|
| E1 | Role taxonomy too coarse — functional_role has artist/booker/agency/artist_manager/operator/producer; missing booking-agent vs manager distinction, roster/territory/finance roles | 008 check constraint | widen CHECK post-Gate; UI can label-map sooner | 🏗️ |
| E2 | No Act/territory/period on grants — artist_access is per-ARTIST; role_assignment has no act_id | 008/027 | NO migration needed short-term: authority_scope jsonb can carry {act_id, territory, from, to}; formal columns post-Gate | 🏗️ (jsonb interim 🚀 if a pilot rep needs it) |
| E3 | Entity-form attribute absent (person/team/company) — solo vs team is implicit (member count) | organization table | display-level derivation now; explicit form column post-Gate | 🏗️ |
| E4 | Multi-role stacking invisible in UI — one person = manager+booking agent is legal in schema (2 role_assignment rows) but no UI creates/ shows it | orgs.js usage | Representation workspace settings: "roles in this workspace" panel — app backlog | 🚀 P1 |
| E5 | Buyer team/organization form unmodeled — booker is role-only, no buying-team workspace | SIGNUP_ROLES | correct for pilot (private buyers need NO workspace ✓); festival committee/venue org = post-Gate | 🏗️ |
| E6 | Rep upgrade path (individual→team→company) not designed as a flow — workspace exists, upgrade moment doesn't | A2 create-workspace | pilot OK (create new form); "add teammate" = the upgrade trigger — app backlog P1 | 🚀 P1 |
| E7 | Contributors/specialists (publicist, label, lawyer) — absent | — | CORRECT per GPT + canon: keep out of launch; scoped-contributor design post-Gate | ✅ by design |
| E8 | Site copy (fixed this round): Managers page now "managers, booking agents and artist-side teams"; production freelancer/crew/company; solo/band/collective on artists | W5 wave | verify on preview | 🚀 done-pending-QA |
LAUNCH IMPACT: none of E1–E6 blocks the FREE PILOT (solo-heavy audience); E4+E6 are the two
app-backlog items worth building EARLY (small, high signal for rep onboarding).
