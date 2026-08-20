import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const generator = path.join(here, 'generate-route-inventory.mjs');

const result = spawnSync(process.execPath, [generator, '--stdout'], { cwd: root, encoding: 'utf8' });
assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
const inventory = JSON.parse(result.stdout);

const admin = inventory.routes.find((route) => route.path === '/admin');
assert.deepEqual(
  { guard: admin?.observedGuard, capability: admin?.requiredCapability, status: admin?.status },
  { guard: 'server-capability:admin.environment', capability: 'admin.environment', status: 'INVENTORIED' }
);

const adminPreflight = inventory.apis.find((api) => api.method === 'GET' && api.path === '/api/admin/capability');
assert.equal(adminPreflight?.observedAuth, 'requireAuth');
assert.equal(adminPreflight?.capability, 'admin.environment:preflight');

const processEvidence = inventory.apis.find((api) => api.method === 'POST' && api.path === '/api/process-evidence');
assert.equal(processEvidence?.observedAuth, 'requireAuth');
assert.equal(processEvidence?.source.file, 'server/index.js');

assert.equal(inventory.releaseBlockers.includes('TB08_ADMIN_ROUTE_GUARD_COLLISION'), false);
console.log('Route/API inventory captures the server-capability Admin guard and authenticated preflight surface.');
