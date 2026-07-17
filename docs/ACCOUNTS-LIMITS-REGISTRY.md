# LOCK — ACCOUNTS, SUBSCRIPTIONS, LIMITS & BUDGET REGISTRY

_Owner directive (12 Jul): proper management of all accounts/connections/subscriptions/budget/limits with
documented status. Companion to CONNECTIONS-REGISTRY.md (IDs/config). This file = plans, limits, risks._

## Per-service status
| Service | Plan | Hard limits that can bite us | Risk & mitigation | Status |
|---|---|---|---|---|
| **Vercel** (both projects) | Hobby (free) | **100 deploys/day** (hit once, 9 Jul) · 1 concurrent build · previews build on EVERY branch push (burn quota + can fail noisily) | 12-Jul email = **PREVIEW failure only — production verified current** (site 200 + new pricing live; app 200; embed current). MITIGATION (Cowork, dashboard): lock-site + lock-app → Settings→Git → **disable preview deployments** (or ignore non-main branches). Saves ~⅔ of quota; kills the noise emails. | 🟢 prod healthy · 🟡 previews noisy |
| **Supabase** | Free | 500MB DB · 1GB storage · 50K MAU · **project PAUSES after ~7 days of inactivity** | Pause = the app dies silently. Pre-pilot traffic keeps it alive; until then Cowork should open the dashboard weekly OR we accept the risk short-term. Upgrade trigger: first real users (Pro $25/mo). | 🟢 active |
| **Anthropic API** | Pay-as-you-go credits | Credit balance runs out silently → AI labeling falls back to mock | Owner: check console credit balance; set billing alert. ~$1/artist deep scan (canon). ⚠️ ROTATE KEY (was pasted in chat). | 🟠 balance unknown |
| **Google Cloud** | Free tier | OAuth consent in "Testing" mode caps at 100 test users & shows warning screen — check publish status | If consent screen is Testing → publish to Production (no verification needed for basic email/profile scopes). Cowork: 2 min check. | 🟠 verify publish status |
| **Meta / Facebook app** | Free | Dev-mode app = only admins/testers can log in. **Live mode requires: Privacy Policy URL + Data Deletion URL + app icon; business verification NOT needed for basic email scope** | Owner mid-setup, hitting friction. Unblock checklist below. | 🔴 in progress |
| **Resend** | Not yet created | Free: 3K emails/mo, 100/day | Needed for auth emails from lock.show (deliverability). Owner signup → Cowork wires SMTP. | 🔴 open |
| **GoDaddy (lock.show)** | Paid domain | Annual renewal — set auto-renew ON | Losing the domain = losing everything. Owner: confirm auto-renew + billing card valid. | 🟠 confirm auto-renew |
| **GA4 / Search Console** | Free | Data thresholds only | None material pre-launch. | 🟢 |
| **GitHub (Hello-MNB)** | Free org | Integration can't push tags (403) — quirk, not quota | Tags pushed from owner machine occasionally. | 🟢 |

## Facebook Login — the unblock checklist (the friction is usually one of these)
1. developers.facebook.com → Create App → use case "Authenticate and request data from users" (Consumer).
2. Add product **Facebook Login** → Settings → **Valid OAuth Redirect URIs** = `https://qexfndiyallwqhhzeerd.supabase.co/auth/v1/callback`.
3. App Settings → Basic: **Privacy Policy URL** = `https://lock.show/privacy` · **User data deletion** = `https://lock.show/privacy` (contact instructions) · app icon (any 1024px logo) · category "Music".
4. Switch the app from **Development → Live** (top toggle). Basic `email`+`public_profile` scopes need NO app review.
5. Copy **App ID + App Secret** → Supabase → Auth → Providers → Facebook → Enable.
6. Tell Claude "Facebook enabled" → flag flip + release same hour.

## Budget snapshot (monthly, current)
Domain ~₪5/mo amortized · everything else ₪0 (free tiers) · Anthropic usage-based (~$1/artist onboarding).
**First real spend decisions arrive with the pilot:** Supabase Pro ($25/mo) if traffic/pause becomes real, Resend stays free-tier.

## Release-audit rule (new, standing)
Every release verification now includes: production fingerprints on ALL THREE surfaces (site · app · embed)
— free-tier preview failures are logged as noise unless production drifts.
