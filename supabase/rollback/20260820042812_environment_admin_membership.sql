-- ROLLBACK ONLY — run manually under the exact approved rollback action.
-- This exceptional base-schema rollback fails closed. It intentionally does
-- not restore any profile-role authorization path; normal release rollback is
-- the paired explicit-grant rollback, which preserves this authority schema.

-- Existing RLS policies and database functions depend on this legacy helper.
-- Preserve their dependency graph, but remove every Admin authorization path.
create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select false;
$$;

revoke all on function public.is_operator() from public, anon;
grant execute on function public.is_operator() to authenticated;

drop function if exists public.has_admin_capability(text, text);
drop table if exists public.environment_admin_membership;
