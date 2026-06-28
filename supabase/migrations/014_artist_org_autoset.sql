-- ============================================================
-- 014 — AUTO-SET an artist's organization on INSERT.
-- Lets onboarding (and agency "add artist") create an artist with the ANON key
-- alone (no service-role): a BEFORE INSERT trigger fills owner_organization_id
-- from the creator's active org, and BEFORE-triggers run before the RLS
-- WITH CHECK, so `owner_organization_id in current_org_ids()` passes.
-- Idempotent. Apply in the Supabase SQL editor (no token needed).
-- ============================================================
create or replace function public.set_artist_org()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if new.owner_organization_id is not null then return new; end if;
  select active_organization_id into v_org from public.active_role_context where person_id = auth.uid();
  if v_org is null then
    select organization_id into v_org from public.organization_membership
      where person_id = auth.uid() and org_role = 'owner' and status = 'active'
      order by created_at limit 1;
  end if;
  new.owner_organization_id := v_org;
  new.organization_id := coalesce(new.organization_id, v_org);
  return new;
end; $$;

drop trigger if exists trg_set_artist_org on public.artists;
create trigger trg_set_artist_org before insert on public.artists
  for each row execute function public.set_artist_org();
