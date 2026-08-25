import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
  requiresWorkspaceForRole,
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
assert.equal(requiresWorkspaceForRole('artist'), true)
assert.equal(requiresWorkspaceForRole('agency'), true)
assert.equal(requiresWorkspaceForRole('booker'), false)
assert.equal(requiresWorkspaceForRole('producer'), false)

const root = resolve(import.meta.dirname, '..')
const source = (path) => readFileSync(resolve(root, path), 'utf8')
const migration = source('supabase/migrations/20260825005702_workspace_authority.sql')
assert.match(migration, /workspace_ownership_offer/, 'ownership acceptance must be durable and version-bound')
assert.match(migration, /respond_workspace_ownership_offer/, 'successor must explicitly accept or decline ownership')
assert.match(migration, /lock_workspace_authority/, 'last-owner mutations must serialize on one Workspace lock')
assert.match(migration, /workspace_owner_invite_forbidden/, 'ordinary invitations cannot directly grant owner authority')
assert.match(migration, /drop policy if exists mem_admin_write/, 'membership DML must not bypass authority RPCs')
assert.match(migration, /drop policy if exists arc_self/, 'context DML must not bypass versioned context RPCs')
assert.match(migration, /PENDING_ACCEPTANCE/, 'non-owner transfer must wait for successor acceptance')
assert.match(migration, /status='invalidated'/, 'version drift must terminally invalidate an ownership offer')
assert.match(source('src/context/OrgContext.jsx'), /setResolvedRole\(resolution\?\.role/, 'client must retain the server-resolved role envelope')
assert.match(source('src/App.jsx'), /workspaceRequired=\{false\}/, 'bounded external modes must not require a recurring Workspace')
assert.match(source('src/context/AdminAccessContext.jsx'), /DIRTY_WORK_BLOCKED/, 'Admin entry must fail closed on dirty work')
assert.doesNotMatch(source('src/features/org/Members.jsx'), /setRole\(m, 'owner'\)/, 'team controls must not bypass ownership acceptance')
assert.match(source('src/features/org/OrgSettings.jsx'), /respondToOwnership/, 'successor must receive an explicit ownership response path')
assert.match(source('src/features/org/OrgSettings.jsx'), /cancelOwnership/, 'outgoing owner must be able to cancel a pending offer')
assert.match(migration, /if v_offer\.status<>'pending' then raise exception 'ownership_offer_not_cancellable'/,
  'an accepted ownership transfer must be terminal and cannot be relabelled as cancelled')
const membersSource = source('src/features/org/Members.jsx')
assert.match(membersSource, /inviteDeliveryRequired/,
  'invite and resend UI must expose that delivery is still required')
assert.match(membersSource, /receipt\?\.status === 'EXPIRED'/,
  'expired resend must reload and render a truthful terminal state')
const adminAccessSource = source('src/context/AdminAccessContext.jsx')
assert.match(adminAccessSource, /sessionStorage/,
  'Admin safe return must survive refresh and capability revocation within the same browser session')
assert.match(adminAccessSource, /readAdminReturnPath/,
  'Admin exit and revoke paths must validate and reuse the exact prior lawful route')
assert.match(migration, /drop policy if exists ra_admin_write/,
  'functional RoleAssignment writes must not bypass versioned authority RPCs')
assert.match(migration, /revoke insert, update, delete on public\.role_assignment from anon, authenticated/,
  'browser roles must not mutate the server-resolved functional role directly')
assert.match(migration, /create function public\.invite_member\([\s\S]*p_idempotency_key uuid/,
  'initial invitation creation must be server-idempotent')
assert.match(migration, /invitation_pending_duplicate/,
  'pending invitations must be duplicate-safe after normalized server comparison')
assert.match(migration, /membership_person_required/,
  'generic membership authority changes must reject unbound invitations')
assert.match(migration, /membership_state_terminal/,
  'terminal membership authority states must not be silently reactivated')
assert.match(membersSource, /statusSuspended/,
  'team UI must render suspended members truthfully')
assert.match(membersSource, /reactivateMember/,
  'team UI must expose explicit reactivation rather than a role-toggle side effect')
const rollback = source('supabase/rollback/20260825005702_workspace_authority.sql')
assert.match(rollback, /workspace_authority_rollback_requires_receipt_reconciliation/,
  'rollback must refuse to erase unreconciled authority receipts')
assert.match(rollback, /workspace_authority_rollback_requires_offer_reconciliation/,
  'rollback must refuse to erase ownership-offer history')
const dbRunner = source('scripts/tech-baseline/run-workspace-authority-db.mjs')
for (const label of ['REVOKE_VS_RENAME', 'REVOKE_VS_INVITE', 'REVOKE_VS_RESEND', 'REVOKE_VS_CANCEL']) {
  assert.match(dbRunner, new RegExp(label), `${label} must have a real two-connection race fixture`)
}

console.log('APP_SHELL_WORKSPACE_AUTHORITY_OK')
