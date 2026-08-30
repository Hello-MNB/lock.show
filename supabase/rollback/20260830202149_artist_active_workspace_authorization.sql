-- Roll back R15-ART-AUTHZ-001 to the exact pre-correction authorization contract.

drop function if exists public.get_my_artist_for_active_workspace();

drop policy if exists artists_org on public.artists;
create policy artists_org on public.artists for all
  using (
    owner_organization_id in (select public.current_org_ids())
    or id in (
      select artist_id
      from public.artist_access
      where status = 'active'
        and organization_id in (select public.current_org_ids())
    )
  )
  with check (owner_organization_id in (select public.current_org_ids()));

create or replace function public.can_access_artist(a uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.artists ar
    where ar.id = a and ar.owner_organization_id in (select public.current_org_ids())
  ) or exists (
    select 1 from public.artist_access aa
    where aa.artist_id = a and aa.status = 'active'
      and (aa.expires_at is null or aa.expires_at > now())
      and 'view' = any(aa.scope)
      and aa.organization_id in (select public.current_org_ids())
  );
$$;

grant execute on function public.can_access_artist(uuid) to public;

create or replace function public.owns_artist(a uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.artists ar
    where ar.id = a
      and ar.owner_organization_id in (select public.current_org_ids())
  );
$$;

grant execute on function public.owns_artist(uuid) to public;
drop function if exists public.active_workspace_id();
