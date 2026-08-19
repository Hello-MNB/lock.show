-- ============================================================
-- 051 DOWN · stop filling act.organization_id
--
-- The trigger and function are removed. THE BACKFILL IS NOT UNDONE: the values it
-- wrote are the ones the rows should have carried all along, and re-NULLing them
-- would re-break the legitimate multi-Act publish under 041 rather than restore a
-- prior good state. Stated plainly rather than left for someone to discover.
--
-- Idempotent, and harmless against a database that never had 051.
-- ============================================================

begin;

drop trigger  if exists trg_act_inherit_org on public.act;
drop function if exists public.act_inherit_org();

commit;
