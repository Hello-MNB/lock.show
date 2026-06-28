-- ============================================================
-- GIGPROOF — migration 003: operator / admin role + oversight RLS
-- Adds a fourth user type ('operator') with platform-wide READ for
-- oversight and TARGETED moderation UPDATE on artists / claims / requests.
-- Idempotent — safe to re-run.
--
-- FIREWALL NOTE: operators see bounded statuses, bands and provenance —
-- the same vocabulary as everyone else. internal_confidence is still
-- never selected by the client; no score/percentile/exact-count exists.
-- ============================================================

-- 1. Allow 'operator' as a profile role (the original CHECK omitted it).
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('artist','agency','booker','operator'));

-- 2. Helper: is the current user an operator?
--    SECURITY DEFINER bypasses RLS inside the function, so using it in a
--    policy ON profiles cannot recurse.
create or replace function public.is_operator()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'operator'
  );
$$;

-- 3. Oversight READ across the platform + targeted moderation UPDATE.
drop policy if exists profiles_operator_read on public.profiles;
create policy profiles_operator_read on public.profiles
  for select using (public.is_operator());

drop policy if exists artists_operator_read on public.artists;
create policy artists_operator_read on public.artists
  for select using (public.is_operator());
drop policy if exists artists_operator_update on public.artists;
create policy artists_operator_update on public.artists
  for update using (public.is_operator()) with check (public.is_operator());

drop policy if exists items_operator_read on public.profile_items;
create policy items_operator_read on public.profile_items
  for select using (public.is_operator());

drop policy if exists evidence_operator_read on public.evidence_artifacts;
create policy evidence_operator_read on public.evidence_artifacts
  for select using (public.is_operator());

drop policy if exists claims_operator_read on public.claims;
create policy claims_operator_read on public.claims
  for select using (public.is_operator());
drop policy if exists claims_operator_update on public.claims;
create policy claims_operator_update on public.claims
  for update using (public.is_operator()) with check (public.is_operator());

drop policy if exists req_operator_read on public.availability_requests;
create policy req_operator_read on public.availability_requests
  for select using (public.is_operator());
drop policy if exists req_operator_update on public.availability_requests;
create policy req_operator_update on public.availability_requests
  for update using (public.is_operator()) with check (public.is_operator());

drop policy if exists consent_operator_read on public.consent_records;
create policy consent_operator_read on public.consent_records
  for select using (public.is_operator());
