-- R15-ART-AUTHZ-001 — active-workspace authorization for private Artist/RADAR reads.
-- A client-supplied organization id is never authority. The database derives
-- the active Workspace from active_role_context and requires an active
-- membership plus either the Artist role in the owning Artist Workspace or an
-- active, unexpired explicit artist_access grant carrying view scope.

create or replace function public.active_workspace_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select context.active_organization_id
  from public.active_role_context context
  join public.organization_membership membership
    on membership.organization_id = context.active_organization_id
   and membership.person_id = context.person_id
   and membership.status = 'active'
  where context.person_id = auth.uid()
  limit 1;
$$;

revoke all on function public.active_workspace_id() from public, anon, authenticated;

create or replace function public.owns_artist(a uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.artists artist
    join public.organization organization
      on organization.id = artist.owner_organization_id
     and organization.workspace_type = 'artist'
    join public.role_assignment role
      on role.organization_id = artist.owner_organization_id
     and role.person_id = auth.uid()
     and role.functional_role = 'artist'
    where artist.id = a
      and artist.created_by = auth.uid()
      and artist.owner_organization_id = public.active_workspace_id()
  );
$$;

revoke all on function public.owns_artist(uuid) from public;
grant execute on function public.owns_artist(uuid) to anon, authenticated;

create or replace function public.can_access_artist(a uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and (
    public.owns_artist(a)
    or exists (
      select 1
      from public.artist_access access
      where access.artist_id = a
        and access.organization_id = public.active_workspace_id()
        and access.status = 'active'
        and (access.expires_at is null or access.expires_at > now())
        and 'view' = any(access.scope)
    )
  );
$$;

revoke all on function public.can_access_artist(uuid) from public;
grant execute on function public.can_access_artist(uuid) to anon, authenticated;

-- Replace only the broad any-membership predicate. Public Passport and
-- environment-Admin policies remain separate and unchanged.
drop policy if exists artists_org on public.artists;
create policy artists_org on public.artists for all
  using (public.can_access_artist(id))
  with check (owner_organization_id in (select public.current_org_ids()));

create or replace function public.get_my_artist_for_active_workspace()
returns setof public.artists
language sql
stable
security definer
set search_path = ''
as $$
  select artist.*
  from public.artists artist
  join public.organization organization
    on organization.id = artist.owner_organization_id
   and organization.workspace_type = 'artist'
  join public.role_assignment role
    on role.organization_id = artist.owner_organization_id
   and role.person_id = auth.uid()
   and role.functional_role = 'artist'
  where auth.uid() is not null
    and artist.created_by = auth.uid()
    and artist.owner_organization_id = public.active_workspace_id()
  order by artist.created_at asc, artist.id asc
  limit 1;
$$;

revoke all on function public.get_my_artist_for_active_workspace() from public, anon;
grant execute on function public.get_my_artist_for_active_workspace() to authenticated;

comment on function public.get_my_artist_for_active_workspace() is
  'Returns zero rows unless the authenticated person has an active Artist role in their database-selected active Artist Workspace.';
