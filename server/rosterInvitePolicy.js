import { createHash } from 'node:crypto'

const ALLOWED_SCOPES = ['view', 'upload', 'edit', 'share', 'publish']

export function normalizeRosterInvitation(input = {}) {
  const organizationId = String(input.organizationId || '').trim()
  const artistName = String(input.artistName || '').trim()
  const email = String(input.email || '').trim().toLowerCase()
  const territory = String(input.territory || '').trim() || null
  const requested = Array.isArray(input.scope) ? input.scope : []
  const scope = ['view', ...ALLOWED_SCOPES.filter((item) => item !== 'view' && requested.includes(item))]

  if (!organizationId || !artistName || artistName.length > 120
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254
      || (territory && territory.length > 80)) {
    const error = new Error('invalid_roster_invitation')
    error.code = 'invalid_roster_invitation'
    throw error
  }

  return { organizationId, artistName, email, scope, territory }
}

export function rosterInvitationHash(token) {
  return createHash('sha256').update(String(token || ''), 'utf8').digest('hex')
}

