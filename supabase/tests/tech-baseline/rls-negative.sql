\set ON_ERROR_STOP on

BEGIN;

CREATE ROLE tech_baseline_tenant_a NOLOGIN;
CREATE ROLE tech_baseline_tenant_b NOLOGIN;
CREATE ROLE tech_baseline_ordinary NOLOGIN;

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

GRANT USAGE ON SCHEMA tech_baseline TO tech_baseline_tenant_a, tech_baseline_tenant_b, tech_baseline_ordinary;
GRANT SELECT, INSERT ON tech_baseline.tenant_records TO tech_baseline_tenant_a, tech_baseline_tenant_b, tech_baseline_ordinary;
GRANT SELECT ON tech_baseline.admin_records TO tech_baseline_tenant_a, tech_baseline_tenant_b, tech_baseline_ordinary;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA tech_baseline TO tech_baseline_tenant_a, tech_baseline_tenant_b, tech_baseline_ordinary;

CREATE POLICY tenant_records_isolation ON tech_baseline.tenant_records
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
CREATE POLICY environment_admin_only ON tech_baseline.admin_records
  FOR SELECT
  USING (current_setting('app.capability', true) = 'admin.environment');

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

SET LOCAL ROLE tech_baseline_ordinary;
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

ROLLBACK;
