-- Guarded rollback for 20260825005702_workspace_authority.sql.
-- Refuses to erase lifecycle state that the pre-migration constraint cannot represent.
do $$
begin
  if exists (select 1 from public.workspace_authority_receipt) then
    raise exception 'workspace_authority_rollback_requires_receipt_reconciliation';
  end if;
  if exists (select 1 from public.workspace_ownership_offer) then
    raise exception 'workspace_authority_rollback_requires_offer_reconciliation';
  end if;
  if exists (select 1 from public.organization_membership where status in ('inactive','cancelled','declined','revoked','expired')) then
    raise exception 'workspace_authority_rollback_requires_membership_state_reconciliation';
  end if;
end $$;

drop function if exists public.transfer_workspace_ownership(uuid,uuid,bigint,bigint,bigint,bigint,timestamptz,uuid);
drop function if exists public.cancel_workspace_ownership_offer(uuid,uuid);
drop function if exists public.respond_workspace_ownership_offer(uuid,text,bigint,bigint,uuid);
drop function if exists public.list_my_workspace_ownership_offers(uuid);
drop function if exists public.offer_workspace_ownership(uuid,uuid,bigint,bigint,bigint,bigint,timestamptz,uuid);
drop function if exists public.lock_workspace_authority(uuid);
drop function if exists public.change_workspace_member_authority(uuid,text,text,bigint,uuid);
drop function if exists public.cancel_workspace_invitation(uuid,bigint,uuid);
drop function if exists public.resend_workspace_invitation(uuid,bigint,uuid);
drop function if exists public.rename_workspace(uuid,text,bigint,uuid);
drop function if exists public.commit_workspace_context(uuid,bigint,uuid,text);
drop function if exists public.resolve_primary_workspace(text);
drop function if exists public.get_workspace_creation_capabilities();
drop function if exists public.decline_workspace_invitation(text);
drop function if exists public.accept_invite(text);
drop function if exists public.invite_member(uuid,text,text,uuid);
drop index if exists public.workspace_pending_invitation_email_unique;
drop table if exists public.workspace_ownership_offer;
drop table if exists public.workspace_authority_receipt;

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

create function public.accept_invite(p_token text)
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
    values (v_org, v_uid, 'booking_manager');
  return v_org;
end; $$;

drop policy if exists arc_self_read on public.active_role_context;
drop policy if exists arc_self on public.active_role_context;
create policy arc_self on public.active_role_context for all
  using (person_id = auth.uid()) with check (person_id = auth.uid());
grant insert, update, delete on public.active_role_context to anon, authenticated;

drop policy if exists mem_admin_write on public.organization_membership;
create policy mem_admin_write on public.organization_membership for all
  using (public.has_org_role(organization_id, array['owner','admin']))
  with check (public.has_org_role(organization_id, array['owner','admin']));
grant insert, update, delete on public.organization_membership to anon, authenticated;

drop policy if exists ra_admin_write on public.role_assignment;
create policy ra_admin_write on public.role_assignment for all
  using (public.has_org_role(organization_id, array['owner','admin']))
  with check (public.has_org_role(organization_id, array['owner','admin']));
grant insert, update, delete on public.role_assignment to anon, authenticated;

drop policy if exists org_admin_update on public.organization;
create policy org_admin_update on public.organization for update
  using (public.has_org_role(id, array['owner','admin']))
  with check (public.has_org_role(id, array['owner','admin']));
grant update on public.organization to anon, authenticated;

alter table public.organization_membership drop constraint if exists organization_membership_status_check;
alter table public.organization_membership add constraint organization_membership_status_check
  check (status in ('active','invited','suspended'));
alter table public.organization_membership
  drop column if exists suspended_at,
  drop column if exists invite_last_sent_at,
  drop column if exists invite_expires_at,
  drop column if exists authority_version;
alter table public.active_role_context
  drop column if exists last_receipt,
  drop column if exists context_version;
alter table public.organization drop column if exists authority_version;
