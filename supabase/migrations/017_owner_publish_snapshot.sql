-- ============================================================
-- 017 — No-secret publish. Let the connected artist-owner write their OWN
-- passport_version snapshot under RLS (previously service-role only → user-level
-- INSERT was blocked by the absence of an insert policy). This is what makes the
-- whole pilot run on Netlify-static with NO service-role and NO server:
--   • publish  = owner sets artists.published=true (artists_org) + inserts a
--                buyer-safe snapshot here (pv_owner_insert).
--   • view     = anon reads LIVE via RLS + the 016 column grants (no /api/passport).
--
-- can_access_artist(artist_id) is the existing SECURITY DEFINER check (owner's org
-- owns the artist, or active artist_access). The snapshot jsonb is built buyer-safe
-- on the client (passport-ok + safe columns only); reads stay gated by
-- pv_public_read (published). INSERT only — rows remain immutable (never updated).
-- Idempotent. Apply in the Supabase SQL editor (no secret).
-- ============================================================

drop policy if exists pv_owner_insert on public.passport_versions;
create policy pv_owner_insert on public.passport_versions for insert
  with check (public.can_access_artist(artist_id));
