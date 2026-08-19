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
-- All three may be NULL for a Person with no organisation at all; that is legal
-- and 041 tolerates it explicitly.
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
  select a.organization_id into new.organization_id
    from public.act a
   where a.person_id = new.person_id and a.is_default and a.organization_id is not null
   limit 1;
  if new.organization_id is null then
    select ar.owner_organization_id into new.organization_id
      from public.artists ar
     where ar.created_by = new.person_id and ar.owner_organization_id is not null
     limit 1;
  end if;
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
update public.act a
   set organization_id = d.organization_id
  from public.act d
 where a.organization_id is null
   and d.person_id = a.person_id
   and d.is_default
   and d.organization_id is not null;
