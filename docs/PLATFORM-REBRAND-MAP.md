# LOCK — EXTERNAL PLATFORMS RENAME/PARAMETERS MAP
**v1.0 · 8 Jul 2026 · Owner order: list all platforms to change name/details/parameters, map gaps.**
Code-side rebrand is COMPLETE and deployed-pending-pipeline. This map covers EXTERNAL dashboards only.

| # | Platform | What to change | Visible to users? | Who | Priority | Status |
|---|---|---|---|---|---|---|
| 1 | **Supabase — URL config** | Site URL → app.lock.show + redirect list | Yes (auth redirects/emails) | Maria | P0 | ✅ **DONE 8 Jul (verified)** |
| 2 | **Google Cloud — OAuth client** | Display name "GIGPROOF Supabase" → "LOCK"; OAuth consent screen: app name → LOCK, add lock.show to authorized domains, support email | **YES — users see the app name on Google's sign-in consent screen** | Maria | **P0 — highest of this list** | 🔴 |
| 3 | **GA4** | Property name "GIGPROOF"→LOCK; stream name "GIGPROOF App"→"LOCK App"; stream URL app.gigproof.co→app.lock.show | No (internal dashboards) | Maria | P2 cosmetic | 🔴 |
| 4 | **Supabase — auth emails** | Email templates sender/subject (currently defaults); real fix = Resend SMTP with @lock.show sender | Yes (signup/reset emails) | Maria+Claude | P1 — after Resend signup | 🔴 depends #26 |
| 5 | **Supabase — project name** | "Pre-Booking Intelligence & Growth" → "LOCK" | No | Maria | P3 cosmetic | 🔴 |
| 6 | **Vercel — project names** | gigproof-website / v6-b4-… → lock-site / lock-app. ⚠️ CAUTION: renaming changes the *.vercel.app fallback URLs (old links die). Custom domains unaffected. Do AFTER pipeline is stable, not tonight | No (custom domains mask it) | Maria | P3, deliberate timing | 🔴 hold |
| 7 | **Spotify Developer app** | App name (shows on Spotify consent screens if user-OAuth is ever used; today client-credentials only) | Future-yes | Maria | P2 | 🔴 |
| 8 | **Anthropic console** | Key/workspace labels | No | Maria | P3 cosmetic | 🔴 |
| 9 | **Tavily** | Account/key label | No | Maria | P3 cosmetic | 🔴 |
| 10 | **Green Invoice (on signup)** | Business = the legal עוסק name (NOT the brand); invoices can display brand "LOCK" as trade name | Yes (receipts) | Maria | P0 with pricing | 🔴 = pending #6 |
| 11 | **GitHub repo name** | V6.B4-Artist-Pre-Booking… → lock. ⚠️ Renaming can break Vercel git integration + this session's tooling. Post-launch cleanup with care | No | Maria+Claude | P3 hold | 🔴 hold |
| 12 | **Google Drive canon docs** | Folder/doc titles still GIGPROOF (★ START HERE, B4-*, etc.) — rename headline docs, per DRIVE-HYGIENE (update in place, no duplicates) | No (internal) | Maria/Cowork | P2 | 🔴 |
| 13 | **Claude artifact prototype** | Still GIGPROOF-branded (internal demo tool) | Only demo viewers | Claude | P3 — on next prototype refresh | 🔴 |
| 14 | **GoDaddy** | Nothing to rename (registrar). Future: email forwarding / MX when Resend lands | — | — | — | ✅ n/a |
| 15 | **Bit** | Nothing — personal number; the business identity lives in Green Invoice receipts | — | — | — | ✅ n/a |

## GAP SUMMARY (what actually matters, in order)
1. **Google OAuth consent screen (#2)** — the only remaining place a USER sees "GIGPROOF". 3 minutes in Google Cloud console.
2. **Auth emails (#4)** — sender is anonymous Supabase default until Resend + @lock.show (needs domain MX, I guide when you sign up).
3. Everything else is internal-cosmetic or deliberately held (renames that break URLs/integrations — do post-stability).
