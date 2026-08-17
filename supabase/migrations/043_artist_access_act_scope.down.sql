-- ============================================================
-- DOWN 043 — reverse the ArtistAccess Act-scope extension.
--
-- ORDER MATTERS. If PART B was ever applied, the policy is restored to its 001/017
-- shape FIRST — dropping grant_permits() while a policy still calls it would leave
-- passport_versions with a policy referencing a missing function, i.e. no inserts
-- at all. Wrapped in a transaction so a failure cannot land half of that.
-- ============================================================



-- ── PRECONDITION · rollback is not always possible, and must say so ─────────
-- PART A replaced `unique (organization_id, artist_id)` so an org could hold one
-- grant per ACT. The moment a second Act-scoped grant exists for one artist, that
-- old key can no longer be restored — two rows legitimately share (org, artist).
-- Dropping act_id first would turn them into indistinguishable duplicates and the
-- ADD CONSTRAINT would fail with a bare uniqueness error pointing at nothing.
-- Refuse up front, name the rows, and destroy nothing.
do $$
declare n integer;
begin
  select count(*) into n from (
    select organization_id, artist_id
      from public.artist_access
     group by organization_id, artist_id
    having count(*) > 1) d;
  if n > 0 then
    raise exception
      'cannot roll back 043: % (organization, artist) pair(s) hold more than one grant, which only Act-scoped grants allow. Consolidate them to a single row per (organization, artist) first — rolling back would either destroy grants or leave the 008 unique key unrestorable.', n
      using errcode = '23505';
  end if;
end $$;

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
drop function if exists public.act_belongs_to_artist(uuid, uuid);
drop trigger if exists trg_artist_access_fill_revoked_at on public.artist_access;
drop function if exists public.artist_access_fill_revoked_at();
drop function if exists public.apply_act_scoped_publish();
drop function if exists public.revert_act_scoped_publish();
drop function if exists public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz);

-- RESTORE THE 027 FUNCTION BODY BEFORE act_id DISAPPEARS.
-- 043 rewrote request_artist_access to reference `where act_id is null`. Dropping
-- the column without restoring the original body leaves the access-request flow
-- dead on the rollback path — `ERROR: column "act_id" does not exist` — which is
-- the very defect 043 exists to repair, reproduced by its own undo.
create or replace function public.request_artist_access(
  p_org uuid, p_artist uuid, p_scope text[] default '{view}', p_territory text default null
) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.has_org_role(p_org, array['owner','admin']) then raise exception 'not authorized'; end if;
  if exists (select 1 from public.artists where id = p_artist and owner_organization_id = p_org) then
    raise exception 'org already owns this artist — no access grant needed';
  end if;
  insert into public.artist_access(organization_id, artist_id, scope, territory, status, consent_at)
    values (p_org, p_artist, coalesce(p_scope, '{view}'), p_territory, 'pending', null)
  on conflict (organization_id, artist_id) do update
    set scope = excluded.scope, territory = excluded.territory,
        status = 'pending', consent_at = null
  returning id into v_id;
  return v_id;
end; $$;

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

alter table public.passport_versions drop constraint if exists passport_versions_purpose_check;
alter table public.passport_versions drop column if exists purpose;

