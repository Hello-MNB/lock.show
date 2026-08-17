-- DOWN 043 — remove the Act-scope columns and their vocabularies.
-- DESTRUCTIVE BY DESIGN: dropping these columns destroys every stored grant's
-- authority data (act_id, actions, audience, purpose, version binding, attribution
-- and the revocation stamp). The grant ROWS survive; what they were allowed to do
-- does not. 044/045/046/047 must be reverted first — they reference these columns.
-- PRECONDITION. Running this first reports success and then breaks everything above
-- it: the fill trigger raises `record "new" has no field "revoked_at"`, grant_permits
-- raises `column aa.revoked_at does not exist`, and — unadvertised — dropping act_id
-- CASCADE-drops both of 044's replacement indexes, leaving NO uniqueness of any kind
-- on (organization_id, artist_id): the 008 guarantee and both replacements gone at
-- once. Independent QA reproduced all three. Refuse while any dependent survives.
do $$
declare blockers text[] := '{}';
begin
  if exists (select 1 from pg_trigger where tgname = 'trg_artist_access_guard_authority') then
    blockers := blockers || 'trg_artist_access_guard_authority (046)'::text; end if;
  if exists (select 1 from pg_trigger where tgname = 'trg_artist_access_fill_revoked_at') then
    blockers := blockers || 'trg_artist_access_fill_revoked_at (045)'::text; end if;
  if to_regprocedure('public.grant_permits(uuid,uuid,text,text,text,uuid,timestamptz)') is not null then
    blockers := blockers || 'grant_permits (047)'::text; end if;
  if exists (select 1 from pg_indexes where indexname = 'idx_artist_access_org_act') then
    blockers := blockers || 'idx_artist_access_org_act (044)'::text; end if;
  if array_length(blockers, 1) is not null then
    raise exception 'cannot roll back 043: these still depend on its columns — %. Revert 047, 046, 045, 044 first (newest-first).', array_to_string(blockers, ', ')
      using errcode = '2BP01';
  end if;
end $$;

drop index if exists public.idx_artist_access_act;

alter table public.artist_access drop constraint if exists artist_access_actions_check;
alter table public.artist_access drop constraint if exists artist_access_audience_check;
alter table public.artist_access drop constraint if exists artist_access_purpose_check;
alter table public.artist_access drop constraint if exists artist_access_version_binding_check;
alter table public.artist_access drop constraint if exists artist_access_named_version_check;

alter table public.artist_access drop column if exists revoked_by;
alter table public.artist_access drop column if exists revoked_at;
alter table public.artist_access drop column if exists granted_by;
alter table public.artist_access drop column if exists passport_version_id;
alter table public.artist_access drop column if exists version_binding;
alter table public.artist_access drop column if exists valid_from;
alter table public.artist_access drop column if exists purpose;
alter table public.artist_access drop column if exists audience;
alter table public.artist_access drop column if exists actions;
alter table public.artist_access drop column if exists act_id;

alter table public.passport_versions drop constraint if exists passport_versions_purpose_check;
alter table public.passport_versions drop column if exists purpose;
