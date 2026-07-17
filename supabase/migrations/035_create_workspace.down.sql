-- 035 DOWN — remove the create_workspace RPC (function only; no data touched).
-- Workspaces already created through it remain — they are ordinary
-- organization/membership/role_assignment/subscription rows.
drop function if exists public.create_workspace(text, text, text);
