-- ============================================================
-- 049 · `artists.created_by` IS A DATABASE FACT, NOT A CALLER CLAIM
--
-- FOUND BY INDEPENDENT ADVERSARIAL REVIEW (QA-INDEP-07, F1), REPRODUCED LOCALLY.
--
-- 041 tightened `pv_owner_insert` so a passport version can only enter a lineage
-- its writer owns, and keyed that ownership on `artists.created_by`. The review
-- bypassed it with ONE extra INSERT, because `created_by` is written by whoever
-- inserts the row and no policy governs it:
--
--   artists_org (015:27) WITH CHECK = owner_organization_id in (current_org_ids())
--
-- — it constrains the ORG column and says nothing about `created_by`. So an
-- attacker inserts an artists row IN THEIR OWN ORG carrying the VICTIM's
-- `created_by`, and every check downstream that reads `created_by` as "who owns
-- this artist" then certifies the attack. Reproduced:
--
--   spoof row accepted? true   org=<attacker> / created_by=<victim>
--   can_access_artist(spoof) as attacker = t
--   pv_act_in_artist_lineage(<victim act>, <spoof>) = t   ← the check certifies it
--   attack accepted? true → victim's published version becomes 'superseded'
--
-- `artists_owner` (001:162) is `using/with check (created_by = auth.uid())`, but
-- RLS policies are PERMISSIVE and OR together: a row that satisfies `artists_org`
-- is accepted whatever `artists_owner` thinks. A second permissive policy can
-- never restrict; only the value itself can.
--
-- THE FIX IS NOT ANOTHER POLICY. It is that the column stops being an input.
-- On INSERT by a logged-in caller, `created_by` is set to `auth.uid()` — the one
-- value the caller cannot forge. On UPDATE it is pinned, so an org member editing
-- an artist cannot re-point authorship at themselves or at anyone else.
--
-- WHY NOT REFUSE INSTEAD OF OVERWRITE: every shipped writer already sends
-- `created_by: user.id` (Onboarding.jsx:136,193 · ActEditor.jsx:369 ·
-- AgencyDashboard.jsx:269), so overwriting is a no-op for all of them and a
-- refusal would be a new failure mode for callers doing nothing wrong. The
-- attacker is the only caller whose value changes.
--
-- SERVICE ROLE, THE TABLE OWNER AND MIGRATIONS ARE UNAFFECTED — on INSERT *and*
-- on UPDATE. The rule keys on the caller's role, so seeds, fixtures, backfills and
-- any deliberate ownership transfer keep working, while `anon` and `authenticated`
-- cannot set or move the column. This is the honest limit of the migration: it
-- governs the authenticated surface, which is the one the review reached. A
-- service-role key can still write any value, as it can anywhere.
--
-- SIDE EFFECT THAT IS ALSO A FIX: `act_from_artist()` (020) mirrors every new
-- artists row into `public.act` with `person_id = new.created_by`. The spoof
-- therefore also wrote an act-spine row owned by the victim. That stops too.
--
-- DRAFTED, NOT APPLIED. `public.artists` is a live table; applying this is
-- Maria's call. Tracked as CREATED-BY-AUTHORITY in docs/OWNER-PENDING.md.
-- ============================================================

create or replace function public.artists_pin_created_by()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  -- WHICH CALLER, NOT WHETHER THERE IS ONE. My first version keyed the UPDATE
  -- branch on nothing at all and pinned the column for EVERY role — triggers are
  -- not bypassed by RLS-bypass, so a service-role or owner `update artists set
  -- created_by = …` reported success and changed nothing. Executed:
  --   service_role : update ok=true -> UNCHANGED (silent no-op)
  --   postgres     : update ok=true -> UNCHANGED (silent no-op)
  -- An ownership transfer or a Person merge — cases 046's own comments
  -- contemplate — would have failed silently, which is worse than failing. And it
  -- made this file's own "a service-role key can still write any value" comment
  -- false, along with the sentence the founder was given. Same role rule as 050.
  -- `current_setting('role')` RECORDS HOW A ROLE WAS ASSUMED, NOT WHICH IS
  -- EFFECTIVE — QA-INDEP-09, M4. Under `set session authorization authenticated`
  -- the GUC reads 'none' while current_user is 'authenticated', and the pin does
  -- not fire. That needs superuser, so it is not reachable through PostgREST — but
  -- the accurate claim was "callers whose role GUC is set", not "anon and
  -- authenticated", and current_user is the robust test. Both are checked now, so
  -- the sentence and the code say the same thing. An unset GUC reads NULL, and
  -- `NULL not in (…)` is NULL, so the fall-through is already fail-safe.
  if coalesce(current_setting('role', true), current_user) not in ('anon', 'authenticated')
     and current_user not in ('anon', 'authenticated') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    -- auth.uid() NULL under an authenticated role means no JWT subject; there is
    -- nothing to substitute, and artists_org refuses such an insert anyway.
    if auth.uid() is not null then
      new.created_by := auth.uid();
    end if;
  else
    -- UPDATE from the authenticated surface: authorship is not editable, not even
    -- by the person who holds it. Silence is right HERE — ArtistDashboard.jsx:266
    -- round-trips the whole row and sends the value it already has, so a raise
    -- would break an honest caller doing nothing wrong. The trusted roles above
    -- keep a real transfer path.
    new.created_by := old.created_by;
  end if;
  return new;
end;
$$;

-- SECURITY INVOKER ON PURPOSE. The function reads no table and writes no row of
-- its own; it only rewrites a column of the row already being written, which the
-- caller's own policy has already authorised. Nothing here needs to see past RLS,
-- and a DEFINER trigger that does not need to be one is a standing hazard.

drop trigger if exists trg_artists_pin_created_by on public.artists;
create trigger trg_artists_pin_created_by
  before insert or update on public.artists
  for each row execute function public.artists_pin_created_by();

-- ORDER MATTERS AND IS NOT LEFT TO CHANCE. `trg_act_from_artist` is AFTER INSERT
-- and `trg_set_artist_org` is BEFORE INSERT; PostgreSQL fires same-timing
-- triggers in NAME order, and `trg_artists_pin_created_by` sorts before
-- `trg_set_artist_org`, so `created_by` is already pinned when the org trigger
-- and then the act mirror read it. Asserted by execution in
-- scripts/test-act-stamp.mjs, not by this comment.
