-- ============================================================
-- 012 — AGENCY UPGRADE APPROVAL  (BUILD-SPEC-ORG-RADAR §19.4, growth chain)
-- Completes Solo→Agency on the SAME organization_id (no migration): the founder/
-- operator confirms a pending upgrade → plan=agency + seats raised. Idempotent.
-- ============================================================

-- Operator (platform founder) may see the upgrade queue across orgs.
drop policy if exists subscription_operator_read on public.subscription;
create policy subscription_operator_read on public.subscription for select using (public.is_operator());
drop policy if exists organization_operator_read on public.organization;
create policy organization_operator_read on public.organization for select using (public.is_operator());

-- Approve: flip plan→agency + raise seats on the SAME org. SECURITY DEFINER so
-- the operator (not a member of that org) can perform it; is_operator() gates it.
create or replace function public.approve_agency_upgrade(p_org uuid, p_seats int default 5)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_operator() then raise exception 'not authorized'; end if;
  update public.organization set plan = 'agency' where id = p_org;
  update public.subscription
     set plan = 'agency', seats_included = greatest(p_seats, 1), status = 'active'
   where organization_id = p_org;
end; $$;
