# GIGPROOF — Setup Checklist (handoff for the Cowork setup agent)

Everything required to run GIGPROOF **live** (with real data) and to **deploy** it.
Derived from the actual codebase state — not theory. Do the phases in order (dependencies noted).

- **Supabase project ref:** `qexfndiyallwqhhzeerd`
- **Local env file:** `C:\Users\user\gigproof\.env.local` (git-ignored ✓ — never commit secrets)
- **Per item:** What/why · Where (URL) · Steps · Where the value goes · **Secret?** · Depends on

> **🔒 Secret items = only Maria pastes them** (into `.env.local` or a dashboard field). Never put a secret in chat, code, or git.
> **Non-secret items = the Cowork agent can configure them in the browser.**

---

## ✅ Already set — DO NOT touch
In `.env.local`: `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` · `ANTHROPIC_MODEL` · `API_PORT`.

---

## ⭐ Absolute minimum to run live locally
**Phase 1, item 1A only.** Add the access token → the maintainer runs `node scripts/setup-remote.mjs` then `npm run seed`, and all 5 personas work locally. OAuth (Phase 3–4) is only for the Google/Facebook buttons; Deploy (Phase 6) only for a public URL; Anthropic (Phase 5) only for live AI.

---

## PHASE 1 — Database live (the one real blocker)

### 1A · `SUPABASE_ACCESS_TOKEN` — *recommended: one item unlocks the DB*
- **What/why:** A personal token that lets the project's script apply the database schema **and** auto-fetch the service-role key — no manual pasting of the service key.
- **Where:** https://supabase.com/dashboard/account/tokens
- **Steps:** 1) Generate new token → name it `gigproof-setup` → Generate. 2) **Copy immediately** (`sbp_…`, shown once).
- **Where it goes:** `C:\Users\user\gigproof\.env.local`, new line: `SUPABASE_ACCESS_TOKEN=sbp_...`
- **Secret?** **YES 🔒** (Maria pastes into the file). Can be revoked after setup.
- **Depends on:** —
- **Then run:** `node scripts/setup-remote.mjs` (applies `supabase/apply_to_supabase.sql` + writes the service-role key into `.env.local`), then `npm run seed`.

### 1B · `SUPABASE_SERVICE_ROLE_KEY` — *manual alternative to 1A (skip if you used 1A)*
- **What/why:** Server key that lets the API write data and serve the public Passport. **Auto-fetched by 1A** — only needed if you skip the token.
- **Where:** https://supabase.com/dashboard/project/qexfndiyallwqhhzeerd/settings/api → **Project API keys** → `service_role` → Reveal → Copy.
- **Steps:** 1) Open the page. 2) Reveal `service_role`. 3) Copy.
- **Where it goes:** `.env.local` → replace `SUPABASE_SERVICE_ROLE_KEY=PASTE_...` with the real value.
- **Secret?** **YES 🔒**
- **Depends on:** Schema applied. If manual, first run `supabase/apply_to_supabase.sql` in https://supabase.com/dashboard/project/qexfndiyallwqhhzeerd/sql/new

---

## PHASE 2 — Supabase Auth config (signup flow + OAuth)

### 2A · Email confirmation (config decision)
- **What/why:** Whether signup requires clicking an email link. For a fast pilot, **turn OFF** so users can sign up and log in immediately.
- **Where:** https://supabase.com/dashboard/project/qexfndiyallwqhhzeerd/auth/providers → **Email**.
- **Steps:** 1) Open Email provider. 2) Toggle **Confirm email** OFF. 3) Save. *(Alternative: configure SMTP for real confirmation emails.)*
- **Where it goes:** Dashboard (not a file).
- **Secret?** No.
- **Depends on:** Schema applied (Phase 1).

### 2B · Site URL + Redirect URLs (required for OAuth + password reset)
- **What/why:** The URLs Supabase is allowed to return a user to after OAuth/email. Without these, OAuth fails.
- **Where:** https://supabase.com/dashboard/project/qexfndiyallwqhhzeerd/auth/url-configuration
- **Steps:** 1) Site URL = `http://localhost:5173` (later also the production domain). 2) Redirect URLs → Add → `http://localhost:5173/**` (later also `https://<vercel-domain>/**`). 3) Save.
- **Where it goes:** Dashboard.
- **Secret?** No.
- **Depends on:** —

---

## PHASE 3 — Google OAuth (the "Sign in with Google" button)

### 3A · Google OAuth **Client ID** + **Client Secret**
- **What/why:** Credentials that enable sign-in with a Google account.
- **Where:** https://console.cloud.google.com/apis/credentials
- **Steps:**
  1. Create/select a project.
  2. (First time) **OAuth consent screen** → https://console.cloud.google.com/apis/credentials/consent → External → fill app name + support email → Save.
  3. Credentials → **Create Credentials → OAuth client ID** → Application type **Web application**.
  4. **Authorized redirect URIs** → add exactly: `https://qexfndiyallwqhhzeerd.supabase.co/auth/v1/callback`
  5. Create → copy **Client ID** + **Client Secret**.
- **Where it goes:** Supabase → https://supabase.com/dashboard/project/qexfndiyallwqhhzeerd/auth/providers → **Google** → Enable → paste Client ID + Client Secret → Save.
- **Secret?** Client ID = No · **Client Secret = YES 🔒**
- **Depends on:** Maria's Google account; Phase 2B (redirect URL).

---

## PHASE 4 — Facebook OAuth (the "Sign in with Facebook" button)

### 4A · Facebook **App ID** + **App Secret**
- **What/why:** Credentials that enable sign-in with a Facebook account.
- **Where:** https://developers.facebook.com/apps
- **Steps:**
  1. Create App → type **Consumer** ("Authenticate and request data from users").
  2. Add product **Facebook Login**.
  3. Settings → Basic → copy **App ID** + **App Secret**.
  4. Facebook Login → Settings → **Valid OAuth Redirect URIs** = `https://qexfndiyallwqhhzeerd.supabase.co/auth/v1/callback` → Save.
- **Where it goes:** Supabase → same Providers page → **Facebook** → Enable → paste App ID + App Secret → Save.
- **Secret?** App ID = No · **App Secret = YES 🔒**
- **Depends on:** Maria's Meta/Facebook account; Phase 2B.

---

## PHASE 5 — Anthropic (optional — real AI instead of the stub)

### 5A · `ANTHROPIC_API_KEY`
- **What/why:** Enables evidence labelling with the real Claude model. **Optional** — without it a deterministic stub runs (per canon).
- **Where:** https://console.anthropic.com/settings/keys
- **Steps:** 1) Create Key. 2) Copy (`sk-ant-…`).
- **Where it goes:** `.env.local` → `ANTHROPIC_API_KEY=sk-ant-...` (and later as a Vercel env var).
- **Secret?** **YES 🔒**
- **Depends on:** —

---

## PHASE 6 — Deploy (public URL)

### 6A · GitHub repo — *prerequisite for Vercel*
- **What/why:** Hosts the code so Vercel can deploy and auto-update. **No git remote exists yet** — create one.
- **Where:** https://github.com/new
- **Steps:** 1) Create a (private) repo. 2) In PowerShell, in the project folder: `git remote add origin <repo-url>` → `git push -u origin main`.
- **Where it goes:** git remote (not an env file). ⚠️ `.env.local` is already in `.gitignore` — confirm it is NOT pushed.
- **Secret?** No (but never commit secrets).
- **Depends on:** —

### 6B · Vercel — connect project
- **What/why:** Hosts the app at a public address.
- **Where:** https://vercel.com/new
- **Steps:** 1) Sign up/in. 2) Import the GitHub repo. 3) Framework = Vite (auto-detected; `vercel.json` is already in the repo). 4) Deploy.
- **Where it goes:** Vercel dashboard.
- **Secret?** No.
- **Depends on:** 6A.

### 6C · Vercel — Environment Variables
- **What/why:** The keys the app needs in production (frontend build + the serverless API function).
- **Where:** Vercel → Project → **Settings → Environment Variables**.
- **Steps:** Add all 5 (same values as `.env.local`): `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` · `ANTHROPIC_API_KEY` · `ANTHROPIC_MODEL`. Then Redeploy.
- **Where it goes:** Vercel dashboard (not a file).
- **Secret?** `SUPABASE_SERVICE_ROLE_KEY` + `ANTHROPIC_API_KEY` = **YES 🔒** · the rest = No.
- **Depends on:** 6B; values from Phase 1/5.

### 6D · Update Redirect URLs for the production domain
- **What/why:** So OAuth/emails also work on the live site.
- **Where:** Back to 2B (Supabase URL Configuration) + add the Vercel domain to Google/Facebook Authorized origins/redirects.
- **Secret?** No.
- **Depends on:** 6B (the domain now exists).

---

## 🔒 Secrets summary — only Maria pastes these (never chat/git)
1. `SUPABASE_ACCESS_TOKEN`
2. `SUPABASE_SERVICE_ROLE_KEY` (skipped if 1A is used)
3. Google **Client Secret**
4. Facebook **App Secret**
5. `ANTHROPIC_API_KEY` (only if real AI is wanted)

**Non-secret (Cowork agent free to configure in-browser):** enable/disable providers + email-confirm, Site/Redirect URLs, Client ID, App ID, connecting Vercel/GitHub, framework settings.

---

## Verify after setup
- Local: `npm run dev` → http://localhost:5173 → sign up → role picker (artist/booker/producer/agency) → role home.
- Test users after `npm run seed` (password `Gigproof!2026`): `artist@` · `booker@` · `producer@` · `agency@` · `operator@gigproof.test`. Producer confirm demo: `/confirm/seed-confirm-token`.
