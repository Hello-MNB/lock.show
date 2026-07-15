-- ============================================================
-- 035 — CREATE ADDITIONAL WORKSPACE RPC (rel-07.13 G3 · Screen A2/N12)
--
-- ⚠ REQUIRES OWNER APPROVAL BEFORE APPLYING TO THE LIVE DB (same rule as 027).
-- Until applied, the app's "+ New workspace" form fails SOFT with an honest
-- "needs migration 035" note (src/lib/orgs.js createWorkspace) — nothing
-- half-creates.
--
-- WHY AN RPC (and not client-side inserts): 008's mem_admin_write RLS only
-- lets an EXISTING owner/admin write membership rows, so the first owner
-- membership of a brand-new org can never be inserted by the client — the
-- exact chicken-and-egg 009 solved for signup with bootstrap_personal_org.
-- bootstrap_personal_org itself can't be reused here: it is deliberately
-- idempotent per owner (returns the EXISTING org when the caller already owns
-- one), so it can never create a SECOND workspace.
--
-- ADDITIVE ONLY: one new SECURITY DEFINER function (same pattern as 009/013/
-- 027/032). NO tables, NO columns, NO constraint or policy changes.
--
-- G3 BOUNDARY (DEPLOY-GAPS testable condition): this creates ONLY
-- organization + solo subscription + owner membership + role_assignment.
-- NOTHING is copied or moved — evidence, billing (subscription/entitlements)
-- and ArtistAccess grants stay bound to their original workspace; the new
-- workspace starts EMPTY. active_role_context is NOT touched here — the
-- client's normal switchOrg persistence handles it, keeping one write path.
--
-- Vocabulary: p_workspace_type uses 027's organization_workspace_type_check
-- values (artist / management / producer). p_functional_role must satisfy
-- 027's role_assignment_functional_role_check (the app passes 'artist' or
-- 'artist_manager'); the CHECK constraint is the enforcement — invalid values
-- fail loudly, never write.
-- ============================================================

create or replace function public.create_workspace(
  p_name text, p_workspace_type text default 'artist', p_functional_role text default 'artist'
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if p_workspace_type is null or p_workspace_type not in ('artist','management','producer') then
    raise exception 'invalid workspace_type: %', p_workspace_type;
  end if;

  -- Defensive: a person row normally exists (bootstrap/accept_invite create it),
  -- but membership.person_id references person — never fail on the edge case.
  insert into public.person(id) values (v_uid) on conflict (id) do nothing;

  insert into public.organization(name, plan, created_by, workspace_type)
    values (coalesce(nullif(p_name, ''), 'My workspace'), 'solo', v_uid, p_workspace_type)
    returning id into v_org;
  insert into public.subscription(organization_id, plan, seats_included, seats_used, status)
    values (v_org, 'solo', 1, 1, 'active');
  insert into public.organization_membership(organization_id, person_id, org_role, status, joined_at)
    values (v_org, v_uid, 'owner', 'active', now());
  insert into public.role_assignment(organization_id, person_id, functional_role)
    values (v_org, v_uid, coalesce(nullif(p_functional_role, ''), 'artist'));
  return v_org;
end; $$;
