const ADMIN_CAPABILITY = 'admin.environment'

function denied(reason, environmentId = null) {
  return { allowed: false, capability: ADMIN_CAPABILITY, environmentId, reason }
}

export function resolveAdminCapability({
  memberships,
  requestedEnvironment,
  now = new Date(),
} = {}) {
  const grants = Array.isArray(memberships)
    ? memberships
    : []

  if (grants.length === 0) return denied('missing_membership')

  const grant = grants.find((item) => item?.environment_id === requestedEnvironment)
  if (!grant) return denied('wrong_environment', requestedEnvironment)
  if (grant.status !== 'active') return denied(grant.status === 'revoked' ? 'revoked' : 'inactive', requestedEnvironment)
  if (!Array.isArray(grant.capabilities) || !grant.capabilities.includes(ADMIN_CAPABILITY)) {
    return denied('missing_capability', requestedEnvironment)
  }
  if (grant.expires_at && new Date(grant.expires_at).getTime() <= now.getTime()) {
    return denied('expired', requestedEnvironment)
  }

  return {
    allowed: true,
    capability: ADMIN_CAPABILITY,
    environmentId: requestedEnvironment,
    expiresAt: grant.expires_at || null,
    source: 'environment_admin_membership',
  }
}

export { ADMIN_CAPABILITY }
