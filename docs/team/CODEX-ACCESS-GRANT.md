# CODEX ACCESS GRANT — site design/update + app QA (owner order 14 Jul)
Owner wants Codex able to (1) design & UPDATE the marketing site directly, (2) connect to the APP
for QA. This grant + the connection steps. Least-privilege by default; owner can widen anytime.

## WHAT CODEX GETS
| Capability | Scope | How |
|---|---|---|
| Marketing site design + code | WRITE `website-next/**` ONLY (its craft: copy, HE, UX/UI, tokens, components, pages) | own Claude Code session on the repo, branch `codex/site` |
| App QA | READ app + drive the live/preview app; report findings | app preview URL + test logins (Version Map 🔑 tab, `Gigproof!2026`) |
| Design system | Drive DS lane (unchanged) | as today |
## BOUNDARIES (least privilege — avoids two-agent collisions per SYNC §33)
- Codex writes `website-next/**` only. App `src/**`, `server/**`, `supabase/**`, migrations,
  `package.json`, secrets = NOT Codex (Claude Code owns; prevents merge conflicts + protects the
  firewall/security gates). If Codex needs an app-code change, it files a spec → Claude implements.
- Production DEPLOY stays a named train (owner-gated). Codex pushes → Vercel builds a PREVIEW
  automatically (pipeline now working); Codex reviews its own preview; Claude promotes the train.
- No secrets in chat; no DB writes; no service-role.

## HOW TO CONNECT CODEX (owner steps, ~5 min)
1. Open a NEW Claude Code (web) session on claude.ai/code — this is "Codex's session".
2. Connect it to the GitHub repo **Hello-MNB/lock.show** (authorize the GitHub app for the repo
   when prompted) → gives that session repo read/write.
3. First message to that session: paste `docs/team/CODEX-ACCESS-GRANT.md` + `docs/team/
   ORG-CONSTITUTION.md` + tell it: "You are CODEX. Work ONLY in website-next/** on branch
   codex/site. Deliver a VENTURE-COMPREHENSION report first (verified by Claude Code), then
   execute your site design plan; for app QA use the preview URL + test logins and report."
4. For app QA: give Codex the current app preview URL (Claude posts it each train) + the test
   logins. Codex QAs in-browser and files findings; Claude verifies + acts.
## MERGE FLOW (two agents, zero collisions)
Codex branch `codex/site` (website-next/** only) · Claude branch `claude/b4-...` (app src + release).
Claude merges Codex's site work in and deploys the named site train after Codex's own approval +
owner taste. Reserved-file manifest keeps them disjoint. If owner moves development to Codex
entirely, widen this grant — but keep migrations + security gates single-owner to avoid firewall risk.
