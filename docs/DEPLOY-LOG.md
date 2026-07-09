# DEPLOY LOG — every LOCK release, newest first

The chronological record of what shipped to production. One row per release. See
`docs/RELEASE-PROCESS.md` for how releases are made. "Verified" = fingerprints checked live,
not just pushed. Surfaces: **app** = app.lock.show · **site** = lock.show.

| Tag | Date | `main` @ | Surface | What shipped | Gate | Verified live |
|---|---|---|---|---|---|---|
| `rel-2026.07.09` | 9 Jul 2026 | b3866e2 | app + site | **Design System v1.2.0 — Step 1 (site-first, owner-chosen).** Site aligned to exact DS: dark panel→forest #18221a, added mist/slate, Georgia display headlines; accent lime→#C8F04D (app+site); DS saved to repo as SSOT; brand assets preserved (already wired). App re-theme = Step 2, pending owner review of the live site. | ✅ verify green | site build ✅ |
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
