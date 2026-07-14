# COSTS & CONNECTIONS — free-tier boundaries vs paid triggers (owner order 14 Jul)
_Single map of every connection, its free ceiling, the exact moment it must become paid, and who
holds the key. Aligned with CFRO v3.0 verified prices; CFRO owns budget updates._

| Connection | Plan today | Free ceiling (the boundary) | PAID TRIGGER (exact moment) | Cost then | Key holder |
|---|---|---|---|---|---|
| Vercel (lock-site + lock-app) | Hobby FREE | ~100 deployments/day · 6,000 build-min/mo · 100GB bandwidth · ⚠️ ToS: NON-COMMERCIAL only | **First revenue** (ToS) or sustained launch traffic → Pro | $20/user/mo | Maria (billing) · Claude (API) |
| Supabase (LOCK db) | Free | 500MB DB · 50K MAU auth · **NO backups/PITR** · pauses at 7d inactivity | **BEFORE structural migrations + BEFORE public launch** (G19 backups) — already a pending owner item | $25/mo Pro | Maria (billing) · Claude (API token) |
| Anthropic API (claim extraction) | Pay-per-use | n/a — governed by OUR code caps | already active; hard cap enforced in code (G14): **$50/mo stop · $25 alert** · 15 items/user/day · dedup | usage ≤$50/mo | Maria (key) · Claude (ledger) |
| Resend (auth emails) | not wired (P1-11) | 3,000 emails/mo · 100/day | pilot outgrows 100/day signup emails | $20/mo | Maria signup → Claude wires |
| GA4 | Free | effectively unlimited for us | — | — | Maria |
| Tavily (discovery search) | Free key | ~1,000 credits/mo | deep-scan build goes live (TARGET ARCH — not built; no pricing assumption per CLAUDE.md) | usage | Maria (key) |
| Spotify / YouTube APIs | Free quota | rate limits only | not before integration builds | — | Maria (keys) |
| GoDaddy (lock.show) | PAID ✓ | — | annual renewal | ~$40/yr | Maria |
| Google Workspace (hello@ inboxes) | Maria-side | per her plan | — | her plan | Maria |
| AI seats (Claude/Cowork/Codex/GPT sessions) | Maria's subscriptions | plan quotas | — | existing | Maria |

## DEPLOY-TRAIN LAW (owner order: "לא לשגר כל פעם בקטנה")
1. PRODUCTION deploys = NAMED TRAINS ONLY, each with a Production-QA agent round:
   • SITE-TRAIN-2 = wave-6 visual + Hebrew/RTL + remaining TODO_HE → ONE deploy (target 16 Jul)
   • APP-TRAIN = RC1 → QA chain → Q8 → ONE deploy (target 16-17 Jul)
   Emergency hotfix = the only exception (rollback anchor first).
2. Branch pushes are BATCHED: docs-only work accumulates into consolidated commits; smart skips
   (restored 14 Jul: site builds only on website-next changes, app only on app-path changes,
   both range-aware fail-open) keep preview burn near zero on docs pushes.
3. Measured today before the fix: 50+ deployments/day (26 app + 24 site) vs 100/day ceiling —
   the trigger for this law.
