-- LOCK SHOW application shell / Workspace authority transactions.
-- Source bound to Product v7.1, Acceptance v4.44 and Experience v6.42.
-- Additive candidate only. Never apply to a live project without a separate
-- exact migration authorization and recoverability receipt.

alter table public.organization
  add column if not exists authority_version bigint not null default 1;

alter table public.active_role_context
  add column if not exists context_version bigint not null default 1,
  add column if not exists last_receipt jsonb;

alter table public.organization_membership
  add column if not exists authority_version bigint not null default 1,
  add column if not exists invite_expires_at timestamptz,
  add column if not exists invite_last_sent_at timestamptz,
  add column if not exists suspended_at timestamptz;
alter table public.organization_membership
  alter column invite_expires_at set default (now() + interval '14 days');

alter table public.organization_membership
  drop constraint if exists organization_membership_status_check;
alter table public.organization_membership
  add constraint organization_membership_status_check
  check (status in ('active', 'invited', 'suspended', 'cancelled', 'revoked', 'expired'));

update public.organization_membership
   set invite_expires_at = coalesce(invite_expires_at, created_at + interval '14 days')
 where status = 'invited';

create table if not exists public.workspace_authority_receipt (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete restrict,
  organization_id uuid references public.organization(id) on delete set null,
  action text not null check (action in (
    'context.switch', 'workspace.rename', 'invitation.resend', 'invitation.cancel',
    'membership.change', 'ownership.transfer'
  )),
  idempotency_key uuid not null,
  before_state jsonb not null default '{}'::jsonb,
  after_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (actor_id, idempotency_key)
);

alter table public.workspace_authority_receipt enable row level security;
alter table public.workspace_authority_receipt force row level security;
revoke all on table public.workspace_authority_receipt from public, anon, authenticated;

create or replace function public.resolve_primary_workspace(p_return_to text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_count integer;
  v_active public.active_role_context%rowtype;
  v_membership record;
begin
  if v_uid is null then
    return jsonb_build_object('outcome', 'DENIED_OR_REVOKED');
  end if;

  select * into v_active
    from public.active_role_context
   where person_id = v_uid;

  if v_active.active_organization_id is not null then
    select m.id membership_id, m.org_role, o.id organization_id, o.name,
           o.workspace_type, r.id role_id, r.functional_role
      into v_membership
      from public.organization_membership m
      join public.organization o on o.id = m.organization_id
      left join lateral (
        select ra.id, ra.functional_role
          from public.role_assignment ra
         where ra.organization_id = o.id and ra.person_id = v_uid
         order by ra.created_at
         limit 1
      ) r on true
     where m.person_id = v_uid and m.organization_id = v_active.active_organization_id
       and m.status = 'active';
    if v_membership.organization_id is not null then
      return jsonb_build_object(
        'outcome', 'RESOLVED_PRIMARY',
        'contextVersion', v_active.context_version,
        'workspace', jsonb_build_object('id', v_membership.organization_id, 'name', v_membership.name,
          'type', v_membership.workspace_type),
        'role', jsonb_build_object('id', coalesce(v_membership.role_id, v_membership.membership_id),
          'type', coalesce(v_membership.functional_role, v_membership.org_role)),
        'route', case v_membership.workspace_type
          when 'management' then '/agency'
          when 'producer' then '/production'
          else '/artist/home'
        end,
        'returnTo', p_return_to,
        'rationale', 'server_active_context'
      );
    end if;
  end if;

  select count(*) into v_count
    from public.organization_membership
   where person_id = v_uid and status = 'active';

  if v_count = 1 then
    select m.id membership_id, m.org_role, o.id organization_id, o.name,
           o.workspace_type, r.id role_id, r.functional_role
      into v_membership
      from public.organization_membership m
      join public.organization o on o.id = m.organization_id
      left join lateral (
        select ra.id, ra.functional_role
          from public.role_assignment ra
         where ra.organization_id = o.id and ra.person_id = v_uid
         order by ra.created_at
         limit 1
      ) r on true
     where m.person_id = v_uid and m.status = 'active';
    return jsonb_build_object(
      'outcome', 'RESOLVED_PRIMARY', 'contextVersion', coalesce(v_active.context_version, 0),
      'workspace', jsonb_build_object('id', v_membership.organization_id, 'name', v_membership.name,
        'type', v_membership.workspace_type),
      'role', jsonb_build_object('id', coalesce(v_membership.role_id, v_membership.membership_id),
        'type', coalesce(v_membership.functional_role, v_membership.org_role)),
      'route', case v_membership.workspace_type when 'management' then '/agency'
        when 'producer' then '/production' else '/artist/home' end,
      'returnTo', p_return_to, 'rationale', 'single_eligible_workspace'
    );
  elsif v_count > 1 then
    return jsonb_build_object('outcome', 'CHOICE_REQUIRED',
      'contextVersion', coalesce(v_active.context_version, 0), 'eligibleCount', v_count,
      'returnTo', p_return_to);
  end if;

  select lower(email) into v_email from auth.users where id = v_uid;
  if exists (
    select 1 from public.organization_membership
     where status = 'invited' and lower(invited_email) = v_email
       and (invite_expires_at is null or invite_expires_at > now())
  ) then
    return jsonb_build_object('outcome', 'PENDING_ONLY', 'returnTo', p_return_to);
  end if;
  return jsonb_build_object('outcome', 'NO_ELIGIBLE', 'returnTo', p_return_to);
exception when others then
  return jsonb_build_object('outcome', 'ERROR_OR_OFFLINE', 'returnTo', p_return_to);
end;
$$;

create or replace function public.commit_workspace_context(
  p_target uuid,
  p_expected_context_version bigint,
  p_idempotency_key uuid,
  p_return_to text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_current public.active_role_context%rowtype;
  v_target record;
  v_receipt public.workspace_authority_receipt%rowtype;
  v_before jsonb;
  v_after jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_idempotency_key is null then raise exception 'idempotency_key_required'; end if;

  select * into v_receipt from public.workspace_authority_receipt
   where actor_id = v_uid and idempotency_key = p_idempotency_key;
  if v_receipt.id is not null then return v_receipt.after_state; end if;

  select * into v_current from public.active_role_context
   where person_id = v_uid for update;
  if coalesce(v_current.context_version, 0) <> coalesce(p_expected_context_version, 0) then
    raise exception 'context_version_conflict';
  end if;

  select m.id membership_id, m.org_role, o.id organization_id, o.name,
         o.workspace_type, r.id role_id, r.functional_role
    into v_target
    from public.organization_membership m
    join public.organization o on o.id = m.organization_id
    left join lateral (
      select ra.id, ra.functional_role from public.role_assignment ra
       where ra.organization_id = o.id and ra.person_id = v_uid
       order by ra.created_at limit 1
    ) r on true
   where m.person_id = v_uid and m.organization_id = p_target and m.status = 'active';
  if v_target.organization_id is null then raise exception 'workspace_not_eligible'; end if;

  v_before := jsonb_build_object('workspaceId', v_current.active_organization_id,
    'contextVersion', coalesce(v_current.context_version, 0));
  v_after := jsonb_build_object(
    'status', 'COMMITTED', 'contextVersion', coalesce(v_current.context_version, 0) + 1,
    'workspace', jsonb_build_object('id', v_target.organization_id, 'name', v_target.name,
      'type', v_target.workspace_type),
    'role', jsonb_build_object('id', coalesce(v_target.role_id, v_target.membership_id),
      'type', coalesce(v_target.functional_role, v_target.org_role)),
    'route', case v_target.workspace_type when 'management' then '/agency'
      when 'producer' then '/production' else '/artist/home' end,
    'returnTo', p_return_to
  );

  insert into public.active_role_context(person_id, active_organization_id, context_version, updated_at, last_receipt)
    values (v_uid, p_target, 1, now(), v_after)
  on conflict (person_id) do update
    set active_organization_id = excluded.active_organization_id,
        context_version = public.active_role_context.context_version + 1,
        updated_at = now(), last_receipt = v_after;

  insert into public.workspace_authority_receipt(actor_id, organization_id, action, idempotency_key,
    before_state, after_state)
  values (v_uid, p_target, 'context.switch', p_idempotency_key, v_before, v_after);
  return v_after;
end;
$$;

create or replace function public.rename_workspace(
  p_organization uuid, p_name text, p_expected_version bigint, p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_org public.organization%rowtype;
  v_name text := btrim(p_name);
  v_after jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select after_state into v_after from public.workspace_authority_receipt
   where actor_id=v_uid and idempotency_key=p_idempotency_key;
  if v_after is not null then return v_after; end if;
  if not public.has_org_role(p_organization, array['owner','admin']) then raise exception 'not_authorized'; end if;
  if v_name is null or char_length(v_name) < 2 or char_length(v_name) > 80
     or v_name ~ '[[:cntrl:]]' then raise exception 'workspace_name_invalid'; end if;
  select * into v_org from public.organization where id = p_organization for update;
  if v_org.id is null then raise exception 'workspace_not_found'; end if;
  if v_org.authority_version <> p_expected_version then raise exception 'workspace_version_conflict'; end if;
  if exists (select 1 from public.organization o where o.id <> p_organization
      and o.created_by = v_org.created_by and lower(btrim(o.name)) = lower(v_name)) then
    raise exception 'workspace_name_duplicate';
  end if;
  update public.organization set name = v_name, authority_version = authority_version + 1
   where id = p_organization;
  v_after := jsonb_build_object('status','COMMITTED','workspaceId',p_organization,
    'beforeName',v_org.name,'afterName',v_name,'beforeVersion',v_org.authority_version,
    'authorityVersion',v_org.authority_version + 1);
  insert into public.workspace_authority_receipt(actor_id, organization_id, action, idempotency_key,
    before_state, after_state) values (v_uid,p_organization,'workspace.rename',p_idempotency_key,
    jsonb_build_object('name',v_org.name,'authorityVersion',v_org.authority_version),v_after);
  return v_after;
end;
$$;

create or replace function public.resend_workspace_invitation(
  p_membership uuid, p_expected_version bigint, p_idempotency_key uuid
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := auth.uid(); v_member public.organization_membership%rowtype; v_after jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select after_state into v_after from public.workspace_authority_receipt
   where actor_id=v_uid and idempotency_key=p_idempotency_key;
  if v_after is not null then return v_after; end if;
  select * into v_member from public.organization_membership where id=p_membership for update;
  if v_member.id is null or v_member.status <> 'invited' then raise exception 'invitation_not_pending'; end if;
  if not public.has_org_role(v_member.organization_id,array['owner','admin']) then raise exception 'not_authorized'; end if;
  if v_member.authority_version <> p_expected_version then raise exception 'membership_version_conflict'; end if;
  if v_member.invite_expires_at is not null and v_member.invite_expires_at <= now() then
    update public.organization_membership set status='expired',authority_version=authority_version+1 where id=p_membership;
    raise exception 'invitation_expired';
  end if;
  update public.organization_membership set invite_last_sent_at=now(),authority_version=authority_version+1 where id=p_membership;
  v_after := jsonb_build_object('status','DELIVERY_REQUIRED','membershipId',p_membership,
    'authorityVersion',v_member.authority_version+1,'expiresAt',v_member.invite_expires_at);
  insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
    values(v_uid,v_member.organization_id,'invitation.resend',p_idempotency_key,
      jsonb_build_object('authorityVersion',v_member.authority_version),v_after);
  return v_after;
end; $$;

create or replace function public.cancel_workspace_invitation(
  p_membership uuid, p_expected_version bigint, p_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); v_member public.organization_membership%rowtype; v_after jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select after_state into v_after from public.workspace_authority_receipt
   where actor_id=v_uid and idempotency_key=p_idempotency_key;
  if v_after is not null then return v_after; end if;
  select * into v_member from public.organization_membership where id=p_membership for update;
  if v_member.id is null or v_member.status <> 'invited' then raise exception 'invitation_not_pending'; end if;
  if not public.has_org_role(v_member.organization_id,array['owner','admin']) then raise exception 'not_authorized'; end if;
  if v_member.authority_version <> p_expected_version then raise exception 'membership_version_conflict'; end if;
  update public.organization_membership set status='cancelled',invite_token=null,
    authority_version=authority_version+1 where id=p_membership;
  v_after:=jsonb_build_object('status','COMMITTED','membershipId',p_membership,
    'membershipStatus','cancelled','authorityVersion',v_member.authority_version+1);
  insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
    values(v_uid,v_member.organization_id,'invitation.cancel',p_idempotency_key,
      jsonb_build_object('status',v_member.status,'authorityVersion',v_member.authority_version),v_after);
  return v_after;
end; $$;

create or replace function public.change_workspace_member_authority(
  p_membership uuid, p_role text, p_status text, p_expected_version bigint, p_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); v_member public.organization_membership%rowtype; v_after jsonb; v_owner_count integer;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select after_state into v_after from public.workspace_authority_receipt
   where actor_id=v_uid and idempotency_key=p_idempotency_key;
  if v_after is not null then return v_after; end if;
  select * into v_member from public.organization_membership where id=p_membership for update;
  if v_member.id is null then raise exception 'membership_not_found'; end if;
  if not public.has_org_role(v_member.organization_id,array['owner']) then raise exception 'owner_required'; end if;
  if p_role not in ('owner','admin','member') or p_status not in ('active','suspended','revoked') then
    raise exception 'membership_authority_invalid'; end if;
  if v_member.authority_version <> p_expected_version then raise exception 'membership_version_conflict'; end if;
  if v_member.org_role='owner' and (p_role<>'owner' or p_status<>'active') then
    select count(*) into v_owner_count from public.organization_membership
     where organization_id=v_member.organization_id and org_role='owner' and status='active';
    if v_owner_count <= 1 then raise exception 'last_active_owner_required'; end if;
  end if;
  update public.organization_membership set org_role=p_role,status=p_status,
    suspended_at=case when p_status='suspended' then now() else null end,
    authority_version=authority_version+1 where id=p_membership;
  v_after:=jsonb_build_object('status','COMMITTED','membershipId',p_membership,'role',p_role,
    'membershipStatus',p_status,'authorityVersion',v_member.authority_version+1);
  insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
   values(v_uid,v_member.organization_id,'membership.change',p_idempotency_key,
    jsonb_build_object('role',v_member.org_role,'status',v_member.status,'authorityVersion',v_member.authority_version),v_after);
  return v_after;
end; $$;

create or replace function public.transfer_workspace_ownership(
  p_organization uuid, p_successor_membership uuid, p_expected_owner_version bigint,
  p_expected_successor_version bigint, p_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); v_owner public.organization_membership%rowtype;
  v_successor public.organization_membership%rowtype; v_after jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select after_state into v_after from public.workspace_authority_receipt
   where actor_id=v_uid and idempotency_key=p_idempotency_key;
  if v_after is not null then return v_after; end if;
  select * into v_owner from public.organization_membership
   where organization_id=p_organization and person_id=v_uid and org_role='owner' and status='active' for update;
  if v_owner.id is null then raise exception 'owner_required'; end if;
  select * into v_successor from public.organization_membership
   where id=p_successor_membership and organization_id=p_organization and status='active' for update;
  if v_successor.id is null or v_successor.person_id is null then raise exception 'successor_not_eligible'; end if;
  if v_owner.authority_version<>p_expected_owner_version or v_successor.authority_version<>p_expected_successor_version then
    raise exception 'membership_version_conflict'; end if;
  update public.organization_membership set org_role='admin',authority_version=authority_version+1 where id=v_owner.id;
  update public.organization_membership set org_role='owner',authority_version=authority_version+1 where id=v_successor.id;
  v_after:=jsonb_build_object('status','COMMITTED','organizationId',p_organization,
    'previousOwnerMembershipId',v_owner.id,'ownerMembershipId',v_successor.id);
  insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
    values(v_uid,p_organization,'ownership.transfer',p_idempotency_key,
      jsonb_build_object('ownerMembershipId',v_owner.id),v_after);
  return v_after;
end; $$;

revoke all on function public.resolve_primary_workspace(text) from public, anon;
revoke all on function public.commit_workspace_context(uuid,bigint,uuid,text) from public, anon;
revoke all on function public.rename_workspace(uuid,text,bigint,uuid) from public, anon;
revoke all on function public.resend_workspace_invitation(uuid,bigint,uuid) from public, anon;
revoke all on function public.cancel_workspace_invitation(uuid,bigint,uuid) from public, anon;
revoke all on function public.change_workspace_member_authority(uuid,text,text,bigint,uuid) from public, anon;
revoke all on function public.transfer_workspace_ownership(uuid,uuid,bigint,bigint,uuid) from public, anon;

grant execute on function public.resolve_primary_workspace(text) to authenticated;
grant execute on function public.commit_workspace_context(uuid,bigint,uuid,text) to authenticated;
grant execute on function public.rename_workspace(uuid,text,bigint,uuid) to authenticated;
grant execute on function public.resend_workspace_invitation(uuid,bigint,uuid) to authenticated;
grant execute on function public.cancel_workspace_invitation(uuid,bigint,uuid) to authenticated;
grant execute on function public.change_workspace_member_authority(uuid,text,text,bigint,uuid) to authenticated;
grant execute on function public.transfer_workspace_ownership(uuid,uuid,bigint,bigint,uuid) to authenticated;

comment on table public.workspace_authority_receipt is
  'Immutable server receipts for Workspace context and authority transactions. No browser enumeration.';
