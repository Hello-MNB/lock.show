-- ============================================================
-- CANDIDATE — NOT A MIGRATION, NOT APPLIED ANYWHERE.
--
-- This file exists so a PROPOSAL can be EXECUTED instead of argued about.
-- scripts/test-tenant-isolation.mjs loads it into a throwaway database, on top
-- of migrations 001–042, and then re-runs the four shipped read paths to prove
-- two things at once: the cross-organization leak closes, AND nothing the app
-- ships today loses a row. It is deliberately NOT in supabase/migrations —
-- promoting it is the owner's act, and it needs the owner's ruling first
-- (see OWNER DECISION below).
--
-- ── THE DEFECT ──────────────────────────────────────────────────────────────
-- 008:266  create policy req_org_read on public.availability_requests
--            for select using (public.can_access_artist(artist_id));
-- 008:268  create policy req_org_update ... same predicate, for UPDATE.
--
-- can_access_artist() (027:166) is true for the owning org AND for EVERY
-- organization holding an active artist_access grant. Two agencies representing
-- the same artist is the ORDINARY state of a roster artist — and in that state
-- each one reads the other's inbound demand in full: requester_name, event_type,
-- location, contact fields. availability_requests.organization_id (008) records
-- which organization the demand belongs to and NO POLICY HAS EVER CONSULTED IT.
--
-- The UPDATE half is worse than the read half and had not been reported at all:
-- ORG_A can set ORG_B's request to 'closed'. Reproduced, executed:
--   ORG_A UPDATEs ORG_B request → ALLOWED, status became 'closed'.
--
-- ── THE MINIMAL CORRECT NARROWING ───────────────────────────────────────────
-- Not "narrow can_access_artist()" — that function gates claims, evidence,
-- items, passport_versions, share_link and act, and narrowing it would change
-- all of them. The narrowing belongs on THIS TABLE'S policies, and it is the
-- same two-arm rule the client already applies in src/lib/orgs.js:491
-- (getRadarInputs, APPSEC F2) — so this is the SQL half of a rule the codebase
-- has already agreed to, not a new invention:
--
--   ARM 1 · the artist's OWN side. The organization that OWNS the artist sees
--           every request for that artist, including organization_id IS NULL —
--           which is exactly what the anonymous public-Passport insert path
--           writes (server/index.js:907 sets no organization_id). NULL means
--           "the artist's own context", never "unclaimed, help yourself".
--   ARM 2 · a representing organization sees ONLY demand addressed to its own
--           mandate: organization_id IS NOT NULL AND it is one of mine.
--
-- Note the asymmetry is deliberate: ARM 2 requires NOT NULL. Without that, an
-- `organization_id IN (...)` written the naive way would let a NULL row match
-- nothing and be silently invisible to the owner too, or — worse, if written
-- as an OR with a NULL-tolerant arm — hand the artist's own private demand to
-- every grant-holder. The two arms are not symmetric because the situations
-- are not symmetric.
--
-- ── WHAT THIS DOES *NOT* CHANGE (proven by the gate, not asserted here) ─────
--   · listRequestsForAgency()  (src/lib/db.js:277) — resolves through
--     artists.created_by; the creator's org is the owning org (014 autoset), so
--     ARM 1 returns the identical row set. The shipped inbox is untouched.
--   · listRequestsForArtist()  (src/lib/db.js:297) — same, ARM 1.
--   · req_public_insert — the anonymous buyer's insert path is not a SELECT or
--     UPDATE policy and is not touched.
--   · req_operator_read / req_operator_update — separate policies, untouched.
--   · rosterNextAction.js:88 — its cross-org open-request COUNT collapses to
--     the reading org's own demand WITHOUT ANY CLIENT CHANGE. Residual (b) is
--     a symptom of this policy, not an independent defect; fixing the boundary
--     where the boundary lives fixes both.
--
-- ── OWNER DECISION REQUIRED BEFORE THIS CAN BE PROMOTED ─────────────────────
-- Today a co-representing agency can see (and close) the other agency's
-- inbound demand. Some agencies may have come to rely on that as a feature
-- ("we share an inbox"). This narrowing removes it. The ruling needed is one
-- sentence: "inbound demand belongs to the mandate it was addressed to, and a
-- co-representing organization has no claim on it" — or the opposite, in which
-- case the leak is a decision and must be DOCUMENTED as one, with the artist
-- told at consent time.
-- ============================================================

drop policy if exists req_org_read on public.availability_requests;
create policy req_org_read on public.availability_requests
  for select using (
    exists (
      select 1 from public.artists ar
       where ar.id = availability_requests.artist_id
         and ar.owner_organization_id in (select public.current_org_ids())
    )
    or (availability_requests.organization_id is not null
        and availability_requests.organization_id in (select public.current_org_ids()))
  );

drop policy if exists req_org_update on public.availability_requests;
create policy req_org_update on public.availability_requests
  for update using (
    exists (
      select 1 from public.artists ar
       where ar.id = availability_requests.artist_id
         and ar.owner_organization_id in (select public.current_org_ids())
    )
    or (availability_requests.organization_id is not null
        and availability_requests.organization_id in (select public.current_org_ids()))
  ) with check (
    exists (
      select 1 from public.artists ar
       where ar.id = availability_requests.artist_id
         and ar.owner_organization_id in (select public.current_org_ids())
    )
    or (availability_requests.organization_id is not null
        and availability_requests.organization_id in (select public.current_org_ids()))
  );
