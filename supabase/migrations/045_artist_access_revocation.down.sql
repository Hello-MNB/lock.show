-- DOWN 045 — remove the revocation lifecycle and the shared trust helper.
-- 046 consumes artist_access_trusted_writer(), so 046 must be reverted first.
drop trigger if exists trg_artist_access_fill_revoked_at on public.artist_access;
drop function if exists public.artist_access_fill_revoked_at();
drop function if exists public.artist_access_trusted_writer();
alter table public.artist_access drop constraint if exists artist_access_revoked_at_check;
