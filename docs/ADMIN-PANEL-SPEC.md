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
