# DATA-LAYER GAP MAP — v9 object canon vs our schema

_Authored 9 Aug 2026 · read-only analysis, no migration authored, no code touched._
_Purpose: build the DESIGN-INDEPENDENT foundation. v9 froze the ARCHITECTURE (Information Object
Registry + the 5 non-negotiable IA rules) while the VISUALS stay open, so the object layer is safe to
build now. This doc maps every v9 canonical object to our real schema, proposes migrations 041→059,
specifies the 7 engineering contracts v9 explicitly owes engineering, and states what must wait._

**Sources — v9 canon:** `docs/reference/v9/specs/LOCK-Information-Architecture.md` (object registry
:7–25 · lineage :28 · projection matrix :35–42 · gap register :44–48 · 5 rules :50–55) ·
`LOCK-Execution-Contract.md` (D1 ruling :29 · Amendment D items 5/6/8 :37/:38/:40 · Phase 0B :67) ·
`LOCK-Screen-Registry.md` · `LOCK-Flow-Register.md` (gap summary :147–162) ·
`docs/reference/v9/handoff/HANDOFF-3-Decisions-Contracts-QA.md` (§2 decision pack D2–D7).

**Sources — our reality:** `supabase/migrations/001…040` · `src/lib/*.js` · `server/index.js` ·
`docs/LOCK-PRODUCT-SPECIFICATION.md` §13.2 / §16.A.6.a · `docs/VERSIONS.md:37`.

---

## 0 · Migration-state correction (read this first)

The brief stated "034/038/040 authored-but-NOT-APPLIED". Two of three confirmed, one is wrong:

| # | File | Real state | Evidence |
|---|---|---|---|
| 034 | `034_event_canon_unpublish.sql` | **APPLIED** | file header `:1` "AS APPLIED, reconciled by Cowork+owner 13 Jul"; `docs/VERSIONS.md:37` "034 ✓ in effect (DB CHECK = app CANON = 29 events)"; `LOCK-PRODUCT-SPECIFICATION.md` §13.2.1 row 034 "applied ✓ (**the analytics CHECK head**)" |
| 038 | `038_production_events.sql` | **AUTHORED, NOT APPLIED** | file header `:3` "⚠ AUTHORED, NOT APPLIED. Owner-gated"; `VERSIONS.md:37` "038 authored NOT applied (C6 deferred by R00 20 Jul)" |
| 039 | `039_taxonomy_registry.sql` | **APPLIED** | `VERSIONS.md:37` "039 ✓ taxonomy/Registry-B spine (owner-applied 20 Jul 2026, verified: `genre_family` count = 8)". NB the file header still says "NOT APPLIED" — the header is stale, VERSIONS.md is the record. |
| 040 | `040_buyer_funnel_events.sql` | **AUTHORED, NOT APPLIED** | file header `:1` "AUTHORED NOT APPLIED — owner applies"; not listed as applied in `VERSIONS.md:37` |

Also live-relevant: **021 is permanently FROZEN** (`021_vocabulary_and_consent.sql:1–17` — applying it
breaks the running claim pipeline because `db.js` still writes `mirror-only`), **036 is `.DRAFT`**
(plaintext producer tokens still in effect, `005_producer_confirmations.sql:16`), and **018 rolled back
entirely** — `019_repair_professional_reaction.sql:1–31` is the live definition of
`professional_reaction` / `reaction_reason` / `opportunity`. **Live head = 039.**

Everything below assumes the next free number is **041** and that 038 + 040 are applied by the owner
before the migrations that depend on them (flagged per card).

---

## A · OBJECT-BY-OBJECT MAP

Verdict key: **EXISTS** = shape supports the v9 contract with cleanup only · **PARTIAL** = a table
exists but is missing states/versioning/visibility the canon requires · **MISSING** = no storage at all.

Tally: **EXISTS 2 · PARTIAL 11 · MISSING 5** (18 objects).

---

### A1 · Act — **EXISTS**

| | |
|---|---|
| **v9** | Owner Artist · source signup+scan confirm · Raw · state `active` · not versioned · visibility "all (identity only)" · appears on every screen (`LOCK-Information-Architecture.md:9`) |
| **Ours** | `public.act` — `020_acts_spine.sql:41–64`: `id · person_id · organization_id · stage_name · genre · city · positioning(≤120) · photo_url · video_url · music_links[] · tech_info · contact · artist_goal · format · alias · is_default · community_count_declared · created_at · updated_at`. `act_id` threaded through 11 child tables (`020:89–99`) with backfill (`020:101–111`) + indexes (`020:113–123`) + transition triggers (`020:127–177`). Taxonomy wiring `act.scene_id → genre_scene` (`039:74`), `act.stage_name_he` (`028:41`). RLS `act_org` / `act_operator_read` (`020:186,191`), anon column grants + `act_public_read` (`025:41,49`). |
| **Verdict** | **EXISTS.** Multi-Act canon (per-Act evidence, non-transferable) is structurally in place. |
| **Delta** | (1) `act.id = artists.id` coupling and the `artists`-row-is-still-the-anchor transition (`020:66–84`, `025:49` reads `artists.published`) means a **second Act on the same Person has no `artists` row and therefore no publish gate** — the published flag must move to `passport_version` (see A7). (2) No `status` column — `active` is implicit; add `status text check (active·archived)` if a dormant-act rule ever lands (open question C3 in `LOCK-Open-Decisions.md:150`). (3) `is_default` defaults `true` for every insert (`020:60`) — no uniqueness constraint per `person_id`; add partial unique index `(person_id) where is_default`. |

---

### A2 · Claim (professional fact) — **PARTIAL**

| | |
|---|---|
| **v9** | Owner Artist-per-Act · Raw→Confirmed · states `candidate · confirmed · stale · conflict` · **versioned: yes** · 90d review nudge · private until approved (`LOCK-IA.md:10`). Vocabulary law: user-visible wording is professional, internal names stay for code (`LOCK-Execution-Contract.md:35`). |
| **Ours** | `public.claims` — `001:73–92` (`claim_type · value · source_type · verification_status{verified·supporting·self-reported·not-assessable} · visibility{passport-ok·mirror-only·internal} · extraction_method · model_version · internal_confidence (DB-only) · reason_code · expires_at`), `method_label` (`005:12`), depth fields (`022:24–32`: `public_band · public_wording · limitation_text · artist_approved (default false) · source_timestamp · status{submitted·processed·source-supported·published·self-reported·not-assessable·stale·disputed}`), `act_id` (`020:89`), `field_id → evidence_field` + `extraction_provenance` (`039:75,78`). Public gate `claims_public_read` requires `artist_approved = true` (`031:24–30`). Anon column grants `016:26–28` + `025:26`. |
| **Verdict** | **PARTIAL.** The approval gate and the method/limitation fields are correct and firewall-clean. Versioning and two of four canonical states are absent. |
| **Delta** | **Columns:** `review_due_at timestamptz` (the 90-day nudge — `expires_at` is the evidence TTL, a different clock) · `superseded_by uuid → claims(id)` + `version_no int` (v9 "Versioned: yes") · `published_in_version_id uuid → passport_versions(id)` and `published_value_hash text` (this alone closes Flow-Register gap #7 "published vs newer cue per fact", listed as *buildable now, blocked on nobody*, `LOCK-Flow-Register.md:154`). **Enum:** widen `claims.status` CHECK with `candidate` and `conflict` (`disputed` ≠ `conflict`: disputed = a person contests, conflict = two sources disagree). **New table:** `claim_conflict (id · act_id · field_id · claim_a · claim_b · state{open·resolved} · resolved_claim_id · detected_at)` — v9 requires "two sources disagree" as a first-class state, not a flag. **Index:** `(act_id, field_id, status)`, `(act_id) where review_due_at < now()`. **RLS:** unchanged (031 gate already matches rule 5). |

---

### A3 · Source / Evidence — **PARTIAL**

| | |
|---|---|
| **v9** | Owner System · platform APIs/links/uploads · states `linked · processing · failed` · **versioned: yes** · per-platform freshness · lives in the provenance layer L5 (`LOCK-IA.md:11`; L1/L2/L3 law `Execution-Contract:34`) |
| **Ours** | `public.evidence_artifacts` — `001:58–70` (`evidence_type{file·link·band} · source_type · value · file_url · public_url · status{submitted·processed·error}`), depth `022:35–41` (`claim_intent · source_owner_consent · checksum · retention_policy · platform · pii_scrubbed`), discovery `028:24–35` (`discovered` source type · `discovery_source_url · discovery_query · same_person_state{unreviewed·artist-confirmed·artist-dismissed}`), `act_id` `020:90`. Extraction runs tracked in `public.processing_job` (`022:45–57`: `evidence_artifact_id · status{queued·running·completed·failed} · model_version · ruleset_version · error_message · started_at · completed_at`), RLS `pj_org_read` / `pj_operator_read` (`022:64,72`). |
| **Verdict** | **PARTIAL.** State machine is spread across two tables and does not name `linked`; there is no version of a source, and no per-platform freshness clock. |
| **Delta** | **Columns on `evidence_artifacts`:** `link_state text check (linked·processing·failed)` (a projection-friendly single state, derived-or-set, distinct from `status`) · `last_checked_at timestamptz` · `refresh_due_at timestamptz` · `source_version int default 1` · `superseded_by uuid → evidence_artifacts(id)`. **New table:** `source_platform` (already specified in `LOCK-PRODUCT-SPECIFICATION.md` §16.A.6.a step 1 but **not created by 039** — 039 shipped `genre_family · family_planet · genre_scene · evidence_field · registry_b` only, `039:30–71`) carrying `id · en_label · he_label · planet_key · source_type · is_israeli · default_freshness_window · active`. **Index:** `(act_id, platform)`, `(refresh_due_at) where refresh_due_at is not null`. |

---

### A4 · Confirmation — **PARTIAL**

| | |
|---|---|
| **v9** | Owner Confirmer · magic-link response · states `open · answered · wrong-person · expired` · one-shot · strengthens a claim only · Confirmer sees "one bounded statement", never a claim (`LOCK-IA.md:12`; `LOCK-Screen-Registry.md:77` "claim → bounded attestation statements") |
| **Ours** | `public.producer_confirmations` — `005:14–24` (`token (PLAINTEXT, unique) · claim_id · artist_id · producer_contact · response{yes·partial·no·wrong_person} · revoked · responded_at`), enrichment `019:101–109` (`authority_type · name_visibility{public·initials·anonymous} · identity_verified · conflict_of_interest · offline_confirmation_source`), `act_id` `020:95`, `organization_id` `008:120`. RLS read-only for owner/operator (`005:31,35`); all writes are server service-role (`server/index.js:711` mint, `:747` GET, `:772` POST). Expiry lives only in server env `CONFIRM_TOKEN_TTL_DAYS`, not in the row. |
| **Verdict** | **PARTIAL.** The record exists and is correctly server-mediated; the canonical state machine and expiry are not stored, the token is plaintext, and the attestation text is not a stored object. |
| **Delta** | **Columns:** `state text check (open·answered·wrong-person·expired)` (derivable today but v9 wants it as an object state, and "expired" is currently uncomputable from the row) · `expires_at timestamptz` · `attestation_statement text` (the ONE bounded sentence shown to the confirmer — today the confirmer screen renders a claim, which `Screen-Registry:77` rules must change) · `token_hash text` + unique index, adopting `036_token_hash.sql.DRAFT` verbatim with its documented 4-step dual-read rollout. **RLS:** none new (server-mediated). |

---

### A5 · Radar insight / Next Move — **PARTIAL** ⚠ firewall-relevant

| | |
|---|---|
| **v9** | Owner System (derived) · Derived+Interpreted · states `current · done` · recomputed · **Artist-private ONLY** · Rule 5: "Interpretation (Radar) is Artist-private; only confirmed+approved facts travel outward" (`LOCK-IA.md:13`, `:55`). Projection matrix allows Rep "summary via Panel (no private gaps)" (`LOCK-IA.md:37`). |
| **Ours** | `public.radar_signal` — `010:9–24` (`organization_id · artist_id · rule_id{R1..R8} · status{strong·developing·missing·notAssessable} · action_type · evidence_basis · method_label · signal_date · demand_request_id · dismissed`, unique `(organization_id, artist_id, rule_id)`), `act_id` `020:98`. Materialized by `recompute_radar_for_org()` (`010:37–84`) + 4 feeding triggers (`010:98–109`). Client rule engine is canonical (`src/lib/radar.js`, `src/lib/radarUniverse.js`); org inputs via `orgs.js:408 getRadarInputs`. |
| **Verdict** | **PARTIAL — with a rule-5 exposure.** |
| **Delta / finding** | `recompute_radar_for_org` inserts rows **for every org holding an active `artist_access` grant** (`010:46,56,67,79` all join `artist_access`), and the RLS policy is `organization_id in current_org_ids()` (`010:28`) — so **any rep org with a `view` grant reads the artist's full private Radar interpretation**, including `status='missing'` gap signals. There is even a shipped screen for it (`/agency/radar` → `RadarFeed`, `src/App.jsx:207`). v9 says gaps are artist-private and the Rep sees a *summary without private gaps*. **Delta:** add `audience text check (artist_private·rep_summary) default 'artist_private'` on `radar_signal`, split the policy so rep orgs read only `audience='rep_summary'`, and mark the *tightening* as a **BREAKING change requiring owner sign-off** (it removes information from a screen that exists today). Additive half (the column + the summary rows) is safe now; the policy flip is the gated half. |

---

### A6 · Scene benchmark — **MISSING (correctly)**

| | |
|---|---|
| **v9** | "**RESERVED — not a canonical object until D4**" · dataset undecided · Derived · Artist-private · Scene screen shows a SAMPLE state (`LOCK-IA.md:14`). D4 recommendation: gated, marked DEMO DATA, same family+territory cohorts only, never a rank/score (`HANDOFF-3:43–44`). |
| **Ours** | **NONE.** No cohort/benchmark table in 001–040. The Scene surface reads client-side universe data (`src/lib/radarUniverse.js`, `registryUniverse.js`). Owner question B2 ("where does n=42 come from") is still open (`LOCK-Open-Decisions.md:141`). |
| **Verdict** | **MISSING — and must stay missing.** |
| **Delta** | None to build. When D4 rules: `scene_cohort (id · family_id → genre_family · territory · min_sample · source_note · computed_at)` + `scene_cohort_fact (cohort_id · field_id · band_value · method_label)` — **bands only, never a rank, percentile or n-of-N position.** Do not author before D4. |

---

### A7 · Passport version (published view) — **PARTIAL** ⚠ largest single gap

| | |
|---|---|
| **v9** | Owner Artist · from approved claims + recipient policy · states `draft · preview · review · published · superseded` · **versioned** · age shown in Library · visibility per-recipient-policy (`LOCK-IA.md:15`). Passport split into 5 surfaces is a LOCKED architecture decision (`HANDOFF-3` LOCKED #3). "Publish = redact + reorder, never mutate meaning" (rule 2). Flow-Register gap #4: "version store (history/restore/superseded open) ⚙ blocked on storage" (`:153`). |
| **Ours** | `public.passport_versions` — `001:124–129`: **`id · artist_id · snapshot jsonb · created_at` and nothing else.** `+organization_id` (`008:119`), `+act_id` nullable, trigger-filled (`020:93`, `020:147`). Insert-only by design (`001:122`); owner insert policy `pv_owner_insert` (`017:18`); public read `pv_public_read using artist_is_published(artist_id)` (`001:210`). The publish action is `artists.published = true` + a best-effort snapshot insert (`src/lib/db.js:572–586`) — the snapshot is explicitly *deferrable* and publishing succeeds without it. "Unpublished changes" is a **localStorage flag**, not data (`src/lib/passportState.js:6–18`). |
| **Verdict** | **PARTIAL — closer to a log than a version store.** No state, no ordering, no current pointer, no supersede link, no policy binding, no diff basis. |
| **Delta** | **Columns:** `version_no int not null` (unique per act) · `state text check (draft·preview·review·published·superseded)` · `supersedes_id uuid → passport_versions(id)` · `published_at`, `superseded_at`, `withdrawn_at timestamptz` · `recipient_policy_id text → recipient_policy(id)` (A7b) · `created_by uuid → person(id)` · `label text` (artist's own name for the view) · `content_hash text` (diff basis for Publish Review `ART-PAS-030`). **Constraints:** partial unique `(act_id) where state='published'` per policy — i.e. unique `(act_id, recipient_policy_id) where state='published'`; `act_id` becomes NOT NULL once the act-first cutover lands. **RLS:** `pv_public_read` must be **narrowed from "any snapshot of a published artist" to "the one version a live share link binds"** — today anon can read *every* historical snapshot including superseded ones (`001:210`, and `025` does not revoke anon SELECT on `passport_versions`). That is a direct breach of rule 3 and is the single highest-value fix in this document. **New table (A7b) `recipient_policy`:** `id{booker·producer·private·programmer·brand·rep} · en_label · he_label · hero_emphasis_key · cta_key · depth · sort_order · active` — the six policies are IA-fixed (`LOCK-Screen-Registry.md:72`), the *field mapping* is content. Plus `policy_field_budget (policy_id · field_id → evidence_field · budget text check (must_know·useful·on_request·irrelevant))` per Amendment D item 10 (`Execution-Contract:42`). |

---

### A8 · Share link — **PARTIAL** ⚠ rule-3 breach

| | |
|---|---|
| **v9** | Owner Artist · states `live · expired · revoked` · **binds one version + one policy** · expiry optional **including endless** · **one link = one view** (`LOCK-IA.md:16`, rule 3 `:53`). Dead-link needs **6 states**: expired / revoked / replaced / unpublished / withdrawn / wrong-recipient (`LOCK-Screen-Registry.md:74`). Flow-Register: "link service backend ⚙" (`:34`). |
| **Ours** | `public.share_link` — `024:18–34` (`passport_version_id NOT NULL · artist_id · act_id · recipient_label · context · tracking_disclosed · expiry · utm_* · status{active·expired·revoked} · opened_at · open_count`), indexes `024:35–36`, RLS org-all + operator-read (`024:45,49`), anon SELECT **revoked** (`025:56`). Companion `passport_view_event` (`024:53–61`). |
| **Verdict** | **PARTIAL — and unused.** `grep` across `src/` + `server/` finds **zero reads and zero writes of `share_link`** (only the analytics *event names* `share_link_created` / `share_link_opened` exist, `src/lib/analytics.js:143–144`). |
| **Delta / finding** | The live public route is **`/passport/:id` keyed on artist id** (`src/App.jsx:155`), reading live rows via RLS (`src/lib/db.js:513 getPublicPassport`). So today: **any published artist's Passport is world-readable without a link, is not bound to a version, and is not bound to a policy.** Rule 3 ("one link = one recipient view = one version") is architecturally not implemented. **Columns needed:** `token_hash text unique` + `slug text unique` (the link handle — `id` cannot be the handle while anon has no SELECT) · `recipient_policy_id` · `expiry_kind text check (date·endless)` · `revoked_at · replaced_by uuid → share_link(id)` · `wrong_recipient_at timestamptz`. **Enum:** widen `status` to the 6 dead-link states `live · expired · revoked · replaced · unpublished · withdrawn` + `wrong-recipient` as a 7th terminal (v9 lists 6 *dead* states; `live` is the 7th total). **RPC:** `resolve_share_link(p_token text)` SECURITY DEFINER returning the bound version + policy + a dead-state reason — the only anon read path. **RLS:** keep anon SELECT revoked; all resolution through the RPC. |

---

### A9 · Enquiry / Thread — **PARTIAL (thread object MISSING)**

| | |
|---|---|
| **v9** | "canonical Thread" · booking sheet / channels · states `needs-reply · waiting · done` · staleness on event date · **Artist + mandated Rep projections, no copies** (`LOCK-IA.md:17`; Phase 0B "Canonical Thread (one thread, per-workspace projections; no copies)" `Execution-Contract:67`; standing ruling "Enquiry→Thread owns (inboxes are permission-scoped projections)" `:70`). Universal Inbox grammar `Needs reply · Waiting · Done` (`:63`). Object ownership law: Notification ≠ Inbox ≠ Thread ≠ Case (`HANDOFF-3` LOCKED #7). |
| **Ours** | `public.availability_requests` — `001:95–108`: a **one-shot form**, `requester_name · requester_org · event_date · event_type · location · capacity_band · budget_band · message · status{new·replied·closed}` + `organization_id` (`008:118`) + `act_id` (`020:94`). Anon insert against a published artist (`001:194`), owner read/update (`001:197,200`). Server path `POST /api/availability-request` (`server/index.js:646`) also writes the artist notification. Rep-side read RPC `list_production_requests()` (`032:45`). No message table, no participants, no sender identity, no guest continuation. |
| **Verdict** | **PARTIAL** — the enquiry *ingest* exists; the canonical Thread does not. |
| **Delta** | **New tables:** `thread (id · act_id · subject_kind text check (booking·access·disclosure·approval·internal) · state text check (needs_reply·waiting·done) · waiting_on text check (artist·rep·buyer·production) · event_date date · last_activity_at · created_at)` · `thread_participant (thread_id · party_kind check (artist·rep·production·recipient·confirmer) · person_id nullable · organization_id nullable · display_identity text · guest_token_hash text)` — **`display_identity` is the D1 "sender identity always disclosed" field** (`Execution-Contract:29`) · `thread_message (id · thread_id · author_participant_id · body · sent_by_person_id · on_behalf_of_organization_id · draft boolean · approved_by_person_id · approved_at · sent_at · channel text)` — `draft/approved_by` is the D1 Draft-vs-Send-Act mechanism at the message level. **Bridge column:** `availability_requests.thread_id uuid → thread(id)` (additive; existing rows backfill to one-message threads). **Index:** `(act_id, state, last_activity_at desc)`. **RLS:** artist's org full; rep org gated on `mandate_capability` (A10) — the *projection* is a policy, never a copied row. |

---

### A10 · Mandate (rep authority) — **PARTIAL** ⚠ D1 not modelled

| | |
|---|---|
| **v9** | Owner: Artist grants · states `requested · granted · declined · revoked · expired` · **audit log** · expiry including endless · artist decides unilaterally; rep sees the grant only (`LOCK-IA.md:18`). **D1 RULED:** default = no implicit authority; 3 levels **View / Draft / Send-Act**; authority scoped **separately** across **availability · commercial negotiation · Passport sharing · sensitive disclosure · production handoff** — "never one 'has access' switch"; assistants draft only unless explicitly granted send; expired/revoked → future authority stops immediately, **history stays auditable** (`Execution-Contract:29`). |
| **Ours** | `public.artist_access` — `008:58–67` (`organization_id · artist_id · access_level{manage·view} · consent_record_id · status · unique(org, artist)`), extended `027:97–120` (`scope text[] <@ {view,upload,edit,share,publish}` · `territory` · `expires_at` · `consent_at` · `status{pending·active·revoked·disputed}` default `pending`). Read gate `can_access_artist()` honours status+expiry+`view` scope (`027:166–178`); narrower helper `artist_access_has_scope(a, needed)` (`027:183`). RPCs `request_artist_access` (`027:235`), `list_incoming_access_requests` (`027:256`), `respond_to_access_request` (`027:275`), `revoke_artist_access` (`027:300`). App: `src/lib/orgs.js:279,313,326,338`. |
| **Verdict** | **PARTIAL — the handshake is real, the D1 authority model is not.** |
| **Delta / findings** | (1) **Scope axis is wrong.** Ours is a *data-operation* enum (view/upload/edit/share/publish); D1's is a *business-capability* enum (availability / commercial / passport_sharing / sensitive_disclosure / production_handoff) crossed with a *level* (view/draft/send_act). These are orthogonal; the fix is **additive**, not a rewrite. (2) **`declined` is lost** — `respond_to_access_request(p_approve=false)` writes `status='revoked'` (`027:293`), collapsing two distinct v9 states. (3) **`expired` is not a stored state** — it is only computed inside `can_access_artist()`; a rep sees no "expired" chip. (4) **No mandate audit trail** — `audit_log` (`011:6–15`) exists but is operator-only RLS (`011:19`) and has no writer for access changes; v9 requires "history stays auditable" *to the artist*. **New table:** `mandate_capability (id · artist_access_id → artist_access(id) · capability text check (availability·commercial·passport_sharing·sensitive_disclosure·production_handoff) · level text check (view·draft·send_act) · granted_at · granted_by · revoked_at)` — one row per capability, so revoking one never touches the others. **New table:** `mandate_event (id · artist_access_id · event text check (requested·granted·declined·narrowed·renewed·revoked·expired) · actor_person_id · capability · level_before · level_after · at)` — append-only audit both sides can read. **Enum:** widen `artist_access.status` with `declined` and `expired`; keep existing values (additive). **Function:** `has_mandate(a uuid, cap text, min_level text)` alongside the existing `artist_access_has_scope`, so new policies never re-touch `can_access_artist()`. |

---

### A11 · Opportunity Case — **MISSING** ⚠ name collision

| | |
|---|---|
| **v9** | Owner Representation · created by promoting an enquiry · Raw + Derived verdict · states `active · waiting · decision · confirmed · closed` · waiting-owner shown · rep-internal; the artist sees approval asks only (`LOCK-IA.md:19`). Domain states also enumerated `ACTIVE · WAITING-BUYER · WAITING-ARTIST · DECISION · CONFIRMED · CLOSED` (`Execution-Contract:131`). Production sees a **booking-context projection of the SAME object**, never a copy (`Execution-Contract:71`; `Screen-Registry:66` PRO-EVT-060 "same case record as REP-OPP-010"). |
| **Ours** | **NONE for this object.** `public.opportunity` (`019:75–87`) is a *different thing* — a demand-side posting owned by a buyer org (`organization_id · event_type · venue · date_range · territory · capacity_band · budget_band · status{open·filled·cancelled·expired}`), referenced by `professional_reaction.opportunity_id` (`019:39`). It carries no act, no thread, no waiting-owner, no artist-approval ask. |
| **Verdict** | **MISSING.** The v9 Opportunity Case has no storage; the name `opportunity` is already taken by an unrelated object. |
| **Delta** | **New table — call it `booking_case`, not `opportunity_case`,** to avoid the collision: `id · organization_id (rep) · act_id · thread_id → thread · event_reference (production_event_id nullable, slot_id nullable) · state text check (active·waiting_buyer·waiting_artist·decision·confirmed·closed) · waiting_owner text check (rep·artist·buyer·production) · closure_reason text · opened_at · decided_at · closed_at`. **New table:** `case_approval (id · case_id · kind text check (send_message·share_passport·disclose·agree_terms·handoff) · requested_by · requested_at · decided_by · decided_at · decision text check (approved·declined))` — this is what the artist actually sees ("the artist sees approval asks"). **Index:** `(organization_id, state, waiting_owner)`. **RLS:** rep-org members full; artist's org sees **only** the `case_approval` rows for their act (a projection policy, not a copy). |

---

### A12 · Offer matrix (floors) — **MISSING**

| | |
|---|---|
| **v9** | Owner Representation · agency settings · Raw · not versioned · **NEVER to recipient (firewall)** · shown on the Case only (`LOCK-IA.md:20`). Projection matrix: Artist "sees own", Rep "full", Recipient `"on request" at most (D2)` (`LOCK-IA.md:40`). Parked-but-adopted E2 "Tiered offer matrix — price ranges and terms per recipient type: corporate / private / municipality / club" (`LOCK-Open-Decisions.md:175`). |
| **Ours** | **NONE.** `artists.price_band` (`001:35`) is a single global band, anon-granted (`016:16`); `opportunity.budget_band` (`019:83`) is the buyer's side. No per-recipient-tier structure exists. |
| **Verdict** | **MISSING.** |
| **Delta** | **New table:** `offer_tier (id · organization_id · act_id · recipient_class text check (corporate·private·municipal·club·festival·brand) · fee_floor_band text · terms_note text · payment_terms text check (immediate·shotef30·shotef60·shotef90) · active · updated_at · updated_by)`. **Firewall — hard requirements:** (a) `REVOKE ALL … FROM anon` in the same migration, no exceptions; (b) no column may hold an exact fee — `fee_floor_band` is a band string like the rest of the draw model (`001:31` comment, `008:101`); (c) the recipient-visible surface is a **derived "on request" flag**, never a joined row — and that flag's lifecycle is **D2-gated**. **RLS:** rep org only + artist's own org read (matrix row "Artist sees own"). |

---

### A13 · Event — **PARTIAL (authored, not applied)**

| | |
|---|---|
| **v9** | Owner Production · new-event flow · states `draft · upcoming · live · done` · date-driven · production-internal; **the brief travels in the invite link** (`LOCK-IA.md:21`). Adopted-as-canon six operational objects: Event · Event Day · Venue · Performance Area/Stage · Slot · Artist Assignment (`LOCK-Open-Decisions.md:110`). Production domain states `PLANNING·ADVANCING·PRE-LIVE·LIVE·DELAYED·ISSUE·COMPLETE` (`Execution-Contract:131`). |
| **Ours** | `public.production_event` — `038:28–36` (`organization_id · name · event_date · venue · created_by`), **AUTHORED NOT APPLIED**. RLS `pe_org_read` / `pe_admin_write` (`038:77,80`) + `can_access_production_event()` (`038:63`). Artist-side `public.gigs` (`008:85–95`) is a different object (the act's own track record) with closeout depth (`023:23–41`). App groups gigs client-side into pseudo-events (`src/lib/orgs.js:456 groupGigsIntoEvents`) — a placeholder. |
| **Verdict** | **PARTIAL** — a minimal event table is written but unapplied, and lacks state, days and stages. |
| **Delta** | **Apply 038 first.** Then: **columns** on `production_event` — `state text check (draft·upcoming·live·done)` · `phase text check (planning·advancing·pre_live·live·delayed·issue·complete)` · `first_day date · last_day date` · `setting text check (indoor·outdoor)` · `expected_crowd_band text` (band, never a number) · `live_started_at · live_ended_at timestamptz` (the show-day activation record, contract 5) · `curfew_time time`. **New tables:** `event_day (id · event_id · day_no · date · doors_at · end_at)` · `event_stage (id · event_id · name · sort_order)`. **Index:** `(organization_id, state, event_date)`. |

---

### A14 · Slot — **PARTIAL (authored, not applied)**

| | |
|---|---|
| **v9** | Owner Production (owns changeover) · lineup board · states `open · shortlist · case · confirmed · advancing · done` · **candidate artists see the brief only** (`LOCK-IA.md:22`). Adopted-as-canon: "Slot as a *demand brief*, artists linked via **assignment records**, never artist_1/2/3" + `slot_status` and `candidate_status` ladders with named closure reasons (`LOCK-Open-Decisions.md:110–111`). |
| **Ours** | `public.lineup_slot` — `038:43–55` (`event_id · label · set_start · set_end · state{open·requested·confirmed} · act_id nullable · availability_request_id`, constraint `confirmed ⇒ act_id not null`), **AUTHORED NOT APPLIED**. RLS rides the event (`038:86,89`). |
| **Verdict** | **PARTIAL** — 3 of 6 states, and the act is attached by a direct FK rather than an assignment record. |
| **Delta** | **Enum:** widen `lineup_slot.state` to `open · shortlist · case · confirmed · advancing · done` (keep `requested` as a tolerated legacy value, the 027 pattern at `027:206–210`). **Columns:** `event_day_id · event_stage_id` (FKs to A13's new tables) · `changeover_minutes int` (v9: "owns changeover") · `brief_text text` (what a candidate sees) · `closure_reason text`. **New table:** `slot_candidate (id · slot_id · act_id · status text check (suggested·shortlisted·case_open·offered·confirmed·declined·withdrawn) · booking_case_id → booking_case · closure_reason · added_at)` — this is the assignment record; `lineup_slot.act_id` stays as a denormalised "confirmed act" pointer. **Firewall:** `slot_candidate` carries NO fit score — "fit reason" is method-safe text in the UI layer, never a stored number (`038:20–24` already states this law). |

---

### A15 · Advance item — **MISSING**

| | |
|---|---|
| **v9** | Not a row in the Object Registry table, but a first-class object in the screens and in Amendment D item 6 — **"Event-wide Advance (biggest new build)": two modes over ONE dataset, grouped PERFORMANCE / MOVEMENT / PLACE / MATERIALS across acts, plus an act-detail projection, inside the Event workspace** (`Execution-Contract:38`; `Screen-Registry:64` PRO-EVT-040; Amendment C ruling "progress is operational — '14 of 17 cleared', **NEVER a % readiness score**", `Execution-Contract:50`). |
| **Ours** | **NONE.** No advance table in 001–040. |
| **Verdict** | **MISSING.** |
| **Delta** | **New table:** `advance_item (id · event_id · act_id nullable (null = event-wide) · group text check (performance·movement·place·materials) · title · state text check (open·waiting·cleared·blocked) · waiting_on text check (artist·rep·production·venue·supplier) · owner_person_id · asset_version_id → professional_asset_version (A16) · due_at · cleared_at)`. **Firewall constraint:** no percentage/score column — the "14 of 17 cleared" line is a COUNT computed at read time from `state`. **Index:** `(event_id, group, state)`, `(event_id, act_id)`. **RLS:** production org write; the act's org reads only rows for its own act. |

---

### A16 · Professional Asset (rider / plot) — **MISSING**

| | |
|---|---|
| **v9** | Owner Artist/Act · upload · states `current · superseded` · **versioned ⚙ version store** · **"newer exists" flag to Production** · event-scoped review refs (`LOCK-IA.md:23`). Phase 0B law: `Act Asset → Version → Event Reference → Event Review`; **"production never overwrites the artist's canonical asset"** (`Execution-Contract:67`). §10: files are professional objects — preview · version · owner · source · date · freshness · rights · visibility · impact (`Execution-Contract:123`). Flow-Register gap #6 "Asset diff v3→v4 ⚙+📋 blocked on version store" (`:154`). |
| **Ours** | **NONE as an object.** `artists.rider_url text` (`001:29`, private — not in the anon grant list `016:15–17`) and `act.tech_info text` (`020:52`, not anon-granted `025:43`). Files otherwise live in the `evidence` storage bucket (`001:218,228`). No version, no owner-vs-reviewer split, no "newer exists". |
| **Verdict** | **MISSING.** |
| **Delta** | **New tables (the version store, contract 1's second half):** `professional_asset (id · act_id · kind text check (rider·stage_plot·press_photo·live_video·offer·other) · title · current_version_id · created_at)` · `professional_asset_version (id · asset_id · version_no · file_path · checksum · mime · rights_note · state text check (current·superseded) · uploaded_by · uploaded_at · superseded_at)` · `asset_event_reference (id · event_id · act_id · asset_version_id · referenced_at)` — Production points at a **version**, never at the asset · `asset_event_review (id · reference_id · reviewer_person_id · state text check (pending·accepted·issue) · note · reviewed_at)`. **Derived, not stored:** "a newer version is live" = `reference.asset_version_id <> asset.current_version_id`. **RLS:** act's org writes the asset + versions; production org reads only versions referenced by its own events, and writes only `asset_event_review`. |

---

### A17 · Gate signal — **EXISTS (as three separate stores — which is the requirement)**

| | |
|---|---|
| **v9** | Owner Admin (read-only) · from instrumentation · Derived · **`reaction / intent / verified-paid` — never merged** · **not-measured ≠ 0** · admin only (`LOCK-IA.md:24`; rule 4 `:54`; CFRO item (a) "Admin Gate tile → 3 columns: reaction / payment intent / verified payment — intent never conflated", `HANDOFF-3` CFRO cross-check). |
| **Ours** | Three stores, correctly unmerged: **reaction** → `professional_reaction` (`019:35–57`, `action_type` 7-value bounded set, anon insert, `idempotency_key unique`) + `reaction_reason` (`019:61–70`, `free_text` INTERNAL ONLY) + `passport_signals` (`006:8–15`) + `passport_view_event` (`024:53–61`, with the explicit law "a view is NOT a professional reaction", `024:6–7`). **Intent** → `entitlements` (`007:7–17`, `status{pending·active·cancelled}` — pending = intent). **Verified-paid** → `entitlements.status='active'` set only by an operator (`007:33`). Product telemetry → `analytics_event` (`024:86–103`; CHECK head `034` applied = 29 names; `040` would add 4 more, unapplied) + `is_demo` (`037`) + partial index (`037:58`). Read layer `src/features/admin/gateCounts.js`. |
| **Verdict** | **EXISTS.** Storage satisfies the "never merged" rule. |
| **Delta** | **No new tables.** Two read-layer deltas: (1) a `gate_signal_v` **view** exposing the three columns side by side with an explicit `not_measured` sentinel distinct from `0` (rule 4) — a view, not a table, so no merged row can ever be written; (2) apply **040** so the four buyer-funnel event names stop failing the live CHECK (they currently degrade to the localStorage ring buffer only — `040:17–21`). Also: `professional_reaction.share_link_id` exists as a bare uuid with **no FK** (`019:41` "future") — add the FK once A8's link service is real. |

---

### A18 · Show outcome / learning — **PARTIAL (D6-gated)**

| | |
|---|---|
| **v9** | Owner Production → System · close-out · Raw→Derived · **states ⚠ D6 — retention policy undecided** · learning-relevant only returns to Radar/Growth (`LOCK-IA.md:25`). **Lineage warning:** "terminal arrow is UNGROUNDED until D6 is ruled: do not render the learning-loop-back on any artist-facing surface before then" (`LOCK-IA.md:28`). D6 recommendation: persist only counterparty-confirmable facts — performed Y/N, date, stage, set length, changeover-as-delivered; no ratings, no internal notes leaving the workspace (`HANDOFF-3:40–41`). Amendment D item 8: close-out captures actual times / incidents / final assets / learnings → feeds Growth (data contract ⁉). |
| **Ours** | `public.gigs` closeout fields — `023:36–41` (`closeout_status{pending·completed·skipped} · attendance_band · settlement_band · ticket_attribution_confirmed · repeat_booking_signal`) plus `023:25–34` (`role_at_event · audience_band · band_means{sold·scanned·attended·attributed-via-link} · sells_events_self · exact_count 🔒 working-only`). Firewall grants keep `exact_count`, `settlement_band`, `ticket_attribution_confirmed`, `repeat_booking_signal` un-SELECTable by anon (`025:30–37`). Analytics event `gig_evidence_refresh_completed` (`034:15`). |
| **Verdict** | **PARTIAL** — the artist-side closeout exists and is firewall-correct; the production-side close-out and the D6-bounded fact set do not. |
| **Delta (author only after D6)** | **New table:** `show_outcome (id · event_id · slot_id · act_id · performed boolean · performed_date date · stage_name · set_length_minutes int · changeover_as_delivered_minutes int · confirmed_by_person_id · confirmed_at)` — **exactly the D6-recommended field list, nothing more**; no rating column, no free-text note that could leave the workspace. Feed to Radar is a **read** of confirmed rows, never a copy. |

---

### A · Summary table

| # | Object | Verdict | Our table (migration) | Blocking decision |
|---|---|---|---|---|
| 1 | Act | **EXISTS** | `act` (020, 039) | — |
| 2 | Claim | PARTIAL | `claims` (001, 005, 022, 039) | — |
| 3 | Source/Evidence | PARTIAL | `evidence_artifacts` + `processing_job` (001, 022, 028) | — |
| 4 | Confirmation | PARTIAL | `producer_confirmations` (005, 019) | — |
| 5 | Radar insight | PARTIAL ⚠ | `radar_signal` (010) | rep-summary scope (owner) |
| 6 | Scene benchmark | **MISSING** (correct) | NONE | **D4** |
| 7 | Passport version | PARTIAL ⚠ | `passport_versions` (001, 017) | — |
| 8 | Share link | PARTIAL ⚠ | `share_link` (024) — **unused** | — |
| 9 | Enquiry/Thread | PARTIAL | `availability_requests` (001) | A3 rep-reply routes |
| 10 | Mandate | PARTIAL | `artist_access` (008, 027) | — (D1 is RULED) |
| 11 | Opportunity Case | **MISSING** | NONE (`opportunity` = different object) | — |
| 12 | Offer matrix | **MISSING** | NONE | **D2** for recipient side |
| 13 | Event | PARTIAL | `production_event` (038, unapplied) | — |
| 14 | Slot | PARTIAL | `lineup_slot` (038, unapplied) | — |
| 15 | Advance item | **MISSING** | NONE | — |
| 16 | Professional Asset | **MISSING** | `artists.rider_url` text only | — |
| 17 | Gate signal | **EXISTS** | `professional_reaction` · `entitlements` · `analytics_event` | — |
| 18 | Show outcome | PARTIAL | `gigs` closeout (023) | **D6** |

---

## B · MIGRATION PLAN — 041 → 059

**Rules honoured by every card:** additive-only · no `DROP TABLE`/`DROP COLUMN`/type change on a live
table · every migration paired with a `NNN_*.down.sql` · **nothing applied by us — the owner applies**
(`LOCK-PRODUCT-SPECIFICATION.md` §16.A.6.a rollout rules: "the build agent never touches the live DB")
· CHECK widening uses the drop-and-re-add-with-full-vocabulary pattern of `034:4` / `040:22`, always
retaining legacy values the way `027:206–210` did · grouped so each migration is **independently
useful even if the design changes**.

**Prerequisites the owner applies before this series:** `038` (production event spine — 051/055 depend
on it) and `040` (analytics CHECK — closes A17). Neither is authored by this plan.

| # | Purpose (one line) | Touches | Depends on | Reversible | Risk | Additive-only | Closes |
|---|---|---|---|---|---|---|---|
| **041** | Passport version store: state · order · supersede · current pointer | `passport_versions` +cols (`version_no · state · supersedes_id · published_at · superseded_at · withdrawn_at · created_by · label · content_hash`), partial unique index | — | yes | low (table is insert-only, 2 live rows class) | yes | A7, contract 1 |
| **042** | Recipient policy registry + version↔policy binding | new `recipient_policy`, new `policy_field_budget`; `passport_versions.recipient_policy_id` | 041, 039 (`evidence_field`) | yes | low (new tables + 1 nullable col) | yes | A7b, contract 2 input |
| **043** | Link service: token, 6 dead-link states, policy binding, resolve RPC | `share_link` +cols (`token_hash · slug · recipient_policy_id · expiry_kind · revoked_at · replaced_by · wrong_recipient_at`), status CHECK widen, `resolve_share_link()` RPC, **narrow `pv_public_read`** | 041, 042 | yes | **MEDIUM — the RLS narrowing changes what anon can read** (see D) | cols yes / policy no | A8, rule 3, contract 2 |
| **044** | Professional Asset version store + event reference/review | new `professional_asset`, `professional_asset_version`, `asset_event_reference`, `asset_event_review` | 038 applied (for `event_id`) | yes | low (all new) | yes | A16, contract 1, Flow gap #6 |
| **045** | Claim lifecycle depth: candidate/conflict, 90d review, published-vs-newer | `claims` +cols (`review_due_at · version_no · superseded_by · published_in_version_id · published_value_hash`), status CHECK widen, new `claim_conflict` | 041 | yes | low | yes | A2, Flow gap #7 |
| **046** | Source freshness + platform registry | `evidence_artifacts` +cols (`link_state · last_checked_at · refresh_due_at · source_version · superseded_by`), new `source_platform` (the §16.A.6.a table 039 did not ship) | 039 | yes | low | yes | A3 |
| **047** | Confirmation lifecycle + hashed tokens | `producer_confirmations` +cols (`state · expires_at · attestation_statement · token_hash`) — adopts `036_token_hash.sql.DRAFT` with its 4-step dual-read plan | — | yes **until step 4 scrub** | MEDIUM (server dual-read must ship between steps) | yes | A4 |
| **048** | Canonical Thread + participants + messages + enquiry bridge | new `thread`, `thread_participant`, `thread_message`; `availability_requests.thread_id` | — | yes | low (bridge col nullable) | yes | A9, contract 3 |
| **049** | Mandate capability model + append-only mandate audit | new `mandate_capability`, `mandate_event`; `artist_access.status` CHECK widen (+`declined`,`expired`); new `has_mandate()` | 027 (live) | yes | low (existing scope[] untouched) | yes | A10, contract 7, section D |
| **050** | Disclosure request (on-request lifecycle) — **D2-GATED** | new `disclosure_request (share_link_id · thread_id · field_id · requested_at · decided_by · decision · expires_with_link)` | 043, 048, 049 | yes | low | yes | A12 recipient side, Flow gap #3 |
| **051** | Booking Case + case approvals | new `booking_case`, `case_approval` | 048, 038 applied | yes | low | yes | A11 |
| **052** | Offer matrix (rep-internal, anon-revoked) | new `offer_tier` + explicit `REVOKE ALL FROM anon` | 051 | yes | low | yes | A12 |
| **053** | Handoff package + transmission receipts | new `handoff_package`, `handoff_transmission_event (ready·sent·received·opened)`; production-side attach ref | 051, 038 applied | yes | low | yes | contract 6, Flow gap #5 |
| **054** | Production event spine: days, stages, state, live window | `production_event` +cols (`state · phase · first_day · last_day · setting · expected_crowd_band · live_started_at · live_ended_at · curfew_time`); new `event_day`, `event_stage` | **038 applied** | yes | low | yes | A13, contract 5 |
| **055** | Slot ladder + candidate assignment records | `lineup_slot` state CHECK widen + `event_day_id · event_stage_id · changeover_minutes · brief_text · closure_reason`; new `slot_candidate` | 054, 051 | yes | low | yes | A14 |
| **056** | Advance items (event-wide + act projection over one dataset) | new `advance_item` | 054, 044 | yes | low | yes | A15, Amendment D item 6 |
| **057** | Notification scoping per mandate | `notifications` +cols (`act_id · thread_id · capability · audience_scope · organization_id`); new `notification_delivery` | 049, 048 | yes | low | yes | contract 7 |
| **058** | Radar audience split — **OWNER SIGN-OFF (removes info from a live screen)** | `radar_signal.audience` +col; new rep-summary policy; **tightening of `radar_org`** | 010 (live) | yes | **HIGH (policy) / low (column)** | col yes / policy **no** | A5, rule 5 |
| **059** | Show outcome close-out — **D6-GATED** | new `show_outcome` (exactly the D6 field list) | 054, 055 | yes | low | yes | A18 |
| **(view)** | Gate signal read contract | `gate_signal_v` view with a `not_measured` sentinel; FK `professional_reaction.share_link_id → share_link` | 043, 040 applied | yes | low | yes | A17, rule 4 |

**Grouping rationale (design-change resilience).** 041–047 are the *artist evidence + publication*
family: every card is useful on its own and none references a screen. 048–053 are the *conversation +
commercial* family; 048 and 049 are usable without any of 050–053. 054–056 are the *production* family
and are the only ones gated on 038 being applied. 058 and 059 are gated on an owner ruling and can be
skipped indefinitely without invalidating anything above them.

---

## C · THE 7 ENGINEERING CONTRACTS

v9 names three as P0-engineering (`LOCK-IA.md:46`: version store · link service · request object) and
four more across the Flow Register gap summary (`:147–162`). Each below is specified as a **backend
shape that is determined by the IA, not by the screen.**

### C1 · Version store — passport versions + professional assets
*v9:* `LOCK-IA.md:15` (Passport `versioned: yes`, states draft→superseded) + `:23` (Asset "versioned ⚙
version store", "newer exists" flag) + Flow gaps #4 and #6.

**Shape.** One pattern applied twice, never a generic polymorphic table:
- Passport: `passport_versions(version_no, state, supersedes_id, published_at, superseded_at, content_hash)`; "current" = partial unique `(act_id, recipient_policy_id) where state='published'`.
- Asset: `professional_asset(current_version_id)` + `professional_asset_version(version_no, state{current·superseded}, checksum)`.
- **"Newer exists" is DERIVED, never stored:** for Production, `asset_event_reference.asset_version_id <> professional_asset.current_version_id`; for the artist's Category screen, `claims.published_value_hash <> current value hash`. Storing it would create a second source of truth (rule 1).
- Diff basis = `content_hash` per version; the Publish Review diff (`ART-PAS-030`) is computed at read time from two rows, never persisted.
- API: `create_draft(act_id, policy_id) → version` · `publish(version_id)` (transactionally supersedes the prior published version for that policy) · `restore(version_id)` = create a NEW draft seeded from an old snapshot, **never mutate history**.

**Carried by:** migration **041** (passport) + **044** (assets) + **045** (published-vs-newer on claims).

---

### C2 · Link service — one link = one version + one policy
*v9:* `LOCK-IA.md:16` + rule 3 `:53` + `Screen-Registry:74` (6 dead-link states).

**Shape.**
- `share_link` binds exactly one `passport_version_id` (already NOT NULL, `024:20`) **plus** one `recipient_policy_id` (new). A link is never re-pointed; "replace" mints a new row and sets `replaced_by` on the old one.
- Handle = `slug` (public, opaque) + `token_hash` (secret half), never the row `id` — anon has no SELECT on the table (`025:56`) and must not get one.
- Expiry: `expiry timestamptz null` + `expiry_kind text check (date·endless)`. Null-with-kind-`endless` is a deliberate, explicit state, not an accident.
- Six dead states with distinct reasons: `expired` (clock) · `revoked` (artist acted) · `replaced` (a newer link supersedes) · `unpublished` (the act pulled the whole Passport) · `withdrawn` (the version was withdrawn) · `wrong-recipient` (recipient self-declared). Each resolves to a different recovery path on `EXT-ERR-001`, so each must be distinguishable **at the data layer**, not guessed by the renderer.
- API: `resolve_share_link(p_token)` SECURITY DEFINER → `{state, reason, version_id, policy_id, act_identity}`; on any dead state it returns the reason **and nothing else** (no act data leaks past a dead link).
- Revoke: `revoke_share_link(id)` sets `status='revoked'`, `revoked_at`. **Future authority stops; history stays** — the row is never deleted (mirrors the D1 mandate law).

**Carried by:** migration **043** (+ **042** for the policy registry it binds to).

---

### C3 · Request / enquiry object — canonical Thread with per-persona projections
*v9:* `LOCK-IA.md:17` · Phase 0B `Execution-Contract:67` · standing ruling `:70` · object-ownership law `HANDOFF-3` LOCKED #7.

**Shape.**
- `thread` is the single row. Artist Inbox, Rep Inbox, Production Inbox and the Recipient's own receipt are **four RLS-scoped SELECT projections of the same row** — no copy, no mirror table. This is directly enforceable: one table, four policies.
- `thread_participant.display_identity` is the D1 disclosure field — every message renders "Sent by Dana Cohen · representing SHIDAPU", so identity must be stored per participant, not inferred from the sender's account.
- `thread_message.draft` + `approved_by_person_id` implements View/Draft/Send-Act at message grain: a rep with `draft` level may INSERT with `draft=true`; only `send_act` (or the artist) may set `sent_at`.
- Inbox state grammar `needs_reply · waiting · done` lives on `thread.state`; `waiting_on` names the owner — this is what the universal Inbox row renders, and it is data, not a screen computation.
- Guest continuation (`LOCK-Open-Decisions.md:100`, "the flow dies at the receipt today"): `thread_participant.guest_token_hash` + a reference number = a durable magic-link thread with no account.

**Carried by:** migration **048**; authority gating by **049**.

---

### C4 · Back / deep-link + resume contract
*v9:* Flow-Register gap #2 "Browser Back / deep-link context — ⚙ blocked on Claude Code" (`:150`) · Amendment D item 9 Resume Contract (`Execution-Contract:41`) · `return_to` contract (`LOCK-Open-Decisions.md:101`).

**Shape — deliberately almost no schema.** This is a server/state-layer contract, and inventing tables for it would be over-building:
1. **Every canonical object must have a stable, resolvable public identifier** — this is the only real data requirement, and 041/043/044/048/051/054/055 each supply one.
2. **One resolver per object type**: `resolve_<object>(id) → {exists, permitted, parent_context, canonical_route}`. `parent_context` is what lets Back rebuild `Fusion Festival · Main Stage` without the client guessing.
3. `return_to` is a **signed URL parameter**, never a DB row — it must survive a login round-trip, which a server-side session row does not do cheaply.
4. The one row worth storing: `active_role_context` **already exists** (`008:52–56`) and is exactly the "which hat am I wearing" half of resume. Extend it with `last_route text` + `last_object_ref text` only if the owner wants cross-device resume; per-device resume belongs in localStorage (the pattern `passportState.js:6` already uses).

**Carried by:** no new migration. Delivered as resolver RPCs alongside 041/043/048/054. **Flag:** if cross-device resume is wanted, that is a new decision, not an IA consequence.

---

### C5 · Show-day activation rule — what triggers live mode
*v9:* `Screen-Registry:4` + Amendment B standing ruling "activation (operational window / manual Enter Live Mode) = **ENGINEERING REVIEW REQUIRED**; never fake automatic behavior" (`Execution-Contract:73`) · Flow gap #10.

**Shape — the data condition, stated so design can pick either UX later.**
- Live mode is a **state of the Event**, not a screen (`Screen-Registry:4` reclassifies PRO-EVT-050 as a MODE of the Event Workspace). So it must be a column: `production_event.state='live'` with `live_started_at`.
- Two independent triggers, both recorded:
  - *Operational window* — derived predicate: `now() between (first door time − lead) and (last set end + tail)`. Store the window inputs (`event_day.doors_at`, `event_day.end_at`, `production_event.curfew_time`), **not** the boolean — a stored boolean would go stale and become a second source of truth (rule 1).
  - *Manual* — `live_started_at` / `live_ended_at` written by a person, with the actor in `mandate_event`-style audit.
- Read contract: `is_live = live_started_at is not null and live_ended_at is null` **OR** `in_operational_window` — and the UI must be able to tell which, because "the app decided" and "a human decided" are different truths (Amendment G "never fake automatic behavior").
- **The remaining ENGINEERING REVIEW question is a product one, not a schema one:** whether the window auto-enters or only *offers* to enter. The schema above supports both without change.

**Carried by:** migration **054**.

---

### C6 · Handoff receipt — Ready → Sent → Received → Opened
*v9:* Amendment A "Handoff transmission states: Ready→Sent→Received→Production opened — 'Sent to Production', never claim receipt unless known" (`Execution-Contract:84`) · Amendment D item 5 "acknowledgments are evidence, not wizard steps... quiet system lines shown only on real signals" (`:37`) · Amendment C "display a transmission state only when a real signal exists" (`:50`) · Flow gap #5 · **D3 recommendation:** handoff creates a DRAFT event-slot attachment; producer confirms → slot `confirmed`; nothing auto-publishes (`HANDOFF-3:37–38`).

**Shape.**
- `handoff_package (id · booking_case_id · act_id · from_organization_id · to_organization_id nullable · state text check (ready·sent·received·opened) · payload_ref · created_at · sent_at)` — `to_organization_id` nullable because the export path has no receiving workspace.
- `handoff_transmission_event (id · package_id · signal text check (sent·received·opened) · at · evidenced_by text)` — **append-only, one row per REAL signal.** `state` on the package is the max signal observed; there is no way to write `received` without a row that says what evidenced it. This is what makes "never claim receipt unless known" enforceable at the data layer rather than by renderer discipline.
- D3 half (the draft slot attachment): `handoff_package.attached_slot_id → lineup_slot` and a `slot_candidate` row in `status='offered'`. **Gate this half on D3**; the transmission-state half needs no decision.

**Carried by:** migration **053**.

---

### C7 · Notification scoping — who gets what, per mandate
*v9:* Amendment D item 4 "Artist Inbox = who needs something from me. Share views/activity = awareness → **Notifications, not Inbox items**" (`Execution-Contract:36`) · object-ownership law "Notification (awareness) ≠ Inbox (decision queue) ≠ Thread ≠ Case" (`HANDOFF-3` LOCKED #7) · D1 scoping (`:29`).

**Shape.**
- `notifications` today is `user_id · type · body · link · read` (`002:8–17`) with RLS `user_id = auth.uid()` (`002:19`) and a service-role-only writer (`server/index.js:555`, closed type enum documented at `src/lib/notifications.js:9–13`). The row is per-*person*, which is right; what is missing is the **scoping metadata that decides who the recipients are**.
- Add: `act_id · thread_id · organization_id · capability text · audience_scope text check (act_owner·mandated_rep·production·operator)`.
- Fan-out rule (a function, not a screen): for an event on act A requiring capability C, recipients = the act's owning-org members **∪** every person in an org holding an active `mandate_capability(A, C, level ≥ view)`. When a mandate expires or is revoked, **future** notifications stop immediately (D1) — and because `mandate_event` is append-only, the past delivery record stays auditable.
- `notification_delivery (id · notification_id · person_id · channel · delivered_at · read_at)` separates *the event* from *who was told* — otherwise a fan-out to five people needs five duplicated bodies and drifts.
- **Firewall:** `body` stays bounded template text (`src/lib/notifications.js:15–17`) — never a count, %, or score.

**Carried by:** migration **057** (depends on **049**).

---

## D · PERMISSION / RLS MODEL

### D.1 What v9 rules
D1 is **RULED and Maria-approved** (`Execution-Contract:29`), which makes it buildable today:
1. **Default = no implicit authority.** Membership in a rep org grants nothing about an artist.
2. **Three levels:** View / Draft (artist approves send) / Send-Act.
3. **Five independently-scoped capabilities:** availability · commercial negotiation · Passport sharing · sensitive disclosure · production handoff. Explicitly **"never one 'has access' switch."**
4. **Sender identity always disclosed**, never impersonation.
5. **Assistants draft only** unless explicitly granted send.
6. **Expiry/revocation stops FUTURE authority immediately; history stays auditable.**

Plus IA rule 5 (interpretation is artist-private) and the projection matrix (`LOCK-IA.md:35–42`).

### D.2 What we have

| Layer | Reality | Cite |
|---|---|---|
| Tenant | `organization` + `organization_membership(org_role owner·admin·member)` + `current_org_ids()` | `008:20,29,131` |
| Functional role | `role_assignment.functional_role` (11 tolerated values incl. legacy) | `008:43`, `027:201–211` |
| Cross-org grant | `artist_access(scope text[] <@ {view,upload,edit,share,publish}, territory, expires_at, consent_at, status{pending·active·revoked·disputed})` | `008:58`, `027:97–120` |
| Read gate | `can_access_artist(a)` — owning org **OR** an active, unexpired grant carrying `view` | `027:166–178` |
| Scope helper | `artist_access_has_scope(a, needed)` — **exists but is used by no policy today** | `027:183` |
| Write gate | still the coarse `FOR ALL` org policies on `claims`/`profile_items`/`evidence_artifacts` built on `can_access_artist` | `008:254,258,262`, acknowledged as a known gap in `027:57–66` |
| Public gate | `artists.published` + `visibility='passport-ok'` + `verification_status in (verified,supporting)` + **`artist_approved=true`** | `031:24–30` |
| Physical firewall | anon column grants only | `016:14–28`, `025:26–57` |
| Operator | `is_operator()` platform-wide read + targeted update | `003:20–62` |
| Audit | `audit_log`, operator-only RLS, no writer for access events | `011:6–20` |

### D.3 What the policy layer must become

| # | Requirement | Change | Additive? |
|---|---|---|---|
| 1 | Capability × level authority | New `mandate_capability` + `has_mandate(act, capability, min_level)`; **existing `scope[]` and `can_access_artist()` are left untouched** and continue to gate coarse reads | **ADDITIVE** |
| 2 | `declined` ≠ `revoked`; `expired` visible | Widen `artist_access.status` CHECK; teach `respond_to_access_request` to write `declined` (`027:293` currently writes `revoked`) | **ADDITIVE** (CHECK widen + RPC body) |
| 3 | Auditable history | New append-only `mandate_event`, readable by **both** the artist's org and the granting org | **ADDITIVE** |
| 4 | Write policies split per capability | New per-capability policies on `thread_message`, `share_link`, `booking_case`, `handoff_package`, `disclosure_request` — all on NEW tables, so no live policy is rewritten | **ADDITIVE** |
| 5 | Draft-vs-send | `thread_message` INSERT policy allows `draft=true` at level `draft`; setting `sent_at` requires `send_act` or the act owner | **ADDITIVE** (new table) |
| 6 | Sender identity | `thread_participant.display_identity` NOT NULL | **ADDITIVE** |
| 7 | **Rule 3 — one link, one version** | **Narrow `pv_public_read`** from "any snapshot of a published artist" (`001:210`) to "the version a live share link binds", with resolution via `resolve_share_link()` | ⚠ **BREAKING** — removes an anon read path that the current `/passport/:id` route depends on (`src/App.jsx:155`, `src/lib/db.js:513`). Needs a code change in the same release, or a transitional `OR artist_is_published(...)` clause retired later. |
| 8 | **Rule 5 — Radar is artist-private** | Split `radar_org` (`010:28`) so rep orgs read only `audience='rep_summary'` | ⚠ **BREAKING** — `/agency/radar` (`src/App.jsx:207`) currently shows rep orgs the artist's private gap signals. Column is additive; the policy flip needs owner sign-off. |
| 9 | Write policies on `claims`/`items`/`evidence` split by scope | Deferred — flagged in `027:57–66`, would change behaviour for orgs relying on the broad `FOR ALL` policies | ⚠ **BREAKING** — do NOT bundle with 041–059 |
| 10 | 021 vocabulary (`mirror-only`→`working-only`) | Stays FROZEN | ⚠ **BREAKING** — unrelated to this plan; do not touch |

**Net:** eight of the ten requirements are additive. The two that are not (items 7 and 8) are exactly the
two places where our live behaviour contradicts a v9 **non-negotiable rule** — which is why they are worth
the owner's attention rather than being quietly deferred.

---

## E · SAFE TO BUILD NOW vs MUST WAIT FOR DESIGN

### E.1 SAFE NOW — shape determined by the IA, not by any screen

| Item | Why the design cannot change its shape |
|---|---|
| **041** Passport version store | "Versioned · draft→preview→review→published→superseded" is in the object registry (`LOCK-IA.md:15`) and the Passport split is a LOCKED architecture decision. What the *screens* look like does not change the state machine. |
| **042** Recipient policy registry | Six policy keys are fixed by the Screen Registry (`:72`) and the "ONE renderer + six decision policies" ruling (`Execution-Contract:84`). The *field mapping* is data; the registry is structure. |
| **043** Link service | Rule 3 is non-negotiable; the 6 dead-link states are enumerated. |
| **044** Professional Asset version store | `Act Asset → Version → Event Reference → Event Review` is a Phase 0B ownership law, stated as a chain (`Execution-Contract:67`). |
| **045** Claim lifecycle depth | The four states are in the registry row; "published vs newer" is Flow gap #7, explicitly "**buildable now — blocked on nobody**" (`Flow-Register:154,162`). |
| **046** Source freshness + `source_platform` | Freshness is a registry column; the table shape is already specified in `§16.A.6.a` and simply was not shipped by 039. |
| **047** Confirmation states + token hash | States enumerated; the token-hash rollout plan is already written (`036…DRAFT`). Security fix, zero design coupling. |
| **048** Canonical Thread | "One thread, per-workspace projections; no copies" is a Phase 0B law and LOCKED object-ownership decision #7. |
| **049** Mandate capability model | **D1 is RULED.** The five capabilities and three levels are literally enumerated. |
| **051** Booking Case | States enumerated twice (`LOCK-IA.md:19`, `Execution-Contract:131`); "Production sees a projection of the SAME object" is a standing ruling. |
| **053** Handoff transmission states (not the D3 attach half) | Four states enumerated; "only on a real signal" is a ruling. |
| **054/055** Event/Slot spine | The six operational objects and both status ladders are "adopt as canon" (`LOCK-Open-Decisions.md:110–111`). |
| **056** Advance item | Groups PERFORMANCE/MOVEMENT/PLACE/MATERIALS and "one dataset, two modes" are Amendment D item 6; "never a % readiness score" is a firewall constraint, not a layout. |
| **057** Notification scoping | Notification ≠ Inbox is a LOCKED decision; fan-out follows D1. |
| **Gate signal view** | Rule 4 (`intent ≠ payment; not-measured ≠ 0`) is a firewall rule. |
| **Applying 038 and 040** | Already authored, already reviewed, blocking two objects and four analytics events. |

### E.2 MUST WAIT

| Item | Blocked on | Why waiting is correct |
|---|---|---|
| **Scene benchmark storage** | **D4** | `LOCK-IA.md:14` literally says "RESERVED — not a canonical object until D4". The cohort dataset does not exist; owner question B2 is open (`LOCK-Open-Decisions.md:141`). Building a table would invent the dataset. |
| **050** Disclosure request | **D2** | Who approves, whether a rep `disclose` scope exists, and whether approval expires with the link are all D2 questions (`HANDOFF-3:34–35`). The table's FK set changes depending on the answer. |
| **052** Offer matrix *recipient-visible* half | **D2** | "on request at most (D2)" (`LOCK-IA.md:40`). The rep-internal half (E.1-adjacent) is safe; the recipient projection is not. |
| **053** D3 attach half | **D3** | "create/fill/attach + who confirms" is explicitly returned to Maria+Code (`Execution-Contract:45`). |
| **059** Show outcome | **D6** | Retention policy undecided (`LOCK-IA.md:25`), and the lineage doc forbids rendering the learning loop-back before D6 (`:28`). |
| **058** Radar policy tightening | **owner** | Removes information from a shipped screen. |
| **Admin object model beyond the gate view** | **D5** | Admin is frozen (`Execution-Contract:9` "Admin frozen until D5"); jobs analysis precedes any IA change. |
| **Anything keyed to a screen's field list** | design | `policy_field_budget` **rows**, Composer chapter grouping (8→3-4 is an AUDIT-first item, Amendment D item 12), Category professional groups, Radar node lists (registry-driven nodes are TARGET, `§8.2`). Structure safe, content not. |
| **Rep-reply routes (A3 card)** | **Maria** | Flow-Register gap #1, 7 rows awaiting a decision (`:149`). `thread_message.draft` supports either answer, so 048 is *not* blocked — only the routing is. |
| **`claims`/`items`/`evidence` write-policy split by scope** | owner | Behaviour change for live orgs (`027:57–66`). |
| **021 vocabulary migration** | permanent freeze | Would break the claim pipeline (`021:1–17`). |

---

## F · SEQUENCE RECOMMENDATION

Each step is independently verifiable, and no step is invalidated by a later design change because
every one of them is a *state machine or an ownership rule*, never a layout.

| Step | Do | Test that proves it | Design-change exposure |
|---|---|---|---|
| **0** | Owner applies **038** + **040** | `select count(*) from production_event` returns 0 without error; the 4 buyer-funnel event names insert into `analytics_event` without violating the CHECK | none — both already authored and reviewed |
| **1** | **041 + 042 + 045** — version store, policy registry, published-vs-newer | Publish twice → exactly one row per `(act_id, policy_id)` has `state='published'`; the prior row shows `superseded_at` and `supersedes_id` chains correctly. Edit an approved claim → `published_value_hash <> current hash` flips the "newer exists" derivation with **zero UI work**. | none — states are canon |
| **2** | **043** — link service + narrowed `pv_public_read` (**with the app change in the same release**) | `resolve_share_link()` with a revoked token returns `{state:'revoked'}` and **no act data**; a superseded version id is unreachable by any anon path; six dead states each return a distinct reason. Regression: `/passport/:id` still resolves for existing links via the transitional clause. | none — rule 3 is non-negotiable |
| **3** | **049 + 048** — mandate capabilities, then Thread | Grant `commercial:draft` only → the rep can INSERT `thread_message(draft=true)` and **cannot** set `sent_at`. Revoke → the next insert fails, and `mandate_event` still shows the full grant history. One thread row, read successfully by four different personas through four different policies, with **zero duplicated rows**. | none — D1 is RULED |
| **4** | **044 + 046 + 047** — asset version store, source freshness, confirmation hardening | Upload rider v4 → the event's `asset_event_reference` still points at v3 and the derived "newer exists" is true without Production's row changing. `sha256(token)` lookup succeeds while the raw token in a producer's inbox still works (dual-read step 2). | none |
| **5** | **051 + 053(transmission half) + 052(rep-internal half)** | Promote a thread → a `booking_case` appears; the artist's org can read the `case_approval` rows and **nothing else** of the case. A handoff cannot reach `received` without a `handoff_transmission_event` row naming the evidence. `select` on `offer_tier` as `anon` is denied. | low — D2/D3 gate only the projections, not the records |
| **6** | **054 + 055 + 056** — event days/stages/state, slot ladder + candidates, advance items | An event with 2 days × 2 stages holds slots without a single `artist_n` column; a slot moves open→shortlist→case→confirmed→advancing→done; `advance_item` yields "14 of 17 cleared" as a **count query**, and no column anywhere can express a percentage. | low — ladders are adopted canon |
| **7** | **057 + gate-signal view** | Expiring a mandate stops the next fan-out immediately while `notification_delivery` retains every past row. The gate view returns `not_measured` distinctly from `0`. | none |
| **8** | **058 + 050 + 059** — the gated three | Only after: owner sign-off on the Radar split; D2; D6. | by definition |

**Why a design change never invalidates a completed step:** steps 1–7 add *states, lineage pointers,
ownership rows and policies*. Not one of them encodes a screen, a field order, a label, a chapter count,
or a layout. If the Composer becomes 3 chapters instead of 8, or the Radar becomes something else
entirely, every table above is unchanged — what changes is which rows a projection selects. That is
exactly what IA rule 1 ("a screen never becomes a second source of truth — it consumes projections")
buys us, and it is why the object layer is the right thing to build while the visuals move.

---

## What I could not determine

I could not verify the **live** database — this analysis reads migration files and `docs/VERSIONS.md`,
not the running Supabase project (`qexfndiyallwqhhzeerd`), so any drift between what a file says and
what was actually executed in the SQL editor is invisible to me; the 039 header contradicting
VERSIONS.md is proof that such drift exists in at least one direction, and I resolved it in favour of
VERSIONS.md without being able to confirm either. I could not determine actual row counts, so the
"low risk / no data loss" judgements on cards 041–059 assume the small pilot volumes described in
`020:20` ("2 artists rows") and `037` ("43 demo / 3 real") still hold. I could not find a v9 document
that specifies the **Advance item** or **Offer matrix** field lists — both are named as objects in the
screens and rulings but neither appears as a row in the Information Object Registry, so their shapes in
A12 and A15 are my derivation from the rulings, not a transcription of canon, and the owner should treat
them as proposals. I could not resolve whether the six recipient policy keys are `booker/producer/
private/prog/brand/rep` (Screen Registry `:72`) or the "canon = 4 families + modes" stated in
`LOCK-Open-Decisions.md:118` — 042 assumes six and will need a one-line correction if four is the live
ruling. Finally, I could not determine whether the D2–D7 decision pack has been approved since it was
written: `HANDOFF-3:32` says "Reply APPROVED to accept all", and nothing in the repo records a reply,
so I have treated D2/D3/D4/D5/D6 as **open** throughout — if the owner has since approved the pack,
cards 050, 052-recipient-half, 053-attach-half and 059 all move from "must wait" to "safe now" without
any other change to this plan.
