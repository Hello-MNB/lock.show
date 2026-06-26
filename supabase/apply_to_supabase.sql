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
  role text not null default 'artist' check (role in ('artist','agency','booker')),
  full_name text,
  created_at timestamptz not null default now()
);

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
