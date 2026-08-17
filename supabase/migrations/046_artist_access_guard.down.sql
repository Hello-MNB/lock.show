-- PRECONDITION, hoisted here on purpose. Down files run newest-first, and the only
-- refusal that can abort a legitimate rollback lives in 044.down — by which point
-- THIS file has already committed and the guard is gone. Independent QA reproduced
-- the consequence: an operator told "refused, nothing was destroyed" was left with
-- the authority columns still present and the guard removed, and could then
-- self-issue publish scope and a ten-year expiry. A refused rollback must not leave
-- the database in a LESS safe state than it started, so the blocking condition is
-- evaluated before the first security control is dropped.
do $$
declare n integer;
begin
  select count(*) into n from (
    select organization_id, artist_id
      from public.artist_access
     group by organization_id, artist_id
    having count(*) > 1) d;
  if n > 0 then
    raise exception
      'cannot roll back: % (organization, artist) pair(s) hold more than one grant, which only Act-scoped grants allow. 044 will refuse later in the sequence, so this refuses FIRST — the guard is still in place. Consolidate to one row per (organization, artist), then retry.', n
      using errcode = '23505';
  end if;
end $$;

-- DOWN 046 — remove the authority guard. Reverting this RE-OPENS the grantee's
-- ability to write their own authority columns; it is safe only because 047's
-- decision function is gone by then (down files run newest-first).
drop trigger if exists trg_artist_access_guard_authority on public.artist_access;
drop function if exists public.artist_access_guard_authority();
drop function if exists public.act_belongs_to_artist(uuid, uuid);
