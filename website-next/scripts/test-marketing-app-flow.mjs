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

for (const file of files) {
  const html = await readFile(file, 'utf8')
  signupLinks += (html.match(/https:\/\/app\.lock\.show\/signup(?:\?|&amp;)/g) || []).length
  loginLinks += (html.match(/https:\/\/app\.lock\.show\/login(?:\?|&amp;)/g) || []).length
  if (/href=["']\/app\/(?:signup|login)(?:\?|["'])/.test(html)) forbidden.push(file)
}

if (signupLinks === 0 || loginLinks === 0) {
  throw new Error(`Built marketing flow is incomplete: signup=${signupLinks}, login=${loginLinks}`)
}
if (forbidden.length > 0) {
  throw new Error(`Built pages contain legacy same-origin auth links: ${forbidden.join(', ')}`)
}

console.log(`marketing->app flow PASS: signup=${signupLinks}, login=${loginLinks}, origin=${productionOrigin}`)
