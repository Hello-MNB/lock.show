-- ============================================================
-- MIGRATION 043 — ARTIST_ACCESS: ACT SCOPE + ACTION/AUDIENCE/PURPOSE/TIME
--
-- STATUS: DRAFTED — NOT APPLIED to any live environment. Authored by the build
-- agent; applying is the owner's act.
--
-- WHY. Owner ruling (16 Aug 2026): "extend artist_access with explicit Act scope
-- plus audience/purpose/action/version/time/expiry/revocation semantics. Default
-- deny; membership/roster/title/previous access grants nothing."
--
-- Today a grant names an ARTISTS row (008:61) and carries only scope[], territory
-- and expires_at. For a Person holding Acts A and B, ONE grant covers BOTH — which
-- is why representation publishing is currently refused outright in the API: three
-- of the contract's four bounds (audience, purpose, version) are inexpressible.
--
-- SHAPE. PART A is purely ADDITIVE: new nullable columns, one partial index and
-- one SECURITY INVOKER helper. It changes NO existing policy, so nothing that
-- works today can stop working. PART B — adopting the helper inside RLS — is the
-- BREAKING half and is installed DORMANT, as a callable with no grant at all,
-- exactly as 042 does. Nothing tightens until the owner calls it.
--
-- FIREWALL: no score/rank/percentile column. This migration stores authority, not
-- judgement about a person.
-- ============================================================

-- ATOMICITY. This file carries NO explicit begin/commit.
--
-- Independent QA observed the earlier version emitting "there is already a
-- transaction in progress" / "there is no transaction in progress" under the
-- repo's own applier, which runs psql --single-transaction: the explicit COMMIT
-- ended the applier's transaction early, so PART A could commit while PART B
-- failed and leave the database half-migrated. Leaving the framing to the caller
-- makes the file atomic under BOTH paths — psql --single-transaction wraps it, and
-- the Supabase SQL editor runs a submitted script as a single implicit transaction.
-- Do not reintroduce begin/commit here.

-- ── PART A · additive grant semantics ───────────────────────────────────────

-- ACT SCOPE. NULL = a legacy grant, which covers every Act of the artist — that is
-- what those rows have always meant and this migration must not silently narrow
-- them. New grants are expected to name an Act; PART B is what makes NULL stop
-- being sufficient for publish.
alter table public.artist_access
  add column if not exists act_id uuid references public.act(id) on delete cascade;

-- ACTION LADDER (Product 30.10 §7A). Distinct verbs with distinct authority:
-- REQUEST/PREPARE/PROPOSE do not bind the artist; CHANGE edits drafts; PUBLISH
-- needs Act ownership or this explicit grant; NEGOTIATE/SIGN are separate again.
alter table public.artist_access
  add column if not exists actions text[] not null default '{}';

-- AUDIENCE + PURPOSE bound WHO a published version may be shown to and WHY.
alter table public.artist_access
  add column if not exists audience text[] not null default '{}';
alter table public.artist_access
  add column if not exists purpose text;

-- TIME. expires_at already exists (027:99); a grant also needs a START, or a
-- future-dated mandate is live the moment it is written.
alter table public.artist_access
  add column if not exists valid_from timestamptz not null default now();

-- VERSION BINDING. 'named' pins the grant to ONE immutable PassportVersion;
-- 'latest_published' follows the Act's current published version.
alter table public.artist_access
  add column if not exists version_binding text;
alter table public.artist_access
  add column if not exists passport_version_id uuid references public.passport_versions(id) on delete set null;

-- REVOCATION + ATTRIBUTION. `status` already carries 'revoked'; these record WHO
-- and WHEN, so expiry/revocation can recalculate visibility and pending work
-- without destroying history.
alter table public.artist_access
  add column if not exists granted_by uuid references public.person(id) on delete set null;
alter table public.artist_access
  add column if not exists revoked_at timestamptz;
alter table public.artist_access
  add column if not exists revoked_by uuid references public.person(id) on delete set null;

-- Bounded vocabularies. Written as NOT VALID would skip existing rows; every new
-- column defaults to a value that already satisfies its check, so a plain
-- constraint is safe and is actually enforced from now on.
alter table public.artist_access drop constraint if exists artist_access_actions_check;
alter table public.artist_access add constraint artist_access_actions_check
  check (actions <@ array['request','prepare','propose','change','publish','negotiate','sign']::text[]);

-- AUDIENCE VOCABULARY. These are the SAME values passport_versions.audience
-- accepts (041:287). They diverged in the first draft — the grant spoke
-- buyer/named_recipient/link while the thing it authorizes speaks
-- booker/producer/programmer/brand — so PART B fed one vocabulary into the other
-- and EVERY real audience was denied, while a publication with NO audience was
-- allowed through a coalesce default. The bound was exactly inverted. A grant must
-- speak the language of the object it authorizes.
alter table public.artist_access drop constraint if exists artist_access_audience_check;
alter table public.artist_access add constraint artist_access_audience_check
  check (audience <@ array['booker','producer','private','programmer','brand','rep']::text[]);

alter table public.artist_access drop constraint if exists artist_access_purpose_check;
alter table public.artist_access add constraint artist_access_purpose_check
  check (purpose is null or purpose in ('booking','availability','review','introduction','renewal'));

alter table public.artist_access drop constraint if exists artist_access_version_binding_check;
alter table public.artist_access add constraint artist_access_version_binding_check
  check (version_binding is null or version_binding in ('named','latest_published'));

-- A 'named' binding without a version is not a binding.
alter table public.artist_access drop constraint if exists artist_access_named_version_check;
alter table public.artist_access add constraint artist_access_named_version_check
  check (version_binding is distinct from 'named' or passport_version_id is not null);

-- A revoked grant must say WHEN. Enforced by a BEFORE trigger that fills the
-- timestamp, not by a bare constraint.
--
-- Why the trigger and not just the check: executing this migration proved a bare
-- constraint breaks every EXISTING writer that revokes by setting status alone —
-- two shipped test fixtures and any app path doing `update artist_access set
-- status='revoked'` would start failing the moment 043 was applied. That is a
-- runtime outage introduced by a migration that calls itself additive. The trigger
-- makes the invariant true for every writer, old and new, without asking any of
-- them to change; the constraint below then simply cannot be violated.
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
alter table public.artist_access drop constraint if exists artist_access_revoked_at_check;
alter table public.artist_access add constraint artist_access_revoked_at_check
  check (status <> 'revoked' or revoked_at is not null) not valid;

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

create index if not exists idx_artist_access_act
  on public.artist_access (act_id) where act_id is not null;




-- PURPOSE ON THE PUBLICATION. The grant can bound a purpose, but passport_versions
-- had no purpose column, so PART B could only ever pass NULL — which made a grant
-- carrying a purpose UNPUBLISHABLE rather than bounded. Additive and nullable:
-- existing rows and writers are unaffected, and the bound becomes satisfiable.
alter table public.passport_versions
  add column if not exists purpose text;

alter table public.passport_versions drop constraint if exists passport_versions_purpose_check;
alter table public.passport_versions add constraint passport_versions_purpose_check
  check (purpose is null or purpose in ('booking','availability','review','introduction','renewal'));

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
