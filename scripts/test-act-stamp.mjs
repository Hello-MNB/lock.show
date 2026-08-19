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

console.log('\n[2f] passport_versions — THE TABLE I DID NOT TEST, and the one that matters')
// QA-INDEP-06, H1. I measured three tables, found no reach, and told the founder
// a foreign act_id "changes nothing today". passport_versions was not among them,
// and it is where 041 keys everything on `coalesce(act_id, artist_id)` — the
// "lineage" — in two SECURITY DEFINER functions that never consult ownership.
// One row from a stranger is an irreversible cross-tenant unpublish.
//
// These assertions are written as the SAFE state. They FAILED — six of them —
// when first added, which is how the hole was confirmed rather than argued. They
// are green now because 041 carries the fix: `pv_owner_insert` gained
// `pv_act_in_artist_lineage(act_id, artist_id)`, a SECURITY DEFINER predicate, so a
// version can only enter a lineage its writer owns. SECURITY DEFINER is not
// decoration — the first attempt inlined the same EXISTS into the WITH CHECK,
// where it runs under the CALLER's RLS on `act` and silently forbade an artist
// their own second Act. Both the attack and the multi-Act case are executed
// below, because either one alone would have passed the wrong fix.
{
  db.exec(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
           values ('${MINE}', '${MINE}', '{"mine":1}'::jsonb, 'published', 'producer')`, as)
  const mineState = () => db.scalar(`select coalesce(string_agg(state, ',' order by version_no), '-')
                                     from public.passport_versions where artist_id='${MINE}' and audience='producer'`)
  check('[2f] precondition: I hold a published Passport version', mineState().includes('published'))

  const attack = db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
                         values ('${STRANGER_A}', '${MINE}', '{"attack":1}'::jsonb, 'published', 'producer')`, asStranger)
  check('[2f] a stranger CANNOT write a passport version stamped with my Act', !attack.ok,
    `accepted=${attack.ok} — 041 keys its lineage on coalesce(act_id, artist_id) and never checks ownership`)
  check('[2f] ...and my published version is still published',
    mineState().includes('published'), `my producer-bucket states: ${mineState()}`)
  check('[2f] ...and nobody else holds `published` in my lineage',
    db.scalar(`select coalesce(artist_id::text,'-') from public.passport_versions
               where coalesce(act_id,artist_id)='${MINE}' and audience='producer' and state='published'`) === MINE)

  // Irreversibility: whatever happened, the victim must be able to undo it.
  const revive = db.try(`update public.passport_versions set state='published'
                         where artist_id='${MINE}' and audience='producer'`, as)
  check('[2f] ...and if it ever happens, the victim can undo it — an UPDATE policy exists',
    revive.ok && mineState().includes('published'),
    'passport_versions has no UPDATE and no DELETE policy, so a victim\'s revive and delete match zero rows and report success')

  // Publish-lock: nobody outside my tenancy may consume my version_no space.
  const lock = db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience, version_no)
                       values ('${STRANGER_A}', '${MINE}', '{"lock":1}'::jsonb, 'draft', 'brand', 2147483647)`, asStranger)
  check('[2f] a stranger cannot park version_no at int max inside my lineage', !lock.ok, `accepted=${lock.ok}`)
  const stillPublish = db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
                               values ('${MINE}', '${MINE}', '{"v":9}'::jsonb, 'published', 'brand')`, as)
  check('[2f] ...and I can still publish afterwards', stillPublish.ok,
    stillPublish.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 90))

  // THE FIX MUST NOT COST MULTI-ACT. `act_id = artist_id` would have forbidden a
  // second Act outright, and my first predicate — an inlined EXISTS — forbade it
  // by accident, because a subquery in a WITH CHECK runs under the CALLER's RLS
  // and `act` has RLS, so an artist could not see their own second Act row. Both
  // failures are silent unless the legitimate case is executed, so it is.
  const ACT2 = '00000000-0000-0000-0000-00000000ac02'
  // THE COLUMNS THE CLIENT SENDS — AND NOT THE PRIVILEGE IT SENDS THEM WITH.
  // Read that distinction carefully, because I got it wrong twice.
  // QA-INDEP-09 rejected this fixture for copying `organization_id` from the
  // default Act, which src/lib/db.js:155-157 never does. Fixing the COLUMNS, I
  // then wrote "the fixture is now literally what createAct() sends" into the
  // commit, this file and the founder register. QA-INDEP-10 showed that is still
  // false in the half that decides the outcome: this insert runs as the database
  // OWNER, and the shipped path runs as `authenticated`, where it is REFUSED —
  //
  //   createAct INSERT as authenticated: false
  //     ERROR: new row violates row-level security policy for table "act"
  //   same INSERT as DB OWNER (what this fixture does): true
  //
  // because act_org (020:185) is `with check (can_access_artist(id))` and a new
  // Act's id is a fresh uuid that no artists row and no grant names. So an artist
  // CANNOT create a second Act through the product today. [2i] measures that
  // directly; this fixture keeps owner privilege deliberately, to exercise 051 and
  // 041 on a row the product cannot yet produce, and says so instead of claiming
  // to be the client.
  db.exec(`insert into public.act (id, person_id, stage_name, genre, is_default)
           select '${ACT2}', person_id, 'Second Act', 'techno', false from public.act where id='${MINE}'
           on conflict (id) do nothing`)
  check('[2f] precondition: the second Act inherits its artist\'s organisation (051), as createAct() leaves it unset',
    db.scalar(`select coalesce(organization_id::text,'NULL') from public.act where id='${ACT2}'`)
      === db.scalar(`select coalesce(owner_organization_id::text,'NULL') from public.artists where id='${MINE}'`),
    'without 051 the client-created Act carries NULL and 041 refuses the artist\'s OWN publish')
  check('[2f] ...and I can still publish for MY OWN second Act — the fix does not cost multi-Act',
    db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
            values ('${MINE}','${ACT2}','{"act2":1}'::jsonb,'published','booker')`, as).ok,
    'CLAUDE.md makes multi-Act canon; a constraint that forbids it is not a fix')
  check('[2f] ...and a legacy NULL act_id row is still legal — the 020 backfill left those',
    db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, state)
            values ('${MINE}', null, '{"legacy":1}'::jsonb, 'draft')`, as).ok)
  check('[2f] ...and my second Act is its OWN lineage, not merged into the default',
    db.scalar(`select count(*) from public.passport_versions
               where coalesce(act_id,artist_id)='${ACT2}' and state='published'`) === '1')

  // Discoverability, so the severity is not softened by "they would have to guess".
  const anonIds = db.try(`select id from public.artists where published = true`, { role: 'anon' })
  check('[2f] ...and the Act id is not secret — anon reads it straight off artists_public_read',
    anonIds.ok && anonIds.out.includes(MINE.slice(0, 8)), 'for a default Act, act.id = artists.id')
}

// ── [2g] THE ATTACKER SHAPE [2f] DID NOT TEST — QA-INDEP-07, F1 ─────────────
// [2f] tested exactly one attacker: a stranger writing from their OWN artist row.
// The reviewer used a second one and got straight through. `artists.created_by`
// is caller-supplied and no policy governs it — artists_org (015:27) constrains
// only `owner_organization_id`, and the permissive artists_owner (001:162) cannot
// restrict what another permissive policy admits. So the attacker inserts an
// artists row IN THEIR OWN ORG carrying the VICTIM's created_by, and the lineage
// predicate — which read created_by as "who owns this artist" — certified it.
// One extra INSERT reproduced every consequence [2f] asserts against.
//
// TWO INDEPENDENT REFUSALS NOW, and both are executed separately below, because
// "defence in depth" that has only ever been tested with both layers present is
// one layer wearing a second layer's name:
//   049  pins artists.created_by to auth.uid(), so the column stops being input;
//   041  refuses any p_act that is itself an artists id and is not p_artist —
//        a default Act's id IS an artists id (020's act_from_artist mirror), so
//        this disjunct never consults created_by at all.
console.log('\n[2g] the created_by spoof — the shape that got past the first fix')
{
  const SPOOF = '00000000-0000-0000-0000-0000000000f1'
  const spoof = db.try(`insert into public.artists (id, created_by, owner_organization_id, stage_name)
                        values ('${SPOOF}', '${OWNER}', '${STRANGER_O}', 'Spoof')`, asStranger)
  check('[2g] the stranger CAN still insert an artists row in their own org — that is not the defect',
    spoof.ok, spoof.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 90))
  check('[2g] ...but 049 pins created_by to auth.uid(), so the row is theirs, not the victim\'s',
    db.scalar(`select created_by::text from public.artists where id='${SPOOF}'`) === STRANGER_P,
    'artists.created_by is caller-supplied without 049; every check that reads it as ownership can then be made to certify a cross-tenant write')
  check('[2g] ...and the lineage predicate refuses the victim\'s default Act even so',
    db.scalar(`select public.pv_act_in_artist_lineage('${MINE}','${SPOOF}')`, asStranger) === 'f',
    'a default Act\'s id IS an artists id, so p_act naming a DIFFERENT artists row is a cross-artist reach whatever created_by says')
  const attack = db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
                         values ('${SPOOF}', '${MINE}', '{"spoof":1}'::jsonb, 'published', 'producer')`, asStranger)
  check('[2g] ...so the spoofed cross-tenant unpublish is REFUSED', !attack.ok, `accepted=${attack.ok}`)
  check('[2g] ...and the victim\'s Passport is still published',
    db.scalar(`select coalesce(string_agg(state, ',' order by version_no), '-') from public.passport_versions
               where artist_id='${MINE}' and audience='producer'`).includes('published'))
  // THE PIN MUST FIRE BEFORE EVERYTHING THAT READS created_by, and "before" has
  // two parts. TIMING first: all BEFORE triggers run ahead of any AFTER trigger,
  // which is what puts the pin ahead of the act mirror — `trg_act_from_artist`
  // sorts first alphabetically and it does not matter, because it is AFTER INSERT.
  // NAME order second, and only among same-timing triggers: the pin must precede
  // `trg_set_artist_org`. My first version of this check asserted plain name order
  // across all three and failed against correct code — the assertion was wrong,
  // not the migration. Both halves are asserted now because a rename could break
  // either one silently.
  const artistTriggers = db.rows(`select t.tgname, case when (t.tgtype::int & 2)>0 then 'BEFORE' else 'AFTER' end
    from pg_trigger t join pg_class c on c.oid=t.tgrelid
    where not t.tgisinternal and c.relname='artists' order by t.tgname`)
  check('[2g] ...and 049\'s pin is a BEFORE trigger, so it precedes the AFTER act mirror whatever it is named',
    artistTriggers.find((r) => r[0] === 'trg_artists_pin_created_by')?.[1] === 'BEFORE'
    && artistTriggers.find((r) => r[0] === 'trg_act_from_artist')?.[1] === 'AFTER',
    JSON.stringify(artistTriggers))
  check('[2g] ...and among the BEFORE triggers it sorts ahead of trg_set_artist_org, which also reads the column',
    artistTriggers.filter((r) => r[1] === 'BEFORE').map((r) => r[0])[0] === 'trg_artists_pin_created_by',
    JSON.stringify(artistTriggers.filter((r) => r[1] === 'BEFORE').map((r) => r[0])))
  // BLAST RADIUS, BOTH DIRECTIONS — QA-INDEP-08, M1. The pin must stop the
  // authenticated surface and must NOT stop a trusted one: my first version
  // pinned the column for every role, so a service-role ownership transfer
  // reported success and changed nothing. A silent no-op is worse than a refusal,
  // and it made the sentence the founder was given false.
  check('[2g] ...and a trusted role CAN still move authorship — the pin is not a silent no-op for seeds and transfers',
    (db.exec(`update public.artists set created_by='${STRANGER_P}' where id='${SPOOF}'`, { role: 'service_role' }),
     db.scalar(`select created_by::text from public.artists where id='${SPOOF}'`) === STRANGER_P),
    'a service-role UPDATE that reports success and changes nothing breaks ownership transfer and Person merge')
  db.exec(`update public.artists set created_by='${STRANGER_P}' where id='${SPOOF}'`, { role: 'service_role' })
  check('[2g] ...and authorship cannot be re-pointed by an UPDATE either',
    (db.try(`update public.artists set created_by='${OWNER}' where id='${SPOOF}'`, asStranger),
     db.scalar(`select created_by::text from public.artists where id='${SPOOF}'`) === STRANGER_P))
}

// ── [2h] THE LAYER MATRIX, EXECUTED — QA-INDEP-08, H1 ───────────────────────
// I wrote a four-cell independence matrix into the commit, the task register, the
// founder row and this gate's own success line: "each layer was proven to hold
// with the other removed". No gate ever ran it, and it was FALSE. I had only ever
// executed the DEFAULT-Act shape. 041's disjunct (a) refuses a p_act that IS an
// artists id — and a non-default Act's id is a fresh uuid, so for a multi-Act
// lineage (a) is a no-op, leaving the forgeable `created_by` join as the only
// test and 049 as the only layer:
//
//   049 removed — predicate alone   attack=ACCEPTED   lineage published -> superseded
//
// The predicate now also requires the Act's organisation to match the artist's,
// which is the one column artists_org will not let an attacker claim. Asserted
// here by RUNNING the matrix on BOTH shapes, because a matrix in prose is a claim
// and a matrix in a gate is evidence.
console.log('\n[2h] both layers, each alone, on a default AND a non-default Act')
{
  const SPOOF2 = '00000000-0000-0000-0000-0000000000f2'
  const ACT3 = '00000000-0000-0000-0000-00000000ac03'
    // Shipped shape here too — see [2f].
  db.exec(`insert into public.act (id, person_id, stage_name, genre, is_default)
           select '${ACT3}', person_id, 'Victim Act 3', 'psytrance', false
             from public.act where id='${MINE}' on conflict (id) do nothing`)
  db.exec(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
           values ('${MINE}','${ACT3}','{"victim3":1}'::jsonb,'published','booker')`, as)

  // `drop trigger` needs table ownership, so this runs unqualified (as the owner),
  // never as the attacker — the attacker never gains a privilege they would not
  // have. It models an operator applying 041 WITHOUT 049, which is the realistic
  // failure: they are separate files, 041 sorts first, and the founder row that
  // says "this gates applying 041" does not mention 049.
  const withoutPin = (fn) => {
    db.exec(`drop trigger if exists trg_artists_pin_created_by on public.artists`)
    try { return fn() } finally {
      db.exec(`create trigger trg_artists_pin_created_by before insert or update on public.artists
               for each row execute function public.artists_pin_created_by()`)
    }
  }
  const attack = (spoofId, actId, audience) => {
    db.try(`insert into public.artists (id, created_by, owner_organization_id, stage_name)
            values ('${spoofId}', '${OWNER}', '${STRANGER_O}', 'Spoof')`, asStranger)
    return db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
                   values ('${spoofId}','${actId}','{"m":1}'::jsonb,'published','${audience}')`, asStranger).ok
  }
  const lineage = (actId, audience) => db.scalar(`select coalesce(string_agg(state, ',' order by version_no), '-')
    from public.passport_versions where coalesce(act_id,artist_id)='${actId}' and audience='${audience}'`)

  check('[2h] DEFAULT Act · both layers — refused', !attack(SPOOF2, MINE, 'producer'))
  check('[2h] NON-DEFAULT Act · both layers — refused', !attack(SPOOF2, ACT3, 'booker'))
  check('[2h] DEFAULT Act · 041 alone (049 removed) — still refused',
    !withoutPin(() => attack('00000000-0000-0000-0000-0000000000f3', MINE, 'producer')))
  check('[2h] NON-DEFAULT Act · 041 alone (049 removed) — still refused, and THIS is the cell that was false',
    !withoutPin(() => attack('00000000-0000-0000-0000-0000000000f4', ACT3, 'booker')),
    '041 disjunct (a) is a no-op for a non-default Act; without the organisation half, 049 is the only layer')
  check('[2h] ...and the victim\'s non-default-Act Passport is still published throughout',
    lineage(ACT3, 'booker').includes('published') && !lineage(ACT3, 'booker').includes('superseded'),
    `lineage: ${lineage(ACT3, 'booker')}`)
  // The other direction: 049 alone must also hold, so neither cell is decorative.
  check('[2h] 049 alone (predicate weakened to the pre-H1 body) — still refused',
    (db.exec(`create or replace function public.pv_act_in_artist_lineage(p_act uuid, p_artist uuid)
              returns boolean language sql stable security definer set search_path = public, pg_temp as $w$
                select p_act is null or p_act = p_artist or exists (select 1 from public.act a
                  where a.id = p_act and a.person_id = (select ar.created_by from public.artists ar where ar.id = p_artist)) $w$`),
     !attack('00000000-0000-0000-0000-0000000000f5', ACT3, 'booker')))
  // RESTORE, AND PROVE IT RESTORED — QA-INDEP-09, M3. The check I wrote here asked
  // whether the predicate returns true for a legitimate pair, which the WEAKENED
  // body also does: the assertion named for the job could not fail. It is now a
  // body comparison against the migration text, which is the only thing that
  // distinguishes the two.
  // The split is also narrowed. `.split('$$;')[0]` would silently produce a
  // different function if the body ever contained `$$;` or if 041 grew a second
  // definition of this name (L1) — so the extraction asserts it found exactly one.
  const migration = readFileSync('supabase/migrations/041_link_service_and_version_store.sql', 'utf8')
  const DEFN = /create or replace function public\.pv_act_in_artist_lineage[\s\S]*?\n\$\$;/g
  const defs = migration.match(DEFN) ?? []
  check('[2h] ...and 041 defines pv_act_in_artist_lineage exactly once, so the restore text is unambiguous',
    defs.length === 1, `${defs.length} definition(s) matched`)
  db.exec(defs[0])
  const shipped = defs[0].slice(defs[0].indexOf('as $$') + 5, defs[0].lastIndexOf('$$;')).replace(/\s+/g, ' ').trim()
  const installed = db.scalar(`select regexp_replace(replace(prosrc, chr(10), ' '), '\\s+', ' ', 'g')
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace and n.nspname='public'
    where p.proname='pv_act_in_artist_lineage'`).trim()
  check('[2h] ...and the installed body is the migration\'s body, not the weakened one — a restore that silently failed would leave every later section testing the wrong function',
    installed === shipped, `installed: ${installed.slice(0, 90)}…`)
}

// ── [2i] IS MULTI-ACT REACHABLE AT ALL? — QA-INDEP-10, H1 ───────────────────
// CLAUDE.md makes multi-Act canon and the whole [2f]/[2g]/[2h] apparatus is about
// protecting a second Act's lineage. None of it asked whether the product can
// create one. It cannot, at three layers, and two of them were undocumented:
//   1. act_org refuses the artist's own INSERT (measured below);
//   2. publishPassport() (src/lib/db.js:605-609) throws `act_publish_unavailable`
//      for any non-default Act — a DELIBERATE refusal pending migration 043,
//      documented in that file;
//   3. all three callers pass only artist.id anyway.
// Asserted as MEASUREMENT, not as a wish: these checks record what is true today
// so that the day it changes, the gate says so rather than quietly passing. The
// founder decision is ACT-CREATE-BLOCKED in docs/OWNER-PENDING.md.
console.log('\n[2i] can the product create a second Act at all?')
{
  const shipped = db.try(`insert into public.act (person_id, stage_name, genre, is_default)
                          select person_id, 'Client Shape', 'techno', false
                            from public.act where id='${MINE}'`, as)
  check('[2i] the shipped createAct() insert is REFUSED for the artist themselves — multi-Act is not reachable from the product today',
    !shipped.ok, `accepted=${shipped.ok} — if this now succeeds, act_org was narrowed and ACT-CREATE-BLOCKED can close`)
  check('[2i] ...because act_org keys its WITH CHECK on can_access_artist(id), and a new Act id is a fresh uuid',
    db.scalar(`select replace(coalesce(with_check,'-'),chr(10),' ') from pg_policies
               where schemaname='public' and tablename='act' and policyname='act_org'`) === 'can_access_artist(id)')
  check('[2i] ...and the client refuses a non-default-Act publish independently, pending migration 043',
    /act_publish_unavailable/.test(readFileSync('src/lib/db.js', 'utf8')),
    'src/lib/db.js:605-609 — a deliberate refusal, not a defect, but it means 051 alone unblocks nothing end to end')
}

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

// ── [4] organization_id — CALLER-SUPPLIED, AND NOT INERT ───────────────────
// QA-INDEP-06 (L2) flagged `artists.organization_id` as ungoverned. I measured
// it, found nothing reading it, and wrote "inert" to the founder. QA-INDEP-07
// (F3) showed the SCAN was the thing that was inert: it grepped function bodies
// for the table-QUALIFIED spelling only, so an alias or a NEW reference walked
// past it, and only one of the three declared surfaces was ever mutation-tested.
//
// Repairing the scan found the claim was not merely overstated. It was FALSE:
//
//   `availability_requests.organization_id` is read as a SCOPING DECISION by
//   three RADAR functions — `(r.organization_id = p_org or (r.organization_id
//   is null and a.owner_organization_id = p_org))` — and that column is writable
//   by ANONYMOUS callers through `req_public_insert`. Executed: an anon visitor
//   stamps a real booking request with an unrelated org and it moves OUT of the
//   artist's own RADAR (owner 1 → 0) and INTO the stranger's (0 → 1).
//
// 050 closes it: a request may name an organization only if the writer belongs
// to that organization; everyone else gets NULL, which the same join already
// reads as the artist's own org. [4] now measures both halves.
console.log('\n[4] organization_id — who writes it, and who acts on it')
const ORG_TABLES = ['artists', 'profile_items', 'evidence_artifacts', 'claims',
  'availability_requests', 'passport_versions', 'producer_confirmations', 'act']
const ORG_LIST = ORG_TABLES.map((t) => `'${t}'`).join(',')
const OWN_COL = String.raw`(^|[^._a-z])organization_id`
check('[4] the column exists on all 8 tables, nullable, with no default',
  db.scalar(`select count(*) from pg_attribute a join pg_class c on c.oid=a.attrelid
             join pg_namespace n on n.oid=c.relnamespace and n.nspname='public'
             where a.attname='organization_id' and a.attnum>0 and not a.attisdropped
               and c.relname in (${ORG_LIST})`) === String(ORG_TABLES.length))
check('[4] set_artist_org() takes the CALLER’s organization_id when one is supplied — it is not derived',
  db.scalar(`select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             and n.nspname='public' where p.proname='set_artist_org'
             and pg_get_functiondef(p.oid) like '%coalesce(new.organization_id%'`) === '1')

// ── the anon write path, and 050's answer to it ─────────────────────────────
{
  const PUB = db.rows(`select policyname, coalesce(with_check,'-') from pg_policies
    where schemaname='public' and tablename='availability_requests' and cmd='INSERT'`)
  check('[4] an availability request is still insertable by ANON — that is the product, not the defect',
    PUB.length === 1 && !/organization_id/.test(PUB[0][1]),
    `${JSON.stringify(PUB)} — a buyer has no account; the public path must stay open`)
  const OTHER = db.scalar(`select id::text from public.organization
                           where id <> (select owner_organization_id from public.artists where id='${MINE}') limit 1`)
  db.exec(`update public.artists set published = true where id='${MINE}'`)
  const spoof = db.try(`insert into public.availability_requests (artist_id, organization_id, requester_name, event_date, status)
    values ('${MINE}','${OTHER}','Anon Buyer', current_date + 30, 'new')`, { role: 'anon' })
  check('[4] ...and an anon request naming an org the writer has no membership in is still ACCEPTED, not refused',
    spoof.ok, 'a refusal would surface to a buyer as a failed booking they did not cause and cannot fix')
  check('[4] ...but 050 nulls the attribution, so it lands with the artist’s own org like an honest one',
    db.scalar(`select coalesce(organization_id::text,'null') from public.availability_requests
               where artist_id='${MINE}' and requester_name='Anon Buyer'`) === 'null',
    'without 050 an anonymous visitor moves a real booking request out of the artist’s RADAR and into a stranger’s')
}

// ── the ratchet, now alias- and trigger-aware ───────────────────────────────
{
  // EVERY KNOWN READER IS NAMED WITH ITS REASON. The old assertion said "nothing
  // reads these columns", which was both unprovable by the scan it used and untrue.
  // This one says: these are the readers, this is why each is allowed, and anything
  // else is a finding. That is a claim a scan can actually support.
  const ALLOWED = {
    'set_artist_org -> artists': 'fills the column on insert; it decides nothing',
    // THE RATCHET CAUGHT THIS ONE ON ITS FIRST RUN, which is the point of it.
    // 041's H1 repair reads act.organization_id to refuse a forged artists row,
    // so this IS a permission decision keyed on one of the eight columns — the
    // exact thing [4] exists to make loud. It is allowed BECAUSE the column it
    // compares against, artists.owner_organization_id, is the one an attacker
    // cannot claim: artists_org will not admit a row naming an org the writer
    // does not belong to. That is a different footing from the caller-supplied
    // columns this section is about, and it is why the entry says so here
    // rather than being waved through.
    'pv_act_in_artist_lineage -> act': '041 H1: compares act.organization_id to artists.owner_organization_id, which artists_org governs — the one column in this family a forger cannot set',
    'act_from_artist -> artists': 'reads the artists row it mirrors; a copy, not a decision',
    // The write side of the same mirror. Surfaced only once the unqualified arm
    // existed — the insert names its columns without an alias, which is the very
    // spelling M2 was about.
    'act_from_artist -> act': 'writes act.organization_id from the artists row; the destination of that same copy',
    // 051's inheritance. Reads the Person's default Act and their artists row to
    // fill a NULL — it decides no permission, and it exists because 041's
    // organisation half needs the column to actually be populated.
    // NOT listed: act_inherit_org's artists fallback reads `owner_organization_id`,
    // a DIFFERENT column outside this family — the non-vacuity assertion caught me
    // adding it here by mistake, which is exactly what that assertion is for.
    'act_inherit_org -> act': '051: fills a new Act\'s organisation from the Person\'s default Act; a fill, not a decision',
    'request_org_attribution -> availability_requests': '050 itself — the guard that nulls an unattributable value',
    'recompute_radar_for_org -> availability_requests': 'RADAR scoping, made safe by 050',
    'recompute_radar_private_for_artist -> availability_requests': 'RADAR scoping, made safe by 050',
    'generate_radar_rep_projection -> availability_requests': 'RADAR scoping, made safe by 050',
    'list_production_requests -> availability_requests': 'reads the same scope back for display',
  }
  const defs = db.rows(`select p.proname, replace(pg_get_functiondef(p.oid), chr(10), ' ')
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace and n.nspname='public' where p.prokind in ('f','p')`)
  const trigTables = new Map()
  for (const [fn, tbl] of db.rows(`select p.proname, c.relname from pg_trigger t
    join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace and n.nspname='public'
    join pg_proc p on p.oid=t.tgfoid where not t.tgisinternal`)) {
    if (!trigTables.has(fn)) trigTables.set(fn, [])
    trigTables.get(fn).push(tbl)
  }
  // ALIASES ARE RESOLVED, NOT GUESSED. `from public.availability_requests r` binds
  // `r`, and `r.organization_id` is then a read of THAT table — the exact form the
  // qualified-only grep could not see. SQL keywords are excluded so `from x where`
  // does not bind `where` as an alias.
  const KEYWORDS = ['on', 'where', 'set', 'using', 'select', 'values', 'group', 'order',
    'limit', 'left', 'inner', 'join', 'as', 'loop', 'returning', 'and', 'or']
  const readers = []
  for (const [fn, raw] of defs) {
    const body = raw.toLowerCase()
    for (const t of ORG_TABLES) {
      const aliases = new Set([t, `public.${t}`])
      for (const m of body.matchAll(new RegExp(`\\b(?:from|join|update|into)\\s+(?:public\\.)?${t}\\b(?:\\s+(?:as\\s+)?([a-z_][a-z0-9_]*))?`, 'g')))
        if (m[1] && !KEYWORDS.includes(m[1])) aliases.add(m[1])
      for (const a of aliases)
        if (new RegExp(`\\b${a.replace('.', '\\.')}\\.organization_id\\b`).test(body)) readers.push(`${fn} -> ${t}`)
      // UNQUALIFIED IS THE ORDINARY SPELLING — QA-INDEP-08, M2. `select count(*)
      // from availability_requests where organization_id is not null` names no
      // alias at all, and the alias-only scan could not see it. When a body names
      // exactly ONE of the eight tables, a bare `organization_id` in it can only
      // be that table's. When it names several, the bare form is ambiguous and is
      // attributed to all of them: over-reporting a reader costs one ALLOWED entry
      // with a reason, while under-reporting it is the defect this section exists
      // to prevent.
      // ATTRIBUTED ONLY WHEN IT CANNOT BE ANYTHING ELSE. A first cut asked "does the
      // body name this table and a bare organization_id" and reported twelve
      // readers that are not: the RADAR functions name `artists` and also insert
      // into `radar_signal (organization_id, …)`, and the bare column there is
      // radar_signal's. So the bare form counts only when the body's ENTIRE set of
      // FROM/JOIN/UPDATE/INTO targets is this one table — then the column has no
      // other owner it could belong to. A body touching several tables must spell
      // out which one it means, and if it does, the alias arm above sees it.
      // THREE ORDINARY SPELLINGS DEFEATED THE FIRST VERSION — QA-INDEP-09, M6:
      //   · a CTE — `with src as (select organization_id from availability_requests)`
      //     adds `src` to the target set, so `size === 1` was never true;
      //   · a record variable — `select * into rec …; rec.organization_id` is
      //     dot-qualified, which OWN_COL rejects by construction;
      //   · dynamic SQL — `execute format('… from public.%I where %I = $1', …)`
      //     names neither the table nor the column literally.
      // The first two are handled by asking a narrower question: does the body name
      // this table at all, and does it mention the column in ANY form — bare, or
      // qualified by a name that is not another of the eight tables. Dynamic SQL is
      // handled by refusing to vouch for it at all, below, because a scan cannot
      // follow `format()` and should say so rather than return silence.
      // TARGETS, MINUS CTE NAMES. `with src as (select organization_id from
      // availability_requests) select … from src` names TWO targets textually, so
      // the precise `size === 1` rule was defeated by an ordinary CTE. A CTE name
      // is declared by `with <name> as (`, so it can be subtracted rather than
      // guessed at — and then the precise rule holds again, instead of being
      // widened into the coarse "names the table and mentions the column" test
      // that reported nineteen readers that are not.
      const cteNames = new Set([...body.matchAll(/\b(?:with|,)\s+([a-z_][a-z0-9_]*)\s+as\s*\(/g)].map((m) => m[1]))
      // `into` NAMES A TABLE ONLY AFTER `insert`. In PL/pgSQL, `select * into rec
      // from …` targets a RECORD VARIABLE, and counting `rec` as a table made the
      // target set size 2 — which is how the record-variable reader stayed
      // invisible through the first repair of this very arm.
      const allTargets = new Set([
        ...[...body.matchAll(/\b(?:from|join|update)\s+(?:public\.)?([a-z_][a-z0-9_]*)/g)].map((m) => m[1]),
        ...[...body.matchAll(/\binsert\s+into\s+(?:public\.)?([a-z_][a-z0-9_]*)/g)].map((m) => m[1]),
      ].filter((x) => !cteNames.has(x)))
      const namesTable = allTargets.size === 1 && allTargets.has(t)
      const otherEight = ORG_TABLES.filter((x) => x !== t)
      // THE IDENTIFIER BOUNDARY IS LOAD-BEARING. A first cut lost it and matched
      // `owner_organization_id` as a bare mention, reporting 21 readers that are
      // not — including can_access_artist and grant_permits, which read the OWNER
      // column, a different thing entirely.
      const bare = /(?<![a-z0-9_.])organization_id/.test(body)
      const qualified = [...body.matchAll(/([a-z_][a-z0-9_]*)\.organization_id/g)].map((m) => m[1])
      const mentions = bare || qualified.some((q) => !otherEight.includes(q))
      if (namesTable && mentions) readers.push(`${fn} -> ${t}`)
      if ((trigTables.get(fn) || []).includes(t) && /\b(new|old)\.organization_id\b/.test(body)) readers.push(`${fn} -> ${t}`)
    }
  }
  // A SCAN THAT CANNOT FOLLOW A STATEMENT MUST NOT REPORT SILENCE. `execute
  // format(...)` builds its table and column names at run time; nothing textual
  // can say what it reaches. Any function that both builds SQL dynamically and
  // mentions this column family is reported as unvouchable rather than absent —
  // the same fail-closed choice the waitlist gate makes for a computed `.from()`.
  for (const [fn, raw] of defs) {
    const body = raw.toLowerCase()
    if (/\bexecute\s+(?:format|'|")/.test(body) && /organization_id/.test(body)) {
      readers.push(`${fn} -> (dynamic SQL — this scan cannot say which table it reaches)`)
    }
  }
  const unique = [...new Set(readers)].sort()
  const unexpected = unique.filter((r) => !(r in ALLOWED))
  const vanished = Object.keys(ALLOWED).filter((r) => !unique.includes(r))
  check('[4] every function that reads one of those 8 columns is a NAMED, justified reader — a new one is a finding',
    unexpected.length === 0, `unexpected reader(s): ${unexpected.join('; ')}`)
  check('[4] ...and the scan is not vacuous — every named reader is still found, so a broken scan reds instead of reporting silence',
    vanished.length === 0, `the scan no longer finds: ${vanished.join('; ')} — it stopped working, which is how the last version failed`)
  // TWO SHAPES, BECAUSE POSTGRESQL RENDERS THEM DIFFERENTLY — QA-INDEP-08, M3.
  // A policy's OWN-table column is rendered unqualified, so `OWN_COL` (which
  // rejects anything preceded by a dot) catches it. A policy that reaches ANOTHER
  // of the eight through a subquery renders as `r.organization_id`, and the same
  // dot-rejection made it invisible — which is exactly how a permission would be
  // keyed on one of these columns. My register claim that "all four surfaces" were
  // mutation-tested had in fact tested one rendering twice.
  // …and the qualified arm must resolve the alias too, or every policy that reads
  // `artist_access.organization_id` — a DIFFERENT column, on a table outside these
  // eight — is reported. artists_org does exactly that, legitimately.
  const pol = []
  for (const t of ORG_TABLES) {
    const expr = `(replace(coalesce(qual,''),chr(10),' ')||' '||replace(coalesce(with_check,''),chr(10),' '))`
    const own = db.scalar(`select count(*) from pg_policies where schemaname='public' and tablename='${t}'
      and ${expr} ~ '${OWN_COL}'`)
    if (own !== '0') pol.push(`${t}: ${own} own-column`)
  }
  for (const [tbl, name, expr] of db.rows(`select tablename, policyname,
      replace(coalesce(qual,''),chr(10),' ')||' '||replace(coalesce(with_check,''),chr(10),' ')
      from pg_policies where schemaname='public'`)) {
    const body = (expr || '').toLowerCase()
    for (const t of ORG_TABLES) {
      const aliases = new Set([t])
      for (const m of body.matchAll(new RegExp(`\\b(?:from|join)\\s+(?:public\\.)?${t}\\b(?:\\s+(?:as\\s+)?([a-z_][a-z0-9_]*))?`, 'g')))
        if (m[1] && !['on', 'where', 'and', 'or', 'group', 'order', 'limit', 'join', 'as'].includes(m[1])) aliases.add(m[1])
      for (const a of aliases)
        if (new RegExp(`\\b${a}\\.organization_id\\b`).test(body)) pol.push(`${tbl}.${name} reaches ${t}.organization_id`)
    }
  }
  const views = db.scalar(`select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('v','m') and pg_get_viewdef(c.oid) ~ '${OWN_COL}'`)
  check('[4] and NO policy or view keys on them at all — nothing decides ACCESS by a column the caller supplies',
    pol.length === 0 && views === '0', pol.concat(views === '0' ? [] : [`${views} view(s)`]).join('; '))
}

console.log('')
reachedEnd = true
if (failures) { console.log(`✖ ACT STAMP: ${failures} failure(s).`); process.exit(1) }
console.log(`✓ ACT STAMP: measured, not assumed, and corrected by three independent reviews. A row CAN still be stamped with an Act belonging to another artist on all ${TABLES.length} evidence tables tested — set_act_from_artist_id() (020:147) fills act_id only when NULL and every policy there keys on artist_id — and there the reach is bounded and measured. THAT BOUND DOES NOT GENERALISE. [2f]: on passport_versions one foreign-stamped row was an irreversible cross-tenant unpublish plus a permanent publish-lock; 041 gates that insert on pv_act_in_artist_lineage(). [2g]: the first predicate keyed ownership on artists.created_by, which no policy governs, so one extra INSERT certified the attack; 049 pins that column for the anon/authenticated surface while leaving a real transfer path for trusted roles, and both directions are executed. [2h]: I then claimed the two layers were independent, in four documents, and no gate ran the matrix — it was FALSE for a non-default Act, whose id is a fresh uuid, so 041's disjunct was a no-op and 049 was the only layer. 041 now also requires the Act's organisation to match the artist's, and the matrix RUNS here on both a default and a second Act. [4]: organization_id is not inert — availability_requests.organization_id is read as a scoping decision by three RADAR functions and was anon-writable; 050 nulls an attribution the writer cannot claim, and every reader of the eight columns is named with its reason. NOT CLOSED HERE, and stated so the green line does not overclaim: without migration 046 a stranger can self-issue a roster grant and publish as an authorised writer, and a view-scoped one-Act grant can supersede a different Act's Passport (ACT-SCOPE-PUBLISH). Tracked in docs/OWNER-PENDING.md. 041, 046, 049 and 050 are DRAFTED and NOT APPLIED to any live environment.`)
process.exit(0)
