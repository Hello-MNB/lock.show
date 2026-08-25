\set ON_ERROR_STOP on

do $$
declare
  missing text[] := array[]::text[];
  required_function text;
begin
  foreach required_function in array array[
    'resolve_primary_workspace',
    'commit_workspace_context',
    'rename_workspace',
    'resend_workspace_invitation',
    'cancel_workspace_invitation',
    'change_workspace_member_authority',
    'transfer_workspace_ownership'
  ] loop
    if not exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = required_function
    ) then
      missing := array_append(missing, required_function);
    end if;
  end loop;

  if cardinality(missing) > 0 then
    raise exception 'APP_SHELL_DB_CONTRACT_MISSING:%', array_to_string(missing, ',');
  end if;
end
$$;

select 'APP_SHELL_DB_CONTRACT_PRESENT' as result;

insert into auth.users(id,email,email_confirmed_at) values
  ('10000000-0000-4000-8000-000000000001','owner@example.test',now()),
  ('10000000-0000-4000-8000-000000000002','member@example.test',now())
on conflict (id) do nothing;
insert into public.person(id,email,display_name) values
  ('10000000-0000-4000-8000-000000000001','owner@example.test','Owner'),
  ('10000000-0000-4000-8000-000000000002','member@example.test','Member')
on conflict (id) do nothing;

insert into public.organization(id,name,workspace_type,created_by) values
  ('20000000-0000-4000-8000-000000000001','Artist One','artist','10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002','Representation One','management','10000000-0000-4000-8000-000000000001');
insert into public.subscription(organization_id,plan,seats_included,seats_used,status) values
  ('20000000-0000-4000-8000-000000000001','solo',10,0,'active'),
  ('20000000-0000-4000-8000-000000000002','solo',10,0,'active');
insert into public.organization_membership(id,organization_id,person_id,org_role,status,joined_at) values
  ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','owner','active',now()),
  ('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','owner','active',now()),
  ('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','member','active',now()),
  ('30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000002',null,'member','invited',null);
update public.organization_membership
   set invited_email='invitee@example.test', invite_expires_at=now()+interval '7 days'
 where id='30000000-0000-4000-8000-000000000004';
insert into public.role_assignment(id,organization_id,person_id,functional_role) values
  ('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','artist'),
  ('40000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','artist_manager');
insert into public.active_role_context(person_id,active_organization_id,context_version)
values('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',1);

set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);

do $$
declare v_result jsonb;
begin
  v_result:=public.resolve_primary_workspace('/artist/home');
  if v_result->>'outcome'<>'RESOLVED_PRIMARY'
     or v_result->'workspace'->>'id'<>'20000000-0000-4000-8000-000000000001' then
    raise exception 'primary_resolution_failed:%',v_result;
  end if;

  v_result:=public.commit_workspace_context(
    '20000000-0000-4000-8000-000000000002',1,'50000000-0000-4000-8000-000000000001','/agency');
  if v_result->>'status'<>'COMMITTED' or (v_result->>'contextVersion')::int<>2
     or v_result->>'route'<>'/agency' then raise exception 'context_commit_failed:%',v_result; end if;

  if public.commit_workspace_context(
    '20000000-0000-4000-8000-000000000002',1,'50000000-0000-4000-8000-000000000001','/agency')<>v_result then
    raise exception 'context_idempotency_failed';
  end if;

  v_result:=public.rename_workspace('20000000-0000-4000-8000-000000000002','Northline Representation',1,
    '50000000-0000-4000-8000-000000000002');
  if v_result->>'afterName'<>'Northline Representation' or (v_result->>'authorityVersion')::int<>2 then
    raise exception 'rename_transaction_failed:%',v_result; end if;

  v_result:=public.resend_workspace_invitation('30000000-0000-4000-8000-000000000004',1,
    '50000000-0000-4000-8000-000000000003');
  if v_result->>'status'<>'DELIVERY_REQUIRED' then raise exception 'resend_truth_state_failed:%',v_result; end if;
  v_result:=public.cancel_workspace_invitation('30000000-0000-4000-8000-000000000004',2,
    '50000000-0000-4000-8000-000000000004');
  if v_result->>'membershipStatus'<>'cancelled' then raise exception 'cancel_invitation_failed:%',v_result; end if;

  begin
    perform public.change_workspace_member_authority('30000000-0000-4000-8000-000000000001','admin','active',1,
      '50000000-0000-4000-8000-000000000005');
    raise exception 'last_owner_guard_missing';
  exception when others then
    if sqlerrm<>'last_active_owner_required' then raise; end if;
  end;

  v_result:=public.transfer_workspace_ownership('20000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000003',1,1,'50000000-0000-4000-8000-000000000006');
  if v_result->>'status'<>'COMMITTED' then raise exception 'ownership_transfer_failed:%',v_result; end if;
end
$$;

reset role;

do $$
begin
  if has_function_privilege('anon','public.resolve_primary_workspace(text)','execute') then
    raise exception 'anon_can_resolve_private_workspace';
  end if;
  if not has_function_privilege('authenticated','public.resolve_primary_workspace(text)','execute') then
    raise exception 'authenticated_missing_workspace_resolver';
  end if;
  if has_table_privilege('authenticated','public.workspace_authority_receipt','select') then
    raise exception 'browser_can_enumerate_authority_receipts';
  end if;
  if not exists (
    select 1 from public.organization_membership
     where id='30000000-0000-4000-8000-000000000002' and org_role='admin'
  ) or not exists (
    select 1 from public.organization_membership
     where id='30000000-0000-4000-8000-000000000003' and org_role='owner'
  ) then raise exception 'ownership_transfer_not_atomic'; end if;
end
$$;

select 'APP_SHELL_WORKSPACE_AUTHORITY_DB_OK' as result;
