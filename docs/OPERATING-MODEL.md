# LOCK — OPERATING MODEL (how we work, who runs what)
**v1.0 · 9 Jul 2026 · Established after the deploy/cache saga burned time. Purpose: one disciplined process, minimum cost, no scatter.**

## WHO RUNS WHAT — the team architecture
| Role | Who | Owns |
|---|---|---|
| **Process Architect / Orchestrator** | **Claude (me)** — NOT a separate agent (a "manager agent" = wasted tokens/theater). The discipline lives in me holding this plan. | Sequencing, verification, deploy, keeping docs current, holding the loop |
| **Build agents** | Cheap-tier subagents, spawned per-task ONLY when work is big or parallelizable | One scoped build each, under my supervision |
| **Owner** | **Maria (R00)** | DECISIONS only (price, counsel, design direction, migration approval) + APPROVING finished flows. NOT testing broken pieces. |
| **Cowork** | Maria's browser assistant | Dashboard clicks I can't reach (Vercel/Supabase settings) |

## THE LOOP — every piece of work goes through this, in ORDER (no parallel scatter)
1. **PLAN** — I pick ONE batch from the sequence below. State the definition-of-done.
2. **BUILD** — I build it (or one cheap agent), tight scope.
3. **VERIFY** — I test it in a real browser MYSELF (Playwright on the real build). Maria never tests broken things.
4. **DEPLOY** — via the deploy hook (reliable now). Verify live with my own check.
5. **REPORT** — "done + verified live" in plain language. Maria APPROVES (or says "wrong: X").
6. Only then → next batch.

## RULES (minimum cost)
- ONE batch at a time, fully verified, before the next. No whack-a-mole.
- Verify by browser, never by re-reading files.
- No "manager" agents. No re-auditing what's already verified.
- Shared code (auth/routing) = one agent, never one-per-entity.
- I keep SESSION-MEMORY + this board current every session (survives token limits / new sessions).
- The ONE irreducible human step: real third-party login (Google) needs Maria's single click — I make everything around it bulletproof first.

## THE SEQUENCE (what we do, in order — I hold this)
1. **STABILIZE AUTH** (in progress): Google login works end-to-end. Cache fix shipped; PKCE + code-exchange shipped. → Maria's ONE clean test confirms.
2. **VERIFY EVERY FLOW** end-to-end on the real app (I do it, browser): artist/buyer/producer/agency/operator signup→core journey. Fix all. Report.
3. **REVENUE SIGNALS** (Batch 1): M1 event writers + willingness-to-pay dashboard (028 is live, unblocked).
4. **DEPTH**: production-workspace requests (migration 029), 2-proof gate, per-Act saves.
5. **HEBREW LAUNCH**: localization pass + Maria's review session.
6. **GROWTH**: discovery scanner, share loop.

## WHAT'S ALREADY DONE & LIVE (so "nothing progresses" is a feeling, not the full truth)
lock.show (marketing) + app.lock.show (app) LIVE · full LOCK rebrand · migrations 027+028 applied · Google provider + login code (testing) · consent/GA4 · legal pages · notifications · radar universe ported · producer blocker + error boundary fixed · deploy hook (deploy problem solved) · PWA cache fix (staleness solved).
