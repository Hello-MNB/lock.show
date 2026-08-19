// ============================================================
// LOCAL POSTGRES HARNESS — scripts/lib/pgharness.mjs
//
// WHY THIS EXISTS. Every gate in this repo used to assert about the TEXT of a
// migration, because the container had no database. A static assertion cannot
// witness a privilege, an RLS denial, a CHECK constraint or a race: it can only
// witness that somebody wrote a line. This harness gives the gates a REAL
// PostgreSQL 16 to execute against, so the difference between "the file says
// REVOKE" and "anon is actually denied" stops being an act of faith.
//
// WHAT IT DOES
//   1. applies scripts/sql/supabase-shim.sql — the three PostgREST roles for
//      real (anon / authenticated / service_role), Supabase's default
//      privileges, auth.uid() reading request.jwt.claim.sub, a storage stub
//   2. applies EVERY migration in supabase/migrations, each in its own
//      transaction, exactly as the owner applies them
//   3. hands back a handle that can run SQL as postgres, as anon, as
//      authenticated-with-a-given-user-id, or as service_role
//
// MIGRATION 018 IS EXPECTED TO FAIL. It failed on the live database too — its
// policy names public.org_memberships, which does not exist — and migration 019
// is the repair (019's own header records the incident). A local replica that
// silently "fixed" 018 would not be a replica. The harness asserts that 018 is
// the ONLY failure; a second one is a real regression and throws.
//
// SCOPE DISCIPLINE: this harness creates and drops its own databases and
// nothing else. It never touches Supabase, never reads a real key, and the
// migrations it applies are applied to a scratch database that is dropped at
// the end of the run.
//
// STILL NOT PROVEN BY ANYTHING HERE (say it in every report):
//   · PostgREST — schema exposure, ?select= column filtering, role switching
//   · GoTrue — real JWT verification (auth.uid() is a GUC here)
//   · the production data, and whether 041/042 apply cleanly ON TOP OF IT
// ============================================================
import { execFileSync, execFile } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { promisify } from 'node:util'

const execFileP = promisify(execFile)
const MIG_DIR = 'supabase/migrations'
const SHIM = 'scripts/sql/supabase-shim.sql'

/** Migration 018 rolled back on the live DB; 019 is its repair. */
export const EXPECTED_MIGRATION_FAILURES = ['018_professional_reaction.sql']

function su(args, { input, allowFail = false } = {}) {
  try {
    return execFileSync('su', ['postgres', '-c', args], {
      input: input ?? '', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch (e) {
    if (allowFail) return `${e.stdout || ''}${e.stderr || ''}`
    const err = new Error(`psql failed: ${(e.stderr || e.stdout || e.message).trim()}`)
    err.stderrText = String(e.stderr || '')
    err.stdoutText = String(e.stdout || '')
    throw err
  }
}

/** Why there is no server, in terms an operator can act on. */
export function pgUnavailableReason() {
  let installed = true
  try { execFileSync('pg_lsclusters', ['--version'], { stdio: 'ignore' }) } catch { installed = false }
  if (!installed) {
    try { execFileSync('which', ['psql'], { stdio: 'ignore' }) } catch {
      return { kind: 'absent', text: 'PostgreSQL is not installed on this machine.' }
    }
  }
  // ANSWERING BUT UNUSABLE IS ITS OWN STATE — QA-INDEP-10, M4(a). pgAvailable()
  // catches two different failures in one try/catch: the server not answering,
  // and `su postgres psql` being refused. With the cluster ONLINE and the caller
  // not root, the old code reported "PostgreSQL did not answer" — both halves
  // false, and the remedy it offered (start the cluster) was wrong.
  // The port comes from `pg_isready`'s own output — it prints the socket and port
  // it tried, whether or not anything answered. Reading a PGPORT env var here was
  // the obvious move and the integration-contract gate rejected it: an env read
  // that is not in the register is an undeclared interface, which is exactly what
  // that gate exists to catch. Deriving it needs no new contract.
  let ready = true
  let probe = ''
  try { probe = execFileSync('pg_isready', { encoding: 'utf8' }) } catch (e) { ready = false; probe = String(e.stdout || '') }
  if (ready) {
    return { kind: 'unprivileged',
      text: 'The server IS answering, but this process cannot open a session as the postgres role. Run as root, or fix local auth — starting the cluster will not help.' }
  }
  // THE CLUSTER WE ACTUALLY USE, not any cluster — M4(b). The old test was
  // /\bdown\b/ against the WHOLE pg_lsclusters listing, so an unrelated down
  // cluster made this report "down" while the one on our port was fine, and the
  // caller then hardcoded `pg_ctlcluster 16 main start`. The row is parsed and the
  // cluster is identified, so the remedy names the thing that is actually down.
  let rows = []
  try {
    rows = execFileSync('pg_lsclusters', { encoding: 'utf8' }).split('\n')
      .map((l) => l.trim().split(/\s+/))
      .filter((c) => /^\d/.test(c[0] || ''))
      .map(([ver, cluster, port, status]) => ({ ver, cluster, port, status }))
  } catch { /* not debian-packaged */ }
  const probedPort = /:(\d+)\s/.exec(probe)?.[1] ?? '5432'
  const wanted = rows.find((c) => c.port === probedPort) ?? rows[0]
  if (wanted && wanted.status === 'down') {
    return { kind: 'down', cluster: wanted,
      text: `PostgreSQL cluster ${wanted.ver}/${wanted.cluster} on port ${wanted.port} is DOWN. Start it with \`npm run preflight:db -- --start\`.` }
  }
  return { kind: 'unreachable',
    text: 'PostgreSQL did not answer and no cluster on this port reports itself down. Check `pg_isready` and the server log.' }
}

// SAY IT ONCE, AND SAY WHAT TO DO. Eleven chain gates refuse through this
// function, each correctly ("a skip would prove nothing. NOT a pass") — and none
// of them said
// WHY the database was missing. In this remote session the cluster is reaped
// between scheduled runs: twice now the preflight has found it down with a stale
// pid file, a clean log ending on a routine checkpoint, no PANIC, 14 GB free and
// the disk at 37%. An operator meeting twelve simultaneous RED gates would read
// that as a code regression. The diagnosis is printed HERE so every existing
// refusal message gains it without twelve edits, and it is printed once per
// process so a gate that asks twice does not shout twice.
let announced = false
/** Is there a local server we can actually execute against? */
export function pgAvailable() {
  try {
    execFileSync('pg_isready', [], { stdio: 'ignore' })
    su('psql -tAc "select 1"')
    return true
  } catch {
    if (!announced) {
      announced = true
      const why = pgUnavailableReason()
      console.error(`\n  ⚠ no local PostgreSQL — ${why.text}`)
      if (why.kind === 'down') {
        console.error('    This session reaps the cluster between scheduled runs; a DOWN cluster is')
        console.error('    an environment state, not a code regression. Whatever called this still')
        console.error('    fails closed, which is correct: an unrun check is not a pass.')
      }
    }
    return false
  }
}

function migrationFiles() {
  return readdirSync(MIG_DIR)
    .filter((f) => /^\d{3}_.*\.sql$/.test(f) && !f.endsWith('.down.sql'))
    .sort()
}

/** Identity of the schema this harness would build — used to cache a template. */
function schemaFingerprint() {
  const h = createHash('sha256')
  h.update(readFileSync(SHIM))
  for (const f of migrationFiles()) { h.update(f); h.update(readFileSync(`${MIG_DIR}/${f}`)) }
  return h.digest('hex').slice(0, 12)
}

function buildTemplate(name) {
  su(`psql -q -c 'drop database if exists ${name}'`)
  su(`psql -q -c 'create database ${name}'`)
  su(`psql -q -v ON_ERROR_STOP=1 -d ${name} -f ${process.cwd()}/${SHIM}`)
  const failures = []
  for (const f of migrationFiles()) {
    const out = su(
      `psql -q -v ON_ERROR_STOP=1 --single-transaction -d ${name} -f ${process.cwd()}/${MIG_DIR}/${f}`,
      { allowFail: true })
    if (/^psql.*ERROR/m.test(out)) failures.push({ file: f, error: out.match(/^psql.*ERROR.*$/m)[0] })
  }
  const unexpected = failures.filter((x) => !EXPECTED_MIGRATION_FAILURES.includes(x.file))
  if (unexpected.length) {
    // DROP THE HALF-BUILT TEMPLATE BEFORE THROWING. Without this the poisoned,
    // partially-migrated database stays cached, the caller's `if (!exists)`
    // sees it on the next run and skips the rebuild, and every subsequent run
    // dies with `relation "auth.users" does not exist` until someone drops it
    // by hand. Found by independent QA, who hit exactly that and had to clear
    // it manually. A cache that survives its own failed build is a trap.
    su(`psql -q -c 'drop database if exists ${name}'`, { allowFail: true })
    throw new Error(`migration(s) failed to apply locally:\n${unexpected.map((u) => `  ${u.file}: ${u.error}`).join('\n')}`)
  }
  // Record the failure list INSIDE the template so a cached template still tells
  // the truth. Without this, the first run reported "expected historical failure:
  // 018_professional_reaction.sql" and every later run reported "none" — the same
  // database, two different stories. A harness that misreports its own provenance
  // is the last place a misreport should be tolerated.
  su(`psql -q -v ON_ERROR_STOP=1 -d ${name} -c "create table if not exists public._b4_template_meta (file text primary key, error text)"`)
  for (const f of failures) {
    su(`psql -q -v ON_ERROR_STOP=1 -d ${name} -f -`, {
      input: `insert into public._b4_template_meta (file, error) values ($b4$${f.file}$b4$, $b4$${f.error}$b4$) on conflict (file) do nothing;`,
    })
  }
  return failures
}

/** A scratch database with every migration applied. Drop it when finished. */
export class ScratchDb {
  constructor(name, appliedFailures) { this.name = name; this.appliedFailures = appliedFailures }

  static create(prefix = 'b4_appsec') {
    const fp = schemaFingerprint()
    const template = `b4_tmpl_${fp}`
    // Stale templates from an earlier schema are dropped: a cached template
    // that no longer matches the files would test yesterday's migration.
    const stale = su(`psql -tAc "select datname from pg_database where datname like 'b4_tmpl_%' and datname <> '${template}'"`)
      .split('\n').map((s) => s.trim()).filter(Boolean)
    for (const s of stale) su(`psql -q -c 'drop database if exists ${s}'`, { allowFail: true })

    const exists = su(`psql -tAc "select 1 from pg_database where datname = '${template}'"`).trim() === '1'
    let failures = []
    if (!exists) failures = buildTemplate(template)
    const name = `${prefix}_${process.pid}_${Date.now().toString(36)}`
    su(`psql -q -c 'drop database if exists ${name}'`)
    su(`psql -q -c 'create database ${name} template ${template}'`)
    if (exists) {
      // Cached template — read the recorded provenance instead of claiming none.
      failures = su(`psql -tAqF'\t' -d ${name} -c "select file, error from public._b4_template_meta order by 1"`, { allowFail: true })
        .split('\n').map((l) => l.trim()).filter(Boolean)
        .map((l) => { const [file, ...rest] = l.split('\t'); return { file, error: rest.join('\t') } })
    }
    return new ScratchDb(name, failures)
  }

  /** Wrap SQL so it runs as a PostgREST role with a JWT subject in place. */
  static asRole(sql, { role, uid } = {}) {
    const pre = []
    // SET (not select set_config) so the preamble emits no result rows — the
    // caller's assertions read stdout and a stray row is a false positive.
    if (uid) pre.push(`set request.jwt.claim.sub = '${uid}';`)
    if (role) pre.push(`set role ${role};`)
    return `${pre.join('\n')}\n${sql}`
  }

  /** Run SQL. Throws on any error. Returns stdout. */
  exec(sql, opts = {}) {
    return su(`psql -q -v ON_ERROR_STOP=1 -d ${this.name} -f -`, { input: ScratchDb.asRole(sql, opts) })
  }

  /** Run SQL, never throw. Returns { ok, out }. `out` includes the error text. */
  try(sql, opts = {}) {
    let ok = true
    const out = su(`psql -q -v ON_ERROR_STOP=1 -d ${this.name} -f -`,
      { input: ScratchDb.asRole(sql, opts), allowFail: true })
    if (/^psql.*ERROR|^ERROR/m.test(out)) ok = false
    return { ok, out: out.trim() }
  }

  /** One scalar. */
  scalar(sql, opts = {}) {
    return su(`psql -tAq -v ON_ERROR_STOP=1 -d ${this.name} -f -`,
      { input: ScratchDb.asRole(sql, opts) }).trim().split('\n').filter(Boolean).pop() ?? ''
  }

  /** Rows as arrays of column strings (tab separated, no header). */
  rows(sql, opts = {}) {
    const out = su(`psql -tAqF'\t' -v ON_ERROR_STOP=1 -d ${this.name} -f -`,
      { input: ScratchDb.asRole(sql, opts) })
    return out.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split('\t'))
  }

  /**
   * Run N statements on N SEPARATE CONNECTIONS, started together. This is the
   * only way to witness a race: one process cannot serialise itself into one.
   * The SQL is fed through a here-doc because execFile has no stdin option.
   */
  async parallel(statements, opts = {}) {
    return Promise.all(statements.map((sql) =>
      execFileP('su', ['postgres', '-c',
        `psql -tAq -d ${this.name} <<'B4EOF'\n${ScratchDb.asRole(sql, opts)}\nB4EOF`],
      { encoding: 'utf8' }).then(
        (r) => ({ ok: true, out: String(r.stdout).trim() }),
        (e) => ({ ok: false, out: `${e.stdout || ''}${e.stderr || ''}`.trim() }))))
  }

  drop() { su(`psql -q -c 'drop database if exists ${this.name}'`, { allowFail: true }) }
}
