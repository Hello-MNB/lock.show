-- A representation roster is resolved for the explicit active Workspace only.
-- Membership in another organization never widens the selected context.
drop function if exists public.list_roster_grants();

create or replace function public.list_roster_grants(p_organization_id uuid)
returns table(
  grant_id uuid, artist_id uuid, artist_stage_name text, artist_city text,
  scope text[], territory text, status text,
  consent_at timestamptz, expires_at timestamptz, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select aa.id, aa.artist_id, ar.stage_name, ar.city,
         aa.scope, aa.territory, aa.status,
         aa.consent_at, aa.expires_at, aa.created_at
  from public.artist_access aa
  join public.artists ar on ar.id = aa.artist_id
  where p_organization_id is not null
    and aa.organization_id = p_organization_id
    and exists (
      select 1
      from public.organization_membership membership
      where membership.organization_id = p_organization_id
        and membership.person_id = auth.uid()
        and membership.status = 'active'
    )
    and aa.status = 'active'
    and (aa.expires_at is null or aa.expires_at > now())
  order by aa.created_at desc
$$;

revoke all on function public.list_roster_grants(uuid) from public;
revoke all on function public.list_roster_grants(uuid) from anon;
grant execute on function public.list_roster_grants(uuid) to authenticated;
