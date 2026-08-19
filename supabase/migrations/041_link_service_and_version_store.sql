-- ============================================================
-- LOCK — migration 041: LINK SERVICE + PASSPORT VERSION STORE
-- (P0-PRIVACY lane B1. AUTHORED, NOT APPLIED — the owner applies.
--  The build agent never touches the live DB: §16.A.6.a rollout rules.)
--
-- Closes DATA-LAYER-GAP-MAP A7 (version store) + A8 (share link / rule 3:
-- "one link = one recipient view = one version") in ONE file, because this
-- lane owns 041 only (042 is a parallel lane; the gap map's 041/042/043
-- split is collapsed here — see NUMBERING below).
--
-- THE DEFECT THIS EXISTS TO CLOSE
--   `pv_public_read` (001_initial_schema.sql:209-210) says
--       for select using (public.artist_is_published(artist_id))
--   so ANY anonymous reader may SELECT *every row* of
--   public.passport_versions for any published artist — including every
--   superseded historical snapshot, forever, with no link, no recipient,
--   no expiry and no revocation. `public.share_link` (024:18-34) already
--   exists to bind a recipient to ONE version and has ZERO readers and ZERO
--   writers in the entire codebase (verified by grep across src/ + server/).
--
-- ============================================================
-- ██ PRECONDITIONS — READ BEFORE APPLYING ███████████████████████████████████
-- ============================================================
--
-- WHAT MUST BE TRUE BEFORE APPLY (PART A)
--   P1. Migrations 001, 008, 017, 020, 024, 025, 027 are applied on the target
--       DB. This file references, and does not create:
--         public.passport_versions          (001:124 · act_id 020:93 · org 008:119)
--         public.share_link                 (024:18)
--         public.act, public.artists
--         public.can_access_artist(uuid)    (027:166 — current definition)
--         public.is_operator()              (003:20)
--         public.set_act_from_artist_id()   (020 — already on share_link, 024:39)
--       If any is absent, PART A fails at the first ALTER/CREATE that names it.
--   P2. Extension pgcrypto is available (Supabase pre-installs it; PART A
--       re-asserts `create extension if not exists pgcrypto` anyway). Needed
--       for digest() in the resolver's constant-shape hash comparison and for
--       gen_random_uuid() on the new table.
--   P3. NOTHING in the deployed app writes public.share_link today (grep: zero
--       readers, zero writers). So every column added here starts empty and no
--       running code can violate the new CHECKs. If that stops being true
--       between authoring and apply, re-verify before running.
--   P4. The server flag SHARE_LINK_SERVICE_ENABLED is OFF (unset / not '1').
--       PART A is inert while it is off: the new RPCs exist but nobody calls
--       them. Turning the flag on BEFORE PART A is applied yields 500s from
--       the resolver route (missing function) — flag ON is step 3, not step 1.
--   P5. (APPSEC REPAIR F3/F4 — extends the apply-order semantics.)
--       · mint_share_link() now takes p_tracking_disclosed and REFUSES a mint
--         without affirmative disclosure. Its SIGNATURE CHANGED (8 args, not 7).
--         If a previous draft of this file was ever applied to a target DB, the
--         OLD 7-arg overload must be dropped before/with this apply or BOTH
--         will exist and the 7-arg one would still mint undisclosed links:
--             drop function if exists public.mint_share_link(
--               uuid, text, text, text, text, timestamptz, text);
--         The .down.sql drops both signatures for exactly this reason.
--       · share_link gains `mint_request_key` + a UNIQUE index. This is the
--         logical-request identity that makes minting atomic instead of
--         check-then-insert. It is NULL for every pre-existing row (NULLs are
--         distinct in a unique index), so the backfill is "no backfill".
--       · share_link_tracking_disclosed_check is added NOT VALID **on purpose**:
--         every INSERT and UPDATE from the apply forward is refused unless
--         tracking_disclosed is true, while rows that predate 041 are not
--         re-validated (P3 says there are none; NOT VALID keeps the apply from
--         failing if that ever stops being true). Validate later with
--             alter table public.share_link validate constraint
--               share_link_tracking_disclosed_check;
--
-- ██ PRIVILEGE MODEL — EVERY FUNCTION THIS FILE CREATES ██
--   Supabase's default privileges grant EXECUTE on every new function in
--   `public` to anon, authenticated AND service_role — on top of the PostgreSQL
--   default of EXECUTE to PUBLIC. `revoke ... from public` alone therefore
--   revokes NOTHING that matters: the named roles keep their explicit grants.
--   Every function below is revoked from public, anon, authenticated AND
--   service_role first, and then granted back to the minimum that has a caller:
--     resolve_share_link(text)            → anon, authenticated, service_role
--                                            (the recipient's only door)
--     record_share_link_open(text,text)   → anon, authenticated, service_role
--     mint_share_link(...)                → authenticated, service_role
--     revoke_share_link(uuid,text)        → authenticated, service_role
--     pv_fill_defaults() / pv_guard_immutable()  → NOBODY.
--       They are TRIGGER functions. PostgreSQL checks EXECUTE at CREATE TRIGGER
--       time, not at fire time, so the triggers keep working with zero grants —
--       and pv_fill_defaults(), which is SECURITY DEFINER, stops being a
--       directly callable definer entry point for anon.
--   scripts/test-sql-privileges.mjs EXECUTES this file against a scratch
--   Postgres and fails if any function it creates is PUBLIC-executable.
--
-- ORDER OF APPLY — THREE STEPS, DELIBERATELY SEPARATE
--   Step 1  PART A (this file, everything above the PART B fence).
--           ADDITIVE ONLY. No policy is dropped. No column is dropped. No type
--           is changed. Anonymous read surface is UNCHANGED after step 1.
--   Step 2  Deploy the app/server with SHARE_LINK_SERVICE_ENABLED=1 and mint
--           real links for any recipient who must keep access. Verify each
--           minted token resolves. THIS IS THE MIGRATION-FROM-OPEN-ACCESS
--           WINDOW: after step 3 an un-minted recipient has no path in.
--   Step 3  PART B (the fenced block at the bottom of this file, copied out and
--           run separately). THIS IS THE BREAKING ONE.
--
-- WHAT BREAKS IF APPLIED OUT OF ORDER
--   · PART B before PART A → the new policy references share_link.token_hash /
--     .revoked_at / passport_versions.state, none of which exist yet: the
--     CREATE POLICY fails and `pv_public_read` is ALREADY DROPPED by the
--     preceding statement in the same block. Result: anonymous SELECT on
--     passport_versions is fully closed with no replacement. Run PART B as one
--     transaction (BEGIN/COMMIT is included in the fenced block) so a failure
--     rolls the drop back.
--   · PART B before any link is minted (step 2 skipped) → every existing
--     recipient who was reading a Passport by artist id keeps working (the
--     public /passport/:id route reads LIVE artists/claims/profile_items rows,
--     NOT passport_versions — see IMPACT below), but nothing can read a
--     historical snapshot anonymously. That is the intent; it is only a problem
--     if some out-of-repo consumer depends on the open snapshot read.
--   · PART A twice → harmless. Every statement is `if not exists` / `or replace`
--     / drop-and-recreate. The backfills are idempotent (they only touch rows
--     where the new column is still NULL).
--
-- ██ THE ONE BREAKING ELEMENT — SAY IT PLAINLY ██
--   PART B replaces the policy `pv_public_read` on public.passport_versions.
--   Before: anon may read EVERY snapshot row of any published artist.
--   After:  anon may read EXACTLY the one row bound by a live (not expired,
--           not revoked, not replaced) share link, and the owner/org keeps
--           the full governed history via a separate policy.
--   Nothing else in this file removes or narrows any access.
--
--   IMPACT OF PART B ON SHIPPED CODE (verified by grep, 041 authoring):
--     · src/App.jsx:155 `/passport/:id` → src/lib/db.js:513 getPublicPassport()
--       reads artists + profile_items + claims LIVE. It does NOT read
--       passport_versions. UNAFFECTED.
--     · server/index.js:433 GET /api/passport/:artistId reads passport_versions
--       with the SERVICE ROLE, which bypasses RLS. UNAFFECTED.
--     · src/lib/db.js:470 recordPassportView() — anon SELECT id FROM
--       passport_versions WHERE artist_id = ... ORDER BY created_at DESC.
--       ⚠ THIS IS THE ONE SHIPPED ANON READER AND IT WILL STOP RETURNING ROWS.
--       Consequence: the passport_view_event row is silently not written for a
--       visit that arrived on the legacy /passport/:id route (the function
--       already swallows errors — "measurement is best-effort"). NO user-facing
--       breakage; MEASUREMENT DEGRADES until view recording moves onto the
--       token route (where resolve_share_link returns the bound version id).
--       This is a known, accepted, reversible consequence — not a surprise.
--
-- ROLLBACK
--   041_link_service_and_version_store.down.sql restores `pv_public_read`
--   verbatim from 001:209-210 first, then removes PART A. Restoring the old
--   policy alone is enough to undo the breaking half.
--
-- NUMBERING / LANE NOTE
--   The gap map plans 041 = version store, 042 = recipient_policy registry,
--   043 = link service. This lane owns 041 ONLY and 042 is held by a parallel
--   lane, so 041 carries the version store AND the link service. The recipient
--   policy REGISTRY TABLE is deliberately NOT created here: the six policy keys
--   are stored as a CHECK-constrained text column (`share_link.audience`,
--   `passport_versions.audience`), so a later migration can add
--   `recipient_policy(id …)` and attach a FK without moving any data.
--   Open canon question (gap map "What I could not determine"): whether the six
--   keys are booker/producer/private/programmer/brand/rep (Screen-Registry:72)
--   or "4 families + modes" (LOCK-Open-Decisions:118). Six is used here; a
--   correction is one CHECK re-add away (same pattern as 034/040).
--
-- ============================================================
-- ██ DEFERRED DATA MIGRATION — publication invariant (F5c) ██████████████████
-- ============================================================
-- NOT FORCED BY THIS FILE, AND DELIBERATELY SO. A1.i creates
-- idx_pv_one_published inside a guarded DO block. If historical rows already
-- break the invariant, the CREATE rolls back with a WARNING and THE MIGRATION
-- STILL APPLIES — no breaking cutover, no refused deploy. Until the data is
-- repaired the invariant is maintained procedurally for NEW writes only, by
-- trg_pv_supersede (which demotes every incumbent in the bucket on each
-- publish). That is a weaker guarantee than the index and it is stated here
-- rather than hidden.
--
-- ── WHAT MUST BE CLEANED ────────────────────────────────────────────────────
--   C1. Buckets with more than one row in state='published'.
--       Cause: two publishes that predate this migration, or a pre-041 apply
--       whose backfill ran against a table that already had a `state` column.
--   C2. Rows with act_id IS NULL. Their lineage is INFERRED as artist_id.
--       That inference is exactly right while act.id = artists.id (020:87 —
--       the default Act carries the artist's id), and AMBIGUOUS the moment an
--       artist holds a second Act: a NULL-act row would coalesce onto the
--       DEFAULT act's bucket whether or not it belongs there. Multi-act is
--       canon (CLAUDE.md: evidence is per-Act and NON-transferable), so this
--       must be resolved before act_id can be promoted to NOT NULL.
--       (Note: after 041, trg_pv_immutable refuses any UPDATE that changes
--       act_id, so C2 rows cannot be repaired in place — see R2 below.)
--
-- ── DETECTION — RUN THESE THREE, EXACTLY AS WRITTEN ─────────────────────────
--   D-C1  buckets that break the invariant (expect ZERO rows):
--         select coalesce(act_id, artist_id)      as lineage,
--                coalesce(audience, '(none)')     as audience_key,
--                count(*)                         as published_rows,
--                array_agg(id order by created_at, id) as version_ids
--           from public.passport_versions
--          where state = 'published'
--          group by 1, 2
--         having count(*) > 1;
--
--   D-C2  rows with no explicit act lineage (expect ZERO rows):
--         select pv.id, pv.artist_id, pv.created_at,
--                (select count(*) from public.act a where a.person_id =
--                   (select ar.created_by from public.artists ar where ar.id = pv.artist_id)
--                ) as acts_held_by_person
--           from public.passport_versions pv
--          where pv.act_id is null;
--
--   D-IDX did the guarded index actually land? (expect ONE row; zero rows means
--         the WARNING fired and C1 is outstanding):
--         select indexname, indexdef from pg_indexes
--          where schemaname = 'public'
--            and indexname  = 'idx_pv_one_published'
--            and indexdef  ilike '%COALESCE%';
--
-- ── REPAIR (owner-run, NOT part of any migration) ───────────────────────────
--   R1 for C1 — keep the newest row in each bucket, demote the rest:
--        update public.passport_versions pv
--           set state = 'superseded',
--               superseded_at = coalesce(pv.superseded_at, pv.created_at)
--         where pv.state = 'published'
--           and pv.id <> (
--                 select p2.id from public.passport_versions p2
--                  where p2.state = 'published'
--                    and coalesce(p2.act_id, p2.artist_id) = coalesce(pv.act_id, pv.artist_id)
--                    and coalesce(p2.audience, '(none)')   = coalesce(pv.audience, '(none)')
--                  order by p2.created_at desc, p2.id desc limit 1);
--      then re-run this migration — the DO block will create the index cleanly.
--   R2 for C2 — act_id is immutable under trg_pv_immutable, so the repair is a
--      deliberate, logged, owner-run act:
--        alter table public.passport_versions disable trigger trg_pv_immutable;
--        update public.passport_versions set act_id = artist_id where act_id is null;
--        alter table public.passport_versions enable  trigger trg_pv_immutable;
--      Only valid while every affected artist holds exactly ONE Act (D-C2's
--      acts_held_by_person = 1). For a multi-act artist the correct act must be
--      chosen per row by hand — there is no derivation that can do it.
--   R3 only after D-C1 and D-C2 both return zero rows may a later migration
--      promote act_id / state / version_no to NOT NULL. This file does not.
-- ============================================================
--
-- FIREWALL
--   Nothing here stores or exposes a score, percentile, rank or prediction.
--   Open counts stay OFF the artist-facing surface: share_link_event is
--   operator-read only, and `share_link_delivery_v` — the sanctioned
--   artist-facing projection — exposes delivery + expiry ONLY (no opened_at,
--   no open_count, no event counts).
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- PART A — ADDITIVE. Safe to apply on its own. Changes no existing policy.
-- ============================================================

-- ──────────────────────────────────────────────────────────────────────────
-- A1 · passport_versions: make a version IDENTIFIABLE, ORDERED and IMMUTABLE
-- ──────────────────────────────────────────────────────────────────────────
-- Today the table is `id · artist_id · snapshot · created_at` (+organization_id
-- 008, +act_id 020): a log, not a version store. No state, no ordering, no
-- supersede pointer. A share link cannot bind "one version" meaningfully while
-- every row is anonymous and interchangeable.

alter table public.passport_versions
  add column if not exists version_no    integer,
  add column if not exists state         text,
  add column if not exists supersedes_id uuid references public.passport_versions(id) on delete set null,
  add column if not exists published_at  timestamptz,
  add column if not exists superseded_at timestamptz,
  add column if not exists created_by    uuid references auth.users(id) on delete set null,
  add column if not exists content_hash  text,
  -- audience: which of the six recipient policies this version was cut for.
  -- NULL = "not policy-scoped" (every row that exists before 041). A later
  -- migration may add recipient_policy(id) and attach a FK to this column.
  add column if not exists audience      text;

comment on column public.passport_versions.version_no is
  'Monotonic per act (per artist for pre-act rows). Filled by trg_pv_defaults; never reused, never rewritten.';
comment on column public.passport_versions.state is
  'draft · preview · review · published · superseded. Exactly one published row per (coalesce(act_id,artist_id), coalesce(audience,''(none)'')) — idx_pv_one_published enforces it structurally, trg_pv_supersede maintains it atomically on every publish.';
comment on column public.passport_versions.audience is
  'One of the six recipient policies (booker·producer·private·programmer·brand·rep), or NULL for a non-policy-scoped snapshot.';

do $$ begin
  alter table public.passport_versions
    add constraint passport_versions_state_check
    check (state is null or state in ('draft','preview','review','published','superseded'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.passport_versions
    add constraint passport_versions_audience_check
    check (audience is null or audience in ('booker','producer','private','programmer','brand','rep'));
exception when duplicate_object then null; end $$;

-- Backfill. Every existing row was written by publishPassport() at publish time
-- (src/lib/db.js:572-586), so the newest row per act IS the published one and
-- every older row IS superseded. Deterministic tie-break: created_at, then id.
with ordered as (
  select id,
         coalesce(act_id, artist_id) as lineage,
         row_number() over (partition by coalesce(act_id, artist_id)
                            order by created_at asc, id asc) as rn,
         row_number() over (partition by coalesce(act_id, artist_id)
                            order by created_at desc, id desc) as rn_desc
    from public.passport_versions
)
update public.passport_versions pv
   set version_no    = coalesce(pv.version_no, o.rn),
       state         = coalesce(pv.state, case when o.rn_desc = 1 then 'published' else 'superseded' end),
       published_at  = coalesce(pv.published_at, pv.created_at),
       superseded_at = case
                         when pv.superseded_at is not null then pv.superseded_at
                         when o.rn_desc = 1 then null
                         else pv.created_at
                       end
  from ordered o
 where o.id = pv.id
   and (pv.version_no is null or pv.state is null or pv.published_at is null);

-- ── A1.i · PUBLICATION INVARIANT — the index must not be silently inert ─────
-- WHAT WAS WRONG (F5a, reproduced on Postgres 16 before this fix):
--   the first draft indexed the BARE columns —
--       create unique index idx_pv_one_published
--         on public.passport_versions (act_id, audience) where state='published';
--   NULLs are DISTINCT in a Postgres unique index, and `audience` is NULL for
--   every row the live writer produces (src/lib/db.js:579 inserts
--   {artist_id, snapshot} only). So the index never collided with itself: three
--   consecutive publishPassport() calls left THREE rows in state='published'
--   for one act. The invariant the comment claimed was never enforced at all.
--   Same defect on (act_id, version_no): act_id is nullable (020 FK is
--   ON DELETE SET NULL), so a NULL-act row escaped version_no uniqueness too.
--
-- THE FIX — index the COALESCED KEY, so no row can escape through a NULL:
--   lineage      = coalesce(act_id, artist_id)
--                  Sound because 020:87 fixes act.id = artists.id for the
--                  default Act, so a legacy NULL-act row coalesces onto exactly
--                  the act it belongs to instead of forming a private bucket.
--   audience key = coalesce(audience, '(none)')
--                  '(none)' can never be a real audience: it is refused by
--                  passport_versions_audience_check above.
--   artist_id is NOT NULL (001:125), so the lineage key is never NULL and the
--   index is total. NOT NULL + default on act_id/audience is deliberately NOT
--   used: it would change the shape the existing writer inserts.
--
-- WHY THE GUARDED DO BLOCK (F5c — no forced cutover):
--   CREATE UNIQUE INDEX is a hard failure if legacy rows already violate the
--   invariant. This migration must never refuse to apply because of historical
--   data, so the create runs inside a subtransaction: on unique_violation the
--   DROP and the CREATE both roll back (the pre-existing index, if any, is left
--   exactly as it was) and the apply continues with a WARNING. New rows are
--   still governed, because trg_pv_supersede (below) enforces the same
--   invariant procedurally on every write regardless of whether the index
--   exists. See "DEFERRED DATA MIGRATION" in this file's header for the exact
--   detection and repair queries.
do $$
begin
  drop index if exists public.idx_pv_one_published;
  create unique index if not exists idx_pv_one_published
    on public.passport_versions ((coalesce(act_id, artist_id)), (coalesce(audience, '(none)')))
    where state = 'published';
exception when unique_violation then
  raise warning
    '041 F5a: idx_pv_one_published NOT created — legacy rows already break the one-published-per-(act,audience) invariant. The old index (if any) is untouched and trg_pv_supersede still governs every new write. Run the DEFERRED DATA MIGRATION detection query in this file''s header, repair, then re-run this migration.';
end $$;

do $$
begin
  drop index if exists public.idx_pv_act_version_no;
  create unique index if not exists idx_pv_act_version_no
    on public.passport_versions ((coalesce(act_id, artist_id)), version_no);
exception when unique_violation then
  raise warning
    '041 F5a: idx_pv_act_version_no NOT created — legacy rows carry duplicate version_no within one lineage. See the DEFERRED DATA MIGRATION block in this file''s header.';
end $$;

create index if not exists idx_pv_state on public.passport_versions (state);

-- version_no / state are NOT declared NOT NULL here on purpose. The live writer
-- (src/lib/db.js:579) inserts {artist_id, snapshot} and nothing else; NOT NULL
-- without a filler would break publishing on the next deploy. trg_pv_defaults
-- below fills both on INSERT. Promote to NOT NULL in a later migration once the
-- trigger has been live through at least one publish cycle.
-- ── LINEAGE OWNERSHIP · added after QA-INDEP-06 H1 ──────────────────────────
-- EVERYTHING BELOW KEYS ON `coalesce(act_id, artist_id)` — the lineage — and
-- nothing consulted who owns it. `set_act_from_artist_id()` (020:147) fills
-- act_id only when NULL, so a caller may SUPPLY one, and `pv_owner_insert`
-- (017:18) checked only `can_access_artist(artist_id)`. An independent reviewer
-- found the consequence and it was reproduced three ways:
--
--   (a) a stranger inserts ONE row on their OWN artist stamped with the victim's
--       act_id → pv_supersede_previous demotes the victim's published version and
--       the stranger's row holds `published` in the victim's lineage;
--   (b) the victim cannot undo it — passport_versions has no UPDATE and no DELETE
--       policy, so their revive and their delete match zero rows and report success;
--   (c) a row parked at version_no = 2147483647 makes every later publish in that
--       lineage fail with `integer out of range`.
--
-- The act id is not secret: for a default Act `act.id = artists.id`, and
-- artists_public_read hands it to anon.
--
-- THE PREDICATE IS "SAME PERSON", NOT "act_id = artist_id". The obvious constraint
-- would forbid multi-Act outright — a second Act has its own uuid, and CLAUDE.md
-- makes multi-Act canon. Today every Act is the default one (020:13, act.id =
-- artists.id), and a second Act is linked by person_id, so the honest rule is that
-- the Act must belong to the person who owns the artist. NULL stays legal: the
-- 020 backfill left pre-Act rows with NULL and they are legitimate history.
-- SECURITY DEFINER, and this is not decoration. The first version inlined the
-- EXISTS directly in the policy, and a subquery inside a WITH CHECK runs under the
-- CALLER's row-level security — `act` has RLS, so an artist publishing for their
-- own SECOND Act could not see the `act` row the predicate needed and was refused.
-- Multi-Act is canon (CLAUDE.md), so a fix that forbids it is not a fix. Caught by
-- executing the legitimate case, which is why it is now a test.
-- This mirrors `can_access_artist` (008:147), which is SECURITY DEFINER for the
-- same reason.
-- OWNERSHIP IS NOT `created_by` ALONE — QA-INDEP-07, F1. The first version of this
-- predicate keyed entirely on `artists.created_by`, which no policy governs:
-- artists_org (015:27) constrains the ORG column only, and the permissive
-- artists_owner (001:162) cannot restrict what another permissive policy admits.
-- One extra INSERT — an artists row in the attacker's own org carrying the
-- victim's `created_by` — made this function certify the very attack it exists to
-- refuse. Reproduced locally before it was believed. See 049.
-- DELIBERATELY NOT NAMED `act_belongs_to_artist`. That name is taken: migration
-- 046 defines a function with the same signature and a STRICTER body (no NULL
-- allowance, no default-Act identity), and 046's down file drops it. Reusing the
-- name made 041 depend on a definition a LATER migration owns — 046 silently
-- replaced this body on every full apply — and made each migration's rollback
-- break the other's policy. Two migrations, two helpers, two down files that can
-- each run alone: that is the only arrangement where either rollback is real.
create or replace function public.pv_act_in_artist_lineage(p_act uuid, p_artist uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select p_act is null
      or p_act = p_artist
      or (
        -- A DEFAULT ACT'S ID *IS* AN ARTISTS ID — 020's act_from_artist() mirrors
        -- every artists row into `act` with `act.id = artists.id`. So if p_act
        -- names an artists row and it is not p_artist, this is a reach across two
        -- artists, whatever any other column claims. QA-INDEP-07 (F1) got past the
        -- ownership join below by inserting an artists row carrying the VICTIM's
        -- `created_by`; this disjunct refuses that shape without consulting
        -- `created_by` at all, and 049 stops the forged column separately. Two
        -- independent reasons to refuse, because the first one has now been wrong
        -- once. A non-default Act's id is a fresh uuid and never an artists id, so
        -- multi-Act publishing is untouched — executed, not assumed.
        not exists (select 1 from public.artists ar where ar.id = p_act)
        and exists (
          select 1 from public.act a
           where a.id = p_act
             and a.person_id = (select ar.created_by from public.artists ar where ar.id = p_artist)
        )
      )
$$;
-- ANON IS REVOKED, and the revoke is load-bearing: Supabase's default privileges
-- grant EXECUTE on every new function to anon/authenticated/service_role, and
-- `revoke from public` does not remove a role-specific grant. This is a linkage
-- ORACLE — it answers "do this Act and this artist belong together" about ids the
-- caller supplies — and anon has no path that needs it: the policy it serves is
-- INSERT-only, and can_access_artist() already refuses an anonymous writer.
-- `authenticated` must hold EXECUTE because a policy expression is planned as the
-- CALLING role, not as the policy's owner. That grant is DECLARED, NOT LOAD-BEARING,
-- and I know which because I deleted it: the suite stayed green, exactly as 046's
-- comment says of its own pair, because scripts/sql/supabase-shim.sql:38-39 mirrors
-- Supabase's default privileges and hands `authenticated` the same EXECUTE at CREATE
-- time. It is written anyway — a migration should not rely on a platform default it
-- does not state — but the honest claim is "redundant with the default", not "the
-- only thing standing between us and permission-denied". The anon REVOKE above IS
-- load-bearing for that same reason, and deleting it turns P3 red.
revoke all on function public.pv_act_in_artist_lineage(uuid, uuid) from public;
revoke all on function public.pv_act_in_artist_lineage(uuid, uuid) from anon;
grant execute on function public.pv_act_in_artist_lineage(uuid, uuid) to authenticated;
grant execute on function public.pv_act_in_artist_lineage(uuid, uuid) to service_role;

drop policy if exists pv_owner_insert on public.passport_versions;
create policy pv_owner_insert on public.passport_versions for insert
  with check (
    public.can_access_artist(artist_id)
    and public.pv_act_in_artist_lineage(act_id, artist_id)
  );

create or replace function public.pv_fill_defaults()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_lineage uuid := coalesce(new.act_id, new.artist_id);
begin
  if new.version_no is null then
    select coalesce(max(version_no), 0) + 1 into new.version_no
      from public.passport_versions
     where coalesce(act_id, artist_id) = v_lineage;
  end if;
  if new.state is null then new.state := 'published'; end if;   -- matches today's publish-only writer
  if new.state = 'published' and new.published_at is null then
    new.published_at := coalesce(new.created_at, now());
  end if;
  if new.created_by is null then new.created_by := auth.uid(); end if;
  return new;
end $$;

-- APPSEC F1 · pv_fill_defaults() is SECURITY DEFINER. Left at the Supabase
-- default it is EXECUTE-able by anon/authenticated/PUBLIC — a definer entry
-- point any web role could call directly. A trigger function needs NO grant at
-- all (PostgreSQL checks EXECUTE when the trigger is CREATED, not when it
-- fires), so the minimum here is nobody.
revoke all on function public.pv_fill_defaults() from public, anon, authenticated, service_role;

drop trigger if exists trg_pv_defaults on public.passport_versions;
create trigger trg_pv_defaults before insert on public.passport_versions
  for each row execute function public.pv_fill_defaults();

-- ── A1.ii · ATOMIC SUPERSESSION (F5b) ───────────────────────────────────────
-- WHAT WAS WRONG: publishing a new version did not touch the previous one.
--   Nothing in the schema said "the row that was published a second ago is now
--   history"; publishPassport() inserted and walked away. Reproduced on
--   Postgres 16: three inserts → three rows in state='published', none with a
--   superseded_at, none pointing at its predecessor.
--
-- WHY A **BEFORE** TRIGGER AND NOT AN AFTER TRIGGER / A FUNCTION:
--   · A unique index is checked when the row is written, which is BEFORE any
--     AFTER-row trigger runs. An AFTER trigger could never demote the incumbent
--     in time — the INSERT would already have failed on idx_pv_one_published.
--     A BEFORE trigger demotes the incumbent first, so the new row lands into a
--     bucket that is already free. Index and trigger cooperate instead of
--     racing.
--   · A publish_version() function would only govern callers that use it. The
--     shipped writer (src/lib/db.js:579) is a bare INSERT and is not going to
--     be rewritten by this migration; a trigger governs it as it stands, plus
--     the service role, plus psql, plus anything added later.
--   · Same statement ⇒ same transaction ⇒ atomic. There is no instant at which
--     two rows are published, and no instant at which zero are.
--
-- TRIGGER FIRING ORDER (alphabetical, per Postgres):
--   INSERT: trg_actfill_pv (020, fills act_id) → trg_pv_defaults (fills state)
--           → trg_pv_supersede. Each one needs what the previous one set.
--   UPDATE: trg_pv_immutable (guards) → trg_pv_supersede.
-- The demotion UPDATE re-enters this trigger with new.state='superseded', which
-- returns on the first line — one level of recursion, then it stops.
create or replace function public.pv_supersede_previous()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_prev uuid;
begin
  -- Only a row ARRIVING at 'published' supersedes anything. A row that was
  -- already published and is being touched for another reason does not.
  if new.state is distinct from 'published' then return new; end if;
  if tg_op = 'UPDATE' and old.state = 'published' then return new; end if;

  -- The immediate predecessor, recorded on the new row as lineage.
  select p.id into v_prev
    from public.passport_versions p
   where p.state = 'published'
     and coalesce(p.act_id, p.artist_id) = coalesce(new.act_id, new.artist_id)
     and coalesce(p.audience, '(none)')  = coalesce(new.audience, '(none)')
     and p.id is distinct from new.id
   order by p.version_no desc nulls last, p.created_at desc, p.id desc
   limit 1;

  -- Demote EVERY incumbent, not just the newest: if legacy data left more than
  -- one published row in this bucket, the next publish cleans the bucket up
  -- instead of failing on it. This is what makes the invariant hold for new
  -- writes even while the deferred data migration is outstanding.
  update public.passport_versions p
     set state         = 'superseded',
         superseded_at = coalesce(p.superseded_at, now())
   where p.state = 'published'
     and coalesce(p.act_id, p.artist_id) = coalesce(new.act_id, new.artist_id)
     and coalesce(p.audience, '(none)')  = coalesce(new.audience, '(none)')
     and p.id is distinct from new.id;

  if new.supersedes_id is null then new.supersedes_id := v_prev; end if;
  if new.published_at  is null then new.published_at  := coalesce(new.created_at, now()); end if;
  new.superseded_at := null;   -- the row being published is not itself history
  return new;
end $$;

-- APPSEC F1/F5 · pv_supersede_previous() is SECURITY DEFINER because it MUST
-- be. passport_versions has RLS on and carries NO update policy (001/017 give
-- it select + insert only), so a non-definer trigger's demotion UPDATE would
-- silently match ZERO rows for an authenticated publisher — and the new row
-- would then collide with the incumbent on idx_pv_one_published and the whole
-- publish would fail. Definer rights are what make the supersession real.
-- Same grant rule as the other two trigger functions: EXECUTE is checked at
-- CREATE TRIGGER time, never at fire time, so the minimum grant is NOBODY.
revoke all on function public.pv_supersede_previous() from public, anon, authenticated, service_role;

drop trigger if exists trg_pv_supersede on public.passport_versions;
create trigger trg_pv_supersede before insert or update on public.passport_versions
  for each row execute function public.pv_supersede_previous();

-- IMMUTABILITY. A share link binds one version; if that version's snapshot can
-- be edited under the recipient, the binding proves nothing. Nothing in the repo
-- UPDATEs this table today (001:122 "Never updated — only new rows added", and
-- there is no UPDATE policy), so this guard forbids only what already never
-- happens — while making it structural instead of conventional.
-- The ONLY permitted transition is published → superseded (plus the pointers
-- that record it). Everything else raises.
create or replace function public.pv_guard_immutable()
returns trigger language plpgsql as $$
begin
  if new.snapshot     is distinct from old.snapshot     then raise exception 'passport_versions.snapshot is immutable (version %)', old.id; end if;
  if new.artist_id    is distinct from old.artist_id    then raise exception 'passport_versions.artist_id is immutable (version %)', old.id; end if;
  if new.act_id       is distinct from old.act_id       then raise exception 'passport_versions.act_id is immutable (version %)', old.id; end if;
  if new.version_no   is distinct from old.version_no   then raise exception 'passport_versions.version_no is immutable (version %)', old.id; end if;
  if new.created_at   is distinct from old.created_at   then raise exception 'passport_versions.created_at is immutable (version %)', old.id; end if;
  if old.state = 'superseded' and new.state <> 'superseded' then
    raise exception 'passport_versions: a superseded version can never be revived (version %)', old.id;
  end if;
  return new;
end $$;

-- APPSEC F1 · same rule for the immutability guard (not a definer, but there
-- is still no legitimate direct caller).
revoke all on function public.pv_guard_immutable() from public, anon, authenticated, service_role;

drop trigger if exists trg_pv_immutable on public.passport_versions;
create trigger trg_pv_immutable before update on public.passport_versions
  for each row execute function public.pv_guard_immutable();

-- ──────────────────────────────────────────────────────────────────────────
-- A2 · share_link: the recipient binding — token, audience, purpose, lifecycle
-- ──────────────────────────────────────────────────────────────────────────
-- Existing (024:18-34): id · passport_version_id NOT NULL · artist_id · act_id ·
-- recipient_label · context · tracking_disclosed · expiry · utm_* ·
-- status{active·expired·revoked} · opened_at · open_count · created_at.
-- Missing: a handle anon can present, WHO the link is for, WHY, when authority
-- was withdrawn, and who minted it.

alter table public.share_link
  -- THE HANDLE. Only the sha256 HEX DIGEST of the token is stored — never the
  -- token itself. Same decision, and the same digest shape, as the confirmation
  -- token plan in 036_token_hash.sql.DRAFT: a leaked table/backup must not be a
  -- set of working links.
  --   GENERATION EXPECTATION (server contract, src/lib/shareLink.js):
  --     raw token = base64url(crypto.randomBytes(32))  → 256 bits of entropy,
  --     43 chars, [A-Za-z0-9_-]. Stored value =
  --     encode(digest(raw,'sha256'),'hex') = 64 lowercase hex chars.
  --     The raw token is returned to the minting owner EXACTLY ONCE and is not
  --     recoverable afterwards. Anything shorter than 32 bytes is a defect:
  --     this is a bearer credential to a person's professional evidence.
  add column if not exists token_hash text,

  -- WHICH of the six recipient policies this link opens. One link = one view.
  add column if not exists audience text,

  -- WHY it was sent, in the owner's words. Working-only; never rendered to the
  -- recipient, never used in any derivation.
  add column if not exists purpose text,

  -- Authority withdrawal. status='revoked' is the state; revoked_at is the
  -- receipt. History is never deleted (mirrors the D1 mandate law).
  add column if not exists revoked_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,

  -- Endless expiry is a DELIBERATE ANSWER, not a missing value — the same rule
  -- src/lib/mandateExpiry.js already applies to artist_access.expires_at.
  -- expiry IS NULL  ⇔  expiry_kind='endless'  ⇔  this link never lapses on the
  -- clock (it can still be revoked or replaced). See the CHECK below: the two
  -- columns can never disagree.
  add column if not exists expiry_kind text,

  -- "Replace" never re-points a link: it mints a new row and marks the old one.
  add column if not exists replaced_by uuid references public.share_link(id) on delete set null,

  -- The recipient said "this isn't me". A distinct terminal state, because it
  -- resolves to a different recovery path than expiry or revocation.
  add column if not exists wrong_recipient_at timestamptz,

  -- APPSEC F4 · THE LOGICAL REQUEST IDENTITY.
  -- "Mint the link for version V, audience A, recipient R, purpose P, expiry E"
  -- is ONE logical request no matter how many times the button is pressed or
  -- how many server instances race on it. Storing that key ON THE LINK ITSELF,
  -- UNIQUE, is what makes minting atomic: the second concurrent mint collides
  -- in the index and takes the ON CONFLICT branch instead of creating a second
  -- bearer credential. The value is src/lib/shareLink.js mintIdempotencyKey() —
  -- derived from what the link IS, never from when it was asked for.
  -- NULL for every pre-041 row; NULLs are distinct in a unique index, so no
  -- backfill exists and none is needed.
  add column if not exists mint_request_key text;

comment on column public.share_link.mint_request_key is
  'Logical mint-request identity (shareLink.js mintIdempotencyKey). UNIQUE: two concurrent mints of the same request return the SAME link, never two.';

-- APPSEC F4 · one logical request = one link. This index IS the concurrency
-- control; the check-then-insert it replaces was a race, not a guarantee.
create unique index if not exists idx_share_link_mint_request_key
  on public.share_link (mint_request_key);

comment on column public.share_link.token_hash is
  'sha256 hex of the opaque bearer token. The token itself is NEVER stored. 32 random bytes, base64url, returned to the minter once.';
comment on column public.share_link.expiry is
  'NULL means ENDLESS — a deliberate choice, not a missing value. Enforced paired with expiry_kind by share_link_expiry_kind_check.';
comment on column public.share_link.audience is
  'One of the six recipient policies: booker · producer · private · programmer · brand · rep. One link = one audience = one version.';

update public.share_link
   set expiry_kind = case when expiry is null then 'endless' else 'date' end
 where expiry_kind is null;

-- Default 'endless' matches the common case (a link with no end date). NOTE:
-- an INSERT that sets `expiry` but leaves `expiry_kind` to the default is
-- REFUSED by share_link_expiry_kind_check — deliberately fail-closed, so a
-- dated link can never masquerade as endless. Every writer sets both
-- (mint_share_link() and the server mint route already do).
alter table public.share_link alter column expiry_kind set default 'endless';

do $$ begin
  alter table public.share_link
    add constraint share_link_expiry_kind_check
    check (
      expiry_kind is null
      or (expiry_kind = 'endless' and expiry is null)
      or (expiry_kind = 'date'    and expiry is not null)
    );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.share_link
    add constraint share_link_audience_check
    check (audience is null or audience in ('booker','producer','private','programmer','brand','rep'));
exception when duplicate_object then null; end $$;

-- APPSEC F3 · DISCLOSURE IS A PRECONDITION OF EXISTENCE, NOT A UI STEP.
-- PUB4 (024:23) says a link that measures opens may not be sent until the
-- artist has been told it does. That rule lived in the server route only, and
-- the SQL RPC hardcoded tracking_disclosed=false — so the RPC path minted
-- undisclosed links while the route refused them. The rule belongs to the
-- TABLE: no mint path (RPC, server route, service role, psql) can write a
-- share_link row that is not disclosed.
-- NOT VALID deliberately — see P5: new writes are refused from this statement
-- onward; pre-existing rows (P3: there are none) are not re-validated, so the
-- apply cannot fail on legacy data.
do $$ begin
  alter table public.share_link
    add constraint share_link_tracking_disclosed_check
    check (tracking_disclosed is true) not valid;
exception when duplicate_object then null; end $$;

-- One hash = one link. Unique AND the index the resolver seeks on.
create unique index if not exists idx_share_link_token_hash
  on public.share_link (token_hash);

-- Status vocabulary widened by the repo's drop-and-re-add-with-the-full-list
-- pattern (034:4, 040:22), retaining every legacy value the way 027:206-210 did.
-- 'active' is RETAINED as the legacy synonym of 'live' — existing rows are not
-- rewritten, and both are treated as live by the resolver.
alter table public.share_link drop constraint if exists share_link_status_check;
alter table public.share_link add constraint share_link_status_check
  check (status in (
    'active',          -- legacy (024 default) — same meaning as 'live'
    'live',
    'expired',         -- the clock ran out
    'revoked',         -- the artist withdrew authority
    'replaced',        -- a newer link supersedes this one
    'unpublished',     -- the act pulled the whole Passport
    'withdrawn',       -- the bound version was withdrawn
    'wrong_recipient'  -- the recipient declared this is not them
  ));

-- ──────────────────────────────────────────────────────────────────────────
-- A3 · share_link_event — append-only receipts (mint · open · revoke · expire)
-- ──────────────────────────────────────────────────────────────────────────
-- WHY A SEPARATE TABLE: share_link.opened_at/open_count (024) are a mutable
-- summary. A summary cannot answer "was this link ever opened after it was
-- revoked", cannot be replayed, and cannot be audited. Receipts can.
-- IDEMPOTENCY: every write carries an idempotency_key. A replayed open (double
-- tap, retried fetch, a proxy prefetch) collides on idx_sle_idempotent and is a
-- no-op — the same receipt, never a second one.
create table if not exists public.share_link_event (
  id              uuid primary key default gen_random_uuid(),
  share_link_id   uuid not null references public.share_link(id) on delete cascade,
  event           text not null check (event in (
                    'minted','opened','revoked','expired','replaced','wrong_recipient_declared')),
  -- Caller-supplied, deterministic. Open: hash of (link, session, coarse time
  -- bucket). Mint: hash of the mint request. Never a PII value.
  idempotency_key text not null,
  occurred_at     timestamptz not null default now(),
  -- Method-safe detail only: outcome key, audience, coarse UA class. NEVER a
  -- count, a score, or anything that returns to the artist as a number.
  detail          jsonb
);

create unique index if not exists idx_sle_idempotent
  on public.share_link_event (share_link_id, event, idempotency_key);
create index if not exists idx_sle_link_time
  on public.share_link_event (share_link_id, occurred_at desc);

alter table public.share_link_event enable row level security;

-- Append-only by construction: an INSERT policy and a SELECT policy exist; no
-- UPDATE policy and no DELETE policy are ever created, so RLS refuses both.
-- Writes arrive through the SECURITY DEFINER functions below (or the service
-- role), never from an anonymous client directly.
drop policy if exists sle_owner_insert on public.share_link_event;
create policy sle_owner_insert on public.share_link_event
  for insert with check (
    exists (select 1 from public.share_link sl
             where sl.id = share_link_id and public.can_access_artist(sl.artist_id))
  );

-- READ IS OPERATOR-ONLY. This is a firewall decision, not an oversight: canon
-- says a link row shows the artist DELIVERY and EXPIRY only — never how many
-- times a buyer opened it. The artist-facing projection is share_link_delivery_v.
drop policy if exists sle_operator_read on public.share_link_event;
create policy sle_operator_read on public.share_link_event
  for select using (public.is_operator());

-- APPSEC F1 · anon holds Supabase's default table grants, so spell out the
-- whole surface: a receipt is never read, written, edited or deleted by an
-- anonymous caller directly. The ONLY anon write path is
-- record_share_link_open(), which is SECURITY DEFINER and inserts as the owner.
revoke select, insert, update, delete on public.share_link_event from anon;

-- ──────────────────────────────────────────────────────────────────────────
-- A4 · share_link_delivery_v — the ONLY artist-facing projection of a link
-- ──────────────────────────────────────────────────────────────────────────
-- Delivery + expiry. No opened_at, no open_count, no event count, no derived
-- "engagement" anything. A reaction is a reaction (019); an open is not one.
-- security_invoker = true is NOT optional here: a view created by the postgres
-- role otherwise runs with the OWNER's rights and would hand every caller
-- every artist's links, bypassing share_link's RLS entirely. With it, the
-- existing sl_org_all / sl_operator_read policies still decide who sees what.
create or replace view public.share_link_delivery_v
  with (security_invoker = true) as
  select sl.id,
         sl.act_id,
         sl.artist_id,
         sl.passport_version_id,
         sl.recipient_label,
         sl.audience,
         sl.purpose,
         sl.status,
         sl.expiry,
         sl.expiry_kind,
         sl.revoked_at,
         sl.replaced_by,
         sl.tracking_disclosed,
         sl.created_at
    from public.share_link sl;

comment on view public.share_link_delivery_v is
  'Artist-facing link list: delivery and expiry ONLY. open_count/opened_at are deliberately absent (firewall: no counts return to the artist).';

revoke all on public.share_link_delivery_v from anon;

-- ──────────────────────────────────────────────────────────────────────────
-- A5 · resolve_share_link() — the ONLY anonymous read path (SECURITY DEFINER)
-- ──────────────────────────────────────────────────────────────────────────
-- Read-only. Takes the sha256 hex of the presented token. Returns exactly ONE
-- typed outcome. On any dead outcome it returns the reason AND NOTHING ELSE —
-- no act name, no version id, no snapshot. A dead link must not leak the thing
-- it used to open.
--
-- Outcome vocabulary is the contract shared with src/lib/shareLink.js:
--   ok · not_found · expired · revoked · superseded_not_permitted · wrong_recipient
-- ('replaced' and 'unpublished' collapse into revoked/not_found deliberately —
--  the six outcomes above are the typed surface the client renders.)
create or replace function public.resolve_share_link(p_token_hash text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  sl  public.share_link%rowtype;
  pv  public.passport_versions%rowtype;
begin
  if p_token_hash is null or length(p_token_hash) <> 64 then
    return jsonb_build_object('outcome','not_found');
  end if;

  select * into sl from public.share_link where token_hash = p_token_hash;
  if not found then
    return jsonb_build_object('outcome','not_found');
  end if;

  if sl.status = 'wrong_recipient' or sl.wrong_recipient_at is not null then
    return jsonb_build_object('outcome','wrong_recipient');
  end if;
  if sl.status in ('revoked','replaced','unpublished','withdrawn') or sl.revoked_at is not null then
    return jsonb_build_object('outcome','revoked');
  end if;
  if sl.status = 'expired' or (sl.expiry is not null and sl.expiry <= now()) then
    return jsonb_build_object('outcome','expired');
  end if;
  if sl.status not in ('active','live') then
    return jsonb_build_object('outcome','revoked');
  end if;

  select * into pv from public.passport_versions where id = sl.passport_version_id;
  if not found then
    return jsonb_build_object('outcome','not_found');
  end if;

  -- A superseded version stays reachable ONLY through the live link that binds
  -- it — that is the whole point of binding one immutable version. It becomes
  -- unreachable the moment the link stops being live (handled above). What is
  -- refused here is a version that was WITHDRAWN or never published at all.
  if pv.state is not null and pv.state not in ('published','superseded') then
    return jsonb_build_object('outcome','superseded_not_permitted');
  end if;

  return jsonb_build_object(
    'outcome',             'ok',
    'share_link_id',       sl.id,
    'passport_version_id', pv.id,
    'version_no',          pv.version_no,
    'version_state',       pv.state,
    'audience',            coalesce(sl.audience, pv.audience),
    'act_id',              coalesce(sl.act_id, pv.act_id),
    'expiry',              sl.expiry,
    'snapshot',            pv.snapshot
  );
end $$;

-- APPSEC F1 · `from public` alone is not a revoke on Supabase: the platform's
-- default privileges hand anon/authenticated/service_role their OWN explicit
-- EXECUTE grant on every new function in `public`. Revoke all four, then grant
-- back the minimum. anon is genuinely needed here — this is the door a
-- recipient with a token walks through, and they have no account.
revoke all on function public.resolve_share_link(text) from public, anon, authenticated, service_role;
grant execute on function public.resolve_share_link(text) to anon, authenticated, service_role;

-- ──────────────────────────────────────────────────────────────────────────
-- A6 · record_share_link_open() — replay-safe receipt (SECURITY DEFINER)
-- ──────────────────────────────────────────────────────────────────────────
-- Separate from the resolver so resolution stays read-only and a measurement
-- failure can never block a recipient from reading. Returns true when a NEW
-- receipt was written, false when the call was a replay. Never raises.
create or replace function public.record_share_link_open(p_token_hash text, p_idempotency_key text)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_link uuid;
  v_rows integer := 0;
  v_new  boolean := false;
begin
  if p_token_hash is null or p_idempotency_key is null then return false; end if;

  select id into v_link from public.share_link
   where token_hash = p_token_hash
     and status in ('active','live')
     and revoked_at is null
     and wrong_recipient_at is null
     and (expiry is null or expiry > now());
  if v_link is null then return false; end if;   -- a dead link records nothing

  insert into public.share_link_event (share_link_id, event, idempotency_key, detail)
  values (v_link, 'opened', p_idempotency_key, jsonb_build_object('via','resolve_share_link'))
  on conflict (share_link_id, event, idempotency_key) do nothing;
  get diagnostics v_rows = row_count;
  v_new := (v_rows > 0);   -- 0 rows = the receipt already existed = a replay

  -- The 024 summary columns stay maintained for compatibility, but ONLY on a
  -- genuinely new receipt — a replay must not inflate anything. Neither column
  -- is exposed to the artist (share_link_delivery_v omits both).
  if v_new then
    update public.share_link
       set opened_at = coalesce(opened_at, now()),
           open_count = open_count + 1
     where id = v_link;
  end if;
  return v_new;
end $$;

-- APPSEC F1 · same four-role revoke. anon is needed: the receipt is written by
-- the same anonymous recipient who just resolved the token.
revoke all on function public.record_share_link_open(text, text) from public, anon, authenticated, service_role;
grant execute on function public.record_share_link_open(text, text) to anon, authenticated, service_role;

-- ──────────────────────────────────────────────────────────────────────────
-- A7 · mint_share_link() — ATOMICALLY idempotent (SECURITY DEFINER, owner/org)
-- ──────────────────────────────────────────────────────────────────────────
-- The raw token never enters this function — only its hash; the caller is the
-- only place the raw token ever exists.
--
-- APPSEC F3 · DISCLOSURE. p_tracking_disclosed is REQUIRED and must be true.
-- The previous draft hardcoded tracking_disclosed=false here, which both
-- bypassed PUB4 and made this RPC a way around the server route's gate. The
-- refusal is typed: message 'tracking_disclosure_required', SQLSTATE GP403 —
-- the same vocabulary src/lib/shareLink.js exports as MINT_REFUSAL, so all
-- three mint paths refuse with ONE word.
--
-- APPSEC F4 · IDEMPOTENCY IS NOW ATOMIC. The previous draft did
--   select ... from share_link_event where idempotency_key = ...;  -- check
--   if not found then insert into share_link ...                   -- then insert
-- Two concurrent mints of the SAME logical request both saw "not found" and
-- both minted: two live bearer credentials to one person's evidence, one of
-- which nobody knows exists. The check-then-insert is replaced by a single
-- INSERT ... ON CONFLICT (mint_request_key) DO UPDATE ... RETURNING: the loser
-- of the race blocks on the unique index and then returns the WINNER's row.
-- Exactly one link, whatever the concurrency.
--
-- APPSEC F4 · THE RECEIPT IS PART OF THE MINT, NOT A BEST-EFFORT AFTERTHOUGHT.
-- `on conflict do nothing` on the mint receipt meant a link could exist with no
-- record of who minted it or why. A mint whose receipt does not land now RAISES
-- (SQLSTATE GP500) and the whole function — link row included — rolls back.
create or replace function public.mint_share_link(
  p_passport_version_id uuid,
  p_token_hash          text,
  p_audience            text,
  p_recipient_label     text,
  p_purpose             text,
  p_expiry              timestamptz,
  p_idempotency_key     text,
  p_tracking_disclosed  boolean
) returns uuid
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_artist uuid;
  v_act    uuid;
  v_id     uuid;
  v_hash   text;
  v_rows   integer := 0;
begin
  select artist_id, act_id into v_artist, v_act
    from public.passport_versions where id = p_passport_version_id;
  if v_artist is null then raise exception 'unknown passport_version %', p_passport_version_id; end if;
  if not public.can_access_artist(v_artist) then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_token_hash is null or length(p_token_hash) <> 64 then
    raise exception 'token_hash_invalid' using errcode = 'GP422';
  end if;
  if p_idempotency_key is null or length(btrim(p_idempotency_key)) = 0 then
    raise exception 'idempotency_key_required' using errcode = 'GP422';
  end if;
  -- F3: missing (null) is refused exactly like false. Fail closed.
  if p_tracking_disclosed is distinct from true then
    raise exception 'tracking_disclosure_required' using errcode = 'GP403',
      hint = 'PUB4: the artist must be told the link measures opens BEFORE it is minted.';
  end if;

  -- ONE statement decides "new link" vs "replay". The DO UPDATE is a deliberate
  -- no-op touch of the conflicting row: it is the only way ON CONFLICT can
  -- RETURN the row that already won.
  insert into public.share_link (
    passport_version_id, artist_id, act_id, recipient_label, purpose, audience,
    token_hash, expiry, expiry_kind, status, created_by, tracking_disclosed,
    mint_request_key
  ) values (
    p_passport_version_id, v_artist, v_act, p_recipient_label, p_purpose, p_audience,
    p_token_hash, p_expiry, case when p_expiry is null then 'endless' else 'date' end,
    'live', auth.uid(), true,
    p_idempotency_key
  )
  on conflict (mint_request_key) do update
    set mint_request_key = public.share_link.mint_request_key
  returning id, token_hash into v_id, v_hash;

  -- The row we got back carries OUR token hash ⇔ this call is the one that
  -- minted it. Anything else is a replay (or the loser of a race), and a replay
  -- writes no second receipt and never re-issues a credential.
  if v_hash is distinct from p_token_hash then
    return v_id;
  end if;

  insert into public.share_link_event (share_link_id, event, idempotency_key, detail)
  values (v_id, 'minted', p_idempotency_key,
          jsonb_build_object('audience', p_audience, 'tracking_disclosed', true));
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'mint_receipt_failed' using errcode = 'GP500',
      hint = 'A link with no mint receipt is unauditable — the mint is refused, not degraded.';
  end if;

  return v_id;
end $$;

-- APPSEC F1 · Supabase's default privileges grant EXECUTE to anon,
-- authenticated and service_role as well as PUBLIC. Revoke all four, then grant
-- back only the roles with a real caller.
revoke all on function public.mint_share_link(uuid, text, text, text, text, timestamptz, text, boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.mint_share_link(uuid, text, text, text, text, timestamptz, text, boolean)
  to authenticated, service_role;

-- If an earlier draft of this file was applied, its 7-arg overload would still
-- be callable AND would still mint with tracking_disclosed=false. Remove it.
drop function if exists public.mint_share_link(uuid, text, text, text, text, timestamptz, text);

-- ──────────────────────────────────────────────────────────────────────────
-- A8 · revoke_share_link() — future authority stops, history stays
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.revoke_share_link(p_share_link_id uuid, p_idempotency_key text default null)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_artist uuid;
begin
  select artist_id into v_artist from public.share_link where id = p_share_link_id;
  if v_artist is null then return false; end if;
  if not public.can_access_artist(v_artist) then raise exception 'forbidden'; end if;

  update public.share_link
     set status = 'revoked', revoked_at = coalesce(revoked_at, now())
   where id = p_share_link_id and status <> 'revoked';

  insert into public.share_link_event (share_link_id, event, idempotency_key, detail)
  values (p_share_link_id, 'revoked',
          coalesce(p_idempotency_key, 'revoke:' || p_share_link_id::text), '{}'::jsonb)
  on conflict (share_link_id, event, idempotency_key) do nothing;
  return true;
end $$;

-- APPSEC F1 · four-role revoke, then the minimum. anon may NEVER revoke a link:
-- withdrawal of authority is an act of the artist/org, not of a bearer.
revoke all on function public.revoke_share_link(uuid, text) from public, anon, authenticated, service_role;
grant execute on function public.revoke_share_link(uuid, text) to authenticated, service_role;

-- ============================================================
-- ██ END OF PART A. Everything above is additive and reversible. ██
-- ============================================================


-- ============================================================
-- ██ PART B — THE BREAKING HALF · DO NOT RUN WITH PART A ████████████████████
-- ============================================================
-- This block is FENCED IN A COMMENT ON PURPOSE. Applying this file top to
-- bottom performs the additive half ONLY. To perform the breaking half, copy
-- the block below (without the leading `-- `), satisfy step 2 of the apply
-- order (mint links for anyone who must keep access), and run it as ONE
-- transaction — the BEGIN/COMMIT is part of the block so a failed CREATE
-- POLICY rolls back the DROP POLICY that precedes it.
--
-- WHAT IT DOES: replaces `pv_public_read` (001:209-210, "anon may read every
-- snapshot of any published artist") with two policies —
--   pv_share_link_read  — anon may read EXACTLY the version bound by a LIVE
--                         share link (not expired, not revoked, not replaced,
--                         not wrong-recipient).
--   pv_org_history_read — the owner/org keeps the FULL governed history,
--                         including superseded versions.
--   pv_operator_read    — operator retains read for support/audit.
-- Verify after running (as anon, i.e. with the anon key, RLS on):
--   select count(*) from passport_versions;                    -- expect 0
--   select resolve_share_link('<sha256 hex of a live token>');  -- expect ok
--   select resolve_share_link('<sha256 hex of a revoked token>');-- expect revoked
--
-- ─────────────────── COPY FROM HERE ───────────────────
-- begin;
--
-- drop policy if exists pv_public_read on public.passport_versions;
--
-- -- ANON: one live link ⇒ one version. Nothing else, ever.
-- create policy pv_share_link_read on public.passport_versions
--   for select using (
--     exists (
--       select 1 from public.share_link sl
--        where sl.passport_version_id = passport_versions.id
--          and sl.status in ('active','live')
--          and sl.revoked_at is null
--          and sl.wrong_recipient_at is null
--          and (sl.expiry is null or sl.expiry > now())
--     )
--   );
--
-- -- OWNER / ORG: the full governed history stays readable to the people who
-- -- own it — that is the point of "owners retain governed history".
-- create policy pv_org_history_read on public.passport_versions
--   for select using (public.can_access_artist(artist_id));
--
-- -- OPERATOR: support and audit.
-- create policy pv_operator_read on public.passport_versions
--   for select using (public.is_operator());
--
-- commit;
-- ─────────────────── COPY TO HERE ───────────────────
--
-- ROLLBACK OF PART B ALONE (restores 001:209-210 verbatim):
--   begin;
--     drop policy if exists pv_share_link_read  on public.passport_versions;
--     drop policy if exists pv_org_history_read on public.passport_versions;
--     drop policy if exists pv_operator_read    on public.passport_versions;
--     create policy pv_public_read on public.passport_versions
--       for select using (public.artist_is_published(artist_id));
--   commit;
-- ============================================================
