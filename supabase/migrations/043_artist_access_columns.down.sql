-- DOWN 043 — remove the Act-scope columns and their vocabularies.
-- DESTRUCTIVE BY DESIGN: dropping these columns destroys every stored grant's
-- authority data (act_id, actions, audience, purpose, version binding, attribution
-- and the revocation stamp). The grant ROWS survive; what they were allowed to do
-- does not. 044/045/046/047 must be reverted first — they reference these columns.
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
