-- ============================================================
-- 009 — ORG BOOTSTRAP + SEATS + INVITES  (BUILD-SPEC-ORG-RADAR §19.5, Step 2)
-- SECURITY DEFINER RPCs resolve the signup chicken-and-egg (the first owner
-- membership can't pass mem RLS yet) and enforce seat limits at the DB level.
-- Idempotent. Firewall-irrelevant (no draw data here).
-- ============================================================
create extension if not exists pgcrypto;

-- Bootstrap a personal SOLO org at signup: person + organization + owner
-- membership + functional role + solo subscription + active context. One per owner.
create or replace function public.bootstrap_personal_org(
  p_name text, p_functional_role text, p_email text default null, p_display_name text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  insert into public.person(id, email, display_name)
    values (v_uid, p_email, p_display_name)
    on conflict (id) do update
      set email = coalesce(excluded.email, public.person.email),
          display_name = coalesce(excluded.display_name, public.person.display_name);

  -- already owns an org? return it (idempotent signup).
  select o.id into v_org
    from public.organization o
    join public.organization_membership m on m.organization_id = o.id
   where m.person_id = v_uid and m.org_role = 'owner' and m.status = 'active'
   limit 1;
  if v_org is not null then return v_org; end if;

  insert into public.organization(name, plan, created_by)
    values (coalesce(nullif(p_name, ''), 'My organization'), 'solo', v_uid)
    returning id into v_org;
  insert into public.subscription(organization_id, plan, seats_included, seats_used, status)
    values (v_org, 'solo', 1, 1, 'active');
  insert into public.organization_membership(organization_id, person_id, org_role, status, joined_at)
    values (v_org, v_uid, 'owner', 'active', now());
  insert into public.role_assignment(organization_id, person_id, functional_role)
    values (v_org, v_uid, coalesce(nullif(p_functional_role, ''), 'booker'));
  insert into public.active_role_context(person_id, active_organization_id)
    values (v_uid, v_org)
    on conflict (person_id) do update set active_organization_id = excluded.active_organization_id, updated_at = now();
  return v_org;
end; $$;

-- Seat enforcement: block a new active/invited membership beyond seats_included.
create or replace function public.enforce_seat_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_included int; v_count int;
begin
  select seats_included into v_included from public.subscription where organization_id = new.organization_id;
  if v_included is null then return new; end if;
  select count(*) into v_count from public.organization_membership
    where organization_id = new.organization_id and status in ('active','invited');
  if v_count >= v_included then
    raise exception 'SEAT_LIMIT: organization is at its seat limit (%).', v_included using errcode = 'check_violation';
  end if;
  return new;
end; $$;
drop trigger if exists trg_seat_limit on public.organization_membership;
create trigger trg_seat_limit before insert on public.organization_membership
  for each row execute function public.enforce_seat_limit();

-- Keep subscription.seats_used in sync with active+invited memberships.
create or replace function public.sync_seats_used()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_org uuid := coalesce(new.organization_id, old.organization_id);
begin
  update public.subscription s set seats_used = (
    select count(*) from public.organization_membership m
     where m.organization_id = v_org and m.status in ('active','invited')
  ) where s.organization_id = v_org;
  return null;
end; $$;
drop trigger if exists trg_sync_seats on public.organization_membership;
create trigger trg_sync_seats after insert or update or delete on public.organization_membership
  for each row execute function public.sync_seats_used();

-- Invite a member (owner/admin only): an 'invited' membership with a token.
create or replace function public.invite_member(p_org uuid, p_email text, p_role text default 'member')
returns text language plpgsql security definer set search_path = public as $$
declare v_token text;
begin
  if not public.has_org_role(p_org, array['owner','admin']) then raise exception 'not authorized'; end if;
  v_token := encode(gen_random_bytes(16), 'hex');
  insert into public.organization_membership(organization_id, person_id, org_role, status, invited_email, invited_by, invite_token)
    values (p_org, null, coalesce(nullif(p_role, ''), 'member'), 'invited', lower(p_email), auth.uid(), v_token);
  return v_token;
end; $$;

-- Accept an invite (the invited person, matched by email).
create or replace function public.accept_invite(p_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_org uuid; v_invited_email text; v_uid uuid := auth.uid(); v_email text;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select id, organization_id, invited_email into v_id, v_org, v_invited_email
    from public.organization_membership where invite_token = p_token and status = 'invited';
  if v_id is null then raise exception 'invalid or used invite'; end if;
  select email into v_email from auth.users where id = v_uid;
  if v_invited_email is not null and lower(v_invited_email) <> lower(coalesce(v_email, '')) then
    raise exception 'invite email mismatch';
  end if;
  insert into public.person(id, email) values (v_uid, v_email) on conflict (id) do nothing;
  update public.organization_membership
     set person_id = v_uid, status = 'active', joined_at = now(), invite_token = null
   where id = v_id;
  insert into public.role_assignment(organization_id, person_id, functional_role)
    values (v_org, v_uid, 'booker');
  return v_org;
end; $$;
