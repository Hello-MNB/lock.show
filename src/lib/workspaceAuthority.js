const PRIMARY_OUTCOMES = new Set([
  'RESOLVED_PRIMARY',
  'CHOICE_REQUIRED',
  'PENDING_ONLY',
  'NO_ELIGIBLE',
  'DENIED_OR_REVOKED',
  'ERROR_OR_OFFLINE',
])

const DESTINATIONS = Object.freeze({
  artist: Object.freeze(['/artist/home', '/artist/passport', '/artist/requests']),
  representation: Object.freeze(['/agency', '/agency/radar', '/agency/requests']),
  production: Object.freeze(['/production', '/production/events', '/production/requests']),
})

export function normalizePrimaryResolution(envelope) {
  if (!envelope || !PRIMARY_OUTCOMES.has(envelope.outcome)) {
    throw new Error('PRIMARY_RESOLUTION_OUTCOME_INVALID')
  }
  if (envelope.outcome === 'RESOLVED_PRIMARY') {
    if (!envelope.workspace?.id || !envelope.role?.id || !Number.isInteger(envelope.contextVersion) || !envelope.route) {
      throw new Error('PRIMARY_RESOLUTION_ENVELOPE_INCOMPLETE')
    }
  }
  return envelope
}

export function buildWorkspaceSwitchPreflight({ origin, target } = {}) {
  if (!origin?.workspace?.id || !target?.workspace?.id || !Number.isInteger(origin.contextVersion)) {
    throw new Error('WORKSPACE_SWITCH_PREFLIGHT_INCOMPLETE')
  }
  const dirty = origin.dirtyWork?.state === 'DIRTY'
  return {
    state: dirty ? 'DIRTY_WORK_BLOCKED' : 'READY',
    from: origin,
    to: target,
    expectedContextVersion: origin.contextVersion,
    canCommit: !dirty,
  }
}

export function commitWorkspaceContextReceipt(origin, receipt) {
  if (receipt?.status !== 'COMMITTED') return origin
  if (!receipt.workspace?.id || !receipt.role?.id || !receipt.route || !Number.isInteger(receipt.contextVersion)) {
    throw new Error('WORKSPACE_SWITCH_RECEIPT_INCOMPLETE')
  }
  if (receipt.contextVersion <= origin.contextVersion) {
    throw new Error('WORKSPACE_SWITCH_RECEIPT_STALE')
  }
  return {
    ...origin,
    contextVersion: receipt.contextVersion,
    workspace: receipt.workspace,
    role: receipt.role,
    route: receipt.route,
    dirtyWork: { state: 'CLEAN' },
  }
}

export function getWorkspaceDestinations(workspaceType) {
  if (workspaceType === 'buyer' || workspaceType === 'recipient' || workspaceType === 'confirmer') {
    throw new Error('BOUNDED_MODE_NOT_WORKSPACE')
  }
  const destinations = DESTINATIONS[workspaceType]
  if (!destinations) throw new Error('WORKSPACE_TYPE_INVALID')
  return [...destinations]
}

export function canDiscoverPrivateAdmin(capability, currentEnvironment) {
  return Boolean(capability?.allowed && capability.environment && capability.environment === currentEnvironment)
}
