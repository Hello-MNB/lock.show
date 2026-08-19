// ============================================================
// LOCK SHOW — SHARE LINK CONTRACT (P0-PRIVACY lane B1)
//
// The one place the link-resolution RULE lives. Pure functions only: no
// network, no Supabase client, no clock of its own (every function takes
// `now`), no side effects. That is deliberate — the same rule has to hold in
// three places and must not be re-derived in any of them:
//   · Postgres      — public.resolve_share_link() (migration 041 A5)
//   · the server    — server/index.js, behind SHARE_LINK_SERVICE_ENABLED
//   · the client    — whatever renders the dead-link surface
// If the SQL and this file ever disagree, the SQL wins at runtime and the
// disagreement is a bug; scripts/test-link-integrity.mjs exists to catch it.
//
// AUTHORITY (docs/DATA-LAYER-GAP-MAP.md A8 / C2, "one link = one recipient
// view = one version"): a recipient link binds exactly ONE immutable
// passport_version_id + one explicit audience policy + an expiry + a
// revocation path. A dead link returns its REASON AND NOTHING ELSE — never
// the act, never the version, never the snapshot it used to open.
//
// FIREWALL: nothing here computes or returns a count, score, percentile or
// rank. Open receipts are for audit; they never travel back to the artist.
// ============================================================

/** The six typed outcomes of presenting a token. Exhaustive and mutually exclusive. */
export const OUTCOME = Object.freeze({
  OK: 'ok',
  NOT_FOUND: 'not_found',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  SUPERSEDED_NOT_PERMITTED: 'superseded_not_permitted',
  WRONG_RECIPIENT: 'wrong_recipient',
})

/** Every outcome key, in the order the contract documents them. */
export const OUTCOMES = Object.freeze([
  OUTCOME.OK,
  OUTCOME.NOT_FOUND,
  OUTCOME.EXPIRED,
  OUTCOME.REVOKED,
  OUTCOME.SUPERSEDED_NOT_PERMITTED,
  OUTCOME.WRONG_RECIPIENT,
])

/**
 * The six recipient policies (LOCK-Screen-Registry §72 — "ONE renderer + six
 * decision policies"). One link opens exactly one of them. Stored as a
 * CHECK-constrained text column in 041; a later migration may add a
 * `recipient_policy` registry table and attach a FK without moving data.
 */
export const AUDIENCES = Object.freeze([
  'booker', 'producer', 'private', 'programmer', 'brand', 'rep',
])

/**
 * Statuses that still carry authority. 'active' is the legacy 024 default and
 * means exactly what 'live' means — 041 retains it rather than rewriting rows.
 */
export const LIVE_STATUSES = Object.freeze(['active', 'live'])

/** Version states a live link may legitimately open. */
export const READABLE_VERSION_STATES = Object.freeze(['published', 'superseded'])

// ── Token shape ─────────────────────────────────────────────────────────────
// GENERATION EXPECTATION (the server is the only minting authority):
//   raw = base64url(randomBytes(TOKEN_BYTES))  → 256 bits, 43 chars.
//   stored = sha256hex(raw) → 64 lowercase hex chars, share_link.token_hash.
// The raw token is shown to the minting owner ONCE and never stored anywhere.
// This is a bearer credential to a person's professional evidence: anything
// below 32 bytes of CSPRNG entropy is a defect, not a preference.
export const TOKEN_BYTES = 32
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43,}$/
export const TOKEN_HASH_PATTERN = /^[0-9a-f]{64}$/

/** Cheap client-side shape check — NEVER an authorisation decision. */
export function isWellFormedToken(token) {
  return typeof token === 'string' && TOKEN_PATTERN.test(token)
}

export function isWellFormedTokenHash(hash) {
  return typeof hash === 'string' && TOKEN_HASH_PATTERN.test(hash)
}

// ── Result shapes ───────────────────────────────────────────────────────────
/**
 * @typedef {Object} DeadResult   { outcome } — and nothing else. By construction.
 * @typedef {Object} OkResult
 *   { outcome:'ok', shareLinkId, passportVersionId, versionNo, versionState,
 *     audience, actId, expiry }
 */

/** A dead outcome carries its reason and no payload. One constructor, no leaks. */
function dead(outcome) {
  return Object.freeze({ outcome })
}

/** Is this a live-link result? */
export function isOk(result) {
  return result?.outcome === OUTCOME.OK
}

/** Every non-ok outcome. Useful for the dead-link renderer's exhaustive switch. */
export function isDead(result) {
  return Boolean(result) && result.outcome !== OUTCOME.OK
}

// ── The rule ────────────────────────────────────────────────────────────────
/**
 * Resolve a presented token against the row it matched and the version it binds.
 *
 * Precedence is fixed and must match migration 041 A5 statement for statement:
 *   1. no link row                       → not_found
 *   2. recipient declared "not me"       → wrong_recipient
 *   3. revoked / replaced / unpublished / withdrawn → revoked
 *   4. past its expiry (null = endless)  → expired
 *   5. any other non-live status         → revoked
 *   6. bound version missing             → not_found
 *   7. version not published/superseded  → superseded_not_permitted
 *   8. otherwise                         → ok
 *
 * Note on (7): a SUPERSEDED version stays reachable through the live link that
 * binds it — that is the entire point of binding one immutable version, and it
 * stops being reachable the moment the link stops being live (3/4/5). What is
 * refused is a version that was never published (draft/preview/review) or was
 * withdrawn — a version nobody ever authorised for a recipient.
 *
 * @param {Object|null} link    a public.share_link row (or null when the token matched nothing)
 * @param {Object|null} version the public.passport_versions row it binds
 * @param {Object} [opts]
 * @param {Date|number|string} [opts.now] evaluation time — injected, never read from the ambient clock
 * @returns {Readonly<DeadResult|OkResult>}
 */
export function resolveShareLink(link, version, opts = {}) {
  const now = toTime(opts.now ?? Date.now())

  if (!link) return dead(OUTCOME.NOT_FOUND)

  if (link.status === 'wrong_recipient' || link.wrong_recipient_at) {
    return dead(OUTCOME.WRONG_RECIPIENT)
  }
  if (link.revoked_at || ['revoked', 'replaced', 'unpublished', 'withdrawn'].includes(link.status)) {
    return dead(OUTCOME.REVOKED)
  }
  // expiry === null/undefined means ENDLESS — a deliberate answer, not a gap
  // (same rule as artist_access.expires_at in src/lib/mandateExpiry.js).
  if (link.status === 'expired') return dead(OUTCOME.EXPIRED)
  if (link.expiry != null) {
    const t = toTime(link.expiry)
    if (Number.isFinite(t) && t <= now) return dead(OUTCOME.EXPIRED)
  }
  if (!LIVE_STATUSES.includes(link.status)) return dead(OUTCOME.REVOKED)

  if (!version) return dead(OUTCOME.NOT_FOUND)
  // A link binds ONE version. A row that does not match the binding is not a
  // "wrong version" — it is a resolver bug, and it must not resolve.
  if (link.passport_version_id && version.id && link.passport_version_id !== version.id) {
    return dead(OUTCOME.NOT_FOUND)
  }
  if (version.state != null && !READABLE_VERSION_STATES.includes(version.state)) {
    return dead(OUTCOME.SUPERSEDED_NOT_PERMITTED)
  }

  return Object.freeze({
    outcome: OUTCOME.OK,
    shareLinkId: link.id ?? null,
    passportVersionId: version.id ?? link.passport_version_id ?? null,
    versionNo: version.version_no ?? null,
    versionState: version.state ?? null,
    audience: link.audience ?? version.audience ?? null,
    actId: link.act_id ?? version.act_id ?? null,
    expiry: link.expiry ?? null,
  })
}

function toTime(v) {
  if (v instanceof Date) return v.getTime()
  if (typeof v === 'number') return v
  const t = Date.parse(String(v))
  return Number.isFinite(t) ? t : NaN
}

// ── Idempotency ─────────────────────────────────────────────────────────────
// Both keys are DETERMINISTIC STRINGS built from the request itself. The caller
// hashes them if it wants them opaque; the uniqueness guarantee lives in the DB
// (idx_sle_idempotent on share_link_event), not in this file. Neither key ever
// contains PII — a session id is an anonymous uuid, a recipient label is not
// used.

/** Coarse bucket for open receipts: repeated opens inside one bucket are one receipt. */
export const OPEN_BUCKET_MS = 60 * 60 * 1000 // 1 hour

/**
 * Replay-safe key for an open receipt. The same session opening the same link
 * twice inside the same hour writes ONE receipt — a retried fetch, a double tap
 * and a proxy prefetch are the same event, not three.
 */
export function openIdempotencyKey(shareLinkId, sessionId, now = Date.now()) {
  const bucket = Math.floor(toTime(now) / OPEN_BUCKET_MS)
  return `open:${shareLinkId}:${sessionId || 'anon'}:${bucket}`
}

/**
 * Deterministic key for a mint request. Minting the same link twice (a retried
 * POST, a double-clicked button) must return the SAME link, never a second
 * bearer credential — so the key is derived from what the link IS, not from
 * when the button was pressed.
 */
export function mintIdempotencyKey({ passportVersionId, audience, recipientLabel, purpose, expiry }) {
  return [
    'mint',
    passportVersionId || '',
    audience || '',
    (recipientLabel || '').trim().toLowerCase(),
    (purpose || '').trim().toLowerCase(),
    expiry == null ? 'endless' : new Date(toTime(expiry)).toISOString(),
  ].join('|')
}

/**
 * Pure reducer proving the replay rule without a database: fold receipts into a
 * set of seen keys. Returns { state, written } — `written` is false for a replay.
 * The state holds KEYS ONLY: no counter, ever. (Firewall: an open count must
 * never become a number the artist can see.)
 */
export function applyOpenReceipt(state, key) {
  const seen = state instanceof Set ? state : new Set(state || [])
  if (seen.has(key)) return { state: seen, written: false }
  seen.add(key)
  return { state: seen, written: true }
}

/**
 * Normalise a DB/RPC response (jsonb from resolve_share_link) into the same
 * shape resolveShareLink() returns, so callers have ONE result type regardless
 * of which side did the resolving. Unknown outcomes fail closed to not_found.
 */
export function fromRpcResult(row) {
  const outcome = row?.outcome
  if (!OUTCOMES.includes(outcome)) return dead(OUTCOME.NOT_FOUND)
  if (outcome !== OUTCOME.OK) return dead(outcome)
  return Object.freeze({
    outcome: OUTCOME.OK,
    shareLinkId: row.share_link_id ?? null,
    passportVersionId: row.passport_version_id ?? null,
    versionNo: row.version_no ?? null,
    versionState: row.version_state ?? null,
    audience: row.audience ?? null,
    actId: row.act_id ?? null,
    expiry: row.expiry ?? null,
  })
}

// ── Mint refusals (APPSEC F3) ───────────────────────────────────────────────
// A mint is REFUSED, not "degraded", when its preconditions are not met. The
// vocabulary is typed and shared by all three mint paths so they refuse with the
// SAME word: the SQL RPC raises these as its exception message (with the
// SQLSTATE below), the server route returns them as `error`, and any client can
// switch on them exhaustively.
//
// TRACKING DISCLOSURE (PUB4, migration 024:23) is the one that had a hole: the
// server route demanded it while the SQL RPC hardcoded tracking_disclosed=false,
// so the RPC was a way around the gate. Disclosure is now affirmative-or-refuse
// in every path, and `false` and `missing` are the same answer: refuse.
export const MINT_REFUSAL = Object.freeze({
  PASSPORT_VERSION_REQUIRED: 'passport_version_required',
  AUDIENCE_INVALID: 'audience_invalid',
  TRACKING_DISCLOSURE_REQUIRED: 'tracking_disclosure_required',
  TOKEN_HASH_INVALID: 'token_hash_invalid',
  IDEMPOTENCY_KEY_REQUIRED: 'idempotency_key_required',
  MINT_RECEIPT_FAILED: 'mint_receipt_failed',
})

export const MINT_REFUSALS = Object.freeze(Object.values(MINT_REFUSAL))

/** SQLSTATEs migration 041 raises, keyed by the refusal they carry. */
export const MINT_REFUSAL_SQLSTATE = Object.freeze({
  [MINT_REFUSAL.TRACKING_DISCLOSURE_REQUIRED]: 'GP403',
  [MINT_REFUSAL.TOKEN_HASH_INVALID]: 'GP422',
  [MINT_REFUSAL.IDEMPOTENCY_KEY_REQUIRED]: 'GP422',
  [MINT_REFUSAL.MINT_RECEIPT_FAILED]: 'GP500',
})

/** One HTTP mapping, so no route invents its own. */
export const MINT_REFUSAL_HTTP_STATUS = Object.freeze({
  [MINT_REFUSAL.PASSPORT_VERSION_REQUIRED]: 400,
  [MINT_REFUSAL.AUDIENCE_INVALID]: 400,
  [MINT_REFUSAL.TRACKING_DISCLOSURE_REQUIRED]: 400,
  [MINT_REFUSAL.TOKEN_HASH_INVALID]: 400,
  [MINT_REFUSAL.IDEMPOTENCY_KEY_REQUIRED]: 400,
  [MINT_REFUSAL.MINT_RECEIPT_FAILED]: 500,
})

/**
 * Affirmative disclosure only. `true` passes; `false`, `undefined`, `null`,
 * `'true'`, `1` and everything else are refusals. Strictness is the point: a
 * truthy coercion is how "the artist was never told" becomes "disclosed".
 */
export function isAffirmativeDisclosure(value) {
  return value === true
}

/**
 * The ONE mint precondition rule. Returns null when the request may be minted,
 * or a MINT_REFUSAL key. Pure — no I/O, no clock, no client.
 */
export function validateMintRequest(request) {
  const req = request || {}
  if (!req.passportVersionId) return MINT_REFUSAL.PASSPORT_VERSION_REQUIRED
  if (!AUDIENCES.includes(req.audience)) return MINT_REFUSAL.AUDIENCE_INVALID
  if (!isAffirmativeDisclosure(req.trackingDisclosed)) return MINT_REFUSAL.TRACKING_DISCLOSURE_REQUIRED
  return null
}

/** HTTP status per outcome — one mapping, so no route invents its own. */
export const OUTCOME_HTTP_STATUS = Object.freeze({
  [OUTCOME.OK]: 200,
  [OUTCOME.NOT_FOUND]: 404,
  [OUTCOME.EXPIRED]: 410,
  [OUTCOME.REVOKED]: 410,
  [OUTCOME.SUPERSEDED_NOT_PERMITTED]: 410,
  [OUTCOME.WRONG_RECIPIENT]: 410,
})
