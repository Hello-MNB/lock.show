-- ============================================================
-- APPSEC FIXTURE — two organizations, one artist, three demand rows.
-- Loaded into a throwaway database by scripts/lib/pgharness.mjs. Contains no
-- real person, no real organization and no real request: every id is a fixed
-- literal so a failing assertion names something a human can grep for.
--
-- THE SHAPE THAT MATTERS (APPSEC F2 · cross-organization demand):
--   ORG_OWN owns artist X. ORG_A and ORG_B each hold an ACTIVE artist_access
--   grant on the SAME artist — which is the ordinary state of a roster artist
--   with two representatives, and the state in which "who may see whose
--   inbound demand" stops being obvious.
--   REQ_A belongs to ORG_A. REQ_B belongs to ORG_B. REQ_OWN belongs to nobody
--   in particular (organization_id IS NULL), which is what the anonymous
--   public-Passport insert path actually writes, and therefore means "the
--   artist's own context".
-- ============================================================

-- users / persons
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'own@fixture.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'rep-a@fixture.test'),
  ('00000000-0000-0000-0000-0000000000a3', 'rep-b@fixture.test')
on conflict (id) do nothing;

insert into public.person (id, email, display_name) values
  ('00000000-0000-0000-0000-0000000000a1', 'own@fixture.test',   'Owner'),
  ('00000000-0000-0000-0000-0000000000a2', 'rep-a@fixture.test',  'Rep A'),
  ('00000000-0000-0000-0000-0000000000a3', 'rep-b@fixture.test',  'Rep B')
on conflict (id) do nothing;

-- organizations
insert into public.organization (id, name, slug, plan, created_by, workspace_type) values
  ('00000000-0000-0000-0000-0000000000b1', 'Own Org',   'own-org',  'solo',   '00000000-0000-0000-0000-0000000000a1', 'artist'),
  ('00000000-0000-0000-0000-0000000000b2', 'Agency A',  'agency-a', 'agency', '00000000-0000-0000-0000-0000000000a2', 'management'),
  ('00000000-0000-0000-0000-0000000000b3', 'Agency B',  'agency-b', 'agency', '00000000-0000-0000-0000-0000000000a3', 'management')
on conflict (id) do nothing;

insert into public.organization_membership (organization_id, person_id, org_role, status) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', 'owner', 'active'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a2', 'owner', 'active'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000a3', 'owner', 'active')
on conflict do nothing;

-- the artist, owned by ORG_OWN and published
insert into public.artists (id, created_by, stage_name, published, owner_organization_id, organization_id) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1', 'Fixture Act',
   true, '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b1')
on conflict (id) do nothing;

-- BOTH agencies hold a live mandate on the SAME artist
insert into public.artist_access (id, organization_id, artist_id, access_level, status, scope, consent_at) values
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000b2',
   '00000000-0000-0000-0000-0000000000c1', 'manage', 'active', array['view']::text[], now()),
  ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-0000000000b3',
   '00000000-0000-0000-0000-0000000000c1', 'manage', 'active', array['view']::text[], now())
on conflict (id) do nothing;

-- evidence: one passport-approved verified claim (feeds R2) and one
-- producer-confirmed strength (feeds R5)
insert into public.claims (id, artist_id, claim_type, verification_status, visibility, verified_by, verified_at) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000c1',
   'headline', 'verified', 'passport-ok', 'system', now())
on conflict (id) do nothing;

-- THREE demand rows, one per context. This is the whole point of the fixture.
insert into public.availability_requests
  (id, artist_id, requester_name, event_type, location, status, organization_id) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000c1',
   'Buyer for A', 'club-a',      'Tel Aviv',  'new', '00000000-0000-0000-0000-0000000000b2'),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-0000000000c1',
   'Buyer for B', 'festival-b',  'Haifa',     'new', '00000000-0000-0000-0000-0000000000b3'),
  ('00000000-0000-0000-0000-0000000000f3', '00000000-0000-0000-0000-0000000000c1',
   'Buyer direct', 'private-own', 'Jerusalem', 'new', null)
on conflict (id) do nothing;

-- a published Passport version to bind share links to
insert into public.passport_versions (id, artist_id, snapshot, organization_id) values
  ('00000000-0000-0000-0000-00000000ffa1', '00000000-0000-0000-0000-0000000000c1',
   '{"fixture": true}'::jsonb, '00000000-0000-0000-0000-0000000000b1')
on conflict (id) do nothing;
