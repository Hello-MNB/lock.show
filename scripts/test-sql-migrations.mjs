// ============================================================
// SQL MIGRATION GATE — scripts/test-sql-migrations.mjs
//
// WHY THIS FILE EXISTS
//   scripts/test-link-integrity.mjs asserts about the TEXT of migrations 041 /
//   042. Text cannot witness a constraint. The APPSEC review said so plainly:
//   "static string assertions are explicitly insufficient". This gate therefore
//   EXECUTES the migrations against a throwaway PostgreSQL database and asks
//   Postgres itself what happened.
//
// WHAT IT COVERS (this half of F7)
//   V1..V13  passport_versions publication invariants — one published row per
//            (act, audience) even with NULL lineage / NULL audience, and atomic
//            supersession of the previous published row on every publish.
//   R1..R10  rollback boundaries — that 041/042 down files are transactional,
//            idempotent, restore the ORIGINAL 001 / 010 policies verbatim, and
//            that a down file which fails half way through leaves NOTHING
//            behind.
//   (Privileges / cross-org / disclosure / concurrency are a PARALLEL LANE and
//    are deliberately not duplicated here.)
//
// EVERY ASSERTION IS LABELLED
//   [EXECUTED-LOCALLY] Postgres ran it. This is evidence.
//   [STATIC]           a string assertion about a file. This is not evidence
//                      of behaviour, only of text.
//   [SKIPPED]          no local PostgreSQL was reachable. NOT a pass — the
//                      summary says so, loudly.
//
// WHAT THIS GATE STILL CANNOT PROVE (runtime-unverified, say it plainly)
//   · PostgREST's own behaviour (schema exposure, ?select= filters, the role
//     switch a real request performs). The shim reproduces the ROLES, not the
//     server.
//   · GoTrue JWT verification. auth.uid() here reads a set_config value.
//   · Supabase's managed extensions, connection pooler, and real production
//     data volumes/contents.
//
// Run: npm run test:sql-migrations   (wired into `npm run verify`)
// Exit 0 = every executed + static assertion holds; exit 1 = any failure.
// ============================================================
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const MIG = 'supabase/migrations'
const SHIM = 'scripts/sql/supabase-shim.sql'
const UP41 = `${MIG}/041_link_service_and_version_store.sql`
const DOWN41 = `${MIG}/041_link_service_and_version_store.down.sql`
const UP42 = `${MIG}/042_radar_audience_split.sql`
const DOWN42 = `${MIG}/042_radar_audience_split.down.sql`
const SRC001 = `${MIG}/001_initial_schema.sql`
const SRC010 = `${MIG}/010_radar.sql`

// 018 is a KNOWN-BROKEN migration (it references public.org_memberships, which
// never existed) and 019 exists precisely to repair it. The live database went
// through the same partial apply, so reproducing it is faithful, not sloppy.
const EXPECTED_PARTIAL = new Set(['018_professional_reaction.sql'])

let failed = false
let skipped = 0
const fail = (m) => { console.log(`  ✗ ${m}`); failed = true }
const pass = (m) => console.log(`  · ${m}`)
const skip = (m) => { console.log(`  ~ [SKIPPED] ${m}`); skipped++ }
const exec = (cond, m) => (cond ? pass(`[EXECUTED-LOCALLY] ${m}`) : fail(`[EXECUTED-LOCALLY] ${m}`))
const stat = (cond, m) => (cond ? pass(`[STATIC] ${m}`) : fail(`[STATIC] ${m}`))

const read = (p) => { try { return readFileSync(p, 'utf8') } catch { fail(`${p} missing`); return '' } }
const TMP = mkdtempSync(join(tmpdir(), 'sqlgate-'))

// Every scratch database this run creates is namespaced by pid + start time.
// The local PostgreSQL is SHARED — the parallel APPSEC lane's privileges gate
// builds its own databases on it at the same time — and two runs that pick the
// same fixed name will drop each other's database mid-test. Namespacing makes
// the gate safe to run concurrently and safe to run twice.
const RUN = `sqlgate_${process.pid}_${Date.now().toString(36)}`
const DB = {
  base: `${RUN}_base42`, v: `${RUN}_v`, legacy: `${RUN}_legacy`,
  pre41: `${RUN}_pre41`, rt41: `${RUN}_rt41`,
  pre42: `${RUN}_pre42`, rt42: `${RUN}_rt42`,
  inj41src: `${RUN}_inj41src`, inj41: `${RUN}_inj41`,
  inj42src: `${RUN}_inj42src`, inj42: `${RUN}_inj42`,
  never41: `${RUN}_never41`, never42: `${RUN}_never42`,
}

// ── the psql bridge ─────────────────────────────────────────────────────────
// Runs as the postgres superuser. SQL is fed on stdin so the postgres role
// never needs read access to this repo's paths.
function psql(db, sql, { stopOnError = true, quiet = true } = {}) {
  // 2>&1 merges stderr into stdout ON PURPOSE. Without ON_ERROR_STOP psql exits
  // 0 even after an ERROR, so the exit code alone cannot tell a clean run from a
  // failed one — the R9 failure-injection test has to read the message itself.
  const args = ['postgres', '-c',
    `psql ${stopOnError ? '-v ON_ERROR_STOP=1' : ''} ${quiet ? '-q' : ''} -X -d ${db} 2>&1`]
  try {
    const out = execFileSync('su', args, { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    return { ok: !/^ERROR:/m.test(out), out, err: out }
  } catch (e) {
    return { ok: false, out: e.stdout || '', err: (e.stderr || '') + (e.stdout || '') }
  }
}
const q = (db, sql) => {
  const r = psql(db, sql, { quiet: true })
  if (!r.ok) return null
  return r.out.trim()
}
// single scalar, tuples-only. ON_ERROR_STOP is NOT optional here: without it
// psql prints the error and still exits 0, so a broken probe query would return
// '' and every diff built on it would pass vacuously. A query that fails must
// be loud, not empty.
function scalar(db, sql) {
  const args = ['postgres', '-c', `psql -X -q -tA -v ON_ERROR_STOP=1 -d ${db}`]
  try { return execFileSync('su', args, { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim() }
  catch (e) { fail(`probe query failed: ${(e.stderr || '').slice(0, 300)}`); return null }
}
function rows(db, sql) {
  const s = scalar(db, sql)
  if (s === null) return null
  return s === '' ? [] : s.split('\n')
}
const admin = (cmd) => {
  try { execFileSync('su', ['postgres', '-c', cmd], { encoding: 'utf8', stdio: 'pipe' }); return true }
  catch { return false }
}

// ── is there a database at all? ─────────────────────────────────────────────
let DB_OK = false
try {
  execFileSync('pg_isready', { stdio: 'pipe' })
  DB_OK = scalar('postgres', 'select 1') === '1'
} catch { DB_OK = false }

// Drop abandoned scratch databases from THIS gate only. Two filters, both
// necessary: the `sqlgate_` prefix keeps it off the parallel lane's b4_*
// databases, and the liveness check on the embedded pid keeps it off a sibling
// run of this same gate that is still working. Dropping a live sibling's
// database is precisely the failure this whole namespacing exists to prevent.
function dropOurs({ mineOnly = false } = {}) {
  if (!DB_OK) return
  const stale = rows('postgres', `select datname from pg_database where datname like 'sqlgate\\_%'`) || []
  for (const d of stale) {
    if (mineOnly) { if (d.startsWith(`${RUN}_`)) admin(`dropdb --if-exists ${d}`); continue }
    const pid = Number((d.match(/^sqlgate_(\d+)_/) || [])[1])
    if (!pid || pid === process.pid) continue
    if (existsSync(`/proc/${pid}`)) continue      // a live sibling owns it
    admin(`dropdb --if-exists ${d}`)
  }
}
dropOurs()

// ── the catalog snapshot: what "the schema" means for a diff ────────────────
// Everything a migration can move: policies (with their expressions), columns,
// indexes, constraints, triggers, function definitions, and the ACLs on tables
// and functions. Sorted, one fact per line, so a diff is line-exact.
const SNAPSHOT_SQL = `
select line from (
  select 'POLICY   ' || c.relname || '.' || p.polname || ' cmd=' || p.polcmd::text
         || ' using=' || coalesce(pg_get_expr(p.polqual, p.polrelid), '-')
         || ' check=' || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '-') as line
    from pg_policy p join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public'
  union all
  select 'COLUMN   ' || table_name || '.' || column_name || ' ' || data_type
         || ' null=' || is_nullable || ' default=' || coalesce(column_default, '-')
    from information_schema.columns where table_schema = 'public'
  union all
  select 'INDEX    ' || indexname || ' :: ' || indexdef from pg_indexes where schemaname = 'public'
  union all
  select 'CHECK    ' || conrelid::regclass::text || '.' || conname || ' :: ' || pg_get_constraintdef(oid)
    from pg_constraint where connamespace = 'public'::regnamespace
  union all
  select 'TRIGGER  ' || pg_get_triggerdef(oid) from pg_trigger
   where not tgisinternal
     and tgrelid in (select oid from pg_class where relnamespace = 'public'::regnamespace)
  union all
  select 'FUNCTION ' || p.oid::regprocedure::text || ' :: ' || md5(pg_get_functiondef(p.oid))
    from pg_proc p where p.pronamespace = 'public'::regnamespace and p.prokind = 'f'
  union all
  -- ACLs are SORTED before comparison. GRANT appends to the aclitem array, so
  -- revoke-then-regrant produces the same privileges in a different array order.
  -- Comparing the raw order would report a difference where none exists —
  -- and a gate that cries wolf gets switched off.
  select 'TBLACL   ' || c.relname || ' :: ' ||
         coalesce((select string_agg(x, ',' order by x) from unnest(c.relacl::text[]) x), '-')
    from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','v')
  union all
  select 'FNACL    ' || p.oid::regprocedure::text || ' :: ' ||
         coalesce((select string_agg(x, ',' order by x) from unnest(p.proacl::text[]) x), '-')
    from pg_proc p where p.pronamespace = 'public'::regnamespace
) s order by line`

const snapshot = (db) => rows(db, SNAPSHOT_SQL)

function diffLines(a, b) {
  // A null snapshot means a probe query failed. Treat it as a MISMATCH, never
  // as "both sides empty, therefore equal".
  if (!Array.isArray(a) || !Array.isArray(b)) return { onlyBefore: ['<snapshot unavailable>'], onlyAfter: [] }
  const sa = new Set(a), sb = new Set(b)
  return {
    onlyBefore: a.filter((l) => !sb.has(l)),
    onlyAfter: b.filter((l) => !sa.has(l)),
  }
}

// ── building scratch databases ──────────────────────────────────────────────
const migFiles = (upTo) => {
  const all = execFileSync('ls', [MIG], { encoding: 'utf8' }).trim().split('\n')
  return all
    .filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'))
    .sort()
    .filter((f) => parseInt(f.slice(0, 3), 10) <= upTo)
}

function buildDb(name, upTo) {
  admin(`dropdb --if-exists ${name}`)
  if (!admin(`createdb ${name}`)) return `createdb ${name} failed`
  const shim = psql(name, read(SHIM))
  if (!shim.ok) return `shim failed: ${shim.err.slice(0, 300)}`
  for (const f of migFiles(upTo)) {
    const r = psql(name, read(`${MIG}/${f}`))
    if (!r.ok && !EXPECTED_PARTIAL.has(f)) return `${f} failed: ${r.err.slice(0, 400)}`
  }
  return null
}
// CREATE DATABASE ... TEMPLATE refuses while ANY session is still attached to
// the template. Each psql here exits before the next starts, but under load the
// backend can outlive the client by a moment, so the clone is retried after
// evicting any lingering session. Silence on failure is not an option: a failed
// clone turns every later assertion into a confusing "database does not exist".
function cloneDb(from, to) {
  admin(`dropdb --if-exists ${to}`)
  for (let attempt = 1; attempt <= 6; attempt++) {
    if (admin(`createdb -T ${from} ${to}`)) return true
    scalar('postgres',
      `select pg_terminate_backend(pid) from pg_stat_activity where datname = '${from}' and pid <> pg_backend_pid()`)
    execFileSync('sleep', ['0.4'])
  }
  return false
}

// Cloning is an OPTIMISATION, never a dependency. Under concurrency (the
// parallel lane runs `npm run verify`, which now runs this gate, while this
// gate is already running) CREATE DATABASE ... TEMPLATE can keep losing to a
// live session on the template. When it does, build the database from the
// migrations instead — slower, always available, and it keeps a scheduling
// accident from being reported as a migration defect.
function cloneOrBuild(from, to, upTo) {
  if (cloneDb(from, to)) return null
  const err = buildDb(to, upTo)
  if (err) fail(`could not clone ${from} → ${to}, and rebuilding it failed: ${err}`)
  return err
}
const applyFile = (db, path) => psql(db, read(path))

// ── FIXTURE — the smallest real graph the invariant needs ───────────────────
const A = '22222222-2222-2222-2222-222222222222'
const FIXTURE = `
insert into auth.users(id,email) values ('11111111-1111-1111-1111-111111111111','probe@lock.test');
insert into public.person(id,email,display_name) values ('11111111-1111-1111-1111-111111111111','probe@lock.test','Probe');
insert into public.organization(id,name,plan) values ('33333333-3333-3333-3333-333333333333','ProbeOrg','solo');
insert into public.artists(id, created_by, owner_organization_id, name, published)
  values ('${A}','11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333','Probe Act', true);`

// ============================================================
console.log('\n══ SQL MIGRATION GATE ══')
if (!DB_OK) {
  console.log('\n⚠ No local PostgreSQL reachable — every EXECUTED-LOCALLY assertion below is SKIPPED.')
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\nV · PUBLICATION / VERSION INVARIANTS (migration 041, passport_versions)')
// ────────────────────────────────────────────────────────────────────────────
let baseErr = null
if (DB_OK) {
  baseErr = buildDb(DB.base, 42)
  if (baseErr) fail(`could not build the scratch database: ${baseErr}`)
}
const canRun = DB_OK && !baseErr

if (!canRun) {
  for (const id of ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13']) {
    skip(`${id} — needs a live PostgreSQL`)
  }
} else {
  cloneOrBuild(DB.base, DB.v, 42)
  psql(DB.v, FIXTURE)

  // V1 — the SHIPPED writer shape. src/lib/db.js inserts {artist_id, snapshot}
  //      and nothing else. Three publishes must leave ONE published row.
  psql(DB.v, `
    insert into public.passport_versions(artist_id, snapshot) values ('${A}','{"v":1}');
    insert into public.passport_versions(artist_id, snapshot) values ('${A}','{"v":2}');
    insert into public.passport_versions(artist_id, snapshot) values ('${A}','{"v":3}');`)
  const published = scalar(DB.v,
    `select count(*) from public.passport_versions where artist_id='${A}' and state='published'`)
  exec(published === '1',
    `V1 three publishes through the shipped {artist_id, snapshot} writer leave exactly ONE published row (got ${published})`)

  // V2 — the previous published rows are SUPERSEDED, with a receipt timestamp.
  const sup = scalar(DB.v,
    `select count(*) from public.passport_versions where artist_id='${A}' and state='superseded' and superseded_at is not null`)
  exec(sup === '2', `V2 the two prior versions are 'superseded' AND carry superseded_at (got ${sup}/2)`)

  // V3 — the supersession is a chain, not a guess: each row names its parent.
  const chain = scalar(DB.v,
    `select count(*) from public.passport_versions p
      where p.artist_id='${A}' and p.version_no > 1
        and p.supersedes_id = (select p2.id from public.passport_versions p2
                                where p2.artist_id=p.artist_id and p2.version_no = p.version_no - 1)`)
  exec(chain === '2', `V3 supersedes_id points at the immediate predecessor for every later version (got ${chain}/2)`)

  // V4 — THE F5a REGRESSION. The original index was (act_id, audience); audience
  //      is NULL for every shipped write and NULLs are DISTINCT in a Postgres
  //      unique index, so it never collided with itself. Disable the trigger and
  //      confirm the INDEX alone now refuses the second published row.
  psql(DB.v, 'alter table public.passport_versions disable trigger trg_pv_supersede')
  const dupNullAud = psql(DB.v,
    `insert into public.passport_versions(artist_id, snapshot, state) values ('${A}','{"v":9}','published')`)
  exec(!dupNullAud.ok && /idx_pv_one_published/.test(dupNullAud.err),
    'V4 with NULL audience a second published row is REFUSED by idx_pv_one_published (the F5a hole is closed)')

  // V5 — same, for a real audience value.
  psql(DB.v,
    `insert into public.passport_versions(artist_id, snapshot, state, audience) values ('${A}','{"v":10}','published','booker')`)
  const dupAud = psql(DB.v,
    `insert into public.passport_versions(artist_id, snapshot, state, audience) values ('${A}','{"v":11}','published','booker')`)
  exec(!dupAud.ok && /idx_pv_one_published/.test(dupAud.err),
    'V5 a second published row for the same explicit audience is REFUSED')
  psql(DB.v, 'alter table public.passport_versions enable trigger trg_pv_supersede')

  // V6 — but a DIFFERENT audience is a different bucket: one published each.
  psql(DB.v,
    `insert into public.passport_versions(artist_id, snapshot, state, audience) values ('${A}','{"v":12}','published','producer')`)
  const buckets = rows(DB.v,
    `select k || '=' || n from (
       select coalesce(audience,'(none)') as k, count(*) as n
         from public.passport_versions
        where artist_id='${A}' and state='published'
        group by 1) t order by k`)
  exec(JSON.stringify(buckets) === JSON.stringify(['(none)=1', 'booker=1', 'producer=1']),
    `V6 each audience is an INDEPENDENT bucket with exactly one published row (got ${JSON.stringify(buckets)})`)

  // V7 — promotion. A draft raised to published supersedes the incumbent in its
  //      own bucket, in the same statement.
  psql(DB.v, `insert into public.passport_versions(artist_id, snapshot, state) values ('${A}','{"v":13}','draft')`)
  const promo = psql(DB.v, `update public.passport_versions set state='published' where snapshot->>'v'='13'`)
  const afterPromo = scalar(DB.v,
    `select count(*) from public.passport_versions where artist_id='${A}' and state='published' and audience is null`)
  const oldDemoted = scalar(DB.v,
    `select state from public.passport_versions where snapshot->>'v'='3'`)
  exec(promo.ok && afterPromo === '1' && oldDemoted === 'superseded',
    `V7 draft→published supersedes the incumbent in ONE statement (published=${afterPromo}, prior=${oldDemoted})`)

  // V8 — ATOMICITY. Wrap a publish in a transaction that then fails: the prior
  //      published row must still be published, and the new one must not exist.
  const before8 = scalar(DB.v, `select id from public.passport_versions where snapshot->>'v'='13'`)
  psql(DB.v, `
    begin;
    insert into public.passport_versions(artist_id, snapshot) values ('${A}','{"v":14}');
    do $$ begin raise exception 'deliberate abort'; end $$;
    commit;`, { stopOnError: false })
  const after8 = scalar(DB.v,
    `select state from public.passport_versions where id='${before8}'`)
  const ghost8 = scalar(DB.v, `select count(*) from public.passport_versions where snapshot->>'v'='14'`)
  exec(after8 === 'published' && ghost8 === '0',
    `V8 a publish that aborts supersedes NOTHING — prior row stays published (${after8}) and the new row is gone (${ghost8})`)

  // V9 — the index is the COALESCE form, not the NULL-permissive draft.
  const idxdef = scalar(DB.v,
    `select indexdef from pg_indexes where schemaname='public' and indexname='idx_pv_one_published'`)
  exec(!!idxdef && /COALESCE\(act_id, artist_id\)/i.test(idxdef) && /COALESCE\(audience/i.test(idxdef)
       && /WHERE \(state = 'published'/i.test(idxdef),
    `V9 idx_pv_one_published is keyed on COALESCE(act_id,artist_id) + COALESCE(audience,…) — no row escapes through a NULL`)

  // V10 — version_no uniqueness is per LINEAGE, matching what the defaults
  //       trigger computes. The bare (act_id, version_no) draft let a NULL-act
  //       row reuse a number.
  const vnIdx = scalar(DB.v,
    `select indexdef from pg_indexes where schemaname='public' and indexname='idx_pv_act_version_no'`)
  const dupVn = psql(DB.v,
    `insert into public.passport_versions(artist_id, snapshot, state, version_no) values ('${A}','{"v":15}','draft',1)`)
  exec(!!vnIdx && /COALESCE\(act_id, artist_id\)/i.test(vnIdx) && !dupVn.ok && /idx_pv_act_version_no/.test(dupVn.err),
    'V10 version_no is unique per lineage and a reused number is REFUSED')

  // V11 — the deferred-data-migration DETECTION QUERY from the 041 header runs
  //       and returns zero rows on a clean database. A detection query nobody
  //       ever executed is a comment, not a control.
  const detect = rows(DB.v, `
    select lineage::text || '/' || aud || '=' || n from (
      select coalesce(act_id, artist_id) as lineage,
             coalesce(audience, '(none)') as aud,
             count(*) as n
        from public.passport_versions
       where state = 'published'
       group by 1, 2
      having count(*) > 1) t`)
  exec(Array.isArray(detect) && detect.length === 0,
    `V11 the header's D-C1 detection query executes and reports no outstanding violation (rows=${detect ? detect.length : 'ERR'})`)

  // V12 — THE DETECTION QUERIES THEMSELVES. A detection query that has never
  //       been executed is a comment. Pull D-C1 and D-C2 out of the 041 header
  //       verbatim (un-commenting only the leading `-- `) and run them.
  {
    const hdr = read(UP41)
    const seg = hdr.slice(hdr.indexOf('--   D-C1'), hdr.indexOf('--   D-IDX'))
    const sqlText = seg.split('\n').map((l) => l.replace(/^--\s?/, '')).join('\n')
    const stmts = sqlText.split(';').filter((b) => /select/i.test(b))
      .map((b) => b.slice(b.toLowerCase().indexOf('select')))
    const ranAll = stmts.length >= 2 && stmts.every((st) => rows(DB.v, st) !== null)
    exec(ranAll, `V12 the header's D-C1 and D-C2 detection queries are VALID SQL and execute as written (${stmts.length} statements)`)
  }

  // V13 — NO FORCED CUTOVER (F5c). Manufacture the exact legacy state the
  //       original inert index allowed — two published rows in one bucket —
  //       then re-apply 041. It must APPLY (exit 0) with a WARNING rather than
  //       refuse, must NOT create the index, and trg_pv_supersede must still
  //       govern the next write.
  {
    cloneOrBuild(DB.base, DB.legacy, 42)
    psql(DB.legacy, FIXTURE)
    psql(DB.legacy, `
      drop index public.idx_pv_one_published;
      alter table public.passport_versions disable trigger trg_pv_supersede;
      insert into public.passport_versions(artist_id, snapshot, state) values ('${A}','{"v":1}','published');
      insert into public.passport_versions(artist_id, snapshot, state) values ('${A}','{"v":2}','published');
      alter table public.passport_versions enable trigger trg_pv_supersede;`)
    const dirty = scalar(DB.legacy, `select count(*) from public.passport_versions where state='published'`)
    const reapply = applyFile(DB.legacy, UP41)
    const warned = /041 F5a: idx_pv_one_published NOT created/.test(reapply.out)
    const idxThere = scalar(DB.legacy, `select count(*) from pg_indexes where indexname='idx_pv_one_published'`)
    psql(DB.legacy, `insert into public.passport_versions(artist_id, snapshot) values ('${A}','{"v":3}')`)
    const govern = scalar(DB.legacy, `select count(*) from public.passport_versions where state='published'`)
    exec(dirty === '2' && reapply.ok && warned && idxThere === '0' && govern === '1',
      `V13 legacy violations do NOT force a cutover — 041 still applies, WARNS, skips the index (present=${idxThere}), and the trigger still reduces the bucket to one published row on the next write (dirty=${dirty} → ${govern})`)
    admin('dropdb --if-exists lock_legacy')
  }
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\nR · ROLLBACK BOUNDARIES (041 / 042 down files)')
// ────────────────────────────────────────────────────────────────────────────
if (!canRun) {
  for (const id of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9']) skip(`${id} — needs a live PostgreSQL`)
} else {
  // ── 041 round trip ───────────────────────────────────────────────────────
  const e40 = buildDb(DB.pre41, 40)
  if (e40) fail(`R: could not build the pre-041 database: ${e40}`)
  const pre41 = snapshot(DB.pre41)

  cloneOrBuild(DB.pre41, DB.rt41, 40)
  const up41 = applyFile(DB.rt41, UP41)
  exec(up41.ok, `R1 migration 041 applies cleanly on a real PostgreSQL 16${up41.ok ? '' : ` — ${up41.err.slice(0, 300)}`}`)
  const post41 = snapshot(DB.rt41)

  const dn41 = applyFile(DB.rt41, DOWN41)
  const back41 = snapshot(DB.rt41)
  const d41 = diffLines(pre41, back41)
  exec(dn41.ok && d41.onlyBefore.length === 0 && d41.onlyAfter.length === 0,
    `R2 041 down returns the catalog EXACTLY to its pre-041 state (lost=${d41.onlyBefore.length}, leftover=${d41.onlyAfter.length})`)
  if (d41.onlyBefore.length || d41.onlyAfter.length) {
    d41.onlyBefore.slice(0, 6).forEach((l) => console.log(`      – lost:     ${l.slice(0, 150)}`))
    d41.onlyAfter.slice(0, 6).forEach((l) => console.log(`      + leftover: ${l.slice(0, 150)}`))
  }

  // R3 — pv_public_read must come back VERBATIM as 001 wrote it.
  const pol001 = scalar(DB.pre41,
    `select pg_get_expr(polqual, polrelid) from pg_policy p join pg_class c on c.oid=p.polrelid
      where c.relname='passport_versions' and p.polname='pv_public_read'`)
  const polBack = scalar(DB.rt41,
    `select pg_get_expr(polqual, polrelid) from pg_policy p join pg_class c on c.oid=p.polrelid
      where c.relname='passport_versions' and p.polname='pv_public_read'`)
  exec(!!pol001 && pol001 === polBack,
    `R3 041 down restores pv_public_read verbatim from 001 (001: "${pol001}" / after down: "${polBack}")`)

  // R4 — idempotence: running the down file a SECOND time changes nothing and
  //      does not error.
  const dn41b = applyFile(DB.rt41, DOWN41)
  const twice41 = snapshot(DB.rt41)
  exec(dn41b.ok && JSON.stringify(twice41) === JSON.stringify(back41),
    `R4 041 down is idempotent — a second run succeeds and moves nothing${dn41b.ok ? '' : ` — ${dn41b.err.slice(0, 200)}`}`)

  // ── 042 round trip ───────────────────────────────────────────────────────
  const e41 = buildDb(DB.pre42, 41)
  if (e41) fail(`R: could not build the pre-042 database: ${e41}`)
  const pre42 = snapshot(DB.pre42)

  cloneOrBuild(DB.pre42, DB.rt42, 41)
  const up42 = applyFile(DB.rt42, UP42)
  exec(up42.ok, `R5 migration 042 applies cleanly${up42.ok ? '' : ` — ${up42.err.slice(0, 300)}`}`)
  const post42 = snapshot(DB.rt42)

  const dn42 = applyFile(DB.rt42, DOWN42)
  const back42 = snapshot(DB.rt42)
  const d42 = diffLines(pre42, back42)
  exec(dn42.ok && d42.onlyBefore.length === 0 && d42.onlyAfter.length === 0,
    `R6 042 down returns the catalog EXACTLY to its pre-042 state (lost=${d42.onlyBefore.length}, leftover=${d42.onlyAfter.length})`)
  if (d42.onlyBefore.length || d42.onlyAfter.length) {
    d42.onlyBefore.slice(0, 6).forEach((l) => console.log(`      – lost:     ${l.slice(0, 150)}`))
    d42.onlyAfter.slice(0, 6).forEach((l) => console.log(`      + leftover: ${l.slice(0, 150)}`))
  }

  // R7 — radar_org verbatim from 010, AND the two 010 functions byte-identical.
  const radar010 = scalar(DB.pre42,
    `select pg_get_expr(polqual,polrelid)||' | '||coalesce(pg_get_expr(polwithcheck,polrelid),'-')
       from pg_policy p join pg_class c on c.oid=p.polrelid
      where c.relname='radar_signal' and p.polname='radar_org'`)
  const radarBack = scalar(DB.rt42,
    `select pg_get_expr(polqual,polrelid)||' | '||coalesce(pg_get_expr(polwithcheck,polrelid),'-')
       from pg_policy p join pg_class c on c.oid=p.polrelid
      where c.relname='radar_signal' and p.polname='radar_org'`)
  const fn010 = scalar(DB.pre42,
    `select md5(string_agg(pg_get_functiondef(oid), '|' order by oid::regprocedure::text))
       from pg_proc where proname in ('recompute_radar_for_org','radar_recompute_for_artist')
        and pronamespace='public'::regnamespace`)
  const fnBack = scalar(DB.rt42,
    `select md5(string_agg(pg_get_functiondef(oid), '|' order by oid::regprocedure::text))
       from pg_proc where proname in ('recompute_radar_for_org','radar_recompute_for_artist')
        and pronamespace='public'::regnamespace`)
  exec(!!radar010 && radar010 === radarBack && !!fn010 && fn010 === fnBack,
    `R7 042 down restores radar_org AND both 010 RADAR functions verbatim (policy match=${radar010 === radarBack}, function bodies match=${fn010 === fnBack})`)

  // R8 — idempotence of 042 down.
  const dn42b = applyFile(DB.rt42, DOWN42)
  const twice42 = snapshot(DB.rt42)
  exec(dn42b.ok && JSON.stringify(twice42) === JSON.stringify(back42),
    `R8 042 down is idempotent — a second run succeeds and moves nothing${dn42b.ok ? '' : ` — ${dn42b.err.slice(0, 200)}`}`)

  // R9 — THE FAIL-SAFE PROOF. Inject a deliberate error into the MIDDLE of each
  //      down file and assert the schema is untouched afterwards. A down file
  //      that is not wrapped in a transaction fails this: the statements before
  //      the injected error would have committed one by one.
  const injectAndProve = (label, srcPath, postState, cloneFrom, dbName) => {
    const src = read(srcPath)
    // Land the abort AFTER the first destructive statement inside the file, so
    // the test is "did the first half commit", not "did the file refuse to
    // start". The marker is placed just before the final COMMIT of the body.
    const lines = src.split('\n')
    const lastCommit = lines.map((l, i) => (/^\s*commit;\s*$/i.test(l) ? i : -1)).filter((i) => i >= 0).pop()
    if (lastCommit === undefined) return fail(`R9 ${label}: no COMMIT found to inject before — the file is not transactional`)
    lines.splice(lastCommit, 0, `do $$ begin raise exception 'DELIBERATE MID-FILE FAILURE (R9 ${label})'; end $$;`)
    const path = join(TMP, `broken-${label}.sql`)
    writeFileSync(path, lines.join('\n'))

    if (!cloneDb(cloneFrom, dbName)) {
      const err = buildDb(dbName, label.startsWith('041') ? 40 : 41)
      if (err) return fail(`R9 ${label}: could not prepare the scratch database: ${err}`)
      applyFile(dbName, label.startsWith('041') ? UP41 : UP42)
    }
    const r = psql(dbName, readFileSync(path, 'utf8'), { stopOnError: false })
    const after = snapshot(dbName)
    const d = diffLines(postState, after)
    exec(/DELIBERATE MID-FILE FAILURE/.test(r.err) && d.onlyBefore.length === 0 && d.onlyAfter.length === 0,
      `R9 ${label}: a down file that fails mid-way leaves NO partial changes (lost=${d.onlyBefore.length}, leftover=${d.onlyAfter.length})`)
    if (d.onlyBefore.length || d.onlyAfter.length) {
      d.onlyBefore.slice(0, 6).forEach((l) => console.log(`      – lost:     ${l.slice(0, 150)}`))
      d.onlyAfter.slice(0, 6).forEach((l) => console.log(`      + leftover: ${l.slice(0, 150)}`))
    }
  }
  // Rebuild the "migration applied" states to inject against.
  cloneOrBuild(DB.pre41, DB.inj41src, 40); applyFile(DB.inj41src, UP41)
  injectAndProve('041-down', DOWN41, snapshot(DB.inj41src), DB.inj41src, DB.inj41)
  cloneOrBuild(DB.pre42, DB.inj42src, 41); applyFile(DB.inj42src, UP42)
  injectAndProve('042-down', DOWN42, snapshot(DB.inj42src), DB.inj42src, DB.inj42)

  // R10 — a down file run where the migration was NEVER applied is a NOTICE and
  //       a no-op, not an error. (Half-reverted databases and re-runs both land
  //       here.)
  cloneOrBuild(DB.pre41, DB.never41, 40)
  const never41 = applyFile(DB.never41, DOWN41)
  cloneOrBuild(DB.pre41, DB.never42, 40)   // 042 was never applied here either
  const never42 = applyFile(DB.never42, DOWN42)
  exec(never41.ok && never42.ok,
    `R10 both down files run harmlessly against a database that never had the migration (041=${never41.ok}, 042=${never42.ok})`)

  void post41; void post42
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\nS · TEXT ASSERTIONS (these are NOT evidence of behaviour)')
// ────────────────────────────────────────────────────────────────────────────
{
  const up41 = read(UP41), dn41 = read(DOWN41), dn42 = read(DOWN42)
  const src001 = read(SRC001), src010 = read(SRC010)
  const strip = (s) => s.replace(/--.*$/gm, ' ').replace(/\s+/g, ' ').trim().toLowerCase()

  stat(/^\s*begin;\s*$/m.test(dn41) && /^\s*commit;\s*$/m.test(dn41),
    'S1 041 down carries explicit BEGIN/COMMIT')
  stat(/^\s*begin;\s*$/m.test(dn42) && /^\s*commit;\s*$/m.test(dn42),
    'S2 042 down carries explicit BEGIN/COMMIT')

  // The verbatim-restore texts, compared against their ORIGINAL source files.
  const pv001 = strip(src001).match(/create policy pv_public_read on public\.passport_versions for select using \([^)]*\)\)?;/)
  stat(!!pv001 && strip(dn41).includes(pv001[0].replace(/;$/, '')),
    'S3 the pv_public_read text in 041 down is character-identical to 001')
  const ro010 = strip(src010).match(/create policy radar_org on public\.radar_signal for all using \(.*?\) with check \(.*?\);/)
  stat(!!ro010 && strip(dn42).includes(ro010[0].replace(/;$/, '')),
    'S4 the radar_org text in 042 down is character-identical to 010')

  stat(/drop trigger\s+if exists trg_pv_supersede/.test(dn41)
       && /drop function if exists public\.pv_supersede_previous\(\)/.test(dn41),
    'S5 041 down removes the supersession trigger AND its function')
  stat(/coalesce\(act_id, artist_id\)/.test(up41) && /coalesce\(audience, '\(none\)'\)/.test(up41),
    'S6 041 keys the publication invariant on COALESCE, so a NULL cannot escape it')
  stat(/DEFERRED DATA MIGRATION/.test(up41) && /D-C1/.test(up41) && /D-C2/.test(up41) && /D-IDX/.test(up41),
    'S7 041 documents the deferred data migration with named detection queries')
  stat(/exception when unique_violation then/.test(up41),
    'S8 the publication index is created inside a guard — legacy data cannot make the migration refuse to apply')
  stat(!/^\s*(delete|drop|alter)\b/im.test(dn42.split(/^\s*begin;\s*$/m)[0] || ''),
    'S9 nothing in 042 down mutates the schema before the transaction opens')
}

// ────────────────────────────────────────────────────────────────────────────
const banner = failed ? '\n✗ SQL MIGRATION GATE: FAILED\n' : '\n✓ SQL MIGRATION GATE: all assertions hold.'
console.log(banner)
if (!failed) {
  console.log(`  EXECUTED-LOCALLY: publication invariants + supersession + both rollback round trips,
  both idempotence runs, both mid-file-failure injections — all executed against a
  throwaway PostgreSQL 16 built from scripts/sql/supabase-shim.sql + migrations 001..042.
  STATIC: transaction framing and verbatim-restore text.
  ${skipped ? `⚠ ${skipped} EXECUTED-LOCALLY assertions were SKIPPED — no PostgreSQL was reachable.
  A skip is NOT a pass. Re-run where a database exists before trusting this gate.` : 'Nothing was skipped.'}
  RUNTIME-UNVERIFIED: PostgREST request handling, GoTrue JWTs, production data.\n`)
}
dropOurs({ mineOnly: true })
dropOurs()
process.exit(failed ? 1 : 0)
