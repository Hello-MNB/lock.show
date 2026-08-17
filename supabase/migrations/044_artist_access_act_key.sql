-- ============================================================
-- MIGRATION 044 — ARTIST_ACCESS: PER-ACT KEY REPLACEMENT + THE WRITER IT BREAKS
--
-- STATUS: DRAFTED — NOT APPLIED to any live environment.
--
-- One part of the former single migration 043, split on independent QA's
-- recommendation after four consecutive review rounds. Every defect those rounds
-- found was a COUPLING defect between objects that shared one file — guard vs fill
-- trigger, key replacement vs ON CONFLICT, re-invite vs liveness. A single file
-- offered no seam at which one of those pairs could be reviewed or reverted alone.
--
-- These cannot be separated: dropping the 008 key breaks request_artist_access,
-- whose ON CONFLICT can no longer infer a partial index. Smallest atomic unit in
-- the set. Requires 043.
--
-- ATOMICITY: no explicit begin/commit. psql --single-transaction wraps the file and
-- the Supabase SQL editor runs a submitted script as one implicit transaction; an
-- explicit COMMIT would end the applier's transaction early.
-- ============================================================

-- KEY REPLACEMENT. `unique (organization_id, artist_id)` (008:66) caps an org at
-- ONE grant row per artist — so it could never hold separate Act-scoped grants for
-- a Person's psytrance Act and techno Act, and the whole Act-scoped design was
-- structurally unreachable for the multi-Act case it exists for. Independent QA
-- reproduced it: "duplicate key value violates artist_access_organization_id_artist_id_key".
-- The old key is replaced by two narrower ones that keep its guarantee where it
-- still applies (one legacy grant per artist) while allowing one row per Act.
alter table public.artist_access drop constraint if exists artist_access_organization_id_artist_id_key;

create unique index if not exists idx_artist_access_org_act
  on public.artist_access (organization_id, act_id)
  where act_id is not null;

create unique index if not exists idx_artist_access_org_artist_legacy
  on public.artist_access (organization_id, artist_id)
  where act_id is null;

-- ── PART A · REPAIR THE WRITER THE KEY REPLACEMENT BROKE ────────────────────
-- Replacing `unique (organization_id, artist_id)` with partial indexes broke
-- request_artist_access (027:246): its `on conflict (organization_id, artist_id)`
-- can no longer infer an index, because PostgreSQL only matches a PARTIAL unique
-- index when the statement repeats the index predicate. Reproduced executed:
--   ERROR: there is no unique or exclusion constraint matching the ON CONFLICT specification
-- That is the entire access-request flow, so the key replacement is not safe to
-- apply without this. The body is otherwise identical to 027 — only the conflict
-- target gains `where act_id is null`, which is also semantically right: a
-- legacy, act-less request may only collide with the legacy row.
create or replace function public.request_artist_access(
  p_org uuid, p_artist uuid, p_scope text[] default '{view}', p_territory text default null
) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.has_org_role(p_org, array['owner','admin']) then raise exception 'not authorized'; end if;
  if exists (select 1 from public.artists where id = p_artist and owner_organization_id = p_org) then
    raise exception 'org already owns this artist — no access grant needed';
  end if;
  -- 027's documented contract is "idempotent per (organization_id, artist_id) —
  -- re-inviting after a decline/revoke resets it to pending". With Act-scoped rows
  -- an INSERT..ON CONFLICT on the legacy predicate no longer sees them, so a
  -- re-invite silently created a SECOND row and left the Act-scoped grant active —
  -- and the duplicate (org, artist) pair it produced is exactly the condition that
  -- makes rollback refuse. Reset every existing row for the pair first; only insert
  -- when the org holds none.
  -- SCOPED TO THE LEGACY ROW, and it clears the revocation stamp.
  --
  -- Two defects lived in this one statement. (1) Without `act_id is null` a single
  -- legacy request reset EVERY Act-scoped grant for the pair — downgrading Acts it
  -- never named and erasing `consent_at`, the artist's recorded consent — while
  -- creating no legacy row at all, so the access actually requested was never made.
  -- (2) Leaving `revoked_at` set meant the legitimate revoke -> re-invite -> approve
  -- cycle produced a grant that reads `active` everywhere while `grant_permits`
  -- denies it forever, because that predicate requires `revoked_at is null`. The
  -- reinstate branch in the fill trigger only watches revoked -> active, and a
  -- re-invite interposes `pending`, so it never fired.
  --
  -- BOTH liveness columns are cleared. Clearing only revoked_at left the expired
  -- case still permanently dead after a legitimate re-approve — the same defect,
  -- one column over. And the reset skips an ACTIVE grant: re-inviting over live,
  -- artist-consented access silently downgraded it to pending and discarded the
  -- consent, which is a self-inflicted outage reachable by a mis-click.
  --
  -- On revocation history: `revoked_at` is a LIVENESS predicate here, not an audit
  -- record — it cannot be both, and the direct revoke -> approve path already clears
  -- it. Durable revocation history belongs in its own append-only record; that is
  -- recorded for the owner rather than faked by overloading this column.
  -- EXISTENCE and RESET are separate questions. Testing `found` on the UPDATE
  -- conflates them: when the legacy row exists but is skipped by the liveness
  -- precondition, `found` is false and control falls through to the INSERT, which
  -- then violates idx_artist_access_org_artist_legacy — turning a no-op re-invite
  -- into an error. Look the row up first, then decide whether to disturb it.
  select id into v_id from public.artist_access
   where organization_id = p_org and artist_id = p_artist and act_id is null
   limit 1;

  if v_id is not null then
    -- LIVE access is left alone. "Live" is not `status = 'active'` on its own: an
    -- expired grant is still stored as active, and skipping it would leave the
    -- expired-then-re-approved cycle permanently dead. Live means active AND
    -- inside its window.
    update public.artist_access
       set scope = coalesce(p_scope, '{view}'), territory = p_territory,
           status = 'pending', consent_at = null,
           revoked_at = null, revoked_by = null, expires_at = null
     where id = v_id
       and not (status = 'active' and (expires_at is null or expires_at > now()));
    return v_id;
  end if;

  insert into public.artist_access(organization_id, artist_id, scope, territory, status, consent_at)
    values (p_org, p_artist, coalesce(p_scope, '{view}'), p_territory, 'pending', null)
  returning id into v_id;
  return v_id;
end; $$;

-- PRIVILEGE, while we are replacing it. 027 declared no grants for this function,
-- so it inherited Supabase's default privileges: PUBLIC plus anon — on a
-- SECURITY DEFINER function. The internal has_org_role() check is what actually
-- stops an anonymous caller, so this is defence-in-depth rather than a live hole,
-- but a definer function reachable by anon should not be the resting state.
-- Scoped here to the one function this migration already rewrites; the sibling
-- consent RPCs share the posture and are recorded for the owner rather than
-- silently retightened by a migration about Act scope.
revoke all on function public.request_artist_access(uuid, uuid, text[], text) from public;
revoke all on function public.request_artist_access(uuid, uuid, text[], text) from anon;
grant execute on function public.request_artist_access(uuid, uuid, text[], text) to authenticated;
grant execute on function public.request_artist_access(uuid, uuid, text[], text) to service_role;
