# LOCK — LESSONS LEDGER (process failures → binding lessons)

_Every entry: what happened → the lesson → where it's now enforced. Injected into every workflow agent's brief (rule P-2). Honesty law: entries are never softened or deleted._

| # | Date | What happened | The lesson | Enforced at |
|---|---|---|---|---|
| L-1 | 17 Jul | Unapproved site redesign rode whole-branch merges into production (logo/design regression, owner caught it) | Site never ships as merge cargo; taste-approval BEFORE production | Rule 12 + cargo check at every merge |
| L-2 | 17 Jul | `git checkout <old> -- dir` doesn't delete newer-only files → mixed tree → type errors (hit TWICE) | Exact-state restore = `git rm -rqf dir` first | SITE-MANAGEMENT §2; this ledger |
| L-3 | 17 Jul | vercel.json rewrites silently ignored by the deployed site (a previous session's "fix" never worked) | Never claim a config fix works without a LIVE probe | L7 live smoke, mandatory per ship |
| L-4 | 17 Jul | WIP checkpoints commingle parallel agents' edits → per-task attribution/scope checks degrade | Wave-close commits are per-territory; verifiers get explicit file-scope lists, not bare `git status` | Rule P-1 (register) |
| L-5 | 17 Jul | Sending-key pasted in chat by owner; agent echoed it once into a local file command | Keys travel ONLY owner→Vercel; the agent never echoes a secret value into any command visible in a transcript | OWNER-PENDING M-12; key-handling law |
| L-6 | 17 Jul | Hidden internal `score` variables found by the new inspector; first instinct was to silently allow-list them | A firewall finding is NEVER self-waived; it goes to the owner | Rule 8 + guardrails escape-hatch policy |
| L-7 | 16-17 Jul | "Built" claimed ≠ witnessed running (login/onboarding believed done, never watched end-to-end) | Reproduce-before-claiming at every level; human witness is a distinct, unskippable level | L2/L3/L8 of the test ladder |
| L-8 | 18 Jul | T-59 shipped correct data (method labels) that TRUNCATED in the ring's fixed 72px caption box ("EVIDENCE-SUPPOR…") — the owner caught it live on the flagship screen | A copy/string change ships ONLY with a fit check on every surface that renders it (longest EN + HE string, smallest viewport); screenshot-diff the touched screen before ship. CODE-green ≠ screen-DONE — the 8-point DoD is per-screen law: MOBILE/DESKTOP stay "awaiting owner witness" until the owner looks; witness items are BATCHED for her | Register rule 4 strengthened (owner directive 18 Jul); witness batch in OWNER-PENDING M-5 |
