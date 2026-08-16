-- ============================================================
-- MULTI-ACT + NEGATIVE-CONTROL FIXTURE — layered ON TOP of appsec-fixture.sql.
--
-- WHY A SECOND FILE. appsec-fixture.sql is consumed by three shipped gates
-- whose assertions count rows in it. Adding actors there would silently move
-- those counts. This file is loaded ONLY by scripts/test-tenant-isolation.mjs,
-- so the isolation gate can add the actors it needs without touching anyone
-- else's arithmetic.
--
-- WHAT IT ADDS
--   ACT_B   — a SECOND Act held by the SAME person as the fixture artist.
--             CLAUDE.md: "Evidence is per-Act and NON-transferable — a new Act
--             starts empty." This fixture is what makes that claim testable.
--             It is inserted as the OWNER (postgres), NOT through RLS, and
--             that is itself a finding the gate asserts: policy `act_org`
--             (020:187) gates on can_access_artist(act.id), which resolves
--             through public.artists — and a non-default Act has no artists
--             row, so the shipped createAct() path (src/lib/db.js:146) can
--             never satisfy the WITH CHECK. Fail-closed, and feature-dead.
--   ORG_X   — an organization holding NO grant of any kind. The control every
--             "org A cannot see org B" assertion needs: without a party that
--             should see NOTHING, a passing test may only be proving that
--             everybody sees everything equally.
--   ORG_EXP — an org whose mandate EXPIRED yesterday (T-103's contract).
--   ORG_REV — an org whose mandate was REVOKED (status <> 'active').
--
-- Every id is a fixed literal so a failing assertion names something greppable.
-- Contains no real person, organization, act or request.
-- ============================================================

-- ── people ──────────────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a4', 'stranger@fixture.test'),
  ('00000000-0000-0000-0000-0000000000a5', 'expired@fixture.test'),
  ('00000000-0000-0000-0000-0000000000a6', 'revoked@fixture.test')
on conflict (id) do nothing;

insert into public.person (id, email, display_name) values
  ('00000000-0000-0000-0000-0000000000a4', 'stranger@fixture.test', 'Stranger'),
  ('00000000-0000-0000-0000-0000000000a5', 'expired@fixture.test',  'Expired Rep'),
  ('00000000-0000-0000-0000-0000000000a6', 'revoked@fixture.test',  'Revoked Rep')
on conflict (id) do nothing;

-- ── organizations ───────────────────────────────────────────────────────────
insert into public.organization (id, name, slug, plan, created_by, workspace_type) values
  ('00000000-0000-0000-0000-0000000000b4', 'Stranger Org', 'stranger-org', 'agency', '00000000-0000-0000-0000-0000000000a4', 'management'),
  ('00000000-0000-0000-0000-0000000000b5', 'Expired Org',  'expired-org',  'agency', '00000000-0000-0000-0000-0000000000a5', 'management'),
  ('00000000-0000-0000-0000-0000000000b6', 'Revoked Org',  'revoked-org',  'agency', '00000000-0000-0000-0000-0000000000a6', 'management')
on conflict (id) do nothing;

insert into public.organization_membership (organization_id, person_id, org_role, status) values
  ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-0000000000a4', 'owner', 'active'),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-0000000000a5', 'owner', 'active'),
  ('00000000-0000-0000-0000-0000000000b6', '00000000-0000-0000-0000-0000000000a6', 'owner', 'active')
on conflict do nothing;

-- ── the two dead mandates ───────────────────────────────────────────────────
insert into public.artist_access (id, organization_id, artist_id, access_level, status, scope, consent_at, expires_at) values
  ('00000000-0000-0000-0000-0000000000d5', '00000000-0000-0000-0000-0000000000b5',
   '00000000-0000-0000-0000-0000000000c1', 'manage', 'active', array['view']::text[], now() - interval '30 days', now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000000d6', '00000000-0000-0000-0000-0000000000b6',
   '00000000-0000-0000-0000-0000000000c1', 'manage', 'revoked', array['view']::text[], now() - interval '30 days', null)
on conflict (id) do nothing;

-- ── ACT_B — the second Act of the SAME person as the fixture artist ─────────
-- Inserted as owner because RLS refuses it; see the header. is_default=false.
insert into public.act (id, person_id, organization_id, stage_name, genre, is_default) values
  ('00000000-0000-0000-0000-0000000000cb', '00000000-0000-0000-0000-0000000000a1',
   '00000000-0000-0000-0000-0000000000b1', 'Second Act (techno)', 'techno', false)
on conflict (id) do nothing;

-- ACT_B's OWN evidence universe. Note what the schema FORCES here: every child
-- table's artist_id is NOT NULL and references public.artists, and ACT_B has no
-- artists row — so ACT_B's rows must hang off ACT_A's artists row. That is the
-- structural reason act_id can never be an authorization boundary today, and
-- the gate asserts the consequence rather than asserting the intent.
insert into public.claims (id, artist_id, act_id, claim_type, value, verification_status, visibility, artist_approved, verified_by, verified_at) values
  ('00000000-0000-0000-0000-00000000cb01', '00000000-0000-0000-0000-0000000000c1',
   '00000000-0000-0000-0000-0000000000cb', 'headline', 'ACT_B SECRET HEADLINE', 'verified', 'passport-ok', true, 'system', now())
on conflict (id) do nothing;

insert into public.profile_items (id, artist_id, act_id, item_type, title, visibility) values
  ('00000000-0000-0000-0000-00000000cb02', '00000000-0000-0000-0000-0000000000c1',
   '00000000-0000-0000-0000-0000000000cb', 'link', 'ACT_B SECRET SET VIDEO', 'passport-ok')
on conflict (id) do nothing;

insert into public.evidence_artifacts (id, artist_id, act_id, evidence_type, source_type, value) values
  ('00000000-0000-0000-0000-00000000cb03', '00000000-0000-0000-0000-0000000000c1',
   '00000000-0000-0000-0000-0000000000cb', 'link', 'public-profile', 'ACT_B SECRET EVIDENCE')
on conflict (id) do nothing;

insert into public.passport_versions (id, artist_id, act_id, snapshot, organization_id) values
  ('00000000-0000-0000-0000-00000000cb04', '00000000-0000-0000-0000-0000000000c1',
   '00000000-0000-0000-0000-0000000000cb', '{"act":"B","secret":true}'::jsonb, '00000000-0000-0000-0000-0000000000b1')
on conflict (id) do nothing;

insert into public.share_link (id, passport_version_id, artist_id, act_id, recipient_label, tracking_disclosed, open_count, opened_at) values
  ('00000000-0000-0000-0000-00000000cb05', '00000000-0000-0000-0000-00000000cb04',
   '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000cb',
   'ACT_B private recipient', true, 7, now())
on conflict (id) do nothing;

insert into public.availability_requests
  (id, artist_id, act_id, requester_name, event_type, location, status, organization_id) values
  ('00000000-0000-0000-0000-00000000cb06', '00000000-0000-0000-0000-0000000000c1',
   '00000000-0000-0000-0000-0000000000cb', 'ACT_B buyer', 'techno-warehouse', 'Ramla', 'new', null)
on conflict (id) do nothing;
