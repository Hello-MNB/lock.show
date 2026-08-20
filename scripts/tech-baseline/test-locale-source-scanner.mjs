import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scanner = path.join(here, 'scan-locale-source.mjs');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lock-show-locale-'));
const valid = path.join(dir, 'valid.jsx');
const invalid = path.join(dir, 'invalid.jsx');
fs.writeFileSync(valid, '<div dir={direction} style={{ marginInlineStart: 8 }}>שלום / Hello <code dir="ltr">ID-123</code></div>');
fs.writeFileSync(invalid, '<div style={{ marginLeft: 8 }}>Hello</div>');

const pass = spawnSync(process.execPath, [scanner, valid], { encoding: 'utf8' });
assert.equal(pass.status, 0, `${pass.stdout}\n${pass.stderr}`);

const fail = spawnSync(process.execPath, [scanner, invalid], { encoding: 'utf8' });
assert.equal(fail.status, 1, `${fail.stdout}\n${fail.stderr}`);
assert.match(`${fail.stdout}\n${fail.stderr}`, /PHYSICAL_DIRECTION_PROPERTY/);

fs.rmSync(dir, { recursive: true, force: true });
console.log('Locale source scanner enforces logical direction without rejecting mixed-script content.');
