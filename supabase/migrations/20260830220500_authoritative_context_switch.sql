-- R15-KU10 — authoritative cross-Organization context switch.
-- SELECT/PREFLIGHT enumerates only active membership + compatible functional-role
-- targets. COMMIT rechecks authority under row locks, advances context_version,
-- and writes an immutable receipt in the same transaction. A roster row alone
-- is never Artist authority; an Artist target additionally requires ownership
-- in an Artist Workspace or an active, unexpired view-scoped ArtistAccess grant.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.active_role_context
  add column if not exists context_version bigint not null default 0;

create table if not exists public.context_switch_receipt (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.person(id) on delete restrict,
  idempotency_key uuid not null,
  previous_organization_id uuid references public.organization(id) on delete restrict,
  active_organization_id uuid not null references public.organization(id) on delete restrict,
  target_artist_id uuid references public.artists(id) on delete restrict,
  previous_context_version bigint not null check (previous_context_version >= 0),
  context_version bigint not null check (context_version = previous_context_version + 1),
  committed_at timestamptz not null default now(),
  unique (person_id, idempotency_key)
);

alter table public.context_switch_receipt enable row level security;
drop policy if exists context_switch_receipt_self_read on public.context_switch_receipt;
create policy context_switch_receipt_self_read on public.context_switch_receipt
  for select using (person_id = auth.uid());

revoke all on public.context_switch_receipt from public, anon, authenticated;
grant select on public.context_switch_receipt to authenticated;

-- A missing receipt is not terminal proof. Recovery records an immutable fence
-- under the same actor lock as commit, preventing a late original request.
-- Private bookkeeping has no caller-selected actor or direct client access.
create table if not exists private.context_switch_noncommit (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.person(id) on delete restrict,
  idempotency_key uuid not null,
  target_organization_id uuid not null,
  target_artist_id uuid,
  expected_context_version bigint not null check (expected_context_version >= 0),
  context_version bigint not null check (context_version >= 0),
  resolved_at timestamptz not null default now(),
  unique (person_id, idempotency_key)
);
revoke all on private.context_switch_noncommit from public, anon, authenticated;

-- The prior FOR ALL policy trusted a caller-written Organization id. Keep ARC
-- self-readable but route every mutation through commit_context_switch().
drop policy if exists arc_self on public.active_role_context;
drop policy if exists arc_self_read on public.active_role_context;
create policy arc_self_read on public.active_role_context
  for select using (person_id = auth.uid());
revoke insert, update, delete on public.active_role_context from public, anon, authenticated;
grant select on public.active_role_context to authenticated;

create or replace function private.context_role_allowed(workspace_type text, functional_role text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case workspace_type
    when 'artist' then functional_role = 'artist'
    when 'management' then functional_role = any(array[
      'booking_manager','artist_manager','booking_agent','roster_coordinator','viewer','booker','agency'
    ]::text[])
    when 'producer' then functional_role = any(array[
      'producer','venue_programmer','booking_manager','artist_manager','booking_agent','roster_coordinator','viewer'
    ]::text[])
    else false
  end;
$$;

revoke all on function private.context_role_allowed(text, text) from public, anon, authenticated;

create or replace function private.context_target_is_authorized(
  actor uuid,
  target_organization uuid,
  target_artist uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select actor is not null and exists (
    select 1
    from public.organization organization
    join public.organization_membership membership
      on membership.organization_id = organization.id
     and membership.person_id = actor
     and membership.status = 'active'
    join lateral (
      select assignment.functional_role
      from public.role_assignment assignment
      where assignment.organization_id = organization.id
        and assignment.person_id = actor
      order by assignment.created_at desc, assignment.id desc
      limit 1
    ) role on true
    where organization.id = target_organization
      and private.context_role_allowed(organization.workspace_type, role.functional_role)
      and (
        target_artist is null
        or (
          organization.workspace_type = 'artist'
          and role.functional_role = 'artist'
          and exists (
            select 1 from public.artists artist
            where artist.id = target_artist
              and artist.owner_organization_id = organization.id
          )
        )
        or exists (
          select 1 from public.artist_access access
          where access.artist_id = target_artist
            and access.organization_id = organization.id
            and access.status = 'active'
            and (access.expires_at is null or access.expires_at > now())
            and 'view' = any(access.scope)
        )
      )
  );
$$;

revoke all on function private.context_target_is_authorized(uuid, uuid, uuid)
  from public, anon, authenticated;

create or replace function public.select_context_switch_targets()
returns table (
  membership_id uuid,
  organization_id uuid,
  organization_name text,
  organization_slug text,
  plan text,
  workspace_type text,
  org_role text,
  functional_role text,
  active_organization_id uuid,
  context_version bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select membership.id,
         organization.id,
         organization.name,
         organization.slug,
         organization.plan,
         organization.workspace_type,
         membership.org_role,
         role.functional_role,
         context.active_organization_id,
         coalesce(context.context_version, 0)
  from public.organization_membership membership
  join public.organization organization on organization.id = membership.organization_id
  join lateral (
    select assignment.functional_role
    from public.role_assignment assignment
    where assignment.organization_id = organization.id
      and assignment.person_id = auth.uid()
    order by assignment.created_at desc, assignment.id desc
    limit 1
  ) role on true
  left join public.active_role_context context on context.person_id = auth.uid()
  where auth.uid() is not null
    and membership.person_id = auth.uid()
    and membership.status = 'active'
    and private.context_role_allowed(organization.workspace_type, role.functional_role)
  order by organization.created_at, organization.id;
$$;

revoke all on function public.select_context_switch_targets() from public, anon;
grant execute on function public.select_context_switch_targets() to authenticated;

create or replace function public.preflight_context_switch(
  p_target_organization_id uuid,
  p_target_artist_id uuid default null,
  p_expected_context_version bigint default 0
)
returns table (
  eligible boolean,
  denial_code text,
  target_organization_id uuid,
  target_organization_name text,
  target_functional_role text,
  expected_context_version bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_current_org uuid;
  v_current_version bigint;
  v_target_name text;
  v_target_role text;
begin
  select context.active_organization_id, context.context_version
    into v_current_org, v_current_version
  from public.active_role_context context
  where context.person_id = auth.uid();

  if auth.uid() is null
     or v_current_org is null
     or v_current_version is distinct from p_expected_context_version
     or p_target_organization_id is null
     or p_target_organization_id = v_current_org
     or not private.context_target_is_authorized(auth.uid(), p_target_organization_id, p_target_artist_id) then
    return query select false, 'context_not_available'::text, null::uuid, null::text, null::text, v_current_version;
    return;
  end if;

  select organization.name, role.functional_role
    into v_target_name, v_target_role
  from public.organization organization
  join lateral (
    select assignment.functional_role
    from public.role_assignment assignment
    where assignment.organization_id = organization.id
      and assignment.person_id = auth.uid()
    order by assignment.created_at desc, assignment.id desc
    limit 1
  ) role on true
  where organization.id = p_target_organization_id;

  return query select true, null::text, p_target_organization_id, v_target_name, v_target_role, v_current_version;
end;
$$;

revoke all on function public.preflight_context_switch(uuid, uuid, bigint) from public, anon;
grant execute on function public.preflight_context_switch(uuid, uuid, bigint) to authenticated;

create or replace function public.commit_context_switch(
  p_target_organization_id uuid,
  p_target_artist_id uuid default null,
  p_expected_context_version bigint default 0,
  p_idempotency_key uuid default null
)
returns table (
  receipt_id uuid,
  idempotency_key uuid,
  previous_organization_id uuid,
  active_organization_id uuid,
  target_artist_id uuid,
  previous_context_version bigint,
  context_version bigint,
  committed_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_previous_org uuid;
  v_previous_version bigint;
  v_workspace_type text;
  v_functional_role text;
  v_receipt public.context_switch_receipt%rowtype;
  v_replay boolean;
begin
  if v_actor is null or p_target_organization_id is null or p_idempotency_key is null then
    raise exception using errcode = 'P0001', message = 'context_switch_not_available';
  end if;

  -- Serialize first, including retries. A waiting identical request must see
  -- the winner's receipt before evaluating its original expected version.
  select context.active_organization_id, context.context_version
    into v_previous_org, v_previous_version
  from public.active_role_context context
  where context.person_id = v_actor
  for update;

  if not found or v_previous_org is null then
    raise exception using errcode = 'P0001', message = 'context_switch_stale';
  end if;

  if exists (select 1 from private.context_switch_noncommit fence
             where fence.person_id = v_actor and fence.idempotency_key = p_idempotency_key) then
    raise exception using errcode = 'P0001', message = 'context_switch_conflict';
  end if;

  select receipt.* into v_receipt
  from public.context_switch_receipt receipt
  where receipt.person_id = v_actor and receipt.idempotency_key = p_idempotency_key;
  v_replay := found;
  if v_replay then
    if v_receipt.active_organization_id is distinct from p_target_organization_id
       or v_receipt.target_artist_id is distinct from p_target_artist_id
       or v_receipt.previous_context_version is distinct from p_expected_context_version then
      raise exception using errcode = 'P0001', message = 'context_switch_conflict';
    end if;
    -- Immutable history is not evidence of the actor's current context.
    if v_receipt.active_organization_id is distinct from v_previous_org
       or v_receipt.context_version is distinct from v_previous_version then
      raise exception using errcode = 'P0001', message = 'context_switch_stale';
    end if;
  else
    if v_previous_version is distinct from p_expected_context_version then
      raise exception using errcode = 'P0001', message = 'context_switch_stale';
    end if;
    if p_target_organization_id = v_previous_org then
      raise exception using errcode = 'P0001', message = 'context_switch_not_available';
    end if;
  end if;

  select organization.workspace_type
    into v_workspace_type
  from public.organization organization
  where organization.id = p_target_organization_id
  for share;

  select assignment.functional_role
    into v_functional_role
  from public.organization_membership membership
  join public.role_assignment assignment
    on assignment.organization_id = membership.organization_id
   and assignment.person_id = membership.person_id
  where membership.organization_id = p_target_organization_id
    and membership.person_id = v_actor
    and membership.status = 'active'
  order by assignment.created_at desc, assignment.id desc
  limit 1
  for update of membership, assignment;

  if v_workspace_type is null
     or v_functional_role is null
     or not private.context_role_allowed(v_workspace_type, v_functional_role) then
    raise exception using errcode = 'P0001', message = 'context_switch_not_available';
  end if;

  if p_target_artist_id is not null then
    if v_workspace_type = 'artist' and v_functional_role = 'artist' then
      perform 1 from public.artists artist
      where artist.id = p_target_artist_id
        and artist.owner_organization_id = p_target_organization_id
      for share;
    else
      perform 1 from public.artist_access access
      where access.artist_id = p_target_artist_id
        and access.organization_id = p_target_organization_id
        and access.status = 'active'
        and (access.expires_at is null or access.expires_at > now())
        and 'view' = any(access.scope)
      for update;
    end if;
    if not found then
      raise exception using errcode = 'P0001', message = 'context_switch_not_available';
    end if;
  end if;

  -- Replay still requires the same current membership, role and ArtistAccess.
  if v_replay then
    return query select v_receipt.id, v_receipt.idempotency_key,
      v_receipt.previous_organization_id, v_receipt.active_organization_id,
      v_receipt.target_artist_id, v_receipt.previous_context_version,
      v_receipt.context_version, v_receipt.committed_at;
    return;
  end if;

  update public.active_role_context context
     set active_organization_id = p_target_organization_id,
         context_version = v_previous_version + 1,
         updated_at = now()
   where context.person_id = v_actor;

  insert into public.context_switch_receipt (
    person_id, idempotency_key, previous_organization_id,
    active_organization_id, target_artist_id,
    previous_context_version, context_version
  ) values (
    v_actor, p_idempotency_key, v_previous_org,
    p_target_organization_id, p_target_artist_id,
    v_previous_version, v_previous_version + 1
  ) returning * into v_receipt;

  return query select v_receipt.id, v_receipt.idempotency_key,
    v_receipt.previous_organization_id, v_receipt.active_organization_id,
    v_receipt.target_artist_id, v_receipt.previous_context_version,
    v_receipt.context_version, v_receipt.committed_at;
end;
$$;

revoke all on function public.commit_context_switch(uuid, uuid, bigint, uuid) from public, anon;
grant execute on function public.commit_context_switch(uuid, uuid, bigint, uuid) to authenticated;

create or replace function public.resolve_context_switch_outcome(
  p_target_organization_id uuid,
  p_target_artist_id uuid default null,
  p_expected_context_version bigint default 0,
  p_idempotency_key uuid default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_current_org uuid;
  v_current_version bigint;
  v_receipt public.context_switch_receipt%rowtype;
  v_fence private.context_switch_noncommit%rowtype;
begin
  if v_actor is null or p_idempotency_key is null or p_target_organization_id is null
     or p_expected_context_version is null or p_expected_context_version < 0 then
    raise exception using errcode = 'P0001', message = 'context_switch_not_available';
  end if;

  -- Same lock and order as commit. An inflight commit must finish or roll back
  -- before reconciliation can prove either outcome. No timeout/SELECT inference.
  select context.active_organization_id, context.context_version
    into v_current_org, v_current_version
  from public.active_role_context context where context.person_id = v_actor
  for update;
  if not found or v_current_org is null then
    raise exception using errcode = 'P0001', message = 'context_switch_not_available';
  end if;

  select receipt.* into v_receipt from public.context_switch_receipt receipt
  where receipt.person_id = v_actor and receipt.idempotency_key = p_idempotency_key;
  if found then
    if v_receipt.active_organization_id is distinct from p_target_organization_id
       or v_receipt.target_artist_id is distinct from p_target_artist_id
       or v_receipt.previous_context_version is distinct from p_expected_context_version then
      raise exception using errcode = 'P0001', message = 'context_switch_conflict';
    end if;
    -- Terminal history, not a claim that this receipt is still current.
    return jsonb_build_object('outcome', 'committed', 'receipt', to_jsonb(v_receipt));
  end if;

  select fence.* into v_fence from private.context_switch_noncommit fence
  where fence.person_id = v_actor and fence.idempotency_key = p_idempotency_key;
  if found then
    if v_fence.target_organization_id is distinct from p_target_organization_id
       or v_fence.target_artist_id is distinct from p_target_artist_id
       or v_fence.expected_context_version is distinct from p_expected_context_version then
      raise exception using errcode = 'P0001', message = 'context_switch_conflict';
    end if;
  else
    -- Refresh the physical lock row without advancing the logical context.
    -- A delayed REPEATABLE READ/SERIALIZABLE caller with a pre-fence snapshot
    -- must fail serialization, not overlook a fence after waiting for the lock.
    update public.active_role_context context set context_version = context.context_version
    where context.person_id = v_actor;
    insert into private.context_switch_noncommit (
      person_id, idempotency_key, target_organization_id, target_artist_id,
      expected_context_version, context_version
    ) values (
      v_actor, p_idempotency_key, p_target_organization_id, p_target_artist_id,
      p_expected_context_version, v_current_version
    ) returning * into v_fence;
  end if;
  return jsonb_build_object(
    'outcome', 'not_committed', 'outcomeId', v_fence.id,
    'idempotencyKey', v_fence.idempotency_key,
    'targetOrganizationId', v_fence.target_organization_id,
    'targetArtistId', v_fence.target_artist_id,
    'expectedContextVersion', v_fence.expected_context_version,
    'contextVersion', v_fence.context_version, 'resolvedAt', v_fence.resolved_at
  );
end;
$$;

revoke all on function public.resolve_context_switch_outcome(uuid, uuid, bigint, uuid) from public, anon;
grant execute on function public.resolve_context_switch_outcome(uuid, uuid, bigint, uuid) to authenticated;

create or replace function public.get_context_switch_receipt(p_idempotency_key uuid)
returns table (
  receipt_id uuid,
  idempotency_key uuid,
  previous_organization_id uuid,
  active_organization_id uuid,
  target_artist_id uuid,
  previous_context_version bigint,
  context_version bigint,
  committed_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select receipt.id, receipt.idempotency_key, receipt.previous_organization_id,
         receipt.active_organization_id, receipt.target_artist_id,
         receipt.previous_context_version, receipt.context_version, receipt.committed_at
  from public.context_switch_receipt receipt
  join public.active_role_context context
    on context.person_id = receipt.person_id
   and context.active_organization_id = receipt.active_organization_id
   and context.context_version = receipt.context_version
  where receipt.person_id = auth.uid()
    and receipt.idempotency_key = p_idempotency_key;
$$;

revoke all on function public.get_context_switch_receipt(uuid) from public, anon;
grant execute on function public.get_context_switch_receipt(uuid) to authenticated;

comment on table public.context_switch_receipt is
  'Immutable server receipt for an authoritative Organization context commit; retained for retry resolution and audit history.';
comment on function public.commit_context_switch(uuid, uuid, bigint, uuid) is
  'Atomically rechecks membership, compatible functional role and optional ArtistAccess, advances context_version and returns an idempotent receipt.';
