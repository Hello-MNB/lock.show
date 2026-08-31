import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const websiteRoot = path.resolve(import.meta.dirname, '..')
const source = await readFile(path.join(websiteRoot, 'lib', 'app-url.ts'), 'utf8')
const productionOrigin = 'https://app.lock.show'

// WEB-R1-REMOVE-001: source inventory is a separate check from rendered output.
// Legal, producer, methodology and Passport assertions are outside this packet.
const removalSources = [
  'app/layout.tsx', 'app/page.tsx', 'app/artists/page.tsx',
  'app/bookers/page.tsx', 'app/how-it-works/page.tsx', 'app/faq/page.tsx',
  'app/pricing/page.tsx', 'app/contact/page.tsx', 'components/nav.tsx',
  'components/footer.tsx', 'messages/en.json', 'messages/he.json',
  'public/llms.txt', 'public/og/og-default.svg',
]
const removalFamilies = [
  ['tagline', /Trust on Cue/i],
  ['booking outcome', /that books you|Now fill the calendar|open the rooms you|opens the next room|next room (?:is |is already )waiting|next room easier to enter|to a night you(?:&apos;|')re booked/i],
  ['free and pilot price', /free for|always free|free, always|free during|start free|free to build|free to publish|free while|free access|at no cost|cost nothing|almost nobody pays|price: '0'|תמיד חינמית/i],
  ['availability', /closed beta|closed pilot|early access, Israeli|Israeli artists only|Registration is open|pilot is open|Ready to start without waiting|בטא סגורה/i],
  ['agency future price', /Plans come later|Agency roster plans|Pricing arrives with them|What will agencies and rosters pay/i],
  ['unverified direct contact', /WHATSAPP_URL|WHATSAPP_DISPLAY|EMAILS\.hello/i],
  ['organization and offer facts', /'@type': '(?:Organization|PostalAddress|ContactPoint|Offer)'/],
  ['international framing', /in Israel and internationally|cross-border|cross border/i],
]
function assertRemoval(contents, label) {
  const failures = removalFamilies.flatMap(([family, pattern]) =>
    contents.filter(([, content]) => pattern.test(content)).map(([name]) => `${family}: ${name}`))
  if (failures.length) throw new Error(`${label} removal RETURN:\n${failures.join('\n')}`)
  console.log(`${label} removal: ${removalFamilies.length}/${removalFamilies.length} families absent`)
}
assertRemoval(await Promise.all(removalSources.map(async (name) =>
  [name, await readFile(path.join(websiteRoot, name), 'utf8')])), 'Source')
async function assertRemovedAsset(directory) {
  const result = await stat(path.join(websiteRoot, directory, 'og', 'og-default.png'))
    .then(() => 'present', (error) => { if (error.code === 'ENOENT') return 'absent'; throw error })
  if (result !== 'absent') throw new Error(`${directory}: withdrawn raster social card remains`)
}
await assertRemovedAsset('public')
if (process.argv.includes('--removal-source')) process.exit(0)

if (!source.includes(`|| '${productionOrigin}'`)) {
  throw new Error(`APP_URL must fail closed to ${productionOrigin}`)
}

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return htmlFiles(absolute)
    return entry.isFile() && entry.name.endsWith('.html') ? [absolute] : []
  }))
  return nested.flat()
}

const files = await htmlFiles(path.join(websiteRoot, 'out'))
let signupLinks = 0
let loginLinks = 0
const forbidden = []
const brandDefects = []

for (const file of files) {
  const html = await readFile(file, 'utf8')
  signupLinks += (html.match(/https:\/\/app\.lock\.show\/signup(?:\?|&amp;)/g) || []).length
  loginLinks += (html.match(/https:\/\/app\.lock\.show\/login(?:\?|&amp;)/g) || []).length
  if (/href=["']\/app\/(?:signup|login)(?:\?|["'])/.test(html)) forbidden.push(file)

  if (!html.includes('LOCK SHOW')) brandDefects.push(`${file}: missing LOCK SHOW`)
  if (html.includes('Trust on Cue')) brandDefects.push(`${file}: withdrawn tagline remains`)
  if (html.includes('og-default.png')) brandDefects.push(`${file}: withdrawn raster reference remains`)
  if (!html.includes('/brand/lockshow-symbol-spotlight-lens-v2-lime.svg')) {
    brandDefects.push(`${file}: missing current brand symbol`)
  }
  if (path.basename(file) === 'index.html' && !html.includes('<title>LOCK SHOW</title>')) {
    brandDefects.push(`${file}: homepage title is not the retained brand name`)
  }

  const withoutApprovedName = html.replaceAll('LOCK SHOW', '')
  if (/(^|[^A-Z0-9])LOCK(?![A-Z0-9.])/m.test(withoutApprovedName)) {
    brandDefects.push(`${file}: standalone LOCK remains`)
  }
}

const llms = await readFile(path.join(websiteRoot, 'out', 'llms.txt'), 'utf8')
const socialCard = await readFile(path.join(websiteRoot, 'out', 'og', 'og-default.svg'), 'utf8')
for (const [name, content] of [['llms.txt', llms], ['og-default.svg', socialCard]]) {
  if (!content.includes('LOCK SHOW')) brandDefects.push(`${name}: missing LOCK SHOW`)
  const withoutApprovedName = content.replaceAll('LOCK SHOW', '')
  if (/(^|[^A-Z0-9])LOCK(?![A-Z0-9.])/m.test(withoutApprovedName)) {
    brandDefects.push(`${name}: standalone LOCK remains`)
  }
}
if (socialCard.includes('Trust on Cue')) brandDefects.push('og-default.svg: withdrawn tagline remains')

const removalPages = ['index.html', 'artists.html', 'bookers.html', 'how-it-works.html', 'faq.html', 'pricing.html', 'contact.html']
let schemaCount = 0
const rendered = await Promise.all(removalPages.map(async (name) => {
  const html = await readFile(path.join(websiteRoot, 'out', name), 'utf8')
  if (/href="(?:https:\/\/wa\.me\/972544555060|mailto:hello@lock\.show)"/i.test(html)) {
    throw new Error(`${name}: unverified direct contact action remains`)
  }
  // Drop scripts for visible prose; structured data is checked independently below.
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;|&apos;/g, "'").replace(/\s+/g, ' ')
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    schemaCount++
    const schema = JSON.parse(match[1])
    if (/"@type":"(?:Organization|PostalAddress|ContactPoint|Offer)"/.test(JSON.stringify(schema))) {
      throw new Error(`${name}: unsupported organization/offer structured data remains`)
    }
  }
  return [name, visible]
}))
if (schemaCount < removalPages.length) throw new Error('Missing rendered structured-data witnesses')
await assertRemovedAsset('out')
assertRemoval([...rendered, ['llms.txt', llms], ['og-default.svg', socialCard]], 'Rendered')
if (!(await readFile(path.join(websiteRoot, 'out', 'faq.html'), 'utf8')).includes('Evidence is not a guarantee.')) {
  throw new Error('Existing no-guarantee disclaimer was removed')
}
console.log(`Removal adjacency: contact=${removalPages.length}/${removalPages.length}, parsed schemas=${schemaCount}, raster=absent, no-guarantee=preserved`)

if (signupLinks === 0 || loginLinks === 0) {
  throw new Error(`Built marketing flow is incomplete: signup=${signupLinks}, login=${loginLinks}`)
}
if (forbidden.length > 0) {
  throw new Error(`Built pages contain legacy same-origin auth links: ${forbidden.join(', ')}`)
}
if (brandDefects.length > 0) {
  throw new Error(`Built pages violate LOCK SHOW identity:\n${brandDefects.join('\n')}`)
}

console.log(`marketing->app flow PASS: signup=${signupLinks}, login=${loginLinks}, brand=${files.length}/${files.length}, origin=${productionOrigin}`)
