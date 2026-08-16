// ============================================================
// LOCK — PUBLIC PASSPORT BOUNDARY CONTRACT (Lane G)
//
// WHAT THIS FILE IS: the vocabulary of the ONE public, shareable, potentially
// indexable artist Passport surface — terminal states, visibility modes, index
// consent, slug law, version policy, the projection field allowlist and the
// locale/OG registry. Data only. Every RULE that consumes it lives in
// src/lib/publicPassport.js; every RENDERER consumes both and invents neither.
//
// WHY IT EXISTS: today the only passport surface that a buyer can open without
// a login is the SPA route /passport/:id, which lives INSIDE the private app
// origin (/app/* is blanket-noindexed by X-Robots-Tag + a meta tag in all 30
// committed shells), plus a static fictional /passport/demo on the marketing
// site (noindex by owner ruling D5). So a genuinely public artist Passport has
// no correct home, and "public" and "indexable" are silently the same word.
// They are not the same word. This contract splits them:
//   · REACHABILITY is granted by publishing  → the link works.
//   · INDEXABILITY is granted by CONSENT     → the crawler is allowed.
// Default is unlisted. Indexation is an affirmative, recorded, revocable act.
//
// FIREWALL (CLAUDE.md, absolute): this is a BUYER-FACING surface, not an
// artist-private one. Bands + binaries + method labels only. No gaps, no
// coaching, no percentages, no ranking, no prediction. The projection here is
// an ALLOWLIST — a field that is not named below cannot reach the page, so a
// new private field added upstream fails closed instead of leaking.
//
// RELATION TO THE SHARE-LINK CONTRACT (src/lib/shareLink.js + migration 041):
// they are DIFFERENT SURFACES and must stay different.
//   · share_link  = a bearer TOKEN, one recipient, ONE PINNED immutable
//                   version, revocable, never indexable, never in a sitemap.
//   · this file   = a durable public SLUG, no recipient, resolving to the
//                   CURRENT published version, indexable only by consent.
// The "one link = one recipient view = one version" rule belongs to the token
// surface. Pinning a public URL to a frozen version would create one indexable
// URL per version of the same artist — see VERSION_POLICY below.
// ============================================================

// ── Terminal states ─────────────────────────────────────────────────────────
/**
 * The seven outcomes of resolving a public passport URL. Exhaustive, mutually
 * exclusive, and each one is a DIFFERENT answer to the reader and to a crawler.
 * Collapsing any two of them (the usual temptation: "just 404 it") destroys
 * information the buyer and the search engine both need.
 */
export const PUBLIC_STATE = Object.freeze({
  /** Published + discoverable + consent on record. Served, indexable. */
  OK: 'ok',
  /** Published, reachable by link, NOT indexable. The default answer. */
  UNLISTED_OK: 'unlisted_ok',
  /** No such public passport ever existed here (or the slug is malformed / is
   *  an internal identifier). Never leaks that a draft exists. */
  NOT_FOUND: 'not_found',
  /** It existed, the artist withdrew it. Permanent, deliberate, de-indexable. */
  GONE: 'gone',
  /** A time-boxed publication lapsed on the clock. Distinct from withdrawal:
   *  nobody revoked anything, and the artist can re-publish. */
  EXPIRED: 'expired',
  /** A version-addressed public URL whose version is no longer current. The
   *  public surface never serves stale evidence; it redirects to the canonical. */
  SUPERSEDED_REDIRECT: 'superseded_redirect',
  /** Claims discoverable, but no valid index consent backs the claim. Served
   *  (the artist's own link must keep working) but NEVER indexed, NEVER in a
   *  sitemap. A repairable state, not a punishment. */
  NOT_CONSENTED: 'not_consented',
})

export const PUBLIC_STATES = Object.freeze([
  PUBLIC_STATE.OK,
  PUBLIC_STATE.UNLISTED_OK,
  PUBLIC_STATE.NOT_FOUND,
  PUBLIC_STATE.GONE,
  PUBLIC_STATE.EXPIRED,
  PUBLIC_STATE.SUPERSEDED_REDIRECT,
  PUBLIC_STATE.NOT_CONSENTED,
])

/** States that render a Passport body. Everything else renders a reason. */
export const SERVING_STATES = Object.freeze([
  PUBLIC_STATE.OK,
  PUBLIC_STATE.UNLISTED_OK,
  PUBLIC_STATE.NOT_CONSENTED,
])

/**
 * One HTTP mapping so no route invents its own.
 * 410 vs 404 is the load-bearing distinction: 410 tells a crawler "this URL is
 * dead on purpose, drop it", 404 leaves it in the recrawl queue for months.
 * GONE and EXPIRED share the status code and DO NOT share the state, because
 * they differ in copy, in recovery path, and in what the artist must do next.
 */
export const STATE_HTTP_STATUS = Object.freeze({
  [PUBLIC_STATE.OK]: 200,
  [PUBLIC_STATE.UNLISTED_OK]: 200,
  [PUBLIC_STATE.NOT_CONSENTED]: 200,
  [PUBLIC_STATE.NOT_FOUND]: 404,
  [PUBLIC_STATE.GONE]: 410,
  [PUBLIC_STATE.EXPIRED]: 410,
  [PUBLIC_STATE.SUPERSEDED_REDIRECT]: 301,
})

/**
 * The robots directive per state. Exactly ONE state is indexable, and it is the
 * one that required a recorded consent to reach. Everything else is noindex —
 * including error states, so a 410 body can never be indexed as content.
 */
export const STATE_ROBOTS = Object.freeze({
  [PUBLIC_STATE.OK]: 'index, follow',
  [PUBLIC_STATE.UNLISTED_OK]: 'noindex, nofollow',
  [PUBLIC_STATE.NOT_CONSENTED]: 'noindex, nofollow',
  [PUBLIC_STATE.NOT_FOUND]: 'noindex, nofollow',
  [PUBLIC_STATE.GONE]: 'noindex, nofollow',
  [PUBLIC_STATE.EXPIRED]: 'noindex, nofollow',
  [PUBLIC_STATE.SUPERSEDED_REDIRECT]: 'noindex, nofollow',
})

// ── Visibility modes + index consent ────────────────────────────────────────
/**
 * TWO modes and no third. "public" is not a mode here because it is ambiguous
 * — it is the word that hid this whole problem.
 */
export const PUBLIC_MODE = Object.freeze({
  UNLISTED: 'unlisted',
  DISCOVERABLE: 'discoverable',
})

export const PUBLIC_MODES = Object.freeze([PUBLIC_MODE.UNLISTED, PUBLIC_MODE.DISCOVERABLE])

/**
 * THE DEFAULT. A row with no mode, an unrecognised mode, or a null mode is
 * UNLISTED. This is a fail-closed default and it is asserted by
 * scripts/test-public-passport-contract.mjs.
 */
export const DEFAULT_PUBLIC_MODE = PUBLIC_MODE.UNLISTED

/** Publication lifecycle of the public boundary record itself. */
export const PUBLICATION_STATE = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  WITHDRAWN: 'withdrawn',
})

export const PUBLICATION_STATES = Object.freeze(Object.values(PUBLICATION_STATE))

/** Consent scopes. Only ONE exists today; the column is an enum so the next
 *  one (e.g. an AI-training scope) is an addition, not a boolean flip. */
export const CONSENT_SCOPE = Object.freeze({ INDEX: 'index' })

/**
 * The consent TEXT version the artist agreed to. Bumping this string is what
 * forces re-consent: a consent recorded against an older text is stale, and a
 * stale consent does not authorise indexation.
 */
export const CONSENT_TEXT_VERSION = 'index-consent-v1'

/** Why a consent evaluation failed. Never a boolean — the artist gets told. */
export const CONSENT_REFUSAL = Object.freeze({
  MISSING: 'consent_missing',
  REVOKED: 'consent_revoked',
  WRONG_SCOPE: 'consent_wrong_scope',
  STALE_TEXT: 'consent_stale_text',
  NOT_AN_ACT_MATCH: 'consent_act_mismatch',
})

// ── Slug law ────────────────────────────────────────────────────────────────
/**
 * A public slug is a DURABLE PUBLIC IDENTIFIER and explicitly NOT the internal
 * artist/act UUID. Two reasons, both hard:
 *   1. an internal UUID in a public URL is an oracle — it lets anyone probe the
 *      private app surfaces (/passport/:id, /evidence/:artistId) with a key they
 *      were handed by a search engine;
 *   2. a UUID cannot be retired. A slug can be retired and gravestoned (410)
 *      while the underlying Act keeps living under a new one.
 */
export const PUBLIC_SLUG_MIN = 6
export const PUBLIC_SLUG_MAX = 48
export const PUBLIC_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{4,46}[a-z0-9]$/
/** Any canonical or unhyphenated UUID shape is refused as a slug. */
export const UUID_PATTERN = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i

/** Paths the public namespace cannot hand out without colliding with the site. */
export const RESERVED_SLUGS = Object.freeze([
  'app', 'api', 'admin', 'artists', 'bookers', 'producers', 'pricing', 'faq',
  'radar', 'contact', 'privacy', 'terms', 'accessibility', 'methodology',
  'how-it-works', 'passport', 'demo', 'sitemap', 'robots', 'assets', 'brand',
  'login', 'signup', 'onboarding', 'settings', 'discover', 'confirm', 'invite',
])

/** The public namespace. NOT /passport/* — that prefix is already the private
 *  SPA route and the fictional demo, and reusing it would re-merge the two
 *  boundaries this contract exists to separate. */
export const PUBLIC_PATH_PREFIX = '/p'

// ── Version policy ──────────────────────────────────────────────────────────
/**
 * What a PUBLIC URL resolves to when a newer version exists. Both options are
 * real; they are not equally correct for an INDEXABLE surface.
 *
 * FLOATING_CANONICAL (recommended, the default here)
 *   /p/{slug} always resolves to the CURRENT published version. A version-
 *   addressed form /p/{slug}/v{n} stays addressable for citation, is always
 *   noindex, and carries rel=canonical to /p/{slug}; when it is no longer
 *   current it answers SUPERSEDED_REDIRECT (301) to the canonical URL.
 *   · one indexable URL per Act, ever — no canonical dilution, no duplicate
 *     content, no decaying evidence sitting in the index;
 *   · a buyer who found the artist through search always sees today's truth;
 *   · "one link = one version" is NOT weakened, because that rule belongs to
 *     the token-bound share_link surface (041), which is untouched here.
 *
 * PINNED
 *   /p/{slug} freezes to the version that was current when the slug was shared.
 *   · honours "one link = one version" literally on a surface it was not
 *     written for; creates N indexable URLs per artist over time, guarantees
 *     that the indexed page is the one MOST out of date, and makes withdrawal
 *     partial (you must revoke every pinned URL, not one).
 *
 * RECOMMENDATION: FLOATING_CANONICAL for the public slug, PINNED for the token.
 * Two surfaces, two rules, one sentence each — this needs the owner's word
 * because it interacts with the "one link = one version" IA rule.
 */
export const VERSION_POLICY = Object.freeze({
  FLOATING_CANONICAL: 'floating_canonical',
  PINNED: 'pinned',
})

export const DEFAULT_VERSION_POLICY = VERSION_POLICY.FLOATING_CANONICAL

/** Version states of public.passport_versions (migration 041) this surface may
 *  serve. Draft / preview / review were never authorised for anyone. */
export const PUBLIC_READABLE_VERSION_STATES = Object.freeze(['published'])
/** Superseded is READABLE but never CANONICAL: it redirects, it does not serve. */
export const REDIRECTING_VERSION_STATES = Object.freeze(['superseded'])

// ── Projection allowlist (the firewall as a data structure) ──────────────────
/**
 * The ONLY top-level keys a public passport projection may carry. Anything the
 * upstream row gains later — a private band, a coaching line, an internal
 * confidence value, a reaction — is dropped because it is not named here.
 */
export const PUBLIC_PROJECTION_FIELDS = Object.freeze([
  'slug', 'actName', 'actKind', 'homeBase', 'activeSince',
  'sections', 'methodLegend', 'lastReviewedAt', 'locale', 'versionNo',
])

/** The ONLY keys a public proof unit may carry. */
export const PUBLIC_PROOF_UNIT_FIELDS = Object.freeze([
  'claim', 'contextLine', 'band', 'binary', 'methodLabel', 'reviewedAt',
])

/** The ONLY keys a public section may carry. */
export const PUBLIC_SECTION_FIELDS = Object.freeze(['key', 'label', 'units'])

/**
 * A claim reaches this surface only if BOTH are true. The artist's approval is
 * the publish firewall gate (v9's flat claim enum omits it — a dev implementing
 * v9 literally would delete this); publication is the act of making it public.
 */
export const PUBLIC_CLAIM_REQUIREMENTS = Object.freeze({
  artistApproved: true,
  published: true,
})

// ── Locale + OG registry ────────────────────────────────────────────────────
/** Active at launch. HE first: the buyer is Israeli. */
export const ACTIVE_LOCALES = Object.freeze(['he', 'en'])
/** Registered so the shape exists, INACTIVE so nothing is claimed that does not
 *  exist. An hreflang alternate to an untranslated page is a lie to a crawler. */
export const REGISTERED_INACTIVE_LOCALES = Object.freeze(['ru', 'de'])
export const X_DEFAULT_LOCALE = 'en'

/** BCP-47 / OG locale identity per active locale. */
export const LOCALE_META = Object.freeze({
  he: Object.freeze({ bcp47: 'he-IL', og: 'he_IL', dir: 'rtl', pathPrefix: '/he' }),
  en: Object.freeze({ bcp47: 'en', og: 'en_US', dir: 'ltr', pathPrefix: '' }),
  ru: Object.freeze({ bcp47: 'ru', og: 'ru_RU', dir: 'ltr', pathPrefix: '/ru' }),
  de: Object.freeze({ bcp47: 'de', og: 'de_DE', dir: 'ltr', pathPrefix: '/de' }),
})

/** The canonical origin. Mirrors website-next/lib/site.ts (owner ruling D2):
 *  canonical host = www; the apex 308-redirects to it. */
export const PUBLIC_ORIGIN = 'https://www.lock.show'

/**
 * schema.org types this surface may emit, and the ones it may never emit.
 * The forbidden list is not decoration: aggregateRating and
 * interactionStatistic are exactly how a firewall-safe page grows a public
 * number without anyone deciding to add one.
 */
export const ALLOWED_SCHEMA_TYPES = Object.freeze(['MusicGroup', 'Person', 'ProfilePage', 'BreadcrumbList'])
export const FORBIDDEN_SCHEMA_KEYS = Object.freeze([
  'aggregateRating', 'ratingValue', 'reviewRating', 'interactionStatistic',
  'userInteractionCount', 'ratingCount', 'reviewCount', 'position',
])

// ── Result shape ────────────────────────────────────────────────────────────
/**
 * @typedef {Object} PublicPassportResult
 * @property {string} state             one of PUBLIC_STATE
 * @property {number} httpStatus        from STATE_HTTP_STATUS
 * @property {string} robots            from STATE_ROBOTS
 * @property {boolean} indexable        true for exactly one state
 * @property {boolean} sitemapEligible  true for exactly one state
 * @property {string|null} reason       CONSENT_REFUSAL / diagnostic key, or null
 * @property {string|null} canonicalPath  set when a body is served or redirected
 * @property {string|null} redirectPath   set only for SUPERSEDED_REDIRECT
 * @property {number|null} versionNo      the version actually served
 */

/** Build a frozen result. The ONE constructor — no route assembles its own. */
export function publicResult(state, extra = {}) {
  if (!PUBLIC_STATES.includes(state)) {
    throw new Error(`publicResult: unknown state "${state}"`)
  }
  return Object.freeze({
    state,
    httpStatus: STATE_HTTP_STATUS[state],
    robots: STATE_ROBOTS[state],
    indexable: state === PUBLIC_STATE.OK,
    sitemapEligible: state === PUBLIC_STATE.OK,
    reason: extra.reason ?? null,
    canonicalPath: extra.canonicalPath ?? null,
    redirectPath: extra.redirectPath ?? null,
    versionNo: extra.versionNo ?? null,
  })
}
