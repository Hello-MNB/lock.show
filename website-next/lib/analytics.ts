/**
 * Consent-aware, PII-free event emission for the public site.
 *
 * B4-70.10 §10.1 is explicit: "Do not send email, phone, name or free text to
 * analytics." This module is the ONLY place the site emits an event, and it
 * takes a fixed dimension shape so a free-text field cannot be passed by
 * accident — an unrecognised key is dropped rather than forwarded.
 *
 * It reads consent in the SAME format the banner writes ({value, at} with a
 * 12-month expiry, components/consent-banner.tsx:13-35) INCLUDING the expiry.
 * Checking only for 'granted' would keep firing on a consent that lapsed a year
 * ago, which is the failure the banner's own re-ask window exists to prevent.
 */
const CONSENT_KEY = 'gigproof_consent'
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

export type WaitlistEvent =
  | 'waitlist_cta_click'
  | 'waitlist_page_view'
  | 'waitlist_form_start'
  | 'waitlist_submit_attempt'
  | 'waitlist_join_success'
  | 'waitlist_join_duplicate'
  | 'waitlist_join_error'
  | 'waitlist_whatsapp_opt_in'
  | 'invited_user_login_click'
  | 'signup_cta_click'

/** The ONLY dimensions that may leave the browser. No free text, ever. */
export interface EventDimensions {
  page?: string
  placement?: string
  entity_role?: string
  locale?: string
  device?: 'mobile' | 'tablet' | 'desktop'
  campaign?: string
  source?: string
  error_code?: string
}

const ALLOWED: (keyof EventDimensions)[] = [
  'page', 'placement', 'entity_role', 'locale', 'device', 'campaign', 'source', 'error_code',
]

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    if (!raw) return false
    const { value, at } = JSON.parse(raw)
    if (!value || Date.now() - (at || 0) > MAX_AGE_MS) return false
    return value === 'granted'
  } catch { return false }
}

function device(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

export function track(event: WaitlistEvent, dims: EventDimensions = {}): void {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return
  const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag
  if (typeof g !== 'function') return

  // WHITELIST, not blacklist. A blacklist forwards the next field somebody
  // adds; this drops anything not named above, so a future `email` prop cannot
  // reach GA4 even if a caller passes one.
  const safe: Record<string, string> = {}
  for (const k of ALLOWED) {
    const v = dims[k]
    if (typeof v === 'string' && v.length > 0 && v.length <= 100) safe[k] = v
  }
  safe.device = dims.device ?? device()
  g('event', event, safe)
}
