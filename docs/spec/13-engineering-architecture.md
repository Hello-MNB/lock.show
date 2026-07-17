# §13 — Engineering & Architecture

**Product:** LOCK (repo codename GIGPROOF / B4). Pre-booking proof & risk-reduction tool.
**Scope of this section:** the *as-built* engineering reality — surfaces, data model, server
contracts, auth, security/firewall enforcement, DB-ops/deploy, and the Q8 production gate.
**Grounding rule:** every claim below is traced to a file in the repo (cited inline). Anything
genuinely not yet built is marked **OWED** (a deliverable) or **OPEN** (an unresolved decision).
No secrets, keys, or credentials appear here.

> **The Firewall (governing constraint for the whole stack).** No score / percentile / rank /
> "bookability %" / prediction / gauge is ever computed, stored, or returned. Draw is expressed
> ONLY as **bands** + **binaries** with **method labels**. This is enforced at three physical
> layers — RLS row gates, per-column `GRANT`s to the `anon` role, and explicit column lists in
> server/client read paths — so a score column *could not* surface even if one were mistakenly
> added. Streaming is secondary context only.

---

## 13.1 System architecture

### 13.1.1 Surfaces

LOCK ships as three deployment surfaces over **one** React SPA codebase plus a Next.js marketing
site:

| Surface | Domain | Tech | Serves |
|---|---|---|---|
| **Marketing site** (`website-next/`) | `lock.show`, `www.lock.show` | Next.js `output: 'export'` (static) | Public marketing, waitlist capture, SEO pages |
| **App SPA** (`src/`) | `app.lock.show` | React 18 + Vite + Tailwind, React Router | The product (artist / buyer / agency / production / producer / operator workspaces) |
| **Embed** | `www.lock.show/app/*` | The SAME Vite SPA, built `--mode embed`, committed as a static bundle under `website-next/public/app/` | Same-origin embedded copy of the app |

The **embed is a second physical copy** of the SPA bundle committed into the marketing repo. This is
a known version-skew class (two bundles for one app): the standalone serves `index-*.js` from its own
build; the embed serves a separately-committed `public/app/assets/index-*.js`. Mitigation is a
CI embed-sync gate (**OWED**, see `docs/architecture/P1-REFRESH-LOGOUT-ROOTCAUSE.md` Fix C and
`BRANCHING-MODEL.md` hard-gate 2 "every app release rebuilds the embed").

### 13.1.2 Stack & runtime topology

- **Client:** React + Vite + Tailwind; routing in `src/App.jsx` (React Router). State via context
  (`AuthProvider`, `OrgContext`).
- **Data plane:** Supabase (Postgres + Auth + Storage + RLS), project ref `qexfndiyallwqhhzeerd`.
  The browser talks to Supabase **directly** with the public **anon** key (`src/lib/supabase.js`).
- **API server:** a single Express app (`server/index.js`) holding the Anthropic key and the
  Supabase **service-role** key. Runs on port 8787 locally; on Vercel it is imported by
  `api/index.js` as a serverless function (the exact same Express `app` export).
- **AI:** Anthropic API via `src/lib/ai` (`createClaimProcessor`); default model
  `claude-opus-4-8` (`server/index.js:34`). Stub processor when no key is set.
- **Hosting:** Vercel (both projects). Marketing static-export; app SPA with a catch-all rewrite.

### 13.1.3 Request flow (where the logic lives)

There are **two** live data paths, by design, because the pilot must run even with **no server**:

1. **Direct-to-Supabase (primary, no-server path).** The SPA reads/writes Postgres directly under
   RLS using the anon (or the logged-in user's) JWT. Publishing, passport reads, evidence rows,
   claims review, org/roster RPCs all work this way (`src/lib/db.js`, `src/lib/orgs.js`). A build
   flag `NO_API_DEPLOY` (`src/lib/db.js`) makes the client the processor when there is no `/api`.
2. **Via the Express server (privileged path).** Used when a task **requires** the service role or
   the Anthropic key: AI claim extraction, cross-user notification writes, anonymous-buyer request
   creation, producer magic-link confirmation, and the immutable publish snapshot. See §13.3.

**Logic placement:**

| Concern | Client (SPA) | Server (Express) | Database (Postgres) |
|---|---|---|---|
| Routing / role gates | ✅ `App.jsx` + `navigation.js` | — | — |
| Firewall column selection | ✅ explicit `.select()` lists | ✅ `buildSafePayload` explicit lists | ✅ RLS + per-column anon `GRANT`s |
| Tenant isolation | — | service role (bypasses RLS — must self-enforce) | ✅ RLS via `current_org_ids()` / `can_access_artist()` |
| AI claim extraction | stub fallback only | ✅ `/api/process-evidence` | claims rows |
| Draw materialization (Radar) | canonical rules `src/lib/radar.js` | — | `recompute_radar_for_org()` + triggers (subset R1/R2/R4/R7) |
| Abuse controls / spend caps | — | ✅ in-memory + analytics ledger | — |

### 13.1.4 Trust boundaries

- **Anon browser ↔ Postgres:** the anon key is public and shippable. The boundary is **RLS row
  policies + per-column `GRANT`s** (migrations 016/025). The DB *is* the firewall on this path.
- **Authenticated browser ↔ Postgres:** the user's JWT widens RLS to their own/org rows; the buyer
  "public passport" view must therefore **re-filter explicitly** (see the `artist_approved` gate,
  §13.5) because RLS shows an owner *all* their own rows.
- **Browser ↔ Express:** CORS allowlist + `requireAuth` (Bearer JWT verified against Supabase) +
  ownership gate (`requireArtistOwner`). Public-by-design routes (health, public passport GET,
  passport-signal, availability-request, tokened producer confirm) skip auth intentionally.
- **Express ↔ Postgres:** the **service role bypasses RLS entirely** — the server is inside the
  trust boundary and must enforce every gate in code. This is the single highest-risk surface
  (§13.5.3).

---

## 13.2 Data model — the real DB schema

Source of truth: `supabase/migrations/001…035` (+ `036…DRAFT`), and the consolidated
`supabase/apply_to_supabase.sql`. Postgres schema `public`. All tables carry RLS.

### 13.2.1 Migration map

| # | File | What it does | State |
|---|---|---|---|
| 001 | `initial_schema` | Core: profiles, artists, profile_items, evidence_artifacts, claims, availability_requests, consent_records, passport_versions + RLS + storage buckets | applied |
| 002 | `add_whatsapp_and_notifications` | `artists.whatsapp_number`; `notifications` table (`notif_self` RLS) | applied |
| 003 | `operator_admin` | `operator` role; `is_operator()`; platform oversight read + targeted moderation update | applied |
| 004 | `producer_role` | adds `producer` to `profiles.role` CHECK | applied |
| 005 | `producer_confirmations` | `claims.method_label`; `producer_confirmations` table (magic-link, server-mediated) | applied |
| 006 | `passport_signals` | `passport_signals` table (B2 action-ladder rungs, anon insert) | applied |
| 007 | `entitlements` | `entitlements` table (manual founding-passport payment; pending→active by operator) | applied |
| 008 | `org_first_model` | Org tenancy spine: person, organization, organization_membership, role_assignment, active_role_context, artist_access, subscription, gigs, draw_signals; `organization_id` on domain tables; RLS spine helpers (`current_org_ids`, `has_org_role`, `can_access_artist`, `is_comember`) | applied |
| 009 | `org_bootstrap` | SECURITY DEFINER RPCs: `bootstrap_personal_org`, seats/invites (resolves signup chicken-and-egg) | applied |
| 010 | `radar` | `radar_signal` materialized store; `recompute_radar_for_org()`; feeding triggers | applied |
| 011 | `audit_operator` | `audit_log` table; operator right-to-erasure delete on artists | applied |
| 012 | `agency_upgrade` | `approve_agency_upgrade()` (Solo→Agency on the same org) + operator read | applied |
| 013 | `invite_info` | `invite_info()` RPC — safe invite display fields for the accept screen | applied |
| 014 | `artist_org_autoset` | BEFORE-INSERT trigger fills `artists.owner_organization_id` from active org | applied |
| 015 | `live_fixes` | Fix `artists_org` INSERT…RETURNING (42501), trigger 014, invite token `gen_random_uuid()` | applied |
| 016 | `firewall_column_security` | **Physical firewall:** `REVOKE SELECT` from anon, re-`GRANT` buyer-safe columns only on artists/profile_items/claims | applied |
| 017 | `owner_publish_snapshot` | `pv_owner_insert` — owner writes their own passport snapshot under RLS (no service role needed to publish) | applied |
| 018 | `professional_reaction` | professional_reaction, reaction_reason, opportunity + producer_confirmations enrichment | **failed & rolled back** (bad `opp_org_all` policy referenced non-existent `org_memberships.user_id`) |
| 019 | `repair_professional_reaction` | Re-applies everything 018 lost, policy defect fixed, FK guarded | applied (supersedes 018) |
| 020 | `acts_spine` | **Multi-Act foundation:** `act` table; `act_id` threaded through 11 child tables; backfill (`act.id = artists.id`); transition triggers | applied |
| **021** | `vocabulary_and_consent` | Renames `mirror-only`→`working-only`, `booker`→`booking_manager`, adds `venue_programmer`, 4 canonical consent scopes | **⛔ FROZEN — NOT APPLIED** (would break the running app; see 13.2.5) |
| 022 | `claim_evidence_depth` | claims public-display fields + **`artist_approved` gate (default false)** + status lifecycle; evidence Amendment-13 fields; `processing_job` table | applied |
| 023 | `gig_depth` | gig-scoped draw bands + closeout fields; `exact_count` (working-only) | applied |
| 024 | `measurement_and_share` | share_link, passport_view_event, analytics_event (event-name CHECK — the **analytics head**) | applied |
| 025 | `firewall_grants` | Extends 016 to new tables/columns (gigs, act, share_link, analytics_event, passport_view_event) | applied |
| 026 | `waitlist` | `waitlist_signup` (public insert, operator-only read) | applied |
| 027 | `workspace_types_and_access_scopes` | `organization.workspace_type`; artist_access scope[]/territory/expiry/consent + lifecycle; `can_access_artist()` honors scope+expiry; access-handshake RPCs | applied (was owner-approval-gated; 030 later fixes recursion it introduced, confirming it is live) |
| 028 | `discovery_analytics_plans` | `discovered` evidence source; bilingual name fields; M1 funnel events; `organization.plan_flags` jsonb | applied (owner-approval-gated in header) |
| 029 | `artist_whatsapp_share` | `artists.whatsapp_share`; `get_shared_whatsapp()` gated exposure | applied |
| 030 | `fix_artists_rls_recursion` | Breaks artists↔artist_access mutual-RLS loop via SECURITY DEFINER `owns_artist()` | applied |
| 031 | `passport_approval_gate` | **Adds `and artist_approved = true` to `claims_public_read`** (firewall breach fix) | applied |
| 032 | `roster_and_production_rpcs` | `list_roster_grants()`, `list_production_requests()` (read-only RPCs) | applied ✓ verified |
| 033 | `waitlist_outreach_roles` | Widens `waitlist_signup.role` CHECK (manager/production outreach) | applied |
| **034** | `event_canon_unpublish` | **analytics_event CHECK = app CANON exactly: 29 event names** (file=DB=app, reconciled) | applied ✓ (**the analytics CHECK head**) |
| 035 | `create_workspace` | `create_workspace()` RPC (second/additional workspace) | applied ✓ |
| 036 | `token_hash.sql.DRAFT` | Hashed producer-token storage (G15-4) — dual-read rollout plan | **DRAFT — deliberately not runnable** (`.DRAFT` suffix; `token` still plaintext, migration 005) |

**Live migration head (per `docs/VERSIONS.md`, 13–15 Jul 2026):** **035**. 021 is permanently
skipped/frozen; 036 is a draft. Every migration file has a paired `NNN_*.down.sql` from 019
onward. Migrations ship **alone**, applied+verified before dependent code (`BRANCHING-MODEL.md`
hard-gate 4).

> **Diff before authoring 037+** — do not recreate existing tables. Structural renames (e.g.
> workspace_type `producer`→`production`, folding 021's vocabulary) are gated on Supabase Pro
> backups being ON before any destructive change (`rel-2026.07.13-PLAN.md` §4b item 4).

### 13.2.2 Table catalog — core evidence spine

**`artists`** (001; the transition anchor — child rows still hang here while the app migrates to
act-first reads)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `created_by` | uuid → `auth.users` | owner (ownership gate) |
| `stage_name`, `name`, `genre`, `city`, `photo_url`, `one_line`, `regions`, `set_length` | text | buyer-safe identity |
| `invoice_ready` | boolean | |
| `rider_url` | text | **private** (not anon-granted) |
| `whatsapp_number` | text (002) | **private**; exposed only via `get_shared_whatsapp()` |
| `whatsapp_share` | boolean (029) | artist opt-in |
| `music_links` | jsonb | |
| `lineup_frequency_band`, `price_band`, `community_size_band` | text | **BANDS only** (firewall) |
| `sells_tickets` | boolean | binary |
| `published` | boolean default false | the publish/firewall gate |
| `owner_organization_id`, `organization_id` | uuid → organization (008) | tenancy |
| `stage_name_he`, `name_he` | text (028) | bilingual search |

**`profile_items`** (001) — track record. `item_type` CHECK: `event · lineup · collab · release ·
residency · self_produced_event · link · draw_signal`. `source_status` CHECK: `public-verified ·
artist-provided`. `visibility` CHECK: `passport-ok · mirror-only` (001; 021 would rename to
`working-only` but is frozen). `act_id` (020).

**`evidence_artifacts`** (001) — artist-supplied proof (files go to Storage, not through the API).
`evidence_type` CHECK: `file · link · band`. `source_type` CHECK: `ticket-export · settlement ·
screenshot · public-profile · producer-vouch · self-band · self-reported · discovered` (028).
`status` CHECK: `submitted · processed · error`. Depth fields (022): `claim_intent`,
`source_owner_consent`, `checksum`, `retention_policy`, `platform`, `pii_scrubbed`. Discovery
provenance (028): `discovery_source_url`, `discovery_query`, `same_person_state`
(`unreviewed · artist-confirmed · artist-dismissed`). `act_id` (020).

**`claims`** (001; output of AI processing — the firewall-critical table)

| Column | Type | CHECK / notes |
|---|---|---|
| `id` | uuid PK | |
| `artist_id` | uuid → artists | |
| `act_id` | uuid → act (020) | |
| `evidence_id` | uuid → evidence_artifacts (set null) | |
| `claim_type`, `value` | text | `value` = exact working text |
| `verification_status` | text default `self-reported` | `verified · supporting · self-reported · not-assessable` |
| `verified_by` | text default `system` | `system · artist` |
| `verified_at`, `expires_at` | timestamptz | `expires_at` drives auto-**stale**; **never** sent to public |
| `visibility` | text default `mirror-only` | `passport-ok · mirror-only · internal` |
| `method_label` | text (005) | `producer-confirmed` (strongest) / `stale` / null |
| `extraction_method`, `model_version` | text | provenance (truthful): `anthropic · deterministic_fallback · mock · client_stub` |
| `internal_confidence` | numeric | **DB-only — NEVER returned to any client (a score → firewall)** |
| `reason_code` | text | |
| `public_band` | text (022) | **the only public draw form** (band string) |
| `public_wording`, `limitation_text` | text (022) | exact public text + "what this does/does not establish" |
| **`artist_approved`** | boolean default false (022) | **the publish gate — nothing reaches any view without this** |
| `source_timestamp` | timestamptz (022) | |
| `status` | text default `submitted` (022) | `submitted · processed · source-supported · published · self-reported · not-assessable · stale · disputed` |

**`passport_versions`** (001) — **immutable** buyer-safe snapshots (insert-only; never updated).
`snapshot` jsonb MUST NOT contain score/percentile/exact-count/internal_confidence. `act_id` (020).

**`availability_requests`** (001) — buyer reaction. `status` CHECK: `new · replied · closed`.
Bands only (`capacity_band`, `budget_band`). `act_id` (020).

**`consent_records`** (001) — legal basis. `status`: `accepted · declined · withdrawn`. `scope`
CHECK (post-021 target = `privacy-processing · public-publication · thirdparty-evidence · marketing
· account-deletion`) — but 021 is frozen, so the **live** scope vocabulary is the pre-021 set plus
`scope_legacy` staging is not yet present. **OPEN:** live consent-scope vocabulary is whatever 001
defined until 021 (or a re-authored equivalent) lands.

### 13.2.3 Table catalog — org tenancy (008/027)

| Table | Key columns | CHECK / enum values |
|---|---|---|
| `person` | `id` → auth.users, `email`, `display_name` | 1:1 with auth user |
| `organization` | `id`, `name`, `slug` unique, `plan`, `created_by`, `workspace_type` (027), `plan_flags` jsonb (028) | `plan`: `solo · agency · agency_plus`; `workspace_type`: `artist · management · producer` |
| `organization_membership` | `organization_id`, `person_id` (null until invite accepted), `org_role`, `status`, `invite_token` unique | `org_role`: `owner · admin · member`; `status`: `active · invited · suspended`; unique(org, person) |
| `role_assignment` | `organization_id`, `person_id`, `functional_role`, `authority_scope` jsonb | `functional_role` (post-027 CHECK): `artist · booking_manager · artist_manager · producer · venue_programmer · operator · booking_agent · roster_coordinator · viewer` **+ tolerated legacy** `booker · agency` |
| `active_role_context` | `person_id` PK, `active_organization_id` | which workspace is active |
| `artist_access` | `organization_id`, `artist_id`, `access_level`, `scope[]` (027), `territory`, `expires_at`, `consent_at`, `status` | `access_level`: `manage · view`; `scope ⊆ {view,upload,edit,share,publish}`; `status` (027): `pending · active · revoked · disputed`; unique(org, artist) |
| `subscription` | `organization_id` unique, `plan`, `seats_included`, `seats_used`, `status` | `status`: `active · trialing · past_due · canceled` |

### 13.2.4 Table catalog — domain, measurement, ops

| Table | Migration | Key columns / enums (firewall-relevant) |
|---|---|---|
| `gigs` | 008/023 | `status`: `lead·hold·confirmed·settled·canceled`; `role_at_event`: `headliner·support·lineup-member`; `audience_band`: `<50·50-150·150-300·300-600·600+·unknown`; `band_means`: `sold·scanned·attended·attributed-via-link`; **`exact_count` int — working-only, never anon-granted**; closeout: `attendance_band`, `settlement_band`, `closeout_status` (`pending·completed·skipped`), `ticket_attribution_confirmed`, `repeat_booking_signal` |
| `draw_signals` | 008 | `signal_type`: `lineup-frequency·sells-tickets·price-band·community-size`; `band_value` (band only), `method_label` |
| `radar_signal` | 010 | `rule_id`: `R1…R8`; `status`: `strong·developing·missing·notAssessable`; `action_type`: `refresh-evidence·request-evidence·respond·publish·promote·review`; `evidence_basis` (ref, not a number); unique(org, artist, rule) |
| `act` | 020 | `person_id`, `stage_name`, `genre`, `city`, `positioning` (≤120), `format` (`dj-set·live-set·duo·band·open-format·vocalist·other`), `artist_goal` enum; **`contact` internal-only**, **`community_count_declared` int working-only**; `is_default` |
| `producer_confirmations` | 005/019 | `token` unique (plaintext — see 036 DRAFT), `response`: `yes·partial·no·wrong_person`, `revoked`, `responded_at`; enrichment (019): `authority_type` (`producer·venue_rep·ticketing_admin·organizer·other`), `name_visibility` (`public·initials·anonymous`), `identity_verified`, `conflict_of_interest`, `offline_confirmation_source` (`phone·message·in_person`) |
| `professional_reaction` | 018/019 | `action_type`: `check_availability·request_price·save·forward·future_fit·request_proof·not_fit`; `reaction_status`: `recorded·retracted`; `idempotency_key` unique |
| `reaction_reason` | 018/019 | `reason_type` enum; `free_text` **INTERNAL ONLY** |
| `opportunity` | 018/019 | `status`: `open·filled·cancelled·expired`; `capacity_band`/`budget_band` (bands only) |
| `processing_job` | 022 | `status`: `queued·running·completed·failed`; `model_version`, `ruleset_version` (server-written only) |
| `share_link` | 024 | `tracking_disclosed` (must be true before send), `status`: `active·expired·revoked`, `act_id` |
| `passport_view_event` | 024 | anon insert **only against a published artist**; a view is NOT a reaction (must never merge) |
| `analytics_event` | 024/028/034 | `event_name` CHECK = **29 canonical events** (034); append-only, operator-read only; `properties` jsonb (no PII) |
| `notifications` | 002 | `user_id` self-RLS; cross-user writes go through the server service role |
| `entitlements` | 007 | `status`: `pending·active·cancelled`; operator activates |
| `audit_log` | 011 | operator-only; destructive actions write a row first |
| `waitlist_signup` | 026/033 | public insert, operator read only; `role`: `artist·booking_manager·artist_manager·production·producer·other` |

**analytics_event CHECK (034 — the analytics head), 29 names:** `passport_view`,
`professional_reaction_submitted`, `availability_request_created`, `producer_confirmation_sent`,
`producer_confirmation_received`, `claim_published`, `passport_published`, `entitlement_activated`,
`gig_evidence_refresh_completed`, `passport_unpublished`, `share_link_created`, `share_link_opened`,
`consent_granted`, `consent_withdrawn`, `account_deleted`, `signup_started`, `signup_completed`,
`login`, `oauth_login`, `onboarding_started`, `onboarding_completed`, `radar_opened`,
`evidence_added`, `claim_confirmed`, `act_created`, `act_switched`, `workspace_switched`,
`payment_reference_created`, `availability_request_responded`. File=DB=app is a maintained
invariant (drift found twice by hand; 034 is generated from `src/lib/analytics.js` CANON).

### 13.2.5 Multi-Act `act_id` threading (020)

Canon: one **Person** may hold several **Acts** (e.g. a psytrance Act + a techno Act), each with its
own Passport and its own **non-transferable** evidence; a new Act starts empty. Migration 020:

1. Creates `public.act` (`person_id` FK — bound to a Person, not conflated with the legacy artist).
2. Backfills exactly one default Act per existing artist reusing the **same id**
   (`act.id = artists.id`), so every existing child row maps 1:1 trivially.
3. Adds `act_id` to **11** child tables (claims, evidence_artifacts, profile_items, gigs,
   passport_versions, availability_requests, producer_confirmations, professional_reaction,
   draw_signals, radar_signal, entitlements) + `share_link` (024), backfilled from `artist_id`.
4. Installs **transition triggers** so the current app keeps working untouched: a new `artists`
   row auto-creates its default Act (`act_from_artist`); a new child row auto-fills `act_id` from
   `artist_id` (`set_act_from_artist_id`). The app can migrate to act-first reads screen by screen.

**Binding rule (canon):** a Passport binds to an Act via `passport_version.act_id`, not to a Person.
Public reads are still served off `artists` under the 016/025 column grants; the `act` public-read
policy (025 `act_public_read`) and act-first passport cutover are the transition target.

---

## 13.3 API / server contracts

Base: `server/index.js` (Express). Body limit 100 KB; every string field ≤ 2000 chars
(`MAX_FIELD_CHARS`); CORS allowlist; per-IP rate limit on **all** routes (§13.5.4). Auth via
`Authorization: Bearer <supabase access_token>` verified by `requireAuth` → `req.userId`.

### 13.3.1 Endpoint catalog

| Method / path | Auth | Request | Response (success) | Purpose |
|---|---|---|---|---|
| `GET /api/health` | none | — | `{ ok, supabase, ai: 'configured'|'mock', model }` | Liveness; "configured" = key present, not that any call succeeded |
| `POST /api/process-evidence` | Bearer + artist owner | `{ artistId }` | `{ processed, deduped, ai: 'mock'|'degraded'|'live', methods, claims[], budget_alert }` | AI-label submitted evidence → write claims (§13.3.3) |
| `POST /api/publish/:artistId` | Bearer + owner | — | `{ ok, published:true }` | Write immutable buyer-safe snapshot + set `published` |
| `GET /api/passport/:artistId` | none | — | snapshot jsonb `{ artist, items[], claims[] }` | Serve immutable snapshot; live `published` flag re-gates |
| `POST /api/passport-signal` | none | `{ artistId, signal, sessionId? }` | `{ ok }` or `{ ok, deduped:true }` | Buyer one-tap signal; `signal ∈ price_details·future_fit·needs_proof·not_this_event·forwarded`; 24h idempotency via hashed session key |
| `POST /api/availability-request` | none | closed field list incl. `artistId`, `requester_name`, bands | `{ ok, request }` | Anonymous buyer request; server-authored notification body |
| `POST /api/notify` | Bearer | `{ artistId, type, body, link }` | `{ ok }` | Notification writer; caller must **own** the artist or be **operator**; `type ∈ request_received·confirmation_received·system` |
| `POST /api/request-confirmation` | Bearer + owner | `{ claimId, producerContact? }` | `{ token, path:'/confirm/<token>' }` | Mint a producer magic-link token |
| `GET /api/confirm/:token` | none (token) | — | `{ claimText, artistName, response, revoked, responded }` | Producer opens link (safe fields only) |
| `POST /api/confirm/:token` | none (token) | `{ response }` or `{ revoke:true }` | `{ ok, response }` / `{ ok, revoked:true }` / `{…already_recorded:true}` | Producer replies/revokes; `response ∈ yes·partial·no·wrong_person`; only `yes` earns `producer-confirmed` |

Error envelope is uniformly `{ error: '<code>' }` with codes: `auth_required` (401), `forbidden`
(403), `rate_limited` / `daily_limit_reached` / `monthly_budget_reached` (429), `too_many_items` /
`field_too_long` (400), `link_expired` (410), `server_error` (500).

### 13.3.2 Postgres RPCs (SECURITY DEFINER, called directly from the SPA)

These run privileged inside the DB to break the RLS chicken-and-egg / recursion, then gate on
`current_org_ids()` / `has_org_role()` / ownership internally:

| RPC | Migration | Purpose |
|---|---|---|
| `bootstrap_personal_org(name, functional_role, email?, display_name?)` | 009/021 | Create the signup solo org (person + org + owner membership + role + subscription + active context) |
| `create_workspace(name, workspace_type, functional_role)` | 035 | Create an **additional** workspace (empty; nothing copied — G3 boundary) |
| `invite_member(...)`, `accept_invite(token)`, `invite_info(token)` | 009/013/021 | Team invites + safe invite-display lookup |
| `approve_agency_upgrade(org, seats)` | 012 | Solo→Agency on the same org (operator-gated) |
| `request_artist_access(org, artist, scope[], territory?)` | 027 | Agency/production requests a scoped, revocable grant |
| `list_incoming_access_requests()` | 027 | Artist-side "who wants access to me" (safe join) |
| `respond_to_access_request(id, approve, scope?)` | 027 | Artist approves/declines (optionally narrows scope) |
| `revoke_artist_access(id)` | 027 | Either side revokes an active grant |
| `list_roster_grants()` | 032 | Manager roster from consented active grants |
| `list_production_requests()` | 032 | Production outbound-request inbox with reply status |
| `get_shared_whatsapp(artistId)` | 029 | Returns the WhatsApp number ONLY if published AND opted in |
| `recompute_radar_for_org(org)` | 010 | Deterministic Radar materialization (R1/R2/R4/R7 subset) |

### 13.3.3 The claim-safe payload contract (`buildSafePayload`) — the physical firewall

`server/index.js` `buildSafePayload(artistId)` (used both to write the publish snapshot and as the
live fallback in `GET /api/passport/:artistId`). This is the **contract that guarantees private gaps
and unreviewed claims never leak** to a buyer. Because the server uses the **service role**, which
**bypasses RLS**, every gate must be re-stated explicitly in the query — RLS does not protect this
path.

The contract, exactly:

- **artists** — an **explicit column allowlist**: `id, stage_name, name, genre, city, photo_url,
  one_line, regions, set_length, invoice_ready, music_links, lineup_frequency_band, sells_tickets,
  price_band, community_size_band`. (No `internal_confidence`, `rider_url`, `whatsapp_number`,
  `created_by` — none could appear even if present.)
- **profile_items** — allowlist `id, item_type, title, detail, item_date, public_url,
  source_status`, filtered `visibility = 'passport-ok'`.
- **claims** — allowlist `id, claim_type, value, source_type, verification_status, reason_code,
  method_label, expires_at`, filtered by **all four** gates:
  1. `visibility = 'passport-ok'`
  2. `verification_status IN ('verified','supporting')` (`PUBLISHABLE_STATUSES`)
  3. **`artist_approved = true`** (the 031/022 gate — this is the line that stops auto-labeled,
     never-reviewed claims from going public; the admin client would otherwise ignore RLS)
  4. `artist_is_published` is enforced by the caller (`GET /api/passport` checks live `published`)
- **Stale computed server-side, timestamp stripped:** for each claim, if `method_label ≠
  producer-confirmed` and `expires_at < now`, the label becomes `stale`; then **`expires_at` is
  deleted from the object**. Raw timestamps never leave the server — only the bounded label does.

The client no-server path mirrors this exactly (`src/lib/db.js` `getPublicPassport` /
`buildPassportSnapshot`): the anon branch relies on the DB (016 column grants exclude `visibility`
so it can't even be referenced), and the **authenticated** branch re-filters
`passport-ok + publishable + artist_approved` explicitly, because an owner's RLS shows all their
own rows. **One Passport, identical for every viewer class.**

---

## 13.4 Auth & sessions

### 13.4.1 Client configuration

`src/lib/supabase.js` creates the client with `persistSession: true`, `autoRefreshToken: true`,
`flowType: 'pkce'`, `detectSessionInUrl: true`. PKCE + `detectSessionInUrl` are required so Google's
`?code=` redirect can be exchanged (without them the user bounced back to login — the bug Maria hit
9 Jul). Session lives in **localStorage** (see §13.5.5 for the XSS consideration).

### 13.4.2 Flows

| Flow | Mechanism | Notes |
|---|---|---|
| Email signup / login | Supabase Auth email+password; `/signup`, `/login` | On signup the app calls `bootstrap_personal_org` |
| Google OAuth | PKCE redirect; `OAUTH_ENABLED` default ON since 8 Jul (`VITE_OAUTH_ENABLED=0` kill-switch) | Google provider enabled in Supabase dashboard |
| Facebook OAuth | `OAUTH_FACEBOOK_ENABLED` default **OFF** | Provider NOT enabled in Supabase; a visible button produced a raw error, so it is flag-gated |
| Email confirm | Supabase email link; SMTP (Resend) delivery is QA item Q3 | Delivery is a Cowork/owner setup step |
| Forgot / reset password | `/forgot-password` → `/reset-password` (`ForgotPassword.jsx`, `ResetPassword.jsx`) | Standard Supabase recovery |
| Org invite | `organization_membership.invite_token` (unique, minted by `invite_member`); `/invite/:token` → `AcceptInvite`; `invite_info(token)` shows safe fields; `accept_invite(token)` verifies email match then activates | **Expiry: OPEN/OWED** — invite tokens have no explicit TTL in the schema (unlike producer tokens) |
| Producer confirm | `/confirm/:token` (producer magic link); minted by `POST /api/request-confirmation` | **Expiry 14 days** (`CONFIRM_TOKEN_TTL_DAYS`); a row with no `created_at` is treated as **expired** (fail-closed); token stored **plaintext** today (036 DRAFT hashes it) |

### 13.4.3 Session/role model

- **Auth identity** = Supabase user (`useAuth()` / `AuthProvider`). Profile role via `getProfile`.
- **Effective role** = the **active workspace's** derived role from `useOrg()` (`OrgContext`), NOT
  the static profile role — so a workspace switch actually re-gates the UI. Route guards
  (`RequireRole`, `RequireAgency`, `RequireProduction`) and `RoleHome` all delegate to the pure
  functions in `src/lib/navigation.js` (`homePathFor`, `requireRoleRedirect`, etc.), which are
  exhaustively verified by `scripts/nav-contract.test.mjs` (34 journeys) on every build.
- **Producer** is never a self-selected signup role (`SIGNUP_ROLES = artist·booker·agency`); it is
  an accountless magic-link task.

### 13.4.4 Refresh-logout root cause + fix (folded from `P1-REFRESH-LOGOUT-ROOTCAUSE.md`)

**Symptom (14 Jul):** logged in, edited artist details, pressed refresh, ejected from the app.

**Verdict:** **NOT an auth/session bug.** The session/auth code (`AuthProvider.jsx`,
`supabase.js`, `main.jsx`) is **byte-identical** across the embed, standalone, and HEAD. The boot
logic correctly `await`s `getSession()` + `loadProfile` before clearing `loading`. None of it runs
on the failing reload.

**Actual mechanism:** an **SPA deep-link routing gap on static hosting**. A hard reload of a client
route issues a real GET for that exact path. With Next `output: 'export'` (no server rewrites) and a
`vercel.json` that had only `cleanUrls`, only paths with a **physical file** existed
(`/app/`, `/app/login`, `/app/signup` were hand-created shells). Every other route
(`/app/settings`, `/app/artist/*`, `/app/onboarding`, …) returned **404** and served the marketing
404 page — the app bundle never booted to read the intact localStorage session. Confirmed by live
HTTP: `/app/` → 200 (app), `/app/settings` → 404 (Next marketing). The standalone had the same gap
(root `vercel.json` also lacked rewrites).

**Fix (both now applied in the repo):**
- **Embed** — `website-next/vercel.json` adds `rewrites: [{ source: '/app/:path*', destination:
  '/app/index.html' }]`. (Vercel rewrites run **after** the filesystem check, so real files/assets
  still serve directly; only 404-ing deep routes fall through to the SPA shell.)
- **Standalone** — root `vercel.json` adds `rewrites: [{ source: '/((?!assets/|_next/).*)',
  destination: '/index.html' }]`.
- **Durable target (OWED):** collapse to a single canonical bundle (redirect `www.lock.show/app/*`
  to the standalone) **or** add a CI embed-sync hash gate so the embed can never silently go stale.

---

## 13.5 Security & firewall server-enforcement

### 13.5.1 RLS policy catalog (per table: who reads / who writes)

Helper functions (all `SECURITY DEFINER`, so they don't recurse through RLS): `owns_artist(a)`
(030, org-owner check without self-selecting artists), `can_access_artist(a)` (008/027 — owning org
OR active, unexpired, `view`-scoped `artist_access`), `current_org_ids()`, `has_org_role(org,
roles[])`, `is_operator()` (003), `artist_is_published(a)`.

| Table | Public / anon | Authenticated user / org | Operator |
|---|---|---|---|
| `profiles` | — | self all (`profiles_self`) | read all |
| `artists` | SELECT if `published` (`artists_public_read`); **column-restricted** by 016 | org access `can_access_artist` (`artists_org`); INSERT check `owner_organization_id ∈ current_org_ids` | read / update / delete (moderation, erasure) |
| `profile_items` | SELECT `passport-ok` of published (col-restricted 016) | org (`items_org`) | read |
| `evidence_artifacts` | **none** (private) | org (`evidence_org`) | read |
| `claims` | SELECT `passport-ok` + publishable + **`artist_approved`** + published (`claims_public_read`, 031); columns restricted 016/025 | org (`claims_org`) | read + update |
| `availability_requests` | INSERT if `artist_is_published` (`req_public_insert`) | org read/update | read/update |
| `passport_versions` | SELECT if published (`pv_public_read`); **owner INSERT** (`pv_owner_insert`, 017) | org read | — |
| `passport_signals` | INSERT if published; no read | owner read | read |
| `producer_confirmations` | **none** (all writes server/service-role) | org read | read |
| `professional_reaction` | **INSERT open** (`with check (true)`) | org read | read |
| `reaction_reason` | INSERT open | org read (via reaction join) | read |
| `passport_view_event` | INSERT **only against a published artist** (stricter than reactions) | org read | read |
| `analytics_event` | **INSERT open** (append-only) | — | **read only** |
| `share_link` | no anon read (025) | org all | read |
| `person / organization / membership / role_assignment / artist_access / subscription` | — | member read; owner/admin write; artist-side access-request read/respond (027/030) | selective read (012) |
| `gigs / draw_signals / radar_signal / opportunity / act` | anon read of buyer-safe columns where published (025); else none | org tenant scope | read |
| `entitlements` | — | owner read + insert own pending | read + activate |
| `notifications` | — | self only (`notif_self`) | — |
| `waitlist_signup` | **INSERT open**; no read (revoked from anon) | — | read only |
| `audit_log` / `processing_job` | — | processing_job: org read only | operator all |

### 13.5.2 The `artist_approved` firewall gate (the load-bearing rule)

A claim is born `visibility='passport-ok'` the instant it is auto-labeled verified/supporting —
**before** the artist reviews it. `artist_approved` defaults **false** (022) and is the intended
publish gate ("Nothing publishes without you"; canon: "zero claims publish without review"). The
breach (found 10 Jul) was that `claims_public_read` filtered on visibility+status+published but NOT
`artist_approved`, so publishing exposed every unreviewed auto-claim. **Enforced in all four read
paths** (must stay in lockstep — this is the single most important firewall invariant):

1. RLS `claims_public_read` — `and artist_approved = true` (migration 031).
2. Server `buildSafePayload` — `.eq('artist_approved', true)` (service role bypasses RLS).
3. Client `getPublicPassport` authenticated branch — `.eq('artist_approved', true)`.
4. Client `buildPassportSnapshot` — `.eq('artist_approved', true)`.

### 13.5.3 Service-role bypass risk

The Express server holds the **service-role** key, which **bypasses RLS**. Consequences that are
actively managed in `server/index.js`:

- Every read that could leak private data (`buildSafePayload`) re-states the RLS filters explicitly.
- Every mutation gate is re-checked in code: `requireAuth` (JWT), `requireArtistOwner`
  (`artists.created_by === req.userId`), operator check for cross-user notifications.
- Cross-user writes that RLS would forbid (notifications to another user's bell) are **only**
  reachable via server routes with server-authored bodies (`/api/availability-request` writes the
  notification body itself; `/api/notify` restricts `type` to a closed enum and requires ownership
  or operator).
- **Residual risk (OPEN):** any new server read path that forgets a firewall filter leaks with no
  RLS backstop. Mitigation target = a shared safe-select helper + a server-payload firewall test in
  CI (**OWED**; `scripts/test-security-denial.mjs` exists for denial cases — G11).

### 13.5.4 Rate limits & AI spend caps (actual values in `server/index.js`)

| Control | Value (env-tunable) | Enforcement |
|---|---|---|
| Per-IP rate limit | `RATE_LIMIT_PER_MIN = 30` / trailing 60s | in-memory sliding window, ALL routes → 429 `rate_limited` |
| Items per job | `MAX_ITEMS_PER_JOB = 15` | reject batch → 400 `too_many_items` |
| Items per user / day | `MAX_ITEMS_PER_USER_DAY = 15` | in-memory per-user/UTC-day → 429 `daily_limit_reached` |
| Monthly AI budget (hard) | `MONTHLY_BUDGET_USD = 50` | estimate from `analytics_event` count × `COST_PER_ITEM_USD (0.02)` → 429 `monthly_budget_reached` |
| Budget alert | `BUDGET_ALERT_AT_USD = 25` | warn + `budget_alert:true` in response |
| Producer-token TTL | `CONFIRM_TOKEN_TTL_DAYS = 14` | 410 `link_expired` |
| Body / field caps | JSON ≤ 100 KB; string field ≤ 2000 chars | 400 `field_too_long` |
| CORS allowlist | `app.lock.show`, `lock.show`, `www.lock.show`, `localhost:5173` (env `ALLOWED_ORIGINS`) | non-allowlisted origin → no CORS headers |

**Honesty caveats (as documented in code):** the in-memory counters reset on serverless-instance
restart (accepted pilot bound, not a persistence guarantee); the monthly ledger is an **estimate**
(row count × flat per-item cost, not token accounting — real per-token accounting is **OWED**, P1);
the budget check **fails open** on a ledger-query error (an analytics hiccup must not brick the
artist loop — the in-memory daily caps still bound damage). AI budget policy is CFRO v2.8, pending
owner approval.

### 13.5.5 CSP / security headers, and the localStorage-session XSS risk

- **CSP / security headers: OWED.** There is **no** Content-Security-Policy, `X-Frame-Options`,
  HSTS, or `helmet` anywhere in the server or `vercel.json` (grep confirms zero references). Define
  a header set (CSP, HSTS, frame-ancestors for the embed, `Referrer-Policy`, `Permissions-Policy`)
  before public launch.
- **localStorage session (XSS) — OPEN.** The Supabase session (JWT) is stored in `localStorage`
  (`persistSession:true`), which is readable by any injected script. Combined with the absent CSP,
  a stored-XSS on any app surface could exfiltrate a live session. **Target mitigation:** a **BFF**
  (backend-for-frontend) that keeps tokens in httpOnly cookies and proxies Supabase — plus CSP as
  the first line. This is the recommended durable security upgrade; not built.

---

## 13.6 DB ops / environments / deploy / rollback

### 13.6.1 Environments

| Env | Data plane | API | Notes |
|---|---|---|---|
| Local dev | Supabase (shared project) or DEMO fixtures | `node server/index.js` @ :8787 (`concurrently -k` with Vite) | `DEMO` mode short-circuits db.js to fixtures; `NO_API_DEPLOY` makes the client the processor |
| Preview | isolated preview (one-time hook; previews OFF globally for quota) | Vercel serverless | Write-path URLs distributed only after G11+G12+G16 close (QA isolation) |
| Production | Supabase `qexfndiyallwqhhzeerd` | Vercel serverless (`api/index.js`) | `app.lock.show` (app) + `lock.show` (site) |

There is **one** Supabase project (no separate staging DB). Migration safety therefore leans on
additive-only + idempotent files and the frozen-021 rule rather than a throwaway staging database.

### 13.6.2 Branching, deploy train, alias-promote

- **Trunk-based:** `main` = production; short-lived `claude/<task>` work branches
  (`BRANCHING-MODEL.md`). **Current train law (rel-2026.07.13):** ONE full release train —
  canon-lock → candidate SHA → isolated preview → Q1–Q7 → owner Q8 → atomic merge → live smoke →
  tag + rollback anchor. Small frequent trunk releases resume post-launch.
- **Verify gate (`npm run verify`, Q1):** nav-contract test (34 journeys) + i18n language purity +
  real build + demo build + `next build` + `scripts/test-security-denial.mjs`. A red gate never
  ships (`RELEASE-PROCESS.md`).
- **Deploy:** `app.lock.show` auto-builds from `main`; the marketing site is triggered by its
  **deploy hook** (auto-deploy unreliable — documented workaround). Both `vercel.json` files carry
  a smart `ignoreCommand` build-skip (diff-gated) and the SPA-fallback rewrites (§13.4.4).
- **Alias-promote:** site releases are alias-promoted to the live domain (e.g. rel-site-2026.07.15-3
  → SHA `9a18249` alias-promoted, rollback anchor `6f01e56` per `VERSIONS.md`).
- **Per-track versioning:** app `rel-app-YYYY.MM.DD[-n]`, site `rel-site-YYYY.MM.DD[-n]`, embed
  mirrors app, DS = Codex semver, DB = migration head N. Every release records the DS version it
  implements.

### 13.6.3 Rollback anchors & backups

- **SHA is the authoritative rollback anchor** (git tags are LOCAL-ONLY — the integration cannot
  push tags, 403). Every deploy records its SHA (+ prior SHA) in `docs/DEPLOY-LOG.md` and
  `docs/VERSIONS.md`; Vercel retains every past deployment, so rollback = re-point production to the
  previous deployment or reset `main` to the previous SHA and redeploy.
- **Rollback rehearsal** is itself a must-pass launch row (G21, post-404 lesson).
- **Backups: OWED/OPEN.** Structural (destructive) migrations are gated on **Supabase Pro backups
  ON** (owner, ~$25/mo) — backups are the prerequisite for any structural migration (021 fold,
  workspace_type rename), NOT for additive ones like 032/035.

### 13.6.4 Migration runbook

1. Author `NNN_name.sql` + `NNN_name.down.sql`; **diff against 001–035 first** — never recreate an
   existing table (idempotent `if not exists` / `drop policy if exists` throughout).
2. Additive + idempotent unless backups are ON. Firewall check: no score/percentile/rank/head-count
   column; bands + method labels only.
3. Apply to the single Supabase project (SQL editor) **before** the code that depends on it; verify.
4. Keep 021 **frozen** until its lockstep code change (constants.js/db.js/orgs.js vocabulary) ships
   in the same wave — otherwise every AI-pipeline claim insert fails `claims_visibility_check` and
   the labeling loop silently stops writing.
5. Record the new head in `VERSIONS.md`; update analytics CANON in lockstep if event names change
   (file=DB=app).

---

## 13.7 Q8 — the production-readiness gate (definition)

"Q8" is referenced across the spec as the pre-production gate but is under-defined. Reconstructing
from `docs/releases/rel-2026.07.13-PLAN.md §4` and `docs/VERSIONS.md`:

### 13.7.1 What is actually documented (the Q1–Q8 lanes)

QA runs in **two stages; the version is invalid until all pass.** **Stage 1** (Q1–Q7) runs on the
**immutable candidate SHA on the isolated preview** — never against production. **Stage 2** is live
smoke + **Q8 = Maria's owner acceptance walk** (sole assignee, no delegate).

| # | Lane | Owner | Evidence |
|---|---|---|---|
| Q1 | Pre-deploy gate: `npm run verify` (nav 34 · i18n purity · build · demo) + `next build` | Claude | CI output in release doc |
| Q2 | Live fingerprints: served JS/pages contain this release's markers; **embed hash matches app** | Claude | fingerprint list + hashes in DEPLOY-LOG |
| Q3 | Real-browser flows: signup (email + Google), artist journey, booker link open, workspace switch, producer magic link | Cowork | screenshots + pass/fail table |
| Q4 | Mobile pass: 360px screenshots (Radar, roster, Passport, recipient flow) | Claude (Playwright demo) + Cowork (real devices) | PNGs |
| Q5 | **Firewall scan on live surfaces:** no score/%/rank/gauge; bands + binaries + method labels only | Claude | grep + visual check |
| Q6 | **Terminology scan:** 0 forbidden terms; buyer never rendered as אמרגן | Claude | scan output |
| Q7 | Version governance: VERSIONS + DEPLOY-LOG + roadmap updated; ledger row added | Claude | Cowork cross-audit |
| **Q8** | **Owner approval walk** → ledger flips to "approved" (Stage 2 production acceptance) | **Maria ONLY** | her word, recorded |

Q8-READY (the pre-condition for Maria's walk) = all lanes green on **one frozen SHA**: Cowork Q1–Q7
EN/HE + Codex Q4 + GPT delta audit + CFRO final-RC check. Rollback rule: any Q1–Q6 failure on live →
immediate redeploy of the previous SHA, fix on branch, re-run from Q1.

### 13.7.2 The Q8 owner walk — an 8-point production-readiness checklist (**PROPOSED**)

The lanes above define *who runs what*, but the **content** of Maria's Q8 walk — the concrete things
she personally confirms before saying the word — is not enumerated anywhere. The following 8-point
walk is **PROPOSED**, consistent with the firewall, the launch DoDs (`LAUNCH-DOD-2026.07.13.md`),
and the two-stage protocol. It is run by the owner on the **exact promoted SHA**, after Stage-1
Q1–Q7 are green:

1. **Firewall, seen with her own eyes.** Open a real published Passport as an anonymous buyer: no
   score / percentile / rank / gauge / "%" anywhere; draw appears only as bands + binaries + method
   labels; streaming is secondary. (Backs Q5 at the human layer.)
2. **"Nothing publishes without you."** Confirm an auto-labeled, un-reviewed claim is **invisible**
   on the public Passport until the artist approves it (`artist_approved` gate) — the single most
   important product promise.
3. **Two-view integrity.** The Artist (private) view shows gaps; the Buyer (public) view shows
   verified strengths only. The same Passport, no private gap or `mirror-only`/working-only item
   leaking into the buyer view.
4. **Terminology & language.** Hebrew buyer copy never renders the buyer as אמרגן (buyer = מזמין
   הופעות / booking manager); no forbidden score vocabulary; EN/HE parity on the P0 screens.
5. **The core loop end-to-end, live.** Artist signup → add evidence → claim labeled/reviewed →
   publish → buyer opens the link → sends an availability request → artist's bell rings. On real
   devices at 360px (backs Q3/Q4). Includes a producer magic-link confirmation upgrading a claim to
   `producer-confirmed`.
6. **Multi-Act non-transfer.** A second Act starts **empty**; evidence from Act A never appears on
   Act B's Passport; workspace/Act switch re-gates correctly and copies nothing (G3 boundary).
7. **Deep-link durability & rollback readiness.** Hard-refresh a deep app route (e.g.
   `/app/settings`) → the SPA boots, session survives, no 404 eject (the P1 fix). The prior SHA is
   recorded as the rollback anchor and a rollback rehearsal has passed (G21).
8. **Governance & legal complete.** VERSIONS + DEPLOY-LOG + roadmap updated (Q7); AI spend caps
   active; legal/privacy/accessibility pages signed off (G20a–c); pilot QA data excluded from Gate
   signal counts (G16). Only then does the ledger column flip to **approved**.

**Gate outcome:** Q8 pass = the owner's recorded word. It is the boundary between "Q8-READY" (all
lanes green on a frozen SHA) and "PRODUCTION-READY" (atomic merge + deploy + live smoke + rollback
anchor). The product-stage Gate itself (business milestone) remains: **one booking manager reacts to
a real Passport AND one pays** — measured, not required, pre-launch.

---

## 13.8 Open items & owed deliverables (consolidated)

| Ref | Type | Item |
|---|---|---|
| 13.1.1 / 13.4.4 | OWED | CI embed-sync hash gate (or single-canonical-bundle redirect) to kill embed/standalone skew |
| 13.2.1 | OPEN | 037+ authoring: fold 021 vocabulary + workspace_type rename — gated on Pro backups |
| 13.2.2 | OPEN | Live consent-scope vocabulary is the pre-021 set until 021 (or equivalent) lands |
| 13.4.2 | OWED | Org invite-token expiry (producer tokens have a 14-day TTL; invite tokens do not) |
| 13.4.2 / 13.5.5 | OWED | Producer token hashing (036 is a DRAFT; tokens are plaintext today) |
| 13.5.3 | OWED | Shared safe-select helper + CI server-payload firewall test (no RLS backstop on the service-role path) |
| 13.5.4 | OWED | Real per-token AI cost accounting (current monthly ledger is an estimate); persistent rate/daily counters |
| 13.5.5 | OWED / OPEN | CSP + security headers (none exist); BFF with httpOnly cookies to remove the localStorage-XSS session-theft class |
| 13.6.3 | OWED | Supabase Pro backups ON (prerequisite for structural migrations) |
| 13.7.2 | PROPOSED | The 8-point Q8 owner-walk content (lanes are defined; the walk's checklist is not) |

*Ambiguities flagged for the owner:* (a) migrations 027/028 carried "requires owner approval before
applying" headers — they are treated here as **applied** because 030 fixes a recursion bug that only
027 introduces and 031 depends on 022's `artist_approved`, but the live head recorded in VERSIONS is
stated as 035 without an explicit 027/028 "applied ✓" mark; confirm. (b) The `docs/canon/
B4-40.10-Technical-Spec.md` and `docs/CODEX-FUNCTIONAL-CONTRACTS.md` files exist in the tree but this
section was grounded directly in the migrations + source, which are the authoritative build; if
those canon docs assert a different value, code wins per the firewall/lockstep rules and the delta
should be reconciled.
