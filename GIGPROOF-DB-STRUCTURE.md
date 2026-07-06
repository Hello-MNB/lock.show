# GIGPROOF — FULL DB STRUCTURE (target locked · Gate-1 tables marked)
**Version:** v1.1 · **Date:** 2 July 2026 · PILOT ARTIST NOT LOCKED — chosen from the run · **Owner:** Maria (R00) · **Architect:** R16
**Subordinate to ★ B4 Master Canon; input to B4-40.10 (Technical/data/schema SSOT).**
**Firewall reminder:** NOT an EPK/CRM/guarantee. NO score/percentile/rank/prediction. Draw = bands+binaries+method-labels only.
**Supabase ref:** qexfndiyallwqhhzeerd · Postgres + RLS. Stack: React+Vite+Tailwind+Vercel. AI = concierge (stubbed).
**Rule:** This is the LOCKED TARGET schema so we never migrate the shape later. Build only 🟢 GATE-1 tables now; 🔵 FULL-BETA tables are designed now (cheap), created when their UI is built.
**Validated against 6 real artist archetypes (pilot artist NOT locked — chosen from the run):** 16-alias artist (entity resolution) · dual-role DJ+producer · zero-catalogue venue-led DJ · service/wedding DJ · multi-relationship pop act (5 rel types) · label-owner producer-DJ. Any of these — or a run-list candidate — can be the pilot.

**STILL OPEN — schema leaves room, does NOT fill:** taxonomy band value-sets · brand terms · pricing · radar count. These are enum *placeholders*, filled later by R00. Structure is stable; values are not.

---

## FIREWALL AT THE SCHEMA LEVEL (columns that make violations impossible)
The firewall is enforced by which columns EXIST and which are FORBIDDEN — not by app logic.
**FORBIDDEN columns (never create — their absence = structural firewall):**
❌ `score` / `rating` / `percentile` / `rank` / `bookability_pct` / `fill_value` / `completion_pct`
❌ `benchmark_cohort` / `comparison_population` / `cohort_id` (artist-vs-artist)
❌ `weight_numeric` (any number that sums to a grade)
❌ exact public `headcount` / `fee` on any passport-visible row (bands only)
**REQUIRED firewall columns (every claim carries these):** `certainty` · `method_label` · `reviewed_at` · `visibility` · `passport_eligibility`.

---

## LAYER 1 — IDENTITY & ACCESS (person → workspace → role)
| Table | Key columns | Build | Notes |
|---|---|---|---|
| `person` | id, email, auth_id, created_at | 🟢 | one human, one login |
| `workspace` | id, type(`artist`/`management`/`producer`), plan, created_at | 🟢 artist / 🔵 rest | subscription-bearing unit |
| `role_assignment` | id, person_id→, workspace_id→, role(`owner`/`artist_manager`/`booking_agent`/`roster_coordinator`/`producer`/`viewer`) | 🟢 owner / 🔵 rest | person's role INSIDE a workspace |
| `organization` | id, name, plan(`personal`/`agency`) | 🟢 personal / 🔵 agency | agency = org type, NOT a role |
| `organization_membership` | id, person_id→, org_id→, role | 🔵 | multi-person orgs |
| `artist_access` | id, org_id→, artist_workspace_id→, scope[](`view`/`upload`/`edit`/`share`/`publish`), territory, expiry, consent_at | 🔵 | agency↔artist, artist-owned, revocable |

## LAYER 2 — ARTIST TRUTH (act, taxonomy, relationships)
| Table | Key columns | Build | Notes |
|---|---|---|---|
| `act` | id, artist_workspace_id→, stage_name, alias_of→(self-FK), format, is_primary | 🟢 | 1 workspace → MANY acts (e.g. a 16-alias artist) |
| `artist_taxonomy` | act_id→, primary_module(M1-M8), secondary_module, functional_subtype[], performance_format[], commercial_model[], genre_primary, genre_secondary[], booking_context[], career_config, opportunity_roles[], maturity_tier🔒internal, geography_home, geography_active[], active_overlays[](O1-O10), languages[], act_size, identity_visibility, taxonomy_confidence | 🟢 | Registry A. Enum VALUES open, structure locked |
| `performance_offer` | id, act_id→, offer_type, description | 🟢 | what's sold (DJ set / live PA / wedding pkg) |
| `relationship` | id, act_id→, type(`recording-label`/`distributor`/`licensee`/`management`/`booking-agency`/`rights-holder`/`owned-label`), counterparty_name, status, method_label | 🟢 | multi-relationship pop act: NEVER flatten to one "label" |
| `release` | id, act_id→, title, year, role(`original`/`remix`/`collab`), label, certainty | 🟢 | catalogue (label-owner 40+; venue-led DJ = none, that's fine) |

## LAYER 3 — EVIDENCE & CLAIMS (the proof engine)
| Table | Key columns | Build | Notes |
|---|---|---|---|
| `evidence_artifact` | id, act_id→, evidence_type(`file`/`link`/`band`), source_door(`api`/`oauth`/`artifact`/`confirmed-discovery`), source_type, value, checksum, source_owner_consent, retention_policy, status, uploaded_at | 🟢 | the 4 doors |
| `claim` | id, act_id→, value🔒, public_band, public_wording, source_type, **certainty**(10-enum), **verification_status**, verified_by, limitation_text, **visibility**(`mirror-only`/`passport-ok`/`internal`), **passport_eligibility**, model_version, ruleset_version, **reviewed_at**, expires_at, artist_approved | 🟢 | THE core table. Firewall fields bold |
| `field_applicability` | field_id, artist_module, applicability(`R`/`C`/`S`/`NA`), activation_rule, accepted_sources[], evidence_strength, freshness_window, gap_rule, next_action_rule, passport_eligibility, ruleset_version | 🟢 seed / 🔵 full | Registry B. N/A≠ZERO engine. NO benchmark_cohort col |
| `gig` | id, act_id→, venue, date, role_at_event, audience_band, band_means, sells_events_self, exact_count🔒mirror-only, closeout_status, attendance_band, settlement_band, repeat_booking_signal | 🟢 | recurring event/residency editions |

## LAYER 4 — PUBLICATION (passport, one truth → per-viewer face)
| Table | Key columns | Build | Notes |
|---|---|---|---|
| `passport_version` | id, act_id→, snapshot, included_claims[], artist_approved, published_at, status | 🟢 | ONE truth; interpretation per viewer, not 3 docs |
| `passport_view_event` | id, passport_version_id→, public_session_id, share_link_id, viewed_at | 🟢 | open = view, NOT a reaction |
| `share_link` | id, passport_version_id→, recipient_label, context, link, opened_at, expiry, tracking_disclosed, utm_campaign/source/medium | 🔵 | Share Hub + UTM |

## LAYER 5 — PROFESSIONAL ACTIONS (buyer side)
| Table | Key columns | Build | Notes |
|---|---|---|---|
| `professional_reaction` | id, passport_version_id→, actor_user_id(nullable), public_session_id, actor_role_context, action_type(`check-availability`/`request-price`/`save`/`forward`/`future-fit`/`request-proof`/`not-fit`), created_at, idempotency_key | 🟢 | written only on explicit tap |
| `availability_request` | id, act_id→, requester_name, requester_org, event_date, event_type, location, capacity_band, budget_band, message, originating_reaction_id→, status | 🟢 | commercial intent only; bands only |
| `reaction_reason` | id, reaction_id→, reason_type, free_text🔒internal | 🟢 | diagnostic/close only; never public |

## LAYER 6 — CONFIRMATION (source confirmer — bounded, no account)
| Table | Key columns | Build | Notes |
|---|---|---|---|
| `producer_confirmation` | id, claim_id→, claim_version_id, public_wording_shown, authority_type(`producer`/`venue-rep`/`ticketing-admin`/`organizer`/`other`), name_visibility(`public`/`initials`/`anonymous`), identity_verified, conflict_of_interest, response(`yes`/`partial`/`no`/`wrong-person`), correction_text, channel(`magic-link`/`off-platform-documented`), revoked_at, responded_at | 🟢 | bounded task. Silence ≠ confirmation |

## LAYER 7 — CONSENT, COMMERCE, OPS
| Table | Key columns | Build | Notes |
|---|---|---|---|
| `consent_record` | id, subject_id, scope(`account`/`data-connection`/`public-publication`/`manager-access`/`counterparty-name`/`marketing`), version, timestamp, status, source_ip_hash, locale | 🟢 | contextual, not one mega-screen. Amendment 13 |
| `subscription` | id, workspace_id→, plan, status | 🔵 | attaches to WORKSPACE |
| `entitlement` | id, workspace_id→, capability, permission, status | 🟢 minimal | plan × workspace × capability × permission |
| `manual_payment` | id, workspace_id→, amount_ils, receipt_url, reference_code, status | 🟢 | Bit/transfer → founder approves. No Stripe |
| `audit_event` | id, actor, action, entity, reason, previous_value, new_value, timestamp | 🟢 | EVERY operator write. No silent override |
| `analytics_event` | id, event_name, actor_role_context, payload, timestamp | 🟢 | role retained (אמרגן≠מפיק≠venue never pooled) |

---

## LOCALIZATION IN THE SCHEMA (EN/HE P1, RU/DE P2)
- User-facing text columns that ship in-product (public_wording, method_label, limitation_text) need an i18n strategy: either `_en`/`_he` column pairs OR a `string_key` → `translation` table. **Recommendation: string_key table** — cleaner for RU/DE Phase-2 add without schema change.
- Locale stamped on: consent_record.locale, share_link (viewer locale), passport render.
- HE authored native-first; EN = dev baseline. RU/DE = scaffold rows, not shipped until native-editor pass.

## RLS / FIREWALL ENFORCEMENT (the non-negotiables)
- `claim.value`, `gig.exact_count`, `claim.internal_confidence` → NEVER SELECT-able by public/buyer session (mirror-only/internal).
- `artist.contact` → never SELECT-able by any non-operator.
- Public passport session → can INSERT professional_reaction + availability_request; can SELECT only passport-ok claims of the viewed passport; nothing else.
- `reaction_reason.free_text` → owning artist workspace SELECT only.
- agency → SELECT only within active artist_access scope.
- every operator write → audit_event, enforced, not optional.

---

## BUILD ORDER (Gate-1 tables only)
1. person · workspace(artist) · role_assignment(owner) · organization(personal) — the account spine
2. act · artist_taxonomy · relationship · release — artist truth
3. evidence_artifact · claim · field_applicability(seed M1) · gig — the proof engine
4. passport_version · passport_view_event — publication
5. professional_reaction · availability_request · reaction_reason — buyer actions
6. producer_confirmation — the confirmer loop
7. consent_record · entitlement(minimal) · manual_payment · audit_event · analytics_event — consent/commerce/ops

**Next Action** — Hand this to GPT to fold into B4-40.10 (the technical/schema SSOT) as the target schema, tagged Gate-1 vs Full-Beta — NOT as migrations yet (schema design ≠ build). Then Claude Code writes migrations 001→ from the Gate-1 tables only, in build order.
**Missing Inputs** — Confirm i18n approach (string_key table vs column pairs — I recommend string_key). the CHOSEN pilot artist's real claims to seed `claim` rows for the first true Passport (pilot selected from the run, not pre-assumed). Enum value-sets stay OPEN (R00) — schema doesn't wait on them.
**Business Impact** — This is the whole-product schema on one page, firewall-enforced by column existence (violations are structurally impossible, not just discouraged), validated against 6 real artists incl. the hard cases (16 aliases, dual-role, 5 relationship types, zero-catalogue). Designing the full target now + building only Gate-1 tables saves the migration GPT's workspace correction would otherwise have forced — and lets Claude Code start migrations immediately from a stable shape.
