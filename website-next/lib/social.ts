// Official LOCK channels — the single source of truth for social + contact
// links. Used by the footer, the JSON-LD `sameAs` (SEO/GEO/AEO — search engines
// and AI answer-engines use sameAs to tie the brand to its verified profiles),
// and the contact page. Update here, everywhere follows.

export const SOCIAL = [
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/lock.show.growth.intelligence/' },
  { key: 'facebook',  label: 'Facebook',  href: 'https://www.facebook.com/lock.show.growth.intelligence/' },
  { key: 'linkedin',  label: 'LinkedIn',  href: 'https://www.linkedin.com/company/lock.show/' },
] as const

// `sameAs` for structured data: public brand profiles only. Direct phone or
// WhatsApp remains an operational/outreach channel, not public identity chrome.
export const SAME_AS = SOCIAL.map((s) => s.href)

// Official role-based inboxes on lock.show. One address per purpose so the right
// context always uses the right mailbox (legal text → legal@, privacy → privacy@,
// etc.). Transactional/auth mail sends FROM notifications@ once Resend is wired.
export const EMAILS = {
  hello: 'hello@lock.show',
  privacy: 'privacy@lock.show',
  notifications: 'notifications@lock.show',
  partners: 'partners@lock.show',
  support: 'support@lock.show',
  legal: 'legal@lock.show',
  press: 'press@lock.show',
  sales: 'sales@lock.show',
  marketing: 'marketing@lock.show',
  billing: 'billing@lock.show',
  security: 'security@lock.show',
} as const

// Structured-data ContactPoints — lets search + AI answer-engines route by intent.
export const CONTACT_POINTS = [
  { contactType: 'customer support', email: EMAILS.support },
  { contactType: 'sales', email: EMAILS.sales },
  { contactType: 'press', email: EMAILS.press },
  { contactType: 'privacy', email: EMAILS.privacy },
]
