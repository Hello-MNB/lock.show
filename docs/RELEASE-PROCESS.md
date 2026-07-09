# RELEASE PROCESS — how a version ships, and how we never lose the thread

**For Maria (plain language).** This is the professional way we deploy LOCK and keep it traceable.
One page. If you only remember one thing: **nothing reaches the live site until it passes the gate,
and every release has a name, a date, and a "verified" mark.**

---

## The model in one sentence
**One trunk, a verified gate, small frequent releases, each tagged.** Everything flows through `main`;
`main` is always what's live; nothing enters `main` until an automated gate proves it builds and the
navigation still works. This is how modern teams ship — scaled down to a solo founder, no bureaucracy.

## The flow — every release, same 6 steps
1. **Build by architecture.** Fixes/features are built on the work branch (`claude/b4-…`), following
   the architecture (single sources of truth, e.g. the navigation contract) — not patched ad-hoc.
2. **Pass the gate.** `npm run verify` must be green: navigation contract test (34 journeys) +
   language purity + real build + demo build. A red gate never ships.
3. **Promote to `main`.** Fast-forward `main` to the verified commit. This is the ONLY way code
   reaches production. (I ask your OK before promoting; or you set a standing "ship fixes" rule.)
4. **Deploy fires.** `app.lock.show` auto-builds from `main`. The marketing site is triggered by its
   deploy hook (its auto-deploy is unreliable — documented workaround).
5. **Confirm live.** Check the deployed fingerprints (title, a changed string, key pages return 200).
   Only then is it "verified live," not just "pushed."
6. **Record it.** Add a row to `docs/DEPLOY-LOG.md`, tag the release in git, and refresh
   `SESSION-MEMORY.md` + the task board. This is the step that stops threads getting lost.

## How YOU track it — four anchors, nothing else to remember
| You want to know… | Look here |
|---|---|
| **What is live right now** | `docs/SESSION-MEMORY.md` (top "Deployments" block) |
| **Every release, in order, with date + what shipped + verified?** | `docs/DEPLOY-LOG.md` |
| **What's done / in progress / pending (by priority)** | `docs/TASK-STATUS-BOARD.md` |
| **The whole skeleton at a glance (screens + gaps)** | the flow-map artifact |

Every git release is also **tagged** (`rel-YYYY.MM.DD`), so there is an immutable, named point to
return to. You never have to hold the state in your head — it lives in these four places, always current.

## Versioning
- Pre-launch we use **date tags**: `rel-2026.07.09` (easy to reason about — "the July 9 release").
- `package.json` `version` stays `0.x` until public launch, then we switch to **semver**
  (`1.0.0`, `1.1.0`, …) and one tag per version.

## Rollback (the safety net that makes fast shipping safe)
Because every release is tagged AND Vercel keeps every past deployment, a bad release is reversible in
minutes: re-point production to the previous Vercel deployment, or reset `main` to the previous tag and
redeploy. We never lose a known-good state. This is *why* we can ship small and often without fear.

## One upgrade we can add when you want it (not required now)
**Preview/staging deploys.** Each work-branch push can auto-create a temporary Vercel URL where I verify
the change in a real browser BEFORE it touches `main`. Then `main`/production is always safe by
construction. Worth turning on as we approach the paid launch; today the verify-gate + tags are enough.

---
*Owner of this process: Claude (Process Architect). Maria approves finished releases; she is not the tester.*
