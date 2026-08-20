export function safeLandingLocation(pathname, search) {
  const safePath = String(pathname || '/')
    .replace(/^\/(roster-invite|invite|confirm)\/[^/?#]+/, '/$1/:token')
    .slice(0, 200)
  const input = new URLSearchParams(search || '')
  const output = new URLSearchParams()
  for (const key of ['src', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 's']) {
    const value = input.get(key)
    if (value) output.set(key, value.slice(0, 100))
  }
  const query = output.toString()
  return `${safePath}${query ? `?${query}` : ''}`
}
