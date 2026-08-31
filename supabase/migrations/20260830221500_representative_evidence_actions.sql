-- KU03 / PD-002 / ACT-CONTRIBUTE, CHANGE, PROPOSE, CONFIRM, PUBLISH.
-- Forward only. No legacy evidence is reclassified or silently published.
-- Runtime bookkeeping is separate from Product measurement (MEAS-OPEN).
alter table public.act add column if not exists ku03_version bigint not null default 0;
alter table public.evidence_artifacts
  add column if not exists ku03_version bigint not null default 0,
  add column if not exists ku03_state text not null default 'legacy',
  add column if not exists ku03_title text,
  add column if not exists ku03_origin jsonb,
  add column if not exists ku03_prepared_statement text,
  add column if not exists ku03_claim_id uuid references public.claims(id) on delete restrict,
  add column if not exists ku03_rights boolean not null default false,
  add column if not exists ku03_visibility boolean not null default false,
  add column if not exists ku03_conflict boolean not null default true;
alter table public.artist_access add column if not exists ku03_edit_fields text[] not null default '{}';
alter table public.passport_versions
  add column if not exists ku03_audience uuid,
  add column if not exists ku03_purpose text,
  add column if not exists ku03_expires_at timestamptz,
  add column if not exists ku03_object_id uuid;

create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create table if not exists private.evidence_action_history (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.person(id) on delete restrict,
  artist_id uuid not null references public.artists(id) on delete restrict,
  act_id uuid not null references public.act(id) on delete restrict,
  object_id uuid not null,
  request_key uuid not null,
  request jsonb not null,
  action text not null,
  authority jsonb not null,
  before_state jsonb,
  after_state jsonb,
  reason text,
  provenance text,
  receipt jsonb not null,
  committed_at timestamptz not null default clock_timestamp(),
  unique(actor_id,request_key)
);
create table if not exists private.evidence_action_noncommit (
  actor_id uuid not null references public.person(id) on delete restrict,
  request_key uuid not null,
  request jsonb not null,
  resolved_at timestamptz not null default clock_timestamp(),
  primary key(actor_id,request_key)
);
revoke all on private.evidence_action_history,private.evidence_action_noncommit from public,anon,authenticated;
alter table private.evidence_action_history enable row level security;
alter table private.evidence_action_noncommit enable row level security;

create or replace function private.evidence_history_immutable() returns trigger
language plpgsql set search_path='' as $$ begin
  raise exception using errcode='42501',message='evidence_action_unavailable';
end $$;
create trigger ku03_history_immutable before update or delete on private.evidence_action_history
for each row execute function private.evidence_history_immutable();
create trigger ku03_noncommit_immutable before update or delete on private.evidence_action_noncommit
for each row execute function private.evidence_history_immutable();

-- Locks prevent revocation/context changes racing an authorized commit. Latest
-- functional assignment wins; org title/roster and client state grant nothing.
create or replace function private.evidence_authority(a uuid, subject_act uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.active_role_context; m public.organization_membership;
  ar public.artists; assignment public.role_assignment; access public.artist_access;
  workspace public.organization; owning boolean;
begin
  if auth.uid() is null then raise exception 'denied'; end if;
  select * into c from public.active_role_context where person_id=auth.uid() for update;
  select * into m from public.organization_membership where person_id=auth.uid()
    and organization_id=c.active_organization_id and status='active' for share;
  select * into workspace from public.organization where id=c.active_organization_id;
  select * into assignment from public.role_assignment where person_id=auth.uid()
    and organization_id=c.active_organization_id order by created_at desc,id desc limit 1 for share;
  select * into ar from public.artists where id=a;
  if c.person_id is null or m.id is null or ar.id is null or assignment.id is null
    or not exists(select 1 from public.act where id=subject_act and person_id=ar.created_by
      and organization_id=ar.owner_organization_id) then raise exception 'denied'; end if;
  owning := ar.created_by=auth.uid() and ar.owner_organization_id=c.active_organization_id
    and workspace.workspace_type='artist' and assignment.functional_role='artist';
  if not owning then
    if workspace.workspace_type not in ('management','producer')
      or assignment.functional_role not in ('artist_manager','booking_manager','booking_agent','roster_coordinator','agency','booker')
      then raise exception 'denied'; end if;
    select * into access from public.artist_access where artist_id=a
      and organization_id=c.active_organization_id and status='active'
      and consent_at is not null and (expires_at is null or expires_at>clock_timestamp())
      and 'view'=any(scope) for share;
    if access.id is null then raise exception 'denied'; end if;
  end if;
  return jsonb_build_object('actorId',auth.uid(),'workspaceId',c.active_organization_id,
    'contextVersion',c.context_version,'membershipId',m.id,'roleAssignmentId',assignment.id,
    'role',assignment.functional_role,'owner',owning,'grantId',access.id,
    'scope',coalesce(to_jsonb(access.scope),'[]'::jsonb),'fields',coalesce(to_jsonb(access.ku03_edit_fields),'[]'::jsonb));
end $$;
revoke all on function private.evidence_authority(uuid,uuid) from public,anon,authenticated;

-- No direct write may bypass action history, even if a permissive old policy
-- or accidental table grant is present. SECURITY DEFINER RPCs run as owner.
create policy ku03_evidence_insert on public.evidence_artifacts as restrictive for insert to authenticated with check(false);
create policy ku03_evidence_update on public.evidence_artifacts as restrictive for update to authenticated using(false) with check(false);
create policy ku03_evidence_delete on public.evidence_artifacts as restrictive for delete to authenticated using(false);
create policy ku03_claim_insert on public.claims as restrictive for insert to authenticated with check(false);
create policy ku03_claim_update on public.claims as restrictive for update to authenticated using(false) with check(false);
create policy ku03_claim_delete on public.claims as restrictive for delete to authenticated using(false);
create policy ku03_snapshot_insert on public.passport_versions as restrictive for insert to authenticated with check(false);
create policy ku03_snapshot_update on public.passport_versions as restrictive for update to authenticated using(false) with check(false);
create policy ku03_snapshot_delete on public.passport_versions as restrictive for delete to authenticated using(false);
create policy ku03_snapshot_anon_read on public.passport_versions as restrictive for select to anon using(ku03_object_id is null);
-- Managed snapshots require the recipient API's purpose, expiry and current
-- source checks. Old permissive published/org SELECT policies cannot bypass it.
create policy ku03_snapshot_authenticated_read on public.passport_versions as restrictive for select to authenticated using(ku03_object_id is null);

create or replace function public.ku03_can_read_artist(a uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists (
   select 1 from public.active_role_context c
   join public.organization_membership m on m.person_id=c.person_id and m.organization_id=c.active_organization_id and m.status='active'
   join lateral (select r.functional_role from public.role_assignment r where r.person_id=c.person_id and r.organization_id=c.active_organization_id order by r.created_at desc,r.id desc limit 1) role on true
   join public.artists ar on ar.id=a
   where c.person_id=auth.uid() and ((ar.created_by=auth.uid() and ar.owner_organization_id=c.active_organization_id and role.functional_role='artist')
     or (role.functional_role in ('artist_manager','booking_manager','booking_agent','roster_coordinator','agency','booker') and exists(
       select 1 from public.artist_access aa where aa.artist_id=a and aa.organization_id=c.active_organization_id
       and aa.status='active' and aa.consent_at is not null and (aa.expires_at is null or aa.expires_at>now()) and 'view'=any(aa.scope)))))
$$;
revoke all on function public.ku03_can_read_artist(uuid) from public,anon;
grant execute on function public.ku03_can_read_artist(uuid) to authenticated;
create policy ku03_evidence_read on public.evidence_artifacts as restrictive for select to authenticated
 using(ku03_state='legacy' or public.ku03_can_read_artist(artist_id));
create policy ku03_claim_read on public.claims as restrictive for select to authenticated
 using(public.ku03_can_read_artist(artist_id));

create or replace function private.guard_evidence_publication() returns trigger
language plpgsql set search_path='' as $$ begin
  if current_user in ('anon','authenticated','service_role') then
    raise exception using errcode='42501',message='evidence_action_unavailable';
  end if;
  return new;
end $$;
create trigger ku03_publish_guard before update of published on public.artists
for each row when (old.published is distinct from new.published) execute function private.guard_evidence_publication();
create trigger ku03_snapshot_guard before insert on public.passport_versions
for each row execute function private.guard_evidence_publication();
create trigger ku03_snapshot_immutable before update or delete on public.passport_versions
for each row execute function private.evidence_history_immutable();

-- Protect grant provenance: a receiving Organization cannot grant itself an
-- active scope. Existing request RPC may still create/reset a pending request.
create or replace function private.guard_evidence_grant() returns trigger
language plpgsql set search_path='' as $$ begin
  -- Direct database-superuser maintenance is not an authenticated application
  -- action. SET ROLE authenticated (including SECURITY DEFINER call chains)
  -- still runs the caller guard, even when the underlying session is privileged.
  if current_setting('role')='none' and exists(select 1 from pg_catalog.pg_roles where rolname=session_user and rolsuper) then
    return new;
  end if;
  if auth.uid() is not null and new.status='active' and not public.owns_artist(new.artist_id) then
    raise exception using errcode='42501',message='evidence_action_unavailable';
  end if;
  return new;
end $$;
create trigger ku03_grant_guard before insert or update on public.artist_access
for each row execute function private.guard_evidence_grant();

create or replace function public.commit_evidence_action(p_request jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare authority jsonb; ar public.artists; act_row public.act; ev public.evidence_artifacts;
  previous jsonb; after_value jsonb; prior private.evidence_action_history;
  action text:=p_request->>'action'; payload jsonb:=p_request->'payload';
  a uuid:=(p_request->>'artistId')::uuid; subject_act uuid:=(p_request->>'actId')::uuid;
  object_id uuid:=(p_request->>'objectId')::uuid; k uuid:=(p_request->>'key')::uuid;
  receipt_id uuid:=gen_random_uuid(); version_id uuid; next_version bigint;
  claim_row public.claims; snap jsonb; field text; receipt jsonb; expiry timestamptz; origin jsonb; community_count integer;
  projection public.passport_versions; publication_transition jsonb:=null;
begin
  authority:=private.evidence_authority(a,subject_act);
  if k is null or object_id is null or length(p_request::text)>100000 or jsonb_typeof(payload) is distinct from 'object'
    or p_request->>'workspaceId' is distinct from authority->>'workspaceId'
    or (p_request->>'contextVersion')::bigint is distinct from (authority->>'contextVersion')::bigint then raise exception 'denied'; end if;
  select * into act_row from public.act where id=subject_act for update;
  -- Serial actor/key lookup is before stale-version checks: exact retry is
  -- processing evidence, never permission to silently apply an old UI state.
  select * into prior from private.evidence_action_history where actor_id=auth.uid() and request_key=k;
  if found then
    if prior.request<>p_request then raise exception 'denied'; end if;
    return prior.receipt;
  end if;
  if exists(select 1 from private.evidence_action_noncommit where actor_id=auth.uid() and request_key=k)
    or (p_request->>'expectedVersion')::bigint is distinct from act_row.ku03_version then raise exception 'denied'; end if;
  if not (authority->>'owner')::boolean and not (
    (action in ('upload','prepare') and authority->'scope' ? 'upload') or
    (action='change' and authority->'scope' ? 'edit') or
    (action in ('propose','withdraw') and authority->'scope' ? 'publish')
  ) then raise exception 'denied'; end if;
  if action='upload' then
    if payload ? 'communityCount' then
      community_count:=(payload->>'communityCount')::integer;
      if not (authority->>'owner')::boolean or community_count is null or community_count<1
        or payload->>'claim_intent' is distinct from 'community' then raise exception 'denied'; end if;
      previous:=jsonb_build_object('communityCount',act_row.community_count_declared);
      update public.act set community_count_declared=community_count where id=subject_act;
      payload:=payload||jsonb_build_object('value',case when community_count<=500 then 'Up to 500'
        when community_count<=2000 then '500–2,000' when community_count<=10000 then '2,000–10,000' else '10,000+' end,
        'evidence_type','band','source_type','self-band','public_url',null);
    end if;
    -- Explicit preparation keeps the original row untouched and snapshots its
    -- exact provenance. A legacy row is never automatically reclassified.
    if payload ? 'legacyId' then
      if payload->>'legacyKind'='claim' then
        select to_jsonb(c) into origin from public.claims c where c.id=(payload->>'legacyId')::uuid
          and c.artist_id=a and c.act_id=subject_act and not exists(
            select 1 from public.evidence_artifacts e where e.id=c.evidence_id and e.ku03_state<>'legacy') for share;
      elsif payload->>'legacyKind'='item' then
        select to_jsonb(i) into origin from public.profile_items i where i.id=(payload->>'legacyId')::uuid
          and i.artist_id=a and i.act_id=subject_act for share;
      else raise exception 'denied'; end if;
      if origin is null or md5(origin::text) is distinct from payload->>'legacyFingerprint'
        or nullif(payload->>'reason','') is null or nullif(payload->>'provenance','') is null then raise exception 'denied'; end if;
      previous:=jsonb_build_object('legacyKind',payload->>'legacyKind','original',origin);
      payload:=payload||jsonb_build_object('evidence_type','band','source_type','self-reported',
        'title',coalesce(origin->>'title',origin->>'public_wording',origin->>'value'),
        'value',coalesce(origin->>'value',origin->>'detail',origin->>'title'));
    end if;
    if exists(select 1 from public.evidence_artifacts where id=object_id)
      or (p_request->>'expectedObjectVersion')::bigint is distinct from 0
      or payload->'sourceConsent' is distinct from 'true'::jsonb
      or nullif(payload->>'value','') is null then raise exception 'denied'; end if;
    insert into public.evidence_artifacts(id,artist_id,act_id,organization_id,evidence_type,source_type,value,
      public_url,file_url,ku03_title,ku03_version,ku03_state,source_owner_consent,ku03_origin,claim_intent)
    values(object_id,a,subject_act,(authority->>'workspaceId')::uuid,payload->>'evidence_type',payload->>'source_type',payload->>'value',
      payload->>'public_url',payload->>'file_url',payload->>'title',1,'candidate',true,previous,payload->>'claim_intent') returning * into ev;
  else
    select * into ev from public.evidence_artifacts where id=object_id and artist_id=a and evidence_artifacts.act_id=subject_act for update;
    if ev.id is null or ev.ku03_state in ('legacy','withdrawn')
      or (p_request->>'expectedObjectVersion')::bigint is distinct from ev.ku03_version then raise exception 'denied'; end if;
    previous:=jsonb_build_object('title',ev.ku03_title,'value',ev.value,'state',ev.ku03_state,'version',ev.ku03_version);
    select * into claim_row from public.claims where id=ev.ku03_claim_id and evidence_id=object_id and artist_id=a and claims.act_id=subject_act for update;
    previous:=previous||jsonb_build_object('statement',claim_row.value,'claimId',claim_row.id,'confirmed',claim_row.artist_approved);
    if action in ('change','correct','withdraw') then
      -- Same serialization boundary as publish/replace, including other Acts.
      -- Inspect the current projection only after acquiring the Artist lock.
      select * into ar from public.artists where id=a for update;
      select * into projection from public.passport_versions v where v.artist_id=a
        order by v.created_at desc,v.id desc limit 1;
    end if;
    if action='prepare' then
      if ev.ku03_state<>'candidate' or nullif(payload->>'statement','') is null then raise exception 'denied'; end if;
      -- Extraction is only an editable candidate, never source verification,
      -- an ACT-PROPOSE, Artist confirmation, or a public projection.
      update public.evidence_artifacts set ku03_prepared_statement=payload->>'statement',
        status=case when payload->'processingFailed'='true'::jsonb then 'error' else 'processed' end,
        ku03_version=ku03_version+1 where id=object_id returning * into ev;
    elsif action in ('change','correct') then
      if nullif(payload->>'reason','') is null or nullif(payload->>'provenance','') is null then raise exception 'denied'; end if;
      for field in select jsonb_object_keys(payload) loop
        if field not in ('title','value','reason','provenance') then raise exception 'denied'; end if;
        if field in ('title','value') and not (authority->>'owner')::boolean
          and not (authority->'fields' ? field) then raise exception 'denied'; end if;
      end loop;
      update public.evidence_artifacts set ku03_title=coalesce(payload->>'title',ku03_title),
        value=coalesce(payload->>'value',value),ku03_state='candidate',ku03_rights=false,
        ku03_visibility=false,ku03_conflict=true,ku03_version=ku03_version+1 where id=object_id returning * into ev;
      update public.claims set artist_approved=false,visibility='working-only' where evidence_id=object_id;
      update public.artists set published=false where id=a and ar.published
        and projection.ku03_object_id=object_id and projection.act_id=subject_act;
    elsif action='propose' then
      if ev.ku03_state not in ('candidate','proposed') or nullif(payload->>'statement','') is null then raise exception 'denied'; end if;
      if ev.claim_intent='community' and payload->>'statement' is distinct from ev.value then raise exception 'denied'; end if;
      -- A proposal is private and self-reported. Human confirmation does not
      -- manufacture a verified/supporting source status.
      update public.claims set artist_approved=false,visibility='working-only' where evidence_id=object_id;
      insert into public.claims(artist_id,act_id,evidence_id,organization_id,value,public_wording,source_type,
        verification_status,artist_approved,visibility)
      values(a,subject_act,object_id,(authority->>'workspaceId')::uuid,payload->>'statement',payload->>'statement',
        ev.source_type,'self-reported',false,'working-only') returning * into claim_row;
      update public.evidence_artifacts set ku03_state='proposed',ku03_version=ku03_version+1,
        ku03_rights=false,ku03_visibility=false,ku03_conflict=true,ku03_claim_id=claim_row.id where id=object_id returning * into ev;
      -- Nonbinding proposals do not revoke Artist truth or publication.
    elsif action='confirm' then
      if not (authority->>'owner')::boolean or ev.ku03_state<>'proposed' or claim_row.id is null
        or jsonb_typeof(payload->'rights')<>'boolean' or jsonb_typeof(payload->'visibility')<>'boolean'
        or jsonb_typeof(payload->'conflict')<>'boolean' then raise exception 'denied'; end if;
      update public.claims set artist_approved=true,verified_by='artist',verified_at=clock_timestamp() where id=claim_row.id;
      update public.evidence_artifacts set ku03_state='confirmed',ku03_version=ku03_version+1,
        ku03_rights=(payload->>'rights')::boolean,ku03_visibility=(payload->>'visibility')::boolean,
        ku03_conflict=(payload->>'conflict')::boolean where id=object_id returning * into ev;
    elsif action in ('publish','replace') then
      expiry:=(payload->>'expiresAt')::timestamptz;
      if not (authority->>'owner')::boolean or ev.ku03_state<>'confirmed'
        or not ev.ku03_rights or not ev.ku03_visibility or ev.ku03_conflict
        or claim_row.id is null or not claim_row.artist_approved
        or claim_row.verification_status not in ('verified','supporting')
        or claim_row.status='disputed' or (claim_row.expires_at is not null and claim_row.expires_at<=clock_timestamp())
        or nullif(payload->>'purpose','') is null or (payload->>'audience')::uuid is null
        or expiry is null or expiry<=clock_timestamp() then raise exception 'denied'; end if;
      select * into ar from public.artists where id=a for update;
      if (action='publish' and ar.published) or (action='replace' and not ar.published)
        then raise exception 'denied'; end if;
      select * into projection from public.passport_versions v where v.artist_id=a
        order by v.created_at desc,v.id desc limit 1;
      snap:=jsonb_build_object('artist',jsonb_build_object('id',a,'stage_name',act_row.stage_name,'published',true),
        'items','[]'::jsonb,'claims',jsonb_build_array(jsonb_build_object('id',claim_row.id,'artist_id',a,
        'value',claim_row.value,'public_wording',claim_row.public_wording,'source_type',claim_row.source_type,
        'verification_status',claim_row.verification_status,'method_label',claim_row.method_label)));
      -- now() is transaction-start time: concurrent waiters or multiple actions
      -- in one transaction must not reorder the served current projection.
      insert into public.passport_versions(artist_id,act_id,organization_id,snapshot,ku03_audience,ku03_purpose,ku03_expires_at,ku03_object_id,created_at)
      values(a,subject_act,ar.owner_organization_id,snap,(payload->>'audience')::uuid,payload->>'purpose',expiry,object_id,
        greatest(clock_timestamp(),projection.created_at+interval '1 microsecond'))
      returning id into version_id;
      update public.artists set published=true where id=a;
    elsif action='withdraw' then
      if not (authority->>'owner')::boolean and ev.ku03_state<>'proposed' then raise exception 'denied'; end if;
      update public.evidence_artifacts set ku03_state='withdrawn',ku03_version=ku03_version+1 where id=object_id returning * into ev;
      update public.claims set artist_approved=false,visibility='working-only' where evidence_id=object_id;
      -- The receipt records an observed transition, not the action's label.
      -- No transition is asserted for private, historical or already-hidden evidence.
      if ar.published and projection.ku03_object_id=object_id and projection.act_id=subject_act then
        update public.artists set published=false where id=a;
        publication_transition:=jsonb_build_object('fromPublished',ar.published,'toPublished',false,
          'passportVersionId',projection.id,'objectId',projection.ku03_object_id,'actId',projection.act_id);
      end if;
    else raise exception 'denied'; end if;
  end if;
  update public.act set ku03_version=ku03_version+1 where id=subject_act returning ku03_version into next_version;
  receipt:=jsonb_build_object('id',receipt_id,'actorId',auth.uid(),'key',k,'action',action,'artistId',a,'actId',subject_act,
    'objectId',object_id,'workspaceId',authority->>'workspaceId','contextVersion',authority->'contextVersion',
    'version',next_version,'objectVersion',ev.ku03_version,'passportVersionId',version_id,
    'publicationTransition',publication_transition,'committedAt',clock_timestamp());
  select * into claim_row from public.claims where id=ev.ku03_claim_id;
  after_value:=jsonb_build_object('title',ev.ku03_title,'value',ev.value,'state',ev.ku03_state,'version',ev.ku03_version,
    'statement',claim_row.value,'claimId',claim_row.id,'confirmed',claim_row.artist_approved,
    'preparedStatement',ev.ku03_prepared_statement,'processingStatus',ev.status);
  insert into private.evidence_action_history(actor_id,artist_id,act_id,object_id,request_key,request,action,authority,
    before_state,after_state,reason,provenance,receipt)
  values(auth.uid(),a,subject_act,object_id,k,p_request,action,authority,previous,after_value,payload->>'reason',payload->>'provenance',receipt);
  return receipt;
exception when others then raise exception using errcode='42501',message='evidence_action_unavailable';
end $$;
revoke all on function public.commit_evidence_action(jsonb) from public,anon;
grant execute on function public.commit_evidence_action(jsonb) to authenticated;

create or replace function public.resolve_evidence_action(p_request jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare authority jsonb; prior private.evidence_action_history; fence private.evidence_action_noncommit;
  k uuid:=(p_request->>'key')::uuid;
begin
  authority:=private.evidence_authority((p_request->>'artistId')::uuid,(p_request->>'actId')::uuid);
  if k is null or p_request->>'workspaceId' is distinct from authority->>'workspaceId' then raise exception 'denied'; end if;
  select * into prior from private.evidence_action_history where actor_id=auth.uid() and request_key=k;
  if found then
    if prior.request<>p_request then raise exception 'denied'; end if;
    return jsonb_build_object('status','committed','receipt',prior.receipt);
  end if;
  select * into fence from private.evidence_action_noncommit where actor_id=auth.uid() and request_key=k;
  if found and fence.request<>p_request then raise exception 'denied'; end if;
  insert into private.evidence_action_noncommit(actor_id,request_key,request)
    values(auth.uid(),k,p_request) on conflict do nothing;
  -- Physical tuple update fences old repeatable-read snapshots as well. No
  -- logical context/version change and no guessed success from an ordinary read.
  update public.active_role_context set updated_at=updated_at where person_id=auth.uid();
  return jsonb_build_object('status','not_committed');
exception when others then raise exception using errcode='42501',message='evidence_action_unavailable';
end $$;
revoke all on function public.resolve_evidence_action(jsonb) from public,anon;
grant execute on function public.resolve_evidence_action(jsonb) to authenticated;

create or replace function public.get_evidence_workbench(p_artist uuid,p_act uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare authority jsonb; result jsonb;
begin
  -- Missing selection resolves the actual unique default Act, never artist.id.
  if p_act is null then
    select case when count(*)=1 then (array_agg(a.id))[1] end into p_act
      from public.act a join public.artists ar on ar.id=p_artist
      where a.person_id=ar.created_by and a.organization_id=ar.owner_organization_id and a.is_default;
  end if;
  authority:=private.evidence_authority(p_artist,p_act);
  select jsonb_build_object('artistId',p_artist,'actId',p_act,'authority',authority,
    'version',a.ku03_version,'stageName',a.stage_name,
    -- Read back the existing immutable handoff only to its Artist owner.
    -- The latest artist projection must belong to the selected Act; no purpose
    -- is derived from a persona, local draft or a different Act's history.
    'publication',case when (authority->>'owner')::boolean then
      (select jsonb_build_object('versionId',v.id,'purpose',v.ku03_purpose,'actId',v.act_id)
        from public.passport_versions v where v.artist_id=p_artist and v.act_id=p_act
        and v.ku03_object_id is not null
        and v.id=(select latest.id from public.passport_versions latest where latest.artist_id=p_artist order by latest.created_at desc,latest.id desc limit 1)
        and exists(select 1 from public.artists ar where ar.id=p_artist and ar.published)) else null end,
    'acts',(select jsonb_agg(jsonb_build_object('id',x.id,'stageName',x.stage_name) order by x.created_at,x.id)
      from public.act x join public.artists ar on ar.id=p_artist where x.person_id=ar.created_by and x.organization_id=ar.owner_organization_id),
    'legacyClaims',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('fingerprint',md5(to_jsonb(c)::text)) order by c.created_at,c.id)
      from public.claims c where c.artist_id=p_artist and c.act_id=p_act and not exists(
        select 1 from public.evidence_artifacts e where e.id=c.evidence_id and e.ku03_state<>'legacy')),'[]'::jsonb),
    'legacyItems',coalesce((select jsonb_agg(to_jsonb(i)||jsonb_build_object('fingerprint',md5(to_jsonb(i)::text)) order by i.created_at,i.id)
      from public.profile_items i where i.artist_id=p_artist and i.act_id=p_act),'[]'::jsonb),
    'history',coalesce((select jsonb_agg(jsonb_build_object('receipt',h.receipt,'action',h.action,'before',h.before_state,'after',h.after_state,
      'reason',h.reason,'provenance',h.provenance) order by h.committed_at,h.id) from private.evidence_action_history h
      where h.artist_id=p_artist and h.act_id=p_act),'[]'::jsonb),
    'objects',coalesce((select jsonb_agg(jsonb_build_object(
      'id',e.id,'title',e.ku03_title,'value',e.value,'version',e.ku03_version,'state',e.ku03_state,
      'status',e.status,'preparedStatement',e.ku03_prepared_statement,'evidence_type',e.evidence_type,'source_type',e.source_type,
      'rights',e.ku03_rights,'visibility',e.ku03_visibility,'conflict',e.ku03_conflict,
      'claim',(select jsonb_build_object('id',c.id,'statement',c.value,'approved',c.artist_approved,
        'verification',c.verification_status) from public.claims c where c.evidence_id=e.id and c.id=e.ku03_claim_id)
      ) order by e.uploaded_at,e.id) from public.evidence_artifacts e where e.artist_id=p_artist and e.act_id=p_act and e.ku03_state<>'legacy'),'[]'::jsonb))
    into result from public.act a where a.id=p_act;
  return result;
exception when others then raise exception using errcode='42501',message='evidence_action_unavailable';
end $$;
revoke all on function public.get_evidence_workbench(uuid,uuid) from public,anon;
grant execute on function public.get_evidence_workbench(uuid,uuid) to authenticated;
