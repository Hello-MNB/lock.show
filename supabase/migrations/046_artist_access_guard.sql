-- ============================================================
-- MIGRATION 046 — ARTIST_ACCESS: THE AUTHORITY GUARD
--
-- STATUS: DRAFTED — NOT APPLIED to any live environment.
--
-- One part of the former single migration 043, split on independent QA's
-- recommendation after four consecutive review rounds. Every defect those rounds
-- found was a COUPLING defect between objects that shared one file — guard vs fill
-- trigger, key replacement vs ON CONFLICT, re-invite vs liveness. A single file
-- offered no seam at which one of those pairs could be reviewed or reverted alone.
--
-- This migration changes what existing clients may write, so it gets its own
-- review and its own revert. Requires 043 (columns) and 045 (the trust helper and
-- fill trigger it must agree with).
--
-- ATOMICITY: no explicit begin/commit. psql --single-transaction wraps the file and
-- the Supabase SQL editor runs a submitted script as one implicit transaction; an
-- explicit COMMIT would end the applier's transaction early.
-- ============================================================

-- DEPENDENCY ASSERTION. 046 applies cleanly without 045 and then leaves
-- artist_access UNWRITABLE: artist_access_guard_authority() is plpgsql, so its call
-- to artist_access_trusted_writer() resolves at RUN time, not at CREATE, and CREATE
-- TRIGGER does not resolve it either. Independent QA reproduced it — 043+046 applies
-- OK and the very next write raises
--   ERROR: function public.artist_access_trusted_writer() does not exist
-- from inside the guard, so every INSERT/UPDATE/DELETE fails. A migration that can
-- brick a table by being applied out of order must refuse; a header comment is not
-- enforcement.
do $$
begin
  if to_regprocedure('public.artist_access_trusted_writer()') is null then
    raise exception 'migration 046 requires 045 (artist_access_trusted_writer). Apply 045 first.'
      using errcode = '42883';
  end if;
end $$;

-- ACT-OWNERSHIP LOOKUP, SECURITY DEFINER. The linkage check below must not run
-- with the caller's visibility: policy act_org (020:187) resolves through
-- public.artists, and a NON-DEFAULT Act has no artists row, so an artist cannot
-- even SELECT their own second Act. An invoker-visibility check therefore refused
-- the artist's own Act-scoped grant with a data-integrity error about a violation
-- that did not exist — making the multi-Act case issuable only by the table owner,
-- which is the exact case this migration exists to enable.
create or replace function public.act_belongs_to_artist(p_act uuid, p_artist uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.act a
      join public.artists ar on ar.id = p_artist
     where a.id = p_act
       and a.person_id = ar.created_by
  );
$$;

revoke all on function public.act_belongs_to_artist(uuid, uuid) from public;
revoke all on function public.act_belongs_to_artist(uuid, uuid) from anon;
grant execute on function public.act_belongs_to_artist(uuid, uuid) to authenticated;
grant execute on function public.act_belongs_to_artist(uuid, uuid) to service_role;

-- ── PART A · THE GRANTEE MUST NOT WRITE THEIR OWN GRANT ─────────────────────
-- Independent QA reproduced the hole this closes: policy `aa_admin_write` (008:222)
-- is FOR ALL with USING/WITH CHECK = has_org_role(organization_id,'owner','admin'),
-- and it governs every column added above. So an agency owner could simply
-- `update artist_access set actions='{publish,sign}', audience='{...}'` on their own
-- row and self-issue the authority this migration exists to bound — making
-- grant_permits() default-deny in name only. The table is reachable from the
-- shipped client (src/lib/orgs.js), so this is not theoretical.
--
-- Authority columns may therefore be set only by (a) the artist who owns the
-- subject, or (b) a SECURITY DEFINER consent RPC, which runs as the table owner.
-- The owner comparison is resolved from the catalogue rather than hardcoding a
-- role name, so this keeps working if the owning role differs per environment.
create or replace function public.artist_access_guard_authority()
returns trigger
language plpgsql
-- SECURITY INVOKER, deliberately. As DEFINER the function body runs as its OWNER,
-- so `current_user` inside it is always the table owner and the trust check below
-- short-circuits for every caller — the guard would be installed and inert. As
-- INVOKER, current_user is the real caller: `authenticated` for a PostgREST write,
-- and the owner only inside a SECURITY DEFINER consent RPC, which is exactly the
-- distinction this guard needs to make. owns_artist() is itself DEFINER, so the
-- ownership question is still answered with full visibility.
security invoker
set search_path = public, pg_temp
as $$
declare
  touched boolean;
begin

  -- DELETE: only the trusted path or an owner/admin of the artist's org may remove
  -- a grant row at all, because deletion destroys the revocation trail entirely.
  if tg_op = 'DELETE' then
    if public.artist_access_trusted_writer() then return old; end if;
    if not exists (select 1 from public.artists ar
                    where ar.id = old.artist_id
                      and public.has_org_role(ar.owner_organization_id, array['owner','admin'])) then
      raise exception 'artist_access: a grant may only be deleted by an owner/admin of the artist''s organization'
        using errcode = '42501';
    end if;
    return old;
  end if;

  -- LINKAGE FIRST, for EVERY writer including the owner. This is a data-integrity
  -- rule, not an authority rule: a grant pointing at an Act that belongs to someone
  -- else is malformed no matter who wrote it, and putting it after the trust
  -- short-circuit below would let consent RPCs and owner writes create exactly that.
  if new.act_id is not null and not public.act_belongs_to_artist(new.act_id, new.artist_id) then
    raise exception 'artist_access: act_id does not belong to the artist named by artist_id'
      using errcode = '23514';
  end if;

  -- Trusted principals: the table owner (which is also what SECURITY DEFINER
  -- consent RPCs run as) and service_role, the documented backend break-glass
  -- identity used by scripts/seed.mjs. Omitting service_role silently removed the
  -- backend's ability to write any authority column — INSERT of an active grant,
  -- reinstatement and deletion all refused with 42501.
  if public.artist_access_trusted_writer() then
    return new;
  end if;

  -- The guarded set includes status, expires_at and the revocation stamp — NOT
  -- only the columns 043 added. Independent QA proved why: with status unguarded a
  -- grantee simply set status='active' on its own revoked grant and published, and
  -- the reinstate branch then erased the record that it had ever been revoked; with
  -- expires_at unguarded it pushed its own expiry out ten years. Revocation and
  -- time are the two bounds the owner ruling names explicitly, and both were
  -- grantee-controlled. revoked_at/revoked_by are guarded too, because QA forged
  -- attribution by naming the artist as the revoker.
  if tg_op = 'INSERT' then
    touched := coalesce(array_length(new.actions, 1), 0) > 0
            or coalesce(array_length(new.audience, 1), 0) > 0
            or new.act_id is not null or new.purpose is not null
            or new.version_binding is not null or new.passport_version_id is not null
            or new.granted_by is not null
            or new.expires_at is not null
            or new.revoked_at is not null or new.revoked_by is not null
            or new.valid_from is distinct from now()
            -- scope and consent_at are the columns can_access_artist() and
            -- artist_access_has_scope() gate on TODAY, while actions/audience gate
            -- only the dormant PART B. Guarding the future bound and leaving the
            -- live one open let a grantee self-grant 'publish' scope and forge the
            -- artist's recorded consent.
            or coalesce(array_length(new.scope, 1), 0) > 0
            or new.consent_at is not null
            or new.status = 'active';
  else
    touched := new.actions is distinct from old.actions
            or new.audience is distinct from old.audience
            or new.act_id is distinct from old.act_id
            or new.purpose is distinct from old.purpose
            or new.version_binding is distinct from old.version_binding
            or new.passport_version_id is distinct from old.passport_version_id
            or new.granted_by is distinct from old.granted_by
            or new.valid_from is distinct from old.valid_from
            or new.status is distinct from old.status
            or new.expires_at is distinct from old.expires_at
            or new.revoked_at is distinct from old.revoked_at
            or new.revoked_by is distinct from old.revoked_by
            or new.scope is distinct from old.scope
            or new.consent_at is distinct from old.consent_at;
  end if;

  -- owns_artist() alone is too wide: 030:22-32 resolves to ANY active member of an
  -- org that owns the artist, at any role — QA set actions='{publish,sign}' as a
  -- plain 'member'. Authority over a grant requires owner/admin of the artist's
  -- OWNING organization.
  if touched and not exists (
       select 1 from public.artists ar
        where ar.id = new.artist_id
          and public.has_org_role(ar.owner_organization_id, array['owner','admin'])) then
    raise exception 'artist_access: authority columns may only be set by an owner/admin of the artist''s organization (or a consent RPC)'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_artist_access_guard_authority on public.artist_access;
-- DELETE is guarded as well: QA deleted a revoked grant row outright and destroyed
-- the revocation trail. Removing the row is a stronger act than editing it.
create trigger trg_artist_access_guard_authority
  before insert or update or delete on public.artist_access
  for each row execute function public.artist_access_guard_authority();

revoke all on function public.artist_access_guard_authority() from public;
revoke all on function public.artist_access_guard_authority() from anon;
revoke all on function public.artist_access_guard_authority() from authenticated;
revoke all on function public.artist_access_guard_authority() from service_role;
