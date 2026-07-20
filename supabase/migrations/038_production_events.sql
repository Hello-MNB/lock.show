-- ============================================================
-- 038 — PRODUCTION EVENT BOARD (spec §8.11) — C6 / T-81-M
-- ⚠ AUTHORED, NOT APPLIED. Owner-gated (R00 STOP list: migrations).
--   Do NOT run without the owner's explicit approval word.
--
-- WHY: the Production board (§8.11) is an event/lineup BOARD — each event
-- holds time-ordered lineup slots; a slot is open ("needs an act"),
-- requested (availability asked), or confirmed. Today NO table backs this:
-- the built board reads public.gigs, whose rows REQUIRE an artist, so an
-- unfilled "open slot" cannot exist (proven in the T-80/B4-a report).
-- This migration creates the two missing tables and nothing else.
--
-- ADDITIVE ONLY: two new tables + one SECURITY DEFINER helper + RLS.
-- No existing table, column, policy, or function is altered or dropped.
-- Diffed against 001–037: no production_event / lineup_slot anywhere.
-- Fully reversible: 038_production_events.down.sql removes everything
-- this file creates (both tables start empty — down loses nothing real).
--
-- FIREWALL: no score / percentile / rank / head-count column anywhere.
-- A suggested act's "fit reason" (§8.11 target) is method-safe TEXT in
-- the UI layer, never a stored number; nothing here ranks acts.
-- Entity law: Production reads Passports — it never owns an artist's
-- evidence. These tables reference an act by id only; no evidence,
-- claim, or passport data is copied in.
-- ============================================================

-- 1 · EVENT — one board card: name · date · venue, org-scoped from birth.
create table if not exists public.production_event (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  name text not null,
  event_date date,
  venue text,
  created_by uuid references public.person(id),
  created_at timestamptz not null default now()
);

-- 2 · LINEUP SLOT — one timeline row inside an event ("Closing set · 01:00–02:30").
--    state vocabulary is EXACTLY the §8.11 bounded set: open / requested / confirmed.
--    act_id is NULLABLE — an open slot has no act yet (the whole point).
--    availability_request_id links a requested slot to the request that fills it,
--    so "confirm the slot the moment an artist says yes" (§8.11 /reqs) is traceable.
create table if not exists public.lineup_slot (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.production_event(id) on delete cascade,
  label text not null,
  set_start time,
  set_end time,
  state text not null default 'open' check (state in ('open','requested','confirmed')),
  act_id uuid references public.act(id) on delete set null,
  availability_request_id uuid references public.availability_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  -- a slot cannot claim "confirmed" with no act attached
  constraint lineup_slot_confirmed_has_act check (state <> 'confirmed' or act_id is not null)
);

create index if not exists idx_production_event_org on public.production_event(organization_id);
create index if not exists idx_lineup_slot_event on public.lineup_slot(event_id);

-- 3 · RLS — same SECURITY DEFINER pattern as 008 (helpers bypass RLS on the
--    tables they read, preventing policy recursion; slot visibility rides
--    its event's org without re-evaluating production_event's own policy).
create or replace function public.can_access_production_event(e uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.production_event pe
    where pe.id = e and pe.organization_id in (select public.current_org_ids())
  )
$$;

alter table public.production_event enable row level security;
alter table public.lineup_slot      enable row level security;

-- event: org members read; owner/admin create-update-delete (board editing
-- is a team-admin act, mirroring mem_admin_write in 008).
drop policy if exists pe_org_read on public.production_event;
create policy pe_org_read on public.production_event for select
  using (organization_id in (select public.current_org_ids()));
drop policy if exists pe_admin_write on public.production_event;
create policy pe_admin_write on public.production_event for all
  using (public.has_org_role(organization_id, array['owner','admin']))
  with check (public.has_org_role(organization_id, array['owner','admin']));

-- slot: rides its event — members read, owner/admin write.
drop policy if exists ls_org_read on public.lineup_slot;
create policy ls_org_read on public.lineup_slot for select
  using (public.can_access_production_event(event_id));
drop policy if exists ls_admin_write on public.lineup_slot;
create policy ls_admin_write on public.lineup_slot for all
  using (exists (
    select 1 from public.production_event pe
    where pe.id = event_id and public.has_org_role(pe.organization_id, array['owner','admin'])
  ))
  with check (exists (
    select 1 from public.production_event pe
    where pe.id = event_id and public.has_org_role(pe.organization_id, array['owner','admin'])
  ));
