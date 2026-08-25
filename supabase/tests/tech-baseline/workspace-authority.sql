\set ON_ERROR_STOP on

do $$
declare
  missing text[] := array[]::text[];
  required_function text;
begin
  foreach required_function in array array[
    'resolve_primary_workspace',
    'commit_workspace_context',
    'rename_workspace',
    'resend_workspace_invitation',
    'cancel_workspace_invitation',
    'change_workspace_member_authority',
    'transfer_workspace_ownership'
  ] loop
    if not exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = required_function
    ) then
      missing := array_append(missing, required_function);
    end if;
  end loop;

  if cardinality(missing) > 0 then
    raise exception 'APP_SHELL_DB_CONTRACT_MISSING:%', array_to_string(missing, ',');
  end if;
end
$$;

select 'APP_SHELL_DB_CONTRACT_PRESENT' as result;
