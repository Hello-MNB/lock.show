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

-- HONEST LIMIT (LINKAGE ORACLE). Granting EXECUTE to `authenticated` on a SECURITY
-- DEFINER function makes it an oracle: any logged-in user can ask whether an arbitrary
-- (act, artist) pair is linked, including a NON-DEFAULT Act that policy act_org hides
-- from them -- which under the multi-Act rule is precisely "does this Person's
-- psytrance Act and that techno Act belong to the same artist". Independent QA
-- executed it with a stranger holding no membership, organization or grant anywhere.
-- It answers one boolean about ids the caller must already possess, and it cannot
-- simply be revoked: the guard below is SECURITY INVOKER by design, so every client
-- write needs this EXECUTE and removing it refuses all of them. Narrowing it means
-- moving the linkage test into a DEFINER wrapper that also owns the write, which is a
-- larger change than a guard. `anon` IS revoked (Supabase grants EXECUTE to
-- anon/authenticated/service_role at CREATE time, and REVOKE FROM PUBLIC does not
-- remove it), and the limit is asserted as measured in scripts/test-grant-scope.mjs.
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
  --
  -- HONEST LIMIT 2 (FK CASCADE): this branch cannot see a cascade. Referential-action
  -- triggers run as the table owner, so artist_access_trusted_writer() is TRUE inside
  -- them and the short-circuit below returns before any check. A grantee-org owner
  -- deleting their OWN organization — a shipped client flow (src/lib/orgs.js) — takes
  -- the grant row, and its revocation trail, with it. Verified by execution. Closing
  -- this means distinguishing a cascade from a genuine owner write (pg_trigger_depth)
  -- or moving the trail out of this table entirely; both are larger than a guard, and
  -- the second is the same append-only record OWNER-PENDING already asks about.
  --
  -- HONEST LIMIT: the artist-org half of this rule is currently RLS-UNREACHABLE. No
  -- DELETE policy exists for that principal (aa_artist_owner_respond is FOR UPDATE,
  -- aa_artist_owner_read is FOR SELECT), so an artist-org owner's DELETE is filtered
  -- to zero rows and never reaches this branch — verified by execution. The DENY half
  -- below is live and load-bearing. Adding a DELETE policy is a change to 027's
  -- policy set, not to this migration.
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

  -- THE SUBJECT MAY NOT BE WALKED. Even an owner/admin of the CURRENT subject's org
  -- must not be able to retarget a grant at a different artist: that would carry the
  -- existing consent, scope and status onto a party who never granted anything.
  -- Re-pointing requires authority over BOTH the old and the new subject.
  if tg_op = 'UPDATE' and new.artist_id is distinct from old.artist_id
     and not public.artist_access_trusted_writer() then
    if not (exists (select 1 from public.artists ar where ar.id = old.artist_id
                     and public.has_org_role(ar.owner_organization_id, array['owner','admin']))
        and exists (select 1 from public.artists ar where ar.id = new.artist_id
                     and public.has_org_role(ar.owner_organization_id, array['owner','admin']))) then
      raise exception 'artist_access: a grant may not be re-pointed at a different artist'
        using errcode = '42501';
    end if;
  end if;

  -- LINKAGE FIRST, for EVERY writer including the owner. This is a data-integrity
  -- rule, not an authority rule: a grant pointing at an Act that belongs to someone
  -- else is malformed no matter who wrote it, and putting it after the trust
  -- short-circuit below would let consent RPCs and owner writes create exactly that.
  --
  -- ONLY WHEN THE LINKAGE IS BEING WRITTEN. Re-validating an UNCHANGED act_id on
  -- every UPDATE made a live grant PERMANENTLY UNREVOCABLE, and independent QA
  -- executed it: policy act_org (020:187) is FOR ALL on can_access_artist(act.id) and
  -- the default Act's id equals the artist's id, so any active grant-holder can write
  -- public.act. Setting act.person_id to themselves broke the linkage on a row they
  -- did not own, after which revocation raised 23514 for EVERY principal -- the
  -- artist's org owner, the consent RPC, service_role and the table owner alike --
  -- while grant_permits() still returned true. A grantee could make their own publish
  -- grant unrevocable. Revocation is a bound the owner ruling names explicitly, so a
  -- check that can freeze it must never fire on data the statement is not touching.
  -- Any other linkage drift (ops correction, Person merge, ownership transfer) froze
  -- the row the same way. The enabling RLS hole is in 020 and is recorded in
  -- docs/OWNER-PENDING.md; 046 must not convert it into an unrevocable grant.
  -- Of the three disjuncts, `tg_op = 'INSERT'` is REDUNDANT and kept deliberately for
  -- readability: on INSERT, OLD is NULL, so `new.act_id is distinct from old.act_id`
  -- is already true whenever new.act_id is not null, which the outer test requires.
  -- Independent QA verified the equivalence by execution rather than by reading. The
  -- other two are load-bearing and both are asserted: dropping the act_id term turns
  -- the suite red, and dropping the artist_id term let a trusted writer re-point
  -- artist_id onto a different artist while act_id went stale, producing a live grant
  -- whose Act belongs to another Person with grant_permits returning true.
  if new.act_id is not null
     and (tg_op = 'INSERT'
          or new.act_id is distinct from old.act_id
          or new.artist_id is distinct from old.artist_id)
     and not public.act_belongs_to_artist(new.act_id, new.artist_id) then
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
    -- CREATING A GRANT ROW IS ITSELF AN AUTHORITY ACT. This was an enumeration for
    -- three rounds and it failed OPEN exactly as the UPDATE comment below predicts:
    -- both independent reviewers executed the same insert as a plain `authenticated`
    -- grantee-org admin, defeating the list by passing scope='{}' and status='pending'
    -- so that every guarded term evaluated false --
    --   insert into artist_access (id, organization_id, artist_id, access_level,
    --                              status, scope, territory, created_at)
    --   values (<chosen uuid>, <own org>, <subject>, 'manage', 'pending', '{}',
    --           'Worldwide', now() - interval '5 years');            -- ACCEPTED
    -- A CHOSEN primary key (the consent RPCs address rows BY id), a FORGED created_at
    -- (which orders the artist's inbox -- 027:270 `order by aa.created_at desc`), an
    -- arbitrary territory and access_level rendered back to the artist on their own
    -- screen. The row granted nothing until approved, but the artist then approved it
    -- and it reached their inbox carrying all four forged fields.
    --
    -- No legitimate untrusted INSERT is lost. Enumerated and executed rather than
    -- assumed: src/lib/orgs.js never INSERTs (:298, :349, :475 are SELECT/UPDATE);
    -- server/*.js never INSERTs; scripts/seed.mjs:214-225 runs as service_role, which
    -- the trust short-circuit above exempts; and the grantee-side creation path is
    -- request_artist_access(), SECURITY DEFINER, likewise exempt.
    --
    -- ONE EXCEPTION, and the earlier wording here was WRONG to say "every shipped
    -- creation path is request_artist_access()". scripts/seed-demo-agency.mjs:93
    -- INSERTs DIRECTLY, through the anon key with a user session (:13) -- so as plain
    -- `authenticated`, neither trusted nor via the RPC. It survives because that
    -- seeder owns the artists it links, so the owner/admin test below passes on its
    -- own merits. Verified by execution. The conclusion holds; the reason given for it
    -- did not, and round 8 already shipped one header claim that was false.
    --
    -- The only principal that reaches this branch untrusted and unowning is the
    -- grantee writing their own grant row, which is the act PART A exists to refuse.
    -- So the correct test is not a better list -- it is that there is nothing to list.
    touched := true;
  else
    -- TOTAL ROW COMPARISON, deliberately — not an enumeration of columns.
    --
    -- A hand-maintained list was wrong three rounds running. Each round an
    -- independent review found a different column that identifies or bounds the
    -- grant sitting outside it: first `artist_id` (the subject could be walked onto
    -- another artist), then `organization_id` (the holder could be walked to another
    -- org), then `id` itself — the worst of the three, because the consent RPCs
    -- address rows BY id. A grantee could renumber their own rows so the artist,
    -- shown a modest legacy request in their inbox, approved an id that by then
    -- carried a REVOKED publish grant: resurrected with a fresh consent_at, while the
    -- row they meant to approve stayed pending. QA executed that hijack end to end as
    -- plain `authenticated`.
    --
    -- An enumeration is wrong by construction: it must be revisited whenever a column
    -- is added, and it fails OPEN when someone forgets. A whole-row test fails CLOSED
    -- — a new column is guarded the moment it exists. It also closed `created_at`
    -- (attribution of the same class as the guarded revoked_at) and `territory` (a
    -- consented bound the artist's own screen renders back to them). The INSERT branch
    -- above reaches the same failure mode by the other route: there, EVERY column is
    -- authority, so the test is unconditional. Neither branch enumerates.
    --
    -- Row-wise IS DISTINCT FROM is NULL-correct, so a genuine no-op UPDATE on a
    -- NULL-bearing row still passes and raises no false refusal.
    --
    -- KNOWN BOUND (record comparison): `is distinct from` on a whole row needs a
    -- default btree equality operator for every column type. Adding a column of a type
    -- that has none — `json` is the realistic case, `xml` the other — makes EVERY
    -- untrusted write raise 42883 (`could not identify an equality operator for type
    -- json`), which src/lib/orgs.js:270 swallows as "migration 027 not applied yet", so
    -- the client would fail soft and silent. No such column exists on this table today;
    -- use `jsonb`, which has one. Asserted by scripts/test-grant-scope.mjs [25f].
    touched := new is distinct from old;
  end if;

  -- owns_artist() alone is too wide: 030:22-32 resolves to ANY active member of an
  -- org that owns the artist, at any role — QA set actions='{publish,sign}' as a
  -- plain 'member'. Authority over a grant requires owner/admin of the artist's
  -- OWNING organization on THIS path.
  --
  -- HONEST LIMIT: that is not the effective bound on the live columns. 027's
  -- respond_to_access_request() is SECURITY DEFINER and authorises any ACTIVE MEMBER
  -- of the artist's org, so a plain member can still set scope and consent_at through
  -- it — verified by execution. This guard narrows the DIRECT path only. Tightening
  -- the consent RPCs is a separate change to 027's contract and is recorded in
  -- docs/OWNER-PENDING.md rather than smuggled into a migration about Act scope.
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
