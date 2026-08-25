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
assert.deepEqual(inventory.firstSlice.included, ['20260820042812', '20260824173241', '20260825005702']);
assert.equal(inventory.liveState, 'OPEN_EVIDENCE');
assert.ok(inventory.files.some((entry) => entry.id === '039' && entry.direction === 'up'));
assert.ok(inventory.files.every((entry) => entry.id.length === 14 || Number(entry.id) <= 39));
assert.ok(inventory.files.every((entry) => /^[0-9a-f]{64}$/.test(entry.sha256)));
assert.equal(inventory.files.find((entry) => entry.id === '020' && entry.direction === 'up')?.rollback, 'PRESENT');
const adminMigration = inventory.files.find((entry) => entry.id === '20260820042812');
assert.equal(adminMigration?.direction, 'up');
assert.equal(adminMigration?.rollback, 'PRESENT');
assert.equal(adminMigration?.selectedForFirstSlice, true);
assert.equal(adminMigration?.dependencyEvidence, 'PD-005_ENVIRONMENT_ADMIN_AUTHORITY');
const explicitGrantMigration = inventory.files.find((entry) => entry.id === '20260824173241');
assert.equal(explicitGrantMigration?.direction, 'up');
assert.equal(explicitGrantMigration?.rollback, 'PRESENT');
assert.equal(explicitGrantMigration?.selectedForFirstSlice, true);
assert.equal(explicitGrantMigration?.dependencyEvidence, 'APP_ADMIN_EXPLICIT_PROVENANCE_GRANT');
const workspaceAuthorityMigration = inventory.files.find((entry) => entry.id === '20260825005702');
assert.equal(workspaceAuthorityMigration?.direction, 'up');
assert.equal(workspaceAuthorityMigration?.rollback, 'PRESENT');
assert.equal(workspaceAuthorityMigration?.selectedForFirstSlice, true);
assert.equal(workspaceAuthorityMigration?.dependencyEvidence, 'APP_SHELL_WORKSPACE_AUTHORITY');
assert.deepEqual(
  inventory.files.filter((entry) => entry.selectedForFirstSlice).map((entry) => entry.id),
  ['20260820042812', '20260824173241', '20260825005702'],
);
const rosterMigration = inventory.files.find((entry) => entry.id === '20260820210117' && entry.direction === 'up');
assert.equal(rosterMigration?.rollback, 'PRESENT');
assert.equal(rosterMigration?.dependencyEvidence, 'ROSTER_INVITATION_CONSENT');
console.log('Migration inventory is checksum-bound, tracks timestamped release migrations, excludes 040-051, and does not infer live state.');
