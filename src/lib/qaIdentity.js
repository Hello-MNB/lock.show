const CURRENT_QA_EMAIL = 'qa@lock.show'
const LEGACY_QA_DOMAIN = '@gigproof.test'

export function isQaIdentityEmail(value) {
  if (typeof value !== 'string') return false
  const email = value.trim().toLowerCase()
  return email === CURRENT_QA_EMAIL || email.endsWith(LEGACY_QA_DOMAIN)
}
