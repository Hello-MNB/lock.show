-- APP00 case29: the existing immutable basics history identifies one entry.
-- No entity, event vocabulary, table, backfill or optional-consent gate added.
-- Explicit Finish calls this RPC; reads/basics commits never emit completion.
create function public.complete_artist_entry(p_request jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; s jsonb; history private.artist_entry_history;
 event public.analytics_event; synthetic boolean;
begin
 actor:=private.lock_artist_entry(); s:=private.artist_entry_current();
 if jsonb_typeof(p_request) is distinct from 'object'
   or exists(select 1 from jsonb_object_keys(p_request) k where k not in ('workspaceId','artistId','actId','contextVersion','telemetry'))
   or jsonb_typeof(p_request->'telemetry') is distinct from 'boolean'
   or s->>'status'<>'ready' or s->>'consentAccepted' is distinct from 'true'
   or nullif(btrim(s#>>'{artist,stage_name}'),'') is null
   or p_request->>'workspaceId' is distinct from s->>'workspaceId'
   or p_request->>'artistId' is distinct from s->>'artistId'
   or p_request->>'actId' is distinct from s->>'actId'
   or (p_request->>'contextVersion')::bigint is distinct from (s->>'contextVersion')::bigint
 then raise exception 'denied'; end if;
 if p_request->'telemetry'='false'::jsonb then
   return jsonb_build_object('status','not_recorded','actorId',actor,'current',s);
 end if;
 select * into history from private.artist_entry_history h
   where h.actor_id=actor and h.request->>'action'='basics' and h.receipt->>'action'='basics'
     and h.receipt->>'actorId'=actor::text and h.receipt->>'workspaceId'=s->>'workspaceId'
     and h.receipt->>'artistId'=s->>'artistId'
     and h.receipt#>>'{after,consentAccepted}'='true'
     and nullif(btrim(h.receipt#>>'{after,artist,stage_name}'),'') is not null
   order by h.committed_at,h.id limit 1;
 if history.id is null then
   -- Legacy readiness is not an invented historical completion receipt.
   return jsonb_build_object('status','not_recorded','actorId',actor,'current',s);
 end if;
 select coalesce(email like '%@gigproof.test',false) into synthetic from auth.users where id=actor;
 insert into public.analytics_event(id,event_name,actor_user_id,properties,is_demo,created_at)
   values(history.id,'onboarding_completed',actor,null,synthetic,clock_timestamp()) on conflict(id) do nothing;
 select * into event from public.analytics_event where id=history.id;
 if event.event_name is distinct from 'onboarding_completed' or event.actor_user_id is distinct from actor
   or event.properties is not null or event.actor_role is not null or event.act_id is not null
   or event.passport_version_id is not null or event.session_id is not null
 then raise exception 'denied'; end if;
 return jsonb_build_object('status','recorded','actorId',actor,'eventId',event.id,
   'recordedAt',event.created_at,'current',s);
exception when others then raise exception using errcode='42501',message='artist_entry_unavailable';
end $$;
revoke all on function public.complete_artist_entry(jsonb) from public,anon;
grant execute on function public.complete_artist_entry(jsonb) to authenticated;
