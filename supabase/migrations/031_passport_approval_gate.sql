-- ============================================================
-- LOCK — migration 031: enforce the ARTIST-APPROVAL gate on the public Passport
-- ============================================================
-- BREACH (found 10 Jul, flow-gap audit): a claim is born visibility='passport-ok'
-- the instant it is auto-labeled verified/supporting (db.js processEvidence /
-- server process-evidence), BEFORE the artist reviews it. `claims.artist_approved`
-- defaults false (022) and is the intended publish gate — the in-app promise is
-- "Nothing publishes without you" and canon is "zero claims publish without review".
-- But `claims_public_read` filtered ONLY on visibility + status + published, never
-- on artist_approved. Result: once an artist publishes, every auto-labeled claim
-- they NEVER reviewed becomes public. The artist's own dashboard hid them
-- (ClaimReview checks artist_approved); the public face did not. Firewall breach.
--
-- FIX — add `and artist_approved = true` to the public row gate. Policy predicates
-- may reference artist_approved even though it is NOT in the anon column grants
-- (RLS predicates run server-side, independent of SELECT column grants). The app
-- read paths (getPublicPassport authenticated branch, buildPassportSnapshot, and
-- the server's service-role buildSafePayload) are filtered in the same commit.
--
-- Approved claims already carry visibility='passport-ok' + a publishable status, so
-- they keep showing; only unreviewed claims are now correctly hidden. Reversible.

drop policy if exists claims_public_read on public.claims;
create policy claims_public_read on public.claims
  for select using (
    visibility = 'passport-ok'
    and verification_status in ('verified','supporting')
    and artist_approved = true
    and public.artist_is_published(artist_id)
  );
