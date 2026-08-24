-- LOCK SHOW — explicit production Admin grant for the existing identity.
-- AUTHORED CANDIDATE ONLY. Do not apply without exact migration approval.
--
-- Requires 20260820042812_environment_admin_membership.sql. The approved Auth
-- UUID is immutable; the email and confirmation checks prove that the same
-- identity still owns the requested account at action time. Runtime
-- authorization continues through public.environment_admin_membership.person_id.

revoke all on table public.environment_admin_membership from public, anon, authenticated;
revoke all on table public.environment_admin_membership from service_role;
grant select on table public.environment_admin_membership to service_role;

do $$
declare
  v_person_ids uuid[];
  v_person_id uuid;
  v_identity_count integer;
begin
  select coalesce(array_agg(id order by id), array[]::uuid[])
   into v_person_ids
    from auth.users
   where id = 'bd6af802-607c-4faf-93d4-e0a32f10804e'::uuid
     and lower(email) = 'hello@lock.show'
     and email_confirmed_at is not null
     and deleted_at is null
     and (banned_until is null or banned_until <= now());

  v_identity_count := cardinality(v_person_ids);
  if v_identity_count <> 1 then
    raise exception 'explicit_admin_grant_identity_resolution_failed: expected exactly one active auth identity, found %', v_identity_count;
  end if;
  v_person_id := v_person_ids[1];

  if exists (
    select 1
      from public.environment_admin_membership
     where person_id = v_person_id
       and environment_id = 'production'
  ) then
    raise exception 'explicit_admin_grant_membership_exists';
  end if;

  insert into public.environment_admin_membership (
    person_id,
    environment_id,
    status,
    capabilities,
    created_by,
    grant_source
  ) values (
    v_person_id, 'production', 'active', array['admin.environment']::text[], v_person_id, '20260824173241_explicit_hello_admin_grant'
  );
end;
$$;
