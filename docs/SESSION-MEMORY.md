# SESSION MEMORY — durable state anchor
**Purpose:** first read after ANY context compaction or new session (owner directive, 8 Jul 2026).
**Rule:** refresh memory BEFORE acting. Reply to owner in ENGLISH. End every reply with the
priority board (docs/TASK-STATUS-BOARD.md) + open pending-from-owner list.

## Who / what
- Owner: Maria (Hebrew-speaking, reads English replies; does NOT read code). Decisions only she makes: price, domain, visual direction, migrations approval, counsel.
- Product: GIGPROOF pre-booking proof tool. Canon firewall in CLAUDE.md (no scores/ranks; bands+binaries+method labels).
- Demo persona: Shai Perlman — 3 hats: DJ PERLMAN (artist, multi-genre Acts) / artist representative (roster) / INSOMNIA TLV (production company).

## Deployments
- gigproof-website.vercel.app — Next.js marketing site + committed pre-built /app embed (NO /api).
- v6-b4-artist-pre-booking-intelligen.vercel.app — full app + API (service-role key). Producer-confirm works ONLY here.
- Deploy routine: main auto-deploys both; app changes need `npm run build:embed` → commit → push. Gate: vite build + build:demo + lint:i18n (3 known radarUniverse.js violations = accepted baseline) + website-next build.
- Sandbox proxy blocks vercel.app (403) — live site unverifiable from the container.

## Keys (values in gitignored .env.local + Maria's side; statuses only here)
- Anthropic: RECEIVED + VERIFIED locally. PENDING: Maria adds to Vercel v6-b4 env + Redeploy.
- Spotify: client id+secret VERIFIED (token + search OK). Not wired into app yet.
- Google API key: rescoped YouTube Data v3 only (CSE closed → Tavily replaces it).
- Tavily: RECEIVED + VERIFIED 8 Jul (EN+HE live searches OK). In .env.local; pending → Vercel env. Discovery build unblocked (counsel sign-off still gates go-live).
- GA4: RESOLVED — property 544738110, stream 'GIGPROOF App' (app.gigproof.co), measurement id G-ZX907M2NY8 wired into site (layout.tsx default) + app (index.html). Stream URL is a label only — works pre-domain.

## Migrations
- Live DB at 025/026. 021 FROZEN (vocab, needs app lockstep — bootstrapOrg 'booker' latent bug noted).
- 027 written NOT applied (workspace_type, artist_access scopes/status, can_access_artist fix, SECURITY DEFINER RPCs) — awaiting Maria's approval. Open ruling: 'producer' vs 'production' enum value; consent 4-vs-6.
- 028 planned bundle: 'discovered' source_type + HE/EN name fields, M1 analytics events, plan capability flags.

## Monetization (APPROVED)
No booking commission ever. Each entity pays its own plan; artist always owns/pays his evidence-truth layer (portable); office pays roster layer; Billing Sponsor mechanism. Plans: Passport (free) / Momentum (artist) / Roster (manager). Buyer free forever. No prices published until Gate. Payment: Bit 054-4555060, reference GP-XXXX, manual activation.

## Legal/compliance set (8 Jul, from Maria's uploads → docs/legal/)
- TERMS-HE, PRIVACY-HE, ACCESSIBILITY-HE: v0.1 drafts pending counsel (#23). Placeholders open: business entity/ח.פ., jurisdiction city, contact email, refund policy, accessibility coordinator.
- CONSENT-BANNER-SPEC implemented: GA4 Consent Mode v2, defaults denied, gtag injected only on grant, localStorage gigproof_consent, 12-month re-ask — on BOTH app and site, bilingual.
- docs/COSTS.md: verified stack costs; new needs surfaced: Resend for auth emails (free tier), Vercel/Supabase Pro decisions for commercial launch.
- Vocabulary flag: Terms draft uses "Mirror" — canon retired it (one Passport, views). Counsel draft should be aligned before publication.

## Open pending-from-Maria (repeat at end of every reply until resolved)
1. Anthropic key → Vercel v6-b4 env → Redeploy.
2. Approve migration 027 (+ ruling: 'producer' vs 'production'; consent 4-vs-6).
3. Fixed pilot price (rec ₪179).
4. Buy domain (rec gigproof.co + app.gigproof.co).
5. Google OAuth client → Supabase providers (redirect https://qexfndiyallwqhhzeerd.supabase.co/auth/v1/callback).
6. Green Invoice signup.
8. Send counsel email (docs/COUNSEL-EMAIL-DRAFT.md).
9. Later, low urgency: rotate Anthropic + Tavily keys (both pasted in chat).

## Standing instructions from Maria
- LANGUAGE LAW (8 Jul): EN and HE content each fully professional, localized per language, NEVER mixed in one view. LOCALIZATION MATRIX (docs/LOCALIZATION-MATRIX.md) must stay current. Docs managed at the same effectiveness level. Cheap resources allocated, supervised.
- Answer ALWAYS in English. Task board at end of EVERY chat reply, sorted by priority.
- Pending-from-her items repeated at end of every answer until resolved.
- After compaction: FIRST refresh memory (this file + board + keys registry).
- Docs-first; no invented data (META-FIELD LAW); QA PASS before any live deploy; cheap agents with clear handoffs; professional restraint in design (Live Intelligence style, ≥85% neutral).
