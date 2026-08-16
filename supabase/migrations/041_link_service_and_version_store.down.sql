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
-- ============================================================

-- ── D1 · restore the 001 anon read policy (undoes PART B) ───────────────────
begin;
drop policy if exists pv_share_link_read  on public.passport_versions;
drop policy if exists pv_org_history_read on public.passport_versions;
drop policy if exists pv_operator_read    on public.passport_versions;
drop policy if exists pv_public_read      on public.passport_versions;
create policy pv_public_read on public.passport_versions
  for select using (public.artist_is_published(artist_id));
commit;

-- ══ STOP HERE if you are only rolling back the breaking half. ══


-- ── D2 · functions ──────────────────────────────────────────────────────────
drop function if exists public.revoke_share_link(uuid, text);
drop function if exists public.mint_share_link(uuid, text, text, text, text, timestamptz, text);
drop function if exists public.record_share_link_open(text, text);
drop function if exists public.resolve_share_link(text);

-- ── D3 · artist-facing projection + receipts ────────────────────────────────
drop view  if exists public.share_link_delivery_v;
drop table if exists public.share_link_event;   -- receipts are lost; see warning

-- ── D4 · share_link columns + constraints (restores the 024 status vocabulary)
drop index if exists public.idx_share_link_token_hash;
alter table public.share_link drop constraint if exists share_link_expiry_kind_check;
alter table public.share_link drop constraint if exists share_link_audience_check;
-- Any row still carrying a 041-only status must be normalised before the 024
-- CHECK can be restored, or the ADD CONSTRAINT fails.
update public.share_link set status = 'active'  where status = 'live';
update public.share_link set status = 'revoked' where status in ('replaced','unpublished','withdrawn','wrong_recipient');
alter table public.share_link drop constraint if exists share_link_status_check;
alter table public.share_link add constraint share_link_status_check
  check (status in ('active','expired','revoked'));
alter table public.share_link alter column expiry_kind drop default;
alter table public.share_link
  drop column if exists token_hash,
  drop column if exists audience,
  drop column if exists purpose,
  drop column if exists revoked_at,
  drop column if exists created_by,
  drop column if exists expiry_kind,
  drop column if exists replaced_by,
  drop column if exists wrong_recipient_at;

-- ── D5 · passport_versions triggers ─────────────────────────────────────────
drop trigger  if exists trg_pv_immutable on public.passport_versions;
drop function if exists public.pv_guard_immutable();
drop trigger  if exists trg_pv_defaults  on public.passport_versions;
drop function if exists public.pv_fill_defaults();

-- ── D6 · passport_versions columns + indexes ────────────────────────────────
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
