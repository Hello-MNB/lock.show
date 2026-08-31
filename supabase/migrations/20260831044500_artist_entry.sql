-- APP00 / FR-ONB01: private Artist entry, not authentication or publication.
-- Existing Core/B/A remain authoritative for reads, switching and evidence.
-- These private rows are operational receipts, not new Measurement events.
-- EMPTY on migration: an issued notice/terms and operator approval have NOT
-- been supplied. Only the disposable test fixture inserts synthetic policy.
-- A Legal source-document version is never a public notice version.
create table private.artist_entry_notice (
 version text primary key check(length(version) between 1 and 200),
 purpose text not null check(length(purpose) between 1 and 500),
 notice_url text not null check(notice_url like 'https://%'),
 terms_url text not null check(terms_url like 'https://%'),
 effective_at timestamptz not null,
 active boolean not null default false
);
create unique index artist_entry_one_notice on private.artist_entry_notice(active) where active;
alter table private.artist_entry_notice enable row level security;
revoke all on private.artist_entry_notice from public,anon,authenticated;
create table private.artist_entry_progress (
 actor_id uuid not null references public.person(id) on delete restrict,
 workspace_id uuid not null references public.organization(id) on delete restrict,
 version bigint not null default 0 check(version>=0),
 primary key(actor_id,workspace_id)
);
create table private.artist_entry_history (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid not null references auth.users(id) on delete restrict,
 request_key uuid not null, request jsonb not null, receipt jsonb not null,
 committed_at timestamptz not null default clock_timestamp(), unique(actor_id,request_key)
);
create table private.artist_entry_noncommit (
 actor_id uuid not null references auth.users(id) on delete restrict,
 request_key uuid not null, request jsonb not null,
 resolved_at timestamptz not null default clock_timestamp(), primary key(actor_id,request_key)
);
alter table private.artist_entry_progress enable row level security;
alter table private.artist_entry_history enable row level security;
alter table private.artist_entry_noncommit enable row level security;
revoke all on private.artist_entry_progress,private.artist_entry_history,private.artist_entry_noncommit from public,anon,authenticated;
create trigger entry_history_immutable before update or delete on private.artist_entry_history
 for each row execute function private.evidence_history_immutable();
create trigger entry_noncommit_immutable before update or delete on private.artist_entry_noncommit
 for each row execute function private.evidence_history_immutable();

-- Advisory lock also covers the first request, before a Person row exists.
-- Established actors use B's Person -> context lock order; no context switch
-- is performed here. Auth metadata is never consulted for authority.
create function private.lock_artist_entry() returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null or not exists(select 1 from auth.users where id=actor and deleted_at is null
   and (banned_until is null or banned_until<=clock_timestamp())) then raise exception 'denied'; end if;
 perform pg_advisory_xact_lock(hashtextextended('artist-entry:'||actor::text,0));
 perform 1 from public.person where id=actor for update;
 return actor;
end $$;
revoke all on function private.lock_artist_entry() from public,anon,authenticated;

-- Only the definer's in-flight transaction may pass its newly inserted
-- consent id before the immutable enclosing receipt is appended. Public reads
-- require that receipt; legacy client table writes cannot mint this evidence.
create function private.artist_entry_current(new_consent uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); c public.active_role_context; m public.organization_membership;
 assignment public.role_assignment; a public.artists; selected public.act; v bigint; consent public.consent_records;
 notice private.artist_entry_notice;
begin
 if actor is null then raise exception 'denied'; end if;
 select * into notice from private.artist_entry_notice where active and effective_at<=clock_timestamp() for share;
 select * into c from public.active_role_context where person_id=actor for update;
 if c.person_id is null then return jsonb_build_object('actorId',actor,'status','uninitialized','workspaceId',null,
   'contextVersion',0,'version',0,'artistId',null,'actId',null,'artist',null,'consentAccepted',false); end if;
 select * into m from public.organization_membership where person_id=actor and organization_id=c.active_organization_id
   and status='active' for share;
 select * into assignment from public.role_assignment where person_id=actor and organization_id=c.active_organization_id
   order by created_at desc,id desc limit 1 for share;
 if m.id is null or assignment.functional_role is distinct from 'artist' or not exists(
   select 1 from public.organization where id=c.active_organization_id and workspace_type='artist') then raise exception 'denied'; end if;
 select * into a from public.get_my_artist_for_active_workspace();
 if a.id is not null then
   if (select count(*) from public.act where person_id=actor and organization_id=c.active_organization_id and is_default)<>1
     then raise exception 'denied'; end if;
   select * into selected from public.act where person_id=actor and organization_id=c.active_organization_id and is_default for share;
 end if;
 select version into v from private.artist_entry_progress where actor_id=actor and workspace_id=c.active_organization_id;
 select * into consent from public.consent_records where subject_id=actor and scope='privacy-processing'
   order by timestamp desc,id desc limit 1;
 return jsonb_build_object('actorId',actor,'status','ready','workspaceId',c.active_organization_id,
   'contextVersion',c.context_version,'version',coalesce(v,0),'artistId',a.id,'actId',selected.id,
   'artist',case when a.id is null then null else jsonb_build_object('id',a.id,'stage_name',a.stage_name,'city',a.city) end,
   'serviceNotice',case when notice.version is null then null else jsonb_build_object('version',notice.version,
      'purpose',notice.purpose,'noticeUrl',notice.notice_url,'termsUrl',notice.terms_url,'effectiveAt',notice.effective_at) end,
   'consentAccepted',coalesce(consent.status='accepted' and consent.version=notice.version and
     (consent.id=new_consent or exists(select 1 from private.artist_entry_history h where h.actor_id=actor
       and h.receipt->>'consentId'=consent.id::text)),false));
end $$;
revoke all on function private.artist_entry_current(uuid) from public,anon,authenticated;

create function public.read_artist_entry() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform private.lock_artist_entry(); return private.artist_entry_current();
exception when others then raise exception using errcode='42501',message='artist_entry_unavailable';
end $$;
revoke all on function public.read_artist_entry() from public,anon;
grant execute on function public.read_artist_entry() to authenticated;

create function private.check_entry_request(r jsonb) returns void language plpgsql set search_path='' as $$
begin
 if jsonb_typeof(r)<>'object' or (r->>'key')::uuid is null or r->>'action' not in ('initialize','basics','consent')
   or r->>'action' is null or exists(select 1 from jsonb_object_keys(r) k where k not in
     ('key','action','workspaceId','contextVersion','expectedVersion','artistId','actId','payload')) then raise exception 'denied'; end if;
 if r->>'action'='initialize' and r - array['key','action']::text[] <> '{}'::jsonb then raise exception 'denied'; end if;
end $$;
revoke all on function private.check_entry_request(jsonb) from public,anon,authenticated;

create function public.commit_artist_entry(p_request jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; key uuid; prior private.artist_entry_history; current_state jsonb; payload jsonb;
 workspace uuid; artist uuid; subject_act uuid; receipt jsonb; consent uuid; before_state jsonb; new_version bigint;
 notice private.artist_entry_notice; decision text;
begin
 actor:=private.lock_artist_entry(); perform private.check_entry_request(p_request); key:=(p_request->>'key')::uuid;
 select * into prior from private.artist_entry_history where actor_id=actor and request_key=key;
 if prior.id is not null then
   if prior.request<>p_request then raise exception 'denied'; end if;
   return jsonb_build_object('status','committed','receipt',prior.receipt,'current',private.artist_entry_current());
 end if;
 if exists(select 1 from private.artist_entry_noncommit where actor_id=actor and request_key=key) then raise exception 'denied'; end if;
 current_state:=private.artist_entry_current(); before_state:=current_state;
 if p_request->>'action'='initialize' then
   if current_state->>'status'='uninitialized' then
     -- Existing memberships must use the governed B context selection path.
     if exists(select 1 from public.organization_membership where person_id=actor)
       or exists(select 1 from public.profiles where id=actor and role<>'artist') then raise exception 'denied'; end if;
     insert into public.person(id,email) select id,email from auth.users where id=actor on conflict(id) do nothing;
     insert into public.profiles(id,role) values(actor,'artist') on conflict(id) do nothing;
     insert into public.organization(name,plan,created_by,workspace_type) values('Artist','solo',actor,'artist') returning id into workspace;
     insert into public.subscription(organization_id,plan,seats_included,seats_used,status) values(workspace,'solo',1,1,'active');
     insert into public.organization_membership(organization_id,person_id,org_role,status,joined_at) values(workspace,actor,'owner','active',clock_timestamp());
     insert into public.role_assignment(organization_id,person_id,functional_role) values(workspace,actor,'artist');
     insert into public.active_role_context(person_id,active_organization_id,context_version) values(actor,workspace,0);
   else
     workspace:=(current_state->>'workspaceId')::uuid;
   end if;
   insert into private.artist_entry_progress(actor_id,workspace_id) values(actor,workspace) on conflict do nothing;
 else
   workspace:=(current_state->>'workspaceId')::uuid;
   if workspace is null or p_request->>'workspaceId' is distinct from workspace::text
     or (p_request->>'contextVersion')::bigint is distinct from (current_state->>'contextVersion')::bigint
     or (p_request->>'expectedVersion')::bigint is distinct from (current_state->>'version')::bigint
     or p_request->>'artistId' is distinct from current_state->>'artistId'
     or p_request->>'actId' is distinct from current_state->>'actId' then raise exception 'denied'; end if;
   payload:=p_request->'payload';
   select * into notice from private.artist_entry_notice where active and effective_at<=clock_timestamp() for share;
   if notice.version is null or payload->>'noticeVersion' is distinct from notice.version then raise exception 'denied'; end if;
   if p_request->>'action'='consent' then
     decision:=payload->>'decision';
     if decision is null or decision not in ('accepted','declined','deferred')
       or exists(select 1 from jsonb_object_keys(payload) k where k not in ('noticeVersion','decision')) then raise exception 'denied'; end if;
     -- The legacy table has no 'deferred' enum. Keep that exact decision in the
     -- immutable entry receipt; record denial of the dependent capability in
     -- the existing consent table without inventing a new legacy status.
     insert into public.consent_records(subject_id,scope,version,status)
       values(actor,'privacy-processing',notice.version,case when decision='accepted' then 'accepted' else 'declined' end) returning id into consent;
   else
   if jsonb_typeof(payload) is distinct from 'object' or exists(select 1 from jsonb_object_keys(payload) k
     where k not in ('stage_name','city','privacyConsent','noticeVersion')) or jsonb_typeof(payload->'stage_name') is distinct from 'string'
     or length(btrim(payload->>'stage_name')) not between 1 and 200
     or (payload ? 'city' and jsonb_typeof(payload->'city') not in ('string','null'))
     or length(coalesce(payload->>'city',''))>200
     or (payload->'privacyConsent' is distinct from 'true'::jsonb and current_state->>'consentAccepted'<>'true') then raise exception 'denied'; end if;
   artist:=(current_state->>'artistId')::uuid;
   if artist is null then
     insert into public.artists(created_by,owner_organization_id,organization_id,stage_name,name,city)
       values(actor,workspace,workspace,btrim(payload->>'stage_name'),btrim(payload->>'stage_name'),nullif(btrim(payload->>'city'),'')) returning id into artist;
     -- The transition trigger may create an Act, but its id is never inferred.
     current_state:=private.artist_entry_current(); subject_act:=(current_state->>'actId')::uuid;
   else
     perform 1 from public.artists where id=artist for update;
     if exists(select 1 from public.artists where id=artist and published) then raise exception 'denied'; end if;
     subject_act:=(current_state->>'actId')::uuid;
     update public.artists set stage_name=btrim(payload->>'stage_name'),name=btrim(payload->>'stage_name'),city=nullif(btrim(payload->>'city'),'') where id=artist;
     update public.act set stage_name=btrim(payload->>'stage_name'),city=nullif(btrim(payload->>'city'),''),updated_at=clock_timestamp()
       where id=subject_act and person_id=actor and organization_id=workspace;
   end if;
   if subject_act is null then raise exception 'denied'; end if;
   if before_state->>'consentAccepted'<>'true' then
     decision:='accepted';
     insert into public.consent_records(subject_id,scope,version,status) values(actor,'privacy-processing',notice.version,'accepted') returning id into consent;
   end if;
   end if;
   insert into private.artist_entry_progress(actor_id,workspace_id,version) values(actor,workspace,1)
     on conflict(actor_id,workspace_id) do update set version=private.artist_entry_progress.version+1 returning version into new_version;
 end if;
 current_state:=private.artist_entry_current(consent);
 receipt:=jsonb_build_object('id',gen_random_uuid(),'actorId',actor,'key',key,'action',p_request->>'action',
   'workspaceId',workspace,'contextVersion',current_state->'contextVersion','version',current_state->'version',
   'artistId',current_state->'artistId','actId',current_state->'actId','consentId',consent,
   'consentDecision',case when consent is null then null else jsonb_build_object('decision',decision,'scope','privacy-processing',
     'purpose',notice.purpose,'version',notice.version,'effectiveAt',notice.effective_at,'receiptId',consent) end,
   'before',before_state,'after',current_state,'committedAt',clock_timestamp());
 insert into private.artist_entry_history(actor_id,request_key,request,receipt) values(actor,key,p_request,receipt);
 return jsonb_build_object('status','committed','receipt',receipt,'current',current_state);
exception when others then raise exception using errcode='42501',message='artist_entry_unavailable';
end $$;
revoke all on function public.commit_artist_entry(jsonb) from public,anon;
grant execute on function public.commit_artist_entry(jsonb) to authenticated;

create function public.resolve_artist_entry(p_request jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; key uuid; prior private.artist_entry_history; fence private.artist_entry_noncommit; current_state jsonb;
begin
 actor:=private.lock_artist_entry(); perform private.check_entry_request(p_request); key:=(p_request->>'key')::uuid;
 select * into prior from private.artist_entry_history where actor_id=actor and request_key=key;
 if prior.id is not null then
   if prior.request<>p_request then raise exception 'denied'; end if;
   return jsonb_build_object('status','committed','receipt',prior.receipt,'current',private.artist_entry_current());
 end if;
 select * into fence from private.artist_entry_noncommit where actor_id=actor and request_key=key;
 if fence.actor_id is not null and fence.request<>p_request then raise exception 'denied'; end if;
 current_state:=private.artist_entry_current();
 insert into private.artist_entry_noncommit(actor_id,request_key,request) values(actor,key,p_request) on conflict do nothing;
 return jsonb_build_object('status','not_committed','actorId',actor,'key',key,'current',current_state);
exception when others then raise exception using errcode='42501',message='artist_entry_unavailable';
end $$;
revoke all on function public.resolve_artist_entry(jsonb) from public,anon;
grant execute on function public.resolve_artist_entry(jsonb) to authenticated;

-- Private Artist landing projection. Reuse A's exact authority and locks;
-- the old Act-id transition/RLS and ambient table grants are not authority.
-- This reader is owner-only, not a new representative/Admin/public surface.
create function public.read_artist_radar_context(p_artist uuid,p_act uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare current_state jsonb; selected uuid; result jsonb;
begin
 current_state:=public.get_evidence_workbench(p_artist,p_act);
 if current_state#>>'{authority,owner}' is distinct from 'true' then raise exception 'denied'; end if;
 selected:=(current_state->>'actId')::uuid;
 select current_state || jsonb_build_object('act',jsonb_build_object(
   'id',a.id,'person_id',a.person_id,'organization_id',a.organization_id,'stage_name',a.stage_name,
   'genre',a.genre,'city',a.city,'positioning',a.positioning,'photo_url',a.photo_url,
   'artist_goal',a.artist_goal,'format',a.format,'alias',a.alias,'is_default',a.is_default,
   'community_count_declared',a.community_count_declared,'created_at',a.created_at,'updated_at',a.updated_at),
   'acts',(select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'stage_name',x.stage_name,
     'genre',x.genre,'city',x.city,'positioning',x.positioning,'photo_url',x.photo_url,
     'is_default',x.is_default,'created_at',x.created_at) order by x.created_at,x.id),'[]'::jsonb)
     from public.act x where x.person_id=auth.uid() and x.organization_id=(current_state#>>'{authority,workspaceId}')::uuid),
   'items',(select coalesce(jsonb_agg(to_jsonb(i) order by i.created_at desc,i.id),'[]'::jsonb)
     from public.profile_items i where i.artist_id=p_artist and i.act_id=selected),
   'claims',(select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at desc,c.id),'[]'::jsonb)
     from public.claims c where c.artist_id=p_artist and c.act_id=selected))
 into result from public.act a where a.id=selected and a.person_id=auth.uid()
   and a.organization_id=(current_state#>>'{authority,workspaceId}')::uuid;
 if result is null then raise exception 'denied'; end if;
 return result;
exception when others then raise exception using errcode='42501',message='evidence_action_unavailable';
end $$;
revoke all on function public.read_artist_radar_context(uuid,uuid) from public,anon;
grant execute on function public.read_artist_radar_context(uuid,uuid) to authenticated;
