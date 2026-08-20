import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const explicit = process.argv.slice(2);
let files = explicit;
if (files.length === 0) {
  const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' });
  if (listed.status !== 0) {
    console.error('GIT_FILE_INVENTORY_FAILED');
    process.exit(2);
  }
  files = listed.stdout.split('\0').filter(Boolean).map((file) => path.join(root, file));
}

const secretPatterns = [
  /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/,
  /\bsk-ant-[A-Za-z0-9_-]{20,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];
const findings = [];

for (const file of files) {
  if (!fs.existsSync(file) || fs.statSync(file).size > 1_000_000) continue;
  const buffer = fs.readFileSync(file);
  if (buffer.includes(0)) continue;
  const text = buffer.toString('utf8');
  if (secretPatterns.some((pattern) => pattern.test(text))) findings.push(`SECRET_PATTERN ${path.relative(root, file).replaceAll('\\', '/')}`);
}

if (explicit.length === 0) {
  const workflowPath = path.join(root, '.github', 'workflows', 'verify.yml');
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  for (const [index, line] of workflow.split(/\r?\n/).entries()) {
    if (/^\s*uses:/.test(line) && !/@[0-9a-f]{40}(?:\s|#|$)/.test(line)) findings.push(`ACTION_NOT_SHA_PINNED .github/workflows/verify.yml:${index + 1}`);
  }
}

if (findings.length > 0) {
  for (const finding of findings) console.error(finding);
  process.exit(1);
}
console.log(`SECURITY_SCAN_OK ${files.length} file(s)`);
