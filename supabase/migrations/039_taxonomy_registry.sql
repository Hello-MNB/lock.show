-- ============================================================
-- 039 — TAXONOMY / REGISTRY-B SPINE (spec §16.A.6.a) — R-6 spec-first
-- ⚠ AUTHORED, NOT APPLIED. Owner-gated (R00 STOP list: migrations).
--   Do NOT run without the owner's explicit approval word.
--
-- RULED BASIS (M-17, R00 20 Jul): (a) Registry-B schema = F1.csv's 15
-- columns (docs/registry/F1.csv is the content source of truth); (b)
-- certainty = TWO separate fields — claims.verification_status (existing
-- 4-value door, unchanged) + extraction provenance (internal-only, never
-- rendered); (c) ① dj-club family wired first ② F6 family out of scope
-- pre-Gate ③ one family per Act (secondary deferred; multi-genre = a
-- second Act) ④ radar_segments tab folds into F1.csv (no second source).
--
-- ADDITIVE ONLY (§16.A.6.a): new reference tables + nullable wiring
-- columns on existing tables. No DROP, no type change, no data rewrite.
-- Diff-first vs 001–038: none of these tables exist (audit D1: zero
-- taxonomy representation in the DB). Independent of 038 (also unapplied).
-- Dual-read law: free-text genre/claim_type/regions are RETAINED; code
-- reads FK-first and falls back — nothing breaks if seeds lag.
-- Seeds: structural rows ONLY (the 8 §16.A.1.a families mirroring
-- genreWeights.js). Field/scene/platform CONTENT lands later as data
-- inserts from F1.csv — data, never schema (§18 OWED row).
--
-- FIREWALL: no score/rank/%/weight-number columns. applicability is the
-- bounded R/C/O/N set; the N rule (§16.A.5b) = never shown, never asked,
-- never counted. why_buyer_cares_key is an i18n KEY, never raw text.
-- ============================================================

-- 1 · REFERENCE TABLES (global read-only lookups)
create table if not exists public.genre_family (
  id text primary key,              -- frozen code identifier (§0.2 rule 5)
  en_label text not null,
  he_label text,
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists public.family_planet (
  family_id text not null references public.genre_family(id) on delete cascade,
  planet_key text not null check (planet_key in ('identity','music','live','audience','prokit','proof')),
  tier text not null check (tier in ('primary','secondary')),
  rank int not null default 0,
  primary key (family_id, planet_key)
);

create table if not exists public.genre_scene (
  id text primary key,
  en_label text not null,
  he_label text,
  family_id text references public.genre_family(id),
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists public.evidence_field (
  field_id text primary key,        -- lower-kebab, ends free-text claim_type
  en_label text not null,
  he_label text,
  planet_key text not null check (planet_key in ('identity','music','live','audience','prokit','proof')),
  active boolean not null default true
);

create table if not exists public.registry_b (
  field_id text not null references public.evidence_field(field_id) on delete cascade,
  genre_family text not null references public.genre_family(id) on delete cascade,
  applicability text not null check (applicability in ('R','C','O','N')),
  why_buyer_cares_key text,         -- i18n key, never raw text
  next_action_rule text,            -- M-17(a): adopted from B01–B24 into the 15-col shape
  freshness_window text,
  primary key (field_id, genre_family)
);

-- 2 · WIRING COLUMNS on existing tables (nullable, dual-read; free text kept)
alter table public.act    add column if not exists scene_id text references public.genre_scene(id);
alter table public.claims add column if not exists field_id text references public.evidence_field(field_id);
-- M-17(b): extraction provenance is INTERNAL-ONLY (like internal_confidence,
-- §13.5/§21.6) — no client read path may ever render it.
alter table public.claims add column if not exists extraction_provenance text;

create index if not exists idx_claims_field on public.claims(field_id);
create index if not exists idx_registry_b_family on public.registry_b(genre_family);

-- 3 · RLS — lookups are world-readable, never client-writable (operator/
--     service role seeds them; no user data lives here).
alter table public.genre_family  enable row level security;
alter table public.family_planet enable row level security;
alter table public.genre_scene   enable row level security;
alter table public.evidence_field enable row level security;
alter table public.registry_b    enable row level security;

drop policy if exists gf_read on public.genre_family;
create policy gf_read on public.genre_family for select using (true);
drop policy if exists fp_read on public.family_planet;
create policy fp_read on public.family_planet for select using (true);
drop policy if exists gs_read on public.genre_scene;
create policy gs_read on public.genre_scene for select using (true);
drop policy if exists ef_read on public.evidence_field;
create policy ef_read on public.evidence_field for select using (true);
drop policy if exists rb_read on public.registry_b;
create policy rb_read on public.registry_b for select using (true);

-- 4 · SEEDS — structure only: the 8 ruled families (mirrors genreWeights.js
--     §16.A.1.a exactly; dj-club is the ① first-wired family).
insert into public.genre_family (id, en_label, sort_order) values
  ('dj-club', 'Club DJ', 1),
  ('dj-festival', 'Festival DJ', 2),
  ('open-format', 'Open-format / Events DJ', 3),
  ('live-band', 'Live band', 4),
  ('original-artist', 'Original artist', 5),
  ('live-electronic', 'Live electronic', 6),
  ('comedian-host', 'Comedian / Host', 7),
  ('corporate-ceremony', 'Corporate / Ceremony act', 8)
on conflict (id) do nothing;

insert into public.family_planet (family_id, planet_key, tier, rank) values
  ('dj-club','live','primary',1),('dj-club','audience','primary',2),('dj-club','prokit','primary',3),
  ('dj-club','proof','secondary',1),('dj-club','identity','secondary',2),
  ('dj-festival','music','primary',1),('dj-festival','live','primary',2),('dj-festival','proof','primary',3),
  ('dj-festival','audience','secondary',1),('dj-festival','identity','secondary',2),
  ('open-format','prokit','primary',1),('open-format','live','primary',2),('open-format','proof','primary',3),
  ('open-format','audience','secondary',1),('open-format','identity','secondary',2),
  ('live-band','live','primary',1),('live-band','prokit','primary',2),('live-band','proof','primary',3),
  ('live-band','audience','secondary',1),('live-band','identity','secondary',2),
  ('original-artist','music','primary',1),('original-artist','identity','primary',2),('original-artist','live','primary',3),
  ('original-artist','proof','secondary',1),('original-artist','audience','secondary',2),
  ('live-electronic','music','primary',1),('live-electronic','live','primary',2),('live-electronic','identity','primary',3),
  ('live-electronic','prokit','secondary',1),('live-electronic','proof','secondary',2),
  ('comedian-host','live','primary',1),('comedian-host','identity','primary',2),('comedian-host','prokit','primary',3),
  ('comedian-host','proof','secondary',1),('comedian-host','audience','secondary',2),
  ('corporate-ceremony','prokit','primary',1),('corporate-ceremony','proof','primary',2),('corporate-ceremony','live','primary',3),
  ('corporate-ceremony','identity','secondary',1),('corporate-ceremony','music','secondary',2)
on conflict (family_id, planet_key) do nothing;
