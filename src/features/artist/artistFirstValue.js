export const ARTIST_FIRST_VALUE_BINDING = Object.freeze({
  sliceId: 'SLICE-ART-01',
  productId: 'ART-01',
  screenId: 'SCR-RADAR-HOME',
  workflowId: 'WF-RAD-01',
  flowId: 'FLOW-ART-01',
  handoffProductIds: Object.freeze(['ART-02', 'ART-03']),
})

const FRESHNESS_DAYS = 90

export function resolveArtistFirstValueAccess({ user, activeOrgId, memberships = [] } = {}) {
  if (!user?.id) return { allowed: false, reason: 'unauthenticated' }
  if (!activeOrgId) return { allowed: false, reason: 'workspace_missing' }

  const membership = memberships.find((item) => item?.organization?.id === activeOrgId)
  if (!membership) return { allowed: false, reason: 'workspace_missing' }
  if (membership.status !== 'active') return { allowed: false, reason: 'revoked' }
  if (membership.functional_role !== 'artist' || membership.organization?.workspace_type !== 'artist') {
    return { allowed: false, reason: 'wrong_workspace' }
  }

  return {
    allowed: true,
    organizationId: activeOrgId,
    organizationName: membership.organization?.name || null,
    role: membership.functional_role,
    workspaceType: membership.organization.workspace_type,
  }
}

export function selectArtistForWorkspace(artists, { userId, organizationId } = {}) {
  if (!userId || !organizationId || !Array.isArray(artists)) return null
  return artists.find((artist) =>
    artist?.created_by === userId && artist?.owner_organization_id === organizationId) || null
}

function newestEvidenceTime(items, claims) {
  let newest = 0
  for (const entry of [...items, ...claims]) {
    const time = Date.parse(entry?.updated_at || entry?.created_at || '')
    if (Number.isFinite(time) && time > newest) newest = time
  }
  return newest
}

export function buildArtistFirstValueModel({
  artist,
  act,
  organizationName,
  items = [],
  claims = [],
  now = Date.now(),
} = {}) {
  const supportedClaims = claims.filter((claim) =>
    claim?.artist_approved && ['verified', 'supporting'].includes(claim.verification_status))
  const newest = newestEvidenceTime(items, claims)
  const evidenceState = items.length === 0 && claims.length === 0
    ? 'empty'
    : supportedClaims.length === 0 ? 'thin' : 'supported'
  const freshness = newest === 0
    ? 'unknown'
    : now - newest > FRESHNESS_DAYS * 864e5 ? 'stale' : 'fresh'

  return {
    actName: artist?.stage_name || artist?.name || null,
    organizationName: organizationName || null,
    goal: act?.artist_goal || null,
    evidenceState,
    freshness,
    newestEvidenceAt: newest ? new Date(newest).toISOString() : null,
  }
}
