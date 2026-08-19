-- ============================================================
-- 050 · AN AVAILABILITY REQUEST MAY ONLY BE ATTRIBUTED TO AN ORG YOU BELONG TO
--
-- FOUND WHILE REPAIRING QA-INDEP-07 F3, AND IT IS WORSE THAN THE FINDING WAS.
--
-- I told Maria that `organization_id` on the eight tables 008 stamped is read by
-- nothing — "inert". The reviewer said that claim was overstated. Measuring it
-- properly showed it is FALSE, in a specific and reachable way:
--
--   `availability_requests.organization_id` is read as a SCOPING DECISION by
--   recompute_radar_for_org(), recompute_radar_private_for_artist() and
--   generate_radar_rep_projection(), all of which join
--
--       join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
--        and (r.organization_id = p_org
--             or (r.organization_id is null and a.owner_organization_id = p_org))
--
--   …and the column is writable by ANONYMOUS callers. Policy `req_public_insert`
--   is `for insert with check (artist_is_published(artist_id))` with no role
--   restriction and no constraint on `organization_id`, which is the correct
--   design for the public "check my availability" path — a buyer has no account.
--
-- EXECUTED, on a scratch database with every migration applied:
--
--   after an HONEST anon request   -> owner org counts: 1   unrelated org: 0
--   anon stamped it with an unrelated org, accepted: true
--   after the STAMPED anon request -> owner org counts: 0   unrelated org: 1
--
-- So an anonymous visitor can take a REAL booking request for a published artist
-- and move it out of that artist's own RADAR into an unrelated organization's.
-- RADAR is the artist's demand signal; this suppresses demand they actually have
-- and manufactures demand for an org that never received it. The row itself stays
-- visible to the artist — `req_org_read` keys on `artist_id`, not on the stamp —
-- so this is an ATTRIBUTION defect, not a disclosure one. Nothing leaks; the
-- wrong people are told the wrong thing about who wants to book whom.
--
-- THE RULE, STATED ONCE: you may attribute a request to an organization only if
-- you are a member of it. Everyone else gets NULL, which the scoping join above
-- already reads as "this went to the artist's own org" — the same place an honest
-- anonymous request lands. So the public path keeps working unchanged and the
-- spoof collapses into the honest case rather than into an error.
--
-- WHY SILENTLY NULL AND NOT REFUSE: the writer on that path is an anonymous buyer
-- filling in a form. A refusal would surface to them as a failed booking request
-- for something they did not do and could not fix, and the value they are being
-- refused is one no legitimate anonymous caller sets. Nulling is invisible to
-- every honest caller and total against the dishonest one.
--
-- THE FIRST VERSION OF THIS RULE WAS TOO BLUNT, and the test fixtures caught it.
-- It nulled the attribution whenever `auth.uid()` was NULL, which is true of an
-- anonymous buyer AND of every seed, backfill and service-role writer — so it
-- silently erased the deliberate org attributions in scripts/sql/appsec-fixture.sql
-- and changed which RADAR signals exist. A guard that cannot tell a hostile
-- anonymous writer from a migration is not a guard, it is data loss.
--
-- The rule keys on the ROLE, which is the thing that actually differs:
--   anon           → always nulled. No anonymous caller has a membership to prove,
--                    and the public form has no legitimate reason to name an org.
--   authenticated  → nulled unless the caller is an active member of that org.
--   anything else  → left alone. service_role, the table owner and migrations are
--                    trusted writers by definition; if that stops being true the
--                    problem is the key, not this trigger.
--
-- DRAFTED, NOT APPLIED. `public.availability_requests` is a live table.
-- Tracked as REQ-ORG-ATTRIBUTION in docs/OWNER-PENDING.md.
-- ============================================================

create or replace function public.request_org_attribution()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.organization_id is null then
    return new;
  end if;
  -- `current_setting('role')`, NOT `current_role`. Inside a SECURITY DEFINER
  -- function `current_role` is the function's OWNER, so it reads 'postgres' for
  -- every caller and this whole rule would be dead code that looks alive. The GUC
  -- follows the `set role` PostgREST issues per request and is the only thing here
  -- that sees who is actually calling. Measured, not assumed: as anon it reads
  -- 'anon', as authenticated 'authenticated', as the owner 'none'.
  if current_setting('role', true) = 'anon' then
    new.organization_id := null;
  elsif current_setting('role', true) = 'authenticated'
     and not exists (
       select 1 from public.organization_membership m
        where m.organization_id = new.organization_id
          and m.person_id = auth.uid()
          and m.status = 'active'
     )
  then
    new.organization_id := null;
  end if;
  return new;
end;
$$;

-- SECURITY DEFINER because the membership lookup must succeed for a caller who
-- cannot see `organization_membership` at all — an anonymous one. An invoker
-- check would find no rows for every anon insert and reach the same answer by
-- accident, and would then be silently wrong the first time an authenticated
-- caller could not see their OWN membership row. The function reads one table,
-- returns no data to the caller, and writes nothing but the column it guards.

drop trigger if exists trg_request_org_attribution on public.availability_requests;
create trigger trg_request_org_attribution
  before insert or update of organization_id on public.availability_requests
  for each row execute function public.request_org_attribution();

revoke all on function public.request_org_attribution() from public;
revoke all on function public.request_org_attribution() from anon;
revoke all on function public.request_org_attribution() from authenticated;
revoke all on function public.request_org_attribution() from service_role;
-- NO GRANTS AT ALL. This is a TRIGGER function: PostgreSQL checks EXECUTE at
-- CREATE TRIGGER time, not at fire time, so the trigger keeps working with none —
-- and a SECURITY DEFINER function that reads organization_membership stops being
-- a directly callable entry point for anon. Same pattern as 041's pv_* triggers.
