-- 032 — Roster + Production inbox RPCs (rel-2026.07.13, scope items A6 + A7)
--
-- ADDITIVE ONLY: two read-only SECURITY DEFINER functions, no table/column/policy
-- changes, no data rewrites. Safe to apply without backups (structural changes are
-- migration 033+, gated on Supabase Pro backups per the release plan).
--
-- Why RPCs: the agency roster and the production inbox must read across
-- artist_access/artists org boundaries. Doing that through plain selects invites
-- the artists<->artist_access RLS recursion that migration 030 fixed — so, like
-- 027's own functions, these read via SECURITY DEFINER and gate on
-- public.current_org_ids() (the caller's own memberships) instead.
--
-- 1) list_roster_grants() — Manager-office roster fed by CONSENTED grants:
--    every ACTIVE artist_access row granted TO one of the caller's orgs.
--    Membership ≠ ownership: this returns access grants, never implies the org
--    owns the artist (ENTITY-GLOSSARY §2c boundary).
--
-- 2) list_production_requests() — Production-workspace inbox: the
--    availability_requests this workspace sent, with reply status, so the
--    /production screen shows real data instead of a stub.
--
-- FIREWALL note: both return band/status/text fields only (capacity_band,
-- budget_band are bounded bands by schema) — no counts, scores, or ranks.

-- 1 · Manager office: roster from consented grants ─────────────────────────────
create or replace function public.list_roster_grants()
returns table(
  grant_id uuid, artist_id uuid, artist_stage_name text, artist_city text,
  scope text[], territory text, status text,
  consent_at timestamptz, expires_at timestamptz, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select aa.id, aa.artist_id, ar.stage_name, ar.city,
         aa.scope, aa.territory, aa.status,
         aa.consent_at, aa.expires_at, aa.created_at
  from public.artist_access aa
  join public.artists ar on ar.id = aa.artist_id
  where aa.organization_id in (select public.current_org_ids())
    and aa.status = 'active'
    and (aa.expires_at is null or aa.expires_at > now())
  order by aa.created_at desc
$$;

-- 2 · Production workspace: requests inbox (what we sent + where it stands) ────
create or replace function public.list_production_requests()
returns table(
  request_id uuid, artist_id uuid, artist_stage_name text,
  event_date date, event_type text, location text,
  capacity_band text, budget_band text, message text,
  status text, act_id uuid, created_date timestamptz
)
language sql stable security definer set search_path = public as $$
  select r.id, r.artist_id, ar.stage_name,
         r.event_date, r.event_type, r.location,
         r.capacity_band, r.budget_band, r.message,
         r.status, r.act_id, r.created_date
  from public.availability_requests r
  join public.artists ar on ar.id = r.artist_id
  where r.organization_id in (select public.current_org_ids())
  order by r.created_date desc
$$;

grant execute on function public.list_roster_grants() to authenticated;
grant execute on function public.list_production_requests() to authenticated;
