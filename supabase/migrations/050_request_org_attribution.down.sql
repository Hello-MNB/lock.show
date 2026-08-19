-- ============================================================
-- 050 DOWN · availability_requests.organization_id becomes caller-supplied again
--
-- REVERTING RE-OPENS THE ATTRIBUTION DEFECT: an anonymous visitor can again stamp
-- a real booking request with an unrelated organization, moving it out of the
-- artist's own RADAR and into that organization's. Stated plainly because a
-- rollback that quietly removes a check is not a rollback.
--
-- Rows written while 050 was applied are NOT restored — the trigger nulled a
-- value it judged unattributable and did not record what it was. That is
-- one-way, and it is the intended shape: the nulled value was, by construction,
-- one the writer was not entitled to set.
--
-- Idempotent, and harmless against a database that never had 050.
-- ============================================================

begin;

drop trigger  if exists trg_request_org_attribution on public.availability_requests;
drop function if exists public.request_org_attribution();

commit;
