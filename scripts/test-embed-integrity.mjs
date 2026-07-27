// EMBED INTEGRITY GATE (added 21 Jul 2026 after the P0 conflict-marker incident):
// the committed lock.show/app embed must never contain git conflict markers or
// double-bundle heads. A failure here means a merge "resolved" the embed wrong —
// rebuild with `npm run build:embed` from the intended source and recommit.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = 'website-next/public/app';
let violations = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(html|css|js|json|txt|svg)$/.test(name)) continue;
    const body = readFileSync(p, 'utf8');
    if (/^(<{7}|={7}|>{7})/m.test(body)) violations.push(`${p}: git conflict marker`);
    if (p.endsWith('.html')) {
      const bundles = (body.match(/assets\/index-[^"]+\.js/g) || []);
      if (new Set(bundles).size > 1) violations.push(`${p}: ${new Set(bundles).size} different JS bundles referenced`);
    }
  }
}
walk(ROOT);
if (violations.length) {
  console.error(`✗ EMBED-INTEGRITY: ${violations.length} violation(s)`);
  violations.slice(0, 10).forEach(v => console.error('  · ' + v));
  process.exit(1);
}
console.log('✓ EMBED-INTEGRITY: committed embed is conflict-free, single-bundle per route.');
