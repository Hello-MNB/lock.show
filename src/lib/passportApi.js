export class PassportApiError extends Error {
  constructor(code, status) {
    super(code)
    this.name = 'PassportApiError'
    this.code = code
    this.status = status
  }
}

async function responseBody(response) {
  const type = response.headers.get('content-type') || ''
  return type.includes('application/json') ? response.json().catch(() => null) : null
}

async function passportRequest(path, options, fetchImpl) {
  let response
  try {
    response = await fetchImpl(path, options)
  } catch {
    throw new PassportApiError('network_error', 0)
  }
  const body = await responseBody(response)
  if (response.ok && body) return body
  throw new PassportApiError(body?.error || `passport_api_${response.status}`, response.status)
}

export async function readPassportSnapshot(artistId, fetchImpl = fetch, { purpose, accessToken, signal } = {}) {
  try {
    const query = typeof purpose === 'string' && purpose !== '' ? `?purpose=${encodeURIComponent(purpose)}` : ''
    return await passportRequest(`/api/passport/${encodeURIComponent(artistId)}${query}`, {
      method: 'GET', signal, headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }, fetchImpl)
  } catch (error) {
    if (error.status === 404) return { artist: null, items: [], claims: [] }
    throw error
  }
}

async function writePassportState(action, artistId, headers, fetchImpl) {
  return passportRequest(`/api/${action}/${encodeURIComponent(artistId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
  }, fetchImpl)
}

export function publishPassportSnapshot(artistId, headers, fetchImpl = fetch) {
  return writePassportState('publish', artistId, headers, fetchImpl)
}

export function unpublishPassportSnapshot(artistId, headers, fetchImpl = fetch) {
  return writePassportState('unpublish', artistId, headers, fetchImpl)
}

// A selection handoff is not an action or an authorization decision. Keep the
// loaded Act explicit and reject continuations from an older client context.
export function publicationSelection(selection, currentContextKey) {
  if (!selection?.artistId || !selection.actId || !currentContextKey
    || selection.contextKey !== currentContextKey
    || !['publish', 'replace', 'withdraw'].includes(selection.action)) return null
  return { artistId: selection.artistId, actId: selection.actId,
    action: selection.action, contextKey: selection.contextKey }
}

function evidenceOutcome(body, request) {
  if (body?.status === 'not_committed') return { status: 'not_committed', request }
  const receipt = body?.receipt
  if (body?.status === 'committed' && receipt?.id && receipt.committedAt
    && ['key', 'objectId', 'artistId', 'actId', 'workspaceId', 'contextVersion', 'action'].every(k => receipt[k] === request[k])
    && Number(receipt.version) === request.expectedVersion + 1) return { status: 'committed', receipt, request }
  return { status: 'uncertain', request }
}

async function evidenceRequest(mode, request, headers, fetchImpl) {
  return passportRequest(`/api/evidence-actions/${mode}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(request),
  }, fetchImpl)
}

export async function recoverEvidenceAction(request, headers, fetchImpl = fetch) {
  try { return evidenceOutcome(await evidenceRequest('resolve', request, headers, fetchImpl), request) }
  catch { return { status: 'uncertain', request } }
}

export async function performEvidenceAction(request, headers, fetchImpl = fetch) {
  try { return evidenceOutcome(await evidenceRequest('commit', request, headers, fetchImpl), request) }
  catch (error) {
    if ([401, 403, 404].includes(error.status)) return { status: 'denied', request }
    return recoverEvidenceAction(request, headers, fetchImpl)
  }
}

// Best-effort existing event only. It is not an authoritative measurement
// denominator, and carries no statement, source, audience or private evidence.
export function emitGovernedConfirmation(outcome, current, seen, emit) {
  const request = outcome?.request
  if (!request || request.action !== 'confirm' || evidenceOutcome(outcome, request).status !== 'committed') return false
  const receipt = outcome.receipt
  const object = current?.objects?.find(item => item.id === request.objectId)
  if (seen.has(receipt.id) || current?.artistId !== request.artistId || current.actId !== request.actId
    || current.authority?.workspaceId !== request.workspaceId || Number(current.authority.contextVersion) !== request.contextVersion
    || Number(current.version) !== Number(receipt.version) || object?.state !== 'confirmed'
    || Number(object.version) !== Number(receipt.objectVersion) || object.claim?.approved !== true || !object.claim.id) return false
  seen.add(receipt.id)
  try { emit({ claim_id: object.claim.id }) } catch { /* analytics cannot undo or block an action */ }
  return true
}

export function emitGovernedPublication(outcome, current, seen, emit) {
  const request = outcome?.request, receipt = outcome?.receipt
  if (!['publish', 'replace', 'withdraw'].includes(request?.action)
    || evidenceOutcome(outcome, request).status !== 'committed' || seen.has(receipt.id)
    || current?.artistId !== request.artistId || current.actId !== request.actId
    || current.authority?.workspaceId !== request.workspaceId
    || Number(current.authority.contextVersion) !== request.contextVersion
    || Number(current.version) !== Number(receipt.version)
    || !current.history?.some(item => item.receipt.id === receipt.id)) return false
  const object = current.objects?.find(item => item.id === request.objectId)
  if (Number(object?.version) !== Number(receipt.objectVersion)
    || object.state !== (request.action === 'withdraw' ? 'withdrawn' : 'confirmed')
    || (request.action !== 'withdraw' && !receipt.passportVersionId)) return false
  if (request.action === 'withdraw') {
    const transition = receipt.publicationTransition
    const recorded = current.history.find(item => item.receipt.id === receipt.id)?.receipt.publicationTransition
    if (!transition || transition.fromPublished !== true || transition.toPublished !== false
      || !transition.passportVersionId || transition.objectId !== request.objectId || transition.actId !== request.actId
      || current.publication !== null
      || !recorded || ['fromPublished', 'toPublished', 'passportVersionId', 'objectId', 'actId'].some(key => recorded[key] !== transition[key])) return false
  }
  seen.add(receipt.id)
  try { emit(request.action === 'withdraw' ? 'unpublished' : 'published', { artist_id: request.artistId }) } catch { /* best-effort measurement only */ }
  return true
}
