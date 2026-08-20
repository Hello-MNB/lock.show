-- Roster invitations for artists who do not yet have a LOCK SHOW account.
-- The raw invitation token is returned once by the server and is never stored.
-- The service-role API is the only reader/writer; browser roles receive no
-- direct table privileges. Artist access becomes active only after an explicit
-- authenticated acceptance.

create extension if not exists pgcrypto;

create table if not exists public.roster_invitation (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete restrict,
  invited_email text not null,
  artist_name text not null,
  scope text[] not null default '{view}',
  territory text,
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled','expired')),
  artist_id uuid references public.artists(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint roster_invitation_scope_check
    check (scope <@ array['view','upload','edit','share','publish']::text[]),
  constraint roster_invitation_email_check
    check (invited_email = lower(btrim(invited_email)) and position('@' in invited_email) > 1)
);

create index if not exists idx_roster_invitation_org_status
  on public.roster_invitation(organization_id, status, created_at desc);
create index if not exists idx_roster_invitation_email_status
  on public.roster_invitation(invited_email, status, expires_at);

alter table public.roster_invitation enable row level security;
revoke all on table public.roster_invitation from anon, authenticated;

-- Close the historic direct-write bypass. Requests and responses are mediated
-- by the validated RPC/API paths; a representation workspace cannot activate
-- its own access grant and an Artist cannot rewrite grant identity/scope fields.
drop policy if exists aa_admin_write on public.artist_access;
drop policy if exists aa_artist_owner_respond on public.artist_access;

create or replace function public.accept_roster_invitation(
  p_invitation uuid,
  p_user uuid,
  p_artist uuid
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_invite public.roster_invitation%rowtype;
  v_email text;
  v_artist_owner uuid;
  v_artist_org uuid;
  v_access uuid;
begin
  select * into v_invite
    from public.roster_invitation
   where id = p_invitation
   for update;

  if v_invite.id is null or v_invite.status <> 'pending' then
    raise exception 'roster_invitation_not_pending';
  end if;
  if v_invite.expires_at <= now() then
    update public.roster_invitation set status = 'expired' where id = p_invitation;
    raise exception 'roster_invitation_expired';
  end if;

  select lower(email) into v_email from auth.users where id = p_user;
  if v_email is null or v_email <> v_invite.invited_email then
    raise exception 'roster_invitation_email_mismatch';
  end if;

  select created_by, owner_organization_id into v_artist_owner, v_artist_org
    from public.artists where id = p_artist;
  if v_artist_owner is null or v_artist_owner <> p_user then
    raise exception 'roster_invitation_artist_forbidden';
  end if;
  if v_artist_org = v_invite.organization_id then
    raise exception 'roster_invitation_same_workspace';
  end if;

  insert into public.artist_access(
    organization_id, artist_id, access_level, status,
    scope, territory, consent_at
  ) values (
    v_invite.organization_id, p_artist, 'manage', 'active',
    v_invite.scope, v_invite.territory, now()
  )
  on conflict (organization_id, artist_id) do update
    set status = 'active', scope = excluded.scope,
        territory = excluded.territory, consent_at = excluded.consent_at
  returning id into v_access;

  update public.roster_invitation
     set status = 'accepted', artist_id = p_artist,
         accepted_by = p_user, accepted_at = now()
   where id = p_invitation;

  return v_access;
end;
$$;

revoke all on function public.accept_roster_invitation(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.accept_roster_invitation(uuid, uuid, uuid) to service_role;

comment on table public.roster_invitation is
  'Single-use, expiring invitation for a not-yet-registered Artist to join a representation roster by explicit consent.';
