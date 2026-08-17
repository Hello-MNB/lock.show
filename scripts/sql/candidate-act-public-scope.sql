-- ============================================================
-- CANDIDATE — NOT A MIGRATION, NOT APPLIED ANYWHERE.
--
-- Same convention as candidate-req-org-scope.sql: a PROPOSAL that can be
-- EXECUTED rather than argued about. scripts/test-tenant-isolation.mjs loads it
-- into a throwaway database on top of every migration the harness applies (001–048,
-- not 001–042 as the first draft said) and re-runs the anon
-- read paths, to prove two things at once — the cross-Act public leak closes,
-- AND no shipped anonymous read loses a row. Promoting it is the owner's act.
--
-- ── THE DEFECT (A6, executed) ───────────────────────────────────────────────
-- 001:172  items_public_read   using (visibility='passport-ok' and artist_is_published(artist_id))
-- 001:185  claims_public_read  using (… and artist_is_published(artist_id))
-- 001:210  pv_public_read      using (artist_is_published(artist_id))
--
-- All three gate on artist_is_published(ARTIST_ID) — a PERSON-level flag. A
-- second Act hangs its evidence off the same artist_id (a non-default Act has no
-- `artists` row of its own), so the moment the FIRST Act is published the SECOND
-- Act is published too. Nobody decided that. Executed: anon reads ACT_B's
-- passport_versions, and ACT_B's passport-ok claim TEXT.
--
-- That contradicts an owner ruling that already exists — 16 Aug 2026, "PASSPORT
-- publication is Act-scoped" — and the transfer canon in CLAUDE.md: "Evidence is
-- per-Act and NON-transferable — a new Act starts empty." A new Act is currently
-- born public.
--
-- ── WHY THIS IS A POLICY CHANGE AND NOT A GRANT (PRIOR ART: 031) ────────────
-- This technique is NOT new here. Migration 031:14-16 already states it:
-- "Policy predicates may reference artist_approved even though it is NOT in the
-- anon column grants (RLS predicates run server-side, independent of SELECT
-- column grants)." This file applies the same principle to act_id.
-- src/lib/db.js:564 and the A6 assertion both record that anon "cannot be
-- Act-scoped in the client either", because 016/025 never granted anon
-- claims.act_id — naming the column raises 42501. True, and it is why the
-- CLIENT cannot fix this. It does NOT apply here: an RLS predicate is evaluated
-- as the policy owner, not as the querying role, so a policy may reference
-- act_id even though anon may not select it. No new column grant is required,
-- and none is given — anon's readable column set is unchanged.
--
-- ── THE SCOPE ───────────────────────────────────────────────────────────────
--   (act_id = artist_id OR act_id IS NULL)
--
-- Identical to the scope src/lib/db.js:554 already applies on the OWNER side in
-- buildPassportSnapshot(), expressed once on each side of the boundary.
--   · act.id === artists.id for the DEFAULT Act, so `act_id = artist_id` names
--     the default Act without a join.
--   · NULL-tolerant because 020 backfilled act_id = artist_id and trg_actfill_*
--     keeps filling it: a NULL row is a legacy default-Act row, never another
--     Act's. Tolerating NULL here drops nothing that exists.
--   · Only the DEFAULT Act is publishable today — publishPassport() refuses a
--     non-default Act fail-closed — so scoping the public read to the default
--     Act removes no reachable capability.
--
-- ── WHAT THIS DOES *NOT* CHANGE (proven by the gate, not asserted here) ─────
--   · anon's readable COLUMNS — untouched; no grant is added or removed.
--   · artists_public_read — a Person-level row, deliberately left alone.
--   · the owner / org read paths — these are anon-facing policies only.
--   · the anonymous buyer's request insert — a different policy.
--
-- ── OWNER DECISION ──────────────────────────────────────────────────────────
-- Unlike candidate-req-org-scope.sql, the BEHAVIOUR here is already ruled: Act-
-- scoped publication, 16 Aug 2026. What still belongs to the owner is the ACT of
-- promoting a security narrowing to a migration and applying it. Recorded as
-- OWNER-PENDING ACT-PUBLIC.
-- ============================================================

drop policy if exists items_public_read on public.profile_items;
create policy items_public_read on public.profile_items
  for select using (
    visibility = 'passport-ok'
    and public.artist_is_published(artist_id)
    and (act_id = artist_id or act_id is null)
  );

-- `artist_approved = true` is MIGRATION 031's approval gate and MUST be carried
-- forward. The first draft of this file rebuilt claims_public_read from 001's
-- text and silently dropped it — closing the Act leak while reopening 031's
-- firewall breach ("once an artist publishes, every auto-labeled claim they
-- NEVER reviewed becomes public") in the same statement. Independent QA caught
-- it; the gate did not. Policy bodies here are the CURRENT ones plus one
-- conjunct, never 001's text: 008, 017, 031 and 041 all touch these policies.
drop policy if exists claims_public_read on public.claims;
create policy claims_public_read on public.claims
  for select using (
    visibility = 'passport-ok'
    and verification_status in ('verified','supporting')
    and artist_approved = true
    and public.artist_is_published(artist_id)
    and (act_id = artist_id or act_id is null)
  );

drop policy if exists pv_public_read on public.passport_versions;
create policy pv_public_read on public.passport_versions
  for select using (
    public.artist_is_published(artist_id)
    and (act_id = artist_id or act_id is null)
  );
