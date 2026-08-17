-- DOWN 046 — remove the authority guard. Reverting this RE-OPENS the grantee's
-- ability to write their own authority columns; it is safe only because 047's
-- decision function is gone by then (down files run newest-first).
drop trigger if exists trg_artist_access_guard_authority on public.artist_access;
drop function if exists public.artist_access_guard_authority();
drop function if exists public.act_belongs_to_artist(uuid, uuid);
