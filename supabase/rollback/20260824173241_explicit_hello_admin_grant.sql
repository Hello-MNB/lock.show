-- ROLLBACK ONLY — run manually under the exact approved rollback action.
-- Deletes only the exact authority row inserted by the paired migration.
-- Any pre-existing or drifted row aborts the rollback without mutation.

do $$
declare
  v_person_id uuid;
  v_provenance_count integer;
  v_expected_membership_count integer;
begin
  select count(*)
    into v_provenance_count
    from public.environment_admin_membership
   where grant_source = '20260824173241_explicit_hello_admin_grant';
  if v_provenance_count <> 1 then
    raise exception 'explicit_admin_grant_rollback_provenance_mismatch: expected exactly one provenance row, found %', v_provenance_count;
  end if;

  select person_id
    into v_person_id
    from public.environment_admin_membership
   where grant_source = '20260824173241_explicit_hello_admin_grant';

  select count(*)
    into v_expected_membership_count
    from public.environment_admin_membership
   where person_id = v_person_id
     and environment_id = 'production'
     and status = 'active'
     and capabilities = array['admin.environment']::text[]
     and expires_at is null
     and created_by = v_person_id
     and grant_source = '20260824173241_explicit_hello_admin_grant';
  if v_expected_membership_count <> 1 then
    raise exception 'explicit_admin_grant_rollback_row_drifted';
  end if;

  delete from public.environment_admin_membership
   where person_id = v_person_id
     and environment_id = 'production'
     and status = 'active'
     and capabilities = array['admin.environment']::text[]
     and expires_at is null
     and created_by = v_person_id
     and grant_source = '20260824173241_explicit_hello_admin_grant';
end;
$$;
