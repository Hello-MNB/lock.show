# OWNER PENDING — what only Maria can unblock

_Maintained by the build agent. Appears at the end of every reply (owner directive 17 Jul 2026).
**Triage rule (owner ruling 20 Jul):** every item sits in exactly one bucket by one test — "does this block development or a real user RIGHT NOW?" Active = true blockers + decisions a team is waiting on + witness batches + foundation ratifications. Everything else is parked in the PRE-LAUNCH CHECKLIST, fully recorded, silent until launch prep. A parked item un-parks the moment it becomes a true blocker._

## 🔴 ACTIVE — blockers + dev-unblocking decisions (the only daily surface)

| # | What | The one-line decision | Unblocks |
|---|---|---|---|
| C6 | **Migration 038 ruling** (production_event + lineup_slot) | Approve or reject — SQL authored at `3730b62`, plain-language card delivered 20 Jul, fully reversible, NEVER RUN. **Recommend approve**; you apply it yourself as always | B4-c: the Production create-event/open-slot flows |
| M-8 | **Prices + pilot-pay flag** (the Gate) | (a) set the pilot price (earlier rec: ₪179) · (b) say "turn on the pay screen". Your STOP-list item — yours alone | Makes the Gate walkable for real (J5) |
| T-49 | **Passport taste brief — or release it** | Send the brief, or say "**build from §8.7/§8.4 as-is**" (**recommended now** — the four buyer faces exist as a base to react to) | Passport redesign lane + T-07 |
| B5-L | **AI-cost ledger lane** | (a) honest hybrid: runs/30d from our own DB + spend labeled "tracked in Anthropic console" (**recommended** — no new secret) · (b) server endpoint + Anthropic admin key · (c) defer | The last §8.12 cockpit tile |
| B3-D | **Representation depth** | Adopt AG1–AG4 card states now, or **queue for a later wave (recommended** — the Gate runs through Artist+Buyer) | Next-wave scope |

## 👁 WITNESS — what to look at (MOBILE/DESKTOP green only after you look)

| What | Where |
|---|---|
| Passport P1→P2→P3 verdict (started 19 Jul, outstanding) + the Wave-B batch (four Passport faces · confirmer · agency · production · admin) | Witness table in the 20 Jul wave-close report · preview: lock-app deployment at the current branch HEAD |
| M-3 live-fix re-test (refresh, Passport link fresh, home-screen hang, small controls) — fold into the same walk | Production app |

## 🏛 FOUNDATION RATIFICATIONS (spec-integrity — kept active per the 20 Jul ruling)

| # | What | The call |
|---|---|---|
| G-8/G-9/G-10/G-DS | Backfilled spec blocks marked `ratify: R00` (milestone canon · history-line corner law · mobile scene rail · DS block §5.11) + the Wave-B backfills (§8.4 four-faces status · §8.9 dead-link states · §8.12 rows · §5.10 BUILT markers) | yes/confirm each |
| R-11 | Display-language ruling (UNIVERSE-GAP-REPORT §4): count-based vocabulary only (**recommended**) or ALSO artist-private completion % | Richer Radar progress displays |
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
| M-7 | Codex artwork ask | Message drafted for forwarding: _"Hi Codex — we need the final LOCK brand assets: (1) the LOCK logo master as SVG (dark + light), (2) the venue-icon files per spec §5.9, SVG. They go into the app's asset registry (docs/ASSET-REGISTRY.md)."_ |
| M-18 | CLAUDE.md method pointer | Approved line, one edit (owner pastes or authorizes): "TASK METHOD: every task follows docs/HOW-TO-BUILD-A-TASK.md — decomposition + the L0–L5 self-verify ladder; fit-defects are the builder's job." |
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
