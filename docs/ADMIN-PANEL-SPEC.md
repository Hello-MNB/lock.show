# LOCK — ADMIN PANEL SPEC (owner + advisor view of the business)
Owner order 13 Jul 2026: "the admin panel concentrates everything about system users and useful
system information — what an admin sees about HIS BUSINESS. Maria and Eran are such admins.
Plan access + content; NOT part of onboarding." Access mechanics: docs/runbooks/ADVISOR-ACCESS-eran.md.

## Principles
- Operator-only surface (`profiles.role='operator'`, RLS `is_operator()`, route `/admin`).
- INTERNAL counts are allowed here (this is the pilot measurement surface — the firewall bans
  artist-facing scores/ranks; it does not ban the owner seeing her own business numbers).
- Every number comes from a BOUNDED read model (RPC/view with operator check) — the client never
  free-queries raw analytics (GPT read-model rule adopted).
- Bilingual EN/HE like every screen; mobile-first like every screen.

## A) LIVE TODAY (verified in AdminDashboard.jsx)
1. Payments — Bit references (GP-XXXX) + manual entitlement activation (ENTITLEMENT_ACTIVATED)
2. Upgrade requests — plan-change queue
3. Artists — list incl. publish state (+ hard delete)
4. Requests — availability requests across the system
5. Claims — AI claims across the system
This is an OPERATIONS panel. What's missing is the BUSINESS view — hence §B.

## B) P0.5 — BUSINESS OVERVIEW (build right after PREVIEW-READY; does not block preview)
New first section "Business" on /admin, fed by ONE additive read model (`admin_metrics` view or
RPC, SECURITY DEFINER + operator check; additive migration, owner applies):
- **Funnel (pilot chain):** signups by role → onboarding completed → radar opened → evidence
  added → claims confirmed → passports published → shares → passport views → requests sent →
  requests responded. Counts + 7/30-day windows. (All events already write to analytics_event.)
- **Outreach:** waitlist signups by role × source_page × ?src batch — which message worked.
- **The Gate tile:** buyer reactions (requests) count · payments count — the two pilot criteria,
  side by side.
- **Publish freshness:** published passports total · republished last 30d · unpublished (the
  passport_published/unpublished events) — CFRO's recurring-value evidence, visible to the owner.
- **Acts:** persons · acts · multi-act persons (act_created).
- **System health (thin):** last AI job failure count (from claim pipeline errors), RPC-missing
  indicators (the honest gap-states already detect this).
Definition of done: Maria/Eran open /admin and understand the state of the business in 60 seconds
without asking anyone.

## C) P1 — OPERATOR QUEUES (GPT continuous-value spec, adopted)
Automation Health · AI Cost Ledger (Cost Sentinel) · Stale Evidence queue · Contradiction queue ·
Source-Confirmation failures · Consent/Revocation alerts · Document-expiry queue · Connector
status · AI Suggestion audit · Manual-intervention queue. Build order follows the Growth-Loop
build (each queue lands WITH the automation that feeds it — no empty dashboards).

## D) Explicitly OUT
- No artist scores/rankings anywhere — including here. Counts of PRODUCT usage only.
- No public exposure of any admin number. Operator RLS + route guard, both already enforced.
- Not in onboarding: operator is granted by runbook (owner word + one SQL), never self-served.

## Team
- Claude Code: read-model migration draft + Business section build (P0.5), queues with Growth Loop (P1).
- Codex: design law for the Business section (density, hierarchy, bilingual numbers/dates) — can
  reuse the calm mono-tab admin pattern already live.
- Cowork: operator-access QA (role grant per runbook → /admin renders → RLS blocks non-operators)
  + verify counts against DB truth on preview.
- CFRO: confirms §B covers its measurement needs (it asked for exactly the publish-cadence and
  Gate tiles).
- GPT: drift-check this spec vs its Retention Measurement Spec (event names must match 1:1).

## E) GPT COCKPIT-AUDIT AMENDMENTS (13 Jul — ADOPTED, binding on the P0.5 build)
1. **Live inventory = SEVEN sections** (correction): Payments · Upgrades · Artists · Requests ·
   Claims · **Consents · Audit** (verified in AdminDashboard.jsx:161).
2. **Access separation is P0 BEFORE any advisor grant:** operator_owner (Maria, full) vs
   operator_advisor (read-only aggregated cockpit; no payment/publish/export/delete). Eran's
   grant stays 🚩BLOCKED until Cowork proves prohibited mutations fail at UI+RPC+RLS.
   Runbook amended. **Owner directive: the invitation itself = WAITING task until Maria is ready.**
3. **Event persistence corrected:** passport_unpublished was outside the 028 CHECK → was
   localStorage-only. Migration 034 drafted (additive CHECK widening + down) — owner applies;
   until then current-unpublished comes from DB state (published=false) and republish cadence
   from repeated passport_published (distinguish first vs re-publish via prior events; demo excluded).
4. **Funnels split PER ENTITY** (artist/manager/buyer/production/confirmer/site) — each with
   eligible population, distinct key, first-vs-repeat, demo exclusion. No single mixed funnel;
   no cross-unit conversion rates.
5. **Gate tile:** qualified buyer reaction (availability_request_created) · payment INTENT
   (payment_reference_created) · VERIFIED payment (entitlement_activated) — three columns,
   intent never presented as payment. Gate strip renders FIRST (Codex DS v1.6.18 mobile order).
6. **"Not instrumented yet" ≠ 0:** planned P1 metrics (improvement cycles, gig debriefs,
   freshness resolution) render as explicitly unavailable, never as zeros.
7. **Read-model contract:** admin_business_overview(window_key, entity_filter) — SECURITY
   DEFINER + fixed search_path + capability check; response discloses generated/data-through
   timestamps, vocabulary version, missing-instrumentation list, demo-exclusion status; every
   metric carries unit/denominator/source/limitation. Aggregates only for advisor.
8. **Dimensions before build:** verify which events actually carry workspace_id/act_id/
   passport_id/request_id/actor_role/locale/source/src/is_demo — absent key → metric marked
   unavailable, never silently estimated. Attribution language: "this source produced these
   signups" (not "this message worked").
