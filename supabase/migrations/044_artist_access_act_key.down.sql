-- DOWN 044 — restore the 008 key and 027's body of request_artist_access.
--
-- PRECONDITION: rollback is not always possible, and must say so. 044 replaced
-- `unique (organization_id, artist_id)` so an org could hold one grant per ACT. The
-- moment a second Act-scoped grant exists for one artist that key cannot be
-- restored — two rows legitimately share (org, artist). Dropping act_id first would
-- turn them into indistinguishable duplicates and ADD CONSTRAINT would fail with a
-- bare uniqueness error pointing at nothing. Refuse up front, name the rows,
-- destroy nothing.
do $$
declare n integer;
begin
  select count(*) into n from (
    select organization_id, artist_id
      from public.artist_access
     group by organization_id, artist_id
    having count(*) > 1) d;
  if n > 0 then
    raise exception
      'cannot roll back 044: % (organization, artist) pair(s) hold more than one grant, which only Act-scoped grants allow. Consolidate them to a single row per (organization, artist) first — rolling back would either destroy grants or leave the 008 unique key unrestorable.', n
      using errcode = '23505';
  end if;
end $$;

-- Restore 027's body BEFORE act_id can disappear (043's down drops the column).
-- 044 rewrote this function to reference `where act_id is null`; leaving that in
-- place after the column is gone kills the whole access-request flow.
create or replace function public.request_artist_access(
  p_org uuid, p_artist uuid, p_scope text[] default '{view}', p_territory text default null
) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.has_org_role(p_org, array['owner','admin']) then raise exception 'not authorized'; end if;
  if exists (select 1 from public.artists where id = p_artist and owner_organization_id = p_org) then
    raise exception 'org already owns this artist — no access grant needed';
  end if;
  insert into public.artist_access(organization_id, artist_id, scope, territory, status, consent_at)
    values (p_org, p_artist, coalesce(p_scope, '{view}'), p_territory, 'pending', null)
  on conflict (organization_id, artist_id) do update
    set scope = excluded.scope, territory = excluded.territory,
        status = 'pending', consent_at = null
  returning id into v_id;
  return v_id;
end; $$;

drop index if exists public.idx_artist_access_org_act;
drop index if exists public.idx_artist_access_org_artist_legacy;

alter table public.artist_access drop constraint if exists artist_access_organization_id_artist_id_key;
alter table public.artist_access add constraint artist_access_organization_id_artist_id_key
  unique (organization_id, artist_id);
