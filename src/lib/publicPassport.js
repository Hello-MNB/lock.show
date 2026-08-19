// ============================================================
// LOCK SHOW — PUBLIC PASSPORT BOUNDARY RULE (Lane G)
//
// The one place the PUBLIC passport resolution RULE lives. Pure functions only:
// no network, no Supabase client, no filesystem, no ambient clock (every
// time-sensitive function takes `now`), no side effects. Same discipline, and
// the same reason, as src/lib/shareLink.js: this rule has to hold identically
// in three places and must not be re-derived in any of them —
//   · Postgres — resolve_public_passport() (the migration specified in
//     docs/V9-GAP-ANALYSIS.md §8, NOT yet authored: this lane writes no SQL)
//   · the server-rendered public route (placement recommendation: a Next.js
//     route on the marketing project — see the doc section)
//   · any client that renders the dead / withdrawn / unlisted surfaces
// If the SQL and this file ever disagree, the SQL wins at runtime and the
// disagreement is a bug; scripts/test-public-passport-contract.mjs exists to
// keep this file honest on its own terms.
//
// THE TWO WORDS THIS FILE KEEPS APART:
//   REACHABLE   — publishing makes the link work.
//   INDEXABLE   — only a recorded, scoped, revocable consent lets a crawler in.
// Default is unlisted. Nothing here can put a URL in a sitemap without an
// explicit consent record; that is asserted mechanically, not promised.
//
// FIREWALL: this is a buyer-facing surface. Bands + binaries + method labels.
// The projection is an ALLOWLIST, so an upstream field that did not exist when
// this was written cannot leak through it.
// ============================================================
import {
  PUBLIC_STATE, PUBLIC_STATES, SERVING_STATES, publicResult,
  PUBLIC_MODE, PUBLIC_MODES, DEFAULT_PUBLIC_MODE,
  PUBLICATION_STATE, CONSENT_SCOPE, CONSENT_TEXT_VERSION, CONSENT_REFUSAL,
  PUBLIC_SLUG_PATTERN, PUBLIC_SLUG_MIN, PUBLIC_SLUG_MAX, UUID_PATTERN, RESERVED_SLUGS,
  PUBLIC_PATH_PREFIX, PUBLIC_ORIGIN,
  VERSION_POLICY, DEFAULT_VERSION_POLICY,
  PUBLIC_READABLE_VERSION_STATES, REDIRECTING_VERSION_STATES,
  PUBLIC_PROJECTION_FIELDS, PUBLIC_PROOF_UNIT_FIELDS, PUBLIC_SECTION_FIELDS,
  ACTIVE_LOCALES, ROUTED_LOCALES, REGISTERED_INACTIVE_LOCALES, X_DEFAULT_LOCALE, LOCALE_META,
  ALLOWED_SCHEMA_TYPES,
} from './contracts/publicPassport.contract.js'

export * from './contracts/publicPassport.contract.js'

// ── time ────────────────────────────────────────────────────────────────────
function toTime(v) {
  if (v instanceof Date) return v.getTime()
  if (typeof v === 'number') return v
  const t = Date.parse(String(v))
  return Number.isFinite(t) ? t : NaN
}

// ── slug law ────────────────────────────────────────────────────────────────
/**
 * Shape check only — NEVER an authorisation decision. A well-formed slug that
 * matches no row is still not_found.
 */
export function isWellFormedPublicSlug(slug) {
  if (typeof slug !== 'string') return false
  const s = slug.trim()
  if (s.length < PUBLIC_SLUG_MIN || s.length > PUBLIC_SLUG_MAX) return false
  if (!PUBLIC_SLUG_PATTERN.test(s)) return false
  if (UUID_PATTERN.test(s)) return false            // a UUID is never a slug
  if (RESERVED_SLUGS.includes(s)) return false
  if (/--/.test(s)) return false                    // no double hyphen: lookalike protection
  return true
}

/**
 * A slug may never BE an internal identifier, in any casing or hyphenation.
 * This is the anti-oracle rule: a public URL that hands out the act/artist UUID
 * hands out a probe key for the private app routes.
 */
export function slugIsInternalIdentifier(slug, ids = {}) {
  if (typeof slug !== 'string') return false
  const flat = (v) => String(v ?? '').toLowerCase().replace(/-/g, '')
  const s = flat(slug)
  if (!s) return false
  if (UUID_PATTERN.test(slug.trim())) return true
  return [ids.actId, ids.artistId, ids.personId, ids.orgId, ids.passportVersionId]
    .filter(Boolean).some((id) => flat(id) === s)
}

/** Public path for a slug. Locale-prefixed, optionally version-addressed. */
export function publicPathFor(slug, { locale = X_DEFAULT_LOCALE, versionNo = null } = {}) {
  const meta = LOCALE_META[locale] || LOCALE_META[X_DEFAULT_LOCALE]
  const base = `${meta.pathPrefix}${PUBLIC_PATH_PREFIX}/${slug}`
  return versionNo == null ? base : `${base}/v${versionNo}`
}

export function publicUrlFor(slug, opts) {
  return `${PUBLIC_ORIGIN}${publicPathFor(slug, opts)}`
}

// ── mode ────────────────────────────────────────────────────────────────────
/**
 * FAIL-CLOSED. null, undefined, '', 'public', 'PUBLIC', a typo, an injected
 * object — all of them are UNLISTED. Discoverable is reachable by exactly one
 * spelling of one word.
 */
export function normalizeMode(mode) {
  return PUBLIC_MODES.includes(mode) ? mode : DEFAULT_PUBLIC_MODE
}

// ── index consent ───────────────────────────────────────────────────────────
/**
 * Evaluate a recorded consent against the record it claims to authorise.
 * Returns { consented, reason }. `consented` is true ONLY when every clause
 * holds; every failure names itself so the artist can be told what to do.
 *
 * @param {Object|null} record  the public boundary row
 * @param {Object|null} consent the consent row (scope, granted_at, revoked_at,
 *                              consent_text_version, act_id, granted_by)
 * @param {Object} [opts] { now }
 */
export function evaluateIndexConsent(record, consent, opts = {}) {
  const now = toTime(opts.now ?? Date.now())
  if (!consent) return refusal(CONSENT_REFUSAL.MISSING)
  if (consent.scope !== CONSENT_SCOPE.INDEX) return refusal(CONSENT_REFUSAL.WRONG_SCOPE)
  if (!consent.granted_at) return refusal(CONSENT_REFUSAL.MISSING)
  if (!consent.granted_by) return refusal(CONSENT_REFUSAL.MISSING)
  if (toTime(consent.granted_at) > now) return refusal(CONSENT_REFUSAL.MISSING)
  if (consent.revoked_at) return refusal(CONSENT_REFUSAL.REVOKED)
  if (consent.consent_text_version !== CONSENT_TEXT_VERSION) return refusal(CONSENT_REFUSAL.STALE_TEXT)
  // Consent belongs to an ACT (multi-act law: evidence and authority are
  // per-Act and non-transferable). A consent granted for another Act never
  // authorises this one.
  if (record?.act_id && consent.act_id && record.act_id !== consent.act_id) {
    return refusal(CONSENT_REFUSAL.NOT_AN_ACT_MATCH)
  }
  return Object.freeze({ consented: true, reason: null })
}

function refusal(reason) {
  return Object.freeze({ consented: false, reason })
}

// ── the rule ────────────────────────────────────────────────────────────────
/**
 * Resolve a public passport URL.
 *
 * PRECEDENCE IS FIXED. Any SQL or route implementation must match it statement
 * for statement:
 *   1. slug malformed / reserved / a UUID / an internal id  → not_found
 *   2. no boundary row                                      → not_found
 *   3. row withdrawn (or its Act/Person withdrawn)          → gone
 *   4. row not published (draft)                            → not_found   (a draft's existence is not public information)
 *   5. publication window lapsed                            → expired
 *   6. no current published version                         → gone        (published boundary, nothing left to show)
 *   7. version-addressed URL, version not current           → superseded_redirect (floating policy) | serve (pinned policy)
 *   8. mode discoverable + consent valid                    → ok
 *   9. mode discoverable + consent invalid                  → not_consented
 *  10. otherwise (the default)                              → unlisted_ok
 *
 * @param {Object} input
 * @param {string} input.slug                  the slug from the URL
 * @param {number|null} [input.requestedVersionNo]  set only for /p/{slug}/v{n}
 * @param {Object|null} input.record           the public boundary row
 * @param {Object|null} [input.currentVersion] the CURRENT published passport_version
 * @param {Object|null} [input.requestedVersion] the version the URL addressed
 * @param {Object|null} [input.consent]        the index-consent row
 * @param {Object} [opts] { now, versionPolicy, ids }
 * @returns {Readonly<import('./contracts/publicPassport.contract.js').PublicPassportResult>}
 */
export function resolvePublicPassport(input = {}, opts = {}) {
  const now = toTime(opts.now ?? Date.now())
  const policy = opts.versionPolicy ?? DEFAULT_VERSION_POLICY
  const { slug, record, currentVersion = null, requestedVersion = null, consent = null } = input
  const requestedVersionNo = input.requestedVersionNo ?? null

  // 1 — the slug itself
  if (!isWellFormedPublicSlug(slug)) return publicResult(PUBLIC_STATE.NOT_FOUND, { reason: 'slug_malformed' })
  if (slugIsInternalIdentifier(slug, opts.ids || {})) {
    return publicResult(PUBLIC_STATE.NOT_FOUND, { reason: 'slug_is_internal_identifier' })
  }

  // 2 — the row
  if (!record) return publicResult(PUBLIC_STATE.NOT_FOUND, { reason: 'no_record' })
  // A retired slug is a GRAVESTONE, not a vacancy: it resolves to gone forever
  // and is never re-issued to another Act.
  if (record.retired_at || record.slug_retired) {
    return publicResult(PUBLIC_STATE.GONE, { reason: 'slug_retired' })
  }

  // 3 — withdrawal beats everything that follows
  if (record.state === PUBLICATION_STATE.WITHDRAWN || record.withdrawn_at) {
    return publicResult(PUBLIC_STATE.GONE, { reason: 'withdrawn_by_artist' })
  }

  // 4 — a draft does not exist as far as the public is concerned
  if (record.state !== PUBLICATION_STATE.PUBLISHED) {
    return publicResult(PUBLIC_STATE.NOT_FOUND, { reason: 'not_published' })
  }

  // 5 — the clock. expires_at == null means ENDLESS: a deliberate answer, the
  // same rule as artist_access.expires_at and share_link.expiry.
  if (record.expires_at != null) {
    const t = toTime(record.expires_at)
    if (Number.isFinite(t) && t <= now) {
      return publicResult(PUBLIC_STATE.EXPIRED, { reason: 'publication_window_lapsed' })
    }
  }

  // 6 — a published boundary with nothing published behind it is not a 404: the
  // URL existed and was withdrawn at the evidence layer.
  if (!currentVersion || !PUBLIC_READABLE_VERSION_STATES.includes(currentVersion.state)) {
    return publicResult(PUBLIC_STATE.GONE, { reason: 'no_published_version' })
  }

  const canonicalPath = publicPathFor(record.slug ?? slug, { locale: opts.locale ?? X_DEFAULT_LOCALE })

  // 7 — version-addressed URLs
  if (requestedVersionNo != null) {
    const v = requestedVersion
    if (!v) return publicResult(PUBLIC_STATE.NOT_FOUND, { reason: 'no_such_version' })
    if (v.state && !PUBLIC_READABLE_VERSION_STATES.concat(REDIRECTING_VERSION_STATES).includes(v.state)) {
      // draft / preview / review / withdrawn were never authorised for anyone
      return publicResult(PUBLIC_STATE.GONE, { reason: 'version_not_authorised' })
    }
    const isCurrent = v.id === currentVersion.id || v.version_no === currentVersion.version_no
    if (!isCurrent && policy === VERSION_POLICY.FLOATING_CANONICAL) {
      return publicResult(PUBLIC_STATE.SUPERSEDED_REDIRECT, {
        reason: 'newer_version_published',
        canonicalPath,
        redirectPath: canonicalPath,
        versionNo: currentVersion.version_no ?? null,
      })
    }
  }

  const servedVersionNo = (requestedVersionNo != null && policy === VERSION_POLICY.PINNED
    ? requestedVersion?.version_no
    : currentVersion.version_no) ?? null

  // 8 / 9 — indexation is a consent decision, never a publication side effect
  if (normalizeMode(record.mode) === PUBLIC_MODE.DISCOVERABLE) {
    const verdict = evaluateIndexConsent(record, consent, { now })
    if (verdict.consented) {
      return publicResult(PUBLIC_STATE.OK, { canonicalPath, versionNo: servedVersionNo })
    }
    // The artist's own link keeps working. Only the crawler is refused.
    return publicResult(PUBLIC_STATE.NOT_CONSENTED, {
      reason: verdict.reason, canonicalPath, versionNo: servedVersionNo,
    })
  }

  // 10 — THE DEFAULT
  return publicResult(PUBLIC_STATE.UNLISTED_OK, { canonicalPath, versionNo: servedVersionNo })
}

/** Does this result render a Passport body? */
export function servesBody(result) {
  return SERVING_STATES.includes(result?.state)
}

/** Robots directive for a resolved result — one source, no route improvises. */
export function robotsDirectiveFor(result) {
  return result?.robots ?? 'noindex, nofollow'
}

export function httpStatusFor(result) {
  return result?.httpStatus ?? 404
}

// ── sitemap ─────────────────────────────────────────────────────────────────
/**
 * A sitemap entry EXISTS ONLY for a result whose state is `ok` — which is
 * reachable only through evaluateIndexConsent() returning consented. There is
 * no second path into this function and no override parameter, deliberately:
 * "include it in the sitemap" must be impossible to express without consent.
 * Returns null for every other state.
 */
export function sitemapEntryFor(result, record, { lastModified = null } = {}) {
  if (!result || result.state !== PUBLIC_STATE.OK) return null
  if (!result.sitemapEligible) return null
  const slug = record?.slug
  if (!isWellFormedPublicSlug(slug)) return null
  return Object.freeze({
    url: publicUrlFor(slug),
    lastModified: lastModified ?? record?.published_at ?? null,
    changeFrequency: 'monthly',
    priority: 0.5,
    alternates: hreflangAlternatesFor(slug),
  })
}

/** Fold many resolved passports into the sitemap rows. Consent-gated by
 *  construction — this is a filter over sitemapEntryFor, never a second rule. */
export function sitemapEntries(resolved = []) {
  return resolved
    .map(({ result, record, lastModified }) => sitemapEntryFor(result, record, { lastModified }))
    .filter(Boolean)
}

// ── locale / hreflang ───────────────────────────────────────────────────────
/**
 * hreflang set for a public passport URL.
 *
 * RECIPROCITY IS STRUCTURAL: every emitted locale's alternate set is generated
 * from the same list, so each page points at every other page INCLUDING
 * itself, which is what a crawler requires.
 *
 * EMISSION = ACTIVE ∩ ROUTED. A locale that is intended for launch but has no
 * route tree yet (today: `he`) is NOT emitted, and registered-but-inactive
 * locales (`ru`, `de`) are never emitted. An alternate that 404s or silently
 * serves English gets the entire cluster ignored — see the note in the
 * contract and website-next/lib/locales.ts.
 */
export function hreflangAlternatesFor(slug, { locales = ACTIVE_LOCALES, routed = ROUTED_LOCALES } = {}) {
  const emittable = locales.filter((l) => ACTIVE_LOCALES.includes(l) && routed.includes(l))
  const out = emittable.map((l) => Object.freeze({
    hreflang: LOCALE_META[l].bcp47,
    href: publicUrlFor(slug, { locale: l }),
  }))
  out.push(Object.freeze({ hreflang: 'x-default', href: publicUrlFor(slug, { locale: X_DEFAULT_LOCALE }) }))
  return Object.freeze(out)
}

/** Locales that exist in the registry but must never be emitted yet. */
export function inactiveLocales() {
  return REGISTERED_INACTIVE_LOCALES
}

// ── projection ──────────────────────────────────────────────────────────────
/**
 * Build the PUBLIC projection from approved+published claims only.
 *
 * Two independent firewalls, because one is never enough:
 *   (a) SOURCE  — a claim enters only if artist_approved AND published AND its
 *       visibility permits a public face. Nothing else is even considered.
 *   (b) SHAPE   — the output is assembled from an ALLOWLIST of keys. A field
 *       that is not named in the contract cannot appear, so a private field
 *       added upstream next month fails closed instead of leaking.
 *
 * Draw is a BAND or a BINARY with a method label. No count, no percentage, no
 * ranking, no prediction, no gap, no coaching. A section with nothing verified
 * is OMITTED (render law) — the public face never renders "missing".
 */
export function projectPublicPassport(input = {}) {
  const { act = {}, claims = [], slug = null, locale = X_DEFAULT_LOCALE, versionNo = null } = input

  const eligible = claims.filter(isPubliclyEligibleClaim)

  const sections = groupSections(eligible)
    .map(({ key, label, units }) => Object.freeze(pick({
      key,
      label,
      units: units.map(toPublicProofUnit).filter(Boolean),
    }, PUBLIC_SECTION_FIELDS)))
    .filter((s) => s.units.length > 0)

  const methodLegend = Object.freeze([...new Set(
    sections.flatMap((s) => s.units.map((u) => u.methodLabel)).filter(Boolean),
  )])

  return Object.freeze(pick({
    slug,
    actName: act.name ?? null,
    actKind: act.kind ?? null,
    homeBase: act.home_base ?? null,
    activeSince: act.active_since ?? null,
    sections: Object.freeze(sections),
    methodLegend,
    lastReviewedAt: latestReviewedAt(eligible),
    locale,
    versionNo,
  }, PUBLIC_PROJECTION_FIELDS))
}

/** (a) SOURCE firewall. Both flags affirmative — truthiness is not consent. */
export function isPubliclyEligibleClaim(claim) {
  if (!claim) return false
  if (claim.artist_approved !== true) return false
  if (claim.published !== true) return false
  if (claim.visibility != null && claim.visibility !== 'passport-ok') return false
  if (!claim.method_label) return false            // an unlabelled claim is not evidence
  return Boolean(claim.public_wording || claim.public_band || claim.public_binary)
}

/** (b) SHAPE firewall. The raw `value` NEVER travels — only the buyer-safe
 *  wording, the band, or the binary. */
function toPublicProofUnit(claim) {
  const claimText = claim.public_wording || claim.public_band || claim.public_binary || null
  if (!claimText) return null
  return Object.freeze(pick({
    claim: claimText,
    contextLine: claim.public_context ?? null,
    band: claim.public_band ?? null,
    binary: claim.public_binary ?? null,
    methodLabel: claim.method_label,
    reviewedAt: claim.reviewed_at ?? null,
  }, PUBLIC_PROOF_UNIT_FIELDS))
}

function groupSections(claims) {
  const order = ['draw', 'performance', 'readiness', 'context']
  const labels = { draw: 'draw', performance: 'performance', readiness: 'readiness', context: 'context' }
  return order.map((key) => ({
    key,
    label: labels[key],
    units: claims.filter((c) => (c.section ?? 'context') === key),
  }))
}

function latestReviewedAt(claims) {
  const stamps = claims.map((c) => c.reviewed_at).filter(Boolean).map(toTime).filter(Number.isFinite)
  if (!stamps.length) return null
  return new Date(Math.max(...stamps)).toISOString()
}

/** Keep ONLY allowlisted keys. The single chokepoint every public shape passes. */
function pick(obj, allowed) {
  const out = {}
  for (const k of allowed) if (obj[k] !== undefined) out[k] = obj[k]
  return out
}

// ── OG / schema ─────────────────────────────────────────────────────────────
/**
 * OG metadata for one locale. Built from the PROJECTION (already firewalled),
 * never from the raw row — an OG description is a public surface like any other
 * and has historically been where numbers escape.
 */
export function openGraphFor(projection, { locale = X_DEFAULT_LOCALE, result = null } = {}) {
  const meta = LOCALE_META[locale] || LOCALE_META[X_DEFAULT_LOCALE]
  const alternates = ACTIVE_LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].og)
  return Object.freeze({
    type: 'profile',
    locale: meta.og,
    alternateLocale: Object.freeze(alternates),
    siteName: 'LOCK SHOW',
    title: projection?.actName ?? null,
    description: null,     // supplied by the locale message file, never derived from evidence
    url: projection?.slug ? publicUrlFor(projection.slug, { locale }) : null,
    robots: result ? result.robots : 'noindex, nofollow',
    canonical: result?.canonicalPath ? `${PUBLIC_ORIGIN}${result.canonicalPath}` : null,
    alternates: projection?.slug ? hreflangAlternatesFor(projection.slug) : Object.freeze([]),
  })
}

/**
 * Minimal JSON-LD. Only allowlisted @types, and no key that could carry a
 * rating, a count or a position — see FORBIDDEN_SCHEMA_KEYS in the contract,
 * which the gate asserts against this output.
 */
export function schemaFor(projection, { locale = X_DEFAULT_LOCALE } = {}) {
  if (!projection?.actName || !projection?.slug) return null
  const type = ALLOWED_SCHEMA_TYPES[0]
  return Object.freeze({
    '@context': 'https://schema.org',
    '@type': type,
    name: projection.actName,
    url: publicUrlFor(projection.slug, { locale }),
    inLanguage: (LOCALE_META[locale] || LOCALE_META[X_DEFAULT_LOCALE]).bcp47,
  })
}

/** Every terminal state, for exhaustive switches in renderers and tests. */
export function allPublicStates() {
  return PUBLIC_STATES
}
