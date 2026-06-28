// GIGPROOF analytics — stub implementation.
// Replace the flush() body with Amplitude/Mixpanel/PostHog when ready.
// All calls are no-ops in SSR; safe to call from anywhere.

const KEY = 'gigproof_events'
const MAX_EVENTS = 100

export function logEvent(name, props = {}) {
  if (typeof localStorage === 'undefined') return
  try {
    const events = JSON.parse(localStorage.getItem(KEY) || '[]')
    events.unshift({ name, props, ts: new Date().toISOString() })
    if (events.length > MAX_EVENTS) events.length = MAX_EVENTS
    localStorage.setItem(KEY, JSON.stringify(events))
    if (import.meta.env?.DEV) console.debug(`[analytics] ${name}`, props)
  } catch {}
}

// Common event names (exhaustive list helps keep naming consistent)
export const EVENTS = {
  SIGNUP: 'signup',
  LOGIN: 'login',
  CONSENT_ACCEPTED: 'consent_accepted',
  ONBOARDING_STEP: 'onboarding_step',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  EVIDENCE_UPLOADED: 'evidence_uploaded',
  EVIDENCE_PROCESSED: 'evidence_processed',
  CLAIM_VISIBILITY_CHANGED: 'claim_visibility_changed',
  PASSPORT_PUBLISHED: 'passport_published',
  PASSPORT_VIEWED: 'passport_viewed',
  REQUEST_SENT: 'request_sent',
  REQUEST_WHATSAPP_CLICK: 'request_whatsapp_click',
  SETTINGS_OPENED: 'settings_opened',
  DELETE_ACCOUNT_REQUESTED: 'delete_account_requested',
  LANGUAGE_CHANGED: 'language_changed',
}
