// Unit test for the §5.10 humanized-band renderer (pure functions).
// Run: node scripts/test-humanize.mjs
import { humanizeDrawBand, humanizeBinary } from '../src/lib/humanize.js'

const BANDS_CAPACITY = ['Up to 100', '100–300', '300–800', '800+']
const CTX = ['Fills intimate rooms & lounges', 'Regularly fills mid-size clubs', 'Moves large-hall crowds', 'Plays festival-scale stages']

let pass = 0, fail = 0
const ok = (name, cond) => { if (cond) { pass++; console.log('  PASS ', name) } else { fail++; console.log('  FAIL ', name) } }

// index-aligned mapping
ok('Up to 100 → intimate', humanizeDrawBand('Up to 100', BANDS_CAPACITY, CTX) === CTX[0])
ok('100–300 → mid-size clubs', humanizeDrawBand('100–300', BANDS_CAPACITY, CTX) === CTX[1])
ok('300–800 → large-hall', humanizeDrawBand('300–800', BANDS_CAPACITY, CTX) === CTX[2])
ok('800+ → festival', humanizeDrawBand('800+', BANDS_CAPACITY, CTX) === CTX[3])
// unknown band → null (caller shows the band alone; never invents a line)
ok('unknown band → null', humanizeDrawBand('12,345', BANDS_CAPACITY, CTX) === null)
ok('empty band → null', humanizeDrawBand('', BANDS_CAPACITY, CTX) === null)
ok('bad args → null', humanizeDrawBand('800+', null, CTX) === null)
// firewall property: NO numeric grade is ever returned — every output is a known line or null
const outputs = BANDS_CAPACITY.map((b) => humanizeDrawBand(b, BANDS_CAPACITY, CTX))
ok('firewall: outputs are lines from CTX only, never a number', outputs.every((o) => CTX.includes(o)) && !outputs.some((o) => /\d/.test(o)))
// binary: positive-only
ok('binary true → label', humanizeBinary(true, 'Issues formal invoices') === 'Issues formal invoices')
ok('binary false → null (never shown buyer-side)', humanizeBinary(false, 'Issues formal invoices') === null)

console.log(`\n§5.10 humanize: ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
