-- LOCK SHOW — public PASSPORT payload firewall.
-- AUTHORED CANDIDATE ONLY. Do not apply without exact migration approval.
--
-- `reason_code` is private RADAR extraction/source rationale, not recipient
-- evidence. Historical passport_versions.snapshot JSON may also contain it.
-- The application sanitizes both live and legacy payloads; these grants provide
-- database-level defense in depth for the public anon key.

revoke select on public.claims from anon;
grant select (
  id, artist_id, claim_type, value, public_band, public_wording,
  source_type, verification_status, method_label, verified_at
) on public.claims to anon;

-- Public pages need only the immutable version id to record a bounded view.
-- Snapshot JSON is served through the sanitizing API boundary, not PostgREST.
revoke select on public.passport_versions from anon;
grant select (id, artist_id, created_at)
  on public.passport_versions to anon;
