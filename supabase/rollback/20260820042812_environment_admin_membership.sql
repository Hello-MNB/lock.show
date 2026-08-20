-- ROLLBACK ONLY — run manually under the exact approved rollback action.
-- Restores the pre-migration operator check before removing the new authority
-- table so existing Admin access fails back to the prior known behavior.

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'operator'
  );
$$;

revoke all on function public.is_operator() from public, anon;
grant execute on function public.is_operator() to authenticated;

drop function if exists public.has_admin_capability(text, text);
drop table if exists public.environment_admin_membership;
