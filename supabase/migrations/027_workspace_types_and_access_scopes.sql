-- ============================================================
-- 027 — WORKSPACE TYPES + ARTIST_ACCESS CONSENT HANDSHAKE
-- (REPRESENTATION-CANON.md + ENTITY-SPEC-ORG.md §2.5/§4(1)/§6 + FLOW-MATRIX.md
--  breaks #1/#2/#9/#10/#19 + ENTITY-ARCHITECTURE.md refactor step 5)
--
-- ⚠ REQUIRES OWNER APPROVAL BEFORE APPLYING TO THE LIVE DB. This file is
-- written-only per this session's brief — do NOT run it against the live
-- Supabase project until Maria/R00 signs off. Additive-only, idempotent
-- (IF NOT EXISTS / DROP ... IF EXISTS re-add), no data loss, no destructive
-- rewrite of existing rows (only column DEFAULTS change for future inserts;
-- existing row values are left exactly as they are).
--
-- WHAT THIS DOES (plain language):
--   1. Gives `organization` a real `workspace_type` (artist / management /
--      producer) instead of overloading `plan` (tier) for that purpose.
--   2. Brings `artist_access` (008) up to the DB-STRUCTURE.md Layer-1 target:
--      scope[], territory, expires_at, consent_at + a real pending/disputed
--      lifecycle — the "scoped, revocable, artist-approves" handshake canon
--      names as the standard mechanism, currently absent as both UI and data
--      flow (ENTITY-SPEC-ORG §2.5, "Critical").
--   3. Fixes `can_access_artist()` to also honor `scope` + `expires_at`, not
--      just `status='active'` (ENTITY-SPEC-ORG §6.1 item 4 — RLS is currently
--      coarser than canon: "agency → SELECT only within active artist_access
--      scope").
--   4. Adds RLS so the ARTIST's own org can see and respond to an incoming
--      access request — today only the REQUESTING org can read its own
--      artist_access rows (aa_read), so the artist has no way to see "who
--      wants access to me" at all. This is the other half of the handshake
--      that ENTITY-SPEC-ORG's Improvement Spec (1) calls for and that no
--      migration has built yet.
--   5. Extends `role_assignment.functional_role` with `booking_agent` /
--      `roster_coordinator` / `viewer` (ENTITY-SPEC-ORG §6.2 — the rep/
--      production seniority tiers the flat owner/admin/member enum can't
--      express). Extends the CURRENT (post-021) constraint list, not 008's
--      superseded one — 021 already renamed booker→booking_manager and added
--      venue_programmer; this migration is additive on top of that state.
--   6. Confirms `producer_confirmations.conflict_of_interest` exists (it
--      already does, since 018/019 — this is a defensive IF NOT EXISTS no-op
--      today, kept because the brief asked for it explicitly and a future
--      rebuild of 018/019 should not silently drop it).
--   7. Three new SECURITY DEFINER RPCs (same pattern as 009/013) so the
--      artist side never needs direct SELECT on the granting org's
--      `organization` row (which plain RLS would not allow — orgs can only
--      read orgs they're a member of): `request_artist_access`,
--      `list_incoming_access_requests`, `respond_to_access_request`,
--      `revoke_artist_access`.
--
-- TERMINOLOGY CROSS-CHECK: the session brief that requested this file named
-- the third workspace_type value "production"; ENTITY-ARCHITECTURE.md §refactor
-- step 5 (the doc this brief told me to read as the source) gives the literal
-- SQL as `check (in ('artist','management','producer'))`, matching the
-- already-used `role_assignment.functional_role = 'producer'` and
-- `ROLES.PRODUCER` in src/lib/constants.js. Using 'producer' here to avoid a
-- second, inconsistent word for the same concept — flagged for Maria/R00 to
-- confirm at approval time.
--
-- NOT done here (separate, larger, already-tracked items — see FLOW-MATRIX.md
-- §4 breaks #2/#7): a full read-vs-write RLS policy split per scope value
-- (today write access is still governed by the coarser org-membership FOR ALL
-- policies on claims/items/evidence/etc — this migration only tightens the
-- READ gate `can_access_artist()` and adds the artist-side visibility the
-- handshake needs to function at all); the context-switcher screen-set cutover;
-- the discoverability/search-by-stage-name UI for "invite an artist I don't
-- yet have an id for" (Amendment-13 "never a cold directory" — the app-code
-- half of this session's work asks the agency for the artist's existing
-- Passport link/id, which is the safe subset of that feature).
-- ============================================================

-- ============================================================
-- 1 · organization.workspace_type
-- ============================================================
alter table public.organization add column if not exists workspace_type text;

alter table public.organization drop constraint if exists organization_workspace_type_check;
alter table public.organization add constraint organization_workspace_type_check
  check (workspace_type is null or workspace_type in ('artist','management','producer'));

-- Backfill EXISTING rows only (never touches a row that already has a value —
-- safe to re-run). Derived from the tier column since that's all that exists
-- today: agency/agency_plus orgs are management workspaces, everything else
-- (solo) defaults to an artist workspace. A production company signing up
-- today would still land here as 'artist' until the app explicitly sets
-- 'producer' at signup (later, separate app-code step per ENTITY-ARCHITECTURE
-- refactor step 5 — out of scope for this migration).
update public.organization
   set workspace_type = case when plan in ('agency','agency_plus') then 'management' else 'artist' end
 where workspace_type is null;

-- New rows default to 'artist' (the common case — a solo artist signing up);
-- app code sets 'management' / 'producer' explicitly where known.
alter table public.organization alter column workspace_type set default 'artist';

-- ============================================================
-- 2 · artist_access — bring up to DB-STRUCTURE.md Layer-1 target
--     (id, org_id→, artist_workspace_id→, scope[], territory, expiry, consent_at)
-- ============================================================
alter table public.artist_access add column if not exists scope text[] not null default '{view}';
alter table public.artist_access add column if not exists territory text;
alter table public.artist_access add column if not exists expires_at timestamptz;
alter table public.artist_access add column if not exists consent_at timestamptz;

-- Bound the scope values to the canon 5 (DB-STRUCTURE.md / REPRESENTATION-CANON
-- §1.1: "the scope enum is exactly view/upload/edit/share/publish"). `publish`
-- scope is deliberately NOT split into a separate "propose" value — REPRESENTATION-
-- CANON §1.2 locks the stricter AG6 reading (agency prepares, artist approves
-- every Passport regardless of scope); that's a UI copy/behavior distinction on
-- the existing `publish` value, not a 6th enum value.
alter table public.artist_access drop constraint if exists artist_access_scope_check;
alter table public.artist_access add constraint artist_access_scope_check
  check (scope <@ array['view','upload','edit','share','publish']::text[]);

-- Extend the lifecycle: pending (invited, awaiting artist consent) · active
-- (artist approved) · revoked (either side ended it) · disputed (artist
-- contests a grant it didn't expect — App-Screen-Tree "/artist/access/disputes").
-- Existing rows keep whatever status they already have (no rewrite) — only
-- the allowed-value list and the DEFAULT for future inserts change.
alter table public.artist_access drop constraint if exists artist_access_status_check;
alter table public.artist_access add constraint artist_access_status_check
  check (status in ('pending','active','revoked','disputed'));
alter table public.artist_access alter column status set default 'pending';

create index if not exists idx_artist_access_artist_status
  on public.artist_access(artist_id, status);

-- ============================================================
-- 3 · RLS — the artist's OWN org can see + respond to an incoming request.
--     Today `aa_read`/`aa_admin_write` (008) only let the REQUESTING org read
--     its own artist_access rows — the artist has no visibility at all into
--     "who wants access to me", which makes consent impossible to grant in
--     practice even though the column exists. This is additive: the existing
--     granting-org policies are untouched.
-- ============================================================
drop policy if exists aa_artist_owner_read on public.artist_access;
create policy aa_artist_owner_read on public.artist_access for select
  using (artist_id in (
    select ar.id from public.artists ar
    where ar.owner_organization_id in (select public.current_org_ids())
  ));

-- Update only (not full ALL): the artist's own org may respond to / revoke a
-- grant on their artist, but may never INSERT a row granting some OTHER org
-- access on the granting org's behalf, and never DELETE the audit trail.
drop policy if exists aa_artist_owner_respond on public.artist_access;
create policy aa_artist_owner_respond on public.artist_access for update
  using (artist_id in (
    select ar.id from public.artists ar
    where ar.owner_organization_id in (select public.current_org_ids())
  ))
  with check (artist_id in (
    select ar.id from public.artists ar
    where ar.owner_organization_id in (select public.current_org_ids())
  ));

-- ============================================================
-- 4 · can_access_artist() — honor status='active' AND scope AND expiry.
--     Previously checked status='active' only; a grant now also has to (a)
--     not be expired and (b) carry at least `view` scope to unlock ANY read.
--     Rows written before this migration have scope defaulted to '{view}' by
--     the ADD COLUMN above, so no existing active grant silently loses access.
--     NOTE: this is a read-gate fix only (ENTITY-SPEC-ORG §6.1 item 4's fuller
--     ask — splitting write policies by scope value too — is tracked
--     separately, FLOW-MATRIX.md break #2; not attempted here to avoid
--     changing behavior for orgs that already rely on the broad FOR ALL
--     claims/items/evidence policies built on top of this function).
-- ============================================================
create or replace function public.can_access_artist(a uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.artists ar
    where ar.id = a and ar.owner_organization_id in (select public.current_org_ids())
  ) or exists (
    select 1 from public.artist_access aa
    where aa.artist_id = a and aa.status = 'active'
      and (aa.expires_at is null or aa.expires_at > now())
      and 'view' = any(aa.scope)
      and aa.organization_id in (select public.current_org_ids())
  )
$$;

-- New, narrower helper for future scope-specific policies/RPCs (e.g. gating
-- an "upload evidence on the artist's behalf" write, or a "publish" propose
-- action) without having to re-touch can_access_artist() again.
create or replace function public.artist_access_has_scope(a uuid, needed text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.artist_access aa
    where aa.artist_id = a and aa.status = 'active'
      and (aa.expires_at is null or aa.expires_at > now())
      and needed = any(aa.scope)
      and aa.organization_id in (select public.current_org_ids())
  )
$$;

-- ============================================================
-- 5 · role_assignment.functional_role — add rep/production seniority tiers.
--     Baseline is the CURRENT (post-021) constraint, not 008's superseded
--     one: 021 renamed booker→booking_manager and added venue_programmer.
--     This migration is additive on top of that — artist_manager already
--     existed; booking_agent/roster_coordinator/viewer are new.
-- ============================================================
alter table public.role_assignment drop constraint if exists role_assignment_functional_role_check;
alter table public.role_assignment add constraint role_assignment_functional_role_check
  check (functional_role in (
    'artist','booking_manager','artist_manager','producer','venue_programmer','operator',
    'booking_agent','roster_coordinator','viewer',
    -- legacy values still LIVE in rows and still WRITTEN by the app while
    -- migration 021 (vocab rename) stays frozen — the CHECK must tolerate
    -- them or it violates existing rows (seen live 9 Jul: 'agency' x1).
    -- 021's lockstep will fold them: booker/agency -> booking_manager.
    'booker','agency'
  ));

-- ============================================================
-- 6 · producer_confirmations.conflict_of_interest — defensive re-assertion.
--     Already added in 018/019 with this exact definition; IF NOT EXISTS
--     makes this a no-op today. Kept per the brief so a future squash/rebuild
--     of 018/019 can't silently drop the one disclosure column the three-hat
--     self-confirmation case depends on (ENTITY-SPEC-ORG §6.1 item 2).
-- ============================================================
alter table public.producer_confirmations
  add column if not exists conflict_of_interest boolean not null default false;

-- ============================================================
-- 7 · RPCs — SECURITY DEFINER, same pattern as 009 (bootstrap_personal_org,
--     invite_member, accept_invite) and 013 (invite_info). Needed because the
--     artist's org cannot otherwise resolve the requesting org's `name`
--     (organization RLS only allows members of that org to read it) —
--     without this, the artist-side "who wants access to me" screen would
--     have no safe way to show who is asking.
-- ============================================================

-- Agency/production side: create or re-send a pending grant. Idempotent per
-- (organization_id, artist_id) — re-inviting after a decline/revoke resets it
-- to pending with a fresh scope/territory and clears any prior consent_at.
create or replace function public.request_artist_access(
  p_org uuid, p_artist uuid, p_scope text[] default '{view}', p_territory text default null
) returns uuid language plpgsql security definer set search_path = public as $$
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

-- Artist side: safe list of requests/grants targeting artists the CALLER's
-- own active org(s) own — joins organization.name + artists.stage_name (both
-- otherwise unreadable cross-org under plain RLS) but returns nothing else.
create or replace function public.list_incoming_access_requests()
returns table(
  id uuid, artist_id uuid, artist_stage_name text,
  organization_id uuid, organization_name text,
  scope text[], territory text, status text, consent_at timestamptz,
  expires_at timestamptz, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select aa.id, aa.artist_id, ar.stage_name, aa.organization_id, o.name,
         aa.scope, aa.territory, aa.status, aa.consent_at, aa.expires_at, aa.created_at
  from public.artist_access aa
  join public.artists ar on ar.id = aa.artist_id
  join public.organization o on o.id = aa.organization_id
  where ar.owner_organization_id in (select public.current_org_ids())
  order by aa.created_at desc
$$;

-- Artist side: approve (optionally narrowing scope) or decline a pending
-- request. Only the artist's own org may call this for a given row.
create or replace function public.respond_to_access_request(
  p_id uuid, p_approve boolean, p_scope text[] default null
) returns void language plpgsql security definer set search_path = public as $$
declare v_artist uuid;
begin
  select artist_id into v_artist from public.artist_access where id = p_id;
  if v_artist is null then raise exception 'access request not found'; end if;
  if not exists (
    select 1 from public.artists where id = v_artist
      and owner_organization_id in (select public.current_org_ids())
  ) then raise exception 'not authorized'; end if;

  if p_approve then
    update public.artist_access
       set status = 'active', consent_at = now(),
           scope = coalesce(p_scope, scope)
     where id = p_id;
  else
    update public.artist_access set status = 'revoked', consent_at = null where id = p_id;
  end if;
end; $$;

-- Either side may revoke an ACTIVE grant (artist's own org, or the granting
-- org itself via its normal aa_admin_write policy — this RPC additionally
-- covers the artist-initiated path with one call).
create or replace function public.revoke_artist_access(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_artist uuid; v_org uuid;
begin
  select artist_id, organization_id into v_artist, v_org from public.artist_access where id = p_id;
  if v_artist is null then raise exception 'access grant not found'; end if;
  if not (
    exists (select 1 from public.artists where id = v_artist and owner_organization_id in (select public.current_org_ids()))
    or public.has_org_role(v_org, array['owner','admin'])
  ) then raise exception 'not authorized'; end if;
  update public.artist_access set status = 'revoked' where id = p_id;
end; $$;
