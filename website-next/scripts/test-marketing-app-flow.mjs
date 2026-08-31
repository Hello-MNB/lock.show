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

// R1-SITE-NO-COLLECTION-22: exact frozen compound units, not a global word ban.
const claimUnits = [
  ['C01', 'app/page.tsx', ['What is a Bookability Passport?', 'public, method-labelled profile showing only verified claims']],
  ['C02', 'app/page.tsx', ['How is evidence verified?', 'Each claim carries a method label']],
  ['C03', 'app/contact/page.tsx', ['Producers happy to confirm the shows they ran']],
  ['C04', 'app/how-it-works/page.tsx', ['The one who ran your show.']],
  ['C05', 'app/how-it-works/page.tsx', ['They confirm in thirty seconds.', 'No account, no password. They see']],
  ['C06', 'app/passport/demo/page.tsx', ['READY TO BUILD YOURS?', 'Build your own Passport. Get verified.']],
  ['C07', 'app/page.tsx', ['One tap confirms a night you ran']],
  ['C08', 'app/page.tsx', ['Get them confirmed', 'A producer who was there taps one link.']],
  ['C09', 'app/artists/page.tsx', ["title: 'Invite.'", 'One WhatsApp message to the producer who ran your night.']],
  ['C10', 'app/artists/page.tsx', ['One-tap links to bring a producer in to confirm a show']],
  ['C11', 'app/how-it-works/page.tsx', ['Sign up and set the stage.', 'Email, name, genre, where you play.']],
  ['C12', 'app/how-it-works/page.tsx', ['Three people, one link, and about thirty seconds']],
  ['C13', 'app/how-it-works/page.tsx', ['Your first night takes', 'two minutes to log.']],
  ['C14', 'app/passport/demo/page.tsx', ['Sample Passport — Verified Live Performance Evidence', 'verified strengths only.']],
  ['C15', 'app/page.tsx', ['We check everything', 'Nothing reaches your Passport until']],
  ['C16', 'app/methodology/page.tsx', ['Methodology — How Evidence Is Verified', 'Every claim in a LOCK SHOW Passport carries a method label']],
  ['C17', 'app/producers/page.tsx', ['For Producers — 20 Seconds, No Account', 'An artist you booked is asking one small favor:', 'Twenty seconds of your word turns']],
  ['C18', 'app/producers/page.tsx', ['Twenty seconds to say so.']],
  ['C19', 'app/producers/page.tsx', ['An artist you booked is asking a small favor between professionals:']],
  ['C20', 'app/producers/page.tsx', ['A link lands in your WhatsApp', 'From an artist you actually booked, about a night you actually ran.']],
  ['C21', 'app/producers/page.tsx', ['const steps =', 'steps.map(', 'TWENTY SECONDS, START TO FINISH', 'We never chase you again.']],
  ['C22', 'app/producers/page.tsx', ['Curious where those twenty seconds end up?', 'you confirmed — nowhere else.']],
]
const noCollectionSources = [...new Set([...claimUnits.map(([, file]) => file),
  'app/radar/page.tsx', 'components/nav.tsx', 'components/footer.tsx'])]
const sourceContents = Object.fromEntries(await Promise.all(noCollectionSources.map(async (file) =>
  [file, await readFile(path.join(websiteRoot, file), 'utf8')])))
function assertClaimUnits(contents, label) {
  const failures = claimUnits.filter(([, file, markers]) => markers.some((marker) => contents[file].includes(marker)))
  if (failures.length) throw new Error(`${label} claim units RETURN ${22 - failures.length}/22: ${failures.map(([id]) => id).join(', ')}`)
  console.log(`${label} exact compound claim units: 22/22 absent`)
}
assertClaimUnits(sourceContents, 'Source')
for (const [file, content] of Object.entries(sourceContents)) {
  if (/\/signup\b|signupHref/.test(content)) throw new Error(`${file}: withdrawn signup definition/control remains`)
}
const navSource = sourceContents['components/nav.tsx']
if ((navSource.match(/href=\{loginHref\}/g) || []).length !== 2 ||
    !navSource.includes('/login?utm_source=site&utm_campaign=${slug}&utm_content=nav') ||
    !navSource.includes('<LocaleToggle />')) throw new Error('Invited Login or locale controls changed')
console.log('Source signup: 0 definitions/controls; invited Login: 2/2 consumers retained')
if (process.argv.includes('--no-collection-source')) process.exit(0)

// WEB-R1-FORM-DISABLE-001: prove source removal and the actual exported surface.
// Restoring the deleted caller/component or a direct browser write must fail.
async function runtimeTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return runtimeTextFiles(absolute)
    return entry.isFile() && /\.(?:[cm]?[jt]sx?|html)$/.test(entry.name) ? [absolute] : []
  }))
  return nested.flat()
}
async function assertPublicFormDisabled() {
  const sourceFiles = (await Promise.all(['app', 'components', 'lib', 'public']
    .map((directory) => runtimeTextFiles(path.join(websiteRoot, directory))))).flat()
  const runtimeSource = (await Promise.all(sourceFiles.map((file) => readFile(file, 'utf8')))).join('\n')
  const contactSource = await readFile(path.join(websiteRoot, 'app/contact/page.tsx'), 'utf8')
  const contactHtml = await readFile(path.join(websiteRoot, 'out/contact.html'), 'utf8')
  const exportedFiles = await runtimeTextFiles(path.join(websiteRoot, 'out'))
  const exported = (await Promise.all(exportedFiles.map((file) => readFile(file, 'utf8')))).join('\n')
  const componentExists = await stat(path.join(websiteRoot, 'components/waitlist-form.tsx'))
    .then(() => true, (error) => { if (error.code === 'ENOENT') return false; throw error })
  const directWrite = /waitlist_signup|\/rest\/v1\//i
  const withdrawnCopy = /JOIN THE WAITLIST|No spam|No third parties|No third-party service touches|Data is not shared with third parties/i
  const checks = [
    ['component deleted', !componentExists],
    ['contact import/render/comments removed', !/WaitlistForm|waitlist-form|waitlist_signup|First-party waitlist|SEND A MESSAGE|No Formspree/.test(contactSource)],
    ['runtime source has no direct public REST write', !directWrite.test(runtimeSource)],
    ['runtime source has no waitlist CTA/privacy promise', !withdrawnCopy.test(runtimeSource)],
    ['rendered contact has no form or PII input', !/<(?:form|input|textarea|select)\b/i.test(contactHtml)],
    ['exported HTML/JS has no public REST write', !directWrite.test(exported)],
    ['exported HTML/JS has no waitlist CTA/privacy promise', !withdrawnCopy.test(exported)],
    ['contact canonical and invited Login retained without signup', contactHtml.includes('rel="canonical" href="https://lock.show/contact"') && contactHtml.includes(`${productionOrigin}/login?utm_source=site&amp;utm_campaign=contact`) && !contactHtml.includes('/signup')],
  ]
  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name)
  if (failures.length) throw new Error(`Public form disable RETURN ${checks.length - failures.length}/${checks.length}:\n${failures.join('\n')}`)
  console.log(`Public form disable: ${checks.length}/${checks.length}, source files=${sourceFiles.length}, exported HTML/JS=${exportedFiles.length}; no provider request executed`)
}
await assertPublicFormDisabled()
if (process.argv.includes('--form-disable')) process.exit(0)

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

const builtContents = {}
for (const file of noCollectionSources.filter((file) => file.startsWith('app/'))) {
  const route = file.replace(/^app\//, '').replace(/\/page\.tsx$/, '').replace(/^page\.tsx$/, 'index')
  const html = await readFile(path.join(websiteRoot, 'out', `${route}.html`), 'utf8')
  // Include metadata and JSON-LD as well as visible prose; normalize markup splits.
  builtContents[file] = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const canonical = route === 'index' ? '/' : `/${route}`
  const canonicalHref = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]
  if (!canonicalHref || new URL(canonicalHref).href !== new URL(canonical, 'https://lock.show').href) throw new Error(`${route}: canonical lost`)
  if (/<(?:form|input|textarea|select)\b/i.test(html)) throw new Error(`${route}: unexpected public collection control`)
  if (/<(?:a|button)\b[^>]*>\s*<\/(?:a|button)>/i.test(html)) throw new Error(`${route}: empty interactive control`)
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1])
}
assertClaimUnits(builtContents, 'Exported prose/metadata/JSON-LD')
const producersHtml = await readFile(path.join(websiteRoot, 'out/producers.html'), 'utf8')
for (const marker of ['You know what happened that night.', 'For Producers | LOCK SHOW', 'href="/passport/demo"']) {
  if (!producersHtml.includes(marker)) throw new Error(`Producers preserved surface missing: ${marker}`)
}
if (signupLinks !== 0 || loginLinks === 0) {
  throw new Error(`Built marketing flow is incomplete: signup=${signupLinks}, login=${loginLinks}`)
}
if (forbidden.length > 0) {
  throw new Error(`Built pages contain legacy same-origin auth links: ${forbidden.join(', ')}`)
}
if (brandDefects.length > 0) {
  throw new Error(`Built pages violate LOCK SHOW identity:\n${brandDefects.join('\n')}`)
}

console.log(`no-collection informational flow PASS: signup=${signupLinks}, invitedLogin=${loginLinks}, brand=${files.length}/${files.length}, origin=${productionOrigin}`)
