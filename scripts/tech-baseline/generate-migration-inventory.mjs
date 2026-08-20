import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const rollbackDir = path.join(root, 'supabase', 'rollback');
const output = path.join(root, 'src', 'contracts', 'technical-baseline', 'migration-inventory.json');
const selectedMigrationId = '20260820042812';
const names = fs.readdirSync(migrationsDir).filter((name) => /^(?:\d{3}|\d{14})_/.test(name));
const nameSet = new Set(names);
const rollbackNameSet = new Set(fs.existsSync(rollbackDir) ? fs.readdirSync(rollbackDir) : []);
const files = [];

for (const name of names.sort()) {
  const id = name.match(/^\d+/)?.[0] ?? '';
  if (id.length === 3 && Number(id) > 39) continue;
  if (id.length === 14 && id !== selectedMigrationId) continue;
  const direction = name.endsWith('.down.sql') ? 'down' : name.endsWith('.sql') ? 'up' : 'draft';
  const raw = fs.readFileSync(path.join(migrationsDir, name));
  let rollback = 'NOT_APPLICABLE';
  if (direction === 'up') {
    rollback = nameSet.has(name.replace(/\.sql$/, '.down.sql')) || rollbackNameSet.has(name)
      ? 'PRESENT'
      : 'MISSING';
  }
  files.push({
    id,
    file: `supabase/migrations/${name}`,
    direction,
    sha256: crypto.createHash('sha256').update(raw).digest('hex'),
    dependencyEvidence: id === selectedMigrationId ? 'PD-005_ENVIRONMENT_ADMIN_AUTHORITY' : 'UNDECLARED_IN_FILENAME',
    rollback,
    selectedForFirstSlice: id === selectedMigrationId
  });
}

const inventory = {
  schemaVersion: '1.0.0',
  repositoryBase: 'ef98d91992408a612b047c632717e053457b0c8d',
  liveState: 'OPEN_EVIDENCE',
  firstSlice: {
    id: 'PD-005',
    status: 'MIGRATION_SELECTED_UNAPPLIED',
    included: [selectedMigrationId],
    excluded: Array.from({ length: 12 }, (_, index) => String(index + 40).padStart(3, '0'))
  },
  files
};
const serialized = `${JSON.stringify(inventory, null, 2)}\n`;

if (process.argv.includes('--stdout')) {
  process.stdout.write(serialized);
} else if (process.argv.includes('--check')) {
  const current = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';
  if (current !== serialized) {
    console.error('MIGRATION_INVENTORY_DRIFT');
    process.exit(1);
  }
  console.log('MIGRATION_INVENTORY_OK');
} else {
  fs.writeFileSync(output, serialized);
  console.log(path.relative(root, output));
}
