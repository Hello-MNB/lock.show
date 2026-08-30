begin;

-- Supabase projects grant authenticated table access before RLS evaluates;
-- the disposable vanilla PostgreSQL harness reproduces that platform ACL.
grant select on public.artists, public.artist_access,
  public.organization_membership, public.role_assignment,
  public.active_role_context, public.organization to authenticated;

insert into auth.users (id, email) values
  ('10000000-0000-4000-8000-000000000001', 'artist@example.test'),
  ('10000000-0000-4000-8000-000000000002', 'outsider@example.test');

insert into public.person (id, email) values
  ('10000000-0000-4000-8000-000000000001', 'artist@example.test'),
  ('10000000-0000-4000-8000-000000000002', 'outsider@example.test');

insert into public.organization (id, name, plan, workspace_type) values
  ('20000000-0000-4000-8000-000000000001', 'Artist A', 'solo', 'artist'),
  ('20000000-0000-4000-8000-000000000002', 'Management B', 'agency', 'management'),
  ('20000000-0000-4000-8000-000000000003', 'Artist C', 'solo', 'artist');

insert into public.organization_membership
  (organization_id, person_id, org_role, status, joined_at)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'owner', 'active', now()),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'member', 'active', now());

insert into public.role_assignment (organization_id, person_id, functional_role) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'artist'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'artist_manager');

insert into public.active_role_context (person_id, active_organization_id) values
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001');

insert into public.artists (id, created_by, stage_name, owner_organization_id, organization_id, published) values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Private Artist A', '20000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', false),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Private Artist C', '20000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', false);

set request.jwt.claim.sub = '10000000-0000-4000-8000-000000000001';
set role authenticated;

do $$
declare direct_count integer; rpc_count integer;
begin
  select count(*) into direct_count from public.artists where id = '30000000-0000-4000-8000-000000000001';
  select count(*) into rpc_count from public.get_my_artist_for_active_workspace();
  if direct_count <> 1 or rpc_count <> 1 then raise exception 'active_artist_workspace_denied'; end if;
end $$;

reset role;
update public.active_role_context
   set active_organization_id = '20000000-0000-4000-8000-000000000002'
 where person_id = '10000000-0000-4000-8000-000000000001';
set role authenticated;

do $$
declare leaked integer;
begin
  select count(*) into leaked from public.artists where id = '30000000-0000-4000-8000-000000000001';
  if leaked <> 0 then raise exception 'two_memberships_or_wrong_role_leaked_private_artist'; end if;
  select count(*) into leaked from public.get_my_artist_for_active_workspace();
  if leaked <> 0 then raise exception 'wrong_workspace_rpc_disclosed_private_artist'; end if;
end $$;

reset role;
insert into public.artist_access
  (organization_id, artist_id, access_level, scope, status, expires_at)
values
  ('20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'view', array['view'], 'active', now() + interval '1 day');
set role authenticated;

do $$
declare direct_count integer;
begin
  select count(*) into direct_count from public.artists where id = '30000000-0000-4000-8000-000000000001';
  if direct_count <> 1 then raise exception 'active_explicit_artist_grant_denied'; end if;
end $$;

reset role;
update public.artist_access set status = 'revoked';
set role authenticated;

do $$
declare leaked integer;
begin
  select count(*) into leaked from public.artists where id = '30000000-0000-4000-8000-000000000001';
  if leaked <> 0 then raise exception 'revoked_artist_access_leaked_private_artist'; end if;
end $$;

reset role;
update public.artist_access set status = 'active', scope = array['edit'];
set role authenticated;

do $$
declare leaked integer;
begin
  select count(*) into leaked from public.artists where id = '30000000-0000-4000-8000-000000000001';
  if leaked <> 0 then raise exception 'missing_view_scope_leaked_private_artist'; end if;
end $$;

reset role;
update public.artist_access set scope = array['view'], expires_at = now() - interval '1 day';
set role authenticated;

do $$
declare leaked integer;
begin
  select count(*) into leaked from public.artists where id = '30000000-0000-4000-8000-000000000001';
  if leaked <> 0 then raise exception 'expired_artist_access_leaked_private_artist'; end if;
end $$;

reset role;
update public.active_role_context
   set active_organization_id = '20000000-0000-4000-8000-000000000003'
 where person_id = '10000000-0000-4000-8000-000000000001';
set role authenticated;

do $$
declare leaked integer;
begin
  select count(*) into leaked from public.artists;
  if leaked <> 0 then raise exception 'missing_membership_or_mismatched_workspace_leaked_private_artist'; end if;
  select count(*) into leaked from public.get_my_artist_for_active_workspace();
  if leaked <> 0 then raise exception 'missing_membership_rpc_disclosed_private_artist'; end if;
end $$;

reset role;
update public.active_role_context
   set active_organization_id = '20000000-0000-4000-8000-000000000001'
 where person_id = '10000000-0000-4000-8000-000000000001';
update public.organization_membership set status = 'suspended'
 where organization_id = '20000000-0000-4000-8000-000000000001'
   and person_id = '10000000-0000-4000-8000-000000000001';
set role authenticated;

do $$
declare leaked integer;
begin
  select count(*) into leaked from public.artists;
  if leaked <> 0 then raise exception 'revoked_membership_leaked_private_artist'; end if;
  select count(*) into leaked from public.get_my_artist_for_active_workspace();
  if leaked <> 0 then raise exception 'revoked_membership_rpc_disclosed_private_artist'; end if;
end $$;

reset role;
reset request.jwt.claim.sub;
select 'ARTIST_ACTIVE_WORKSPACE_AUTHZ_OK' as result;
rollback;
