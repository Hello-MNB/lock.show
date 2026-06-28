# GIGPROOF

Pre-booking proof tool for Israeli booking managers / אמרגנים: evaluate an unfamiliar
artist via standardized, method-labeled evidence — **before** risking your name.
Not an EPK, not a CRM. Draw is shown as **bands only**; the firewall forbids any
score / percentile / ranking / exact head-count.

- **Stack:** React + Vite + Tailwind · Supabase (Auth + Postgres + RLS + Storage) · Express API (→ Vercel serverless) · Anthropic Claude (stubbed until a key is added)
- **Language:** English is primary (LTR). Hebrew is a full RTL localization — toggle in-app. `dir`/`lang` flip automatically.
- **Users:** artist · agency · booker · operator (admin)

## Quick start (local)

```bash
npm install
npm run dev
```
- Web app → http://localhost:5173  (loads in English; switch to Hebrew RTL via the header toggle)
- API/AI server → http://localhost:8787  (health: `/api/health`)

The app loads even before the DB is configured (it shows a setup notice instead of crashing).

## One-time setup (DB + seed)

Needs a Supabase **Personal Access Token** (`sbp_…`, from supabase.com/dashboard/account/tokens).

1. Add to `.env.local` (git-ignored): `SUPABASE_ACCESS_TOKEN=sbp_…`
2. `node scripts/setup-remote.mjs` — applies `supabase/apply_to_supabase.sql` to the project and writes the real `service_role` key into `.env.local`.
3. `npm run seed` — creates 4 test users + realistic Hebrew data.
4. Restart `npm run dev`.

> Without the access token you can instead apply `supabase/apply_to_supabase.sql` manually in the Supabase SQL Editor and paste the `service_role` key into `.env.local`, then run `npm run seed`.
>
> For a clean **signup** test, disable "Confirm email" in the Supabase Auth settings (otherwise signup requires clicking an emailed link).

### Test users (after `npm run seed`) — password for all: `Gigproof!2026`
| Persona | Email | Lands on |
|---|---|---|
| Artist | `artist@gigproof.test` | `/artist/home` |
| Agency | `agency@gigproof.test` | `/agency` |
| Booker | `booker@gigproof.test` | `/discover` |
| Operator | `operator@gigproof.test` | `/admin` |

## Flows to verify (QA, once the DB is live)

1. **Auth + routing** — sign in as each persona above → lands on the correct home. Sign up a new email → role select → consent → onboarding.
2. **Artist spine** — onboarding (identity → links → draw bands → experience → readiness → publish) → dashboard/Mirror (next-actions, no score) → Readiness (bounded status chips) → public Passport renders from the published snapshot (bands only).
3. **Evidence → AI(stub) → claims** — `/evidence/:artistId`: upload a file or add a band → "Process & verify" → claims appear with source labels (verified / supporting / self-reported). Stub is deterministic and varied.
4. **Claim review** — `/artist/claims`: flip a claim mirror-only ↔ passport-ok; "Refresh public profile" re-snapshots.
5. **Booker → request** — open `/passport/<artistId>` (no login) → "Check availability" → submit → confirmation (+ WhatsApp deep-link if the artist set a number).
6. **Agency inbox** — sign in as agency → `/agency/requests` → mark requests replied/closed; roster shows bounded status chips.
7. **Operator console** — sign in as operator → `/admin` → stats, all artists (publish toggle), all requests, recent claims.
8. **i18n + RTL** — toggle EN⇄HE on any screen; layout flips LTR⇄RTL; selection persists.

## Firewall (enforced server-side)
The public Passport is served by `/api/passport/:id` from an immutable snapshot built with an **explicit safe-column list** — it physically cannot return a score, percentile, exact head-count, gaps, or any private/mirror-only value. Draw is bands/booleans with a method label; statuses are only חזק · מתפתח · חסר-הוכחה · לא-ניתן-להעריך.

## Deploy (config ready; not yet deployed)
`vercel.json` builds the SPA and routes `/api/*` to `api/index.js` (the same Express app; `server/index.js` skips `listen()` when `VERCEL=1`). To deploy: connect the repo to Vercel and set env vars (`VITE_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_*`) in the dashboard.

## Scripts
| Script | What |
|---|---|
| `npm run dev` | Vite (5173) + API server (8787) |
| `npm run build` | Production build → `dist/` |
| `npm run seed` | Seed 4 test users + Hebrew data (needs DB + service key) |
| `node scripts/setup-remote.mjs` | Apply schema + fetch service key (needs access token) |

See `CLAUDE.md` / `ARCHITECTURE.md` / `BUILD-TASKS.md` for canon, architecture rules, and task status.
