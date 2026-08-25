-- Guarded rollback for 20260825005702_workspace_authority.sql.
-- Refuses to erase lifecycle state that the pre-migration constraint cannot represent.
do $$
begin
  if exists (select 1 from public.organization_membership where status in ('cancelled','revoked','expired')) then
    raise exception 'workspace_authority_rollback_requires_membership_state_reconciliation';
  end if;
end $$;

drop function if exists public.transfer_workspace_ownership(uuid,uuid,bigint,bigint,uuid);
drop function if exists public.change_workspace_member_authority(uuid,text,text,bigint,uuid);
drop function if exists public.cancel_workspace_invitation(uuid,bigint,uuid);
drop function if exists public.resend_workspace_invitation(uuid,bigint,uuid);
drop function if exists public.rename_workspace(uuid,text,bigint,uuid);
drop function if exists public.commit_workspace_context(uuid,bigint,uuid,text);
drop function if exists public.resolve_primary_workspace(text);
drop function if exists public.get_workspace_creation_capabilities();
drop table if exists public.workspace_authority_receipt;

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
