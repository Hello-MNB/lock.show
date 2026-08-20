-- Roll back only the grants changed by 20260820091500.
-- This restores the prior public surface and therefore reopens the privacy risk.

revoke select on public.claims from anon;
grant select (
  id, artist_id, claim_type, value, source_type,
  verification_status, reason_code, method_label
) on public.claims to anon;

revoke select on public.passport_versions from anon;
grant select (id, artist_id, snapshot, created_at)
  on public.passport_versions to anon;
