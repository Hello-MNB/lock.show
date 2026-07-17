-- ============================================================
-- ⛔ FROZEN — DO NOT APPLY. NOT applied to the live DB (live = 001–020, 022–028).
-- ============================================================
-- Applying this file OR rebuilding the DB from migrations in order WILL BREAK
-- the running app until the app is updated in lockstep. It drops the
-- 'mirror-only' value (claims.visibility) and 'booker' (profiles.role) that the
-- CURRENT code still writes:
--   • src/lib/constants.js  VISIBILITY.MIRROR_ONLY='mirror-only', ROLES.BOOKER='booker'
--   • src/lib/db.js         saveClaim writes visibility='mirror-only'
--   • src/lib/orgs.js       bootstrap_personal_org default 'booker'; upsert profiles.role
-- After 021, every AI-pipeline claim insert fails claims_visibility_check and the
-- labeling loop silently stops writing (verified: DB audit 9 Jul 2026).
-- Before this is EVER applied: either (a) update constants.js/db.js/orgs.js to the
-- new vocabulary in the same change, or (b) re-add the legacy values as tolerated
-- the way migration 027 did for role_assignment.functional_role.
-- ============================================================
-- GIGPROOF — migration 021: VOCABULARY & CONSENT ALIGNMENT
--
-- WHAT THIS DOES (plain language):
--   The database still speaks retired language. Canon locked the new words:
--     • "mirror-only"  →  "working-only"      (Mirror is retired; one Passport, views)
--     • "booker"       →  "booking_manager"   (buyer term locked: booking manager / אמרגן)
--     •  + "venue_programmer" becomes a legal role (distinct persona, canon)
--     • consent scopes →  the four canonical Amendment-13 scopes:
--         privacy-processing · public-publication · thirdparty-evidence · marketing
--   This migration renames the stored values, tightens the allowed-value rules,
--   and fixes the invite-acceptance function that hard-coded 'booker'.
--
--   ⚠ LOCKSTEP: the app code writes these same strings. The matching code update
--   ships in the SAME session as this migration — DB first, code immediately after.
--
-- Reversible: 021_*.down.sql (consent originals stashed in scope_legacy).
-- Idempotent: value-updates are WHERE-guarded; constraints dropped-if-exists first.
-- ============================================================

-- ── A · visibility: mirror-only → working-only ───────────────────────────────
-- claims.visibility (values, CHECK, and the column default)
alter table public.claims drop constraint if exists claims_visibility_check;
update public.claims set visibility = 'working-only' where visibility = 'mirror-only';
alter table public.claims alter column visibility set default 'working-only';
alter table public.claims add constraint claims_visibility_check
  check (visibility in ('working-only','passport-ok','internal'));

-- profile_items.visibility
alter table public.profile_items drop constraint if exists profile_items_visibility_check;
update public.profile_items set visibility = 'working-only' where visibility = 'mirror-only';
alter table public.profile_items alter column visibility set default 'passport-ok';
alter table public.profile_items add constraint profile_items_visibility_check
  check (visibility in ('working-only','passport-ok'));

-- ── B · roles: booker → booking_manager, add venue_programmer ────────────────
-- role_assignment.functional_role (the org-model role that drives routing)
alter table public.role_assignment drop constraint if exists role_assignment_functional_role_check;
update public.role_assignment set functional_role = 'booking_manager' where functional_role = 'booker';
-- canon: "agency" is an organization PLAN, not a person's role — members are booking managers
update public.role_assignment set functional_role = 'booking_manager' where functional_role = 'agency';
alter table public.role_assignment add constraint role_assignment_functional_role_check
  check (functional_role in ('artist','booking_manager','artist_manager','producer','venue_programmer','operator'));
  -- 'operator' kept transitionally: live bootstrap writes it; operator auth split is a later phase.

-- profiles.role (legacy router table — still read by the app; same rename)
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'booking_manager' where role = 'booker';
alter table public.profiles add constraint profiles_role_check
  check (role in ('artist','agency','booking_manager','artist_manager','producer','venue_programmer','operator'));
  -- 'agency' kept transitionally in the legacy table: the app's RequireAgency path still uses it.

-- Two DB functions hard-code the retired 'booker' term (defined in 009).
-- Both are recreated VERBATIM from 009 with ONLY that one string changed —
-- no behavior change (email-mismatch guard, idempotency, everything kept).

-- 009's bootstrap_personal_org — fallback role 'booker' → 'booking_manager'
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
    values (v_org, v_uid, coalesce(nullif(p_functional_role, ''), 'booking_manager'));
  insert into public.active_role_context(person_id, active_organization_id)
    values (v_uid, v_org)
    on conflict (person_id) do update set active_organization_id = excluded.active_organization_id, updated_at = now();
  return v_org;
end; $$;

-- 009's accept_invite — joiner role 'booker' → 'booking_manager'
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
    values (v_org, v_uid, 'booking_manager');
  return v_org;
end; $$;

-- ── C · consent scopes → the four canonical Amendment-13 scopes ──────────────
-- Stash the original wording first (makes this reversible + auditable).
alter table public.consent_records add column if not exists scope_legacy text;
update public.consent_records set scope_legacy = scope
 where scope_legacy is null
   and scope in ('privacy-policy','data-processing','public-publish','evidence-storage');

-- Map old → canonical. (privacy-policy and data-processing both fold into
-- privacy-processing — consent #1; the rows remain as separate log entries.)
update public.consent_records set scope = 'privacy-processing' where scope in ('privacy-policy','data-processing');
update public.consent_records set scope = 'public-publication' where scope = 'public-publish';
update public.consent_records set scope = 'thirdparty-evidence' where scope = 'evidence-storage';

-- Lock the vocabulary. 'account-deletion' kept: existing rows log deletion
-- requests (an event record, not a consent scope — moves to audit_event later).
alter table public.consent_records drop constraint if exists consent_records_scope_check;
alter table public.consent_records add constraint consent_records_scope_check
  check (scope in ('privacy-processing','public-publication','thirdparty-evidence','marketing','account-deletion'));
