#!/usr/bin/env node
// ============================================================
// ACTIVE ROLE CONTEXT — REACH OF A FORGED ACTIVE ORGANIZATION (EXECUTED)
//
// WHY THIS EXISTS. `test-tenant-isolation` already proves (F1/F2, executed) that
// `arc_self` — `using (person_id = auth.uid())`, 008:216 — validates the PERSON
// and never the ORGANIZATION, so anyone may point their own
// `active_role_context.active_organization_id` at an organization they do not
// belong to. `docs/OWNER-PENDING.md` records that as ARC-VALIDATE and calls it a
// "hazard, not a live defect".
//
// THAT SECOND HALF WAS NEVER MEASURED. "A hazard" is a claim about REACH — about
// what a forged value actually unlocks — and reach is exactly what a policy
// reading cannot tell you. This file answers it by execution.
//
// The consumer that matters is `set_artist_org()` (015:30-42, and 014 before it):
// a SECURITY DEFINER trigger on `artists` INSERT that reads the caller's active
// organization and stamps it into `owner_organization_id` / `organization_id`
// with NO membership check. `can_access_artist()` (008:147) then grants access to
// every member of whichever organization is stamped there.
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
  console.error('\n✖ ARC REACH: no local PostgreSQL. Every assertion here is about what the database')
  console.error('  DOES with a forged active organization, so a skip would prove nothing. NOT a pass.')
  process.exit(1)
}

const db = ScratchDb.create('b4_arc')
let reachedEnd = false
process.on('exit', (code) => {
  db.drop()
  if (!reachedEnd) console.error(`\n✖ ABORTED (exit ${code}) — assertions after the abort point never ran.`)
})

db.exec(readFileSync('scripts/sql/appsec-fixture.sql', 'utf8'))
const REP_A = '00000000-0000-0000-0000-0000000000a2'   // member of Agency A only
const REP_B = '00000000-0000-0000-0000-0000000000a3'   // member of Agency B only
const ORG_B = db.scalar(`select organization_id::text from public.organization_membership
                         where person_id='${REP_B}' and status='active' limit 1`)
const asA = { role: 'authenticated', uid: REP_A }
const asB = { role: 'authenticated', uid: REP_B }

console.log('\n[1] the precondition, re-established here rather than assumed')
check('REP_A is NOT a member of ORG_B', db.scalar(`select count(*) from public.organization_membership
  where person_id='${REP_A}' and organization_id='${ORG_B}' and status='active'`) === '0', `ORG_B=${ORG_B}`)
const forge = db.try(`insert into public.active_role_context(person_id, active_organization_id)
  values ('${REP_A}', '${ORG_B}')
  on conflict (person_id) do update set active_organization_id = excluded.active_organization_id`, asA)
check('...and REP_A can still point their OWN active context at ORG_B (arc_self checks the person, not the org)',
  forge.ok, forge.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 90))
check('...and the forged value really is stored',
  db.scalar(`select active_organization_id::text from public.active_role_context where person_id='${REP_A}'`) === ORG_B)

console.log("\n[2] REACH — what the forged value is actually used FOR")
// set_artist_org() is SECURITY DEFINER and consults the caller's active org with
// no membership check, so it WILL stamp the forged organization. The question
// ARC-VALIDATE never asked is whether anything downstream accepts that stamp.
//
// TWO-STATE, as used for 041 PART B and the storage policy: not "the trigger
// refuses" (it does not) and not "this is fine" (that blesses it), but — measure
// which outcome the database produces and require the consequences to match.
// NO `returning` — it conflates two controls. `insert … returning id` also needs
// the row to be SELECT-visible, and the USING clause fails for a foreign org, so
// the statement was refused for a second reason even when the WITH CHECK was
// removed. That made the guard look load-bearing when the probe could not tell.
// Found by mutating the guard and watching the outcome NOT move; isolated by
// running the same insert with and without `returning` under both policies.
const made = db.try(`insert into public.artists (created_by, stage_name, published)
                     values ('${REP_A}', 'Injected Act', false)`, asA)
const injected = db.scalar(`select coalesce(id::text,'') from public.artists where stage_name='Injected Act' limit 1`)
const stamped = injected ? db.scalar(`select coalesce(owner_organization_id::text,'') from public.artists where id='${injected}'`) : null
const escalated = made.ok && stamped === ORG_B

if (escalated) {
  // THIS BRANCH FAILS, and that is the difference between this gate and the
  // two-state gates for 041 PART B and the storage policy. There, BOTH states are
  // legitimate — a cutover the owner has not yet authorised is not a defect. Here
  // only one state is: a person writing into an organization they do not belong to
  // is never a posture anyone chose. The two states are a DIAGNOSIS, not a
  // permission, so the escalation branch reds the chain and names what happened.
  check('[2] ESCALATION — a person who belongs to no such organization created an artist OWNED by it',
    false, `owner_organization_id=${stamped}; the containment at 015:27 is gone`)
  const bSees = db.try(`select stage_name from public.artists where id='${injected}'`, asB)
  check('[2] ...and the injected row must NOT be readable by the other organization\'s member',
    !(bSees.ok && /Injected Act/.test(bSees.out)), `ORG_B reads it: ${bSees.out.slice(0, 70)}`)
  const bWrites = db.try(`update public.artists set stage_name='Renamed by ORG_B' where id='${injected}'`, asB)
  check('[2] ...and must NOT be writable by them', !bWrites.ok)
  console.log('        REACH, MEASURED: the forged value is a CROSS-ORGANIZATION WRITE.')
} else {
  // THE HAZARD IS CONTAINED, and this is the evidence for a claim that had none.
  // The trigger does trust the forged value — but `artists_org`'s WITH CHECK is
  // `owner_organization_id in (select current_org_ids())`, and
  //
  // CITED FROM THE EFFECTIVE MIGRATION, not the first one that defines it. I first
  // wrote 008:251; 015:22 DROPS and recreates `artists_org`, so 008's version is
  // superseded and a mutation against it changes nothing. Found by mutating 008
  // and watching the outcome refuse to move — the file changed and the database
  // did not, which is why a mutation has to be verified where it lands.
  // current_org_ids() reads real memberships. So the stamp the trigger writes is
  // exactly what the policy then refuses. Two independent things had to be true;
  // reading either one alone would have given the wrong answer.
  check('[2] the insert is REFUSED — the row-level policy rejects the very stamp the trigger wrote',
    !made.ok && /row-level security/i.test(made.out),
    made.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 110))
  check('[2] ...and nothing was created, so the refusal is not a partial write',
    db.scalar(`select count(*) from public.artists where stage_name='Injected Act'`) === '0')
  // Non-vacuity: the SAME insert must succeed once the active org is honest, or
  // the refusal above would prove only that inserts fail for some other reason.
  const realOrg = db.scalar(`select organization_id::text from public.organization_membership
                             where person_id='${REP_A}' and status='active' limit 1`)
  db.exec(`insert into public.active_role_context(person_id, active_organization_id) values ('${REP_A}', '${realOrg}')
           on conflict (person_id) do update set active_organization_id = excluded.active_organization_id`, asA)
  const honest = db.try(`insert into public.artists (created_by, stage_name, published)
                         values ('${REP_A}', 'Honest Act', false) returning id`, asA)
  check('[2] ...while the IDENTICAL insert succeeds with an honest active org — so the refusal is about the forgery, not about inserts',
    honest.ok, honest.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 100))
  check('[2] ...and that one is stamped with the membership REP_A really holds',
    db.scalar(`select owner_organization_id::text from public.artists where stage_name='Honest Act'`) === realOrg)
  console.log('        REACH, MEASURED: set_artist_org() DOES trust the forged organization, and the')
  console.log('        artists_org policy at 015:22 — which supersedes the 008 definition — refuses the')
  console.log('        result, because its WITH CHECK reads real memberships. The hazard is contained by')
  console.log('        a SECOND, independent control, not by the trigger that wrote the value.')
}

console.log('\n[3] what the forged value does NOT reach — the boundaries that hold')
// Reach must be bounded as precisely as it is demonstrated, or the finding is
// just alarm. These are the doors a forged active org does NOT open.
const readB = db.try(`select name from public.organization where id='${ORG_B}'`, asA)
check('a forged active org does not let REP_A read ORG_B\'s own record',
  !readB.ok || !/Agency/.test(readB.out), readB.out.slice(0, 80))
const memB = db.try(`select person_id from public.organization_membership where organization_id='${ORG_B}'`, asA)
check('...nor ORG_B\'s membership list', !memB.ok || !/0000000000a3/.test(memB.out), memB.out.slice(0, 80))
const rosterB = db.try(`select artist_id from public.artist_access where organization_id='${ORG_B}'`, asA)
check('...nor ORG_B\'s existing roster grants', !rosterB.ok || !/[0-9a-f]{8}-/.test(rosterB.out), rosterB.out.slice(0, 80))
check('...and current_org_ids() still reports only the memberships REP_A really holds',
  db.scalar(`select count(*) from public.current_org_ids()`, asA) ===
  db.scalar(`select count(*) from public.organization_membership where person_id='${REP_A}' and status='active'`),
  'the membership function is the boundary that holds')

console.log('')
reachedEnd = true
if (failures) { console.log(`✖ ARC REACH: ${failures} failure(s).`); process.exit(1) }
console.log(`✓ ARC REACH [${escalated ? 'ESCALATION — the forged organization is accepted downstream' : 'CONTAINED — trusted by the trigger, refused by the policy'}]: the reach of a forged active_role_context measured by execution rather than described. ${escalated ? 'A person belonging to no such organization can create an artist owned by it.' : 'set_artist_org() (015:35) does consult the forged value with no membership check, and artists_org (015:22, which supersedes the 008 definition) then refuses the row because its WITH CHECK reads real memberships — so ARC-VALIDATE is a hazard whose containment rests on a SECOND control, and the identical insert succeeds once the active org is honest.'} Bounded as precisely as it is demonstrated: the forged value exposes neither the other organization's record, nor its membership list, nor its existing roster grants, and current_org_ids() stays truthful. NOT proven here: PostgREST with real JWTs, and any path that writes owner_organization_id explicitly rather than letting the trigger stamp it.`)
process.exit(0)
