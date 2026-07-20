-- ============================================================
-- 039 DOWN — remove the taxonomy/Registry-B spine (exact inverse).
-- Drops ONLY what 039 created. The wiring columns are dropped last —
-- they are nullable and dual-read, so no data outside 039's own tables
-- is lost (free-text genre/claim_type were never touched).
-- ============================================================

drop policy if exists rb_read on public.registry_b;
drop policy if exists ef_read on public.evidence_field;
drop policy if exists gs_read on public.genre_scene;
drop policy if exists fp_read on public.family_planet;
drop policy if exists gf_read on public.genre_family;

alter table public.claims drop column if exists extraction_provenance;
alter table public.claims drop column if exists field_id;
alter table public.act    drop column if exists scene_id;

drop table if exists public.registry_b;
drop table if exists public.evidence_field;
drop table if exists public.genre_scene;
drop table if exists public.family_planet;
drop table if exists public.genre_family;
