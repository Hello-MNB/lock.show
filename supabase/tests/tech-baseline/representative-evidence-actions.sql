-- KU03 RED witness: a view-only representative must not contribute directly.
-- The complete 18-case manifest is exercised by the same guarded runner.
insert into auth.users(id,email) values
 ('71000000-0000-4000-8000-000000000001','artist-ku03@example.test'),
 ('71000000-0000-4000-8000-000000000002','representative-ku03@example.test');
insert into public.person(id,email) select id,email from auth.users
 where id in ('71000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002');
insert into public.organization(id,name,workspace_type) values
 ('72000000-0000-4000-8000-000000000001','KU03 Artist','artist'),
 ('72000000-0000-4000-8000-000000000002','KU03 Representation','management');
insert into public.organization_membership(organization_id,person_id,org_role,status) values
 ('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','owner','active'),
 ('72000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000002','member','active');
insert into public.role_assignment(organization_id,person_id,functional_role) values
 ('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','artist'),
 ('72000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000002','artist_manager');
insert into public.active_role_context(person_id,active_organization_id) values
 ('71000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001'),
 ('71000000-0000-4000-8000-000000000002','72000000-0000-4000-8000-000000000002');
insert into public.artists(id,created_by,owner_organization_id,organization_id,stage_name) values
 ('73000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001',
  '72000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','Fixture Artist');
insert into public.artist_access(artist_id,organization_id,status,scope,consent_at) values
 ('73000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000002','active',array['view'],now());
grant select,insert on public.evidence_artifacts to authenticated;
set request.jwt.claim.sub = '71000000-0000-4000-8000-000000000002';
set role authenticated;
do $$
declare denied boolean := false;
begin
  begin
    insert into public.evidence_artifacts(artist_id,evidence_type,source_type,value)
    values ('73000000-0000-4000-8000-000000000001','link','public-profile','https://example.test/fixture');
  exception when insufficient_privilege then denied := true;
  end;
  if not denied then raise exception 'KU03_RED: view-only ArtistAccess allowed a direct evidence write'; end if;
end $$;
reset role;
select 'KU03_DIRECT_WRITE_DENIED' as result;
