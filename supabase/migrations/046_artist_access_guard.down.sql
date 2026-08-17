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
  -- ESCAPE for a PARTIAL rollback. 046's whole reason to be its own migration is that
  -- it can be reverted alone — the legitimate move when the guard is breaking a
  -- client. Blocking that on a duplicate-pair condition about a UNIQUE KEY the guard
  -- has nothing to do with would remove the property the split exists to give, and
  -- the old message told the operator to delete a legitimate Act-scoped grant in
  -- order to drop a trigger. That is harmful advice, so it is gone.
  --
  --   select set_config('b4.partial_rollback', '046', false);   -- then run this file
  --
  -- THE ESCAPE MUST PROVE IT IS GENUINELY PARTIAL. set_config(..., false) is
  -- SESSION-scoped, so an operator who sets it to revert 046 alone and then runs the
  -- full newest-first chain in the same session silently disarms this precondition:
  -- 046.down commits, the guard is dropped, and 044.down refuses afterwards — leaving
  -- the authority columns present and unguarded, which is the exact state this
  -- precondition was hoisted here to prevent. Independent QA executed that sequence.
  -- A 046-only revert by definition still has 047 installed; if 047 is already gone,
  -- this is a full rollback wearing the escape, and the escape does not apply.
  if coalesce(current_setting('b4.partial_rollback', true), '') = '046'
     and to_regprocedure('public.grant_permits(uuid,uuid,text,text,text,uuid,timestamptz)') is null then
    raise exception
      'b4.partial_rollback=046 claims a 046-only revert, but 047 is already gone — this is a FULL rollback. Unset b4.partial_rollback and consolidate to one row per (organization, artist) first.'
      using errcode = '23505';
  end if;

  if n > 0 and coalesce(current_setting('b4.partial_rollback', true), '') <> '046' then
    raise exception
      'cannot roll back to 043: % (organization, artist) pair(s) hold more than one grant, which only Act-scoped grants allow, so 044 cannot restore the 008 key. This refuses FIRST, while the guard is still installed, rather than leaving you unprotected when 044 refuses later. To revert 046 ALONE (keeping 043-045), set b4.partial_rollback to ''046'' and re-run. To complete the FULL rollback, consolidate to one row per (organization, artist) first.', n
      using errcode = '23505';
  end if;
end $$;

-- DOWN 046 — remove the authority guard.
--
-- Reverting this RE-OPENS the grantee's ability to write their own authority
-- columns. In a FULL newest-first rollback that is bounded, because 047's decision
-- function is already gone.
--
-- IN THE PARTIAL MODE IT IS NOT BOUNDED, and the previous wording claimed otherwise.
-- After a 046-only revert: 047 is still installed, grant_permits is still granted to
-- `authenticated`, the guard is gone and act_belongs_to_artist is gone with it — so
-- the linkage check disappears too. Independent QA then, as plain `authenticated`,
-- set actions={publish,sign}, scope up to publish, status=active, consent_at=now(),
-- expires_at=+10 years AND pointed act_id at another Person's Act, with
-- grant_permits returning true. If PART B has been applied, that is cross-Person
-- publish. A 046-only revert is therefore an OPERATOR-SUPERVISED window, not a safe
-- resting state: re-apply 046 as soon as the client issue is resolved.
drop trigger if exists trg_artist_access_guard_authority on public.artist_access;
drop function if exists public.artist_access_guard_authority();
drop function if exists public.act_belongs_to_artist(uuid, uuid);
