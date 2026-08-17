-- ============================================================
-- MIGRATION 045 — ARTIST_ACCESS: REVOCATION LIFECYCLE + THE SHARED TRUST HELPER
--
-- STATUS: DRAFTED — NOT APPLIED to any live environment.
--
-- One part of the former single migration 043, split on independent QA's
-- recommendation after four consecutive review rounds. Every defect those rounds
-- found was a COUPLING defect between objects that shared one file — guard vs fill
-- trigger, key replacement vs ON CONFLICT, re-invite vs liveness. A single file
-- offered no seam at which one of those pairs could be reviewed or reverted alone.
--
-- artist_access_trusted_writer() lives here as its FIRST consumer, and 046 calls
-- the same function rather than copying the rule — two copies of one trust test is
-- exactly how the service_role drift defect happened. Requires 043.
--
-- ATOMICITY: no explicit begin/commit. psql --single-transaction wraps the file and
-- the Supabase SQL editor runs a submitted script as one implicit transaction; an
-- explicit COMMIT would end the applier's transaction early.
-- ============================================================

-- TRUSTED WRITER — the single definition of "may write authority state".
--
-- This exists because the guard and the fill trigger each carried their own copy
-- of the test and they DRIFTED: the guard was widened to accept service_role while
-- the fill trigger was not. A service_role reinstate was then permitted by the
-- guard but refused a stamp-clear by the fill trigger, leaving a grant that reads
-- `active` to the UI and to can_access_artist while grant_permits denies it
-- forever. Two copies of one rule is the defect; one function is the fix.
--
-- NOTE ON STRENGTH: service_role is materially weaker trust than the table owner.
-- SET ROLE authorizes against session_user, so a PostgREST connection can reach
-- service_role but cannot reach the owner. It is included because the backend
-- genuinely writes authority state (scripts/seed.mjs), and that reduced strength is
-- recorded here rather than left implicit.
create or replace function public.artist_access_trusted_writer()
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select current_user in (
    (select r.rolname from pg_class c join pg_roles r on r.oid = c.relowner
      where c.oid = 'public.artist_access'::regclass),
    'service_role'
  );
$$;

revoke all on function public.artist_access_trusted_writer() from public;
revoke all on function public.artist_access_trusted_writer() from anon;
grant execute on function public.artist_access_trusted_writer() to authenticated;
grant execute on function public.artist_access_trusted_writer() to service_role;

create or replace function public.artist_access_fill_revoked_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status = 'revoked' and new.revoked_at is null then
    new.revoked_at := now();
  end if;
  -- Reinstating a grant clears the revocation stamp so a later time-window read
  -- cannot see an active row still claiming to have been revoked — but ONLY when
  -- the row is genuinely being reinstated to active. A re-invite sets status back
  -- to 'pending' (027:246-249 ON CONFLICT DO UPDATE), and erasing the stamp there
  -- would delete the record that this org was once revoked, which is exactly the
  -- history the ruling says revocation must preserve.
  -- tg_op, NOT `old is not null`: for a composite row that test is FALSE whenever
  -- ANY column is null (territory, purpose, expires_at are all nullable here), so
  -- the reinstate branch would almost never fire.
  -- Only on the TRUSTED path. Clearing the stamp on any revoked->active transition
  -- let a grantee erase its own revocation record simply by reinstating itself.
  if tg_op = 'UPDATE' and public.artist_access_trusted_writer()
     and new.status = 'active' and old.status = 'revoked' then
    new.revoked_at := null;
    new.revoked_by := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_artist_access_fill_revoked_at on public.artist_access;
create trigger trg_artist_access_fill_revoked_at
  before insert or update on public.artist_access
  for each row execute function public.artist_access_fill_revoked_at();

-- NOT VALID: rows revoked BEFORE this migration have no timestamp and there is no
-- honest value to backfill — created_at is the grant's birth, not its revocation,
-- and now() would assert it was revoked at migration time. Both invent history.
-- New and updated rows are still enforced, and the trigger above guarantees they
-- satisfy it.
-- NOTE: this constraint is UNFALSIFIABLE while the trigger above is installed —
-- every route to a revoked row with a null stamp is refilled before the check runs,
-- and convalidated is false. It documents the invariant; the TRIGGER enforces it.
-- Do not read it as an independently enforced bound.
alter table public.artist_access drop constraint if exists artist_access_revoked_at_check;
alter table public.artist_access add constraint artist_access_revoked_at_check
  check (status <> 'revoked' or revoked_at is not null) not valid;

-- REVOKE FROM PUBLIC IS NOT ENOUGH. Supabase ships ALTER DEFAULT PRIVILEGES that
-- grant EXECUTE on every new function in `public` to anon, authenticated and
-- service_role individually. Those are role grants, not the PUBLIC grant, so
-- revoking PUBLIC leaves them in place — verified executed here: immediately after
-- CREATE, proacl read `anon=X/postgres,authenticated=X/postgres,service_role=X/postgres`,
-- and an anonymous session could call this function as an authority oracle.
-- Each role is therefore revoked by name before anything is granted back.
revoke all on function public.artist_access_fill_revoked_at() from public;
revoke all on function public.artist_access_fill_revoked_at() from anon;
revoke all on function public.artist_access_fill_revoked_at() from authenticated;
revoke all on function public.artist_access_fill_revoked_at() from service_role;
