import type { EvidenceArtifact } from '../../types.js'

// FIREWALL: AiClaimLabel must never carry a score, percentile, rank, or exact head-count.
export interface AiClaimLabel {
  status: 'verified' | 'supporting' | 'self-reported' | 'not-assessable'
  claim_type: string
  value: string | null   // short human-readable string or null
  reason: string | null  // short explanation of the labelling decision
}

// The only interface callers interact with.
// StubClaimProcessor and AnthropicClaimProcessor both implement this.
export interface AiClaimProcessor {
  label(evidence: EvidenceArtifact): Promise<AiClaimLabel>
}
