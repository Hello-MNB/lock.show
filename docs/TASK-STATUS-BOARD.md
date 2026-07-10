# LOCK — MASTER TASK STATUS BOARD (PRIORITY-SORTED)
**Version:** 2.4 · **Date:** 10 July 2026 · **Legend:** ✅ working · 🟡 partial · 🔴 not built · ⬜ n/a

> **10 Jul ship (branch `claude/b4-gigproof-discovery-e7749o`) — rel-2026.07.10 PREPARED:**
> (1) **🔒 P0 FIREWALL BREACH CLOSED** — unreviewed AI claims could reach the public Passport
> (`artist_approved` gate never enforced on any read path); fixed on all 4 surfaces —
> **migration 031** + `db.js` + `server/index.js`. (2) **Booker nav gap FIXED** (Passports tab;
> nav 34/34). (3) **Public Passport split into TWO buyer personas** (Booking + Representation,
> separate files, shared firewall-safe derivation; `?view=rep` deep link). (4) **Full entity
> flow-gap AUDIT** — `docs/FLOW-GAP-AUDIT-2026-07-10.md` (24 gaps: 2 P0 [1 fixed], 10 P1, 12 P2).
> (5) **Release package** — `docs/releases/rel-2026.07.10.md` (changelog + migration + deploy +
> QA checklists). **OWNER: run migrations 030 + 031 in Supabase.** Docs: `PASSPORT-ARCHITECTURE.md`.
**Sort:** by launch priority. **P0** = blocks real launch · **P1** = needed for a strong launch · **P2** = growth/polish after launch · **DONE** = live and verified.
**"Migration needed?"** = does going real require a live-DB schema change? Demo data never migrates; migrations are one-time schema upgrades.

## NOW — the sequence I am executing (OPERATING-MODEL.md)
1. **Stabilize auth** — code shipped LIVE (PKCE + explicit code-exchange + PWA cache fix). Awaits Maria's ONE clean Google test after clearing cache → should land on /select ("Who are you?"). *Only step needing her.*
2. **Verify every flow end-to-end myself** (in a browser against the real build) — turn Maria from tester into approver. ← I am here.
3. **Revenue signals** (M1 event writers + willingness-to-pay) — 028 live, unblocked.
4. **Depth** (production/representation workspaces, 2-proof gate, per-Act).
5. **Hebrew launch** (localization pass + review).

## P0 — LAUNCH BLOCKERS

| Pri | # | Task | Real launch | Notes |
|---|---|---|---|---|
| P0-1 | 23 | Legal gate (counsel sign-off) | 🟡 drafts exist, unreviewed | No migration. HE drafts in docs/legal/ ✅. **YOU:** send counsel email + fill placeholders (entity/ח.פ., city, refund, accessibility coordinator). |
| P0-2 | 3 | Pasted link → evidence → real AI labeling | 🟡 key in Vercel ✅ | No migration. Remaining: live test labeling is real, not stub. |
| P0-3 | 5 | Consent handshake (invite → approve w/ scopes → revoke) | 🟡 UI live; **027 APPLIED ✅** | Migration DONE 9 Jul. Unblocks #16 + #17. |
| P0-4 | 8 | Manual payment (Bit + reference + activation) | ✅ LIVE mechanics | No migration. **YOU:** fixed price (rec ₪179). Green Invoice DEFERRED to S3 signal. |
| P0-5 | 22 | Domain | ✅ **lock.show LIVE + LOCK rebrand + deploy-hook fix** | Site static-export live; app.lock.show live. Supabase URL config DONE. |
| P0-6 | 7 | Producer confirmation ceremony (magic link) | 🟡 works on app URL | No migration. Canonical app = app.lock.show. |
| P0-7 | 11 | Analytics events (funnel + Gate measurement) | 🔴 **028 APPLIED ✅** | Migration DONE 9 Jul (14 M1 events). GA4 wired ✅. **ME:** M1 event writers (Batch 1, unblocked). |
| P0-9 | — | **Auth stabilization** (signup + Google login end-to-end) | 🟡 code LIVE, awaits Maria's clean test | No migration. **Signup dead-end FIXED (a1ae464)**: PKCE made signUp return null session even with auto-confirm → bounced to /login; now falls back to immediate password sign-in. Also: exchangeCodeForSession (Google), PWA skipWaiting/clientsClaim, ErrorBoundary, producer black-screen. Shipped both surfaces. |

## P1 — STRONG-LAUNCH BUILDS

| Pri | # | Task | Real launch | Notes |
|---|---|---|---|---|
| P1-1 | 10 | Notifications (confirmation / payment / request) | 🔴 | No migration (table since 002). Highest-value P1 build. |
| P1-2 | 4 | Deep discovery scan (web search by name HE/EN) | 🔴 **028 APPLIED ✅** | Tavily verified ✅. **ME:** Phase-A build — unblocked. Counsel sign-off gates go-live. |
| P1-3 | 12 | Google/Facebook login | 🟡 Google client live; FB hidden by flag | No migration. Google end-to-end = P0-9. Facebook off (OAUTH_FACEBOOK_ENABLED) until enabled in Supabase. |
| P1-4 | 16 | Representation workspace (roster as consented grants) | 🔴 in app | 027 done → UI build from prototype. |
| P1-5 | 17 | Production-company workspace (team, events, lineup) | 🟡 ProductionDashboard.jsx scaffolded | 027 done → finish UI + wire requests (needs 029). |
| P1-6 | 6 | Workspace switcher swaps the screen-set | 🟡 switch UI live (mobile trap fixed) | No migration. Routing refactor; pairs with #16/#17. |
| P1-7 | 9 | Plan enforcement (Passport/Momentum/Roster) | 🔴 display-only; **plan_flags live (028) ✅** | Build after price decision (P0-4). |
| P1-8 | 14b | 2-proof publish gate on public passport | 🔴 | No migration. Small build; passport is live. |
| P1-9 | 21b | Hebrew localization pass (app + site) | 🔴 | No migration. Final pass before Hebrew launch. docs/LOCALIZATION-MATRIX.md live. |
| P1-10 | 25 | Legal pages on site (/terms /privacy /accessibility) | ✅ live, draft-labeled | No migration. Privacy v0.2 corrected + live. |
| P1-11 | 26 | Resend — transactional auth emails from own domain | 🔴 | No migration. **YOU:** Resend signup (free ≤3,000/mo). **ME:** wire Supabase SMTP. |
| P1-12 | 27 | Accessibility pass (ת"י 5568 / WCAG AA) | 🔴 | No migration. Keyboard/contrast/SR audit → fill ACCESSIBILITY-HE limitations. |

## P2 — GROWTH & POLISH

| Pri | # | Task | Real launch | Notes |
|---|---|---|---|---|
| P2-1 | 15 | Multi-Act switching in app (center-star) | 🔴 in app | No migration (Act tables since 020). |
| P2-2 | 19 | Attributed share loop | 🔴 in app | No migration (share_link since 024). |
| P2-3 | 20 | Spotify catalog integration | 🔴 key verified ✅ | No migration. Wire into discovery/evidence. |
| P2-4 | 18 | Value-vs-genre view for managers | 🔴 in app | Needs genre taxonomy filled (Registry B) + UI. |

## DONE — LIVE & VERIFIED

| # | Task | Notes |
|---|---|---|
| 1 | 2-screen onboarding (name+link → radar) | LIVE. |
| 2 | Radar universe + deferred fill-in-place nodes | LIVE. |
| 13 | Platform logos (branded universe) | LIVE. |
| 14 | Public passport (proof units, method labels, 30-sec scan) | LIVE (2-proof gate = P1-8). |
| 21 | Marketing website (design, pricing, funnel) | LIVE (EN). Hebrew = P1-9. |
| 22 | Domain lock.show + LOCK rebrand + static-export site + deploy hook | LIVE 9 Jul. |
| 24 | Cookie-consent banner (GA4 Consent Mode v2) | LIVE, bilingual. |
| 027 / 028 | Migrations applied to live DB | 9 Jul ('Success. No rows returned'). |

## MIGRATION SUMMARY
- **027 APPLIED ✅** (9 Jul): workspace types + access scopes + consent handshake. Unlocked #5/#16/#17.
- **028 APPLIED ✅** (9 Jul): 'discovered' source, HE/EN names, 14 M1 funnel events, plan_flags. Unlocked #4/#9/#11.
- **029 (next, when depth work starts):** production-workspace requests. Not yet written.
- Everything else: NO migration.

## DECISIONS LOG (9 Jul)
- 027 + 028 APPLIED to live DB (Cowork-run, verified screenshots).
- lock.show FULLY LIVE via static export (Framework=Other/out/) + Vercel Deploy Hook workaround for stuck production auto-deploy.
- Auth stabilized in code: PKCE flow, explicit exchangeCodeForSession on boot, PWA skipWaiting/clientsClaim (root cause of "Google login returns to /login" was a STALE service-worker cache serving old code).
- Facebook OAuth hidden behind OAUTH_FACEBOOK_ENABLED (only Google configured in Supabase).
- ErrorBoundary added app-wide; producer /received black-screen (`Link is not defined`) fixed.
- OPERATING-MODEL.md created: Claude = Process Architect (not a separate manager agent); Maria = approver, not tester; the verify-loop.

## CHANGELOG
- v2.3 (9 Jul afternoon): title→LOCK; 027+028 marked APPLIED; auth-stabilization row (P0-9); domain/site/deploy-hook → DONE; OPERATING-MODEL sequence pinned at top; ProductionDashboard scaffolded; plan_flags live.
- v2.2 (8 Jul evening): deploy recorded; privacy v0.2 cycle; glossary governance; site design round.
- v2.1 (8 Jul): +P0-8 consent banner · #23 drafts · +P1-10/11/12 · GA4 + Tavily closed.
- v2.0 (8 Jul): Re-sorted by launch priority.
- v1.0 (8 Jul): Initial board.
