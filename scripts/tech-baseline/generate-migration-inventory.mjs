import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const rollbackDir = path.join(root, 'supabase', 'rollback');
const output = path.join(root, 'src', 'contracts', 'technical-baseline', 'migration-inventory.json');
const selectedMigrationIds = ['20260820042812', '20260824173241', '20260825005702'];
const timestampEvidence = {
  '20260820042812': 'PD-005_ENVIRONMENT_ADMIN_AUTHORITY',
  '20260824173241': 'APP_ADMIN_EXPLICIT_PROVENANCE_GRANT',
  '20260825005702': 'APP_SHELL_WORKSPACE_AUTHORITY',
  '20260820091500': 'PASSPORT_PUBLIC_PAYLOAD_FIREWALL',
  '20260820210117': 'ROSTER_INVITATION_CONSENT'
};
const names = fs.readdirSync(migrationsDir).filter((name) => /^(?:\d{3}|\d{14})_/.test(name));
const nameSet = new Set(names);
const rollbackNameSet = new Set(fs.existsSync(rollbackDir) ? fs.readdirSync(rollbackDir) : []);
const files = [];

for (const name of names.sort()) {
  const id = name.match(/^\d+/)?.[0] ?? '';
  if (id.length === 3 && Number(id) > 39) continue;
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
    dependencyEvidence: timestampEvidence[id] ?? 'UNDECLARED_IN_FILENAME',
    rollback,
    selectedForFirstSlice: selectedMigrationIds.includes(id)
  });
}

const inventory = {
  schemaVersion: '1.0.0',
  repositoryBase: '4c7a2834aa56f3cd385f3e8819cb40459f7e11c9',
  liveState: 'OPEN_EVIDENCE',
  firstSlice: {
    id: 'PD-005',
    status: 'MIGRATION_SELECTED_UNAPPLIED',
    included: selectedMigrationIds,
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
