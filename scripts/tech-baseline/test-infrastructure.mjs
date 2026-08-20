import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const failures = [];

const check = (name, fn) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
};

check('root runtime is pinned to Node 22', () => {
  assert.match(read('.nvmrc').trim(), /^22(?:\.\d+\.\d+)?$/);
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.engines?.node, '22.x');
  assert.match(pkg.packageManager ?? '', /^npm@\d+\.\d+\.\d+$/);
});

check('verification workflow is fail-closed and provisions PostgreSQL', () => {
  const workflow = read('.github/workflows/verify.yml');
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:/);
  assert.match(workflow, /postgres:16/);
  assert.match(workflow, /npm ci --no-audit --no-fund/);
  assert.match(workflow, /npm run verify/);
  assert.match(workflow, /npm run tech-baseline:verify/);
  assert.match(workflow, /npm audit --omit=dev --audit-level=high/);
  assert.match(workflow, /npm --prefix website-next audit --audit-level=high/);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/);
  assert.doesNotMatch(workflow, /\|\|\s*true/);
});

check('application SPA fallback preserves Vercel API functions', () => {
  const config = JSON.parse(read('vercel.json'));
  const fallback = config.rewrites?.find((rule) => rule.destination === '/index.html');
  assert.ok(fallback, 'missing SPA fallback');
  const matcher = new RegExp(`^${fallback.source}$`);
  assert.equal(matcher.test('/artist/home'), true, 'ordinary app routes must reach the SPA');
  assert.equal(matcher.test('/api/health'), false, 'SPA fallback must not shadow /api functions');
});

check('deploy cadence is explicit and never authorizes blind production deploys', () => {
  const contract = JSON.parse(read('src/contracts/technical-baseline/contract.json'));
  assert.equal(contract.operations?.deployCadence?.preview, 'EACH_GREEN_ATOMIC_PACKET');
  assert.equal(contract.operations?.deployCadence?.production, 'MAX_ONE_CONTROLLED_WINDOW_PER_DAY');
  assert.equal(contract.operations?.deployCadence?.automaticProduction, false);
  assert.deepEqual(contract.operations?.deployCadence?.postDeployTests, [
    'public-marketing-smoke',
    'google-auth-smoke',
    'context-admin-smoke',
    'radar-scanner-smoke',
    'passport-recipient-smoke',
    'monitoring-rollback-check'
  ]);
});

if (failures.length > 0) {
  console.error(`\n${failures.length} infrastructure contract failure(s)`);
  process.exit(1);
}

console.log('\nInfrastructure contract verified.');
