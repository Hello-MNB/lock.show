-- ============================================================
-- CANDIDATE — NOT A MIGRATION, NOT APPLIED ANYWHERE.
-- Residual (c): sl_org_all (024:43) is `for all using can_access_artist(artist_id)`,
-- so the artist's own organization — and every organization holding a grant on
-- that artist — reads public.share_link DIRECTLY, including open_count and
-- opened_at. Migration 041 built share_link_delivery_v as "the ONLY artist-facing
-- projection of a link" and deliberately left those two columns out of it, but a
-- projection nobody is forced through is a suggestion. Executed, before:
--     owner  select open_count from share_link → 7
--     ORG_A  select open_count from share_link → 7
--
-- WHY A COLUMN GRANT AND NOT A POLICY. RLS chooses ROWS. It cannot choose
-- COLUMNS. The firewall this repo already uses for exactly this problem is the
-- 016/025 pattern — revoke the table-wide SELECT, re-grant an explicit column
-- list — and it is what makes claims.internal_confidence and gigs.exact_count
-- physically un-SELECTable rather than merely unselected.
--
-- WHY NOT `revoke select (open_count) ...` ALONE. It is a NO-OP here and that
-- is a trap worth recording: PostgreSQL cannot revoke a column privilege that
-- is held at table level, and Supabase's default privileges grant SELECT on the
-- whole table. Executed: the column-only revoke ran without error and
-- open_count stayed readable. Only revoke-then-regrant works.
--
-- THE COLUMN LIST IS share_link_delivery_v's OWN PROJECTION, exactly — so the
-- sanctioned view becomes the practical maximum instead of a parallel option.
-- Deliberately NOT granted: open_count, opened_at (the firewall — no counts
-- return to the artist), token_hash (the link secret's digest), mint_request_key
-- (an idempotency key), utm_* and context (working-only), wrong_recipient_at.
--
-- PROVEN BY THE GATE, EXECUTED: after this, the owner and every grant-holder are
-- denied open_count/opened_at/token_hash and `select *`; share_link_delivery_v
-- still resolves for the owner and still returns nothing to a no-grant
-- organization; minting, revoking and inserting links still work; service_role
-- (the server) is untouched; resolve_share_link()/record_share_link_open() are
-- SECURITY DEFINER and run as the owner, so the anonymous recipient door and the
-- open receipt are unaffected.
--
-- APPLIES ON TOP OF 041. Pre-041 the columns audience, purpose, expiry_kind,
-- revoked_at and replaced_by do not exist; drop them from the list to run this
-- against a 024-only database.
--
-- OWNER DECISION REQUIRED: this makes `select *` on share_link fail for every
-- authenticated caller. That is the point (016 did the same to artists for anon),
-- but any future lane writing .select('*') on share_link will break loudly
-- rather than leak quietly, and the owner should want that on the record.
-- ============================================================

revoke select on public.share_link from authenticated;

grant select (
  id, act_id, artist_id, passport_version_id, recipient_label, audience,
  purpose, status, expiry, expiry_kind, revoked_at, replaced_by,
  tracking_disclosed, created_at
) on public.share_link to authenticated;
