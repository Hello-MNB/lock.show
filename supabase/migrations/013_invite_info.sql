-- ============================================================
-- 013 — INVITE INFO LOOKUP  (O4 growth-UX). The invitee is NOT a member yet, so
-- mem RLS hides the row; this SECURITY DEFINER RPC returns just the safe display
-- fields (org name, inviter, role) for the accept screen. Idempotent.
-- ============================================================
create or replace function public.invite_info(p_token text)
returns table(org_name text, inviter_name text, org_role text, invited_email text)
language sql security definer set search_path = public as $$
  select o.name, coalesce(p.display_name, p.email, 'GIGPROOF'), m.org_role, m.invited_email
  from public.organization_membership m
  join public.organization o on o.id = m.organization_id
  left join public.person p on p.id = m.invited_by
  where m.invite_token = p_token and m.status = 'invited'
$$;
