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

export async function readPassportSnapshot(artistId, fetchImpl = fetch) {
  try {
    return await passportRequest(`/api/passport/${encodeURIComponent(artistId)}`, { method: 'GET' }, fetchImpl)
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
