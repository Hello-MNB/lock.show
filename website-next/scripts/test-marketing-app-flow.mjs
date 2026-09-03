import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'out')

const canonicalRoutes = [
  ['', 'index.html'],
  ['how-it-works', 'how-it-works.html'],
  ['artists', 'artists.html'],
  ['professionals', 'professionals.html'],
  ['trust', 'trust.html'],
  ['faq', 'faq.html'],
  ['early-access', 'early-access.html'],
  ['sample', 'sample.html'],
]

const legacyRoutes = ['bookers', 'producers', 'methodology', 'radar', 'pricing', 'contact', 'passport/demo']
const safeSourceFiles = [
  'app/layout.tsx',
  'components/marketing-page.tsx',
  'components/nav.tsx',
  'components/footer.tsx',
  'components/waitlist-form.tsx',
  'lib/marketing-copy.ts',
  'public/llms.txt',
  'public/og/og-default.svg',
]

const source = Object.fromEntries(await Promise.all(safeSourceFiles.map(async (file) => [
  file,
  await readFile(path.join(root, file), 'utf8'),
])))

const forbiddenClaims = [
  ['withdrawn tagline', /Trust on Cue/i],
  ['withdrawn Passport name', /Bookability Passport/i],
  ['unsupported price', /always free|free for artists|free during|start free/i],
  ['unsupported speed', /under two minutes|in two minutes|thirty seconds|twenty seconds/i],
  ['unsupported outcome', /fills? rooms|opens? the next room|books you/i],
  ['universal verification', /every claim is (?:checked|verified)|verified strengths only/i],
]

const claimFailures = []
for (const [file, content] of Object.entries(source)) {
  for (const [name, pattern] of forbiddenClaims) {
    if (pattern.test(content)) claimFailures.push(`${name}: ${file}`)
  }
}
if (claimFailures.length) throw new Error(`Evidence-safety RETURN:\n${claimFailures.join('\n')}`)

const visualSource = [
  await readFile(path.join(root, 'app/globals.css'), 'utf8'),
  await readFile(path.join(root, 'styles/design-system.css'), 'utf8'),
  source['components/marketing-page.tsx'],
  source['components/nav.tsx'],
].join('\n')
const visualRuntime = visualSource.replace(/\/\*[\s\S]*?\*\//g, '')
if (/linear-gradient|radial-gradient|violet|purple|#8b5cf6/i.test(visualRuntime)) {
  throw new Error('Visual canon RETURN: gradient or violet token found')
}
for (const token of ['#0a0b0f', '#f4f3ef', '#c8f04d']) {
  if (!visualSource.toLowerCase().includes(token)) throw new Error(`Visual canon RETURN: missing ${token}`)
}

const bilingual = source['lib/marketing-copy.ts']
for (const marker of ['Make your professional world easier to understand.', 'להפוך את העולם המקצועי שלכם לברור יותר.', 'RADAR', 'PASSPORT']) {
  if (!bilingual.includes(marker)) throw new Error(`Locale RETURN: missing ${marker}`)
}

const form = source['components/waitlist-form.tsx']
for (const marker of ['waitlist_signup', 'SUPABASE_PUBLISHABLE_KEY', 'name="email"', 'name="role"', 'name="consent"', 'early_access_submit_success']) {
  if (!form.includes(marker)) throw new Error(`Early-access form RETURN: missing ${marker}`)
}
if (/service_role|secret_key/i.test(form)) throw new Error('Early-access form RETURN: privileged key reference found')

const vercel = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'))
for (const route of legacyRoutes) {
  if (!vercel.redirects.some((item) => item.source === `/${route}`)) throw new Error(`Redirect RETURN: /${route}`)
}

for (const [route, file] of canonicalRoutes) {
  const html = await readFile(path.join(out, file), 'utf8')
  const expected = route ? `https://lock.show/${route}` : 'https://lock.show/'
  const href = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1]
  if (!href || new URL(href).href !== new URL(expected).href) throw new Error(`Canonical RETURN: ${file} -> ${href || 'missing'}`)
  if (/<(?:a|button)\b[^>]*>\s*<\/(?:a|button)>/i.test(html)) throw new Error(`Accessibility RETURN: empty control in ${file}`)
  if (/Trust on Cue|Bookability Passport|always free|free for artists|under two minutes|fills? rooms|books you/i.test(html)) {
    throw new Error(`Rendered claim RETURN: ${file}`)
  }
}

const earlyHtml = await readFile(path.join(out, 'early-access.html'), 'utf8')
for (const control of ['type="email"', '<select', 'type="checkbox"']) {
  if (!earlyHtml.includes(control)) throw new Error(`Rendered form RETURN: missing ${control}`)
}

const indexHtml = await readFile(path.join(out, 'index.html'), 'utf8')
if (!indexHtml.includes('<html lang="en" dir="ltr"')) throw new Error('Document language baseline RETURN')
if (!indexHtml.includes('href="/early-access#request"')) throw new Error('Primary CTA destination RETURN')
if (indexHtml.includes('"@type":"SoftwareApplication"') || indexHtml.includes('"@type":"Organization"') || indexHtml.includes('"@type":"Offer"')) {
  throw new Error('Structured data RETURN: unsupported entity found')
}

for (const file of ['robots.txt', 'sitemap.xml', 'og/og-default.svg', 'llms.txt']) {
  await stat(path.join(out, file))
}

console.log(`website v1 flow PASS: routes=${canonicalRoutes.length}, redirects=${legacyRoutes.length}, form=consent+receipt, locales=EN/HE, claims=bounded`)
