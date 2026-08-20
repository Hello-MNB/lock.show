async function apiJson(url, options, fetchImpl = fetch) {
  const response = await fetchImpl(url, options)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error || 'roster_invitation_failed')
    error.status = response.status
    error.code = payload.error || 'roster_invitation_failed'
    error.details = payload
    throw error
  }
  return payload
}

export function createRosterInvitation(payload, auth = {}, fetchImpl = fetch) {
  return apiJson('/api/roster-invitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(payload),
  }, fetchImpl)
}

export function getRosterInvitation(token, fetchImpl = fetch) {
  return apiJson(`/api/roster-invitations/${encodeURIComponent(token)}`, {
    method: 'GET',
  }, fetchImpl)
}

export function acceptRosterInvitation(token, payload, auth = {}, fetchImpl = fetch) {
  return apiJson(`/api/roster-invitations/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(payload || {}),
  }, fetchImpl)
}

export function declineRosterInvitation(token, auth = {}, fetchImpl = fetch) {
  return apiJson(`/api/roster-invitations/${encodeURIComponent(token)}/decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: '{}',
  }, fetchImpl)
}
