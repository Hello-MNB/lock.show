-- DOWN 047 — remove the decision function and the dormant publish switch.
-- Order: the policy is restored FIRST if PART B was ever applied; dropping
-- grant_permits() while a policy still calls it would leave passport_versions with
-- a policy referencing a missing function, i.e. no inserts at all.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'revert_act_scoped_publish') then
    perform public.revert_act_scoped_publish();
  end if;
end $$;

drop function if exists public.apply_act_scoped_publish();
drop function if exists public.revert_act_scoped_publish();
drop function if exists public.grant_permits(uuid, uuid, text, text, text, uuid, timestamptz);
