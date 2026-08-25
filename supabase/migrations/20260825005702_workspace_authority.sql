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
  check (status in ('active', 'inactive', 'invited', 'suspended', 'cancelled', 'declined', 'revoked', 'expired'));

update public.organization_membership
   set invite_expires_at = coalesce(invite_expires_at, created_at + interval '14 days')
 where status = 'invited';

do $$
begin
  if exists (
    select 1
      from public.organization_membership
     where status='invited' and invited_email is not null
     group by organization_id, lower(btrim(invited_email))
    having count(*) > 1
  ) then
    raise exception 'workspace_invitation_duplicate_reconciliation_required';
  end if;
end;
$$;

create unique index if not exists workspace_pending_invitation_email_unique
  on public.organization_membership(organization_id, (lower(btrim(invited_email))))
  where status='invited' and invited_email is not null;

create table if not exists public.workspace_authority_receipt (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete restrict,
  organization_id uuid references public.organization(id) on delete set null,
  action text not null check (action in (
    'context.switch', 'workspace.rename', 'invitation.create', 'invitation.accept', 'invitation.decline',
    'invitation.resend', 'invitation.cancel',
    'membership.change', 'ownership.offer', 'ownership.respond',
    'ownership.cancel', 'ownership.transfer'
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

create table if not exists public.workspace_ownership_offer (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  outgoing_owner_membership_id uuid not null references public.organization_membership(id) on delete restrict,
  successor_membership_id uuid not null references public.organization_membership(id) on delete restrict,
  successor_person_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','cancelled','expired','invalidated')),
  workspace_version bigint not null,
  owner_version bigint not null,
  successor_version bigint not null,
  outgoing_context_version bigint not null,
  accepted_context_version bigint,
  expires_at timestamptz not null,
  proposed_by uuid not null references auth.users(id) on delete restrict,
  accepted_at timestamptz,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists workspace_ownership_offer_one_pending
  on public.workspace_ownership_offer(organization_id, outgoing_owner_membership_id)
  where status = 'pending';

alter table public.workspace_ownership_offer enable row level security;
alter table public.workspace_ownership_offer force row level security;
revoke all on table public.workspace_ownership_offer from public, anon, authenticated;

-- All authority-changing RPCs acquire this same Workspace row lock before
-- locking memberships or counting owners. That makes the last-owner invariant
-- serializable even when two owners act concurrently.
create or replace function public.lock_workspace_authority(p_organization uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare v_version bigint;
begin
  select authority_version into v_version
    from public.organization where id=p_organization for update;
  if v_version is null then raise exception 'workspace_not_found'; end if;
  return v_version;
end;
$$;

-- Browser clients may read the two authority surfaces, but every mutation is
-- RPC-only so no RLS write path can bypass version, receipt or owner guards.
drop policy if exists mem_admin_write on public.organization_membership;
revoke insert, update, delete on public.organization_membership from anon, authenticated;
drop policy if exists ra_admin_write on public.role_assignment;
revoke insert, update, delete on public.role_assignment from anon, authenticated;
drop policy if exists org_admin_update on public.organization;
revoke update on public.organization from anon, authenticated;
drop policy if exists arc_self on public.active_role_context;
drop policy if exists arc_self_read on public.active_role_context;
create policy arc_self_read on public.active_role_context for select
  using (person_id = auth.uid());
revoke insert, update, delete on public.active_role_context from anon, authenticated;

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

drop function if exists public.invite_member(uuid,text,text);
create function public.invite_member(
  p_org uuid, p_email text, p_role text, p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_token text;
  v_role text := coalesce(nullif(p_role, ''), 'member');
  v_email text := lower(btrim(p_email));
  v_membership uuid;
  v_expires_at timestamptz;
  v_after jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_idempotency_key is null then raise exception 'idempotency_key_required'; end if;
  select after_state into v_after from public.workspace_authority_receipt
   where actor_id=v_uid and action='invitation.create' and idempotency_key=p_idempotency_key;
  if v_after is not null then return v_after; end if;
  if v_email is null or char_length(v_email)>320
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
    raise exception 'invitation_email_invalid';
  end if;
  if v_role not in ('member','admin') then raise exception 'workspace_owner_invite_forbidden'; end if;
  perform public.lock_workspace_authority(p_org);
  if not public.has_org_role(p_org, array['owner','admin']) then raise exception 'not_authorized'; end if;
  if exists (
    select 1 from public.organization_membership
     where organization_id=p_org and status='invited'
       and lower(btrim(invited_email))=v_email
  ) then
    raise exception 'invitation_pending_duplicate';
  end if;
  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.organization_membership(
    organization_id, person_id, org_role, status, invited_email, invited_by, invite_token
  ) values (p_org, null, v_role, 'invited', v_email, v_uid, v_token)
  returning id, invite_expires_at into v_membership, v_expires_at;
  v_after:=jsonb_build_object('status','DELIVERY_REQUIRED','membershipId',v_membership,
    'token',v_token,'expiresAt',v_expires_at,'authorityVersion',1);
  insert into public.workspace_authority_receipt(
    actor_id,organization_id,action,idempotency_key,before_state,after_state
  ) values (
    v_uid,p_org,'invitation.create',p_idempotency_key,
    jsonb_build_object('email',v_email,'role',v_role),v_after
  );
  return v_after;
end;
$$;

drop function if exists public.accept_invite(text);
create function public.accept_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_member public.organization_membership%rowtype;
  v_workspace_type text;
  v_replay jsonb;
  v_hash text := encode(public.digest(p_token, 'sha256'), 'hex');
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select after_state into v_replay from public.workspace_authority_receipt
   where actor_id=v_uid and action='invitation.accept' and before_state->>'tokenHash'=v_hash;
  if v_replay is not null then return (v_replay->>'organizationId')::uuid; end if;

  select * into v_member from public.organization_membership
   where invite_token=p_token and status='invited' for update;
  if v_member.id is null then raise exception 'invitation_invalid_or_used'; end if;
  if v_member.org_role = 'owner' then raise exception 'invitation_owner_role_forbidden'; end if;
  if v_member.invite_expires_at is not null and v_member.invite_expires_at<=now() then
    update public.organization_membership set status='expired',invite_token=null,
      authority_version=authority_version+1 where id=v_member.id;
    insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
      values(v_uid,v_member.organization_id,'invitation.accept',v_member.id,
        jsonb_build_object('tokenHash',v_hash,'membershipId',v_member.id,'status','invited'),
        jsonb_build_object('status','EXPIRED','organizationId',v_member.organization_id,'membershipId',v_member.id));
    return null;
  end if;
  select lower(email) into v_email from auth.users where id=v_uid;
  if v_member.invited_email is not null and lower(v_member.invited_email)<>coalesce(v_email,'') then
    raise exception 'invitation_wrong_person';
  end if;

  insert into public.person(id,email) values(v_uid,v_email) on conflict(id) do nothing;
  update public.organization_membership set person_id=v_uid,status='active',joined_at=now(),
    invite_token=null,authority_version=authority_version+1 where id=v_member.id;
  select workspace_type into v_workspace_type from public.organization where id=v_member.organization_id;
  insert into public.role_assignment(organization_id,person_id,functional_role)
    values(v_member.organization_id,v_uid,case v_workspace_type
      when 'artist' then 'artist'
      when 'producer' then 'producer'
      else 'artist_manager'
    end)
    on conflict do nothing;
  insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
    values(v_uid,v_member.organization_id,'invitation.accept',v_member.id,
      jsonb_build_object('tokenHash',v_hash,'membershipId',v_member.id,'status','invited'),
      jsonb_build_object('status','COMMITTED','organizationId',v_member.organization_id,
        'membershipId',v_member.id,'membershipStatus','active','authorityVersion',v_member.authority_version+1));
  return v_member.organization_id;
end;
$$;

create or replace function public.decline_workspace_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_member public.organization_membership%rowtype;
  v_after jsonb;
  v_hash text := encode(public.digest(p_token, 'sha256'), 'hex');
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select after_state into v_after from public.workspace_authority_receipt
   where actor_id=v_uid and action='invitation.decline' and before_state->>'tokenHash'=v_hash;
  if v_after is not null then return v_after; end if;
  select * into v_member from public.organization_membership
   where invite_token=p_token and status='invited' for update;
  if v_member.id is null then raise exception 'invitation_invalid_or_used'; end if;
  select lower(email) into v_email from auth.users where id=v_uid;
  if v_member.invited_email is not null and lower(v_member.invited_email)<>coalesce(v_email,'') then
    raise exception 'invitation_wrong_person';
  end if;
  update public.organization_membership set status='declined',invite_token=null,
    authority_version=authority_version+1 where id=v_member.id;
  v_after:=jsonb_build_object('status','COMMITTED','organizationId',v_member.organization_id,
    'membershipId',v_member.id,'membershipStatus','declined','authorityVersion',v_member.authority_version+1);
  insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
    values(v_uid,v_member.organization_id,'invitation.decline',v_member.id,
      jsonb_build_object('tokenHash',v_hash,'membershipId',v_member.id,'status','invited'),v_after);
  return v_after;
end;
$$;

create or replace function public.get_workspace_creation_capabilities()
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select case when auth.uid() is null
    then array[]::text[]
    else array['artist','management','producer']::text[]
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
  if v_name is null or char_length(v_name) < 2 or char_length(v_name) > 80
     or v_name ~ '[[:cntrl:]]' then raise exception 'workspace_name_invalid'; end if;
  perform public.lock_workspace_authority(p_organization);
  if not public.has_org_role(p_organization, array['owner','admin']) then raise exception 'not_authorized'; end if;
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
  select * into v_member from public.organization_membership where id=p_membership;
  if v_member.id is null then raise exception 'invitation_not_pending'; end if;
  perform public.lock_workspace_authority(v_member.organization_id);
  select * into v_member from public.organization_membership where id=p_membership for update;
  if not public.has_org_role(v_member.organization_id,array['owner','admin']) then raise exception 'not_authorized'; end if;
  if v_member.status <> 'invited' then raise exception 'invitation_not_pending'; end if;
  if v_member.authority_version <> p_expected_version then raise exception 'membership_version_conflict'; end if;
  if v_member.invite_expires_at is not null and v_member.invite_expires_at <= now() then
    update public.organization_membership set status='expired',authority_version=authority_version+1 where id=p_membership;
    v_after:=jsonb_build_object('status','EXPIRED','membershipId',p_membership,
      'authorityVersion',v_member.authority_version+1);
    insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
      values(v_uid,v_member.organization_id,'invitation.resend',p_idempotency_key,
        jsonb_build_object('authorityVersion',v_member.authority_version),v_after);
    return v_after;
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
  select * into v_member from public.organization_membership where id=p_membership;
  if v_member.id is null then raise exception 'invitation_not_pending'; end if;
  perform public.lock_workspace_authority(v_member.organization_id);
  select * into v_member from public.organization_membership where id=p_membership for update;
  if not public.has_org_role(v_member.organization_id,array['owner','admin']) then raise exception 'not_authorized'; end if;
  if v_member.status <> 'invited' then raise exception 'invitation_not_pending'; end if;
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
  select * into v_member from public.organization_membership where id=p_membership;
  if v_member.id is null then raise exception 'membership_not_found'; end if;
  perform public.lock_workspace_authority(v_member.organization_id);
  select * into v_member from public.organization_membership where id=p_membership for update;
  if not public.has_org_role(v_member.organization_id,array['owner']) then raise exception 'owner_required'; end if;
  if v_member.person_id is null then raise exception 'membership_person_required'; end if;
  if v_member.status not in ('active','suspended') then raise exception 'membership_state_terminal'; end if;
  if p_role = 'owner' then raise exception 'ownership_offer_required'; end if;
  if p_role not in ('admin','member') or p_status not in ('active','suspended','revoked') then
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

create or replace function public.offer_workspace_ownership(
  p_organization uuid, p_successor_membership uuid, p_expected_workspace_version bigint,
  p_expected_owner_version bigint, p_expected_successor_version bigint,
  p_expected_context_version bigint, p_expires_at timestamptz, p_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); v_owner public.organization_membership%rowtype;
  v_successor public.organization_membership%rowtype; v_after jsonb; v_offer uuid;
  v_workspace_version bigint; v_context public.active_role_context%rowtype;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select after_state into v_after from public.workspace_authority_receipt
   where actor_id=v_uid and idempotency_key=p_idempotency_key;
  if v_after is not null then return v_after; end if;
  if p_expires_at is null or p_expires_at<=now() or p_expires_at>now()+interval '14 days' then
    raise exception 'ownership_offer_expiry_invalid';
  end if;
  v_workspace_version:=public.lock_workspace_authority(p_organization);
  if v_workspace_version<>p_expected_workspace_version then raise exception 'workspace_version_conflict'; end if;
  select * into v_owner from public.organization_membership
   where organization_id=p_organization and person_id=v_uid and org_role='owner' and status='active' for update;
  if v_owner.id is null then raise exception 'owner_required'; end if;
  select * into v_successor from public.organization_membership
   where id=p_successor_membership and organization_id=p_organization and status='active' for update;
  if v_successor.id is null or v_successor.person_id is null then raise exception 'successor_not_eligible'; end if;
  if v_successor.id=v_owner.id then raise exception 'successor_not_eligible'; end if;
  if v_owner.authority_version<>p_expected_owner_version or v_successor.authority_version<>p_expected_successor_version then
    raise exception 'membership_version_conflict'; end if;
  select * into v_context from public.active_role_context where person_id=v_uid for update;
  if v_context.active_organization_id<>p_organization
     or coalesce(v_context.context_version,0)<>p_expected_context_version then
    raise exception 'context_version_conflict';
  end if;
  if v_successor.org_role='owner' then
    update public.organization_membership set org_role='admin',authority_version=authority_version+1
      where id=v_owner.id;
    v_after:=jsonb_build_object('status','COMMITTED','organizationId',p_organization,
      'previousOwnerMembershipId',v_owner.id,'ownerMembershipId',v_successor.id,
      'acceptanceRequired',false);
  else
    update public.workspace_ownership_offer set status='cancelled'
      where organization_id=p_organization and outgoing_owner_membership_id=v_owner.id
        and status='pending';
    insert into public.workspace_ownership_offer(
      organization_id,outgoing_owner_membership_id,successor_membership_id,successor_person_id,
      workspace_version,owner_version,successor_version,outgoing_context_version,expires_at,proposed_by
    ) values(p_organization,v_owner.id,v_successor.id,v_successor.person_id,
      v_workspace_version,v_owner.authority_version,v_successor.authority_version,
      v_context.context_version,p_expires_at,v_uid)
    returning id into v_offer;
    v_after:=jsonb_build_object('status','PENDING_ACCEPTANCE','offerId',v_offer,
      'organizationId',p_organization,'successorMembershipId',v_successor.id,
      'expiresAt',p_expires_at,'acceptanceRequired',true);
  end if;
  insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
    values(v_uid,p_organization,case when v_successor.org_role='owner' then 'ownership.transfer' else 'ownership.offer' end,
      p_idempotency_key,
      jsonb_build_object('ownerMembershipId',v_owner.id,'ownerVersion',v_owner.authority_version,
        'successorMembershipId',v_successor.id,'successorVersion',v_successor.authority_version,
        'workspaceVersion',v_workspace_version),v_after);
  return v_after;
end; $$;

create or replace function public.list_my_workspace_ownership_offers(p_organization uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',o.id,'status',o.status,'organizationId',o.organization_id,
    'successorMembershipId',o.successor_membership_id,'successorPersonId',o.successor_person_id,
    'outgoingOwnerMembershipId',o.outgoing_owner_membership_id,'expiresAt',o.expires_at,
    'workspaceVersion',o.workspace_version,'ownerVersion',o.owner_version,
    'successorVersion',o.successor_version,'outgoingContextVersion',o.outgoing_context_version,
    'acceptedContextVersion',o.accepted_context_version
  ) order by o.created_at desc),'[]'::jsonb)
  from public.workspace_ownership_offer o
  where o.organization_id=p_organization
    and (o.successor_person_id=auth.uid() or o.proposed_by=auth.uid())
    and o.status in ('pending','accepted');
$$;

create or replace function public.respond_workspace_ownership_offer(
  p_offer uuid, p_decision text, p_expected_successor_version bigint,
  p_expected_context_version bigint, p_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); v_offer public.workspace_ownership_offer%rowtype;
  v_successor public.organization_membership%rowtype; v_owner public.organization_membership%rowtype;
  v_context public.active_role_context%rowtype; v_owner_context public.active_role_context%rowtype;
  v_after jsonb; v_workspace_version bigint;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_decision not in ('accepted','declined') then raise exception 'ownership_response_invalid'; end if;
  select after_state into v_after from public.workspace_authority_receipt
    where actor_id=v_uid and idempotency_key=p_idempotency_key;
  if v_after is not null then return v_after; end if;
  select * into v_offer from public.workspace_ownership_offer where id=p_offer;
  if v_offer.id is null then raise exception 'ownership_offer_not_found'; end if;
  v_workspace_version:=public.lock_workspace_authority(v_offer.organization_id);
  select * into v_offer from public.workspace_ownership_offer where id=p_offer for update;
  if v_offer.status<>'pending' then raise exception 'ownership_offer_not_pending'; end if;
  if v_offer.expires_at<=now() then
    update public.workspace_ownership_offer set status='expired' where id=p_offer;
    v_after:=jsonb_build_object('status','EXPIRED','offerId',p_offer,'organizationId',v_offer.organization_id);
    insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
      values(v_uid,v_offer.organization_id,'ownership.respond',p_idempotency_key,
        jsonb_build_object('offerId',p_offer,'status','pending'),v_after);
    return v_after;
  end if;
  if v_offer.successor_person_id<>v_uid then raise exception 'ownership_offer_wrong_person'; end if;
  select * into v_successor from public.organization_membership
    where id=v_offer.successor_membership_id and organization_id=v_offer.organization_id for update;
  select * into v_owner from public.organization_membership
    where id=v_offer.outgoing_owner_membership_id and organization_id=v_offer.organization_id for update;
  select * into v_context from public.active_role_context where person_id=v_uid for update;
  select * into v_owner_context from public.active_role_context where person_id=v_offer.proposed_by for update;
  if v_workspace_version<>v_offer.workspace_version
     or v_owner.id is null or v_owner.org_role<>'owner' or v_owner.status<>'active'
     or v_owner.authority_version<>v_offer.owner_version
     or v_successor.status<>'active' or v_successor.person_id<>v_uid
     or v_successor.authority_version<>p_expected_successor_version
     or v_successor.authority_version<>v_offer.successor_version
     or coalesce(v_owner_context.context_version,0)<>v_offer.outgoing_context_version then
    update public.workspace_ownership_offer set status='invalidated' where id=p_offer;
    v_after:=jsonb_build_object('status','INVALIDATED','offerId',p_offer,'organizationId',v_offer.organization_id);
    insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
      values(v_uid,v_offer.organization_id,'ownership.respond',p_idempotency_key,
        jsonb_build_object('offerId',p_offer,'status','pending'),v_after);
    return v_after;
  end if;
  if v_context.active_organization_id<>v_offer.organization_id
     or coalesce(v_context.context_version,0)<>p_expected_context_version then
    update public.workspace_ownership_offer set status='invalidated' where id=p_offer;
    v_after:=jsonb_build_object('status','INVALIDATED','offerId',p_offer,'organizationId',v_offer.organization_id);
    insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
      values(v_uid,v_offer.organization_id,'ownership.respond',p_idempotency_key,
        jsonb_build_object('offerId',p_offer,'status','pending'),v_after);
    return v_after;
  end if;
  if p_decision='accepted' then
    update public.organization_membership set org_role='admin',authority_version=authority_version+1
      where id=v_owner.id;
    update public.organization_membership set org_role='owner',authority_version=authority_version+1
      where id=v_successor.id;
  end if;
  update public.workspace_ownership_offer set status=p_decision,
    accepted_context_version=case when p_decision='accepted' then v_context.context_version else null end,
    accepted_at=case when p_decision='accepted' then now() else null end where id=p_offer;
  v_after:=jsonb_build_object('status',case when p_decision='accepted' then 'COMMITTED' else 'DECLINED' end,
    'offerId',p_offer,'organizationId',v_offer.organization_id,'contextVersion',v_context.context_version,
    'previousOwnerMembershipId',v_owner.id,'ownerMembershipId',v_successor.id);
  insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
    values(v_uid,v_offer.organization_id,'ownership.respond',p_idempotency_key,
      jsonb_build_object('offerId',p_offer,'status','pending'),v_after);
  return v_after;
end; $$;

create or replace function public.cancel_workspace_ownership_offer(
  p_offer uuid, p_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); v_offer public.workspace_ownership_offer%rowtype; v_after jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select after_state into v_after from public.workspace_authority_receipt
    where actor_id=v_uid and idempotency_key=p_idempotency_key;
  if v_after is not null then return v_after; end if;
  select * into v_offer from public.workspace_ownership_offer where id=p_offer;
  if v_offer.id is null then raise exception 'ownership_offer_not_found'; end if;
  perform public.lock_workspace_authority(v_offer.organization_id);
  select * into v_offer from public.workspace_ownership_offer where id=p_offer for update;
  if v_offer.proposed_by<>v_uid then raise exception 'owner_required'; end if;
  if v_offer.status<>'pending' then raise exception 'ownership_offer_not_cancellable'; end if;
  update public.workspace_ownership_offer set status='cancelled' where id=p_offer;
  v_after:=jsonb_build_object('status','CANCELLED','offerId',p_offer,'organizationId',v_offer.organization_id);
  insert into public.workspace_authority_receipt(actor_id,organization_id,action,idempotency_key,before_state,after_state)
    values(v_uid,v_offer.organization_id,'ownership.cancel',p_idempotency_key,
      jsonb_build_object('offerId',p_offer,'status',v_offer.status),v_after);
  return v_after;
end; $$;

drop function if exists public.transfer_workspace_ownership(uuid,uuid,bigint,bigint,uuid);
create function public.transfer_workspace_ownership(
  p_organization uuid, p_successor_membership uuid, p_expected_workspace_version bigint,
  p_expected_owner_version bigint, p_expected_successor_version bigint,
  p_expected_context_version bigint, p_expires_at timestamptz, p_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  return public.offer_workspace_ownership(p_organization,p_successor_membership,
    p_expected_workspace_version,p_expected_owner_version,p_expected_successor_version,
    p_expected_context_version,p_expires_at,p_idempotency_key);
end; $$;

revoke all on function public.resolve_primary_workspace(text) from public, anon;
revoke all on function public.invite_member(uuid,text,text,uuid) from public, anon;
revoke all on function public.get_workspace_creation_capabilities() from public, anon;
revoke all on function public.accept_invite(text) from public, anon;
revoke all on function public.decline_workspace_invitation(text) from public, anon;
revoke all on function public.commit_workspace_context(uuid,bigint,uuid,text) from public, anon;
revoke all on function public.rename_workspace(uuid,text,bigint,uuid) from public, anon;
revoke all on function public.resend_workspace_invitation(uuid,bigint,uuid) from public, anon;
revoke all on function public.cancel_workspace_invitation(uuid,bigint,uuid) from public, anon;
revoke all on function public.change_workspace_member_authority(uuid,text,text,bigint,uuid) from public, anon;
revoke all on function public.lock_workspace_authority(uuid) from public, anon, authenticated;
revoke all on function public.offer_workspace_ownership(uuid,uuid,bigint,bigint,bigint,bigint,timestamptz,uuid) from public, anon, authenticated;
revoke all on function public.list_my_workspace_ownership_offers(uuid) from public, anon;
revoke all on function public.respond_workspace_ownership_offer(uuid,text,bigint,bigint,uuid) from public, anon;
revoke all on function public.cancel_workspace_ownership_offer(uuid,uuid) from public, anon;
revoke all on function public.transfer_workspace_ownership(uuid,uuid,bigint,bigint,bigint,bigint,timestamptz,uuid) from public, anon;

grant execute on function public.resolve_primary_workspace(text) to authenticated;
grant execute on function public.invite_member(uuid,text,text,uuid) to authenticated;
grant execute on function public.get_workspace_creation_capabilities() to authenticated;
grant execute on function public.accept_invite(text) to authenticated;
grant execute on function public.decline_workspace_invitation(text) to authenticated;
grant execute on function public.commit_workspace_context(uuid,bigint,uuid,text) to authenticated;
grant execute on function public.rename_workspace(uuid,text,bigint,uuid) to authenticated;
grant execute on function public.resend_workspace_invitation(uuid,bigint,uuid) to authenticated;
grant execute on function public.cancel_workspace_invitation(uuid,bigint,uuid) to authenticated;
grant execute on function public.change_workspace_member_authority(uuid,text,text,bigint,uuid) to authenticated;
grant execute on function public.list_my_workspace_ownership_offers(uuid) to authenticated;
grant execute on function public.respond_workspace_ownership_offer(uuid,text,bigint,bigint,uuid) to authenticated;
grant execute on function public.cancel_workspace_ownership_offer(uuid,uuid) to authenticated;
grant execute on function public.transfer_workspace_ownership(uuid,uuid,bigint,bigint,bigint,bigint,timestamptz,uuid) to authenticated;

comment on table public.workspace_authority_receipt is
  'Immutable server receipts for Workspace context and authority transactions. No browser enumeration.';
comment on table public.workspace_ownership_offer is
  'Single-use version-bound successor acceptance for Workspace ownership. RPC-only; no browser enumeration.';
