-- ============================================================
-- 038 DOWN — remove the Production event board (exact inverse of 038).
-- Drops ONLY what 038 created: 2 policies × 2 tables, 1 helper, 2 tables,
-- their indexes (dropped with the tables). Touches nothing from 001–037.
-- Safe order: slot (child) before event (parent).
-- ============================================================

drop policy if exists ls_admin_write on public.lineup_slot;
drop policy if exists ls_org_read on public.lineup_slot;
drop policy if exists pe_admin_write on public.production_event;
drop policy if exists pe_org_read on public.production_event;

drop function if exists public.can_access_production_event(uuid);

drop table if exists public.lineup_slot;
drop table if exists public.production_event;
