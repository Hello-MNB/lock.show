-- Only identity is supplied by the local Auth fixture; entry must establish
-- all application eligibility itself through the authenticated RPC.
-- Synthetic local-only input; this is NOT an issued notice or legal approval.
insert into private.artist_entry_notice(version,purpose,notice_url,terms_url,effective_at,active)
 values('SYNTHETIC-ENTRY-NOTICE-1','Synthetic service-profile test purpose',
 'https://example.test/synthetic-notice','https://example.test/synthetic-terms','2026-08-01T00:00:00Z',true);
insert into auth.users(id,email,email_confirmed_at) values
 ('81000000-0000-4000-8000-000000000001','entry@example.test',now());
do $$ begin
 if exists(select 1 from public.person where id='81000000-0000-4000-8000-000000000001') then
   raise exception 'test identity was pre-provisioned';
 end if;
end $$;
select set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000001',false);
set role authenticated;
do $$ declare r jsonb; s jsonb; begin
 r := public.commit_artist_entry('{"action":"initialize","key":"82000000-0000-4000-8000-000000000001"}');
 if r->>'status'<>'committed' or r#>>'{receipt,workspaceId}' is null then raise exception '01 no committed setup receipt'; end if;
 s := public.read_artist_entry();
 if s->>'actorId'<>'81000000-0000-4000-8000-000000000001' or s->>'workspaceId'<>r#>>'{receipt,workspaceId}'
   or s->>'artistId' is not null then raise exception '01 setup readback differs or Artist prematurely completed'; end if;
 r := public.commit_artist_entry(jsonb_build_object('action','basics','key','82000000-0000-4000-8000-000000000002',
   'workspaceId',s->>'workspaceId','contextVersion',0,'expectedVersion',0,'artistId',null,'actId',null,
   'payload',jsonb_build_object('stage_name','Entry Artist','city','Tel Aviv','privacyConsent',true,'noticeVersion','SYNTHETIC-ENTRY-NOTICE-1')));
 s := public.read_artist_entry();
 if r->>'status'<>'committed' or s->>'artistId' is null or s->>'actId' is null
   or s#>>'{artist,stage_name}'<>'Entry Artist' or s->>'consentAccepted'<>'true' then raise exception '13 basics/consent readback failed'; end if;
 raise notice 'ARTIST_ENTRY_POSITIVE=2/2';
end $$;
reset role;
