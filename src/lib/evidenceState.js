const RETRYABLE_EVIDENCE_STATUSES = new Set(['submitted', 'error'])

export function countRetryableEvidence(evidence = []) {
  return evidence.filter((item) => RETRYABLE_EVIDENCE_STATUSES.has(item?.status)).length
}
