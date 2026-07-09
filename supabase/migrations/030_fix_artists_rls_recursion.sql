-- ============================================================
-- LOCK — migration 030: FIX infinite RLS recursion on `artists`
-- ============================================================
-- SYMPTOM (live, 9 Jul): onboarding fails with
--   "infinite recursion detected in policy for relation 'artists'"
-- then "Cannot read properties of null (reading 'id')" — because every SELECT
-- on public.artists errors, so getMyArtist/upsertArtist return null and the app
-- reads .id on nothing.
--
-- ROOT CAUSE — a mutual-RLS loop introduced by 027:
--   • 015 `artists_org` policy subqueries `artist_access`
--       (id in (select artist_id from artist_access where ...))
--   • 027 `aa_artist_owner_read` / `aa_artist_owner_respond` policies subquery
--       `artists` (artist_id in (select id from artists where ...))
--   Reading artists → evaluates artist_access RLS → evaluates artists RLS → …∞
--
-- FIX — check artist ownership inside a SECURITY DEFINER function, which reads
-- `artists` WITHOUT re-triggering its RLS. That terminates the loop. Behavior is
-- identical (same ownership check); only the recursion is removed. We touch ONLY
-- the artist_access side, which is enough to break the cycle.

create or replace function public.owns_artist(a uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.artists ar
    where ar.id = a
      and ar.owner_organization_id in (select public.current_org_ids())
  )
$$;
grant execute on function public.owns_artist(uuid) to authenticated;

-- Re-create the two artist-owner policies to use the non-recursive helper.
drop policy if exists aa_artist_owner_read on public.artist_access;
create policy aa_artist_owner_read on public.artist_access for select
  using (public.owns_artist(artist_id));

drop policy if exists aa_artist_owner_respond on public.artist_access;
create policy aa_artist_owner_respond on public.artist_access for update
  using (public.owns_artist(artist_id))
  with check (public.owns_artist(artist_id));
