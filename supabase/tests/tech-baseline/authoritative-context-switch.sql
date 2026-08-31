begin;

grant select on public.organization, public.organization_membership,
  public.role_assignment, public.active_role_context, public.artist_access,
  public.artists, public.context_switch_receipt to authenticated;

insert into auth.users (id, email) values
  ('41000000-0000-4000-8000-000000000001', 'switcher@example.test'),
  ('41000000-0000-4000-8000-000000000002', 'other@example.test');

insert into public.person (id, email) values
  ('41000000-0000-4000-8000-000000000001', 'switcher@example.test'),
  ('41000000-0000-4000-8000-000000000002', 'other@example.test');

insert into public.organization (id, name, plan, workspace_type) values
  ('42000000-0000-4000-8000-000000000001', 'Artist A', 'solo', 'artist'),
  ('42000000-0000-4000-8000-000000000002', 'Management B', 'agency', 'management'),
  ('42000000-0000-4000-8000-000000000003', 'Wrong-role Artist C', 'solo', 'artist'),
  ('42000000-0000-4000-8000-000000000004', 'Roster-only Management D', 'agency', 'management'),
  ('42000000-0000-4000-8000-000000000005', 'Suspended Management E', 'agency', 'management');

insert into public.organization_membership
  (organization_id, person_id, org_role, status, joined_at)
values
  ('42000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000001', 'owner', 'active', now()),
  ('42000000-0000-4000-8000-000000000002', '41000000-0000-4000-8000-000000000001', 'member', 'active', now()),
  ('42000000-0000-4000-8000-000000000003', '41000000-0000-4000-8000-000000000001', 'member', 'active', now()),
  ('42000000-0000-4000-8000-000000000004', '41000000-0000-4000-8000-000000000001', 'member', 'active', now()),
  ('42000000-0000-4000-8000-000000000005', '41000000-0000-4000-8000-000000000001', 'member', 'suspended', now());

insert into public.role_assignment (organization_id, person_id, functional_role) values
  ('42000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000001', 'artist'),
  ('42000000-0000-4000-8000-000000000002', '41000000-0000-4000-8000-000000000001', 'artist_manager'),
  ('42000000-0000-4000-8000-000000000003', '41000000-0000-4000-8000-000000000001', 'viewer'),
  ('42000000-0000-4000-8000-000000000004', '41000000-0000-4000-8000-000000000001', 'artist_manager'),
  ('42000000-0000-4000-8000-000000000005', '41000000-0000-4000-8000-000000000001', 'artist_manager');

insert into public.active_role_context (person_id, active_organization_id, context_version) values
  ('41000000-0000-4000-8000-000000000001', '42000000-0000-4000-8000-000000000001', 0);

insert into public.artists
  (id, created_by, stage_name, owner_organization_id, organization_id, published)
values
  ('43000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000001', 'Private Artist A',
   '42000000-0000-4000-8000-000000000001', '42000000-0000-4000-8000-000000000001', false);

insert into public.artist_access
  (organization_id, artist_id, access_level, scope, status, expires_at)
values
  ('42000000-0000-4000-8000-000000000002', '43000000-0000-4000-8000-000000000001',
   'view', array['view'], 'active', now() + interval '1 day');

set request.jwt.claim.sub = '41000000-0000-4000-8000-000000000001';
set role authenticated;

-- 01 — database enumerates only active, role-compatible targets.
do $$ begin
  if (select count(*) from public.select_context_switch_targets()) <> 3
     or exists (select 1 from public.select_context_switch_targets() where organization_id in (
       '42000000-0000-4000-8000-000000000003', '42000000-0000-4000-8000-000000000005'
     )) then raise exception '01_target_enumeration_failed'; end if;
end $$;

-- 02 — active membership, compatible role and exact ArtistAccess succeed.
do $$ begin
  if not exists (
    select 1 from public.preflight_context_switch(
      '42000000-0000-4000-8000-000000000002', '43000000-0000-4000-8000-000000000001', 0
    ) where eligible and target_organization_id = '42000000-0000-4000-8000-000000000002'
  ) then raise exception '02_active_access_preflight_failed'; end if;
end $$;

-- 03 — a roster/workspace relationship without ArtistAccess grants nothing.
do $$ begin
  if not exists (
    select 1 from public.preflight_context_switch(
      '42000000-0000-4000-8000-000000000004', '43000000-0000-4000-8000-000000000001', 0
    ) where not eligible and denial_code = 'context_not_available' and target_organization_id is null
  ) then raise exception '03_roster_only_not_denied'; end if;
end $$;

-- 04 — unknown/wrong Organization is non-disclosing.
do $$ begin
  if not exists (
    select 1 from public.preflight_context_switch(
      '42000000-0000-4000-8000-000000000099', null, 0
    ) where not eligible and denial_code = 'context_not_available' and target_organization_name is null
  ) then raise exception '04_wrong_org_disclosed'; end if;
end $$;

-- 05 — missing/disabled membership is non-disclosing.
do $$ begin
  if not exists (
    select 1 from public.preflight_context_switch(
      '42000000-0000-4000-8000-000000000005', null, 0
    ) where not eligible and target_organization_id is null
  ) then raise exception '05_suspended_membership_not_denied'; end if;
end $$;

-- 06 — a role incompatible with the target Workspace is denied.
do $$ begin
  if not exists (
    select 1 from public.preflight_context_switch(
      '42000000-0000-4000-8000-000000000003', null, 0
    ) where not eligible and target_organization_id is null
  ) then raise exception '06_wrong_role_not_denied'; end if;
end $$;

reset role;
update public.artist_access set status = 'revoked';
set role authenticated;

-- 07 — revoked explicit access is denied.
do $$ begin
  if not exists (select 1 from public.preflight_context_switch(
    '42000000-0000-4000-8000-000000000002', '43000000-0000-4000-8000-000000000001', 0
  ) where not eligible) then raise exception '07_revoked_access_not_denied'; end if;
end $$;

reset role;
update public.artist_access set status = 'active', expires_at = now() - interval '1 day';
set role authenticated;

-- 08 — expired explicit access is denied.
do $$ begin
  if not exists (select 1 from public.preflight_context_switch(
    '42000000-0000-4000-8000-000000000002', '43000000-0000-4000-8000-000000000001', 0
  ) where not eligible) then raise exception '08_expired_access_not_denied'; end if;
end $$;

reset role;
update public.artist_access set expires_at = now() + interval '1 day', scope = array['edit'];
set role authenticated;

-- 09 — a grant without view scope is denied.
do $$ begin
  if not exists (select 1 from public.preflight_context_switch(
    '42000000-0000-4000-8000-000000000002', '43000000-0000-4000-8000-000000000001', 0
  ) where not eligible) then raise exception '09_missing_view_scope_not_denied'; end if;
end $$;

reset role;
update public.artist_access set scope = array['view'];
set role authenticated;

-- 10 — raw active_role_context writes are not a direct-call boundary.
do $$ begin
  begin
    update public.active_role_context
       set active_organization_id = '42000000-0000-4000-8000-000000000002';
    raise exception '10_direct_context_write_succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;

-- 11 — COMMIT atomically advances the version and emits one receipt.
do $$ begin
  if not exists (
    select 1 from public.commit_context_switch(
      '42000000-0000-4000-8000-000000000002', '43000000-0000-4000-8000-000000000001', 0,
      '44000000-0000-4000-8000-000000000001'
    ) where previous_context_version = 0 and context_version = 1
  ) then raise exception '11_commit_receipt_failed'; end if;
end $$;

-- 12 — private Artist data follows the committed database context.
do $$ begin
  if (select count(*) from public.artists where id = '43000000-0000-4000-8000-000000000001') <> 1
  then raise exception '12_committed_context_did_not_authorize_artist'; end if;
end $$;

-- 13 — retrying the same idempotency key returns one immutable receipt.
do $$
declare v_first uuid; v_retry uuid;
begin
  select receipt_id into v_first from public.get_context_switch_receipt('44000000-0000-4000-8000-000000000001');
  select receipt_id into v_retry from public.commit_context_switch(
    '42000000-0000-4000-8000-000000000002', '43000000-0000-4000-8000-000000000001', 0,
    '44000000-0000-4000-8000-000000000001'
  );
  if v_retry is distinct from v_first
     or (select count(*) from public.context_switch_receipt where idempotency_key = '44000000-0000-4000-8000-000000000001') <> 1
     or (select context_version from public.active_role_context) <> 1
  then raise exception '13_idempotent_retry_failed'; end if;
end $$;

-- 14 — reusing a key for a different target fails as a conflict.
do $$ begin
  begin
    perform public.commit_context_switch(
      '42000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000001', 1,
      '44000000-0000-4000-8000-000000000001'
    );
    raise exception '14_idempotency_conflict_succeeded';
  exception when raise_exception then
    if sqlerrm <> 'context_switch_conflict' then raise; end if;
  end;
end $$;

-- 15 — stale optimistic concurrency fails without moving the context.
do $$ begin
  begin
    perform public.commit_context_switch(
      '42000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000001', 0,
      '44000000-0000-4000-8000-000000000002'
    );
    raise exception '15_stale_commit_succeeded';
  exception when raise_exception then
    if sqlerrm <> 'context_switch_stale' then raise; end if;
  end;
  if not exists (select 1 from public.active_role_context
    where active_organization_id = '42000000-0000-4000-8000-000000000002' and context_version = 1)
  then raise exception '15_stale_commit_changed_context'; end if;
end $$;

-- 16 — reverse preflight to the owned Artist Workspace succeeds.
do $$ begin
  if not exists (select 1 from public.preflight_context_switch(
    '42000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000001', 1
  ) where eligible) then raise exception '16_reverse_preflight_failed'; end if;
end $$;

-- 17 — reverse COMMIT succeeds and the owner path remains private/available.
do $$ begin
  if not exists (select 1 from public.commit_context_switch(
    '42000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000001', 1,
    '44000000-0000-4000-8000-000000000003'
  ) where context_version = 2) then raise exception '17_reverse_commit_failed'; end if;
  if (select count(*) from public.get_my_artist_for_active_workspace()) <> 1
  then raise exception '17_reverse_artist_read_failed'; end if;
end $$;

-- 18 — authority revoked after preflight is rechecked at COMMIT and fails closed.
do $$ begin
  if not exists (select 1 from public.preflight_context_switch(
    '42000000-0000-4000-8000-000000000002', '43000000-0000-4000-8000-000000000001', 2
  ) where eligible) then raise exception '18_preflight_fixture_failed'; end if;
end $$;

reset role;
update public.organization_membership set status = 'suspended'
 where organization_id = '42000000-0000-4000-8000-000000000002'
   and person_id = '41000000-0000-4000-8000-000000000001';
set role authenticated;

do $$ begin
  begin
    perform public.commit_context_switch(
      '42000000-0000-4000-8000-000000000002', '43000000-0000-4000-8000-000000000001', 2,
      '44000000-0000-4000-8000-000000000004'
    );
    raise exception '18_post_preflight_revocation_succeeded';
  exception when raise_exception then
    if sqlerrm <> 'context_switch_not_available' then raise; end if;
  end;
  if not exists (select 1 from public.active_role_context
    where active_organization_id = '42000000-0000-4000-8000-000000000001' and context_version = 2)
    or exists (select 1 from public.context_switch_receipt where idempotency_key = '44000000-0000-4000-8000-000000000004')
  then raise exception '18_revocation_failure_changed_state'; end if;
end $$;

reset role;
reset request.jwt.claim.sub;
select 'AUTHORITATIVE_CONTEXT_SWITCH_OK' as result;
rollback;
