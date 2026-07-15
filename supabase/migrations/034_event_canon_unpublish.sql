-- LOCK — migration 034 (AS APPLIED, reconciled by Cowork+owner 13 Jul): the analytics
-- event CHECK now equals the app CANON exactly (29 events — generated from
-- src/lib/analytics.js CANON; drift found twice by hand, hence file=DB=app).
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
    'availability_request_responded'));
