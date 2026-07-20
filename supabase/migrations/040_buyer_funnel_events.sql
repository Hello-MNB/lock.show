-- LOCK — migration 040 (AUTHORED NOT APPLIED — owner applies): widens the
-- analytics_event CHECK to add the 4 NEW buyer-funnel events defined at
-- LOCK-PRODUCT-SPECIFICATION.md §14.1.6 (Launch-Plan Module 3, owner word
-- 21 Jul, ratify: R00 — pending, not yet ratified):
--   proof_unit_expanded · method_label_peeked · persona_toggled ·
--   availability_request_started
-- (`passport_view` also gains a `face` PROP per §14.1.6 item 1 — no schema
-- change needed, `properties` is already jsonb.)
--
-- Same widen-in-place pattern as 034 (drop + re-add the CHECK with the full
-- vocabulary — Postgres CHECK constraints have no ADD VALUE form). This is
-- the highest-numbered migration touching analytics_event_event_name_check,
-- so scripts/test-canon-drift.mjs will diff the app CANON against THIS
-- file's list once both are in place (see analytics.js CANON additions in
-- the same commit).
--
-- Until this migration is applied to the live DB, the 4 new names fail the
-- live CHECK on insert — src/lib/analytics.js persist() swallows that error
-- (best-effort, analytics must never break a user action) and the events
-- stay localStorage-ring-buffer-only. This is the SAME harmless-degrade
-- behavior 'passport_unpublished' had before 034 was applied (§14.1.1).
alter table public.analytics_event drop constraint if exists analytics_event_event_name_check;
alter table public.analytics_event add constraint analytics_event_event_name_check
  check (event_name in (
    'passport_view',
    'professional_reaction_submitted',
    'availability_request_created',
    'producer_confirmation_sent',
    'producer_confirmation_received',
    'claim_published',
    'passport_published',
    'entitlement_activated',
    'gig_evidence_refresh_completed',
    'passport_unpublished',
    'share_link_created',
    'share_link_opened',
    'consent_granted',
    'consent_withdrawn',
    'account_deleted',
    'signup_started',
    'signup_completed',
    'login',
    'oauth_login',
    'onboarding_started',
    'onboarding_completed',
    'radar_opened',
    'evidence_added',
    'claim_confirmed',
    'act_created',
    'act_switched',
    'workspace_switched',
    'payment_reference_created',
    'availability_request_responded',
    'proof_unit_expanded',
    'method_label_peeked',
    'persona_toggled',
    'availability_request_started'));
