-- ============================================================
-- DOWN 043 — reverse the ArtistAccess Act-scope extension.
--
-- ORDER MATTERS. If PART B was ever applied, the policy is restored to its 001/017
-- shape FIRST — dropping grant_permits() while a policy still calls it would leave
-- passport_versions with a policy referencing a missing function, i.e. no inserts
-- at all. Wrapped in a transaction so a failure cannot land half of that.
-- ============================================================

begin;

-- Restore the shipped policy if PART B was applied. Guarded: running this where
-- PART B was never called is a no-op, not an error.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'revert_act_scoped_publish') then
    perform public.revert_act_scoped_publish();
  end if;
end $$;

drop trigger if exists trg_artist_access_guard_authority on public.artist_access;
drop function if exists public.artist_access_guard_authority();
drop trigger if exists trg_artist_access_fill_revoked_at on public.artist_access;
drop function if exists public.artist_access_fill_revoked_at();
drop function if exists public.apply_act_scoped_publish();
drop function if exists public.revert_act_scoped_publish();
drop function if exists public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz);

drop index if exists public.idx_artist_access_org_act;
drop index if exists public.idx_artist_access_org_artist_legacy;
-- Restore the 008 key that PART A replaced.
alter table public.artist_access drop constraint if exists artist_access_organization_id_artist_id_key;
alter table public.artist_access add constraint artist_access_organization_id_artist_id_key
  unique (organization_id, artist_id);
drop index if exists public.idx_artist_access_act;

alter table public.artist_access drop constraint if exists artist_access_actions_check;
alter table public.artist_access drop constraint if exists artist_access_audience_check;
alter table public.artist_access drop constraint if exists artist_access_purpose_check;
alter table public.artist_access drop constraint if exists artist_access_version_binding_check;
alter table public.artist_access drop constraint if exists artist_access_named_version_check;
alter table public.artist_access drop constraint if exists artist_access_revoked_at_check;

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

commit;
