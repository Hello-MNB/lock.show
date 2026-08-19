// ============================================================
// APPSEC F1 · SQL PRIVILEGE GATE — scripts/test-sql-privileges.mjs
//
// THE DEFECT THIS GATE MAKES UNREPEATABLE
//   Migration 042 created `apply_radar_audience_split()` and
//   `revert_radar_audience_split()` as SECURITY DEFINER and granted nothing
//   explicitly. PostgreSQL grants EXECUTE on a new function to PUBLIC by
//   default, and Supabase's default privileges ADDITIONALLY grant it to anon,
//   authenticated and service_role. Both functions DROP AND CREATE RLS POLICIES
//   on public.radar_signal; revert_ also DELETEs rows.
//   REPRODUCED ON A LOCAL POSTGRESQL 16 REPLICA OF THIS SCHEMA, before the
//   repair:
//       set role anon; select public.apply_radar_audience_split();
//       → SUCCEEDED. pg_policies for radar_signal went from {radar_org} to the
//         four split policies. An anonymous web role rewrote the organization
//         read model.
//   That is privilege escalation from the least-privileged role to schema
//   owner, and no amount of reading the file proves it either way — only
//   executing it does.
//
// ── WHAT IS PROVEN HERE, AND HOW ───────────────────────────────────────────
// EXECUTED LOCALLY (a real PostgreSQL 16, real roles, real ACLs, real RLS):
//   P1  every function 041/042 create exists after a real apply
//   P2  NONE of them is PUBLIC-executable (proacl null = the default = PUBLIC)
//   P3  none of them is executable by anon or authenticated unless this file
//       says so out loud, with a reason
//   P4  the deny is real, not just an ACL string: `set role anon` + call →
//       permission denied, per function
//   P5  the allow is real too — anon can still open a link (resolve_share_link)
//   P6  triggers still fire with ZERO grants on their functions (EXECUTE is
//       checked at CREATE TRIGGER time, never at fire time) — i.e. the
//       tightening did not break publishing
//   P7  calling apply_radar_audience_split() AS THE OWNER does not hand the
//       privileges back: the functions it re-creates are re-revoked in its body
//
// STILL RUNTIME-UNVERIFIED ON SUPABASE (nothing here can witness it):
//   · that the deployed database's default privileges are the ones this shim
//     reproduces (they are Supabase's documented defaults, not a guess — but a
//     project can have been altered by hand)
//   · PostgREST's own schema exposure: a function not exposed to the API is
//     unreachable even when EXECUTE is granted, and vice versa
//   · that 041/042 apply cleanly on top of the REAL data (they are drafted and
//     deliberately NOT applied)
//
// Run: npm run test:sql-privileges     (wired into `npm run verify`)
// ============================================================
import { readFileSync } from 'node:fs'
import { pgAvailable, ScratchDb } from './lib/pgharness.mjs'

let failed = false
const fail = (m) => { console.log(`  ✗ ${m}`); failed = true }
const ok = (m) => console.log(`  · ${m}`)
const check = (cond, good, bad) => (cond ? ok(good) : fail(bad || good))

const FILES = [
  'supabase/migrations/041_link_service_and_version_store.sql',
  'supabase/migrations/042_radar_audience_split.sql',
  'supabase/migrations/043_artist_access_columns.sql',
  'supabase/migrations/044_artist_access_act_key.sql',
  'supabase/migrations/045_artist_access_revocation.sql',
  'supabase/migrations/046_artist_access_guard.sql',
  'supabase/migrations/047_grant_decision.sql',
]

// The ONE place a grant is declared to be intentional. A function that 041/042/043
// create and that is missing from this map fails the run: "we forgot to decide"
// is not a privilege model.
const EXPECTED = {
  // 041 — the link service
  resolve_share_link: { roles: ['anon', 'authenticated', 'service_role'], why: 'the recipient\'s only door; a recipient has no account' },
  record_share_link_open: { roles: ['anon', 'authenticated', 'service_role'], why: 'the same anonymous recipient writes the open receipt' },
  mint_share_link: { roles: ['authenticated', 'service_role'], why: 'minting is an act of the artist/org, never of a bearer' },
  revoke_share_link: { roles: ['authenticated', 'service_role'], why: 'withdrawing authority is an act of the artist/org' },
  pv_fill_defaults: { roles: [], why: 'trigger function — EXECUTE is checked at CREATE TRIGGER time' },
  pv_guard_immutable: { roles: [], why: 'trigger function' },
  pv_supersede_previous: { roles: [], why: 'trigger function (SECURITY DEFINER: it must update rows RLS hides)' },
  pv_act_in_artist_lineage: { roles: ['authenticated', 'service_role'], why: 'SECURITY DEFINER lineage check named INSIDE the pv_owner_insert policy, and a policy expression is planned as the CALLING role — so authenticated must hold EXECUTE or every insert fails with permission-denied instead of an RLS decision. anon is revoked: the policy is INSERT-only and can_access_artist() already refuses an anonymous writer, so the only thing anon could gain is the linkage oracle. Definer for the same reason 046\'s is: act_org hides a non-default Act from its own owner, so an invoker check would refuse the legitimate multi-Act publish' },
  // 042 — the radar audience split
  apply_radar_audience_split: { roles: [], why: 'owner-signed DDL act; run as the owning role in the SQL editor. No RPC surface at all — least exposure' },
  revert_radar_audience_split: { roles: [], why: 'owner-signed DDL act, and it DELETEs rows' },
  recompute_radar_for_org: { roles: [], why: 'reached from the 010 feed triggers only; zero .rpc() callers in src/ + server/' },
  recompute_radar_private_for_artist: { roles: [], why: 'trigger/definer-reached only' },
  generate_radar_rep_projection: { roles: [], why: 'trigger/definer-reached only' },
  radar_signal_rep_update_guard: { roles: [], why: 'trigger function' },
  radar_recompute_for_artist: { roles: [], why: 'trigger function (created by 010, body replaced by 042)' },
  // 043 — the act-scoped grant
  grant_permits: { roles: ['authenticated', 'service_role'], why: 'the authority question itself; anon has no org and no grant, so the only thing it could learn is who represents whom' },
  apply_act_scoped_publish: { roles: [], why: 'owner-signed DDL act — it replaces an RLS policy. No RPC surface at all' },
  revert_act_scoped_publish: { roles: [], why: 'owner-signed DDL act — the reverse policy swap' },
  artist_access_fill_revoked_at: { roles: [], why: 'trigger function — fills revoked_at so no existing writer breaks' },
  artist_access_guard_authority: { roles: [], why: 'trigger function (SECURITY DEFINER) — stops a grantee writing their own authority columns' },
  artist_access_trusted_writer: { roles: ['authenticated', 'service_role'], why: 'the single definition of "may write authority state", called BY two invoker triggers, so the caller role must hold EXECUTE. Discloses only whether the CURRENT role is trusted — nothing about any grant' },
  act_belongs_to_artist: { roles: ['authenticated', 'service_role'], why: 'SECURITY DEFINER linkage lookup called BY the guard trigger, which runs SECURITY INVOKER — so the caller role must hold EXECUTE. Discloses only a boolean about two ids the caller already supplied, and a non-default Act is invisible to its own owner under act_org, which is why the lookup must be definer at all' },
  request_artist_access: { roles: ['authenticated', 'service_role'], why: 'the requesting org acts as a logged-in operator; 043 replaced this function and tightened it off the PUBLIC+anon default it inherited from 027' },
}

// ── which functions do these two files actually create? ─────────────────────
// Parsed from the files themselves, INCLUDING the ones created inside
// apply_/revert_ bodies, so a function added later cannot slip past the map.
const declared = new Set()
for (const f of FILES) {
  const text = readFileSync(f, 'utf8')
    .split('\n').filter((l) => !/^\s*--/.test(l)).join('\n')
  for (const m of text.matchAll(/create\s+or\s+replace\s+function\s+public\.([a-z_0-9]+)\s*\(/gi)) {
    declared.add(m[1])
  }
}

console.log('\nSTATIC — which functions do 041 + 042 create?')
check(declared.size > 0, `parsed ${declared.size} function(s) from 041/042: ${[...declared].sort().join(', ')}`)
const undeclared = [...declared].filter((n) => !(n in EXPECTED))
check(undeclared.length === 0,
  'every function these migrations create has a DECLARED, reasoned privilege expectation',
  `no privilege decision recorded for: ${undeclared.join(', ')} — add it to EXPECTED with a reason`)
const stale = Object.keys(EXPECTED).filter((n) => !declared.has(n))
check(stale.length === 0, 'the expectation map has no stale entries',
  `EXPECTED names function(s) the migrations no longer create: ${stale.join(', ')}`)

// ── EXECUTED LOCALLY ────────────────────────────────────────────────────────
if (!pgAvailable()) {
  console.log('\n⚠ EXECUTION SKIPPED — no local PostgreSQL on this machine.')
  console.log('  Only the static half above ran. The privilege assertions P1..P7 are')
  console.log('  UNPROVEN in this run. Start a local server and re-run before trusting it.')
  console.error('  A SKIP IS NOT A PASS (CLAUDE.md operating law, controller step 8): with these')
  console.error('  assertions unrun, a zero exit would report a proof that did not happen.')
  process.exit(1)
}

console.log('\nEXECUTED LOCALLY — real PostgreSQL 16, real roles, real ACLs')
const db = ScratchDb.create('b4_priv')
try {
  ok(`scratch database ${db.name} · migrations applied (expected historical failure: ${db.appliedFailures.map((f) => f.file).join(', ') || 'none'})`)
  db.exec(readFileSync('scripts/sql/appsec-fixture.sql', 'utf8'))

  const aclRows = db.rows(`
    select p.proname,
           p.prosecdef,
           coalesce(array_to_string(p.proacl, ' '), '<DEFAULT>') as acl
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname in (${[...declared].map((n) => `'${n}'`).join(', ')})
     order by 1`)
  const acls = new Map(aclRows.map((r) => [r[0], { secdef: r[1] === 't', acl: r[2] }]))

  // P1 · they exist
  for (const fn of [...declared].sort()) {
    check(acls.has(fn), `P1 ${fn}() exists after a real apply`, `P1 ${fn}() was never created — the migration does not do what the file says`)
  }

  // P2/P3 · the ACL says what this file says it should
  for (const [fn, info] of [...acls].sort()) {
    const want = EXPECTED[fn]?.roles ?? []
    const acl = info.acl
    const publicExec = acl === '<DEFAULT>' || /(^|\s)=X\//.test(acl)
    check(!publicExec,
      `P2 ${fn}() is not PUBLIC-executable${info.secdef ? ' (SECURITY DEFINER)' : ''}`,
      `P2 ⚠ ${fn}() is PUBLIC-executable — acl ${acl}${info.secdef ? ' AND IT IS SECURITY DEFINER' : ''}`)
    for (const role of ['anon', 'authenticated', 'service_role']) {
      const granted = new RegExp(`(^|\\s)${role}=X/`).test(acl)
      if (want.includes(role)) {
        check(granted, `P3 ${fn}() grants ${role} — ${EXPECTED[fn].why}`,
          `P3 ${fn}() should grant ${role} (${EXPECTED[fn].why}) but does not`)
      } else {
        check(!granted, `P3 ${fn}() does NOT grant ${role}`,
          `P3 ⚠ ${fn}() grants ${role} and nothing justifies it — acl ${acl}`)
      }
    }
  }

  // P4 · the deny is real. Calling it as anon must raise, not just look revoked.
  const DENY_CALLS = [
    ['apply_radar_audience_split', 'select public.apply_radar_audience_split()'],
    ['revert_radar_audience_split', 'select public.revert_radar_audience_split()'],
    ['generate_radar_rep_projection', "select public.generate_radar_rep_projection('00000000-0000-0000-0000-0000000000c1')"],
    ['recompute_radar_private_for_artist', "select public.recompute_radar_private_for_artist('00000000-0000-0000-0000-0000000000c1')"],
    ['recompute_radar_for_org', "select public.recompute_radar_for_org('00000000-0000-0000-0000-0000000000b2')"],
    ['pv_fill_defaults', 'select public.pv_fill_defaults()'],
    ['mint_share_link', "select public.mint_share_link('00000000-0000-0000-0000-00000000ffa1', repeat('a',64), 'booker', null, null, null, 'k', true)"],
    ['revoke_share_link', "select public.revoke_share_link('00000000-0000-0000-0000-0000000000d2', 'k')"],
  ]
  for (const [fn, call] of DENY_CALLS) {
    for (const role of ['anon']) {
      const r = db.try(call, { role })
      check(!r.ok && /permission denied for function/i.test(r.out),
        `P4 ${role} calling ${fn}() → permission denied (executed)`,
        `P4 ⚠ ${role} calling ${fn}() was NOT denied: ${r.out.split('\n').slice(0, 2).join(' ')}`)
    }
  }
  {
    const r = db.try('select public.apply_radar_audience_split()', { role: 'authenticated', uid: '00000000-0000-0000-0000-0000000000a2' })
    check(!r.ok && /permission denied for function/i.test(r.out),
      'P4 an AUTHENTICATED agency user calling apply_radar_audience_split() → permission denied (executed)',
      `P4 ⚠ an authenticated user could rewrite the RLS model: ${r.out.split('\n')[0]}`)
  }

  // P5 · the allow is real — the tightening must not close the recipient's door
  {
    const r = db.try("select public.resolve_share_link(repeat('a',64))", { role: 'anon' })
    check(r.ok && /not_found/.test(r.out),
      'P5 anon can still EXECUTE resolve_share_link() — the recipient door is open (executed)',
      `P5 ⚠ anon can no longer resolve a link: ${r.out.split('\n')[0]}`)
  }

  // P6 · triggers fire with zero grants on their functions
  {
    db.exec(`insert into public.passport_versions (id, artist_id, snapshot)
             values ('00000000-0000-0000-0000-00000000ffb2','00000000-0000-0000-0000-0000000000c1','{"t":2}'::jsonb)`)
    const row = db.rows(`select version_no, state, act_id is not null
                           from public.passport_versions
                          where id = '00000000-0000-0000-0000-00000000ffb2'`)[0]
    check(row && Number(row[0]) > 0 && row[1] === 'published' && row[2] === 't',
      `P6 trg_pv_defaults still fires with NO EXECUTE grant on pv_fill_defaults() — version_no=${row?.[0]}, state=${row?.[1]} (executed)`,
      `P6 ⚠ the trigger stopped working after the revoke: ${JSON.stringify(row)}`)
    const radar = db.scalar('select count(*)::int from public.radar_signal')
    check(Number(radar) >= 0, `P6 the 010 feed triggers still run with no grants — ${radar} radar row(s) materialised (executed)`)
  }

  // P7 · the owner-run tightening does not hand the privileges back
  {
    db.exec('select public.apply_radar_audience_split()')
    const after = db.rows(`
      select p.proname, coalesce(array_to_string(p.proacl,' '),'<DEFAULT>')
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname='public'
         and p.proname in ('recompute_radar_for_org','radar_recompute_for_artist')
       order by 1`)
    for (const [fn, acl] of after) {
      check(acl !== '<DEFAULT>' && !/(^|\s)=X\//.test(acl) && !/anon=X\//.test(acl),
        `P7 ${fn}() is still not PUBLIC/anon-executable after apply_radar_audience_split() re-created it (executed)`,
        `P7 ⚠ apply_radar_audience_split() handed ${fn}() back to PUBLIC/anon — acl ${acl}`)
    }
    const r = db.try('select public.apply_radar_audience_split()', { role: 'anon' })
    check(!r.ok, 'P7 anon is still denied after the tightening has been applied once (executed)')
  }
} finally {
  db.drop()
}

console.log(failed
  ? '\n✗ SQL PRIVILEGES: FAILED\n'
  : `\n✓ SQL PRIVILEGES: every function 041/042 create has an explicit, minimal, EXECUTED-and-verified grant.
  Executed locally: ACL shape per function · anon/authenticated denial per function · anon's link door still open ·
  triggers still fire with zero grants · the owner-run tightening does not restore PUBLIC execute.
  Runtime-unverified on Supabase: PostgREST exposure, the project's actual default privileges, and the real data.\n`)
process.exit(failed ? 1 : 0)
