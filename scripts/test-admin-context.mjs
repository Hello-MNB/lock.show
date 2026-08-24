import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { isMissingAdminAuthorityStoreError, resolveAdminCapability } from '../src/lib/adminAccess.js'
import { buildContextBeaconModel, contextRoleKey, contextWorkspaceTypeKey } from '../src/lib/contextBeacon.js'
import { countRetryableEvidence } from '../src/lib/evidenceState.js'
import { anthropicKeyState } from '../src/lib/ai/index.js'
import { AnthropicClaimProcessor } from '../src/lib/ai/anthropic.js'
import { T as en } from '../src/lib/i18n/en.js'
import { T as he } from '../src/lib/i18n/he.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

test('an artist can also hold an active environment-bound admin capability', () => {
  const result = resolveAdminCapability({
    profileRole: 'artist',
    requestedEnvironment: 'production',
    now: new Date('2026-08-20T12:00:00Z'),
    memberships: [{
        environment_id: 'production',
        status: 'active',
        capabilities: ['admin.environment'],
        expires_at: '2026-08-21T00:00:00Z',
    }],
  })

  assert.equal(result.allowed, true)
  assert.equal(result.environmentId, 'production')
  assert.equal(result.capability, 'admin.environment')
  assert.equal(result.source, 'environment_admin_membership')
})

test('admin capability fails closed for missing, wrong-environment, revoked and expired grants', () => {
  const base = {
    profileRole: 'artist',
    requestedEnvironment: 'production',
    now: new Date('2026-08-20T12:00:00Z'),
  }

  assert.equal(resolveAdminCapability({ ...base, memberships: [] }).allowed, false)
  assert.equal(resolveAdminCapability({
    ...base, memberships: [{ environment_id: 'staging', status: 'active', capabilities: ['admin.environment'] }],
  }).reason, 'wrong_environment')
  assert.equal(resolveAdminCapability({
    ...base, memberships: [{ environment_id: 'production', status: 'revoked', capabilities: ['admin.environment'] }],
  }).reason, 'revoked')
  assert.equal(resolveAdminCapability({
    ...base, memberships: [{ environment_id: 'production', status: 'active', capabilities: ['admin.environment'], expires_at: '2026-08-20T11:59:59Z' }],
  }).reason, 'expired')
})

test('missing Supabase Admin authority store is recognized without weakening fail-closed access', () => {
  assert.equal(isMissingAdminAuthorityStoreError({ code: '42P01' }), true)
  assert.equal(isMissingAdminAuthorityStoreError({ code: 'PGRST205' }), true)
  assert.equal(isMissingAdminAuthorityStoreError({ code: '42501' }), false)
  assert.equal(isMissingAdminAuthorityStoreError(null), false)
})

test('legacy operator role is not silently treated as an environment capability', () => {
  const result = resolveAdminCapability({
    profileRole: 'operator',
    requestedEnvironment: 'production',
    now: new Date('2026-08-20T12:00:00Z'),
    memberships: [],
  })
  assert.equal(result.allowed, false)
  assert.equal(result.reason, 'missing_membership')
})

test('context beacon keeps person, role, environment and workspace distinct', () => {
  const model = buildContextBeaconModel({
    personName: 'Maria',
    role: 'artist',
    environmentId: 'production',
    workspaceName: 'ARTIST',
    workspaceType: 'artist',
  })

  assert.deepEqual(model, {
    personName: 'Maria',
    role: 'artist',
    environmentId: 'production',
    workspaceName: 'ARTIST',
    workspaceType: 'artist',
  })
})

test('context beacon maps technical role and workspace values to explicit localized labels', () => {
  assert.equal(contextRoleKey('artist'), 'contextRoleArtist')
  assert.equal(contextRoleKey('agency'), 'contextRoleRepresentation')
  assert.equal(contextRoleKey('booker'), 'contextRoleBuyer')
  assert.equal(contextRoleKey('producer'), 'contextRoleConfirmer')
  assert.equal(contextRoleKey('admin'), 'contextRoleAdmin')
  assert.equal(contextRoleKey('unknown'), 'contextRolePending')

  assert.equal(contextWorkspaceTypeKey('artist'), 'contextWorkspaceArtist')
  assert.equal(contextWorkspaceTypeKey('management'), 'contextWorkspaceRepresentation')
  assert.equal(contextWorkspaceTypeKey('producer'), 'contextWorkspaceProduction')
  assert.equal(contextWorkspaceTypeKey('admin'), 'contextWorkspaceAdmin')
  assert.equal(contextWorkspaceTypeKey('unknown'), 'contextWorkspaceGeneric')
})

test('context beacon keeps all four orientation labels visible at every breakpoint', () => {
  const beacon = read('src/components/layout/ContextBeacon.jsx')
  for (const key of ['contextPersonLabel', 'contextWorkspaceLabel', 'contextRoleLabel', 'contextEnvironmentLabel']) {
    assert.match(beacon, new RegExp(`T\\.org\\.${key}`))
  }
  assert.doesNotMatch(beacon, /hidden[^\n]*(?:contextRole|environmentId)|(?:contextRole|environmentId)[^\n]*hidden/)
})

test('new LOCK.SHOW sessions default to Hebrew while preserving an explicit English choice', () => {
  const lang = read('src/context/LangContext.jsx')
  assert.match(lang, /return saved === 'en' \? 'en' : 'he'/)
})

test('RADAR Scanner has native Hebrew copy for every claim-first action', () => {
  const intentKeys = [
    'drew-crowd', 'sold-via-link', 'rebooked', 'community',
    'produced-event', 'consistent-frequency', 'producer-confirm',
  ]

  for (const key of intentKeys) {
    assert.equal(typeof he.evidence.intents?.[key], 'string', `missing Hebrew intent: ${key}`)
    assert.equal(typeof he.evidence.intentAsk?.[key], 'string', `missing Hebrew evidence ask: ${key}`)
    assert.notEqual(he.evidence.intents[key], en.evidence.intents[key], `English fallback leaked into Hebrew: ${key}`)
  }
})

test('RADAR Scanner reports degraded processing truthfully and keeps failed evidence retryable', () => {
  const capture = read('src/features/evidence/EvidenceCapture.jsx')

  assert.equal(countRetryableEvidence([{ status: 'error' }]), 1)
  assert.equal(countRetryableEvidence([{ status: 'submitted' }, { status: 'error' }, { status: 'processed' }]), 2)
  assert.equal(countRetryableEvidence([{ status: 'processed' }]), 0)
  assert.match(capture, /result\.ai === 'degraded'/)
  assert.match(capture, /T\.evidence\.scannerDegraded/)
  assert.match(capture, /countRetryableEvidence\(evidence\)/)
  assert.match(capture, /e\.status === 'error' \? T\.evidence\.retryable/)
  assert.equal(typeof he.evidence.scannerDegraded, 'string')
  assert.equal(typeof en.evidence.scannerDegraded, 'string')
  assert.equal(typeof he.evidence.retryable, 'string')
  assert.equal(typeof en.evidence.retryable, 'string')
})

test('Anthropic configuration rejects a foreign credential without exposing it', () => {
  assert.equal(anthropicKeyState(), 'missing')
  assert.equal(anthropicKeyState(''), 'missing')
  assert.equal(anthropicKeyState('not-an-anthropic-key'), 'misconfigured')
  assert.equal(anthropicKeyState('sk-ant-api03-example'), 'configured')
})

test('a misconfigured Anthropic credential degrades locally without a network attempt', async () => {
  const processor = new AnthropicClaimProcessor('not-an-anthropic-key', 'test-model')
  const result = await processor.labelWithMethod({
    evidence_type: 'link',
    source_type: 'producer-vouch',
    value: 'Synthetic evidence',
  })
  assert.equal(result.method, 'deterministic_fallback')
  assert.equal(result.aiFailed, true)
})

test('PASSPORT database firewall keeps private RADAR rationale and snapshot JSON away from anon', () => {
  const migration = read('supabase/migrations/20260820091500_passport_public_payload_firewall.sql')
  const rollback = read('supabase/rollback/20260820091500_passport_public_payload_firewall.sql')

  assert.match(migration, /revoke select on public\.claims from anon/i)
  assert.doesNotMatch(migration.match(/grant select \([^;]+\)\s+on public\.claims to anon/is)?.[0] ?? '', /reason_code/i)
  assert.match(migration, /revoke select on public\.passport_versions from anon/i)
  assert.match(migration, /grant select \(id, artist_id, created_at\)\s+on public\.passport_versions to anon/i)
  assert.match(rollback, /reason_code/i)
  assert.match(rollback, /grant select \(id, artist_id, snapshot, created_at\)/i)
})

test('admin migration is fail-closed, environment-bound and rollback-backed', () => {
  const migration = read('supabase/migrations/20260820042812_environment_admin_membership.sql')
  const rollback = read('supabase/rollback/20260820042812_environment_admin_membership.sql')

  assert.match(migration, /create table if not exists public\.environment_admin_membership/i)
  assert.match(migration, /grant_source text not null/i)
  assert.match(migration, /force row level security/i)
  assert.match(migration, /revoke all on table public\.environment_admin_membership from public, anon, authenticated/i)
  assert.match(migration, /membership\.environment_id = requested_environment/i)
  assert.match(migration, /membership\.status = 'active'/i)
  assert.match(migration, /membership\.expires_at is null or membership\.expires_at > now\(\)/i)
  assert.match(migration, /select public\.has_admin_capability\('production', 'admin\.environment'\)/i)
  assert.doesNotMatch(migration, /insert into public\.environment_admin_membership[\s\S]*from public\.profiles profile[\s\S]*profile\.role = 'operator'/i)
  assert.doesNotMatch(migration.match(/create or replace function public\.is_operator\(\)[\s\S]*?\$\$;/i)?.[0] ?? '', /profiles[\s\S]*role = 'operator'/i)
  assert.match(rollback, /drop table if exists public\.environment_admin_membership/i)
  assert.doesNotMatch(rollback, /profiles[\s\S]*role = 'operator'|create or replace function public\.is_operator/i)
})

test('explicit production Admin grant creates only a new provenance-bound authority row', () => {
  const migrationNames = fs.readdirSync(path.join(root, 'supabase/migrations'))
    .filter((name) => name.endsWith('_explicit_hello_admin_grant.sql'))
  assert.equal(migrationNames.length, 1, 'expected one CLI-created explicit production Admin grant migration')
  const [migrationName] = migrationNames
  const migrationPath = `supabase/migrations/${migrationName}`
  const rollbackPath = `supabase/rollback/${migrationName}`
  const grantSource = '20260824173241_explicit_hello_admin_grant'
  const approvedAuthUserId = 'bd6af802-607c-4faf-93d4-e0a32f10804e'

  assert.equal(fs.existsSync(path.join(root, migrationPath)), true, 'explicit production Admin grant migration must exist')
  assert.equal(fs.existsSync(path.join(root, rollbackPath)), true, 'explicit production Admin grant rollback must exist')

  const migration = read(migrationPath)
  const rollback = read(rollbackPath)
  const authorityMigration = read('supabase/migrations/20260820042812_environment_admin_membership.sql')

  assert.match(migration, /from auth\.users/i)
  assert.match(migration, new RegExp(`id = '${approvedAuthUserId}'::uuid`, 'i'))
  assert.match(migration, /lower\(email\) = 'hello@lock\.show'/i)
  assert.match(migration, /email_confirmed_at is not null/i)
  assert.match(migration, /deleted_at is null/i)
  assert.match(migration, /banned_until is null or banned_until <= now\(\)/i)
  assert.match(migration, /if v_identity_count <> 1 then/i)
  assert.match(migration, /if exists \(\s*select 1\s*from public\.environment_admin_membership\s*where person_id = v_person_id\s*and environment_id = 'production'/is)
  assert.match(migration, /raise exception 'explicit_admin_grant_membership_exists'/i)
  assert.match(migration, /insert into public\.environment_admin_membership/i)
  assert.match(migration, new RegExp(`v_person_id, 'production', 'active', array\\['admin\\.environment'\\]::text\\[\\], v_person_id, '${grantSource}'`, 'i'))
  assert.doesNotMatch(migration, /on conflict|environment_admin_membership\.capabilities.*\|\| excluded\.capabilities/is)
  assert.match(migration, /revoke all on table public\.environment_admin_membership from public, anon, authenticated/i)
  assert.match(migration, /revoke all on table public\.environment_admin_membership from service_role;\s*grant select on table public\.environment_admin_membership to service_role/i)
  assert.match(migration, /grant select on table public\.environment_admin_membership to service_role/i)
  assert.doesNotMatch(migration, /profiles\.role|platform_owner|workspace ownership|user_metadata|app_metadata/i)

  assert.match(authorityMigration, /security definer/i)
  assert.match(authorityMigration, /set search_path = ''/i)
  assert.match(authorityMigration, /from public\.environment_admin_membership membership/i)
  assert.match(authorityMigration, /membership\.person_id = auth\.uid\(\)/i)
  assert.match(authorityMigration, /grant execute on function public\.has_admin_capability\(text, text\) to authenticated/i)

  assert.match(rollback, /v_provenance_count integer/i)
  assert.match(rollback, /if v_provenance_count <> 1 then/i)
  assert.match(rollback, /v_expected_membership_count integer/i)
  assert.match(rollback, /if v_expected_membership_count <> 1 then/i)
  assert.match(rollback, /delete from public\.environment_admin_membership/i)
  assert.match(rollback, /person_id = v_person_id/i)
  assert.match(rollback, /environment_id = 'production'/i)
  assert.match(rollback, new RegExp(`grant_source = '${grantSource}'`, 'i'))
  assert.match(rollback, /status = 'active'/i)
  assert.match(rollback, /capabilities = array\['admin\.environment'\]::text\[\]/i)
  assert.match(rollback, /expires_at is null/i)
  assert.doesNotMatch(rollback, /from auth\.users|hello@lock\.show/i)
  assert.doesNotMatch(rollback, /update public\.environment_admin_membership|array_remove|cardinality\(capabilities\)/i)
  assert.doesNotMatch(rollback, /drop table|drop function|profiles\.role|platform_owner/i)
})

test('application routes and navigation consume the capability gate without leaking Admin into customer navigation', () => {
  const app = read('src/App.jsx')
  const shell = read('src/components/layout/AppShell.jsx')
  const switcher = read('src/features/org/ContextSwitcher.jsx')
  const server = read('server/index.js')

  assert.match(app, /function RequireAdmin/)
  assert.match(app, /path="\/admin" element=\{<RequireAdmin>/)
  assert.doesNotMatch(app, /path="\/admin"[\s\S]{0,120}RequireRole role=\{ROLES\.OPERATOR\}/)
  assert.match(shell, /!adminMode[\s\S]{0,120}<BottomNav/)
  assert.match(switcher, /adminAllowed &&/)
  assert.match(server, /app\.get\('\/api\/admin\/capability', requireAuth/)
  assert.match(server, /\.from\('environment_admin_membership'\)/)
})
