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

begin;

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

alter table public.artist_access drop constraint if exists artist_access_audience_check;
alter table public.artist_access add constraint artist_access_audience_check
  check (audience <@ array['buyer','rep','named_recipient','link','private']::text[]);

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
create or replace function public.artist_access_fill_revoked_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status = 'revoked' and new.revoked_at is null then
    new.revoked_at := now();
  end if;
  -- Reinstating a grant clears the revocation stamp, so a later time-window read
  -- cannot see an active row that still claims to have been revoked.
  if new.status <> 'revoked' then
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
  table_owner name;
  touched boolean;
begin
  select r.rolname into table_owner
    from pg_class c join pg_roles r on r.oid = c.relowner
   where c.oid = 'public.artist_access'::regclass;

  -- LINKAGE FIRST, for EVERY writer including the owner. This is a data-integrity
  -- rule, not an authority rule: a grant pointing at an Act that belongs to someone
  -- else is malformed no matter who wrote it, and putting it after the trust
  -- short-circuit below would let consent RPCs and owner writes create exactly that.
  if new.act_id is not null and not exists (
       select 1 from public.act a
        join public.artists ar on ar.id = new.artist_id
       where a.id = new.act_id and a.person_id = ar.created_by) then
    raise exception 'artist_access: act_id does not belong to the artist named by artist_id'
      using errcode = '23514';
  end if;

  -- Definer context (consent RPCs) and the owner itself are trusted.
  if current_user = table_owner then
    return new;
  end if;

  if tg_op = 'INSERT' then
    touched := coalesce(array_length(new.actions, 1), 0) > 0
            or coalesce(array_length(new.audience, 1), 0) > 0
            or new.act_id is not null or new.purpose is not null
            or new.version_binding is not null or new.passport_version_id is not null
            or new.granted_by is not null;
  else
    touched := new.actions is distinct from old.actions
            or new.audience is distinct from old.audience
            or new.act_id is distinct from old.act_id
            or new.purpose is distinct from old.purpose
            or new.version_binding is distinct from old.version_binding
            or new.passport_version_id is distinct from old.passport_version_id
            or new.granted_by is distinct from old.granted_by
            or new.valid_from is distinct from old.valid_from;
  end if;

  if touched and not public.owns_artist(new.artist_id) then
    raise exception 'artist_access: authority columns may only be set by the artist who owns the subject (or a consent RPC)'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_artist_access_guard_authority on public.artist_access;
create trigger trg_artist_access_guard_authority
  before insert or update on public.artist_access
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
        or (aa.act_id is null and p_action <> 'publish'
            and exists (select 1 from public.act a
                         where a.id = p_act and a.id = aa.artist_id))
      )
      and p_action = any (aa.actions)
      -- AUDIENCE IS MANDATORY. It used to default to NULL and short-circuit to
      -- true, so a grant with an EMPTY audience permitted publishing to anyone —
      -- and PART B called it without an audience at all, meaning the one decision
      -- the bound governs never applied it. NULL now denies.
      and p_audience is not null
      and p_audience = any (aa.audience)
      -- PURPOSE. Stored and vocabulary-checked but never consulted before; a grant
      -- that names a purpose now only permits that purpose.
      and (aa.purpose is null or (p_purpose is not null and p_purpose = aa.purpose))
      -- VERSION BINDING. 'named' pins the grant to ONE immutable PassportVersion;
      -- previously it was decorative and any version passed.
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

commit;

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
begin;

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
                          coalesce(passport_versions.audience, 'buyer'),
                          null,
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

commit;
