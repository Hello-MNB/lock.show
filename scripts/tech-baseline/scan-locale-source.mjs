import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const contractPath = path.join(root, 'src', 'contracts', 'technical-baseline', 'contract.json');
const explicit = process.argv.slice(2);
const files = explicit.length > 0
  ? explicit
  : JSON.parse(fs.readFileSync(contractPath, 'utf8')).locale.scanPaths.map((file) => path.join(root, file));

const patterns = [
  /\b(?:margin|padding)(?:Left|Right)\s*:/,
  /\b(?:left|right)\s*:/,
  /\b(?:margin|padding)-(?:left|right)\s*:/,
  /(?:^|\s)(?:ml|mr|pl|pr|left|right)-[\w.[\]-]+/
];
const findings = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (patterns.some((pattern) => pattern.test(line))) {
      findings.push(`${path.relative(root, file).replaceAll('\\', '/')}:${index + 1}`);
    }
  }
}

if (findings.length > 0) {
  for (const finding of findings) console.error(`PHYSICAL_DIRECTION_PROPERTY ${finding}`);
  process.exit(1);
}
console.log(`LOCALE_SOURCE_OK ${files.length} file(s)`);
