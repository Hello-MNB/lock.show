# CODEX — Infra Access Checklist

Date: 2026-07-14  
Owner: Maria  
Executor lane: Codex website / UX / SEO / deploy verification  
Rule: do not paste secret values into chat or commit them to git. Store secret values only in local environment variables, a gitignored `.env.local`, or the relevant dashboard secret store.

## Known identifiers — not secrets

| System | Name | Value | Status |
|---|---|---|---|
| Vercel user | Maria account user ID | `jUIR1JAvq9JxbY32XZW9CrwR` | Known; not enough to deploy by itself |
| Vercel project | LOCK Site | `prj_dUHnMaaTeg1ZeyyvEP93kVjOigCZ` | Known |
| Vercel project | LOCK App | `prj_ANv5iiMz4a8CUYA3gyzn7kvIUfho` | Known |
| Supabase project | LOCK | `qexfndiyallwqhhzeerd` | Known |
| Supabase org/app hints | Owner-provided IDs | `mvcauvcknuqhencafgaa` / `a3ff2237-4e0a-41de-982f-079176f54599` | Known; not a management token |
| GitHub repo | LOCK | `Hello-MNB/lock.show` | Known |
| Codex branch | Website redesign | `codex/live-site-redesign-20260714` | Pushed |

## Missing access values — fill locally, not in chat

| Priority | Token / value name | Where to create it | Where to store it | Why Codex needs it | Current status |
|---:|---|---|---|---|---|
| P0 | `VERCEL_TOKEN` | Vercel → Account Settings → Tokens | Local shell env or gitignored `.env.local` | List deployments, create preview deployments, inspect logs, promote when approved | Received in chat and verified 2026-07-14; rotate after handoff |
| P0 | GitHub OAuth / `gh auth login` | GitHub device login / browser OAuth | GitHub CLI credential store | Open PRs, inspect PR status, merge if authorized | Not logged in |
| P1 | `SUPABASE_ACCESS_TOKEN` | Supabase → Account → Access Tokens | Local shell env or gitignored `.env.local` | Project-level verification and management through Supabase API | Existing local value returned 401; refresh needed |
| P1 | `SUPABASE_SERVICE_ROLE_KEY` | Supabase project `qexfndiyallwqhhzeerd` → Settings → API | Server/Vercel env only; local gitignored env only if needed for admin scripts | Admin/user/test-data scripts and server-only operations | Existing local value returned 401; refresh needed |
| P1 | `VERCEL_ORG_ID` / team scope if required | Vercel project/settings/API response | Local shell env or `.vercel/project.json` | Only needed if Vercel token cannot infer team scope from project ID | Unknown |
| P2 | `VERCEL_DEPLOY_HOOK_SITE` | Vercel → lock-site → Deploy Hooks | Local gitignored `.env.local` | Emergency production build of site from main if hook workflow is used | Missing in Codex-visible env |
| P2 | `VERCEL_DEPLOY_HOOK_APP` | Vercel → lock-app → Deploy Hooks | Local gitignored `.env.local` | Emergency production build of app from main if hook workflow is used | Missing in Codex-visible env |

## Recommended local `.env.local` shape for Codex infra work

```env
VERCEL_TOKEN=
VERCEL_USER_ID=jUIR1JAvq9JxbY32XZW9CrwR
VERCEL_PROJECT_ID_SITE=prj_dUHnMaaTeg1ZeyyvEP93kVjOigCZ
VERCEL_PROJECT_ID_APP=prj_ANv5iiMz4a8CUYA3gyzn7kvIUfho
SUPABASE_PROJECT_ID=qexfndiyallwqhhzeerd
SUPABASE_ACCESS_TOKEN=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional if using deploy hooks:

```env
VERCEL_DEPLOY_HOOK_SITE=
VERCEL_DEPLOY_HOOK_APP=
```

## Verification commands — values stay hidden

```powershell
# GitHub
gh auth status

# Vercel token presence only
if ($env:VERCEL_TOKEN) { "VERCEL_TOKEN present" } else { "VERCEL_TOKEN missing" }

# Supabase token presence only
if ($env:SUPABASE_ACCESS_TOKEN) { "SUPABASE_ACCESS_TOKEN present" } else { "SUPABASE_ACCESS_TOKEN missing" }
```

## Deployment safety rule

Codex should deploy preview first, then run Q4 design / UX / SEO / AEO / GEO verification. Production promotion requires Maria approval after preview proof.
