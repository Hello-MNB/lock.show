-- ============================================================
-- LOCK — 041 DOWN: undo the link service + passport version store.
--
-- ORDER MATTERS AND IS THE REVERSE OF THE APPLY ORDER.
--   D1 runs FIRST and restores `pv_public_read` verbatim from 001:209-210.
--      If only PART B was applied, D1 alone is the complete rollback — stop
--      after it and leave PART A in place (PART A is inert without a caller).
--   D2..D6 remove PART A. Run them ONLY if the whole migration is being
--      backed out.
--
-- ── TRANSACTIONALITY (F6) ───────────────────────────────────────────────────
-- TWO explicit transactions, not one, and not zero:
--   · D1 is its own BEGIN/COMMIT because D1 alone is a COMPLETE and VALID
--     rollback (the "stop here" case below). Folding it into one giant
--     transaction with D2..D6 would make that documented stopping point
--     impossible to take.
--   · D2..D6 are ONE BEGIN/COMMIT. They drop functions, a view, a table, two
--     triggers, eight + eight columns and five indexes, and rewrite a CHECK
--     constraint. A partial failure anywhere in that sequence would leave the
--     schema half-reverted — e.g. share_link.token_hash dropped but
--     resolve_share_link() still present and now referencing a column that
--     does not exist, so every resolver call raises at runtime instead of
--     returning a typed outcome. Wrapping them makes "half-reverted" an
--     unreachable state: either the whole additive half is gone or none of it
--     is. Postgres runs DDL transactionally, so this genuinely holds.
--
-- ── IDEMPOTENCE (F6) ────────────────────────────────────────────────────────
-- Every statement is guarded: DROP ... IF EXISTS, ADD CONSTRAINT inside a
-- duplicate_object handler, and a to_regclass() precondition check at the head
-- of each transaction so running this file against a database where 041 was
-- never applied (or was already reverted) is a NOTICE and a no-op, never an
-- error. Running it twice produces the same schema as running it once.
--
-- DATA LOSS WARNING (read before running D2):
--   Dropping share_link.token_hash DESTROYS every minted link — the raw tokens
--   were never stored (by design), so the hashes cannot be recomputed and every
--   link already in a recipient's inbox becomes permanently dead. Dropping
--   share_link_event destroys the mint/open/revoke receipts. Neither is
--   recoverable. If the intent is only "turn the feature off", set
--   SHARE_LINK_SERVICE_ENABLED to unset instead and run D1 only.
--
--   passport_versions rows are NOT deleted by anything here. Only the columns
--   041 added are dropped; snapshots, ids and created_at are untouched.
--   NOTE: the 041 backfill wrote `state`/`version_no`/`published_at`/
--   `superseded_at` onto existing rows and D6 drops those columns, so that
--   derived lineage is discarded on the way down. The snapshots it described
--   are not.
-- ============================================================

-- ── D1 · restore the 001 anon read policy (undoes PART B) ───────────────────
begin;

do $$
begin
  if to_regclass('public.passport_versions') is null then
    raise notice '041 down D1: public.passport_versions does not exist — nothing to revert.';
    return;
  end if;

  drop policy if exists pv_share_link_read  on public.passport_versions;
  drop policy if exists pv_org_history_read on public.passport_versions;
  drop policy if exists pv_operator_read    on public.passport_versions;
  drop policy if exists pv_public_read      on public.passport_versions;

  -- VERBATIM from 001_initial_schema.sql:209-211. Do not "improve" this text:
  -- the whole point of a down migration is that the restored policy is
  -- byte-for-byte the one that existed before 041 touched anything.
  create policy pv_public_read on public.passport_versions
    for select using (public.artist_is_published(artist_id));
end $$;

commit;

-- ══ STOP HERE if you are only rolling back the breaking half. ══


-- ── D2..D6 · remove PART A. ONE transaction: all of it, or none of it. ──────
begin;

do $$
begin
  if to_regclass('public.share_link') is null
     or to_regclass('public.passport_versions') is null then
    raise notice '041 down D2..D6: base tables absent — nothing to revert.';
    return;
  end if;

  -- ── D2 · functions ────────────────────────────────────────────────────────
  drop function if exists public.revoke_share_link(uuid, text);
  -- BOTH mint signatures. The F3/F4 repair changed mint_share_link() from 7 args
  -- to 8 (p_tracking_disclosed). If a target DB ever ran the 7-arg draft, the two
  -- overloads coexist and dropping only one would leave a live entry point that
  -- mints links with no disclosure. Drop the old one first, then the current one.
  drop function if exists public.mint_share_link(uuid, text, text, text, text, timestamptz, text);
  drop function if exists public.mint_share_link(uuid, text, text, text, text, timestamptz, text, boolean);
  drop function if exists public.record_share_link_open(text, text);
  drop function if exists public.resolve_share_link(text);

  -- ── D3 · artist-facing projection + receipts ──────────────────────────────
  -- The view must go BEFORE the columns it selects; the table must go BEFORE
  -- share_link, which it references.
  drop view  if exists public.share_link_delivery_v;
  drop table if exists public.share_link_event;   -- receipts are lost; see warning

  -- ── D4 · share_link columns + constraints (restores the 024 vocabulary) ───
  drop index if exists public.idx_share_link_token_hash;
  -- F3/F4 additions: the atomic-mint identity and the disclosure gate.
  drop index if exists public.idx_share_link_mint_request_key;
  alter table public.share_link drop constraint if exists share_link_tracking_disclosed_check;
  alter table public.share_link drop constraint if exists share_link_expiry_kind_check;
  alter table public.share_link drop constraint if exists share_link_audience_check;

  -- Any row still carrying a 041-only status must be normalised before the 024
  -- CHECK can be restored, or the ADD CONSTRAINT fails. Both UPDATEs are
  -- no-ops on a second run.
  update public.share_link set status = 'active'  where status = 'live';
  update public.share_link set status = 'revoked'
   where status in ('replaced','unpublished','withdrawn','wrong_recipient');

  alter table public.share_link drop constraint if exists share_link_status_check;
  -- VERBATIM from 024_measurement_and_share.sql:30.
  alter table public.share_link add constraint share_link_status_check
    check (status in ('active','expired','revoked'));

  -- ALTER COLUMN ... DROP DEFAULT has no IF EXISTS form and raises on a column
  -- that is already gone — which is exactly the second-run and never-applied
  -- case. Guard it explicitly; everything around it is already guarded.
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'share_link'
                and column_name = 'expiry_kind') then
    alter table public.share_link alter column expiry_kind drop default;
  end if;

  alter table public.share_link
    drop column if exists token_hash,
    drop column if exists mint_request_key,
    drop column if exists audience,
    drop column if exists purpose,
    drop column if exists revoked_at,
    drop column if exists created_by,
    drop column if exists expiry_kind,
    drop column if exists replaced_by,
    drop column if exists wrong_recipient_at;

  -- ── D4b · the Act-ownership predicate on pv_owner_insert ──────────────────
  -- 041 tightened `pv_owner_insert` so a version can only enter a lineage its
  -- writer owns (QA-INDEP-06, H1). Rolling 041 back must put the policy back the
  -- way 017 left it, and must take the helper with it — otherwise the catalog
  -- diff after a down run shows a policy that no migration in the tree defines
  -- and a function nothing calls, which is exactly what R2 caught.
  --
  -- VERBATIM from 017_owner_publish_snapshot.sql:17-19, and note what is NOT
  -- there: no `to` clause. 017 created this policy for PUBLIC, and recreating it
  -- `to authenticated` would silently narrow it on rollback — the same defect
  -- 047's revert function already carries a comment about.
  drop policy if exists pv_owner_insert on public.passport_versions;
  create policy pv_owner_insert on public.passport_versions for insert
    with check (public.can_access_artist(artist_id));
  -- The policy first, the function it calls second: a drop in the other order
  -- fails while the policy still references it.
  drop function if exists public.pv_act_in_artist_lineage(uuid, uuid);

  -- ── D5 · passport_versions triggers ───────────────────────────────────────
  -- Triggers before their functions, and the supersession trigger before the
  -- columns it writes (D6) — otherwise the column drops fire it.
  drop trigger  if exists trg_pv_supersede on public.passport_versions;
  drop function if exists public.pv_supersede_previous();
  drop trigger  if exists trg_pv_immutable on public.passport_versions;
  drop function if exists public.pv_guard_immutable();
  drop trigger  if exists trg_pv_defaults  on public.passport_versions;
  drop function if exists public.pv_fill_defaults();

  -- ── D6 · passport_versions columns + indexes ──────────────────────────────
  -- idx_pv_one_published / idx_pv_act_version_no are EXPRESSION indexes after
  -- the F5 repair (COALESCE keys). DROP INDEX IF EXISTS removes them by name
  -- regardless of which shape is installed, so this reverts both the original
  -- bare-column draft and the repaired expression form.
  drop index if exists public.idx_pv_one_published;
  drop index if exists public.idx_pv_act_version_no;
  drop index if exists public.idx_pv_state;
  alter table public.passport_versions drop constraint if exists passport_versions_state_check;
  alter table public.passport_versions drop constraint if exists passport_versions_audience_check;
  alter table public.passport_versions
    drop column if exists version_no,
    drop column if exists state,
    drop column if exists supersedes_id,
    drop column if exists published_at,
    drop column if exists superseded_at,
    drop column if exists created_by,
    drop column if exists content_hash,
    drop column if exists audience;
end $$;

commit;
