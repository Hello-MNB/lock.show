# SESSION MEMORY — durable state anchor
**Purpose:** first read after ANY context compaction or new session (owner directive, 8 Jul 2026).
**Rule:** refresh memory BEFORE acting. Reply to owner in ENGLISH. End every reply with the
priority board (docs/TASK-STATUS-BOARD.md) + open pending-from-owner list.

## Who / what
- Owner: Maria (Hebrew-speaking, reads English replies; does NOT read code). Decisions only she makes: price, domain, visual direction, migrations approval, counsel.
- Product: LOCK pre-booking proof tool (domain lock.show; formerly GIGPROOF, renamed 8 Jul 2026). Canon firewall in CLAUDE.md (no scores/ranks; bands+binaries+method labels).
- Demo persona: Shai Perlman — 3 hats: DJ PERLMAN (artist, multi-genre Acts) / artist representative (roster) / INSOMNIA TLV (production company).

## Deployments
- 9 Jul: **lock.show FULLY LIVE** — static export serving (Framework=Other + out/ + Maria's dashboard clicks closed it). Fingerprints verified: LOCK title, privacy v0.2 (0 GIGPROOF), robots Host lock.show + Disallow /app, pricing/app-embed/sitemap all 200. G2 audit CLOSED. Sitemap (14 URLs) submitted+accepted in Search Console (Cowork). Vercel site project final config: Framework=Other, Build=npm run build, Output=out, Root=website-next — do not change. Site architecture is now output:'export' (plain files) — never revert to server output without revisiting the Vercel preset saga.
- 8 Jul night: **lock.show LIVE** (Maria attached domains + DNS; confirmed 'באוויר') → LOCK rebrand deployed to main (7472688). Mapping live: lock.show=site, app.lock.show=app. Supabase URL config DONE 8 Jul (verified screenshot); GA4 stream label + Google OAuth client display name cosmetic renames (external dashboards).
- 8 Jul DEPLOYED: main fast-forwarded 9c99873→b410824 (Maria's explicit approval). Ships: unified design (0 off-palette), consent banner (Consent Mode v2, conversion-safe), GA4 G-ZX907M2NY8, legal pages /terms /privacy /accessibility, notifications P1-1, producer-trust fix, brand vocabulary cleanup, platform-logo + today's batch merged.
- gigproof-website.vercel.app — Next.js marketing site + committed pre-built /app embed (NO /api).
- v6-b4-artist-pre-booking-intelligen.vercel.app — full app + API (service-role key). Producer-confirm works ONLY here.
- Deploy routine: main auto-deploys both; app changes need `npm run build:embed` → commit → push. Gate: vite build + build:demo + lint:i18n (3 known radarUniverse.js violations = accepted baseline) + website-next build.
- Sandbox proxy blocks vercel.app (403) — live site unverifiable from the container.

## Keys (values in gitignored .env.local + Maria's side; statuses only here)
- Anthropic: VERIFIED + Maria added to Vercel (8 Jul, via Cowork). Remaining: verify real AI labeling on v6-b4 after redeploy.
- Spotify: client id+secret VERIFIED (token + search OK). Not wired into app yet.
- Google API key: rescoped YouTube Data v3 only (CSE closed → Tavily replaces it).
- Tavily: RECEIVED + VERIFIED 8 Jul (EN+HE live searches OK). In .env.local; pending → Vercel env. Discovery build unblocked (counsel sign-off still gates go-live).
- GA4: RESOLVED — property 544738110, stream 'GIGPROOF App' (app.gigproof.co), measurement id G-ZX907M2NY8 wired into site (layout.tsx default) + app (index.html). Stream URL is a label only — works pre-domain.

## Migrations
- Live DB at 025/026. 021 FROZEN (vocab, needs app lockstep — bootstrapOrg 'booker' latent bug noted).
- **027 APPLIED to live DB 9 Jul** ('Success. No rows returned' — screenshot verified). Unlocks real consent handshake + representation/production workspaces; 'producer' enum word stands (owner ran as written). Was: 027 written NOT applied (workspace_type, artist_access scopes/status, can_access_artist fix, SECURITY DEFINER RPCs) — awaiting Maria's approval. Open ruling: 'producer' vs 'production' enum value; consent 4-vs-6.
- **028 APPLIED to live DB 9 Jul** (Cowork-run, 'Success. No rows returned'). Live schema now at 028: discovered source+provenance, stage_name_he/name_he, 28-event analytics taxonomy (M1 funnel), organization.plan_flags. Next builds unlocked: M1 event writers, plan enforcement, discovery scanner persistence. Was: 028 planned bundle: 'discovered' source_type + HE/EN name fields, M1 analytics events, plan capability flags.

## Monetization (APPROVED)
No booking commission ever. Each entity pays its own plan; artist always owns/pays his evidence-truth layer (portable); office pays roster layer; Billing Sponsor mechanism. Plans: Passport (free) / Momentum (artist) / Roster (manager). Buyer free forever. No prices published until Gate. Payment: Bit 054-4555060, reference GP-XXXX, manual activation.

## Legal/compliance set (8 Jul, from Maria's uploads → docs/legal/)
- TERMS-HE, PRIVACY-HE, ACCESSIBILITY-HE: v0.1 drafts pending counsel (#23). Placeholders open: business entity/ח.פ., jurisdiction city, contact email, refund policy, accessibility coordinator.
- CONSENT-BANNER-SPEC implemented: GA4 Consent Mode v2, defaults denied, gtag injected only on grant, localStorage gigproof_consent, 12-month re-ask — on BOTH app and site, bilingual.
- docs/COSTS.md: verified stack costs; new needs surfaced: Resend for auth emails (free tier), Vercel/Supabase Pro decisions for commercial launch.
- Vocabulary flag: Terms draft uses "Mirror" — canon retired it (one Passport, views). Counsel draft should be aligned before publication.

## Open pending-from-Maria (repeat at end of every reply until resolved)
1. Verify real AI labeling works on v6-b4 (key now in Vercel ✅ — needs a live test after redeploy).
2. RESOLVED 9 Jul: 027 applied (producer word stands). Remaining sub-ruling: consent 4-vs-6 (low urgency).
3. Fixed pilot price (rec ₪179).
4. RESOLVED — domain LIVE, rebrand deployed. Residual: Supabase URL update (above). Was: DOMAIN PURCHASED 8 Jul: **lock.show** (GoDaddy, +Full Domain Protection, receipt to garmel.maria@gmail.com). Mapping: lock.show=site, app.lock.show=app. RESOLVED 8 Jul: owner ordered full rebrand — product renamed GIGPROOF → LOCK everywhere in user-facing copy (privacy policy's temporary-name clause updated accordingly). Code URL updates applied; DNS attach still pending.
5. Google OAuth: client CREATED ✅ ('GIGPROOF Supabase', redirect verified). Final step (Maria): paste Client ID+Secret into Supabase Google provider, toggle ON, Save → then ME: VITE_OAUTH_ENABLED=1 (Vercel env + .env.embed) + rebuild.
6. Green Invoice: DEFERRED by owner (9 Jul) until first payment intent (S3 signal: payment_reference_created). Launch plan: docs/LAUNCH-PLAN.md.
8. Send counsel email (docs/COUNSEL-EMAIL-DRAFT.md).
9. NEW ruling needed: Hebrew term for 'Act' (canon has none; forbidden to invent).
10. Later, low urgency: rotate Anthropic + Tavily keys (both pasted in chat).

## Document governance (8 Jul, owner directive)
- docs/GLOSSARY.md is BINDING for all agents/documents (created after R00 rejected privacy v0.2 for דרכון/מראה/Netlify/no-AI violations).
- Repo docs/ = SSOT for corrected documents; Drive stale-file actions listed in docs/DRIVE-HYGIENE.md (no junk that confuses future agents).
- Privacy v0.2: R00 base rejected → copy/regulation agent corrects (glossary + facts: Vercel, Anthropic ACTIVE, GA4 consent-gated) → published as temporary version pending counsel.

## Standing instructions from Maria
- LANGUAGE LAW (8 Jul): EN and HE content each fully professional, localized per language, NEVER mixed in one view. LOCALIZATION MATRIX (docs/LOCALIZATION-MATRIX.md) must stay current. Docs managed at the same effectiveness level. Cheap resources allocated, supervised.
- Answer ALWAYS in English. Task board at end of EVERY chat reply, sorted by priority.
- Pending-from-her items repeated at end of every answer until resolved.
- After compaction: FIRST refresh memory (this file + board + keys registry).
- Docs-first; no invented data (META-FIELD LAW); QA PASS before any live deploy; cheap agents with clear handoffs; professional restraint in design (Live Intelligence style, ≥85% neutral).
