# LOCK — INTEGRATION CONTRACT REGISTER
## IMPLEMENTATION CONTRACT / NOT PRODUCT CANON

_Lane M (Wave 2), owner addendum 16 Aug 2026. Enforced by `scripts/test-integration-contract.mjs`
(`npm run test:integration-contract`, in the `verify` chain)._

**Authority.** This file records how the implementation is wired. It is **not** product canon and may
never be cited to justify a product behaviour, a permission or a firewall decision — canon,
permissions and data contracts always override it. It carries no duplicate authority: origin
allowlisting, preflight, rate limiting, JWT denial and error redaction are owned by
`scripts/test-security-denial.mjs`; release-artifact host hygiene by `scripts/test-release-artifacts.mjs`.
This register owns only what previously had no executable owner.

**Honesty rule (binding).** *Repository presence is DECLARED, never proof that a credential or a
provider works.* An entry may read `WITNESSED:<YYYY-MM-DD>` **only** when a real environment witness
observed it functioning. **Every entry below is `DECLARED`** — `.env.local` was lost when the
container recycled, so this session could not exercise a single credential. Independent QA must
reject any claim to the contrary.

**Secret handling.** Names and metadata only. No value is printed, committed, copied into any doc or
exposed. Nothing here was deployed, rotated, or changed in any provider console.

---

## 1 · Interface inventory (machine-enforced)

Class: `PUBLIC` = bundle-visible by design · `SECRET` = server-only credential · `CONFIG` = behaviour
knob, no credential · `AMBIENT` = supplied by the runtime/framework · `TOOLING` = local test harness.

<!-- MACHINE:ENV:START -->
| Name | Class | Surface | Consumer | Activation | Required |
|---|---|---|---|---|---|
| `VITE_SUPABASE_URL` | PUBLIC | client+server+ops | src/lib/supabase.js, server/index.js, scripts/seed.mjs | DECLARED | required |
| `VITE_SUPABASE_ANON_KEY` | PUBLIC | client | src/lib/supabase.js | DECLARED | required |
| `VITE_DEMO` | PUBLIC | client | src/lib/demo.js | DECLARED | optional |
| `VITE_NO_API` | PUBLIC | client | src (test/preview switch) | DECLARED | optional |
| `VITE_OAUTH_ENABLED` | PUBLIC | client | src/lib/constants.js | DECLARED | optional |
| `VITE_OAUTH_FACEBOOK` | PUBLIC | client | src/lib/constants.js | DECLARED | optional |
| `VITE_PAYMENTS_ENABLED` | PUBLIC | client | src/lib/constants.js | DECLARED | optional |
| `VITE_RADAR_AUDIENCE_SPLIT` | PUBLIC | client | src/lib/constants.js | DECLARED | optional |
| `NEXT_PUBLIC_APP_URL` | PUBLIC | website | website-next/lib/app-url.ts | DECLARED | optional |
| `NEXT_PUBLIC_GA_ID` | PUBLIC | website | website-next/app/layout.tsx | DECLARED | optional |
| `SUPABASE_SERVICE_ROLE_KEY` | SECRET | server+ops | server/index.js, scripts/seed.mjs | DECLARED | required |
| `SUPABASE_ACCESS_TOKEN` | SECRET | ops | scripts/setup-remote.mjs | DECLARED | optional |
| `ANTHROPIC_API_KEY` | SECRET | server | server/index.js | DECLARED | optional |
| `RESEND_API_KEY` | SECRET | server | server/index.js | DECLARED | optional |
| `ANTHROPIC_MODEL` | CONFIG | server | server/index.js | DECLARED | optional |
| `ALLOWED_ORIGINS` | CONFIG | server | server/index.js | DECLARED | optional |
| `RATE_LIMIT_PER_MIN` | CONFIG | server | server/index.js | DECLARED | optional |
| `API_PORT` | CONFIG | server | server/index.js | DECLARED | optional |
| `EMAIL_ENABLED` | CONFIG | server | server/index.js | DECLARED | optional |
| `EMAIL_FROM` | CONFIG | server | server/index.js | DECLARED | optional |
| `CONFIRM_TOKEN_TTL_DAYS` | CONFIG | server | server/index.js | DECLARED | optional |
| `SHARE_LINK_SERVICE_ENABLED` | CONFIG | server | server/index.js | DECLARED | optional |
| `MONTHLY_BUDGET_USD` | CONFIG | server | server/index.js | DECLARED | optional |
| `COST_PER_ITEM_USD` | CONFIG | server | server/index.js | DECLARED | optional |
| `MAX_ITEMS_PER_JOB` | CONFIG | server | server/index.js | DECLARED | optional |
| `MAX_ITEMS_PER_USER_DAY` | CONFIG | server | server/index.js | DECLARED | optional |
| `ALERT_AT` | CONFIG | server | server/index.js | DECLARED | optional |
| `VERCEL` | AMBIENT | server | server/index.js (platform detect) | DECLARED | optional |
| `VERCEL_GIT_COMMIT_SHA` | AMBIENT | build | src/components/BuildStamp.jsx | DECLARED | optional |
| `PORT` | AMBIENT | server | server/index.js | DECLARED | optional |
| `BASE_URL` | AMBIENT | client | src/lib/appUrl.js, src/main.jsx | DECLARED | optional |
| `PROD` | AMBIENT | client | src/components/BuildStamp.jsx | DECLARED | optional |
| `DEV` | AMBIENT | client | src (dev-only branches) | DECLARED | optional |
| `PW_CHROME` | TOOLING | test | scripts/verify-w41-payment-gate.mjs | DECLARED | optional |
| `W41_PORT` | TOOLING | test | scripts/verify-w41-payment-gate.mjs | DECLARED | optional |
| `W41_QA_DIR` | TOOLING | test | scripts/verify-w41-payment-gate.mjs | DECLARED | optional |
<!-- MACHINE:ENV:END -->

**Requiredness is a fact recorded here, verified from code — the generated schema only projects it.**
`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`: without both, `realConfig` is false and the client cannot
reach the database (`src/lib/supabase.js`). `SUPABASE_SERVICE_ROLE_KEY`: `admin` is null without it and every
privileged server route refuses (`server/index.js`). Everything else carries a code default or a documented
fallback — `ANTHROPIC_API_KEY` falls back to `src/lib/ai/stub.js`, `NEXT_PUBLIC_APP_URL` to `'/app'`,
`ANTHROPIC_MODEL` and all CONFIG knobs to literals — so marking them required would be false.

## 1a · Generated machine projection

`contracts/env.schema.json` is generated from the table above by `scripts/generate-env-schema.mjs`.
It is a **machine projection, not a second authority**: it carries names, types, class, purpose and
requiredness only — zero values, zero secrets, zero token-bearing URLs. `npm run test:integration-contract`
regenerates it in memory and fails on any drift, so the two cannot diverge.

## 2 · Ownership and lifecycle

Full per-field detail is given for the entries that carry risk — the four `SECRET` credentials and
the ten bundle-visible `PUBLIC` entries. `CONFIG`/`AMBIENT`/`TOOLING` entries carry no credential and
are covered by one grouped block; that is a deliberate proportionality choice, recorded here so the
omission is visible rather than silent.

### 2.1 SECRET credentials

| Field | `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_ACCESS_TOKEN` | `ANTHROPIC_API_KEY` | `RESEND_API_KEY` |
|---|---|---|---|---|
| Business owner | R00 (Maria) | R00 | R00 | R00 |
| Technical owner | build agent | build agent | build agent | build agent |
| Billing owner | R00 — Supabase Pro | R00 — same account | R00 — Anthropic console | R00 — Resend |
| Security owner | R00 | R00 | R00 | R00 |
| Environments | prod (Vercel `lock-app`); dev via local `.env.local` | ops/local only | prod + dev | prod + dev |
| Class | SECRET — highest privilege in the system | SECRET — management-plane | SECRET | SECRET |
| Consumer | `server/index.js` admin client, `scripts/seed.mjs` | `scripts/setup-remote.mjs` | `server/index.js` AI pipeline | `server/index.js` email |
| Privilege | bypasses RLS entirely | creates/alters project resources | model invocation, spend-bearing | send-only (per M-12 procedure) |
| Approved storage | Vercel encrypted vault (write-only) + local `.env.local` (gitignored) | local `.env.local` only | Vercel vault + local | Vercel vault + local |
| Activation evidence | DECLARED | DECLARED | DECLARED | DECLARED |
| Last verified | not verified this session — no `.env.local` | same | same | same |
| Origins/redirects | n/a (server-to-server) | n/a | n/a | sender domain lock.show verified at provider (owner action 17 Jul, not re-checked) |
| Health check | `GET /api/health` reports presence via `realValue()`, not validity | none | `/api/health` presence flag | `EMAIL_ENABLED=1` **and** a real key |
| Failure / fallback | admin client absent → server refuses privileged routes | script fails loudly | falls back to `src/lib/ai/stub.js` | email silently disabled by `EMAIL_ENABLED` gate |
| Spend driver | none directly | none | **yes** — capped by `MONTHLY_BUDGET_USD`, `COST_PER_ITEM_USD`, `MAX_ITEMS_*`, `ALERT_AT` | per-email |
| Rotation / revocation | Supabase dashboard → regenerate → update vault → redeploy | revoke in dashboard | Anthropic console → new key → vault → redeploy | M-12 procedure (create → swap → verify → revoke old) |
| Recovery / exit | regenerate; no data loss | regenerate | regenerate | regenerate; provider swappable (SMTP contract is thin) |

### 2.2 PUBLIC (bundle-visible by design)

| Field | Detail |
|---|---|
| Owner (all) | business R00 · technical build agent · billing n/a · security R00 |
| Environments | prod (Vercel) + dev |
| Privilege | `VITE_SUPABASE_ANON_KEY` is anon-role only — **RLS is the boundary, not the key**. Flags carry no privilege. |
| Approved storage | Vercel project env vars; values are public once built — never treat as secret |
| Activation evidence | DECLARED (no runtime witness this session) |
| Origins/redirects | Supabase auth redirect + OAuth callback handled in `src/features/auth/AuthProvider.jsx`; browser origins allowlisted server-side by `ALLOWED_ORIGINS` |
| Health check | app boot; `VITE_SUPABASE_URL`/`ANON_KEY` absent → client cannot reach the database |
| Failure / fallback | flags default safe: payments OFF, radar-split OFF, Facebook OAuth OFF, Google OAuth ON |
| Spend driver | none |
| Rotation | anon key rotates with the Supabase project; flags are redeploy-only |
| Recovery / exit | re-read from the Supabase dashboard |

### 2.3 CONFIG / AMBIENT / TOOLING (grouped — no credential)

Owner R00 / build agent throughout. All are behaviour knobs, runtime-supplied values, or local test
harness inputs. None is spend-bearing except the four AI budget knobs (`MONTHLY_BUDGET_USD`,
`COST_PER_ITEM_USD`, `MAX_ITEMS_PER_JOB`, `MAX_ITEMS_PER_USER_DAY`) and the `ALERT_AT` threshold,
which bound `ANTHROPIC_API_KEY` spend. All defaults are defined in `server/index.js`; absence is a
supported state for every one of them. Rotation is not applicable; recovery is a redeploy.

## 3 · API route guards (machine-enforced)

Declared guard must equal the guard `server/index.js` actually enforces. A new route added without a
register row fails the gate — that is the point.

<!-- MACHINE:ROUTES:START -->
| Method | Path | Guard |
|---|---|---|
| GET | /api/health | OPEN |
| POST | /api/process-evidence | AUTH |
| POST | /api/publish/:artistId | AUTH |
| GET | /api/passport/:artistId | OPEN |
| POST | /api/share-link | AUTH |
| GET | /api/share-link/:token | OPEN |
| POST | /api/share-link/:id/revoke | AUTH |
| POST | /api/passport-signal | OPEN |
| POST | /api/notify | AUTH |
| POST | /api/availability-request | OPEN |
| POST | /api/request-confirmation | AUTH |
| GET | /api/confirm/:token | OPEN |
| POST | /api/confirm/:token | OPEN |
<!-- MACHINE:ROUTES:END -->

The six `OPEN` routes are intentionally public — published-passport read, token-bound share-link
resolve, buyer signal, availability request and the two confirmation-token endpoints all serve
parties who by definition have no account. Each carries its own token or published-state check inside
the handler, and all are rate-limited. This is recorded as a **declared** design position, not as a
verified authorization proof.

## 4 · Observed items — verified, not accepted on report

| # | Reported | Verdict | Evidence |
|---|---|---|---|
| M-a | App GA ID hardcoded while website permits env override | **CONFIRMED** | `src/components/ConsentBanner.jsx:5` `const GA_ID = 'G-ZX907M2NY8'` (literal) vs `website-next/app/layout.tsx:26` `process.env.NEXT_PUBLIC_GA_ID ?? 'G-ZX907M2NY8'`. Same ID, two mechanisms. Not a leak — a GA measurement ID is public — but the app cannot be repointed without a code change. |
| M-b | OAuth defaults on but example/config flags may drift | **CONFIRMED** | `VITE_OAUTH_ENABLED` defaults ON (`!== '0'`, `src/lib/constants.js`). `.env.local.example` lists **only** `VITE_OAUTH_ENABLED`; four flags read by code are absent from it: `VITE_OAUTH_FACEBOOK`, `VITE_PAYMENTS_ENABLED`, `VITE_RADAR_AUDIENCE_SPLIT`, `VITE_NO_API`. |
| M-c | Facebook flag referenced but not documented in the example | **CONFIRMED** | `OAUTH_FACEBOOK_ENABLED` at `src/lib/constants.js`; default OFF; absent from `.env.local.example`. Default-off is correct — the provider is not enabled at Supabase. |
| M-d | CORS allowlist, auth and rate limits added, managed-runtime behaviour unproven | **CONFIRMED AS UNPROVEN** | Code present: `ALLOWED_ORIGINS` allowlist (`server/index.js:71-80`), per-IP sliding-window limiter (`:84-100`), `requireAuth` on 7 of 13 routes. `scripts/test-security-denial.mjs` exercises them against a **local** server only. Behaviour behind Vercel's managed runtime — proxy `x-forwarded-for` handling and per-instance limiter memory — has **no witness**. A per-instance in-memory limiter does not bound a multi-instance deployment. |
| M-e | Legacy artistId-only service paths remain a multi-Act risk | **CONFIRMED** | `server/index.js` references `artistId` 55 times vs `actId`/`act_id` 10. `/api/publish/:artistId`, `/api/passport/:artistId` and `buildSafePayload(artistId)` key on the Person-level artist row, not the Act. Consistent with Lane D's finding that `act_id` appears in **zero** of 126 RLS policies. Publishing is therefore an artist-level act, contradicting the canon rule that evidence is per-Act and non-transferable. |

M-e is the material one: it is a product-correctness defect, not a hardening item, and it is **not**
fixed here — it belongs to the pending multi-Act boundary migration (D-5/D-6/D-7) and needs the
owner's ruling before code moves.

## 5 · Not proven (no environment witness)

Recorded so no reader mistakes silence for health:

- **No credential was exercised.** `.env.local` is absent; not one key was proven usable.
- **No provider console was inspected or mutated** — Supabase, Vercel, Anthropic, Resend, Google
  (GA4/GTM/GSC), Shopify. Console state is owner-only and untouched.
- **Managed-runtime behaviour is unproven** (M-d): CORS, rate limiting and auth are witnessed only
  against a local server.
- **Bundle-leak check did not run against a production build in this pass** unless `dist/` or
  `website-next/out` was present; the gate prints `SKIPPED, not passed` and never scores an absent
  target as a pass.
- **GA4/GTM/GSC linkage identifiers** are owner-console facts and remain in `docs/OWNER-PENDING.md`;
  this register does not restate them as verified.

## 6 · Definition of done / KPI

**DoD** — (1) every env name read by code has a register row and a class; (2) no `SECRET` name is
reachable from client code or present in a shipped bundle; (3) no credential-shaped literal is
committed; (4) scanner patterns are proven against synthetic samples each run; (5) every API route's
declared guard equals its enforced guard; (6) no entry claims a working provider without
`WITNESSED:<date>`.

**KPI** — `npm run test:integration-contract` exits 0 in the `verify` chain; register drift fails the
build within one commit of the drift being introduced; count of entries carrying a real witness rises
from **0/36** as the owner restores `.env.local` and exercises each provider.

## 7 · Rollback

Additive and self-contained. To revert: delete `scripts/test-integration-contract.mjs`, delete this
file, and remove the `test:integration-contract` entries from `package.json` (`scripts` block and the
`verify` chain). No runtime code, no migration, no provider state is touched by this lane, so rollback
carries no data or availability risk.

## 8 · Drive owner handoff

Per the placement rule: implementation assets stay in the repository — this register and its gate live
here, not in Drive. What goes to Drive is the **decision layer** only: (a) M-e, the multi-Act
authorization boundary, as an owner decision item; (b) the 0/36 witness state, as the standing
integration-readiness fact; (c) M-d, managed-runtime limiter behaviour, as a pre-launch verification
owed. `docs/OWNER-PENDING.md` remains the single owner-facing surface; no duplicate authority is
created here.
