-- ============================================================
-- 008 — ORG-FIRST ACCOUNT MODEL + RLS  (BUILD-SPEC-ORG-RADAR §19, Step 1)
-- The Organization is the tenant; a Person belongs via Membership.
-- A solo booker = an org with one owner-member. Agency = same org upgraded.
-- Idempotent (if not exists / drop policy if exists). Firewall-safe:
-- NO score / percentile / rank / head-count column is introduced anywhere.
-- Live-apply + RLS smoke test require a live DB (token-blocked).
-- ============================================================

-- ============================================================
-- 1 · CORE ORG TABLES (§19.1)
-- ============================================================
create table if not exists public.person (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  plan text not null default 'solo' check (plan in ('solo','agency','agency_plus')),
  created_by uuid references public.person(id),
  created_at timestamptz not null default now()
);

create table if not exists public.organization_membership (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  person_id uuid references public.person(id) on delete cascade,   -- null until invite accepted
  org_role text not null default 'member' check (org_role in ('owner','admin','member')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  invited_email text,
  invited_by uuid references public.person(id),
  invite_token text unique,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, person_id)
);

create table if not exists public.role_assignment (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  person_id uuid references public.person(id) on delete cascade,
  functional_role text not null check (functional_role in ('booker','agency','artist_manager','artist','operator','producer')),
  authority_scope jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.active_role_context (
  person_id uuid primary key references public.person(id) on delete cascade,
  active_organization_id uuid references public.organization(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_access (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  access_level text not null default 'manage' check (access_level in ('manage','view')),
  consent_record_id uuid references public.consent_records(id) on delete set null,
  status text not null default 'active' check (status in ('active','revoked')),
  created_at timestamptz not null default now(),
  unique (organization_id, artist_id)
);

create table if not exists public.subscription (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organization(id) on delete cascade,
  plan text not null default 'solo' check (plan in ('solo','agency','agency_plus')),
  seats_included int not null default 1,
  seats_used int not null default 1,
  status text not null default 'active' check (status in ('active','trialing','past_due','canceled')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2 · NEW DOMAIN TABLES (gigs, draw_signals) — org-scoped from birth.
--     FIREWALL: draw_signals stores BANDS + method-labels only; never a
--     raw head-count / score column.
-- ============================================================
create table if not exists public.gigs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organization(id) on delete cascade,
  artist_id uuid references public.artists(id) on delete set null,
  title text,
  event_date date,
  venue text,
  city text,
  status text not null default 'lead' check (status in ('lead','hold','confirmed','settled','canceled')),
  created_at timestamptz not null default now()
);

create table if not exists public.draw_signals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organization(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  signal_type text not null check (signal_type in ('lineup-frequency','sells-tickets','price-band','community-size')),
  band_value text,                 -- a BAND string only (firewall — never a raw number/score)
  method_label text,               -- the §3 method-label vocabulary
  source_status text,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3 · organization_id ON ALL EXISTING DOMAIN TABLES (§19.1)
--     Nullable now; Step 2 (signup) populates for new accounts.
-- ============================================================
alter table public.artists              add column if not exists owner_organization_id uuid references public.organization(id);
alter table public.artists              add column if not exists organization_id uuid references public.organization(id);
alter table public.profile_items        add column if not exists organization_id uuid references public.organization(id);
alter table public.evidence_artifacts   add column if not exists organization_id uuid references public.organization(id);
alter table public.claims               add column if not exists organization_id uuid references public.organization(id);
alter table public.availability_requests add column if not exists organization_id uuid references public.organization(id);
alter table public.passport_versions    add column if not exists organization_id uuid references public.organization(id);
alter table public.producer_confirmations add column if not exists organization_id uuid references public.organization(id);

create index if not exists idx_membership_person on public.organization_membership(person_id) where status = 'active';
create index if not exists idx_artist_access_org on public.artist_access(organization_id) where status = 'active';
create index if not exists idx_artists_owner_org on public.artists(owner_organization_id);
create index if not exists idx_draw_signals_artist on public.draw_signals(artist_id);

-- ============================================================
-- 4 · RLS SPINE (§19.2) — SECURITY DEFINER helpers bypass RLS on the
--     membership/artist tables they read, which prevents policy recursion.
-- ============================================================
create or replace function public.current_org_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.organization_membership
  where person_id = auth.uid() and status = 'active'
$$;

create or replace function public.has_org_role(org uuid, roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_membership
    where organization_id = org and person_id = auth.uid()
      and status = 'active' and org_role = any(roles)
  )
$$;

-- Artist data is reachable by the OWNING org or any org with active artist_access.
create or replace function public.can_access_artist(a uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.artists ar
    where ar.id = a and ar.owner_organization_id in (select public.current_org_ids())
  ) or exists (
    select 1 from public.artist_access aa
    where aa.artist_id = a and aa.status = 'active'
      and aa.organization_id in (select public.current_org_ids())
  )
$$;

create or replace function public.is_comember(p uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_membership m
    where m.person_id = p and m.status = 'active'
      and m.organization_id in (select public.current_org_ids())
  )
$$;

-- ============================================================
-- 5 · RLS ON ORG TABLES
-- ============================================================
alter table public.person                  enable row level security;
alter table public.organization            enable row level security;
alter table public.organization_membership enable row level security;
alter table public.role_assignment         enable row level security;
alter table public.active_role_context     enable row level security;
alter table public.artist_access           enable row level security;
alter table public.subscription            enable row level security;
alter table public.gigs                    enable row level security;
alter table public.draw_signals            enable row level security;

-- person: self-manage; co-members may read (for the team roster display).
drop policy if exists person_self on public.person;
create policy person_self on public.person for all using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists person_comember_read on public.person;
create policy person_comember_read on public.person for select using (public.is_comember(id));

-- organization: members read; admins update; owner deletes; creator inserts.
drop policy if exists org_member_read on public.organization;
create policy org_member_read on public.organization for select using (id in (select public.current_org_ids()));
drop policy if exists org_insert on public.organization;
create policy org_insert on public.organization for insert with check (created_by = auth.uid());
drop policy if exists org_admin_update on public.organization;
create policy org_admin_update on public.organization for update
  using (public.has_org_role(id, array['owner','admin'])) with check (public.has_org_role(id, array['owner','admin']));
drop policy if exists org_owner_delete on public.organization;
create policy org_owner_delete on public.organization for delete using (public.has_org_role(id, array['owner']));

-- membership: org members read; owner/admin manage (invite/remove/role-change).
drop policy if exists mem_read on public.organization_membership;
create policy mem_read on public.organization_membership for select using (organization_id in (select public.current_org_ids()));
drop policy if exists mem_admin_write on public.organization_membership;
create policy mem_admin_write on public.organization_membership for all
  using (public.has_org_role(organization_id, array['owner','admin']))
  with check (public.has_org_role(organization_id, array['owner','admin']));

-- role_assignment: org members read; owner/admin write.
drop policy if exists ra_read on public.role_assignment;
create policy ra_read on public.role_assignment for select using (organization_id in (select public.current_org_ids()));
drop policy if exists ra_admin_write on public.role_assignment;
create policy ra_admin_write on public.role_assignment for all
  using (public.has_org_role(organization_id, array['owner','admin']))
  with check (public.has_org_role(organization_id, array['owner','admin']));

-- active_role_context: self only.
drop policy if exists arc_self on public.active_role_context;
create policy arc_self on public.active_role_context for all using (person_id = auth.uid()) with check (person_id = auth.uid());

-- artist_access (roster): org members read; owner/admin manage roster.
drop policy if exists aa_read on public.artist_access;
create policy aa_read on public.artist_access for select using (organization_id in (select public.current_org_ids()));
drop policy if exists aa_admin_write on public.artist_access;
create policy aa_admin_write on public.artist_access for all
  using (public.has_org_role(organization_id, array['owner','admin']))
  with check (public.has_org_role(organization_id, array['owner','admin']));

-- subscription/billing: org members read; owner writes.
drop policy if exists sub_read on public.subscription;
create policy sub_read on public.subscription for select using (organization_id in (select public.current_org_ids()));
drop policy if exists sub_owner_write on public.subscription;
create policy sub_owner_write on public.subscription for all
  using (public.has_org_role(organization_id, array['owner']))
  with check (public.has_org_role(organization_id, array['owner']));

-- gigs + draw_signals: generic tenant scope.
drop policy if exists gigs_org on public.gigs;
create policy gigs_org on public.gigs for all
  using (organization_id in (select public.current_org_ids()))
  with check (organization_id in (select public.current_org_ids()));
drop policy if exists draw_signals_org on public.draw_signals;
create policy draw_signals_org on public.draw_signals for all
  using (organization_id in (select public.current_org_ids()))
  with check (organization_id in (select public.current_org_ids()));

-- ============================================================
-- 6 · REPLACE OWNER (created_by) POLICIES WITH ORG-BASED ON DOMAIN TABLES.
--     Public-read (anon Passport) + operator (cross-tenant) policies are KEPT.
-- ============================================================
drop policy if exists artists_owner on public.artists;
create policy artists_org on public.artists for all
  using (public.can_access_artist(id))
  with check (owner_organization_id in (select public.current_org_ids()));

drop policy if exists items_owner on public.profile_items;
create policy items_org on public.profile_items for all
  using (public.can_access_artist(artist_id)) with check (public.can_access_artist(artist_id));

drop policy if exists evidence_owner on public.evidence_artifacts;
create policy evidence_org on public.evidence_artifacts for all
  using (public.can_access_artist(artist_id)) with check (public.can_access_artist(artist_id));

drop policy if exists claims_owner on public.claims;
create policy claims_org on public.claims for all
  using (public.can_access_artist(artist_id)) with check (public.can_access_artist(artist_id));

drop policy if exists req_owner_read on public.availability_requests;
create policy req_org_read on public.availability_requests for select using (public.can_access_artist(artist_id));
drop policy if exists req_owner_update on public.availability_requests;
create policy req_org_update on public.availability_requests for update
  using (public.can_access_artist(artist_id)) with check (public.can_access_artist(artist_id));

-- passport_versions: keep pv_public_read (anon, published); add org read for the team.
drop policy if exists pv_org_read on public.passport_versions;
create policy pv_org_read on public.passport_versions for select using (public.can_access_artist(artist_id));

-- producer_confirmations: org read replaces owner read; pc_operator_read stays.
drop policy if exists pc_owner_read on public.producer_confirmations;
create policy pc_org_read on public.producer_confirmations for select using (public.can_access_artist(artist_id));
