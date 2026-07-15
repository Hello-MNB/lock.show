-- 032 down — removes the two additive RPCs (no data impact).
drop function if exists public.list_roster_grants();
drop function if exists public.list_production_requests();
