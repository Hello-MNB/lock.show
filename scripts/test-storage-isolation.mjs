#!/usr/bin/env node
// ============================================================
// STORAGE ISOLATION — EXECUTED SUITE (migration 001, storage.objects)
//
// WHY THIS EXISTS. The controller's own priority list names "RLS/**storage**/API
// negative isolation" and requires a "storage/API bypass" negative control. No
// gate in the chain had ever opened storage.objects. `test-storage-resilience` is
// about the BROWSER's sessionStorage/localStorage failing soft — a different
// thing that happens to share the word, and the coincidence is exactly why the
// gap survived: the chain looked like it had storage covered.
//
// WHAT 001 ACTUALLY SHIPS (001:213-229): two buckets, and three policies —
//   media_read   select  using (bucket_id = 'public-media')          -- to public
//   media_write  insert  to authenticated with check (bucket_id = 'public-media')
//   evidence_rw  ALL     to authenticated using/with check (bucket_id = 'evidence')
//
// `evidence_rw` scopes by BUCKET and by nothing else. There is no owner, no
// organization, no Act. CLAUDE.md makes evidence per-Act and NON-transferable, so
// whether one authenticated artist can read, overwrite or delete another's
// evidence file is a question worth an answer rather than an assumption.
//
// This suite does not decide the answer. It MEASURES it and names the posture, in
// the two-state form used for 041 PART B: whichever world the policies put us in,
// the run says so, and a half-applied tightening fails.
//
// A SKIP IS NOT A PASS — with no local PostgreSQL this exits 1.
// ============================================================
import { ScratchDb, pgAvailable } from './lib/pgharness.mjs'

let failures = 0
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

if (!pgAvailable()) {
  console.error('\n✖ STORAGE ISOLATION: no local PostgreSQL. This suite is executed-only, so a skip is NOT a pass.')
  process.exit(1)
}

const db = ScratchDb.create('b4_storage')
let reachedEnd = false
process.on('exit', (code) => {
  db.drop()
  if (!reachedEnd) console.error(`\n✖ ABORTED (exit ${code}) — assertions after the abort point never ran.`)
})

const ALICE = '44444444-4444-4444-4444-444444444444'
const BOB = '55555555-5555-5555-5555-555555555555'

console.log('\n[1] the buckets and policies 001 declares are actually installed')
check('both buckets exist', db.scalar(`select count(*) from storage.buckets where id in ('public-media','evidence')`) === '2')
check('the evidence bucket is PRIVATE (public=false)',
  db.scalar(`select public::text from storage.buckets where id='evidence'`) === 'false')
// `boolean::text` yields 'true'/'false'; psql's DEFAULT boolean display is 't'/'f'.
// This check compared an explicit cast against the display form and failed on a
// table whose RLS is plainly enabled — caught by running it, and worth the comment
// because the two spellings sit side by side in this file.
check('RLS is enabled on storage.objects',
  db.scalar(`select relrowsecurity::text from pg_class where oid='storage.objects'::regclass`) === 'true')
const policies = db.scalar(`select coalesce(string_agg(policyname, ',' order by policyname), '(none)')
                            from pg_policies where schemaname='storage' and tablename='objects'`)
check('the three 001 policies are present, and the scan is not vacuous',
  policies.includes('evidence_rw') && policies.includes('media_read') && policies.includes('media_write'), policies)

// Alice owns an evidence object. Written as ALICE so `owner` is truthful even
// though no policy consults it — that is the point being measured.
db.exec(`insert into storage.objects (bucket_id, name, owner)
         values ('evidence', 'alice/rider-v1.pdf', '${ALICE}')`, { role: 'authenticated', uid: ALICE })
check('[1] precondition: Alice\'s evidence object exists',
  db.scalar(`select count(*) from storage.objects where name='alice/rider-v1.pdf'`) === '1')

console.log('\n[2] anon is refused the private bucket — the boundary that IS scoped')
const anonRead = db.try(`select name from storage.objects where bucket_id='evidence'`, { role: 'anon' })
check('anon cannot read the evidence bucket', !anonRead.ok || !/rider-v1/.test(anonRead.out), anonRead.out.slice(0, 90))
const anonWrite = db.try(`insert into storage.objects (bucket_id, name) values ('evidence','anon/sneak.pdf')`, { role: 'anon' })
check('anon cannot write to the evidence bucket', !anonWrite.ok,
  anonWrite.out.split('\n').find((l) => /ERROR|denied/.test(l))?.slice(0, 90))
const anonPublic = db.try(`insert into storage.objects (bucket_id, name) values ('public-media','anon/sneak.png')`, { role: 'anon' })
check('anon cannot write to public-media either (media_write is `to authenticated`)', !anonPublic.ok,
  anonPublic.out.split('\n').find((l) => /ERROR|denied/.test(l))?.slice(0, 90))

console.log('\n[3] CROSS-PERSON: what one authenticated artist can do to another\'s evidence')
// This is the required "storage bypass" negative control, and the answer is
// whatever the shipped policy says — measured, not assumed.
const bobRead = db.try(`select name from storage.objects where name='alice/rider-v1.pdf'`, { role: 'authenticated', uid: BOB })
const bobReads = bobRead.ok && /rider-v1/.test(bobRead.out)
const bobRename = db.try(`update storage.objects set name='bob/stolen.pdf' where name='alice/rider-v1.pdf'`,
  { role: 'authenticated', uid: BOB })
const bobWrote = bobRename.ok && db.scalar(`select count(*) from storage.objects where name='bob/stolen.pdf'`) === '1'
if (bobWrote) db.exec(`update storage.objects set name='alice/rider-v1.pdf' where name='bob/stolen.pdf'`)
const bobDelete = db.try(`delete from storage.objects where name='alice/rider-v1.pdf'`, { role: 'authenticated', uid: BOB })
const bobDeleted = bobDelete.ok && db.scalar(`select count(*) from storage.objects where name='alice/rider-v1.pdf'`) === '0'
if (bobDeleted) db.exec(`insert into storage.objects (bucket_id, name, owner) values ('evidence','alice/rider-v1.pdf','${ALICE}')`)

// TWO-STATE, like 041 PART B. `evidence_rw` scopes by bucket alone today, so the
// honest assertion is not "Bob is refused" — that would demand a state nobody has
// authorised — nor "Bob may read", which would bless it. It is: establish which
// policy shape is installed, and require the behaviour to match it exactly.
const scoped = db.scalar(`select coalesce(string_agg(coalesce(qual,'') || coalesce(with_check,''), ' '), '')
                          from pg_policies where schemaname='storage' and tablename='objects' and policyname='evidence_rw'`)
const ownerScoped = /owner|auth\.uid|organization|act_id/i.test(scoped)
// A REAL TWO-STATE TEST. This was `typeof ownerScoped === 'boolean'` — always
// true, a check that could never fail while its label claimed to detect a
// half-applied mix (QA-INDEP-05, M1). The honest form is the one the PV gate
// already uses: the named policy must exist, and it must be scoped or not, with
// no third possibility. `evidence_rw` missing entirely, or a SECOND permissive
// policy re-opening what a narrowed one closed, both fail here rather than
// silently choosing a branch.
const evidencePolicies = Number(db.scalar(`select count(*) from pg_policies
  where schemaname='storage' and tablename='objects' and (qual like '%evidence%' or with_check like '%evidence%')`))
check('[3] exactly one policy governs the evidence bucket — not zero, and not a second one re-opening it',
  evidencePolicies === 1, `${evidencePolicies} policies mention the evidence bucket`)

if (ownerScoped) {
  check('[3] SCOPED policy installed: a different artist cannot READ another\'s evidence', !bobReads, bobRead.out.slice(0, 90))
  check('[3] SCOPED policy installed: a different artist cannot RENAME it', !bobWrote)
  check('[3] SCOPED policy installed: a different artist cannot DELETE it', !bobDeleted)
} else {
  // The 001 shape. Record precisely what it permits, so the cost is a measured
  // line in every run rather than an inference from a policy expression.
  check('[3] BUCKET-ONLY policy (001 shape): the measured behaviour matches it — any authenticated user reads another artist\'s evidence',
    bobReads, 'a cross-person read was REFUSED — if the policy was tightened, the shape check above should have said so')
  check('[3] ...and can RENAME it', bobWrote)
  check('[3] ...and can DELETE it', bobDeleted)
  console.log('        EXPOSURE, MEASURED: `evidence_rw` (001:227-229) scopes by bucket_id and nothing else — no owner, no organization, no Act.')
  console.log('        Any authenticated account can read, overwrite and delete every other artist\'s evidence file. CLAUDE.md makes evidence per-Act and NON-transferable.')
  console.log('        Tracked as STORAGE-EVIDENCE-SCOPE in docs/OWNER-PENDING.md — narrowing it changes behaviour for live orgs, which is Maria\'s call.')
}

console.log('\n[4] the public bucket behaves as its name promises')
db.exec(`insert into storage.objects (bucket_id, name, owner) values ('public-media','alice/photo.jpg','${ALICE}')`,
  { role: 'authenticated', uid: ALICE })
const anonPub = db.try(`select name from storage.objects where bucket_id='public-media'`, { role: 'anon' })
check('anon CAN read public-media — it is public by design, and this proves the anon path works at all',
  anonPub.ok && /photo\.jpg/.test(anonPub.out), anonPub.out.slice(0, 90))
check('...which makes the [2] refusals meaningful rather than a broken role',
  db.scalar(`select count(*) from storage.objects where bucket_id='public-media'`) === '1')

console.log('')
reachedEnd = true
if (failures) { console.log(`✖ STORAGE ISOLATION: ${failures} failure(s).`); process.exit(1) }
console.log(`✓ STORAGE ISOLATION [evidence policy: ${ownerScoped ? 'OWNER-SCOPED' : 'BUCKET-ONLY, the 001 shape'}]: buckets, RLS and the three policies proven installed by execution; anon refused both write paths and the private bucket; the public bucket readable, which proves the anon role works and the refusals are real; and the cross-person posture on the evidence bucket measured rather than assumed. NOT proven here: PostgREST/GoTrue with real JWTs, and the production data. CORRECTED after QA-INDEP-05 (M4): an earlier version of this line said Supabase "adds its own path-prefix rules on top", which is FALSE — path scoping in Supabase Storage exists only if a policy writes storage.foldername(), and these policies do not. Supabase delegates authorization wholly to RLS, so the database half IS the whole boundary, and the hedge was pointing the reader toward a safety that does not exist.`)
process.exit(0)
