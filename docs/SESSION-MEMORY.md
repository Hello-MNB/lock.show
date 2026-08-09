# SESSION MEMORY — durable state anchor
**Purpose:** first read after ANY context compaction or new session (owner directive, 8 Jul 2026).
**Rule:** refresh memory BEFORE acting — re-read this file + `docs/TASK-REGISTER.md` (the read-first
task/priority source; replaces the retired `docs/TASK-STATUS-BOARD.md`, deleted 21 Jul 2026) + the
session keys registry (`docs/CONNECTIONS-REGISTRY.md`). Reply to the owner in ENGLISH. End every
reply with `docs/TASK-REGISTER.md`'s priority sections + the open list in `docs/OWNER-PENDING.md`.

## Who / what
- Owner: Maria (Hebrew-speaking, reads English replies; does not read code). Decides: price, domain,
  visual direction, migration approval, counsel, taste/witness approval (rules 4/12).
- Product: LOCK — pre-booking proof / risk-reduction tool (domain lock.show; formerly GIGPROOF,
  renamed 8 Jul 2026). Product law: `CLAUDE.md` (repo root) + `docs/LOCK-PRODUCT-SPECIFICATION.md`.
- Agent team, roles, access map: `docs/team/ORG-CONSTITUTION.md` (owner-ratified 13 Jul) — the
  definitive table; read there, not duplicated here.
- Canonical demo persona: **Maya Vale** (owner ruling 21 Jul 2026). Full note + known code/site
  rename gaps (`src/lib/demo.js` and the site hero still carry the retired "Shai Perlman"/"Lior Noy"
  names): `docs/LOCK-PRODUCT-SPECIFICATION.md` §8.4. Real accounts, never treated as personas: `MG`
  (seed org, T-63 sync bug) · `shydavid` (first real signed-up user).

## Where everything actually lives (pointers only — do not re-duplicate content here)
- Tasks, teams, autonomous loop, standing rules 1-14: `docs/TASK-REGISTER.md`.
- Owner queue (pending-from-Maria): `docs/OWNER-PENDING.md`.
- What's live per track + SHAs + release history: `docs/VERSIONS.md` + `docs/DEPLOY-LOG.md`.
- Failure→rule ledger: `docs/LESSONS.md`. Risk register: `docs/RISK-REGISTER.md`.
- Entity model + vocabulary (binding): `docs/ENTITY-GLOSSARY.md` + `docs/GLOSSARY.md`.
- Site nav model: `docs/SITE-NAVIGATION-SPEC.md`. Site page standard: `docs/MARKETING-SITE-CHECKLIST.md`.
- Design system: `docs/design-system/` + spec §5/§5.11. Localization: `docs/LOCALIZATION-MATRIX.md`.
- Legal drafts (counsel-gated): `docs/legal/`. Test logins: `docs/team/TEST-LOGINS.md` (never in
  shareable artifacts).
- Codex⇄Claude protocol + full cross-agent rulings log: `docs/CODEX-CLAUDE-SYNC.md`.
- Task method + self-verify ladder (L0-L5) + doc-hygiene close-out: `docs/HOW-TO-BUILD-A-TASK.md`.
- One-table doc index (owning doc per domain — check before creating anything new): `docs/INDEX.md`.
- Keys/connections status: `docs/CONNECTIONS-REGISTRY.md` + `docs/ACCOUNTS-LIMITS-REGISTRY.md`
  (values live in gitignored `.env.local` + Vercel — verify against provider truth before citing any
  cap or price, never assume from memory).

## Current state
**Audited 9 Aug 2026 — read `docs/VERSIONS.md` for the full manifest, this is the pointer.**
LIVE: site `rel-site-2026.07.27` @ branch `a77393f` (alias-promoted) · app main `ef98d91` · embed + shop live. Work branch is **77 commits ahead of main** and merges only on the owner's witness walk.
DESIGN: current bundle = **LOCK Prototype v9** (`docs/reference/v9/`, hash-pinned, DESIGN_REVIEW — not build authority yet). Gap vs canon+code: `docs/V9-GAP-ANALYSIS.md` (10 gating contradictions C1–C10 + build architecture + task spec). Data layer: `docs/DATA-LAYER-GAP-MAP.md` (18 objects, migrations 041→059).
GATES: `npm run verify` = 21 checks, CI-enforced.
BLOCKED ON OWNER: C1–C10 rulings · migrations 038/040 · witness walk/merge word · legal facts · GA4+GSC console steps · `.env.local` restoration (blocks deploys + DB reads from this container).

## Standing rules with no single owning doc yet (kept here until one is designated)
- **Artifact governance** (owner order 14 Jul; full text now in `docs/TASK-REGISTER.md` rule 14):
  exactly 3 canonical claude.ai artifacts, update-only, no new artifacts without owner approval,
  never touch artifacts outside the 3 (esp. other projects').
- **DRIVE = INSPIRATION, NEVER CURRENT** (owner, 20 Jul): the repo at HEAD is the only current
  truth; a Drive doc may spark an idea but never overrides or date-checks the repo.
