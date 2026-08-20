import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const REQUIRED_STATES = ['loading', 'empty', 'error', 'ready', 'denied'];
const REQUIRED_MODES = ['he-rtl', 'en-ltr', 'mixed'];
const REQUIRED_PHASES = ['SELECT', 'PREFLIGHT', 'COMMIT', 'RECEIPT'];
const REQUIRED_RLS_NEGATIVES = ['cross-tenant-read', 'cross-tenant-write', 'ordinary-user-admin', 'anon-private-read'];
const OUT_OF_SLICE_MIGRATIONS = new Set(Array.from({ length: 12 }, (_, index) => String(index + 40).padStart(3, '0')));
const PHYSICAL_DIRECTION = /^(margin|padding|border|inset)?(Left|Right)$|^(left|right)$/;

const missing = (actual, required) => required.filter((item) => !actual?.includes(item));

export function validateContractBundle(bundle) {
  const errors = [];
  const fail = (code, detail) => errors.push({ code, detail });

  if (bundle?.schemaVersion !== '1.0.0') fail('SCHEMA_VERSION_UNSUPPORTED', bundle?.schemaVersion);

  const sources = Array.isArray(bundle?.sources) ? bundle.sources : [];
  const sourceIds = new Set();
  for (const source of sources) {
    if (!source?.id || !source?.version || !source?.revision) fail('SOURCE_REVISION_REQUIRED', source?.id ?? 'unknown');
    if (sourceIds.has(source?.id)) fail('SOURCE_DUPLICATE_ID', source?.id);
    sourceIds.add(source?.id);
  }
  if (!sources.some((source) => source.authority === 'product' && source.status === 'accepted')) {
    fail('ACCEPTED_PRODUCT_SOURCE_REQUIRED', 'no accepted Product source');
  }

  const tokens = bundle?.designSystem?.tokens ?? [];
  for (const token of tokens) {
    if (token.value !== null || token.binding !== 'LANE_B_REQUIRED') fail('VISUAL_VALUE_NOT_AUTHORIZED', token.id);
  }
  const tokenIds = new Set(tokens.map((token) => token.id));
  for (const alias of bundle?.designSystem?.semanticAliases ?? []) {
    if (!tokenIds.has(alias.target)) fail('DS_ALIAS_TARGET_MISSING', alias.id);
  }
  if (missing(bundle?.designSystem?.modes, REQUIRED_MODES).length > 0) fail('DS_MODES_INCOMPLETE', 'he-rtl,en-ltr,mixed required');
  for (const component of bundle?.designSystem?.components ?? []) {
    const absent = missing(component.states, REQUIRED_STATES);
    if (absent.length > 0) fail('COMPONENT_STATES_INCOMPLETE', `${component.id}:${absent.join(',')}`);
  }

  if (missing(bundle?.locale?.modes, REQUIRED_MODES).length > 0 || missing(bundle?.locale?.requiredLocales, ['he', 'en']).length > 0 || bundle?.locale?.mixedScriptPolicy !== 'segment-direction') {
    fail('LOCALE_CONTRACT_INCOMPLETE', 'HE/RTL, EN/LTR and mixed-script are required');
  }
  for (const property of bundle?.locale?.logicalProperties ?? []) {
    if (PHYSICAL_DIRECTION.test(property)) fail('PHYSICAL_DIRECTION_PROPERTY', property);
  }

  const taxonomyIds = bundle?.taxonomy?.ids ?? [];
  const taxonomySet = new Set();
  for (const id of taxonomyIds) {
    if (taxonomySet.has(id)) fail('TAXONOMY_DUPLICATE_ID', id);
    taxonomySet.add(id);
  }
  for (const reference of bundle?.taxonomy?.references ?? []) {
    if (!taxonomySet.has(reference.from) || !taxonomySet.has(reference.to)) fail('TAXONOMY_ORPHAN_REFERENCE', `${reference.from}->${reference.to}`);
  }

  const nav = bundle?.navigationProjection;
  if (nav?.semantics === 'OPEN_NAV_TRUTH_001' && (nav.universal !== false || nav.items?.length !== 0)) fail('NAV_TRUTH_OPEN', 'universal navigation cannot be bound');
  if (!sources.some((source) => source.id === 'B4-30.10' && source.revision === nav?.sourceRevision)) fail('NAV_SOURCE_REVISION_MISMATCH', nav?.sourceRevision);

  for (const route of bundle?.routes ?? []) {
    if (!route.path || !route.auth || !route.capability || !route.denial || !route.returnContract) fail('ROUTE_CONTRACT_INCOMPLETE', route.path ?? 'unknown');
  }

  const admin = bundle?.admin;
  if (admin?.authority !== 'server') fail('ADMIN_SERVER_AUTHORITY_REQUIRED', admin?.authority);
  if (missing(admin?.contextPhases, REQUIRED_PHASES).length > 0 || admin?.rollbackRequired !== true) fail('ADMIN_TWO_PHASE_CONTRACT_REQUIRED', 'SELECT/PREFLIGHT/COMMIT/RECEIPT + rollback');
  if (admin?.ordinaryUserDenied !== true) fail('ADMIN_ORDINARY_USER_DENIAL_REQUIRED', 'ordinary user must be denied');

  const rls = bundle?.rls;
  if (rls?.execution !== 'postgres-required' || rls?.allowSkip !== false || missing(rls?.negatives, REQUIRED_RLS_NEGATIVES).length > 0) {
    fail('POSTGRES_FAIL_CLOSED_REQUIRED', 'PostgreSQL negatives cannot skip');
  }

  for (const migration of bundle?.migrations?.included ?? []) {
    if (OUT_OF_SLICE_MIGRATIONS.has(migration) || bundle?.migrations?.excluded?.includes(migration)) fail('MIGRATION_OUT_OF_SLICE', migration);
  }

  if (bundle?.operations?.canonicalAppOrigin !== 'https://app.lock.show') fail('CANONICAL_APP_ORIGIN_REQUIRED', bundle?.operations?.canonicalAppOrigin);
  if (bundle?.operations?.productionActionAuthorized !== false) fail('PRODUCTION_AUTHORIZATION_FORBIDDEN', 'action-time approval is absent');

  return errors;
}

function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('USAGE: scan-contracts.mjs <contract.json>');
    process.exit(2);
  }
  let bundle;
  try {
    bundle = JSON.parse(fs.readFileSync(input, 'utf8'));
  } catch (error) {
    console.error(`CONTRACT_INPUT_INVALID ${error.message}`);
    process.exit(2);
  }
  const errors = validateContractBundle(bundle);
  if (errors.length > 0) {
    for (const error of errors) console.error(`${error.code} ${error.detail ?? ''}`.trim());
    process.exit(1);
  }
  console.log('CONTRACT_SCAN_OK');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
