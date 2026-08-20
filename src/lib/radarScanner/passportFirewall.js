import { createRadarError } from './contracts.js'

function requireGate(gate, code) {
  if (!gate || gate.passed !== true) throw createRadarError(code)
  return structuredClone(gate)
}

function requireBinding(gate, field, requiredCode, invalidCode) {
  const value = gate?.[field]
  if (typeof value !== 'string' || value.trim() === '') throw createRadarError(requiredCode)
  if (value !== value.trim()) throw createRadarError(invalidCode)
  return value
}

export function authorizePassportProjection({ eligibility, ownerDecision, recipientAccess }, { now = new Date().toISOString() } = {}) {
  const acceptedEligibility = requireGate(eligibility, 'PASSPORT_ELIGIBILITY_REQUIRED')
  const acceptedOwnerDecision = requireGate(ownerDecision, 'PASSPORT_OWNER_DECISION_REQUIRED')
  const acceptedRecipientAccess = requireGate(recipientAccess, 'PASSPORT_RECIPIENT_ACCESS_REQUIRED')
  const eligibilityProjectionId = requireBinding(acceptedEligibility, 'projectionId', 'PASSPORT_ELIGIBILITY_PROJECTION_REQUIRED', 'PASSPORT_ELIGIBILITY_PROJECTION_INVALID')
  const ownerProjectionId = requireBinding(acceptedOwnerDecision, 'projectionId', 'PASSPORT_OWNER_PROJECTION_REQUIRED', 'PASSPORT_OWNER_PROJECTION_INVALID')
  const recipientProjectionId = requireBinding(acceptedRecipientAccess, 'projectionId', 'PASSPORT_RECIPIENT_PROJECTION_REQUIRED', 'PASSPORT_RECIPIENT_PROJECTION_INVALID')
  const ownerVersionId = requireBinding(acceptedOwnerDecision, 'versionId', 'PASSPORT_OWNER_VERSION_REQUIRED', 'PASSPORT_OWNER_VERSION_INVALID')
  const recipientVersionId = requireBinding(acceptedRecipientAccess, 'versionId', 'PASSPORT_RECIPIENT_VERSION_REQUIRED', 'PASSPORT_RECIPIENT_VERSION_INVALID')
  const ownerPreviewHash = requireBinding(acceptedOwnerDecision, 'previewHash', 'PASSPORT_OWNER_PREVIEW_REQUIRED', 'PASSPORT_OWNER_PREVIEW_INVALID')
  const recipientPreviewHash = requireBinding(acceptedRecipientAccess, 'approvedPreviewHash', 'PASSPORT_RECIPIENT_PREVIEW_REQUIRED', 'PASSPORT_RECIPIENT_PREVIEW_INVALID')
  if (eligibilityProjectionId !== ownerProjectionId || ownerProjectionId !== recipientProjectionId) {
    throw createRadarError('PASSPORT_PROJECTION_MISMATCH')
  }
  if (ownerVersionId !== recipientVersionId) throw createRadarError('PASSPORT_VERSION_MISMATCH')
  if (ownerPreviewHash !== recipientPreviewHash) throw createRadarError('PASSPORT_PREVIEW_MISMATCH')
  if (acceptedOwnerDecision.decision !== 'approve') throw createRadarError('PASSPORT_OWNER_APPROVAL_REQUIRED')
  const expiresAt = new Date(acceptedRecipientAccess.expiresAt).getTime()
  const checkedAt = new Date(now).getTime()
  if (!Number.isFinite(expiresAt) || !Number.isFinite(checkedAt) || expiresAt <= checkedAt) {
    throw createRadarError('PASSPORT_RECIPIENT_ACCESS_EXPIRED')
  }

  return Object.freeze({
    authorized: true,
    eligibility: acceptedEligibility,
    ownerDecision: acceptedOwnerDecision,
    recipientAccess: acceptedRecipientAccess,
  })
}

export function createPassportInvalidation({ sourceSnapshotId, reason, affectedVersionIds = [], occurredAt = new Date().toISOString() }) {
  if (!sourceSnapshotId) throw createRadarError('PASSPORT_INVALIDATION_SOURCE_REQUIRED')
  if (!reason) throw createRadarError('PASSPORT_INVALIDATION_REASON_REQUIRED')
  return Object.freeze({
    sourceSnapshotId,
    reason,
    affectedVersionIds: [...affectedVersionIds],
    occurredAt: new Date(occurredAt).toISOString(),
    hooks: ['block-new-access', 'invalidate-controlled-view', 'invalidate-controlled-cache', 'review-controlled-export'],
    externalCopiesDeletionGuaranteed: false,
  })
}
