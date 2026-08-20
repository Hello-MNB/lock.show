\set ON_ERROR_STOP on

BEGIN;

CREATE ROLE tech_baseline_tenant_a NOLOGIN;
CREATE ROLE tech_baseline_tenant_b NOLOGIN;
CREATE ROLE tech_baseline_ordinary NOLOGIN;
CREATE ROLE tech_baseline_environment_admin NOLOGIN;
CREATE ROLE tech_baseline_representation NOLOGIN;

CREATE SCHEMA tech_baseline;
CREATE TABLE tech_baseline.tenant_records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id text NOT NULL,
  payload text NOT NULL
);
CREATE TABLE tech_baseline.admin_records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payload text NOT NULL
);

ALTER TABLE tech_baseline.tenant_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_baseline.tenant_records FORCE ROW LEVEL SECURITY;
ALTER TABLE tech_baseline.admin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_baseline.admin_records FORCE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA tech_baseline TO tech_baseline_tenant_a, tech_baseline_tenant_b, tech_baseline_ordinary, tech_baseline_environment_admin;
GRANT SELECT, INSERT ON tech_baseline.tenant_records TO tech_baseline_tenant_a, tech_baseline_tenant_b, tech_baseline_ordinary;
GRANT SELECT ON tech_baseline.admin_records TO tech_baseline_tenant_a, tech_baseline_tenant_b, tech_baseline_ordinary, tech_baseline_environment_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA tech_baseline TO tech_baseline_tenant_a, tech_baseline_tenant_b, tech_baseline_ordinary, tech_baseline_environment_admin;

CREATE POLICY tenant_records_isolation ON tech_baseline.tenant_records
  FOR ALL
  USING (
    tenant_id = current_setting('app.tenant_id', true)
    AND (
      (current_user = 'tech_baseline_tenant_a' AND tenant_id = 'tenant-a')
      OR (current_user = 'tech_baseline_tenant_b' AND tenant_id = 'tenant-b')
    )
  )
  WITH CHECK (
    tenant_id = current_setting('app.tenant_id', true)
    AND (
      (current_user = 'tech_baseline_tenant_a' AND tenant_id = 'tenant-a')
      OR (current_user = 'tech_baseline_tenant_b' AND tenant_id = 'tenant-b')
    )
  );
CREATE POLICY environment_admin_only ON tech_baseline.admin_records
  FOR SELECT
  USING (
    current_user = 'tech_baseline_environment_admin'
    AND current_setting('app.capability', true) = 'admin.environment'
  );

INSERT INTO tech_baseline.tenant_records (tenant_id, payload)
VALUES ('tenant-a', 'a-private'), ('tenant-b', 'b-private');
INSERT INTO tech_baseline.admin_records (payload) VALUES ('admin-private');

SET LOCAL ROLE tech_baseline_tenant_a;
SELECT set_config('app.tenant_id', 'tenant-a', true);
DO $$
DECLARE visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM tech_baseline.tenant_records;
  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'cross-tenant read exposed % rows', visible_count;
  END IF;
END
$$;

DO $$
DECLARE denied boolean := false;
BEGIN
  BEGIN
    INSERT INTO tech_baseline.tenant_records (tenant_id, payload) VALUES ('tenant-b', 'forbidden');
  EXCEPTION WHEN insufficient_privilege THEN
    denied := true;
  END;
  IF NOT denied THEN
    RAISE EXCEPTION 'cross-tenant write was not denied';
  END IF;
END
$$;
RESET ROLE;

SET LOCAL ROLE tech_baseline_environment_admin;
SELECT set_config('app.capability', 'admin.environment', true);
DO $$
DECLARE visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM tech_baseline.admin_records;
  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'authorized environment admin saw % rows', visible_count;
  END IF;
END
$$;
RESET ROLE;

SET LOCAL ROLE tech_baseline_ordinary;
-- Deliberately spoof stale context. Caller-set values are not identity or membership.
SELECT set_config('app.tenant_id', 'tenant-a', true);
SELECT set_config('app.capability', 'admin.environment', true);
DO $$
DECLARE visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM tech_baseline.tenant_records;
  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'anonymous/private read exposed % rows', visible_count;
  END IF;
  SELECT count(*) INTO visible_count FROM tech_baseline.admin_records;
  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'ordinary user reached environment admin rows';
  END IF;
END
$$;
RESET ROLE;

-- A Person may lawfully belong to two Representation organizations, but the
-- active Workspace parameter must yield exactly one organization's roster.
CREATE TABLE tech_baseline.roster_membership (
  person_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  status text NOT NULL
);
CREATE TABLE tech_baseline.roster_grant (
  organization_id uuid NOT NULL,
  artist_id uuid NOT NULL,
  status text NOT NULL,
  expires_at timestamptz
);
INSERT INTO tech_baseline.roster_membership VALUES
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 'active'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000b', 'active');
INSERT INTO tech_baseline.roster_grant VALUES
  ('00000000-0000-4000-8000-00000000000a', '00000000-0000-4000-8000-0000000000a1', 'active', null),
  ('00000000-0000-4000-8000-00000000000a', '00000000-0000-4000-8000-0000000000a2', 'revoked', null),
  ('00000000-0000-4000-8000-00000000000b', '00000000-0000-4000-8000-0000000000b1', 'active', null),
  ('00000000-0000-4000-8000-00000000000b', '00000000-0000-4000-8000-0000000000b2', 'active', now() - interval '1 day');

CREATE FUNCTION tech_baseline.roster_for_active_workspace(p_person uuid, p_organization uuid)
RETURNS TABLE(artist_id uuid)
LANGUAGE sql STABLE AS $$
  SELECT grant_row.artist_id
  FROM tech_baseline.roster_grant grant_row
  WHERE grant_row.organization_id = p_organization
    AND EXISTS (
      SELECT 1 FROM tech_baseline.roster_membership membership
      WHERE membership.person_id = p_person
        AND membership.organization_id = p_organization
        AND membership.status = 'active'
    )
    AND grant_row.status = 'active'
    AND (grant_row.expires_at IS NULL OR grant_row.expires_at > now())
$$;
GRANT USAGE ON SCHEMA tech_baseline TO tech_baseline_representation;
GRANT SELECT ON tech_baseline.roster_membership, tech_baseline.roster_grant TO tech_baseline_representation;
GRANT EXECUTE ON FUNCTION tech_baseline.roster_for_active_workspace(uuid, uuid) TO tech_baseline_representation;

SET LOCAL ROLE tech_baseline_representation;
DO $$
DECLARE
  person_id constant uuid := '00000000-0000-4000-8000-000000000001';
  org_a constant uuid := '00000000-0000-4000-8000-00000000000a';
  org_b constant uuid := '00000000-0000-4000-8000-00000000000b';
  visible uuid[];
BEGIN
  SELECT array_agg(artist_id ORDER BY artist_id) INTO visible
  FROM tech_baseline.roster_for_active_workspace(person_id, org_a);
  IF visible IS DISTINCT FROM ARRAY['00000000-0000-4000-8000-0000000000a1'::uuid] THEN
    RAISE EXCEPTION 'active org A roster leaked or omitted rows: %', visible;
  END IF;

  SELECT array_agg(artist_id ORDER BY artist_id) INTO visible
  FROM tech_baseline.roster_for_active_workspace(person_id, org_b);
  IF visible IS DISTINCT FROM ARRAY['00000000-0000-4000-8000-0000000000b1'::uuid] THEN
    RAISE EXCEPTION 'active org B roster leaked or omitted rows: %', visible;
  END IF;

  IF EXISTS (
    SELECT 1 FROM tech_baseline.roster_for_active_workspace(
      '00000000-0000-4000-8000-000000000099', org_a
    )
  ) THEN
    RAISE EXCEPTION 'non-member reached active Workspace roster';
  END IF;
END
$$;
RESET ROLE;

ROLLBACK;
