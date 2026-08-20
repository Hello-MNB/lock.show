import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { resolveAdminCapability } from '../src/lib/adminAccess.js'
import { buildContextBeaconModel } from '../src/lib/contextBeacon.js'

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
