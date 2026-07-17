# LOCK — CONNECTIONS REGISTRY (canonical, in-repo)

_Source: Cowork's handover (11 Jul), banked here so it's version-controlled and visible to all agents.
This file is THE registry of external connections. Update it when anything changes. No secrets — IDs only._

## Canonical decisions (Claude, 11 Jul — the handover asked)
- **Canonical app domain = `app.lock.show`** — the only surface with serverless functions (producer
  magic-link confirm, AI processing). `lock.show/app` = static embed mirror (marketing entry; auth works,
  server features don't). PROCESS RULE: every app release also rebuilds the embed (`npm run build:embed`)
  — skew between the two surfaces caused the 11-Jul "regression".
- Google OAuth chain VERIFIED healthy 11 Jul (headless trace: authorize → accounts.google.com, correct
  client + callback, no redirect_uri_mismatch). Owner should do one real Google login as final confirmation.

## The registry (from Cowork's handover, condensed)
- **DNS (GoDaddy):** A @ → 76.76.21.21 · CNAME www + app → cname.vercel-dns.com ✅
- **Vercel:** lock-site (prj_dUHnMaaTeg1ZeyyvEP93kVjOigCZ, root website-next, output `out`, static) →
  lock.show/www · lock-app (prj_ANv5iiMz4a8CUYA3gyzn7kvIUfho, repo root) → app.lock.show. Production
  tracks `main`. Deploy hooks exist (secrets in .env.local: VERCEL_DEPLOY_HOOK_SITE/APP).
  Env on lock-app: ANTHROPIC_API_KEY · ANTHROPIC_MODEL · SUPABASE_SERVICE_ROLE_KEY · VITE_SUPABASE_URL ·
  VITE_SUPABASE_ANON_KEY ✅
- **Supabase (qexfndiyallwqhhzeerd = "LOCK"):** Site URL app.lock.show; 7 redirect URLs (localhost,
  app.lock.show/**, lock.show/**, www.lock.show/**) ✅ · Providers: Email ✅ (confirm-email ON per
  handover — verify against autoconfirm assumption in code!), Google ✅, Facebook ⛔ (owner creating FB
  app now) · Migrations 027–031 applied ✅ · 021 FROZEN ⛔
- **Google Cloud (gigproof-501814 — name cosmetic):** OAuth client "lock.show Supabase", redirect URI =
  supabase callback, JS origins = all 3 domains ✅ · consent screen branded LOCK ✅ · YouTube Data v3 key ✅
- **Analytics:** GA4 G-ZX907M2NY8 (consent-gated) ✅ · Search Console domain property + sitemap (14 URLs) ✅

## Open items (owner/Cowork/Claude)
| # | Task | Owner | Status |
|---|---|---|---|
| 1 | One real Google login test (final OAuth confirmation) | Owner (30 sec) | 🟠 |
| 2 | Facebook app → Supabase provider → Claude flips OAUTH_FACEBOOK_ENABLED | Owner → Claude | 🔄 in progress |
| 3 | **Rotate Anthropic + Tavily keys** (were pasted in chats once) | Owner (consoles) | 🔴 do once |
| 4 | Resend signup + domain verify → Cowork wires Supabase SMTP | Owner → Cowork | 🟡 |
| 5 | Push git tags | Owner (full rights) | 🟡 |
| 6 | Legal placeholders (ח.פ., address, accessibility coordinator) | Owner + counsel | 🟡 |
| 7 | git remote set-url to lock.show | Claude | ✅ done 11 Jul |
| 8 | Verify email confirm-email setting vs code's autoconfirm assumption | Claude (flow fleet) | 🟠 |

## Optimization verdict (owner asked "is it managed correctly?")
It IS well-configured now (Cowork closed every infra gap). The management gaps were: (1) this registry
living on a local disk — fixed, it's in-repo now; (2) dual app surfaces skewing — fixed by the embed
rebuild rule; (3) keys pasted in chats — fix by one rotation (#3); (4) canonical-domain ambiguity — decided
above. After #1–#3 the connection layer is clean.
