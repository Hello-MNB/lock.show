import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const generator = path.join(here, 'generate-migration-inventory.mjs');
const result = spawnSync(process.execPath, [generator, '--stdout'], { cwd: root, encoding: 'utf8' });
assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
const inventory = JSON.parse(result.stdout);

assert.equal(inventory.firstSlice.status, 'MIGRATION_SELECTED_UNAPPLIED');
assert.deepEqual(inventory.firstSlice.included, ['20260820042812']);
assert.equal(inventory.liveState, 'OPEN_EVIDENCE');
assert.ok(inventory.files.some((entry) => entry.id === '039' && entry.direction === 'up'));
assert.ok(inventory.files.every((entry) => entry.id === '20260820042812' || Number(entry.id) <= 39));
assert.ok(inventory.files.every((entry) => /^[0-9a-f]{64}$/.test(entry.sha256)));
assert.equal(inventory.files.find((entry) => entry.id === '020' && entry.direction === 'up')?.rollback, 'PRESENT');
const adminMigration = inventory.files.find((entry) => entry.id === '20260820042812');
assert.equal(adminMigration?.direction, 'up');
assert.equal(adminMigration?.rollback, 'PRESENT');
assert.equal(adminMigration?.selectedForFirstSlice, true);
console.log('Migration inventory is checksum-bound, selects the unapplied Admin migration, excludes 040-051, and does not infer live state.');
