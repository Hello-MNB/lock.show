-- One personal display name, written transactionally to the two canonical
-- public identity projections. Auth user metadata is mirrored separately by
-- the authenticated client and is never used for authorization.
create or replace function public.update_my_identity(p_display_name text)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text := btrim(coalesce(p_display_name, ''));
  v_profiles integer;
  v_people integer;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if v_name = '' then raise exception 'display name is required'; end if;
  if char_length(v_name) > 120 then raise exception 'display name is too long'; end if;

  update public.profiles set full_name = v_name where id = v_uid;
  get diagnostics v_profiles = row_count;
  update public.person set display_name = v_name where id = v_uid;
  get diagnostics v_people = row_count;

  if v_profiles <> 1 or v_people <> 1 then
    raise exception 'identity record is incomplete';
  end if;
  return v_name;
end;
$$;

revoke all on function public.update_my_identity(text) from public;
revoke all on function public.update_my_identity(text) from anon;
grant execute on function public.update_my_identity(text) to authenticated;
