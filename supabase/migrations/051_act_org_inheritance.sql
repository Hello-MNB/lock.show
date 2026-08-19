-- ============================================================
-- 051 · AN ACT INHERITS ITS ARTIST'S ORGANISATION
--
-- FOUND BY INDEPENDENT ADVERSARIAL REVIEW (QA-INDEP-09, H1). REPRODUCED.
--
-- 041's lineage check requires an Act's organisation to match its artist's. That
-- half is what makes the check refuse a forged artists row without consulting
-- `created_by` — but NOTHING IN THE SCHEMA MAINTAINS THE EQUALITY, and the only
-- Act-creation path the application actually has does not set the column:
--
--     src/lib/db.js:156  .insert({ person_id, stage_name, genre, is_default: false })
--
-- `public.act.organization_id` has no default and no trigger, so every Act the
-- client creates carries NULL while its artist carries a real org. Executed:
--
--     shipped-shape act org: NULL      artist owner org: …b1
--     predicate(new act, my artist): f
--     THE ARTIST publishes for their OWN second Act: false
--       ERROR: new row violates row-level security policy for table "passport_versions"
--
-- That is the artist, refused on their own Act — precisely the cost 041's own
-- comment (:404) says a fix must not have, and CLAUDE.md makes multi-Act canon.
--
-- WHY NO GATE CAUGHT IT: scripts/test-act-stamp.mjs built its second Acts by
-- copying `organization_id` from the default Act — a shape the client never
-- produces. The assertion "I can still publish for MY OWN second Act" was true of
-- the fixture and false of the application. That is the third round running where
-- a claim was true of what was tested and false of what was claimed, and the
-- fixture is now the shipped shape.
--
-- THE FIX IS THE MISSING INHERITANCE, not a weaker check. An Act belongs to a
-- Person; that Person's organisation is already recorded on their default Act
-- (written by act_from_artist, 020) and on their artists row. A new Act inherits
-- it, exactly as artists rows inherit theirs from set_artist_org (015:30).
--
-- ORDER OF PREFERENCE, and each fallback is there for a reason:
--   1. a value the caller supplied — an org-aware writer is not overridden;
--   2. the Person's DEFAULT Act — the lineage createAct() itself follows, since
--      it copies person_id from the currently active Act;
--   3. the Person's artists row — covers a Person whose default Act predates the
--      act spine or was removed.
-- Sources 2 and 3 are now required to AGREE. A Person with no organisation, or
-- with two, ends with NULL — legal, and 041 tolerates it explicitly.
--
-- DRAFTED, NOT APPLIED. `public.act` is a live table. Tracked as ACT-ORG-INHERIT
-- in docs/OWNER-PENDING.md.
-- ============================================================

create or replace function public.act_inherit_org()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.organization_id is not null then
    return new;
  end if;
  -- AMBIGUITY IS LEFT NULL, NOT GUESSED — QA-INDEP-09 → QA-INDEP-10, M1.
  -- The first version was `… and is_default and organization_id is not null limit 1`
  -- with no ORDER BY, and nothing stops a Person holding two default Acts in two
  -- organisations (artist plus agency is an ordinary shape, no "move" required).
  -- Executed: two candidates, the row was filled from whichever the planner
  -- returned first, and the Person could then publish that Act for one of their
  -- artists and was REFUSED for the other — the same "refused on your own work"
  -- failure that got the previous round rejected, reached without anyone moving
  -- anywhere. The file also claimed it touched "only rows that can be resolved
  -- unambiguously", which was false.
  -- Now: fill only when every candidate agrees. `count(distinct …)` over the
  -- Person's default Acts and their artists rows, and a single value or nothing.
  -- NULL is a safe outcome, not a broken one: 041 tolerates a NULL Act
  -- organisation and falls back to the Person check, so the artist can still
  -- publish — with 049 as the only layer there, which is stated rather than
  -- implied.
  -- `(array_agg(distinct org))[1]`, not min(): PostgreSQL has no min(uuid).
  select case when count(distinct org) = 1 then (array_agg(distinct org))[1] end
    into new.organization_id
    from (
      select a.organization_id as org
        from public.act a
       where a.person_id = new.person_id and a.is_default and a.organization_id is not null
      union
      select ar.owner_organization_id
        from public.artists ar
       where ar.created_by = new.person_id and ar.owner_organization_id is not null
    ) candidates;
  return new;
end;
$$;

-- SECURITY DEFINER because the lookup must succeed for a caller whose own RLS on
-- `act` hides the row it reads: act_org (020:186) gates on can_access_artist(id),
-- and an artist's non-default Act is invisible to them under that policy — the
-- same trap that broke the first version of 041's predicate. The function returns
-- nothing to the caller and writes only the column it fills.

drop trigger if exists trg_act_inherit_org on public.act;
create trigger trg_act_inherit_org
  before insert on public.act
  for each row execute function public.act_inherit_org();

revoke all on function public.act_inherit_org() from public;
revoke all on function public.act_inherit_org() from anon;
revoke all on function public.act_inherit_org() from authenticated;
revoke all on function public.act_inherit_org() from service_role;
-- No grants: a TRIGGER function's EXECUTE is checked at CREATE TRIGGER time, so
-- the trigger fires with none, and a SECURITY DEFINER function that reads across
-- RLS stops being a directly callable entry point. Same pattern as 041's pv_*.

-- BACKFILL, deliberately narrow. Only rows that can be resolved unambiguously
-- from the Person's own default Act are touched; anything else is left alone and
-- remains legal under 041's NULL tolerance.
-- Same rule as the trigger: a row is backfilled only when the Person has exactly
-- ONE candidate organisation. The first version joined to any default Act and so
-- silently picked a side for a Person who belongs to two.
update public.act a
   set organization_id = c.org
  from (
    select person_id, (array_agg(distinct org))[1] as org
      from (
        select person_id, organization_id as org from public.act where is_default and organization_id is not null
        union
        select created_by, owner_organization_id from public.artists where owner_organization_id is not null
      ) u
     group by person_id
    having count(distinct org) = 1
  ) c
 where a.organization_id is null
   and c.person_id = a.person_id;
