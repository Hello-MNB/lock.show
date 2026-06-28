// ============================================================
// i18n PURITY LINT — catches language-mixing that parity can't.
//   1) en.js values must contain ZERO Hebrew chars (brand GIGPROOF is Latin).
//   2) he.js values must not be PURE English (no-Hebrew value outside the
//      brand/tech whitelist = residual-English leak).
//   3) UI components must not hard-code Hebrew literals (everything via i18n).
//      Excluded: i18n files, src/lib/ai (server-side classifier regex), and
//      src/lib/demo.js (bilingual fixture DATA, reported not failed). Lines with
//      an `i18n-allow` marker are skipped.
// Run: node scripts/i18n-purity.mjs   (exit 1 on any violation)
// ============================================================
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const HEBREW = /[֐-׿]/
const HE_ALLOW = new Set(['GIGPROOF', 'RADAR', 'SEC', 'OAuth', 'Stripe', 'slug', 'Phase', 'PWA', 'EN', 'HE', 'EPK', 'DJ', 'CSV', 'PDF', 'XLSX', 'OK'])

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) { if (!/node_modules|dist|\.git/.test(p)) walk(p, out) }
    else if (/\.(jsx?|tsx?)$/.test(f)) out.push(p)
  }
  return out
}
const rel = (p) => p.replace(/^.*[\\/]src[\\/]/, 'src/').replace(/\\/g, '/')
function quoted(line) {
  const i = line.indexOf(':'); if (i < 0) return ''
  const m = line.slice(i + 1).match(/'([^']*)'|"([^"]*)"|`([^`]*)`/)
  return m ? (m[1] || m[2] || m[3] || '') : ''
}

let violations = 0

// 1) en.js — zero Hebrew
readFileSync('src/lib/i18n/en.js', 'utf8').split(/\r?\n/).forEach((l, i) => {
  if (HEBREW.test(l)) { console.log(`EN-HEBREW    en.js:${i + 1}  ${l.trim().slice(0, 90)}`); violations++ }
})

// 2) he.js — no purely-English values (outside whitelist)
readFileSync('src/lib/i18n/he.js', 'utf8').split(/\r?\n/).forEach((l, i) => {
  if (HEBREW.test(l)) return // line has Hebrew → localized entry (any English is an enum value/brand)
  const text = quoted(l); if (!text)
    return
  const words = (text.match(/[A-Za-z]{2,}/g) || []).filter((w) => !HE_ALLOW.has(w))
  if (words.length) { console.log(`HE-ENGLISH   he.js:${i + 1}  "${text.slice(0, 60)}"  [${words.join(',')}]`); violations++ }
})

// 3) components — hard-coded Hebrew literals (strip comments; track block comments)
let demoHits = 0
for (const f of walk('src').filter((f) => !/i18n|[\\/]ai[\\/]/.test(f))) {
  const isDemo = /lib[\\/]demo\.js$/.test(f)
  let inBlock = false
  readFileSync(f, 'utf8').split(/\r?\n/).forEach((l, i) => {
    let code = l
    if (inBlock) { const e = code.indexOf('*/'); if (e >= 0) { code = code.slice(e + 2); inBlock = false } else return }
    code = code.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '').replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '')
    const ob = code.lastIndexOf('/*'); if (ob >= 0 && code.indexOf('*/', ob) < 0) { inBlock = true; code = code.slice(0, ob) }
    if (!HEBREW.test(code) || /i18n-allow/.test(l)) return
    if (isDemo) { demoHits++; return }
    console.log(`HARDCODED-HE ${rel(f)}:${i + 1}  ${l.trim().slice(0, 90)}`); violations++
  })
}

console.log('\n' + (violations === 0 ? '✓ LANGUAGE-PURE (0 violations)' : `✗ ${violations} violation(s)`) + `   · demo.js bilingual-fixture lines (data): ${demoHits}`)
process.exit(violations ? 1 : 0)
