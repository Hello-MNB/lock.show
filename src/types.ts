// Domain types for GIGPROOF — mirrors the DB schema in supabase/migrations/001_initial_schema.sql.
// NOTE: internal_confidence is intentionally absent from Claim — never expose it.

export type UserRole = 'artist' | 'agency' | 'booker'
export type VerificationStatus = 'verified' | 'supporting' | 'self-reported' | 'not-assessable'
export type Visibility = 'passport-ok' | 'mirror-only' | 'internal'
export type EvidenceStatus = 'submitted' | 'processed' | 'error'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  created_at: string
}

export interface Artist {
  id: string
  created_by: string
  name: string | null
  stage_name: string | null
  genre: string | null
  city: string | null
  photo_url: string | null
  one_line: string | null
  regions: string | null
  set_length: string | null
  invoice_ready: boolean
  rider_url: string | null
  music_links: string[]
  // Draw signals — BANDS / booleans ONLY. Never an exact attendee count.
  lineup_frequency_band: string | null
  sells_tickets: boolean | null
  price_band: string | null
  community_size_band: string | null
  published: boolean
  created_at: string
}

export interface ProfileItem {
  id: string
  artist_id: string
  item_type: 'event' | 'lineup' | 'collab' | 'release' | 'residency' | 'self_produced_event' | 'link' | 'draw_signal'
  title: string | null
  detail: string | null
  item_date: string | null
  public_url: string | null
  source_status: 'public-verified' | 'artist-provided'
  visibility: Visibility
  created_at: string
}

export interface EvidenceArtifact {
  id: string
  artist_id: string
  evidence_type: 'file' | 'link' | 'band'
  source_type: 'ticket-export' | 'settlement' | 'screenshot' | 'public-profile' | 'producer-vouch' | 'self-band' | 'self-reported' | null
  value: string | null
  file_url: string | null
  public_url: string | null
  status: EvidenceStatus
  uploaded_at: string
}

export interface Claim {
  id: string
  artist_id: string
  evidence_id: string | null
  claim_type: string | null
  value: string | null
  source_type: string | null
  verification_status: VerificationStatus
  verified_by: 'system' | 'artist' | null
  verified_at: string | null
  expires_at: string | null
  visibility: Visibility
  extraction_method: string | null
  model_version: string | null
  // internal_confidence: DB-only, never in this type
  reason_code: string | null
  created_at: string
}

export interface AvailabilityRequest {
  id: string
  artist_id: string
  requester_name: string
  requester_org: string | null
  event_date: string | null
  event_type: string | null
  location: string | null
  capacity_band: string | null
  budget_band: string | null
  message: string | null
  status: 'new' | 'replied' | 'closed'
  created_date: string
}

export interface ConsentRecord {
  id: string
  subject_id: string
  scope: string
  version: string
  status: 'accepted' | 'declined' | 'withdrawn'
  marketing_opt_in: boolean
  timestamp: string
}

// Passport snapshot type — the sanitized public view. No score, no exact counts, no internal fields.
export type PublicArtist = Omit<Artist, 'created_by' | 'published' | 'rider_url'>
export type PublicProfileItem = Pick<ProfileItem, 'id' | 'item_type' | 'title' | 'detail' | 'item_date' | 'public_url' | 'source_status'>
export type PublicClaim = Pick<Claim, 'id' | 'claim_type' | 'value' | 'source_type' | 'verification_status' | 'reason_code'>

export interface PassportSnapshot {
  artist: PublicArtist
  items: PublicProfileItem[]
  claims: PublicClaim[]
}

export interface PassportVersion {
  id: string
  artist_id: string
  snapshot: PassportSnapshot
  created_at: string
}
