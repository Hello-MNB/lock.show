import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const sql = fs.readFileSync(path.join(root, 'supabase', 'tests', 'tech-baseline', 'rls-negative.sql'), 'utf8');

let command;
let args;
if (process.env.POSTGRES_CONTAINER_ID) {
  command = 'docker';
  args = ['exec', '-i', process.env.POSTGRES_CONTAINER_ID, 'psql', '-U', process.env.PGUSER ?? 'lock_show_test', '-d', process.env.PGDATABASE ?? 'lock_show_test', '--no-psqlrc', '--set', 'ON_ERROR_STOP=1'];
} else if (process.env.DATABASE_URL) {
  command = 'psql';
  args = [process.env.DATABASE_URL, '--no-psqlrc', '--set', 'ON_ERROR_STOP=1'];
} else {
  console.error('POSTGRES_REQUIRED: set DATABASE_URL or POSTGRES_CONTAINER_ID');
  process.exit(1);
}

const result = spawnSync(command, args, { input: sql, encoding: 'utf8', env: process.env });
if (result.error) {
  console.error(`POSTGRES_CLIENT_REQUIRED: ${result.error.code ?? result.error.message}`);
  process.exit(1);
}
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.status !== 0) process.exit(1);
console.log('POSTGRES_NEGATIVES_OK');
