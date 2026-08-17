# OWNER PENDING — what only Maria can unblock

_Maintained by the build agent. Appears at the end of every reply (owner directive 17 Jul 2026).
**Triage rule (owner ruling 20 Jul):** every item sits in exactly one bucket by one test — "does this block development or a real user RIGHT NOW?" Active = true blockers + decisions a team is waiting on + witness batches + foundation ratifications. Everything else is parked in the PRE-LAUNCH CHECKLIST, fully recorded, silent until launch prep. A parked item un-parks the moment it becomes a true blocker._

## 🔴 ACTIVE — blockers + dev-unblocking decisions (the only daily surface)
_Re-audited 9 Aug 2026. Ordered by how much each unblocks._

| # | What | The one-line decision | Unblocks |
|---|---|---|---|
| **W** | **Witness walk + merge word** | Walk the app preview; one word ships 77 commits (Artist entity · Radar A+B · Passport v2 · Artist Home step 1 · pilot lanes) | Everything app-side; the free pilot |
| **ENV** | **Restore `.env.local`** (2 min at the computer) | Copy VERCEL_TOKEN + SUPABASE_ACCESS_TOKEN etc. from Vercel → lock-app → Settings → Env Vars into a new `.env.local` | My ability to deploy or read the DB at all |
| **C1** | **Recipient view switching** (v9 vs canon) | v9: one link = one view, no switcher · ours: persona toggle mandated + shipped. Pick one | ALL recipient/passport work (6 policies, dead-link states, share service) |
| **C2** | **Artist-side Passport screens** | v9 adds 5 (Library/Composer/Preview/Publish-Review/Share) · canon ruled "no artist passport surface, redirect only". Pick one | The largest artist build |
| **C3** | **Where a claim is edited** | v9: full-screen Category Workbench · your T-90 law: inline widgets, never a page where a widget fits | The Workbench P0 |
| **C4** | **Radar privacy** (LIVE FINDING) | Rep orgs currently read the artist's private Radar gap signals. Tighten (removes info from a shipped screen) or ratify as-is | Rep radar feed legality; RLS design |
| **PV** | **Old passport versions are anon-readable** (LIVE FINDING) | Narrow the public read policy so only the version a live link binds is readable. **Recommend fix** — this is a real exposure | Rule "one link = one version" becoming true |
| **040** | **Apply migration 040** (buyer-funnel events) | Paste in Supabase as always — Gate-relevant, additive, reversible. **Recommend approve** | Buyer-funnel measurement (5 events are localStorage-only today) |
| **M-e** | **Multi-Act authorization boundary** (LIVE FINDING, Lane M+D) | The API publishes and serves the Passport per ARTIST, not per ACT (`server/index.js` artistId 55 : act_id 10; `act_id` appears in 0 of 126 RLS policies). Canon says evidence is per-Act and non-transferable. Rule it: is publish an Act-level act? | The multi-Act boundary migration (D-5/D-6/D-7) |
| ~~SPLIT~~ | ✅ **DONE 17 Aug** — 043 split into 043/044/045/046/047, behaviour-identical, chain green. (was: RECOMMENDED by independent QA) | 043 is 605 lines / 38 objects and has produced author-introduced defects in FOUR consecutive review rounds, every one a *coupling* defect between objects that share the file. Proposed: 043a columns+vocabularies · 043b key replacement + the writer it breaks · 043c revocation lifecycle · 043d authority guard · 043e decision function + dormant switch. Each independently reviewable and revertible | Landing any of the Act-scope work safely |
| **M-E** | **Grantee-initiated re-invite erases revocation, decline and dispute** (LIVE FINDING) | An org admin may call `request_artist_access` repeatedly; each call clears the revocation stamp and consent, and NO append-only record exists — `audit_log` is never written for artist_access. The org cannot resurrect access (artist approval is still required) but it can launder the record. In a product whose premise is provable consent, is an unlimited silent re-invite loop acceptable, or does it need a precondition plus a real audit record? | Revocation semantics being true rather than claimed |
| **RPC** | **Consent RPCs are PUBLIC-executable SECURITY DEFINER** (LIVE FINDING, 17 Aug) | 027 declared no grants, so `respond_to_access_request`, `revoke_artist_access` and siblings inherited Supabase defaults — PUBLIC + anon EXECUTE on definer functions. Their internal `has_org_role` checks are what actually refuse, so this is defence-in-depth, not a live hole. 043 tightened only `request_artist_access` (the one it already rewrites). Approve a follow-up that tightens the rest | Least-privilege on the consent surface |
| **C5–C10** | Six more v9↔canon contradictions | % to reps · draw as numbers on buyer faces · contact card PII · confirmer model · "Producer" name collision · mandate vocabulary — full text in `docs/V9-GAP-ANALYSIS.md` §1 | Each blocks its own surface |
| **§9.10** | **Ratify the deep-scanner spec** + build word for Phase S-1 | Spec authored in the product spec (§9.10, ratify:R00); 5-question card delivered | The multi-source scan you asked for |
| M-8 | Prices + pilot-pay flag (the Gate) | Yours alone; payments stay OFF until you say | Makes the Gate walkable for real |
| C6 | Migration 038 (production events) | Approve or keep deferred — **fine to keep waiting** (post-Gate) | Production create-event flows |

## 👁 WITNESS — what to look at
| What | Where |
|---|---|
| **App preview walk** (the merge gate) — Artist entity, Radar, Passport v2, Artist Home | latest preview at branch HEAD |
| **Live site walk** — uniform 620px heroes, container rotation, ghost-CTA contrast | www.lock.show |
| Wave-B witness batch (four Passport faces · confirmer · agency · production · admin) | same preview |

## 📮 OWNER CONSOLE ACTIONS (outside the repo — only you can do these)
| # | What | Doc |
|---|---|---|
| GA4 | Confirm the platform property + decide whether the Shopify store gets its own | `docs/GA4-SETUP-HANDOFF.md` |
| GSC | One login check: does hello@lock.show see `sc-domain:lock.show`? | `docs/SEO-GSC-HANDOFF.md` |
| LEGAL | Supply company number · refund/cancellation policy · accessibility coordinator name | legal pages stay noindexed drafts until then |
| SUPABASE | Delete my 3 e2e test users before the pilot cohort | `test-artist-e2e@` + 2× `e2e-embed-*@` |

## 🏛 FOUNDATION RATIFICATIONS (spec-integrity — kept active per the 20 Jul ruling)

| # | What | The call |
|---|---|---|
| G-8/G-9/G-10/G-DS | Backfilled spec blocks marked `ratify: R00` (milestone canon · history-line corner law · mobile scene rail · DS block §5.11) + the Wave-B backfills (§8.4 four-faces status · §8.9 dead-link states · §8.12 rows · §5.10 BUILT markers) | yes/confirm each |
| ~~R-11~~ | ✅ **RULED 9 Aug 2026:** the artist-private view may show everything — percentages, coverage, benchmarks, rich data. The firewall stays absolute only on every OTHER entity's surface. Recorded `c9710ba`; canon backfill owed in §2.9/§5.10 | (closed — unblocks Radar richness) |
| M-17 | **⅔ RULED (R00, 20 Jul):** (a) Registry-B schema = **F1.csv 15 columns — approved** · (b) certainty = **two separate fields (4-value claim door + 10-value extraction provenance) — approved** · (c) the 4 taxonomy sub-calls: laid out with recommendations 20 Jul, awaiting one-pass ruling | (c) releases R-6/R-7 — the registry-driven universe, priority build |

## 🧰 PRE-LAUNCH CHECKLIST (technical team, before public launch — parked 20 Jul, silent until launch prep)

_Fully recorded so nothing is lost. None of these block development or a real user today._

| # | Item | Full context for the future technical team |
|---|---|---|
| M-12 | **Rotate the Resend key** | **Honest classification: hygiene, not an active breach** — the key was pasted once into a private chat transcript; verified 20 Jul it is NOT in git history (last 200 commits scanned for key-shaped strings; `.env*` gitignored, never committed), NOT in any client bundle (server-side only), NOT public. Surface: **APP only** — Vercel project `lock-app`, var `RESEND_API_KEY` (`server/index.js`); the site sends no email and `lock-site` holds zero env vars. Procedure (order matters — email never breaks mid-swap): 1. resend.com → API Keys → **Create** new key, permission "Sending access" only, name `lock-send-2026`, copy it. 2. vercel.com → `lock-app` → Settings → Environment Variables → edit `RESEND_API_KEY` → paste → Save (all environments). 3. Deployments → ⋯ latest → Redeploy. 4. **Verify:** trigger any confirm-link email to a test address; it arrives, and Resend → Emails shows the send under the NEW key. 5. Only then **revoke the old key** in Resend. Never paste the value in chat, commit, or bundle. |
| M-14 | Canonical app address (ADR-0001) | Decide `app.lock.show` (**recommended** — cleaner, already fully secured) vs `lock.show/app`; ADR text ready to write on the word. Ends the PM-audit dual-origin ambiguity |
| M-15 | Site hygiene train GO | One word ships the NO-VISUAL-CHANGE fixes: llms.txt dead routes · footer/logo tap sizes · site security headers (T-41). Zero design risk |
| M-16 | Site audience pages taste word | /artists /bookers /producers "Not you?" cross-lane: built, break-tested, quarantined on the work branch (protected-merge protocol restores them every train until shipped). **Recommend ship** |
| M-13 | Site look taste-pick | NOT yet a decision — the 2–3 S1 hero mockups haven't been produced. Produce mockups → owner picks. Blocks nothing today |
| M-6 | `/producer` shell ruling (D3) | Retire `/producer` + `/producer/received` and fold received-passports into `/production/requests` (**recommended**) vs keep. The §8.9 D3 confirmer rule is already satisfied either way |
| M-7 | Codex artwork ask | Message drafted for forwarding: _"Hi Codex — we need the final LOCK brand assets: (1) the LOCK logo master as SVG (dark + light), (2) the venue-icon files per spec §5.9, SVG. They go into the app's asset registry (docs/design-system/ASSET-REGISTRY.md)."_ |
| M-18 | CLAUDE.md method pointer | Approved line, one edit (owner pastes or authorizes): "TASK METHOD: every task follows docs/HOW-TO-BUILD-A-TASK.md — decomposition + the L0–L5 self-verify ladder; fit-defects are the builder's job." |
| M-19 | **Completion-gate extension** (from external GPT audit, owner-parked 21 Jul — post-pilot, do NOT act during pilot) | Extend the done-gate so a task cannot be marked done unless `npm run verify` is green AND `docs/TASK-REGISTER.md` is updated **in the same commit** as the work. For the record (owner correction to the audit): verify ALREADY fails the build on firewall + fit defects (HOW-TO-BUILD L0/L1) — enforcement is already partly mechanical; this item adds the register-in-same-commit check, it does not start from zero |
| M-20 | **Path-scoped rules** (`.claude/rules/`) (same audit, owner-parked 21 Jul — post-pilot, do NOT act during pilot) | Split standing rules into path-scoped rule files so each task loads less context. Owner-flagged risk: Windows+Hebrew path handling; and any `.claude/` restructure competes with the pilot. No plugins, no restructure until post-pilot word |
| G-1 | Repo naming confirm | Work repo `V6.B4-Artist-…` auto-mirrors to `Hello-MNB/lock.show` (canonical per CLAUDE.md). **Recommend: keep as-is permanently** — renaming mid-flight breaks session tooling for zero gain |
| M-9 | Rename test domain off "gigproof" (`@lock.test`) | Cosmetic; seed-marking logic (`analytics.js` T-57) must be updated in the same change |
| M-10 | Canonical tagline + 2nd market | One sentence each, whenever |
| M-4 | Counsel review L-1…L-9 | **In progress, parallel, NON-BLOCKING (R00 ruling 18 Jul)** — published drafts + Amendment-13 consent flow carry the beta; the signed final rides in when counsel responds |

## KEY INVENTORY (two surfaces — recorded 20 Jul for the technical team)

_Site (`lock-site`) holds **zero** secrets. All keys live in the **app** project (`lock-app`), server-side except the two `VITE_` values which are public by design._

| Key | Surface | Lives at | Client-exposed? | Risk / note |
|---|---|---|---|---|
| `RESEND_API_KEY` | app (server email) | Vercel `lock-app` | no | chat-paste hygiene → M-12 above |
| `SUPABASE_SERVICE_ROLE_KEY` | app (server) | Vercel `lock-app` | no | highest-privilege key; never in git/bundle (verified) |
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | app (client) | Vercel `lock-app` | **yes — by design** | anon key is public-safe; RLS is the boundary |
| `ANTHROPIC_API_KEY` (+`ANTHROPIC_MODEL`) | app (server AI pipeline) | Vercel `lock-app` | no | spend-capped in server config |
| `TAVILY_API_KEY` · `GOOGLE_API_KEY` · `SPOTIFY_CLIENT_ID/SECRET` | app (server, target scan) | Vercel `lock-app` | no | dormant until deep-scan builds |
| `OPS_SUPABASE_ACCESS_TOKEN` · `OPS_VERCEL_DEPLOY_HOOK_*` | ops | Vercel `lock-app` | no | management/deploy plumbing |
| GA4 `G-ZX907M2NY8` | both (site + app consent banners) | hardcoded, public | yes | a public measurement ID, not a secret; evidence-surface guard ON (T-55) |

_Resolved (kept for the record): ~~M-11 DNS records~~ ✅ owner installed at GoDaddy herself, domain verified in Resend 17 Jul · ~~payment-provider timing~~ ✅ owner ruling 17 Jul: real provider connects when development ends; pilot Gate-pay = manual Bit + operator activation (T-44) · ~~keys backup~~ ✅ all 13 keys in the Vercel encrypted vault (write-only), 17 Jul · ~~M-2 Resend key~~ ✅ stored in Vercel + test email delivered 17 Jul · ~~shydavid question~~ ✅ **FIRST REAL USER** (DJ, techno/trance) — events stay counted · ~~C-2 Supabase Pro~~ ✅ 16 Jul · ~~merge-to-main authorization for audit fixes~~ ✅ 17 Jul · ~~M-1 migration 037~~ ✅ applied+verified 17 Jul._
