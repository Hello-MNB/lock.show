# §14 — Measurement, Payments & Notifications

_Master-spec section 14. Grounded in the live repo (migrations 001–035, `src/lib/*`, `server/index.js`) as of 2026-07-15. Where the spec describes a target that is not yet built, it is marked **OWED** (must be built) or **OPEN** (a decision not yet locked). Everything not so marked is verified in code._

## 14.0 Scope and firewall posture

This section covers three tightly-coupled systems:

1. **Measurement** — the first-party product-analytics canon (`analytics_event`), its GA4 counterpart, and the read models the owner/advisor use to read the pilot.
2. **Payments** — the dormant, free-pilot payment model (Bit + manual reconciliation) and what turns on after the Gate.
3. **Notifications** — the in-app bell (built) and the transactional-email catalog (mostly OWED).

**Firewall (absolute, applies to every subsystem here).** No score, percentile, rank, "bookability %", prediction, or gauge is ever computed, stored, or emitted — not to the artist, not to the buyer, and **not to GA4**. Analytics may count **product events** (how many passports were published, how many reactions arrived); it may never store or transmit a **number _about a person_** (draw, followers, fee, a derived quality score). This is enforced in code: `src/lib/analytics.js` header — _"`properties` carries ids/roles/context only — NEVER a score, percentage, rank, or count-about-an-artist."_ Reaction-insight that returns to the artist is method-safe bounded text only (see §14.6), never a count/%/score. No third-party pixel sits on or near any evidence surface.

---

## 14.1 Analytics event canon

The canon is a **single source of truth expressed three times**, kept byte-identical by hand (drift was found twice, hence the discipline):

| Layer | Location | Role |
|---|---|---|
| App CANON | `src/lib/analytics.js` → `const CANON` | The generator. Only names in this Set persist to the DB. |
| DB CHECK | `analytics_event.event_name` CHECK | The gate. A name absent from the CHECK fails the insert (harmlessly → localStorage only). |
| Migration of record | `034_event_canon_unpublish.sql` | The applied CHECK; header: _"the analytics event CHECK now equals the app CANON exactly (29 events)."_ |

### 14.1.1 The CHECK reconciliation — 28 vs 29 (current true count = **29**)

There are two constraint generations in the migration history, and they differ by exactly one event:

| Migration | Events in CHECK | Note |
|---|---|---|
| `024_measurement_and_share.sql` | 14 | Original taxonomy. `analytics_event` table created here. |
| `028_discovery_analytics_plans.sql` | **28** | Adds the 14 M1-funnel events. **Omits `passport_unpublished`.** |
| `034_event_canon_unpublish.sql` | **29** | Widens the CHECK to add `passport_unpublished`, reconciling DB = app CANON. **This is the applied, current constraint.** |

**The "28 vs 29" is a real, resolved drift, not an ambiguity.** Before 034, the app CANON already contained `passport_unpublished` (making 29 in code) while the DB CHECK allowed only 28 — so `passport_unpublished` inserts failed the CHECK and fell back to localStorage-only (documented inline at `analytics.js:29` and in `ADMIN-PANEL-SPEC.md §E.3`). Migration 034 closed the gap. **Current true count = 29** in all three layers.

> **Verify-on-apply (OWED check):** 034 is written "AS APPLIED, reconciled by Cowork+owner 13 Jul." Confirm against the live DB that 034 is actually applied before relying on `passport_unpublished` persisting; until confirmed, current-unpublished state is read from `artists.published = false` and republish cadence from repeated `passport_published` (per `ADMIN-PANEL-SPEC.md §E.3`).

### 14.1.2 The full event canon (29 persisted events)

Legend — **Sink**: `DB` = in CANON, persists to `analytics_event`; **Key?**: ✅ = a milestone that is also a GA4 key event / Gate proof (see §14.2, §14.4). Trigger boundary = the exact moment `logEvent()` fires.

| # | Event name | Fires when (trigger boundary) | Subject / entity | Key? |
|---|---|---|---|---|
| 1 | `signup_started` | Signup form begins (OWED — see wiring note) | Person (anon) | |
| 2 | `signup_completed` | Supabase `signUp()` returns success | Person | ✅ |
| 3 | `login` | `signInWithPassword()` success | Person | ✅ |
| 4 | `oauth_login` | OAuth (Google) callback resolves a session | Person | |
| 5 | `consent_granted` | Consent banner "accept" | Person | |
| 6 | `consent_withdrawn` | Consent withdrawn (settings) | Person | |
| 7 | `onboarding_started` | Onboarding step 1 opens (OWED) | Artist | |
| 8 | `onboarding_completed` | 2-screen onboarding finished | Artist | ✅ |
| 9 | `radar_opened` | Artist opens the Radar | Artist | |
| 10 | `evidence_added` | An evidence artifact is submitted | Artist evidence | |
| 11 | `gig_evidence_refresh_completed` | AI claim pipeline finishes a run | Artist evidence | |
| 12 | `claim_confirmed` | Artist approves an extracted claim | Claim | |
| 13 | `claim_published` | A claim reaches `passport-ok` on a public Passport | Claim | |
| 14 | `passport_published` | Artist publishes the Passport (`artists.published=true`) | Passport version | ✅ |
| 15 | `passport_unpublished` | Artist unpublishes (staleness/republish cadence signal) | Passport version | |
| 16 | `act_created` | A second/subsequent Act is created | Act | |
| 17 | `act_switched` | Active Act is switched | Act | |
| 18 | `workspace_switched` | Active workspace (org) is switched | Membership | |
| 19 | `share_link_created` | Artist copies/creates a tagged share link | Share link | |
| 20 | `share_link_opened` | A public Passport is reached via a `?s=1` link (once per visit) | Share link | |
| 21 | `passport_view` | A published Passport is **opened** (NOT a reaction — P0-5) | Passport version | |
| 22 | `availability_request_created` | Booking manager submits the availability-request form | Availability request | ✅ **Gate ½** |
| 23 | `availability_request_responded` | Artist replies to a request | Availability request | |
| 24 | `professional_reaction_submitted` | A qualified buyer submits a professional reaction | Professional reaction | ✅ **Gate signal** |
| 25 | `producer_confirmation_sent` | Artist mints a producer-confirm magic link | Producer confirmation | |
| 26 | `producer_confirmation_received` | Producer answers the confirm link | Producer confirmation | |
| 27 | `payment_reference_created` | Artist marks "I've paid" → creates a Bit reference | Entitlement (intent) | ✅ **pay-intent** |
| 28 | `entitlement_activated` | Operator activates a paid entitlement | Entitlement (verified) | ✅ **Gate ½ (pay)** |
| 29 | `account_deleted` | Account deletion completes | Person | |

**Dev-only events (NOT persisted — absent from CANON, localStorage-ring only):** `onboarding_step`, `claim_visibility_changed`, `request_whatsapp_click`, `settings_opened`, `delete_account_requested`, `language_changed` (`analytics.js:104–109`). These are dev-inspection breadcrumbs; adding any to the DB requires widening the CHECK (a new migration) **and** the CANON Set, in lockstep.

**Wiring status (from `PILOT-MEASUREMENT-MAP.md`, 12 Jul).** Most events are live. **Known-unwired at pilot start:** `signup_started`, `onboarding_started`, `oauth_login`, `claim_published`, `share_link_created`, `share_link_opened` — none blocks the pilot; each is **OWED** in the next build push. Treat these as "instrumented-not-firing": a zero count means "not yet wired," not "did not happen" (see §14.2 declared≠measured).

### 14.1.3 Two sinks (both best-effort — analytics must NEVER break a user action)

`logEvent(name, props)` writes to two sinks, each wrapped so a failure is swallowed:

1. **localStorage ring buffer** (`gigproof_events`, max 100) — dev/offline inspection, always on.
2. **`public.analytics_event`** — only if `!DEMO && supabase && CANON.has(name)`. Direct client insert (RLS `ae_any_insert` allows anon + authenticated INSERT) so it works on `app.lock.show` **and** the static `lock.show/app` embed with no server dependency. Operator-only SELECT (`ae_operator_read`); no UPDATE/DELETE path (append-only).

`analytics_event` columns (024): `id, event_name, session_id, actor_user_id, actor_role, passport_version_id, act_id, properties (jsonb), created_at`. The client currently writes `event_name, actor_user_id, actor_role (props.role), properties`. **`session_id`, `passport_version_id`, `act_id` are schema-present but not populated by the current client writer** (`analytics.js:58–63`) — **OWED** if per-Passport / per-Act / anonymous-session funnels are needed.

### 14.1.4 GA4-vs-Supabase split (the governing rule)

| | **Supabase `analytics_event`** | **GA4 (property 544738110 / `G-ZX907M2NY8`)** |
|---|---|---|
| Role | **Product truth** — the full 29-event funnel, the Gate, all owner/CFRO reads | **Bounded acquisition milestones only** (~5–6, see §14.2) |
| Firewall scope | Internal counts allowed (operator surface); never a per-person score | Even stricter: only coarse milestone counts, **no PII, no per-person number, no score** |
| Consent | First-party, append-only, RLS-gated | Consent Mode v2, gtag injected **only on grant** (`ConsentBanner.jsx`) |
| Retention | Owned, indefinite (product record) | Google's default GA4 windows |
| Read path | Bounded read models (`admin_business_overview` RPC, SECURITY DEFINER + operator check) — client never free-queries raw analytics | Google Analytics UI / GSC |

**Rule:** the business is measured from Supabase; GA4 exists to attribute _acquisition_ (which channel produced signups) and nothing more. The two are never reconciled row-for-row — they answer different questions.

---

## 14.2 Measurement architecture

### 14.2.1 One GA4 property, segmented by `surface`

There is **one** GA4 property (544738110), one measurement ID **`G-ZX907M2NY8`**, wired at page level on **both** surfaces — the marketing site (`website-next` `layout.tsx` default) and the app (`index.html`) — with Consent Mode v2 defaults-denied, gtag injected only after consent grant, `localStorage gigproof_consent`, 12-month re-ask (`CONSENT-BANNER-SPEC`, `SESSION-MEMORY`).

Because it is **one stream for two surfaces**, every hit must be segmentable by a **`surface`** dimension so `lock.show` (marketing) and `app.lock.show` (product) never blur. The dimension set:

| Custom dimension | Values | Purpose |
|---|---|---|
| `surface` | `site` \| `app` | Separate marketing from product (mandatory — one property, two surfaces) |
| `route_name` | route path/name | Which screen (not a raw URL with ids) |
| `actor_role` | `artist` \| `booker` \| `agency` \| `producer` \| `operator` \| `anon` | Funnel-by-role (never pooled into a person score) |
| `auth_state` | `anon` \| `authed` | Pre- vs post-login |
| `environment` | `production` \| `preview` | Exclude preview/QA traffic |

> **Status: these five GA4 custom dimensions are OWED.** The current wiring is page-level GA4 with Consent Mode; there is **no event-level `gtag()` dual-emit in `src/`** (grep confirms none). Registering the custom dimensions in GA4 admin and emitting them is a build task.

### 14.2.2 Dual-emit of the bounded milestones

A small, fixed set of milestones is emitted to **both** sinks — to Supabase (full fidelity) and, in coarse form, to GA4 (acquisition attribution). GA4 receives **only** these:

| Milestone (GA4 key event) | Supabase canon event | Emit to GA4? |
|---|---|---|
| `sign_up` | `signup_completed` | ✅ |
| `login` | `login` | ✅ |
| `onboarding_complete` | `onboarding_completed` | ✅ |
| `passport_publish` | `passport_published` | ✅ |
| `availability_request` | `availability_request_created` | ✅ |
| `purchase` | `entitlement_activated` | **Only when payments are live** (§14.5) — omitted during the free pilot |

That is 5 during the pilot, 6 post-Gate. Each GA4 payload carries **only** `surface/route_name/actor_role/auth_state/environment` — never an id, name, email, or any per-person number. **Status: the dual-emit layer is OWED** (Supabase side of these events is largely live per §14.1.2; the GA4 mirror is not yet wired).

### 14.2.3 Search Console (GSC)

Google Search Console is linked as a **domain property** with a submitted sitemap (14 URLs) — `CONNECTIONS-REGISTRY`. GSC covers organic acquisition on the marketing surface; it is not a product-analytics source and never touches evidence surfaces. Link GSC ↔ GA4 so query/landing-page data joins acquisition milestones.

### 14.2.4 "Declared ≠ measured" honesty

Every metric surface must distinguish three states and never collapse them:

- **Measured** — the event is wired and firing; the count is real.
- **Declared-not-instrumented** — the event exists in canon but its writer is not yet wired (§14.1.2 unwired list, or P1 metrics like improvement-cycles/gig-debriefs). Render as **"not instrumented yet," never as `0`** (`ADMIN-PANEL-SPEC §E.6`).
- **Excluded** — demo/seed data filtered out (§14.3).

The read-model contract (`admin_business_overview(window_key, entity_filter)`, `ADMIN-PANEL-SPEC §E.7`) discloses on every response: generated-at / data-through timestamps, vocabulary version, the missing-instrumentation list, demo-exclusion status, and per-metric unit/denominator/source/limitation. Funnels are split **per entity** (artist / manager / buyer / production / confirmer / site) — no single mixed funnel, no cross-unit conversion rates (`§E.4`).

---

## 14.3 Demo / test-data exclusion

Two distinct populations must be kept out of business metrics; they are excluded by **two different mechanisms**, and only the first is fully solved today.

### 14.3.1 DEMO-mode builds — fully excluded (verified)

`export const DEMO = import.meta.env.VITE_DEMO === '1'` (`src/lib/demo.js`). The analytics writer short-circuits before any DB insert: `persist()` returns immediately if `DEMO` is true (`analytics.js:55`). **A demo build (`vite build --mode demo`) never writes a single `analytics_event` row.** Demo fixtures (PERLMAN et al., `demo@lock.test`) therefore cannot pollute metrics — they exist only in-memory. This is airtight.

### 14.3.2 Seed / `@gigproof.test` accounts — **NOT yet excluded (OWED)**

The 5 seed personas (`artist@`, `booker@`, `producer@`, `agency@`, `operator@gigproof.test`, password `Gigproof!2026`, `scripts/seed.mjs`) are **real Supabase auth users on the live DB**. When they act, `DEMO` is false, so their events **do persist** to `analytics_event`. There is currently **no `is_demo` / `environment` column on `analytics_event`** (024/028/034 schema has none). Consequences:

- The friends-cohort pilot (`PILOT-MEASUREMENT-MAP`) can rely on demo exclusion _only_ because the cohort uses real accounts, not the demo build — but seed-account noise is not filtered.
- `ADMIN-PANEL-SPEC §E.8` explicitly flags this: _"verify which events actually carry … `is_demo`; absent key → metric marked **unavailable**, never silently estimated."_

**OWED design (the admin "demo-excluded" badge).** To make the exclusion real and honest:

1. Add an `is_demo boolean` (or `environment text`) to `analytics_event` (additive migration ≥ 036) — set true when the actor is a seed/`@gigproof.test`/operator-seed account, or derive it in the read model from `profiles`/email domain.
2. The read model filters `is_demo = false` for business counts and **discloses the exclusion status** in its response envelope (`§E.7`).
3. Every admin metric tile renders a consistent **"demo-excluded" badge** (`ENTITY-STRUCTURE-AND-SMART-SCREENS-AUDIT §Admin`, `ADMIN-PANEL-SPEC`). If the flag is absent for an event, that metric shows **"unavailable,"** not a possibly-contaminated number.

Until (1) ships, "demo-excluded" can only be asserted for demo-build data, not for seed accounts — state this limitation on any tile that claims exclusion.

---

## 14.4 The Gate measurement

**The Gate (canon):** _1 booking manager reacts to a real Passport **AND** 1 pays._ Monetisation is **measured, not required**; no price/ICP is locked until the Gate is met (CLAUDE.md, `PILOT-MEASUREMENT-MAP`).

### 14.4.1 The exact events that prove each half

The admin Gate tile renders **three columns** — reaction, pay-intent, verified-pay — and must never present intent as payment (`ADMIN-PANEL-SPEC §E.5`):

| Gate half | Proving event(s) | Source of truth | What it means |
|---|---|---|---|
| **A booking manager reacts to a real Passport** | `professional_reaction_submitted` (the Gate signal) — with `availability_request_created` as the concrete buyer action | `analytics_event` + `professional_reaction` table (018) + `availability_requests` | A qualified buyer took a professional action on a **published, real** Passport. `passport_view` alone is explicitly **NOT** a reaction (P0-5, 024 header). |
| **One pays** | **Intent:** `payment_reference_created` → **Verified:** `entitlement_activated` | `analytics_event` + `entitlements` table (007) | Only `entitlement_activated` (operator-verified) counts as **paid**. `payment_reference_created` is willingness-to-pay **intent**, shown in its own column, never merged into the paid count. |

`availability_request_created` fires from `AvailabilityRequest.jsx:81` after a successful submit; `payment_reference_created` from `OfferPayment.jsx:52` after `createEntitlement`; `entitlement_activated` when the operator flips an entitlement to `active` (007 RLS: only `is_operator()` may UPDATE).

### 14.4.2 How a REAL reaction is distinguished from a demo/seed one

Layered defenses, strongest first:

1. **Published-artist gate (server + RLS).** `POST /api/availability-request` rejects any request unless `artists.published = true` (`server/index.js:609–613`); `passport_view_event` anon-insert RLS also requires a published artist (024). A reaction can only attach to a real, published Passport.
2. **View ≠ reaction (P0-5).** The two are separate tables/events and must never be merged; a Gate half requires the reaction event, not a view.
3. **Demo build emits nothing** (§14.3.1) — a demo reaction never reaches the DB.
4. **Seed exclusion (OWED, §14.3.2).** A reaction originating from a seed/`@gigproof.test` actor is still real in the DB today; the `is_demo` flag + read-model filter is required before the Gate tile can claim "**this was a genuine outside buyer.**" Until then, the operator must manually confirm the reacting party is not a seed/team account.

> **Gate honesty rule:** the Gate is declared met **only** when a `professional_reaction_submitted` / `availability_request_created` from a non-demo, non-seed buyer coincides with an `entitlement_activated` — both surviving §14.3 exclusion. Intent (`payment_reference_created`) never satisfies the pay half.

---

## 14.5 Payments

### 14.5.1 Free pilot — payments DORMANT (verified)

Canon G17: **no payment CTA or screen at launch.** The flag:

```
export const PAYMENTS_ENABLED = import.meta.env?.VITE_PAYMENTS_ENABLED === '1'   // constants.js:30
```

`PAYMENTS_ENABLED` gates **both** the route and the CTAs — "not linked from nav" was explicitly rejected as an unsafe boundary (GPT A5 / Codex P0). In `App.jsx:175` the `/artist/offer` route renders `OfferPayment` **only** when the flag is on, otherwise `<Navigate to="/artist/home" replace />`. With the flag off (pilot default), the payment surface is unreachable, not merely unlinked.

### 14.5.2 The dormant model — Bit + manual reconciliation (built, gated off)

When the flag is on, `OfferPayment.jsx` implements a fully manual, no-Stripe flow (migration 007 `entitlements`):

| Step | Actor | Mechanism | Event / state |
|---|---|---|---|
| 1. See offer | Artist | `/artist/offer` (Founding Passport). Price = existing range copy, **not locked** | — |
| 2. Pay | Artist | **Bit** to operator number `054-4555060` (shown in-app, not a secret), with a deterministic reference `GP-<first4 of artist id, uppercased>` added to the transfer note | — |
| 3. "I've paid" | Artist | `markPaid()` → `createEntitlement(artistId, userId, "GP-XXXX · ₪<amt> · Bit")` | `entitlement.status = 'pending'` · **`payment_reference_created`** (pay-intent) |
| 4. Reconcile | Operator | Matches the `GP-XXXX` reference in the Bit app; activates in `/admin` (007 RLS: operator-only UPDATE) | `entitlement.status = 'active'` · **`entitlement_activated`** (+ actor) |
| 5. Confirmation | Artist | Screen reflects `pending` → `active`, shows the date the confirmation was received + calm "operator will activate you" note; the artist is **never stuck** | — |

The reference code (`GP-` + 4 chars) is the manual join key between the artist's Bit note and the operator's reconciliation — there is no payment-provider webhook, by design.

### 14.5.3 Receipts / invoices / ledger — gaps (OWED)

| Capability | Status |
|---|---|
| Automatic receipt to the payer | **OWED** — none. `amount_note` is a free-text string, not an invoice. |
| Tax invoice (Israeli חשבונית) | **OWED / OPEN** — not modeled; commercial launch will require it (needs entity/ח.פ., postal address — still placeholder per `SESSION-MEMORY`). |
| Payment ledger / reconciliation log | Partial — `entitlements` rows + operator `audit` (011) record activation + actor; there is no double-entry ledger or Bit-statement reconciliation view. **OWED** for post-Gate. |
| Refund / cancellation flow | Partial — `entitlements.status` supports `cancelled` (007 CHECK) but no UI/flow. **OWED.** |
| Price | **OPEN** — deliberately unlocked until the Gate (CLAUDE.md: "no price/ICP locked until then"). `OfferPayment` uses range copy. |

### 14.5.4 What turns on post-Gate

After the Gate (1 reaction + 1 pay, §14.4), the owner may: flip `VITE_PAYMENTS_ENABLED=1` (surfacing `/artist/offer` and CTAs), lock a price, add the `purchase` GA4 milestone (§14.2.2), and prioritise the receipts/invoice/ledger OWED items. Plan gating already has a home: `organization.plan_flags jsonb` (028) — app reads, operator writes, **never rendered as a score/level to buyers** (028 comment). No provider (Stripe/etc.) is assumed; the Bit-manual model is the current committed path until a business case justifies otherwise.

---

## 14.6 Notifications and email

Two channels: the **in-app bell** (built) and **transactional email** (mostly OWED). They are independent — the bell does not depend on email.

### 14.6.1 In-app bell — built (`src/lib/notifications.js`, migration 002 `notifications`)

- Table `notifications(user_id, type, body, link, read, created_at)`; RLS `notif_self` → a session lists/marks-read **only its own** rows.
- **Writing for another user** goes through the service-role server route, never the client. Two writers:
  - `POST /api/notify` (`server/index.js:555`) — caller must **own the target artist** OR be `operator`; closed type enum `request_received | confirmation_received | system`.
  - `POST /api/availability-request` (`:588`) — **public** (bookers have no login); creates the request **and** the artist's bell notification server-side, with a **server-authored body** (`en.notifications.newRequest(name)`) so anonymous free text can never be injected into someone's bell.
- **Firewall:** `body` is bounded text from `T.notifications.*` templates (`i18n/en.js:648`: `newRequest`, `passportPublished`, `confirmationArrived`) — never a raw score/%/count.
- **Offline-embed limitation (honest):** on the static `lock.show/app` embed with no server, an availability request still records via direct RLS insert, but **no cross-user bell can be written** (RLS is `user_id = auth.uid()`) — the artist sees the request in their inbox, without a bell ping (`AvailabilityRequest.jsx:73–79`).

### 14.6.2 Transactional email catalog (mostly OWED)

**Auth emails today are sent by Supabase Auth (GoTrue) built-in templates, not by an app-side provider.** The app only sets the redirect target:

| Email | Trigger | Delivery today | Redirect / token | Status |
|---|---|---|---|---|
| **Signup confirmation** | `supabase.auth.signUp()` (`AuthProvider.jsx:111`) | Supabase Auth built-in | `emailRedirectTo = origin + BASE_URL` (surface-aware: `/` app vs `/app/` embed) | Live via GoTrue; branding/FROM = **OWED** (Resend) |
| **Magic-link — password reset** | `resetPasswordForEmail()` (`ForgotPassword.jsx:25`) | Supabase Auth built-in | `redirectTo = origin + BASE_URL + reset-password` → `/reset-password` route | Live via GoTrue |
| **Magic-link — producer confirm** | `POST /api/request-confirmation` mints a token → artist sends the link **manually** (like `wa.me`) | **No email** — link is handed off by the artist | `/confirm/:token` (`ProducerConfirm.jsx`) | By design manual; optional auto-email = OWED |
| **Org invite** | `inviteMember()` → `/invite/:token` (`AcceptInvite.jsx`) | **Not sent** — `resendInvite()` is a no-op stub: _"email provider is Phase-2"_ (`orgs.js:212`) | `/invite/:token` | **OWED** (email provider) |
| **Availability-request notification to the artist (the Gate reaction)** | `POST /api/availability-request` (`server/index.js:619`) | **In-app bell only** — no email | link `/artist/requests` | **Email OWED — see below** |

**The critical one — how the artist learns a buyer reacted.** This is the artist-facing half of the Gate signal, and today it is delivered **only as an in-app bell**. If the artist is not in the app, they do not learn a booking manager reacted until they next open it. For a pre-booking trust tool whose entire Gate hinges on a buyer reaction reaching the artist, an **email (and/or WhatsApp) notification on `request_received` is OWED and high-priority.** The server already has the trigger point (`:619`), the recipient (`artists.created_by`), and a server-authored bounded body — it needs an email transport. Firewall holds: the email body must stay method-safe bounded text, never a count/score about the buyer or the reaction.

### 14.6.3 Resend — planned, not active (OWED)

**Resend is the chosen provider for transactional/auth email but is not wired** (`SESSION-MEMORY` P1-11; `COSTS.md`: _"Resend for auth emails (free tier)"_). Target FROM address `notifications@lock.show` (the `notifications` inbox already exists on the domain, alongside `hello/privacy/support/...`). Until Resend is wired: signup-confirm and password-reset ride Supabase Auth's default sender; org invites are **not emailed at all** (stub); the availability-request email does **not exist**.

### 14.6.4 Magic-link delivery / expiry rules

| Link | Generator | Expiry / single-use |
|---|---|---|
| Signup confirm & password-reset (GoTrue) | Supabase Auth | Governed by Supabase Auth token TTL (GoTrue default; configurable in the Auth dashboard) — **OWED: document the exact TTL once confirmed in the dashboard.** |
| Producer-confirm | `randomUUID()` token in `producer_confirmations` (`server/index.js:650`) | Token persists on the row; **no explicit expiry/rotation in schema — OWED** if time-boxing is required. Revoke clears the confirmed label. |
| Org invite | token on the invited membership row | Persists until accepted/cancelled; `cancelInvite` removes the row. No TTL — **OWED** if invites should expire. |

All redirect targets are **surface-aware** (`BASE_URL` → `/` standalone vs `/app/` embed) so a link never bounces to the wrong deployment (`AuthProvider.jsx:107`, `ForgotPassword.jsx:20`).

---

## 14.7 OWED / OPEN register (build-from checklist)

| Ref | Item | Type | Priority |
|---|---|---|---|
| 14.1.1 | Confirm migration 034 is APPLIED on the live DB (unblocks `passport_unpublished` persistence) | OWED (verify) | High |
| 14.1.2 | Wire remaining events: `signup_started`, `onboarding_started`, `oauth_login`, `claim_published`, `share_link_created/opened` | OWED | Med |
| 14.1.3 | Populate `session_id` / `passport_version_id` / `act_id` on the client writer (per-Passport/Act/anon funnels) | OWED | Med |
| 14.2.1 | Register + emit GA4 custom dimensions `surface/route_name/actor_role/auth_state/environment` | OWED | High |
| 14.2.2 | Build the GA4 dual-emit layer for the 5 pilot milestones (`gtag()` on grant) | OWED | High |
| 14.3.2 | Add `is_demo`/`environment` to `analytics_event` (or read-model derivation) + read-model exclusion + admin "demo-excluded" badge | OWED | High (Gate integrity) |
| 14.4.2 | Seed/`@gigproof.test` exclusion must land before the Gate can be declared "genuine outside buyer" | OWED | High |
| 14.5.3 | Receipts, tax invoice (חשבונית), payment ledger/reconciliation view, refund flow | OWED | Post-Gate |
| 14.5.3 | Price / ICP | OPEN | Locked only after Gate |
| 14.6.2 | **Availability-request email/WhatsApp to the artist on `request_received`** (Gate reaction reaches the artist off-app) | OWED | High |
| 14.6.3 | Wire Resend (FROM `notifications@lock.show`); org-invite emails currently not sent (stub) | OWED | Med-High |
| 14.6.4 | Document GoTrue token TTLs; decide producer-confirm & invite token expiry/rotation | OWED / OPEN | Med |
| 14.5.4 | Add `purchase` GA4 milestone + flip `VITE_PAYMENTS_ENABLED` when payments go live | OPEN | Post-Gate |

---

_Sources of record: `src/lib/analytics.js`, `src/lib/constants.js`, `src/lib/demo.js`, `src/lib/notifications.js`, `src/features/artist/OfferPayment.jsx`, `src/features/passport/AvailabilityRequest.jsx`, `src/features/auth/{AuthProvider,ForgotPassword}.jsx`, `src/App.jsx`, `server/index.js`; migrations 002, 007, 018, 024, 028, 034; `docs/PILOT-MEASUREMENT-MAP.md`, `docs/ADMIN-PANEL-SPEC.md`, `docs/SESSION-MEMORY.md`, `docs/CONNECTIONS-REGISTRY.md`, `docs/COSTS.md`._
