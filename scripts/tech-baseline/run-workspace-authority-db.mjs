import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const root = resolve(import.meta.dirname, '..', '..')
const migrationsDirectory = resolve(root, 'supabase', 'migrations')
const migrations = readdirSync(migrationsDirectory).filter((name) => name.endsWith('_workspace_authority.sql'))

if (migrations.length !== 1) {
  throw new Error(`APP_SHELL_MIGRATION_MISSING:expected=1:observed=${migrations.length}`)
}

const container = process.env.POSTGRES_CONTAINER_ID
if (!container) {
  throw new Error('POSTGRES_CONTAINER_ID_REQUIRED')
}

const postgresVersion = execFileSync('docker', ['exec', container, 'postgres', '--version'], { encoding: 'utf8' }).trim()
if (!postgresVersion.includes('17.6')) {
  throw new Error(`POSTGRES_VERSION_DRIFT:${postgresVersion}`)
}

const psqlArgs = ['exec', '-i', container, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'lock_show_test', '-d', 'lock_show_test']
for (const file of [
  resolve(migrationsDirectory, migrations[0]),
  resolve(root, 'supabase', 'tests', 'tech-baseline', 'workspace-authority.sql'),
]) {
  execFileSync('docker', psqlArgs, { input: readFileSync(file), stdio: ['pipe', 'inherit', 'inherit'] })
}

console.log('APP_SHELL_WORKSPACE_AUTHORITY_DB_OK')
