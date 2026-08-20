import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const manifest = path.join(root, 'src', 'contracts', 'technical-baseline', 'contract.json');
const currentProductRevision = 'AIroW371UC10YF2gfrHMw9fZIbkXfjVV7D1EbPvVBKlGDSJdQB9THqGF44uwvfivHmylhfW8-iG7dv7lUlchgZlz2_Jkum2neOAh7XLN6PwC';

const contract = JSON.parse(fs.readFileSync(manifest, 'utf8'));
const productSource = contract.sources.find((source) => source.id === 'B4-30.10');
assert.equal(productSource?.revision, currentProductRevision, 'B4-30.10 source pin must match the exact current Product PASS revision');
assert.equal(contract.navigationProjection.sourceRevision, currentProductRevision, 'Navigation projection must use the exact current Product PASS revision');

const scan = spawnSync(process.execPath, [path.join(here, 'scan-contracts.mjs'), manifest], { cwd: root, encoding: 'utf8' });
assert.equal(scan.status, 0, `${scan.stdout}\n${scan.stderr}`);

const generated = spawnSync(process.execPath, [path.join(here, 'generate-types.mjs'), '--check'], { cwd: root, encoding: 'utf8' });
assert.equal(generated.status, 0, `${generated.stdout}\n${generated.stderr}`);
assert.match(fs.readFileSync(path.join(root, 'src', 'generated', 'technical-baseline.d.ts'), 'utf8'), /export type KnownBlockerId =/);

console.log('Repository technical contracts and generated types are in sync.');
