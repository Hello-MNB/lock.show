-- ============================================================
-- MIGRATION 047 — THE GRANT DECISION FUNCTION + THE DORMANT PUBLISH SWITCH
--
-- STATUS: DRAFTED — NOT APPLIED to any live environment.
--
-- One part of the former single migration 043, split on independent QA's
-- recommendation after four consecutive review rounds. Every defect those rounds
-- found was a COUPLING defect between objects that shared one file — guard vs fill
-- trigger, key replacement vs ON CONFLICT, re-invite vs liveness. A single file
-- offered no seam at which one of those pairs could be reviewed or reverted alone.
--
-- Reads everything above and changes nothing until called: PART B is installed
-- with no grant to any role. Safest to land last, cheapest to revert.
-- Requires 043, 045 and 046.
--
-- ATOMICITY: no explicit begin/commit. psql --single-transaction wraps the file and
-- the Supabase SQL editor runs a submitted script as one implicit transaction; an
-- explicit COMMIT would end the applier's transaction early.
-- ============================================================

-- ── PART A · the decision function ──────────────────────────────────────────
-- DEFAULT DENY. Returns true ONLY when a grant positively permits this exact
-- Act × action × audience at this instant. Every early exit is a denial.
--
-- SECURITY INVOKER on purpose: this answers "may the caller's org do X", so it
-- must see exactly what the caller sees. A DEFINER function here would hand back
-- an answer computed with the owner's visibility.
create or replace function public.grant_permits(
  p_org       uuid,
  p_act       uuid,
  p_action    text,
  p_audience  text,
  p_purpose   text,
  p_version   uuid,
  p_at        timestamptz default now()
) returns boolean
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.artist_access aa
    where aa.organization_id = p_org
      and aa.status = 'active'
      and aa.revoked_at is null
      and aa.valid_from <= p_at
      and (aa.expires_at is null or aa.expires_at > p_at)
      -- Act scope: an Act-scoped grant must name THIS Act. A legacy NULL grant
      -- still covers the artist's Acts, but never for 'publish' — publishing is
      -- the act the ruling requires to be Act-explicit.
      and (
        aa.act_id = p_act
        -- LEGACY (act_id NULL) grants cover the artist's Acts, never for publish.
        -- The relation is resolved through the artist's OWNER, not through the
        -- id coincidence act.id = artists.id that migration 020's backfill happens
        -- to produce: that identity holds only for the DEFAULT Act, so the old
        -- form silently meant "the default Act only" while claiming to mean "every
        -- Act of the artist". Fail-closed either way, but it now says what it does.
        or (aa.act_id is null and p_action <> 'publish'
            and exists (select 1
                          from public.act a
                          join public.artists ar on ar.id = aa.artist_id
                         where a.id = p_act
                           and a.person_id = ar.created_by))
      )
      and p_action = any (aa.actions)
      -- AUDIENCE IS MANDATORY. The denial for a NULL audience actually comes from
      -- SQL NULL semantics on the comparison below (`null = any(...)` is NULL, which
      -- WHERE treats as false); this line is explicit documentation of the intent,
      -- not the mechanism, and removing it changes no behaviour. It is kept for
      -- readability and must NOT be counted as an independent bound.
      and p_audience is not null
      and p_audience = any (aa.audience)
      -- PURPOSE. Stored and vocabulary-checked but never consulted before; a grant
      -- that names a purpose now only permits that purpose.
      and (aa.purpose is null or (p_purpose is not null and p_purpose = aa.purpose))
      -- VERSION BINDING. 'named' pins the grant to ONE immutable PassportVersion;
      -- previously it was decorative and any version passed.
      -- VERSION BINDING. 'latest_published' follows the Act's current published
      -- version and places no version restriction here. 'named' pins the grant to
      -- ONE existing PassportVersion, and therefore does NOT authorize creating a
      -- new one: PART B passes the id of the row being inserted, which by
      -- definition cannot equal an already-existing pinned id. That denial is the
      -- intended rule and is stated here rather than emerging by accident — a
      -- named-version mandate is authority over that version, not a licence to
      -- publish further ones.
      and (
        aa.version_binding is distinct from 'named'
        or (p_version is not null and p_version = aa.passport_version_id)
      )
  );
$$;

-- Explicit, minimal grants. PUBLIC never gets execute: an ungranted function is
-- callable by every role through PUBLIC, which is how a decision function becomes
-- an oracle for anyone who can open a connection.

revoke all on function public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz) from public;
revoke all on function public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz) from anon;
revoke all on function public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz) from authenticated;
revoke all on function public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz) from service_role;
-- Granted back deliberately, and only to the two roles that must ask the question.
-- anon is NOT among them: an anonymous caller has no org and no grant, so the only
-- thing this function could give them is confirmation of who represents whom.
grant execute on function public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz) to authenticated;
grant execute on function public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz) to service_role;

comment on function public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz) is
  'Default-deny authority decision for a representation grant: Act x action x audience x time. Membership, roster entry, job title and prior access grant nothing.';

-- ============================================================
-- PART B — DORMANT. The tightening half. Installed as a callable with NO GRANT,
-- so it cannot run until the owner executes it as the table owner:
--
--   select public.apply_act_scoped_publish();
--
-- It makes passport_versions INSERT require either Act ownership or a grant that
-- positively permits 'publish' on that exact Act. Until it is called, the shipped
-- policy pv_owner_insert is untouched and behaviour is byte-identical.
-- ============================================================

create or replace function public.apply_act_scoped_publish() returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  drop policy if exists pv_owner_insert on public.passport_versions;
  create policy pv_owner_insert on public.passport_versions
    for insert to authenticated
    with check (
      -- Act ownership: the Person who holds the Act.
      exists (select 1 from public.act a
               where a.id = coalesce(passport_versions.act_id, passport_versions.artist_id)
                 and a.person_id = auth.uid())
      -- or an explicit, current grant permitting publish on THIS Act.
      or exists (select 1 from public.organization_membership m
                  where m.person_id = auth.uid()
                    and m.status = 'active'
                    -- audience/purpose/version are passed from the row being
                    -- written, so the grant's bounds apply to THIS publication.
                    and public.grant_permits(
                          m.organization_id,
                          coalesce(passport_versions.act_id, passport_versions.artist_id),
                          'publish',
                          passport_versions.audience,
                          passport_versions.purpose,
                          passport_versions.id))
    );
end;
$$;

create or replace function public.revert_act_scoped_publish() returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  drop policy if exists pv_owner_insert on public.passport_versions;
  -- NO `to` CLAUSE — 017:18 created this policy for PUBLIC. Recreating it `to
  -- authenticated` silently NARROWS the shipped policy on rollback; QA caught the
  -- before/after role tuple diverging while a substring check saw no difference.
  create policy pv_owner_insert on public.passport_versions
    for insert
    with check (public.can_access_artist(artist_id));
end;
$$;

-- NO GRANT AT ALL on either callable — not to anon, not to authenticated, not to
-- service_role. Only the table owner can run them. Each role is revoked BY NAME
-- for the same reason as above: Supabase's default privileges grant EXECUTE to all
-- three at CREATE time, so a PUBLIC-only revoke would leave a policy-swapping
-- function callable by any logged-in user — the exact defect migration 042 was
-- written to avoid.
revoke all on function public.apply_act_scoped_publish() from public;
revoke all on function public.apply_act_scoped_publish() from anon;
revoke all on function public.apply_act_scoped_publish() from authenticated;
revoke all on function public.apply_act_scoped_publish() from service_role;
revoke all on function public.revert_act_scoped_publish() from public;
revoke all on function public.revert_act_scoped_publish() from anon;
revoke all on function public.revert_act_scoped_publish() from authenticated;
revoke all on function public.revert_act_scoped_publish() from service_role;
