# DEPLOY LOG — every LOCK release, newest first

The chronological record of what shipped to production. One row per release. See
`docs/RELEASE-PROCESS.md` for how releases are made. "Verified" = fingerprints checked live,
not just pushed. Surfaces: **app** = app.lock.show · **site** = lock.show.

| Tag | Date | `main` @ | Surface | What shipped | Gate | Verified live |
|---|---|---|---|---|---|---|
| `hotfix-site-cleanurls` ✅ RESOLVED | 12 Jul 2026 | 6183e81 (merge of d06ac25, PR #2 by Cowork) | site | **INCIDENT (same day): all inner pages 404** — extensionless routing off after domain config change (apex→www redirect); files existed at `*.html`. Fix = 1 line (`cleanUrls: true`, website-next/vercel.json), authored by Claude (main-push permission-blocked → staged branch), merged+deployed by Cowork. **Claude independent re-verify: all 10 inner pages 200 · pricing fingerprint ✓ · FAQ still old copy (proof nothing else rode) · app/embed bundles unchanged.** Incident-to-resolution ≈ 1 hour; playbook §5 followed. Fix mirrored on train branch. | playbook §5 | live ✅ 10/10 pages (Claude curl) + Cowork browser 4/4 |
| `rel-site-2026.07.11-inner` | 11 Jul 2026 | 917ef57 | site | **Inner-pages release (7 pages).** Pricing rebuilt for ALL 4 entities ("Four people make a booking happen") + pilot-truth aligned; how-it-works friend-voice + image header; methodology warm-precise; FAQ truth fix (automated pipeline); contact humanized; radar page positive-values + persona image band. Sitewide EN purity: ZERO Hebrew glyphs (unicode-verified). Earlier same day: embed-skew regression fix + nav IA (e027958). | ✅ build + sweeps | live ✓ pricing/radar fingerprints + 0 hebrew |
| `rel-2026.07.10` | 10 Jul 2026 | a874ab5 | app | **R1 + R2-mini — the full 10-Jul feature release.** Two-persona public Passport (Booking · Representation, ?view=rep), booker nav tab, sample passport works on live, draw-headline firewall hardening, Hebrew auth screens (app surface), GATE events (professional_reaction_submitted + entitlement_activated), producer-reply notification + claim_confirmed event, request-notification link fix, 42P17 soft-catch. Owner delegated autonomous execution. | ✅ nav 34/34 + language-pure + build + demo | deploy fired; public-surface verify below |
| `rel-hotfix-2026.07.10` | 10 Jul 2026 | eafcd4e | app | **🔒 FIREWALL HOTFIX** — artist_approved gate enforced on the service-role server path (buildSafePayload) + authenticated buyer view + owner snapshot. Complements migration 031 (anon RLS, applied). Recommended by Codex + Claude; owner delegated autonomous execution. Tag local-only (remote tag push 403 — integration perms); SHA is the anchor. | ✅ nav 34/34 + build | app 200 ✅ (deep browser pass pending) |
| `rel-site-2026.07.10` | 10 Jul 2026 | 4b36e10 | site (embed) | **Hebrew auth screens on lock.show/app** — auth-i18n embed update (blank HE subtitle fixed; login/signup fully localized). Site-only diff (4 static files). | ✅ (static embed, integrity-checked) | live ✅ — /app/login serves index-BhML6any.js |
| `rel-2026.07.09` | 9 Jul 2026 | b06440e | app (+embed) | **V1: M1 analytics — the Gate is now measurable.** logEvent persists canonical events to analytics_event (direct client write, RLS ae_any_insert); wired both Gate signals (availability_request_created = react · payment_reference_created = pay) + passport_view + signup/login/onboarding. Notifications were already complete. app.lock.show auto-deploys; embed needs a site promote. | ✅ verify green | builds ✅ |
| _(within rel-2026.07.09)_ | 9 Jul 2026 | d2ee4c8 | app + site | **Artist WhatsApp sharing** (029 applied) + Cowork promoted to Production (design system Step 1, login button, auth fixes, nav, inboxes all went live). | ✅ | live ✅ (Cowork-verified) |
| _(within rel-2026.07.09)_ | 9 Jul 2026 | b3866e2 | app + site | **Design System v1.2.0 — Step 1 (site-first, owner-chosen).** Site aligned to exact DS: dark panel→forest #18221a, added mist/slate, Georgia display headlines; accent lime→#C8F04D (app+site); DS saved to repo as SSOT; brand assets preserved (already wired). App re-theme = Step 2, pending owner review of the live site. | ✅ verify green | site build ✅ |
| _(within rel-2026.07.09)_ | 9 Jul 2026 | a0d6b80 | app + site | Official channels + inboxes: social links (IG/FB/LinkedIn), WhatsApp, 11 role-based emails; JSON-LD sameAs + contactPoints; legal-page email placeholders filled. | ✅ | site build ✅ |
| _(within rel-2026.07.09)_ | 9 Jul 2026 | e769bc0 | app + site | **Navigation contract** — single tested source of truth for all routing + `nav-contract.test.mjs` (34 journeys) + `npm run verify`. Skeleton navigation now proven on every build. | ✅ verify green | builds ✅ |
| _(within rel-2026.07.09)_ | 9 Jul 2026 | a8d58a5 | app + site | **Audit-and-fix: 7 bugs** — boot-hang, password-reset stuck (PKCE), reset redirect base, login return-path, demo upload crash, dead-end links, agency-radar bounce. | ✅ | builds ✅ |
| _(within rel-2026.07.09)_ | 9 Jul 2026 | a1ae464 | app + site | **Signup dead-end fixed** — PKCE returned null session even with auto-confirm; now falls back to password sign-in. | ✅ | builds ✅ |
| _(pre-log baseline)_ | 8–9 Jul 2026 | 15d058b | app + site | LOCK rebrand, lock.show live (static export + deploy hook), migrations 027/028 applied, consent banner, GA4, PWA cache fix, OAuth code-exchange. | ✅ | live ✅ |

## How to read this
- **Tag** — the named, immutable release point (`git checkout rel-2026.07.09` restores exactly that).
- **`main` @** — the commit that was live. Rows marked _(within …)_ are notable commits folded into the
  dated release above them (we tag once per day pre-launch, not once per commit).
- **Verified live** — "builds ✅" means the gate passed; "live ✅" means fingerprints were checked on the
  deployed URL. Auth flows that need a real browser (Google login) are marked as owner live-tests.

## Next release checklist (copy when cutting the next one)
- [ ] `npm run verify` green
- [ ] promote to `main` (fast-forward)
- [ ] app auto-deploys · POST the site deploy hook
- [ ] confirm fingerprints live
- [ ] add a row here + tag `rel-YYYY.MM.DD` + refresh SESSION-MEMORY + task board
