# LOCK — LAUNCH DOD (owner-readable · first launch in Israel · 2 languages EN+HE)
One page: what "done" means today — screens, processes, tech, integrations, costs. No jargon.

## 0) The version
ONE full up-to-date version from branch claude/b4-gigproof-discovery-e7749o. When ALL boxes below
are checked → preview → QA by everyone → Maria approves → LIVE. (The "restore" mentioned earlier
is internal server housekeeping by Cowork — nothing Maria needs to do or understand.)

## 1) DOD — screens & processes (per entity; full detail in FLOWS-PER-ENTITY.md + DEPLOY-GAPS.md)
- ARTIST: signup → onboarding → Radar WITH milestone path (G1) + genre emphasis (G2) → evidence →
  claim review → publish (free) → share → requests inbox → multi-Act. DONE = every step works
  forward AND backward, EN+HE, mobile 360px + desktop, no dead end, no score/rank anywhere.
- MANAGER OFFICE: outreach page → waitlist/signup → consent handshake → roster WITH one
  next-action per artist (G4) → requests → team. DONE = same bar.
- PRODUCTION: outreach page → dashboard (events/requests) → confirms claims; books via Passport.
- BUYER (pro + private): open Passport link with NO login → request availability. DONE = a
  stranger completes it in under a minute, warm HE for private clients.
- SOURCE CONFIRMER: magic link → one claim → confirm/decline. No account, ever.
- SITE: every audience page → beta signup recorded with role+page+message-batch attribution.
- ADMIN (Maria): 7 ops sections live today; Business cockpit = next version (spec'd).
## 2) LANGUAGES (launch requirement): EN+HE first-class — G6 closes the 🚩flag: no English text
under Hebrew on the main routes; RTL correct incl. numbers/dates/links. RU/DE = later, built-in.
**OWNER RULING (14 Jul): the Israel launch = SITE + ACTIVITY in BOTH languages, together.** The
Hebrew MARKETING SITE is therefore IN launch scope — it is the wave immediately after the
rel-2026.07.13 train deploys (train scope itself unchanged; "OUT: Hebrew site" in SCOPE-rel
refers to that train only, NOT to the launch). No visitor-bringing activity starts before the
bilingual site is live. Work split: Claude = i18n externalization of website-next page bodies +
RTL architecture (rides after the preview snapshot so the RC0 freeze stays valid) · Codex =
native-HE page copy (its craft per owner ruling: copy+localization+psychology = one craft) ·
Cowork = bilingual QA on preview.

## 3) TECH / API / INTEGRATIONS (what the product runs on)
- Supabase (project qexfndiyallwqhhzeerd): database + login + security rules. Migrations 001–035
  applied — incl. 034 in effect (DB CHECK = app CANON = 29 events, Cowork-verified SYNC §29) and
  035 (workspace RPC, SYNC §28). 021 FROZEN. (Corrected 14 Jul per GPT RC0 audit.)
- Anthropic API: AI claim extraction per evidence item (the live AI). Deep multi-source scan =
  planned only, per canon.
- Vercel: hosting site + app. Previews on demand during QA, then production-only (Cowork).
- Payments: LOCK launches as a FREE PILOT (G17 ruling). No payment CTA, price, Bit acceptance or
  manual entitlement activation is part of this launch; the payment infrastructure stays DORMANT.
  Bit + Green Invoice activate only after the Gate, on explicit owner word.
- Email (Resend): NOT wired yet — signups work without it; transactional email = next version.
- Google services (GA4/GTM): PARKED to post-launch marketing by owner decision.
## 4) COSTS (monthly, honest)
- Supabase free today; Pro $25/mo needed before structural DB work (backups) — owner pending.
- Vercel free tier currently sufficient; Anthropic API ≈ cents per evidence item (per-evidence
  extraction only; no $1 deep scan until built+measured). Domain lock.show = already owned.
- No other paid infra in this launch. AI-cost ledger = admin cockpit next version.

## 5) QA (after the version is fully built)
Preview URL → Cowork Q1–Q7 technical lanes (all 7 entity flows, both languages, forward/backward, new+existing
users) → Codex Q4 design/effectiveness → CFRO business pass → GPT drift audit → Maria Q8 owner
pass (walk Artist + Buyer flows like a stranger) → merge → live re-verify → tag + rollback point.
EVERYONE returns reasoned improvement recommendations, not just pass/fail (owner rule).
