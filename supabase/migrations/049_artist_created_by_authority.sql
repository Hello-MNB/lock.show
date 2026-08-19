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
-- SERVICE ROLE AND MIGRATIONS ARE UNAFFECTED: when `auth.uid()` is NULL there is
-- no authenticated identity to substitute, so the supplied value stands. Seeds,
-- fixtures and backfills keep working. This is deliberate and it is the honest
-- limit of this migration: it governs the authenticated surface, which is the
-- one the review reached. A service-role key can still write any value, as it
-- can write anything.
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
  if tg_op = 'INSERT' then
    -- auth.uid() NULL = no authenticated identity (service role, migration,
    -- seed). Nothing to substitute, so the supplied value stands.
    if auth.uid() is not null then
      new.created_by := auth.uid();
    end if;
  else
    -- UPDATE: authorship is not editable by anyone through this surface, not
    -- even by the person who holds it. Silently pinning rather than raising
    -- keeps ArtistDashboard.jsx:266 — which round-trips the whole row — working
    -- unchanged, and makes the column's value independent of what it sends.
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
