# LOCK — MASTER AUDIT SUITE
**v1.0 · 8 Jul 2026 · Owner order: "list all audit tests, general and per entity — do it, fix, deploy."**
Run cadence: FULL suite before any launch milestone; GENERAL G1–G4 before every deploy.

## GENERAL AUDITS (product-wide)
| # | Audit | What it checks | Method |
|---|---|---|---|
| G1 | Build gates | vite build · build:demo · lint:i18n (baseline=3) · build:embed · website-next build | commands, all green |
| G2 | **Deploy-pipeline truth** | Live domain serves the latest main (title fingerprint, robots Host, privacy version marker) — git green ≠ live green (tonight's lesson) | curl lock.show fingerprints vs repo |
| G3 | Design-token sweep | Zero raw palette classes / off-token hex in src + site | grep sweep |
| G4 | Brand/glossary sweep | Zero GIGPROOF user-facing; פספורט never דרכון; no Mirror; LOCK everywhere | grep + built-output scan |
| G5 | Firewall scan | No score/rank/percentile/prediction/guarantee outside negations — copy, schema, code | grep + copy review |
| G6 | Consent & measurement compliance | Banner renders once; GA fires ONLY after Accept; Decline = zero calls; persistence 12mo; banner never blocks CTAs (hit-test) | Playwright + network log |
| G7 | Localization matrix refresh | EN/HE key coverage %, mixed-language screens list | measurement script |
| G8 | SEO/AEO/GEO | Titles (no dup suffix), metadata budgets, schema validity, sitemap/robots, llms.txt, hreflang truth | expert + independent verifier |
| G9 | Accessibility (ת"י 5568/WCAG AA) | Keyboard nav, focus rings, contrast, screen-reader labels, RTL | audit pass (P1-12, pending) |
| G10 | Bundle hygiene | No secrets/keys in client bundles; service worker updates (autoUpdate) | grep dist + config check |

## PER-ENTITY AUDITS (each = full journey, desktop 1440×900 + mobile 390×844)
### E1 — ARTIST
signup/Google → onboarding (2 screens) → radar universe renders → node confirm (bloom fires, named confirm, honest receipt) → evidence link → AI labeling (real, not stub) → claim review (confirm/correct/dispute/omit) → producer-confirm link generation → multi-Act center-star (switch, no leakage, genre chips) → Passport tab = REAL passport → publish → Requests inbox → payment screen (GP-code) → notifications bell → settings/representation approve+revoke → HE mode (no mixed language)
### E2 — BOOKING MANAGER (אמרגן)
open shared passport link (no account) → 30-sec scan: bands+method labels+dates, NO scores → consent banner doesn't block CTA (hit-test) → availability request form → sent confirmation → WhatsApp handoff → paste-link resolver on /discover
### E3 — PRODUCER (מפיק)
magic link (no login) → confirm ceremony → YES = producer-confirmed; **PARTIAL ≠ confirmed (trust rule)** → revoke works → artist gets notification
### E4 — REPRESENTATIVE / AGENCY
workspace switch INTO agency (screen-set flips, survives reload) → roster (pending rows locked: "no content visible") → add-artist invite w/ scopes → requests inbox → radar feed actions all real
### E5 — PRODUCTION COMPANY (INSOMNIA)
switch to production workspace → correct screen-set → (full team/events/lineup = post-027 build; audit the degraded state honestly)
### E6 — OPERATOR
admin login → pending payment activate (GP-code match) → upgrade approve → export → delete-with-reason dialog → notification written to artist

## STATUS OF LAST FULL RUN (8 Jul night)
G1 ✅ · G2 🔴 **FAILING — live pinned to old build (Vercel builds failing/queued since c0d2575; ESM fix pushed, awaiting flip; owner checking dashboard)** · G3 ✅ (0 violations) · G4 ✅ code/⏳ live pending G2 · G5 ✅ (2 audits found zero) · G6 ✅ (fixed conversion-blocker same day) · G7 ✅ measured (79.3% app HE) · G8 🟡 expert done, independent verifier running · G9 🔴 not run yet (P1-12) · G10 🟡 SW autoUpdate ✓, bundle-secrets grep pending
E1 🟡 core verified incl. multi-Act + bloom + passport tab; AI-labeling live test pending owner · E2 ✅ verified · E3 ✅ verified (trust rule re-fixed + committed) · E4 ✅ switch verified tonight · E5 🟡 degraded pre-027 · E6 ✅ verified
