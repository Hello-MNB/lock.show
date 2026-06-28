// Single source of truth for shared parameters used across DB, API, and UI.
// Values MUST stay exactly in sync with the CHECK constraints in
// supabase/apply_to_supabase.sql. Localized display labels live in src/lib/i18n.

// User roles — profiles.role CHECK.
// Self-signup roles (S2): artist · booker (אמרגן) · producer (מפיק) · agency (סוכנות).
// 'operator' is internal — assigned via seed/admin, never self-selected at signup.
export const ROLES = {
  ARTIST: 'artist',
  BOOKER: 'booker',
  PRODUCER: 'producer',
  AGENCY: 'agency',
  OPERATOR: 'operator',
}
export const ROLE_VALUES = Object.values(ROLES)
// The roles a user may pick at signup (excludes the internal operator role).
export const SIGNUP_ROLES = [ROLES.ARTIST, ROLES.BOOKER, ROLES.PRODUCER, ROLES.AGENCY]

// OAuth (Google/Facebook) stays OFF until the providers are configured in the
// Supabase dashboard. Flip on with VITE_OAUTH_ENABLED=1 (e.g. Netlify env) — no
// code change. Pilot auth = email + password (anon + RLS); never a dead button.
export const OAUTH_ENABLED = import.meta.env.VITE_OAUTH_ENABLED === '1'

// Bounded status vocabulary — the ONLY statuses the firewall permits in the UI
// (חזק · מתפתח · חסר-הוכחה · לא-ניתן-להעריך). Keys map to i18n status.*.
export const STATUS = {
  STRONG: 'strong',
  DEVELOPING: 'developing',
  MISSING: 'missing',
  NOT_ASSESSABLE: 'notAssessable',
}

// Claim provenance — claims.verification_status CHECK.
export const VERIFICATION_STATUS = {
  VERIFIED: 'verified',
  SUPPORTING: 'supporting',
  SELF_REPORTED: 'self-reported',
  NOT_ASSESSABLE: 'not-assessable',
}
// Statuses strong enough to surface on a public Passport (firewall gate).
export const PUBLISHABLE_STATUSES = [VERIFICATION_STATUS.VERIFIED, VERIFICATION_STATUS.SUPPORTING]

// Visibility — claims.visibility / profile_items.visibility CHECK.
export const VISIBILITY = {
  PASSPORT_OK: 'passport-ok',
  MIRROR_ONLY: 'mirror-only',
  INTERNAL: 'internal',
}

// profile_items.source_status CHECK.
export const SOURCE_STATUS = {
  PUBLIC_VERIFIED: 'public-verified',
  ARTIST_PROVIDED: 'artist-provided',
}

// Evidence upload guardrails — enforced client-side (EvidenceCapture) and in
// uploadFile() as defense-in-depth. Ticket exports / settlements / screenshots.
export const EVIDENCE = {
  MAX_FILE_MB: 10,
  ALLOWED_EXT: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'csv', 'xls', 'xlsx'],
  get ACCEPT() { return this.ALLOWED_EXT.map((e) => `.${e}`).join(',') },
}

export function evidenceFileError(file) {
  if (!file) return null
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !EVIDENCE.ALLOWED_EXT.includes(ext)) return 'type'
  if (file.size > EVIDENCE.MAX_FILE_MB * 1024 * 1024) return 'size'
  return null
}

// The 6 public METHOD LABELS (firewall §3) — the single vocabulary for "how
// verified". Producer-confirmed is strongest. Each renders as text + a shape icon.
export const METHOD_LABELS = {
  PRODUCER_CONFIRMED: 'producer-confirmed',
  EVIDENCE_SUPPORTED: 'evidence-supported',
  SOURCE_LINKED: 'source-linked',
  ARTIST_DECLARED: 'artist-declared',
  UNABLE: 'unable-to-verify',
  STALE: 'stale',
}

// Resolve a claim's method label from its method_label override + verification_status.
// claims.method_label is set to 'producer-confirmed' (or 'stale') by server logic;
// otherwise the bounded verification_status maps to a label.
export function methodLabelFor({ method_label, verification_status, expires_at } = {}) {
  if (method_label === METHOD_LABELS.PRODUCER_CONFIRMED) return METHOD_LABELS.PRODUCER_CONFIRMED
  if (method_label === METHOD_LABELS.STALE) return METHOD_LABELS.STALE
  // Auto-stale: a claim past its review window (expires_at) prompts a refresh.
  if (expires_at && new Date(expires_at).getTime() < Date.now()) return METHOD_LABELS.STALE
  switch (verification_status) {
    case VERIFICATION_STATUS.VERIFIED: return METHOD_LABELS.EVIDENCE_SUPPORTED
    case VERIFICATION_STATUS.SUPPORTING: return METHOD_LABELS.SOURCE_LINKED
    case VERIFICATION_STATUS.SELF_REPORTED: return METHOD_LABELS.ARTIST_DECLARED
    case VERIFICATION_STATUS.NOT_ASSESSABLE: return METHOD_LABELS.UNABLE
    default: return METHOD_LABELS.ARTIST_DECLARED
  }
}
