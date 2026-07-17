> ⛔ **SUPERSEDED FOR THIS TRAIN (rel-2026.07.13, banner added 13 Jul 2026).** Current law =
> ONE full release train: canon-lock → candidate SHA → isolated preview → Q1–Q7 → owner Q8 →
> atomic merge → live smoke → tag + rollback anchor. Small frequent trunk releases (the model
> below) resume post-launch. Rule of record until then: **main = live truth; the release branch
> (`claude/b4-gigproof-discovery-e7749o`) = candidate truth until promoted.**

# LOCK — Branching & Release Architecture (for autonomous multi-agent work)

_Owner question (11 Jul): "do we unify folders into MAIN?" — YES. This file is the binding model._

## The model: trunk-based, one source of truth
- **`main` = production.** Always deployable. lock-site + lock-app both auto-deploy from it (+ deploy
  hooks as the reliable trigger). Everything that ships — code AND docs — lives on main. All agents
  (Claude, Codex reading the repo, Cowork) treat main as the truth.
- **Work branches are short-lived:** `claude/<task>-<suffix>` per task/session. Flow:
  branch off main → build → **gate green** (`npm run verify`: nav contract + i18n purity + build + demo)
  → merge/promote to main → deploy hooks fire → verify live fingerprints → tag → delete the branch.
- **No develop/staging branch** — unnecessary ceremony at this scale. Vercel builds previews for any
  branch push when a visual pre-check is wanted.
- **Tags on main** per release: `rel-YYYY.MM.DD[-topic]`. (Claude's integration cannot push tags — 403;
  owner/Cowork push them until that changes. SHAs always recorded in DEPLOY-LOG.md meanwhile.)
- **Docs ride the same trunk** — SESSION-MEMORY, sync protocol, registries are versioned WITH the code
  they describe. An agent reading main reads current truth.

## Hard gates (what keeps autonomous shipping safe)
1. Nothing reaches main without the verify gate green.
2. Every app release also rebuilds the embed (`npm run build:embed`) — the two app surfaces must never skew.
3. Every deploy is verified LIVE by fingerprint before it's called done; every release gets a DEPLOY-LOG row.
4. Migrations ship alone, applied + verified before code that depends on them. 021 stays frozen.
5. **Roadmap artifact updated AS PART OF EVERY RELEASE** — it is a release-checklist step (like the
   DEPLOY-LOG row), not an afterthought. A release without a roadmap update is an incomplete release
   (owner standing rule, reinforced 11 Jul: precise infra+version management prevents gaps and errors).

## Current branch cleanup (11 Jul state)
| Branch | State | Action |
|---|---|---|
| `main` | production trunk | ✅ keep — the ONE trunk |
| `claude/b4-gigproof-discovery-e7749o` | this session's work branch; everything promoted to main continuously | fold remaining delta with the inner-pages release, then RETIRE — next session starts a fresh branch |
| `claude/lock-show-user-flow-audit-mwuofi` | fully merged into main (Hebrew auth fix) | ✅ safe to delete |
| `claude/mnb-folder-drive-access-dth51b` | DIVERGENT separate MVP scaffold (rewrites CLAUDE.md) | ⚠️ QUARANTINE — never merge without owner review; rename to `archive/mnb-mvp` or delete after review |
