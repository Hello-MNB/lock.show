drop function if exists public.list_roster_grants(uuid);

create or replace function public.list_roster_grants()
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
  where aa.organization_id in (select public.current_org_ids())
    and aa.status = 'active'
    and (aa.expires_at is null or aa.expires_at > now())
  order by aa.created_at desc
$$;

revoke all on function public.list_roster_grants() from public;
revoke all on function public.list_roster_grants() from anon;
grant execute on function public.list_roster_grants() to authenticated;
