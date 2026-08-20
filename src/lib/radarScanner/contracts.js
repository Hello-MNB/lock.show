import { createHash, randomUUID } from 'node:crypto'

const SUPPORTED_SOURCE_TYPES = new Set([
  'artist-provided-file',
  'artist-provided-link',
  'artist-provided-manual',
  'artist-confirmed-discovery',
])

const SEMANTIC_KINDS = new Set([
  'observation',
  'fact',
  'attributed-claim',
  'interpretation',
  'recommendation',
  'external-reaction',
])

const EVIDENCE_STATES = new Set(['verified', 'supporting', 'self-reported', 'not-assessable'])
export const MAX_SOURCE_CONTENT_BYTES = 1_000_000

const PROHIBITED_INFERENCE = [
  /\bscore\b/i,
  /\bpercentile\b/i,
  /\brank(?:ed|ing)?\b/i,
  /booking[\s_-]+probability/i,
  /\bdemand\b/i,
  /\bsuccess\b/i,
  /guarantee(?:d)?/i,
  /\bprediction\b/i,
]

export class RadarContractError extends Error {
  constructor(code, message = code) {
    super(message)
    this.name = 'RadarContractError'
    this.code = code
  }
}

function requiredString(value, code) {
  if (typeof value !== 'string' || value.trim() === '') throw new RadarContractError(code)
  return value.trim()
}

function isoDate(value, code) {
  const parsed = new Date(value)
  if (!value || Number.isNaN(parsed.getTime())) throw new RadarContractError(code)
  return parsed.toISOString()
}

function boundedSourceContent(value) {
  const content = requiredString(value, 'SOURCE_CONTENT_REQUIRED')
  if (Buffer.byteLength(content, 'utf8') > MAX_SOURCE_CONTENT_BYTES) {
    throw new RadarContractError('SOURCE_CONTENT_TOO_LARGE')
  }
  return content
}

export function contentHash(source) {
  const type = requiredString(source?.sourceType, 'SOURCE_TYPE_REQUIRED')
  const content = boundedSourceContent(source?.content).replace(/\r\n/g, '\n').trim()
  return createHash('sha256').update(`${type}\n${content}`, 'utf8').digest('hex')
}

export function createSourceSnapshot({ source, context, now = new Date().toISOString() }) {
  if (!SUPPORTED_SOURCE_TYPES.has(source?.sourceType)) throw new RadarContractError('SOURCE_TYPE_UNSUPPORTED')
  if (source?.consent?.status !== 'accepted' || source?.consent?.actorId !== context.actorId) {
    throw new RadarContractError('SOURCE_PERMISSION_REQUIRED')
  }
  if (source?.identity?.state !== 'confirmed') throw new RadarContractError('IDENTITY_AMBIGUOUS')
  if (source.identity.actId !== context.actId) throw new RadarContractError('IDENTITY_ACT_MISMATCH')

  const acquiredAt = isoDate(source.acquiredAt || now, 'SOURCE_ACQUIRED_AT_REQUIRED')
  const ttlSeconds = Number(source.ttlSeconds)
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) throw new RadarContractError('SOURCE_TTL_INVALID')

  return Object.freeze({
    id: randomUUID(),
    sourceId: requiredString(source.sourceId, 'SOURCE_ID_REQUIRED'),
    sourceType: source.sourceType,
    content: boundedSourceContent(source.content),
    hash: contentHash(source),
    acquiredAt,
    ttlSeconds,
    checkedAt: isoDate(now, 'SOURCE_CHECKED_AT_REQUIRED'),
    expiresAt: new Date(new Date(acquiredAt).getTime() + ttlSeconds * 1000).toISOString(),
    consent: structuredClone(source.consent),
    identity: structuredClone(source.identity),
    actorId: context.actorId,
    environmentId: context.environmentId,
    workspaceId: context.workspaceId,
    organizationId: context.organizationId,
    actId: context.actId,
  })
}

export function sanitizeClaimCandidate(candidate) {
  if (!SEMANTIC_KINDS.has(candidate?.semanticKind)) throw new RadarContractError('CLAIM_SEMANTIC_KIND_INVALID')
  if (!EVIDENCE_STATES.has(candidate?.evidenceStatus)) throw new RadarContractError('CLAIM_EVIDENCE_STATUS_INVALID')

  const claimType = requiredString(candidate.claimType, 'CLAIM_TYPE_REQUIRED').slice(0, 80)
  const value = requiredString(candidate.value, 'CLAIM_VALUE_REQUIRED').slice(0, 500)
  const limitation = requiredString(candidate.limitation, 'CLAIM_LIMITATION_REQUIRED').slice(0, 500)
  const inspected = `${claimType}\n${value}\n${limitation}`
  if (PROHIBITED_INFERENCE.some((pattern) => pattern.test(inspected))) {
    throw new RadarContractError('PROHIBITED_INFERENCE')
  }

  return Object.freeze({
    semanticKind: candidate.semanticKind,
    claimType,
    value,
    evidenceStatus: candidate.evidenceStatus,
    limitation,
  })
}

export function createClaimCandidate({ candidate, snapshot, context, method, modelVersion = null, now = new Date().toISOString() }) {
  const safe = sanitizeClaimCandidate(candidate)
  return Object.freeze({
    id: randomUUID(),
    ...safe,
    state: 'pending-review',
    visibility: 'private-radar',
    sourceSnapshotId: snapshot.id,
    sourceHash: snapshot.hash,
    sourceType: snapshot.sourceType,
    actorId: context.actorId,
    environmentId: context.environmentId,
    workspaceId: context.workspaceId,
    organizationId: context.organizationId,
    actId: context.actId,
    extractionMethod: method,
    modelVersion,
    createdAt: isoDate(now, 'CLAIM_CREATED_AT_REQUIRED'),
    version: 1,
  })
}

export function createRadarError(code, message = code) {
  return new RadarContractError(code, message)
}
