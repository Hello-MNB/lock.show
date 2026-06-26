# GIGPROOF — local app

Real, end-to-end app for all three users (artist · agency · booker), built from the
MD canon (START HERE, Screen Registry, Technical Spec, Functional Flow, Passport Spec).
Runs and is tested **fully on your machine**; deploy + domain come later with no rewrite.

## Stack
- **Frontend:** React + Vite + Tailwind (Hebrew RTL, mobile-first)
- **Backend:** Supabase (Postgres + Auth + Row-Level Security + Storage) — free cloud project
- **AI:** Anthropic Claude (evidence → labelled claims), via a small local API server
  (`server/index.js`). Runs in deterministic **mock** mode until you add a key, then
  switches to the real API automatically.

## One-time setup
1. **Supabase:** create a free project at https://supabase.com → copy the Project URL +
   anon key (Settings → API). In **SQL Editor**, paste & run `supabase/schema.sql`.
2. **Env:** copy `.env.local.example` → `.env.local`, fill in the values.
3. **Install:** `npm install`

## Run (local)
```
npm run dev
```
- Web app → http://localhost:5173
- AI/API server → http://localhost:8787 (health: /api/health)

## The end-to-end test (the "real product" slice)
1. Sign up as an **artist** → consent → onboarding (identity, links, draw bands, experience, readiness) → publish.
2. Open **Add / process evidence** → add a file or a draw band → **"עבד את ההוכחות"** →
   the AI labels each into a Claim (`מאומת` / `נתמך` / `מדווח עצמי`).
3. View the public **Passport** → it renders from published claims/items (draw as bands, no score).
4. As a **booker**, tap **"בדוק זמינות"** → submit the form → confirmation.
5. As the **agency** that owns the artist, open **בקשות זמינות** → see the request → mark replied/closed.

## Firewall (enforced in UI + data)
Draw is stored & shown as **bands / booleans** with a source label; **never** a score,
percentile, prediction, "bookability %", or an exact head-count. Bounded statuses only:
חזק · מתפתח · חסר-הוכחה · לא-ניתן-להעריך.

## Deploy later (no rewrite)
The same Supabase project + this frontend deploy to Vercel; `server/` becomes a serverless
function. See `../GIGPROOF-APIs-and-Accounts-Checklist.md`.
