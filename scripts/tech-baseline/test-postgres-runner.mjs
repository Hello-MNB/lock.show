import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const runner = path.join(here, 'run-postgres-negatives.mjs');
const sql = fs.readFileSync(path.join(root, 'supabase', 'tests', 'tech-baseline', 'rls-negative.sql'), 'utf8');

assert.match(sql, /current_user\s*=\s*'tech_baseline_tenant_a'/);
assert.match(sql, /SET LOCAL ROLE tech_baseline_ordinary[\s\S]*set_config\('app\.tenant_id', 'tenant-a', true\)/);
assert.match(sql, /SET LOCAL ROLE tech_baseline_ordinary[\s\S]*set_config\('app\.capability', 'admin\.environment', true\)/);
assert.match(sql, /roster_for_active_workspace[\s\S]*active org A roster leaked or omitted rows/);
assert.match(sql, /roster_for_active_workspace[\s\S]*active org B roster leaked or omitted rows/);
assert.match(sql, /non-member reached active Workspace roster/);
const env = { ...process.env };
delete env.DATABASE_URL;
delete env.POSTGRES_CONTAINER_ID;

const result = spawnSync(process.execPath, [runner], { env, encoding: 'utf8' });
assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
assert.match(`${result.stdout}\n${result.stderr}`, /POSTGRES_REQUIRED/);
console.log('PostgreSQL negative runner fails closed when no real PostgreSQL target exists.');
