import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const websiteRoot = path.resolve(import.meta.dirname, '..')
const source = await readFile(path.join(websiteRoot, 'lib', 'app-url.ts'), 'utf8')
const productionOrigin = 'https://app.lock.show'

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
const privacyDefects = []

for (const file of files) {
  const html = await readFile(file, 'utf8')
  signupLinks += (html.match(/https:\/\/app\.lock\.show\/signup(?:\?|&amp;)/g) || []).length
  loginLinks += (html.match(/https:\/\/app\.lock\.show\/login(?:\?|&amp;)/g) || []).length
  if (/href=["']\/app\/(?:signup|login)(?:\?|["'])/.test(html)) forbidden.push(file)

  if (!html.includes('LOCK SHOW')) brandDefects.push(`${file}: missing LOCK SHOW`)
  if (!html.includes('Trust on Cue')) brandDefects.push(`${file}: missing Trust on Cue`)
  if (!html.includes('/brand/lockshow-symbol-spotlight-lens-v2-lime.svg')) {
    brandDefects.push(`${file}: missing current brand symbol`)
  }
  if (path.basename(file) === 'index.html' && !html.includes('<title>LOCK SHOW — Trust on Cue</title>')) {
    brandDefects.push(`${file}: homepage title does not use approved tagline`)
  }

  if (/\+?972[\s-]*54[\s-]*455[\s-]*5060|054[\s-]*455[\s-]*5060|wa\.me\/972544555060/.test(html)) {
    privacyDefects.push(`${file}: personal phone number exposed`)
  }
  if (/BOOKING MANAGER ≠ PRODUCER|DISTINCT ROLES, NEVER MERGED/.test(html)) {
    privacyDefects.push(`${file}: internal role-governance copy exposed`)
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
if (!socialCard.includes('Trust on Cue')) brandDefects.push('og-default.svg: missing Trust on Cue')

if (signupLinks === 0 || loginLinks === 0) {
  throw new Error(`Built marketing flow is incomplete: signup=${signupLinks}, login=${loginLinks}`)
}
if (forbidden.length > 0) {
  throw new Error(`Built pages contain legacy same-origin auth links: ${forbidden.join(', ')}`)
}
if (brandDefects.length > 0) {
  throw new Error(`Built pages violate LOCK SHOW identity:\n${brandDefects.join('\n')}`)
}
if (privacyDefects.length > 0) {
  throw new Error(`Built pages expose private/internal content:\n${privacyDefects.join('\n')}`)
}

console.log(`marketing->app flow PASS: signup=${signupLinks}, login=${loginLinks}, brand=${files.length}/${files.length}, origin=${productionOrigin}`)
