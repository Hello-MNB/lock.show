-- ============================================================
-- GIGPROOF — Complete schema for Supabase SQL Editor
-- Run this ONCE on a fresh project (idempotent — safe to re-run).
-- Combines migration 001 (schema + RLS + storage) and
-- migration 002 (whatsapp_number + notifications table).
--
-- HOW TO APPLY:
--   1. Go to https://supabase.com/dashboard/project/qexfndiyallwqhhzeerd/sql/new
--   2. Paste this entire file
--   3. Click "Run" (green button, bottom-right)
--   Expected: "Success. No rows returned"
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'artist' check (role in ('artist','agency','booker','operator','producer')),
  full_name text,
  created_at timestamptz not null default now()
);
-- If profiles already existed with an older CHECK, widen it (idempotent).
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('artist','agency','booker','operator','producer'));

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text,
  stage_name text,
  genre text,
  city text,
  photo_url text,
  one_line text,
  regions text,
  set_length text,
  invoice_ready boolean default false,
  rider_url text,
  music_links jsonb default '[]'::jsonb,
  -- draw signals — BANDS / booleans ONLY (firewall: never an exact attendee count)
  lineup_frequency_band text,
  sells_tickets boolean,
  price_band text,
  community_size_band text,
  whatsapp_number text,           -- migration 002
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_items (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  item_type text not null check (item_type in
    ('event','lineup','collab','release','residency','self_produced_event','link','draw_signal')),
  title text,
  detail text,
  item_date date,
  public_url text,
  source_status text not null default 'artist-provided'
    check (source_status in ('public-verified','artist-provided')),
  visibility text not null default 'passport-ok'
    check (visibility in ('passport-ok','mirror-only')),
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_artifacts (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  evidence_type text not null check (evidence_type in ('file','link','band')),
  source_type text check (source_type in
    ('ticket-export','settlement','screenshot','public-profile','producer-vouch','self-band','self-reported')),
  value text,
  file_url text,
  public_url text,
  status text not null default 'submitted'
    check (status in ('submitted','processed','error')),
  uploaded_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  evidence_id uuid references public.evidence_artifacts(id) on delete set null,
  claim_type text,
  value text,
  source_type text,
  verification_status text not null default 'self-reported'
    check (verification_status in ('verified','supporting','self-reported','not-assessable')),
  verified_by text default 'system' check (verified_by in ('system','artist')),
  verified_at timestamptz,
  expires_at timestamptz,
  visibility text not null default 'mirror-only'
    check (visibility in ('passport-ok','mirror-only','internal')),
  extraction_method text,
  model_version text,
  internal_confidence numeric,   -- DB-only; NEVER returned to any client
  reason_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.availability_requests (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  requester_name text not null,
  requester_org text,
  event_date date,
  event_type text,
  location text,
  capacity_band text,
  budget_band text,
  message text,
  status text not null default 'new' check (status in ('new','replied','closed')),
  created_date timestamptz not null default now()
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references auth.users(id) on delete cascade,
  scope text not null,
  version text not null,
  status text not null default 'accepted' check (status in ('accepted','declined','withdrawn')),
  marketing_opt_in boolean default false,
  timestamp timestamptz not null default now()
);

-- passport_versions: immutable public snapshot (server writes, public reads if published)
create table if not exists public.passport_versions (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  snapshot jsonb not null,  -- sanitised; NEVER contains score/percentile/exact-count/internal_confidence
  created_at timestamptz not null default now()
);

-- notifications (in-app, stub — no push)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- add whatsapp_number to existing artists table if it wasn't in the initial create
alter table public.artists add column if not exists whatsapp_number text;

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.artists           enable row level security;
alter table public.profile_items     enable row level security;
alter table public.evidence_artifacts enable row level security;
alter table public.claims            enable row level security;
alter table public.availability_requests enable row level security;
alter table public.consent_records   enable row level security;
alter table public.passport_versions enable row level security;
alter table public.notifications     enable row level security;

-- helper functions
create or replace function public.owns_artist(a uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.artists where id = a and created_by = auth.uid());
$$;

create or replace function public.artist_is_published(a uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.artists where id = a and published = true);
$$;

-- profiles: own row only
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- artists: owner full access; anyone may read a published artist
drop policy if exists artists_owner on public.artists;
create policy artists_owner on public.artists
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());
drop policy if exists artists_public_read on public.artists;
create policy artists_public_read on public.artists
  for select using (published = true);

-- profile_items: owner full; public reads passport-ok of published artist
drop policy if exists items_owner on public.profile_items;
create policy items_owner on public.profile_items
  for all using (public.owns_artist(artist_id)) with check (public.owns_artist(artist_id));
drop policy if exists items_public_read on public.profile_items;
create policy items_public_read on public.profile_items
  for select using (visibility = 'passport-ok' and public.artist_is_published(artist_id));

-- evidence: owner only (private)
drop policy if exists evidence_owner on public.evidence_artifacts;
create policy evidence_owner on public.evidence_artifacts
  for all using (public.owns_artist(artist_id)) with check (public.owns_artist(artist_id));

-- claims: owner full; public reads passport-ok verified/supporting of published artist
drop policy if exists claims_owner on public.claims;
create policy claims_owner on public.claims
  for all using (public.owns_artist(artist_id)) with check (public.owns_artist(artist_id));
drop policy if exists claims_public_read on public.claims;
create policy claims_public_read on public.claims
  for select using (
    visibility = 'passport-ok'
    and verification_status in ('verified','supporting')
    and public.artist_is_published(artist_id)
  );

-- availability_requests: anyone may create against a published artist; owner may read/update
drop policy if exists req_public_insert on public.availability_requests;
create policy req_public_insert on public.availability_requests
  for insert with check (public.artist_is_published(artist_id));
drop policy if exists req_owner_read on public.availability_requests;
create policy req_owner_read on public.availability_requests
  for select using (public.owns_artist(artist_id));
drop policy if exists req_owner_update on public.availability_requests;
create policy req_owner_update on public.availability_requests
  for update using (public.owns_artist(artist_id)) with check (public.owns_artist(artist_id));

-- consent: own records only
drop policy if exists consent_self on public.consent_records;
create policy consent_self on public.consent_records
  for all using (subject_id = auth.uid()) with check (subject_id = auth.uid());

-- passport_versions: public read for published artists; no user INSERT policy = service-role only
drop policy if exists pv_public_read on public.passport_versions;
create policy pv_public_read on public.passport_versions
  for select using (public.artist_is_published(artist_id));

-- notifications: own records only
drop policy if exists notif_self on public.notifications;
create policy notif_self on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- OPERATOR / ADMIN (migration 003) — platform-wide oversight READ +
-- targeted moderation UPDATE. is_operator() is SECURITY DEFINER so using
-- it in a policy on profiles cannot recurse.
-- ============================================================
create or replace function public.is_operator()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'operator'
  );
$$;

drop policy if exists profiles_operator_read on public.profiles;
create policy profiles_operator_read on public.profiles
  for select using (public.is_operator());

drop policy if exists artists_operator_read on public.artists;
create policy artists_operator_read on public.artists
  for select using (public.is_operator());
drop policy if exists artists_operator_update on public.artists;
create policy artists_operator_update on public.artists
  for update using (public.is_operator()) with check (public.is_operator());

drop policy if exists items_operator_read on public.profile_items;
create policy items_operator_read on public.profile_items
  for select using (public.is_operator());

drop policy if exists evidence_operator_read on public.evidence_artifacts;
create policy evidence_operator_read on public.evidence_artifacts
  for select using (public.is_operator());

drop policy if exists claims_operator_read on public.claims;
create policy claims_operator_read on public.claims
  for select using (public.is_operator());
drop policy if exists claims_operator_update on public.claims;
create policy claims_operator_update on public.claims
  for update using (public.is_operator()) with check (public.is_operator());

drop policy if exists req_operator_read on public.availability_requests;
create policy req_operator_read on public.availability_requests
  for select using (public.is_operator());
drop policy if exists req_operator_update on public.availability_requests;
create policy req_operator_update on public.availability_requests
  for update using (public.is_operator()) with check (public.is_operator());

drop policy if exists consent_operator_read on public.consent_records;
create policy consent_operator_read on public.consent_records
  for select using (public.is_operator());

-- ============================================================
-- PRODUCER CONFIRMATIONS (migration 005) — no-login magic-link claim confirm.
-- Server (service role) mediates all writes; artist owner reads status only.
-- ============================================================
alter table public.claims add column if not exists method_label text;

create table if not exists public.producer_confirmations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  claim_id uuid not null references public.claims(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  producer_contact text,
  response text check (response in ('yes','partial','no','wrong_person')),
  revoked boolean not null default false,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.producer_confirmations enable row level security;
drop policy if exists pc_owner_read on public.producer_confirmations;
create policy pc_owner_read on public.producer_confirmations
  for select using (public.owns_artist(artist_id));
drop policy if exists pc_operator_read on public.producer_confirmations;
create policy pc_operator_read on public.producer_confirmations
  for select using (public.is_operator());

-- ============================================================
-- PASSPORT SIGNALS (migration 006) — B2 action-ladder rungs 2–6.
-- ============================================================
create table if not exists public.passport_signals (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  signal text not null check (signal in
    ('price_details','future_fit','needs_proof','not_this_event','forwarded')),
  note text,
  created_at timestamptz not null default now()
);
alter table public.passport_signals enable row level security;
drop policy if exists ps_public_insert on public.passport_signals;
create policy ps_public_insert on public.passport_signals
  for insert with check (public.artist_is_published(artist_id));
drop policy if exists ps_owner_read on public.passport_signals;
create policy ps_owner_read on public.passport_signals
  for select using (public.owns_artist(artist_id));
drop policy if exists ps_operator_read on public.passport_signals;
create policy ps_operator_read on public.passport_signals
  for select using (public.is_operator());

-- ============================================================
-- ENTITLEMENTS (migration 007) — A8 Founding Passport, manual payment.
-- ============================================================
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  subject_id uuid references auth.users(id) on delete set null,
  kind text not null default 'founding_passport',
  status text not null default 'pending' check (status in ('pending','active','cancelled')),
  amount_note text,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  activated_by uuid
);
alter table public.entitlements enable row level security;
drop policy if exists ent_owner_read on public.entitlements;
create policy ent_owner_read on public.entitlements
  for select using (public.owns_artist(artist_id));
drop policy if exists ent_owner_insert on public.entitlements;
create policy ent_owner_insert on public.entitlements
  for insert with check (public.owns_artist(artist_id));
drop policy if exists ent_operator_read on public.entitlements;
create policy ent_operator_read on public.entitlements
  for select using (public.is_operator());
drop policy if exists ent_operator_update on public.entitlements;
create policy ent_operator_update on public.entitlements
  for update using (public.is_operator()) with check (public.is_operator());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('public-media', 'public-media', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('evidence', 'evidence', false)
  on conflict (id) do nothing;

drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects
  for select using (bucket_id = 'public-media');
drop policy if exists media_write on storage.objects;
create policy media_write on storage.objects
  for insert to authenticated with check (bucket_id = 'public-media');
drop policy if exists evidence_rw on storage.objects;
create policy evidence_rw on storage.objects
  for all to authenticated using (bucket_id = 'evidence') with check (bucket_id = 'evidence');

-- ============================================================
-- (008) ORG-FIRST MODEL + RLS — mirrors migrations/008_org_first_model.sql
-- (BUILD-SPEC-ORG-RADAR §19, Step 1). Idempotent; firewall-safe.
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

-- ============================================================
-- (009) ORG BOOTSTRAP + SEATS + INVITES — mirrors migrations/009_org_bootstrap.sql
-- ============================================================
create extension if not exists pgcrypto;

-- Bootstrap a personal SOLO org at signup: person + organization + owner
-- membership + functional role + solo subscription + active context. One per owner.
create or replace function public.bootstrap_personal_org(
  p_name text, p_functional_role text, p_email text default null, p_display_name text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  insert into public.person(id, email, display_name)
    values (v_uid, p_email, p_display_name)
    on conflict (id) do update
      set email = coalesce(excluded.email, public.person.email),
          display_name = coalesce(excluded.display_name, public.person.display_name);

  -- already owns an org? return it (idempotent signup).
  select o.id into v_org
    from public.organization o
    join public.organization_membership m on m.organization_id = o.id
   where m.person_id = v_uid and m.org_role = 'owner' and m.status = 'active'
   limit 1;
  if v_org is not null then return v_org; end if;

  insert into public.organization(name, plan, created_by)
    values (coalesce(nullif(p_name, ''), 'My organization'), 'solo', v_uid)
    returning id into v_org;
  insert into public.subscription(organization_id, plan, seats_included, seats_used, status)
    values (v_org, 'solo', 1, 1, 'active');
  insert into public.organization_membership(organization_id, person_id, org_role, status, joined_at)
    values (v_org, v_uid, 'owner', 'active', now());
  insert into public.role_assignment(organization_id, person_id, functional_role)
    values (v_org, v_uid, coalesce(nullif(p_functional_role, ''), 'booker'));
  insert into public.active_role_context(person_id, active_organization_id)
    values (v_uid, v_org)
    on conflict (person_id) do update set active_organization_id = excluded.active_organization_id, updated_at = now();
  return v_org;
end; $$;

-- Seat enforcement: block a new active/invited membership beyond seats_included.
create or replace function public.enforce_seat_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_included int; v_count int;
begin
  select seats_included into v_included from public.subscription where organization_id = new.organization_id;
  if v_included is null then return new; end if;
  select count(*) into v_count from public.organization_membership
    where organization_id = new.organization_id and status in ('active','invited');
  if v_count >= v_included then
    raise exception 'SEAT_LIMIT: organization is at its seat limit (%).', v_included using errcode = 'check_violation';
  end if;
  return new;
end; $$;
drop trigger if exists trg_seat_limit on public.organization_membership;
create trigger trg_seat_limit before insert on public.organization_membership
  for each row execute function public.enforce_seat_limit();

-- Keep subscription.seats_used in sync with active+invited memberships.
create or replace function public.sync_seats_used()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_org uuid := coalesce(new.organization_id, old.organization_id);
begin
  update public.subscription s set seats_used = (
    select count(*) from public.organization_membership m
     where m.organization_id = v_org and m.status in ('active','invited')
  ) where s.organization_id = v_org;
  return null;
end; $$;
drop trigger if exists trg_sync_seats on public.organization_membership;
create trigger trg_sync_seats after insert or update or delete on public.organization_membership
  for each row execute function public.sync_seats_used();

-- Invite a member (owner/admin only): an 'invited' membership with a token.
create or replace function public.invite_member(p_org uuid, p_email text, p_role text default 'member')
returns text language plpgsql security definer set search_path = public as $$
declare v_token text;
begin
  if not public.has_org_role(p_org, array['owner','admin']) then raise exception 'not authorized'; end if;
  v_token := encode(gen_random_bytes(16), 'hex');
  insert into public.organization_membership(organization_id, person_id, org_role, status, invited_email, invited_by, invite_token)
    values (p_org, null, coalesce(nullif(p_role, ''), 'member'), 'invited', lower(p_email), auth.uid(), v_token);
  return v_token;
end; $$;

-- Accept an invite (the invited person, matched by email).
create or replace function public.accept_invite(p_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_org uuid; v_invited_email text; v_uid uuid := auth.uid(); v_email text;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select id, organization_id, invited_email into v_id, v_org, v_invited_email
    from public.organization_membership where invite_token = p_token and status = 'invited';
  if v_id is null then raise exception 'invalid or used invite'; end if;
  select email into v_email from auth.users where id = v_uid;
  if v_invited_email is not null and lower(v_invited_email) <> lower(coalesce(v_email, '')) then
    raise exception 'invite email mismatch';
  end if;
  insert into public.person(id, email) values (v_uid, v_email) on conflict (id) do nothing;
  update public.organization_membership
     set person_id = v_uid, status = 'active', joined_at = now(), invite_token = null
   where id = v_id;
  insert into public.role_assignment(organization_id, person_id, functional_role)
    values (v_org, v_uid, 'booker');
  return v_org;
end; $$;

-- ============================================================
-- (010) RADAR — mirrors migrations/010_radar.sql (§20, Step 3)
-- ============================================================
-- ============================================================
create table if not exists public.radar_signal (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  rule_id text not null check (rule_id in ('R1','R2','R3','R4','R5','R6','R7','R8')),
  status text not null default 'developing' check (status in ('strong','developing','missing','notAssessable')),
  action_type text not null check (action_type in ('refresh-evidence','request-evidence','respond','publish','promote','review')),
  evidence_basis text,                 -- short ref (claim_type / 'draw-band' / 'demand'), NOT a number
  method_label text,
  signal_date date,
  demand_request_id uuid references public.availability_requests(id) on delete set null,
  dismissed boolean not null default false,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, artist_id, rule_id)
);

alter table public.radar_signal enable row level security;
drop policy if exists radar_org on public.radar_signal;
create policy radar_org on public.radar_signal for all
  using (organization_id in (select public.current_org_ids()))
  with check (organization_id in (select public.current_org_ids()));

create index if not exists idx_radar_org on public.radar_signal(organization_id) where dismissed = false;

-- Deterministic materialization for one org's roster (R1/R2/R4/R7 in SQL; the
-- client JS engine in src/lib/radar.js is the canonical rule set and adds R3/R5/R6/R8).
-- Re-derives auto signals each call (delete-then-insert), preserving dismissals.
create or replace function public.recompute_radar_for_org(p_org uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.radar_signal where organization_id = p_org and dismissed = false;

  -- R4 — evidence ready but Passport not published → publish.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date)
  select p_org, a.id, 'R4', 'developing', 'publish', c.claim_type, 'evidence-supported', current_date
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.claims c on c.artist_id = a.id and c.verification_status in ('verified','supporting')
  where aa.organization_id = p_org and aa.status = 'active' and coalesce(a.published, false) = false
  on conflict (organization_id, artist_id, rule_id) do update
    set status = excluded.status, action_type = excluded.action_type, evidence_basis = excluded.evidence_basis,
        method_label = excluded.method_label, signal_date = excluded.signal_date, computed_at = now();

  -- R2 — ready Passport (published + passport-ok verified/supporting) ∩ open demand → respond.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, demand_request_id)
  select p_org, a.id, 'R2', 'strong', 'respond', 'demand', 'evidence-supported', current_date, r.id
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id and coalesce(a.published, false) = true
  join public.claims c on c.artist_id = a.id and c.visibility = 'passport-ok' and c.verification_status in ('verified','supporting')
  join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
  where aa.organization_id = p_org and aa.status = 'active'
  on conflict (organization_id, artist_id, rule_id) do update
    set status = excluded.status, action_type = excluded.action_type, demand_request_id = excluded.demand_request_id, computed_at = now();

  -- R1 (hero) — stale evidence ∩ matching inbound demand → refresh evidence.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, demand_request_id)
  select p_org, a.id, 'R1', 'developing', 'refresh-evidence', c.claim_type, 'stale', current_date, r.id
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.claims c on c.artist_id = a.id and c.method_label <> 'producer-confirmed'
     and c.expires_at is not null and c.expires_at < now()
  join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
  where aa.organization_id = p_org and aa.status = 'active'
  on conflict (organization_id, artist_id, rule_id) do update
    set status = excluded.status, action_type = excluded.action_type, demand_request_id = excluded.demand_request_id, computed_at = now();

  -- R7 — draw band aging (>90 days) → refresh draw evidence.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date)
  select p_org, a.id, 'R7', 'developing', 'refresh-evidence', 'draw-band', 'artist-declared', current_date
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.draw_signals d on d.artist_id = a.id and d.computed_at < now() - interval '90 days'
  where aa.organization_id = p_org and aa.status = 'active'
  on conflict (organization_id, artist_id, rule_id) do update set computed_at = now();
end; $$;

-- Feeding triggers (§20.3): recompute the affected org(s) on the relevant events.
create or replace function public.radar_recompute_for_artist()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_artist uuid := coalesce(new.artist_id, old.artist_id); v_org uuid;
begin
  for v_org in select organization_id from public.artist_access where artist_id = v_artist and status = 'active'
  loop
    perform public.recompute_radar_for_org(v_org);
  end loop;
  return null;
end; $$;

drop trigger if exists trg_radar_claims on public.claims;
create trigger trg_radar_claims after insert or update or delete on public.claims
  for each row execute function public.radar_recompute_for_artist();
drop trigger if exists trg_radar_passport on public.passport_versions;
create trigger trg_radar_passport after insert or update on public.passport_versions
  for each row execute function public.radar_recompute_for_artist();
drop trigger if exists trg_radar_draw on public.draw_signals;
create trigger trg_radar_draw after insert or update or delete on public.draw_signals
  for each row execute function public.radar_recompute_for_artist();
drop trigger if exists trg_radar_demand on public.availability_requests;
create trigger trg_radar_demand after insert or update on public.availability_requests
  for each row execute function public.radar_recompute_for_artist();

-- ============================================================
-- (011) AUDIT LOG + OPERATOR DATA-RIGHTS — mirrors migrations/011_audit_operator.sql
-- ============================================================
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,                 -- e.g. 'delete_artist', 'export_artist'
  target_type text,
  target_id uuid,
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;
drop policy if exists audit_operator on public.audit_log;
create policy audit_operator on public.audit_log for all
  using (public.is_operator()) with check (public.is_operator());

create index if not exists idx_audit_created on public.audit_log(created_at desc);

-- OP12 right-to-erasure: an operator may delete an artist (cascade removes the
-- artist's claims/items/evidence/requests). The app writes the audit row first.
drop policy if exists artists_operator_delete on public.artists;
create policy artists_operator_delete on public.artists for delete using (public.is_operator());

-- ============================================================
-- (012) AGENCY UPGRADE APPROVAL — mirrors migrations/012_agency_upgrade.sql
-- ============================================================
-- Operator (platform founder) may see the upgrade queue across orgs.
drop policy if exists subscription_operator_read on public.subscription;
create policy subscription_operator_read on public.subscription for select using (public.is_operator());
drop policy if exists organization_operator_read on public.organization;
create policy organization_operator_read on public.organization for select using (public.is_operator());

-- Approve: flip plan→agency + raise seats on the SAME org. SECURITY DEFINER so
-- the operator (not a member of that org) can perform it; is_operator() gates it.
create or replace function public.approve_agency_upgrade(p_org uuid, p_seats int default 5)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_operator() then raise exception 'not authorized'; end if;
  update public.organization set plan = 'agency' where id = p_org;
  update public.subscription
     set plan = 'agency', seats_included = greatest(p_seats, 1), status = 'active'
   where organization_id = p_org;
end; $$;

-- ============================================================
-- (013) INVITE INFO LOOKUP — mirrors migrations/013_invite_info.sql
-- ============================================================
create or replace function public.invite_info(p_token text)
returns table(org_name text, inviter_name text, org_role text, invited_email text)
language sql security definer set search_path = public as $$
  select o.name, coalesce(p.display_name, p.email, 'GIGPROOF'), m.org_role, m.invited_email
  from public.organization_membership m
  join public.organization o on o.id = m.organization_id
  left join public.person p on p.id = m.invited_by
  where m.invite_token = p_token and m.status = 'invited'
$$;

-- ============================================================
-- (014) AUTO-SET artist organization — mirrors migrations/014_artist_org_autoset.sql
-- ============================================================
-- ============================================================
create or replace function public.set_artist_org()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if new.owner_organization_id is not null then return new; end if;
  select active_organization_id into v_org from public.active_role_context where person_id = auth.uid();
  if v_org is null then
    select organization_id into v_org from public.organization_membership
      where person_id = auth.uid() and org_role = 'owner' and status = 'active'
      order by created_at limit 1;
  end if;
  new.owner_organization_id := v_org;
  new.organization_id := coalesce(new.organization_id, v_org);
  return new;
end; $$;

drop trigger if exists trg_set_artist_org on public.artists;
create trigger trg_set_artist_org before insert on public.artists
  for each row execute function public.set_artist_org();

-- ============================================================
-- (015) LIVE FIXES — mirrors migrations/015_live_fixes.sql
-- ============================================================
drop policy if exists artists_org on public.artists;
create policy artists_org on public.artists for all
  using (
    owner_organization_id in (select public.current_org_ids())
    or id in (select artist_id from public.artist_access where status = 'active' and organization_id in (select public.current_org_ids()))
  )
  with check (owner_organization_id in (select public.current_org_ids()));

-- FIX B
create or replace function public.set_artist_org()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if new.owner_organization_id is not null then return new; end if;
  select active_organization_id into v_org from public.active_role_context where person_id = auth.uid();
  if v_org is null then
    select organization_id into v_org from public.organization_membership
      where person_id = auth.uid() and org_role = 'owner' and status = 'active' order by created_at limit 1;
  end if;
  new.owner_organization_id := v_org;
  new.organization_id := coalesce(new.organization_id, v_org);
  return new;
end; $$;
drop trigger if exists trg_set_artist_org on public.artists;
create trigger trg_set_artist_org before insert on public.artists for each row execute function public.set_artist_org();

-- FIX C
create or replace function public.invite_member(p_org uuid, p_email text, p_role text default 'member')
returns text language plpgsql security definer set search_path = public as $$
declare v_token text;
begin
  if not public.has_org_role(p_org, array['owner','admin']) then raise exception 'not authorized'; end if;
  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.organization_membership(organization_id, person_id, org_role, status, invited_email, invited_by, invite_token)
    values (p_org, null, coalesce(nullif(p_role, ''), 'member'), 'invited', lower(p_email), auth.uid(), v_token);
  return v_token;
end; $$;
