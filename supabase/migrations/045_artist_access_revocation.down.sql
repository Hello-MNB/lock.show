-- DOWN 045 — remove the revocation lifecycle and the shared trust helper.
-- 046 consumes artist_access_trusted_writer(), so 046 must be reverted first.
-- PRECONDITION. Reverting 045 while 046 is still installed BRICKS the table: the
-- guard trigger calls artist_access_trusted_writer(), which this file drops. Both
-- files report success and the damage surfaces only at the next write —
--   ERROR: function public.artist_access_trusted_writer() does not exist
-- Independent QA reproduced exactly that. The rule was previously stated in a
-- comment and enforced by nothing. Refuse, and destroy nothing.
do $$
begin
  if exists (select 1 from pg_trigger where tgname = 'trg_artist_access_guard_authority') then
    raise exception 'cannot roll back 045: migration 046''s guard calls artist_access_trusted_writer(). Revert 046 first.'
      using errcode = '2BP01';
  end if;
end $$;

drop trigger if exists trg_artist_access_fill_revoked_at on public.artist_access;
drop function if exists public.artist_access_fill_revoked_at();
drop function if exists public.artist_access_trusted_writer();
alter table public.artist_access drop constraint if exists artist_access_revoked_at_check;
