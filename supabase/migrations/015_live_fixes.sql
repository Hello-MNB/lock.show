-- ============================================================
-- 015 — LIVE FIXES caught by the anon-key end-to-end validation.
-- Apply in the Supabase SQL editor (idempotent, no secret).
--
-- FIX A · artists INSERT…RETURNING under org-RLS:
--   artists_org USING used can_access_artist(id) — a STABLE security-definer
--   function that self-SELECTs public.artists. On INSERT…RETURNING (PostgREST
--   .insert().select()) its statement-start snapshot excludes the just-inserted
--   row → USING=false → the row is hidden from RETURNING → 42501. Fix: evaluate
--   the row's OWN owner_organization_id column directly (no self-SELECT); add an
--   inline artist_access OR for managed (non-owned) artists. WITH CHECK unchanged.
--
-- FIX B · trigger 014 (auto-set the artist's org so the app needn't pass it).
--
-- FIX C · invite_member used gen_random_bytes() (pgcrypto, in the `extensions`
--   schema — not on the function search_path → "function does not exist"). Switch
--   to the always-available gen_random_uuid() for the invite token.
-- ============================================================

-- FIX A
drop policy if exists artists_org on public.artists;
create policy artists_org on public.artists for all
  using (
    owner_organization_id in (select public.current_org_ids())
    or id in (select artist_id from public.artist_access where status = 'active' and organization_id in (select public.current_org_ids()))
  )
  with check (owner_organization_id in (select public.current_org_ids()));

-- FIX B
create or replace function public.set_artist_org()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if new.owner_organization_id is not null then return new; end if;
  select active_organization_id into v_org from public.active_role_context where person_id = auth.uid();
  if v_org is null then
    select organization_id into v_org from public.organization_membership
      where person_id = auth.uid() and org_role = 'owner' and status = 'active' order by created_at limit 1;
  end if;
  new.owner_organization_id := v_org;
  new.organization_id := coalesce(new.organization_id, v_org);
  return new;
end; $$;
drop trigger if exists trg_set_artist_org on public.artists;
create trigger trg_set_artist_org before insert on public.artists for each row execute function public.set_artist_org();

-- FIX C
create or replace function public.invite_member(p_org uuid, p_email text, p_role text default 'member')
returns text language plpgsql security definer set search_path = public as $$
declare v_token text;
begin
  if not public.has_org_role(p_org, array['owner','admin']) then raise exception 'not authorized'; end if;
  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.organization_membership(organization_id, person_id, org_role, status, invited_email, invited_by, invite_token)
    values (p_org, null, coalesce(nullif(p_role, ''), 'member'), 'invited', lower(p_email), auth.uid(), v_token);
  return v_token;
end; $$;
