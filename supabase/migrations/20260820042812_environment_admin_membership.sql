-- LOCK SHOW — Environment-bound Admin membership (PD-005).
-- AUTHORED CANDIDATE ONLY. Do not apply without exact migration approval.
--
-- Replaces the legacy singleton profiles.role='operator' authorization shortcut
-- with a separate, revocable capability. A Person may therefore remain an
-- Artist/Representation/etc. in their customer Workspaces while independently
-- holding Admin authority for one named Environment.

create table if not exists public.environment_admin_membership (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references auth.users(id) on delete cascade,
  environment_id text not null check (environment_id in ('production', 'preview', 'staging', 'development')),
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  capabilities text[] not null default array[]::text[],
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (person_id, environment_id)
);

alter table public.environment_admin_membership enable row level security;
alter table public.environment_admin_membership force row level security;

-- Memberships are a server control-plane record. No browser role can enumerate
-- them; the API returns only the caller's safe allow/deny preflight result.
revoke all on table public.environment_admin_membership from public, anon, authenticated;

create or replace function public.has_admin_capability(
  requested_environment text,
  requested_capability text default 'admin.environment'
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.environment_admin_membership membership
    where membership.person_id = auth.uid()
      and membership.environment_id = requested_environment
      and membership.status = 'active'
      and (membership.expires_at is null or membership.expires_at > now())
      and requested_capability = any(membership.capabilities)
  );
$$;

revoke all on function public.has_admin_capability(text, text) from public, anon;
grant execute on function public.has_admin_capability(text, text) to authenticated;

-- Preserve current authorized operators during the transition, without making
-- profiles.role the continuing source of authority. This is the only automatic
-- grant in the migration and is exact, reviewable, and reversible.
insert into public.environment_admin_membership (
  person_id,
  environment_id,
  status,
  capabilities,
  created_by
)
select profile.id, 'production', 'active', array['admin.environment']::text[], profile.id
from public.profiles profile
where profile.role = 'operator'
on conflict (person_id, environment_id) do nothing;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_admin_capability('production', 'admin.environment');
$$;

revoke all on function public.is_operator() from public, anon;
grant execute on function public.is_operator() to authenticated;

comment on table public.environment_admin_membership is
  'Environment-bound, revocable Admin capability. Never inferred from email, route, local storage, profile role, or Workspace ownership.';
