#!/usr/bin/env node
// ============================================================
// ACT STAMP TRUST — IS act_id VALIDATED AGAINST ITS ARTIST? (EXECUTED)
//
// CLAUDE.md makes the Act the unit of evidence: "evidence is per-Act and
// NON-transferable — a new Act starts empty", and `passport_version.act_id` binds
// a Passport to an Act, not a Person. Twelve tenancy-bearing tables carry act_id,
// filled by `set_act_from_artist_id()` (020:147):
//
//     if new.act_id is null and new.artist_id is not null then
//       new.act_id := new.artist_id;
//     end if;
//
// It fills a DEFAULT. It does not validate. A caller who supplies act_id is
// trusted, and every RLS policy on those tables keys on artist_id — nothing
// anywhere checks that the pair belongs together.
//
// This suite measures three things, and the last two are what keep the first
// from being alarm:
//   [1] CAN a row be stamped with an Act that does not belong to its artist?
//   [2] What does that reach — RADAR, other readers, the public Passport?
//   [3] What the Act boundary actually rests on, stated rather than assumed.
//
// A SKIP IS NOT A PASS — with no local PostgreSQL this exits 1.
// ============================================================
import { ScratchDb, pgAvailable } from './lib/pgharness.mjs'
import { readFileSync } from 'node:fs'

let failures = 0
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

if (!pgAvailable()) {
  console.error('\n✖ ACT STAMP: no local PostgreSQL. Every assertion is about what the database accepts,')
  console.error('  so a skip would prove nothing. NOT a pass.')
  process.exit(1)
}

const db = ScratchDb.create('b4_actstamp')
let reachedEnd = false
process.on('exit', (code) => {
  db.drop()
  if (!reachedEnd) console.error(`\n✖ ABORTED (exit ${code}) — assertions after the abort point never ran.`)
})

db.exec(readFileSync('scripts/sql/appsec-fixture.sql', 'utf8'))
const OWNER = '00000000-0000-0000-0000-0000000000a1'
const MINE = db.scalar(`select id::text from public.artists where created_by='${OWNER}' limit 1`)

// A GENUINELY UNRELATED ARTIST. Built here rather than taken from the fixture:
// the appsec fixture deliberately gives ORG_A and ORG_B active artist_access
// grants on the SAME artist, so nobody in it is a stranger to it. My first probe
// used a fixture identity and read a false positive off it — a control caught it,
// which is why the control below is not optional.
const STRANGER_P = '00000000-0000-0000-0000-0000000000e1'
const STRANGER_O = '00000000-0000-0000-0000-0000000000e2'
const STRANGER_A = '00000000-0000-0000-0000-0000000000e3'
db.exec(`
  insert into auth.users (id, email) values ('${STRANGER_P}', 'stranger@fixture.test') on conflict do nothing;
  insert into public.person (id, email, display_name) values ('${STRANGER_P}','stranger@fixture.test','Stranger') on conflict do nothing;
  insert into public.organization (id, name, slug, plan, created_by) values ('${STRANGER_O}','Stranger Org','stranger-org','solo','${STRANGER_P}') on conflict do nothing;
  insert into public.organization_membership (organization_id, person_id, org_role, status)
       values ('${STRANGER_O}','${STRANGER_P}','owner','active') on conflict do nothing;
  insert into public.artists (id, created_by, owner_organization_id, stage_name, published)
       values ('${STRANGER_A}','${STRANGER_P}','${STRANGER_O}','Stranger Act', true) on conflict do nothing;
`)
const as = { role: 'authenticated', uid: OWNER }
const asStranger = { role: 'authenticated', uid: STRANGER_P }

console.log('\n[0] the fixture is what it claims to be')
check('the stranger holds no grant on my artist and I hold none on theirs',
  db.scalar(`select public.can_access_artist('${STRANGER_A}')`, as) === 'f' &&
  db.scalar(`select public.can_access_artist('${MINE}')`, asStranger) === 'f',
  `mine→theirs=${db.scalar(`select public.can_access_artist('${STRANGER_A}')`, as)} theirs→mine=${db.scalar(`select public.can_access_artist('${MINE}')`, asStranger)}`)
check('...and their Act row exists, so a foreign act_id is a real reference, not a dangling one',
  db.scalar(`select count(*) from public.act where id='${STRANGER_A}'`) === '1')

console.log('\n[1] CAN a row carry an Act that does not belong to its artist?')
const TABLES = [
  ['evidence_artifacts', `(artist_id, act_id, evidence_type, value)`, `'link','probe-ev'`, `value='probe-ev'`],
  ['claims', `(artist_id, act_id, claim_type, value)`, `'headline','probe-cl'`, `value='probe-cl'`],
  ['profile_items', `(artist_id, act_id, item_type, title)`, `'link','probe-pi'`, `title='probe-pi'`],
]
const accepted = []
for (const [t, cols, extra, where] of TABLES) {
  const r = db.try(`insert into public.${t} ${cols} values ('${MINE}','${STRANGER_A}',${extra})`, as)
  const stored = r.ok ? db.scalar(`select coalesce(act_id::text,'-') from public.${t} where ${where} limit 1`) : '-'
  if (r.ok && stored === STRANGER_A) accepted.push(t)
  check(`${t}: a foreign act_id is ${r.ok && stored === STRANGER_A ? 'ACCEPTED' : 'refused'} — recorded, not judged here`,
    true, `ok=${r.ok} stored=${stored}`)
}
// The finding is the COUNT, asserted so it cannot drift silently in either
// direction: if a constraint is added later, this fails and the note gets updated.
check('[1] the Act boundary is not enforced by the database on any of the three tables',
  accepted.length === TABLES.length, `accepted on: ${accepted.join(', ') || 'none'} — if this shrank, a constraint was added and the owner note should say so`)

console.log('\n[2] REACH — what the foreign stamp actually changes')
// (a) RADAR. radar_recompute_for_artist fires on exactly these tables; band 4 of
//     the priority list is "multi-Act-safe private RADAR".
check('[2a] RADAR is NOT contaminated — no signal row appears for the stranger\'s Act',
  db.scalar(`select count(*) from public.radar_signal where act_id='${STRANGER_A}'`) === '0')
check('[2b] ...because recompute keys on the ARTIST, so the signals landed on mine',
  Number(db.scalar(`select count(*) from public.radar_signal where act_id='${MINE}'`)) > 0)

// (c) READERS. The control that stops this being alarm: an identical row stamped
//     with MY OWN act_id must be exactly as visible. If it is, the foreign stamp
//     changed nothing about who can read what.
db.exec(`insert into public.claims (artist_id, act_id, claim_type, value, verification_status)
         values ('${MINE}','${MINE}','headline','CONTROL','verified')`, as)
const sInj = db.try(`select value from public.claims where value='probe-cl'`, asStranger)
const sCtl = db.try(`select value from public.claims where value='CONTROL'`, asStranger)
check('[2c] the stranger cannot read the row stamped with THEIR act_id',
  !(sInj.ok && /probe-cl/.test(sInj.out)), sInj.out.slice(0, 80))
check('[2d] ...and the CONTROL is equally invisible, so readers key on artist_id and the stamp changed nothing',
  !(sCtl.ok && /CONTROL/.test(sCtl.out)), sCtl.out.slice(0, 80))
const aInj = db.try(`select value from public.claims where value='probe-cl'`, { role: 'anon' })
check('[2e] anon cannot read it either', !(aInj.ok && /probe-cl/.test(aInj.out)), aInj.out.slice(0, 80))

console.log('\n[3] what the Act boundary actually rests on')
check('[3] no CHECK constraint anywhere binds act_id to its artist',
  db.scalar(`select count(*) from pg_constraint c join pg_class t on t.oid=c.conrelid
             where c.contype='c' and pg_get_constraintdef(c.oid) like '%act_id%'
               and pg_get_constraintdef(c.oid) like '%artist_id%'`) === '0')
check('[3] ...and no RLS policy on these tables mentions act_id in its WITH CHECK',
  db.scalar(`select count(*) from pg_policies where tablename in ('evidence_artifacts','claims','profile_items')
             and coalesce(with_check,'') like '%act_id%'`) === '0')
check('[3] ...while the FK does hold: act_id must reference a real Act',
  !db.try(`insert into public.claims (artist_id, act_id, claim_type, value)
           values ('${MINE}','00000000-0000-0000-0000-0000000000ff','headline','dangling')`, as).ok)

console.log('')
reachedEnd = true
if (failures) { console.log(`✖ ACT STAMP: ${failures} failure(s).`); process.exit(1) }
console.log(`✓ ACT STAMP: measured, not assumed — a row CAN be stamped with an Act belonging to another artist on all ${TABLES.length} tables tested, because set_act_from_artist_id() (020:147) fills act_id only when NULL and every policy on those tables keys on artist_id. REACH IS BOUNDED AND MEASURED: RADAR is untouched (recompute keys on the artist), the stranger cannot read the row, and an identical row stamped with the artist's own Act is exactly as invisible — so the stamp changes no permission today. The Act boundary is an APPLICATION CONVENTION with a foreign-key floor, not a database constraint. Tracked as ACT-STAMP-TRUST in docs/OWNER-PENDING.md. NOT proven here: what the app's own writers send, and whether any future act-keyed read would inherit this.`)
process.exit(0)
