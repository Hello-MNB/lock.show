import assert from 'node:assert/strict'
import fs from 'node:fs'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const ui = read('src/components/ui.jsx')
const navItems = read('src/components/layout/navItems.jsx')
const shell = read('src/components/layout/AppShell.jsx')
const capture = read('src/features/evidence/EvidenceCapture.jsx')
const bookingView = read('src/features/passport/PassportBookingView.jsx')
const css = read('src/index.css')

assert.match(ui, /LOCK SHOW/, 'wordmark must use the full LOCK SHOW name')
assert.match(ui, /Trust on Cue/, 'approved tagline must be present in the app identity')
assert.match(navItems, /from 'lucide-react'/, 'navigation must use a maintained icon library')
assert.doesNotMatch(navItems, /<svg/, 'navigation must not ship hand-drawn inline icons')
assert.doesNotMatch(navItems, /key: 'account'/, 'Account is a shell utility, not a primary destination')
assert.match(shell, /shell-utility-bar/, 'authenticated shell must expose one clear utility bar')
assert.match(capture, /Upload|Link2|ScanSearch/, 'RADAR scanner entry paths must use semantic icons')
assert.match(bookingView, /showAllEvidence/, 'PASSPORT evidence history must be progressively disclosed')
assert.match(css, /premium-panel/, 'premium surface hierarchy must be a reusable system primitive')
assert.match(css, /data-cue/, 'data-emphasis micro-interaction must be reusable')

console.log('premium UI contract: PASS')
