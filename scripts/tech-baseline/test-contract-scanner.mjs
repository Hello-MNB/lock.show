import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scanner = path.join(here, 'scan-contracts.mjs');
const productRevision = 'AIroW371UC10YF2gfrHMw9fZIbkXfjVV7D1EbPvVBKlGDSJdQB9THqGF44uwvfivHmylhfW8-iG7dv7lUlchgZlz2_Jkum2neOAh7XLN6PwC';

const valid = {
  schemaVersion: '1.0.0',
  sources: [
    { id: 'B4-30.10', version: '7.1', revision: productRevision, authority: 'product', status: 'accepted' },
    { id: 'B4-40.10', version: '4.5', revision: 'AIroW36nlncplN1J7snw47466LP39C0MAPIsLbmr7Z-RutAk18xmE6mc4Se-hrb4JpLd7OICkA2tTgnSGLOuNWuafBRiCmOApaKH0-_wVVOC', authority: 'technology', status: 'stale-binding' },
    { id: 'B4-40.20', version: '2.20', revision: 'AIroW36WC5t_VnL9MI33VX2udi12Z__MAcgJt_z--gMIbABGuGtROfsaeN0eCgk9RJkdohkjFOoEcg7FjgHjNbOONbroE6I52M4lh8gg5jWM', authority: 'technology', status: 'stale-packet' }
  ],
  designSystem: {
    tokens: [{ id: 'surface.default', type: 'color', value: null, binding: 'LANE_B_REQUIRED' }],
    semanticAliases: [{ id: 'surface.canvas', target: 'surface.default' }],
    modes: ['he-rtl', 'en-ltr', 'mixed'],
    components: [{ id: 'CMP-AppShell', states: ['loading', 'empty', 'error', 'ready', 'denied'], api: ['locale', 'direction', 'workspaceId', 'capabilities'] }]
  },
  locale: {
    modes: ['he-rtl', 'en-ltr', 'mixed'],
    logicalProperties: ['marginInlineStart', 'paddingInlineEnd', 'insetInlineStart'],
    requiredLocales: ['he', 'en'],
    mixedScriptPolicy: 'segment-direction'
  },
  taxonomy: {
    ids: ['Entity:Person', 'Workspace:Admin', 'Role:platform_owner', 'Act:primary', 'Object:Passport', 'Case:PD-005', 'SCREEN:Admin', 'FLOW:ContextSwitch', 'StringKey:Nav.Admin'],
    references: [{ from: 'SCREEN:Admin', to: 'FLOW:ContextSwitch' }, { from: 'SCREEN:Admin', to: 'StringKey:Nav.Admin' }]
  },
  navigationProjection: {
    sourceId: 'PD-005',
    sourceRevision: productRevision,
    semantics: 'OPEN_NAV_TRUTH_001',
    universal: false,
    items: []
  },
  routes: [{ path: '/admin', auth: 'required', capability: 'admin.environment', denial: '403', returnContract: 'preserve-origin' }],
  admin: {
    authority: 'server',
    forbiddenAuthoritySignals: ['email', 'client-role', 'route'],
    contextPhases: ['SELECT', 'PREFLIGHT', 'COMMIT', 'RECEIPT'],
    rollbackRequired: true,
    ordinaryUserDenied: true
  },
  rls: {
    execution: 'postgres-required',
    allowSkip: false,
    negatives: ['cross-tenant-read', 'cross-tenant-write', 'ordinary-user-admin', 'anon-private-read']
  },
  migrations: {
    status: 'NO_FIRST_SLICE_MIGRATION_SELECTED',
    included: [],
    excluded: ['040', '041', '042', '043', '044', '045', '046', '047', '048', '049', '050', '051']
  },
  operations: {
    canonicalAppOrigin: 'https://app.lock.show',
    productionActionAuthorized: false,
    providerEvidence: 'OPEN_EVIDENCE'
  }
};

const run = (bundle) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lock-show-contract-'));
  const input = path.join(dir, 'contract.json');
  fs.writeFileSync(input, JSON.stringify(bundle));
  const result = spawnSync(process.execPath, [scanner, input], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
};

const expectValid = (bundle) => {
  const result = run(bundle);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
};

const expectInvalid = (bundle, code) => {
  const result = run(bundle);
  assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
  assert.match(`${result.stdout}\n${result.stderr}`, new RegExp(code));
};

const mutate = (fn) => {
  const copy = structuredClone(valid);
  fn(copy);
  return copy;
};

expectValid(valid);
expectInvalid(mutate((x) => { x.sources[0].revision = ''; }), 'SOURCE_REVISION_REQUIRED');
expectInvalid(mutate((x) => { x.designSystem.tokens[0].value = '#ffffff'; }), 'VISUAL_VALUE_NOT_AUTHORIZED');
expectInvalid(mutate((x) => { x.designSystem.components[0].states = ['ready']; }), 'COMPONENT_STATES_INCOMPLETE');
expectInvalid(mutate((x) => { x.locale.logicalProperties.push('marginLeft'); }), 'PHYSICAL_DIRECTION_PROPERTY');
expectInvalid(mutate((x) => { x.taxonomy.ids.push('SCREEN:Admin'); }), 'TAXONOMY_DUPLICATE_ID');
expectInvalid(mutate((x) => { x.taxonomy.references[0].to = 'FLOW:Missing'; }), 'TAXONOMY_ORPHAN_REFERENCE');
expectInvalid(mutate((x) => { x.navigationProjection.universal = true; }), 'NAV_TRUTH_OPEN');
expectInvalid(mutate((x) => { x.admin.authority = 'client'; }), 'ADMIN_SERVER_AUTHORITY_REQUIRED');
expectInvalid(mutate((x) => { x.rls.allowSkip = true; }), 'POSTGRES_FAIL_CLOSED_REQUIRED');
expectInvalid(mutate((x) => { x.migrations.included = ['048']; }), 'MIGRATION_OUT_OF_SLICE');
expectInvalid(mutate((x) => { x.operations.productionActionAuthorized = true; }), 'PRODUCTION_AUTHORIZATION_FORBIDDEN');

console.log('Contract scanner behavior verified.');
