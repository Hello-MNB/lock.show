import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { resolveAdminCapability } from '../src/lib/adminAccess.js'
import { buildContextBeaconModel, contextRoleKey, contextWorkspaceTypeKey } from '../src/lib/contextBeacon.js'

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
  assert.match(migration, /force row level security/i)
  assert.match(migration, /revoke all on table public\.environment_admin_membership from public, anon, authenticated/i)
  assert.match(migration, /membership\.environment_id = requested_environment/i)
  assert.match(migration, /membership\.status = 'active'/i)
  assert.match(migration, /membership\.expires_at is null or membership\.expires_at > now\(\)/i)
  assert.match(migration, /select public\.has_admin_capability\('production', 'admin\.environment'\)/i)
  assert.doesNotMatch(migration.match(/create or replace function public\.is_operator\(\)[\s\S]*?\$\$;/i)?.[0] ?? '', /profiles[\s\S]*role = 'operator'/i)
  assert.match(rollback, /drop table if exists public\.environment_admin_membership/i)
  assert.match(rollback, /where id = auth\.uid\(\) and role = 'operator'/i)
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
