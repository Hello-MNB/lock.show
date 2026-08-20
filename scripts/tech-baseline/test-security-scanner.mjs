import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scanner = path.join(here, 'scan-security.mjs');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lock-show-security-'));
const valid = path.join(dir, 'valid.env.example');
const invalid = path.join(dir, 'invalid.txt');
fs.writeFileSync(valid, 'SUPABASE_SERVICE_ROLE_KEY=replace-me\n');
fs.writeFileSync(invalid, `token=${'gh' + 'p_' + '1'.repeat(36)}\n`);

const pass = spawnSync(process.execPath, [scanner, valid], { encoding: 'utf8' });
assert.equal(pass.status, 0, `${pass.stdout}\n${pass.stderr}`);
const fail = spawnSync(process.execPath, [scanner, invalid], { encoding: 'utf8' });
assert.equal(fail.status, 1, `${fail.stdout}\n${fail.stderr}`);
assert.match(`${fail.stdout}\n${fail.stderr}`, /SECRET_PATTERN/);

fs.rmSync(dir, { recursive: true, force: true });
console.log('Security scanner rejects credential-shaped values and accepts placeholders.');
