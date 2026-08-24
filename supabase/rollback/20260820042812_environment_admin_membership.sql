-- ROLLBACK ONLY — run manually under the exact approved rollback action.
-- This exceptional base-schema rollback fails closed. It intentionally does
-- not restore any profile-role authorization path; normal release rollback is
-- the paired explicit-grant rollback, which preserves this authority schema.

drop function if exists public.is_operator();
drop function if exists public.has_admin_capability(text, text);
drop table if exists public.environment_admin_membership;
