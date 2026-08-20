import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const runner = path.join(here, 'run-postgres-negatives.mjs');
const env = { ...process.env };
delete env.DATABASE_URL;
delete env.POSTGRES_CONTAINER_ID;

const result = spawnSync(process.execPath, [runner], { env, encoding: 'utf8' });
assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
assert.match(`${result.stdout}\n${result.stderr}`, /POSTGRES_REQUIRED/);
console.log('PostgreSQL negative runner fails closed when no real PostgreSQL target exists.');
