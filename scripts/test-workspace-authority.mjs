import assert from 'node:assert/strict'

let authority
try {
  authority = await import('../src/lib/workspaceAuthority.js')
} catch (error) {
  throw new Error('APP_SHELL_CONTRACT_MODULE_MISSING', { cause: error })
}

const {
  normalizePrimaryResolution,
  buildWorkspaceSwitchPreflight,
  commitWorkspaceContextReceipt,
  getWorkspaceDestinations,
  canDiscoverPrivateAdmin,
} = authority

const baseEnvelope = {
  outcome: 'RESOLVED_PRIMARY',
  contextVersion: 9,
  workspace: { id: 'workspace-artist', type: 'artist', name: 'Maya Vale' },
  role: { id: 'role-artist-owner', type: 'artist_owner' },
  route: '/artist/home',
  returnTo: '/artist/home',
  rationale: 'server_primary',
}

assert.deepEqual(
  normalizePrimaryResolution(baseEnvelope, { cachedWorkspaceId: 'workspace-wrong' }),
  baseEnvelope,
  'server resolution must remain authoritative over a client hint',
)
for (const outcome of [
  'RESOLVED_PRIMARY',
  'CHOICE_REQUIRED',
  'PENDING_ONLY',
  'NO_ELIGIBLE',
  'DENIED_OR_REVOKED',
  'ERROR_OR_OFFLINE',
]) {
  assert.equal(normalizePrimaryResolution({ ...baseEnvelope, outcome }).outcome, outcome)
}
assert.throws(
  () => normalizePrimaryResolution({ ...baseEnvelope, outcome: 'FIRST_MEMBERSHIP' }),
  /PRIMARY_RESOLUTION_OUTCOME_INVALID/,
)

const origin = {
  contextVersion: 9,
  workspace: { id: 'workspace-artist', type: 'artist', name: 'Maya Vale' },
  route: '/artist/home',
  dirtyWork: { state: 'DIRTY', owner: 'radar-evidence' },
}
const target = {
  workspace: { id: 'workspace-representation', type: 'representation', name: 'Northline' },
  role: { id: 'role-manager', type: 'representation_manager' },
  route: '/agency',
}
const preflight = buildWorkspaceSwitchPreflight({ origin, target })
assert.equal(preflight.from.workspace.id, 'workspace-artist')
assert.equal(preflight.to.workspace.id, 'workspace-representation')
assert.equal(preflight.canCommit, false, 'dirty work must block context commit until resolved')

assert.deepEqual(
  commitWorkspaceContextReceipt(origin, { status: 'FAILED', contextVersion: 10 }),
  origin,
  'failed commit must preserve the exact prior context',
)
assert.equal(
  commitWorkspaceContextReceipt(
    { ...origin, dirtyWork: { state: 'CLEAN' } },
    { status: 'COMMITTED', contextVersion: 10, workspace: target.workspace, role: target.role, route: target.route },
  ).workspace.id,
  'workspace-representation',
)

assert.deepEqual(getWorkspaceDestinations('artist'), ['/artist/home', '/artist/passport', '/artist/requests'])
assert.deepEqual(getWorkspaceDestinations('representation'), ['/agency', '/agency/radar', '/agency/requests'])
assert.deepEqual(getWorkspaceDestinations('production'), ['/production', '/production/events', '/production/requests'])
assert.throws(() => getWorkspaceDestinations('buyer'), /BOUNDED_MODE_NOT_WORKSPACE/)
assert.equal(canDiscoverPrivateAdmin(null), false)
assert.equal(canDiscoverPrivateAdmin({ allowed: true, environment: 'preview' }, 'production'), false)
assert.equal(canDiscoverPrivateAdmin({ allowed: true, environment: 'production' }, 'production'), true)

console.log('APP_SHELL_WORKSPACE_AUTHORITY_OK')

