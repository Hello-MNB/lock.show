#!/usr/bin/env node
// ============================================================
// WAITLIST CAPTURE — EXECUTED SUITE (migration 048)
//
// Executes the governed write path against a real PostgreSQL. A capture rule
// that has only been grepped has never refused anything.
//
// A SKIP IS NOT A PASS — with no local PostgreSQL this exits 1.
// ============================================================
import { ScratchDb, pgAvailable } from './lib/pgharness.mjs'
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

let failures = 0
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

if (!pgAvailable()) {
  console.error('\n✗ WAITLIST CAPTURE: no local PostgreSQL. This suite is executed-only.')
  process.exit(1)
}

const db = ScratchDb.create('b4_wl')
let reachedEnd = false
process.on('exit', (code) => {
  db.drop()
  if (!reachedEnd) console.error(`\n✗ ABORTED (exit ${code}) — assertions after the abort point never ran.`)
})

db.exec(readFileSync('supabase/migrations/048_waitlist_mode.sql', 'utf8'))
// A `check(…, true)` can never fail — independent QA flagged it as the same class
// as the dead gate this suite exists to prevent. Assert what applying 048 should
// have PRODUCED, not that the exec statement returned.
check('[0] migration 048 applied: the governed RPC exists',
  db.scalar(`select to_regprocedure('public.join_waitlist(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text,text,text,text)') is not null`) === 't')
check('[0] ...and its rate-limit table exists',
  db.scalar(`select to_regclass('public.waitlist_rate') is not null`) === 't')
check('[0] ...and the consent columns are present on the 026 table',
  db.scalar(`select count(*) from information_schema.columns where table_schema='public'
     and table_name='waitlist_signup' and column_name in
     ('whatsapp_consent','consent_text','consent_version','consent_locale','consent_at')`) === '5')

console.log('\n[0b] re-applying 048 over an EARLIER 048 leaves ONE function, not two')
// FOUND BY MUTATION, NOT BY READING. Deleting the `drop function` line for the
// 16-argument signature passed every other check in this file, because a fresh
// scratch database has never held the old version — the hazard only exists on the
// path an operator actually takes: applying an updated 048 over a database that
// already ran the previous one. `create or replace` cannot change a signature, so
// without the drop the old function SURVIVES as a second overload and PostgREST
// resolves by whichever argument set the caller sent. An old cached client would
// keep reaching a function this migration believes it replaced.
{
  // Stand in for the previous 048: the same 16-argument signature, a stub body.
  db.exec(`create or replace function public.join_waitlist(
      p_email text, p_entity_role text, p_name text default null, p_primary_need text default null,
      p_whatsapp text default null, p_whatsapp_consent boolean default false,
      p_consent_text text default null, p_consent_version text default null,
      p_locale text default 'en', p_source_page text default null, p_cta_placement text default null,
      p_utm_source text default null, p_utm_medium text default null, p_utm_campaign text default null,
      p_utm_content text default null, p_referrer text default null
    ) returns jsonb language sql as $b4$ select '{"ok":false,"code":"stale_overload"}'::jsonb $b4$;`)
  // A SECOND, DIFFERENT ARITY (QA-INDEP-03, L5). [0b] previously installed one
  // stale overload — the 16-argument shape 048's own `drop function` line named —
  // so it proved that the migration drops the signature it explicitly lists, which
  // it could hardly fail to do. It said nothing about the NEXT parameter, where the
  // identical hazard returns and a signature-named drop is already out of date.
  // 048 now drops every overload of the name, so this fixture installs two shapes
  // neither of which is written down anywhere in the migration.
  db.exec(`create or replace function public.join_waitlist(p_email text, p_entity_role text)
    returns jsonb language sql as $b4$ select '{"ok":false,"code":"ancient_overload"}'::jsonb $b4$;`)
  check('[0b] precondition: the stale 16-argument overload is installed',
    db.scalar(`select count(*) from pg_proc where proname='join_waitlist' and pronargs=16`) === '1')
  check('[0b] ...and a SECOND stale overload of a different arity, named nowhere in 048',
    db.scalar(`select count(*) from pg_proc where proname='join_waitlist' and pronargs=2`) === '1')
  db.exec(readFileSync('supabase/migrations/048_waitlist_mode.sql', 'utf8'))
  check('[0b] applying 048 REMOVES it — exactly one join_waitlist survives',
    db.scalar(`select count(*) from pg_proc where proname='join_waitlist'`) === '1',
    db.scalar(`select coalesce(string_agg(pronargs::text, ','), 'none') from pg_proc where proname='join_waitlist'`))
  check('[0b] ...and the survivor is the 17-argument version',
    db.scalar(`select pronargs::text from pg_proc where proname='join_waitlist'`) === '17')
}

const call = (args = {}, opts = {}) => {
  const d = {
    p_email: 'a@b.com', p_entity_role: 'artist', p_name: null, p_primary_need: null,
    p_whatsapp: null, p_whatsapp_consent: false, p_consent_text: null,
    p_consent_version: null, p_locale: 'en', p_source_page: null, p_cta_placement: null,
    p_utm_source: null, p_utm_medium: null, p_utm_campaign: null, p_utm_content: null, p_referrer: null,
    p_message: null,
    ...args,
  }
  const lit = (v) => v === null ? 'null' : typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`
  const sql = `select public.join_waitlist(${Object.entries(d).map(([k, v]) => `${k} => ${lit(v)}`).join(', ')})`
  return db.scalar(sql, opts)
}

console.log('\n[1] server-side validation — the browser is not the control')
check('a malformed email is refused', /invalid_email/.test(call({ p_email: 'not-an-email' })))
check('an empty email is refused', /invalid_email/.test(call({ p_email: '   ' })))
check('an unknown Entity/Role is refused', /invalid_role/.test(call({ p_entity_role: 'ceo' })))
check('a role of NULL is refused', /invalid_role/.test(call({ p_entity_role: null })))
check('a malformed WhatsApp number is refused', /invalid_whatsapp/.test(call({ p_email: 'w1@b.com', p_whatsapp: '12' })))
check('an over-long free-text need is refused',
  /need_too_long/.test(call({ p_email: 'w2@b.com', p_primary_need: 'x'.repeat(2100) })))

console.log('\n[2] all SIX Entity/Roles are accepted, and stay distinct')
for (const r of ['artist','representative_agency','producer_promoter','programmer_booker_buyer','venue','other']) {
  check(`role ${r} accepted`, /"ok" *: *true/.test(call({ p_email: `${r}@b.com`, p_entity_role: r })))
}
check('...and all six are stored distinctly, not collapsed',
  db.scalar(`select count(distinct entity_role) from public.waitlist_signup`) === '6')

console.log('\n[3] consent cannot be asserted without its record')
// NOTE: distinct email DOMAINS per case on purpose — the rate limiter buckets on
// domain+role, so reusing one domain across many cases throttles the later ones
// and the assertion then fails against `rate_limited` rather than the behaviour
// under test. My first version of this suite did exactly that.
check('consent=true with NO number is refused',
  /consent_incomplete/.test(call({ p_email: 'c1@b.com', p_whatsapp_consent: true, p_consent_text: 't', p_consent_version: 'v1' })))
check('consent=true with no consent TEXT is refused',
  /consent_incomplete/.test(call({ p_email: 'c2@b.com', p_whatsapp: '+972500000001', p_whatsapp_consent: true, p_consent_version: 'v1' })))
check('consent=true with no VERSION is refused',
  /consent_incomplete/.test(call({ p_email: 'c3@b.com', p_whatsapp: '+972500000002', p_whatsapp_consent: true, p_consent_text: 't' })))
check('a number WITHOUT consent is allowed (typing is not consenting)',
  /"ok" *: *true/.test(call({ p_email: 'c4@b.com', p_whatsapp: '+972500000003', p_whatsapp_consent: false })))
check('...and it is stored with consent FALSE and no consent record',
  db.scalar(`select whatsapp_consent::text || ':' || coalesce(consent_at::text,'none') from public.waitlist_signup where email='c4@b.com'`).startsWith('false:none'))
const okc = call({ p_email: 'c5@consent-ok.test', p_whatsapp: '+972500000004', p_whatsapp_consent: true, p_consent_text: 'I agree', p_consent_version: '2026-08-17.v1', p_locale: 'he' })
check('a COMPLETE consent is accepted', /"ok" *: *true/.test(okc))
const c5row = db.scalar(`select coalesce(consent_text,'-')||'|'||coalesce(consent_version,'-')||'|'||coalesce(consent_locale,'-')||'|'||(consent_at is not null)::text
             from public.waitlist_signup where email='c5@consent-ok.test'`)
check('...and records text, version, locale and timestamp', c5row === 'I agree|2026-08-17.v1|he|true', `stored="${c5row}" rpc="${okc}"`)

console.log('\n[4] idempotency — a repeat join must not duplicate, and must not erase consent')
const first = call({ p_email: 'dup@b.com', p_entity_role: 'artist', p_name: 'First' })
const second = call({ p_email: 'DUP@b.com', p_entity_role: 'venue', p_name: 'Second' })
check('first join reports joined', /"joined"/.test(first))
check('a repeat (different case) reports already, not an error', /"already"/.test(second))
check('...and only ONE row exists', db.scalar(`select count(*) from public.waitlist_signup where lower(email)='dup@b.com'`) === '1')
check('...and non-sensitive preferences were updated',
  db.scalar(`select name from public.waitlist_signup where lower(email)='dup@b.com'`) === 'Second')
// THE ONE THAT MATTERS: a later submission must never clear a consent given earlier.
call({ p_email: 'keep@consent-keep.test', p_whatsapp: '+972500000009', p_whatsapp_consent: true, p_consent_text: 'yes', p_consent_version: 'v1' })
call({ p_email: 'keep@consent-keep.test', p_whatsapp_consent: false })
const keepRow = db.scalar(`select coalesce(whatsapp_consent::text,'-')||'|'||coalesce(consent_text,'-')||'|'||coalesce(consent_version,'-') from public.waitlist_signup where email='keep@consent-keep.test'`)
check('a later submission CANNOT withdraw a consent already recorded (false never overwrites true)',
  keepRow.startsWith('true|'), `stored="${keepRow}"`)
check('...and the original consent record survives intact', keepRow === 'true|yes|v1', `stored="${keepRow}"`)

console.log('\n[4b] a consent binds to the NUMBER it was given for (QA D3/D6)')
// Independent QA broke the first version here: a second, unauthenticated
// submission attached a brand-new number to a surviving `true` flag, so the row
// asserted consent for a number nobody had agreed to.
{
  const E = 'swap@consent-bind.test'
  call({ p_email: E, p_whatsapp: '+972500000021', p_whatsapp_consent: true, p_consent_text: 'yes', p_consent_version: 'v1' })
  check('[4b] precondition: consent recorded for the FIRST number',
    db.scalar(`select whatsapp_e164||'|'||whatsapp_consent::text from public.waitlist_signup where email='${E}'`) === '+972500000021|true')
  // THE ATTACK: swap the number, claim no consent.
  call({ p_email: E, p_whatsapp: '+972599999999', p_whatsapp_consent: false })
  const after = db.scalar(`select whatsapp_e164||'|'||whatsapp_consent::text||'|'||coalesce(consent_text,'-') from public.waitlist_signup where email='${E}'`)
  check('a NEW number cannot inherit the old number\'s consent', after === '+972599999999|false|-', `stored="${after}"`)
  // And a complete consent for the new number IS accepted.
  call({ p_email: E, p_whatsapp: '+972599999999', p_whatsapp_consent: true, p_consent_text: 'yes2', p_consent_version: 'v2' })
  check('...while a COMPLETE consent for the new number is accepted',
    db.scalar(`select whatsapp_consent::text||'|'||consent_version from public.waitlist_signup where email='${E}'`) === 'true|v2')

  // D6: a re-consent must not stamp new wording with the OLD timestamp.
  const E2 = 'stamp@consent-bind.test'
  call({ p_email: E2, p_whatsapp: '+972500000031', p_whatsapp_consent: true, p_consent_text: 'TEXT-V1', p_consent_version: 'v1' })
  const t1 = db.scalar(`select consent_at from public.waitlist_signup where email='${E2}'`)
  call({ p_email: E2, p_whatsapp: '+972500000031', p_whatsapp_consent: true, p_consent_text: 'TEXT-V2', p_consent_version: 'v2' })
  const t2 = db.scalar(`select consent_at from public.waitlist_signup where email='${E2}'`)
  check('consent_at ADVANCES when the consent version changes — a timestamp must never describe wording the person had not seen',
    t2 !== t1, `v1="${t1}" v2="${t2}"`)
}

console.log('\n[6b] table-level privileges are revoked, not merely policy-denied (QA D13)')
for (const [role, verb] of [['anon','update'],['anon','delete'],['authenticated','update'],['authenticated','delete'],['authenticated','select']]) {
  check(`${role} has NO ${verb.toUpperCase()} privilege on waitlist_signup`,
    db.scalar(`select has_table_privilege('${role}','public.waitlist_signup','${verb}')`) === 'f')
}

console.log('\n[6c] ...and the BROWSER stopped asking (GAP-W1)')
// Section [6] proves the DATABASE refuses a direct write. That is only half the
// contract: a client that still POSTs the table gets a permanent 401 the moment
// 048 is applied, and the person's message is lost while the button still says
// "sending". Nothing in this suite could see that, because it never opened the
// client source. It does now.
//
// COMMENT-AWARE ON PURPOSE. contact-form.tsx documents the old path in its
// header, and a raw grep would fail on the very comment that explains the fix.
// Only unambiguous comment lines are stripped (trimmed start `//`, `*`, `/*`),
// so a URL inside a string is never truncated by a `//` that belongs to it. A
// trailing `// …/rest/v1/waitlist_signup` on a CODE line still counts as a hit:
// this gate errs toward failing loudly, never toward passing quietly.
{
  const TABLE_PATH = '/rest/v1/waitlist_signup'
  const RPC_PATH = '/rest/v1/rpc/join_waitlist'
  // TRACKED **and** UNTRACKED (QA-INDEP-03, L6). `git ls-files` alone cannot see a
  // client file that exists on disk but has not been added, and "the browser does
  // not ask" must be true of the working tree, not only of the index.
  const listed = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard',
    'website-next/app', 'website-next/components', 'website-next/lib', 'src'],
    { encoding: 'utf8' }).split('\n')
  const files = listed.filter((f) => /\.(tsx|ts|jsx|js)$/.test(f) && existsSync(f))

  const strip = (src) => src.split('\n')
    .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
    .join('\n')

  // THE TABLE NAME ITSELF, not one URL spelling (QA-INDEP-03, H1). The first
  // version of this check tested for the literal substring `/rest/v1/waitlist_signup`
  // and nothing else. Mutation P1 injected exactly that spelling, the check caught
  // it, and the register concluded the browser half of the contract was enforced.
  // It was not. The reviewer added two live direct writes to a client component and
  // this gate stayed green:
  //
  //     sb.from('waitlist_signup').insert(row)                  // supabase-js — the
  //     fetch(`${SUPABASE_URL}/rest/v1/` + TBL, …)              // dominant style in
  //                                                             // src/lib/db.js
  //
  // The supabase-js form is how EVERY other write in this repo is spelled
  // (src/lib/db.js:12,22,30,46,59), so the one form the scanner modelled was close
  // to the least likely one to appear. Post-048 either call is a permanent 401 with
  // the person's message discarded — the exact failure GAP-W1 exists to prevent.
  //
  // So the rule is now about the TABLE, not about a URL: the identifier
  // `waitlist_signup` may not appear in client code at all, in any expression. The
  // RPC path is subtracted first because it does not contain the table name; only
  // the postgrest URL form does, and stripping it would hide a real hit, so the two
  // are distinguished by pattern rather than by subtraction.
  const TABLE_NAME = 'waitlist_signup'
  const offenders = []
  let rpcCallers = 0
  for (const f of files) {
    const code = strip(readFileSync(f, 'utf8'))
    if (code.includes(RPC_PATH)) rpcCallers++
    // Every mention of the table identifier that is not part of the RPC path.
    // `/rest/v1/rpc/join_waitlist` contains neither the table name nor TABLE_PATH,
    // so nothing legitimate is caught here.
    const hits = [...code.matchAll(/waitlist_signup/g)]
    if (hits.length) offenders.push(`${f} (${hits.length}× "${TABLE_NAME}")`)
  }

  check('[6c] the table the migration revoked is never named in client code',
    offenders.length === 0, offenders.join(', '))
  // NON-VACUITY, both directions: the scan must have opened real files, and it
  // must be able to SEE a waitlist write path at all. A glob that silently
  // matched nothing would otherwise report a clean result forever.
  check('[6c] ...and the scan is not vacuous: source files were actually read',
    files.length >= 20, `scanned ${files.length} files`)
  check('[6c] ...and it can see the governed path, so the scanner works',
    rpcCallers >= 2, `${rpcCallers} file(s) call ${RPC_PATH}`)
  console.log(`        scanned ${files.length} client source files · ${rpcCallers} call the RPC · ${offenders.length} write the table`)
}

console.log('\n[9] the CONTACT payload survives the move (GAP-W1)')
// The contact form has NINE roles; the RPC accepts SIX. If the mapping were
// wrong, three of the nine would come back invalid_role and the message would be
// dropped in production while every test above still passed.
{
  // READ THE REAL SOURCES, never a copy. A mapping table retyped into this file
  // would drift from the component the moment either changed, and the gate would
  // keep passing while production dropped a third of its contact messages. The
  // OFFERED roles come from the copy matrix the <select> renders; the MAPPING
  // comes from the component that posts.
  const parseValues = (src, marker) => {
    const at = src.indexOf(marker)
    if (at < 0) return null
    const block = src.slice(at, src.indexOf('\n]', at) + 2)
    return [...block.matchAll(/value: '([a-z_]+)'/g)].map((m) => m[1])
  }
  const offered = parseValues(readFileSync('website-next/content/copy-matrix.ts', 'utf8'),
    'export const CONTACT_ROLES')
  const compSrc = readFileSync('website-next/components/contact-form.tsx', 'utf8')
  const mapBlock = compSrc.slice(compSrc.indexOf('const ENTITY_ROLE_FOR_CONTACT'),
    compSrc.indexOf('\n}', compSrc.indexOf('const ENTITY_ROLE_FOR_CONTACT')))
  const CONTACT_TO_ENTITY = Object.fromEntries(
    [...mapBlock.matchAll(/^\s*([a-z_]+):\s*'([a-z_]+)',/gm)].map((m) => [m[1], m[2]]))

  check('[9] the offered roles were parsed from the copy matrix, not assumed',
    Array.isArray(offered) && offered.length > 0, `parsed ${offered ? offered.length : 'null'}`)
  check('[9] the mapping was parsed from the component that posts',
    Object.keys(CONTACT_TO_ENTITY).length > 0, `parsed ${Object.keys(CONTACT_TO_ENTITY).length} entries`)
  // THE ONE THAT MATTERS: every role the form can submit must have a mapping.
  // An unmapped role falls through to `other` in the component, which would
  // silently discard the answer instead of preserving it.
  const unmapped = (offered || []).filter((r) => !(r in CONTACT_TO_ENTITY))
  check('[9] every role the form OFFERS has an explicit mapping', unmapped.length === 0,
    `unmapped: ${unmapped.join(', ')}`)
  const SIX = ['artist','representative_agency','producer_promoter','programmer_booker_buyer','venue','other']
  const badTarget = Object.entries(CONTACT_TO_ENTITY).filter(([, v]) => !SIX.includes(v))
  check('[9] ...and every mapping target is one of the six Entity/Roles', badTarget.length === 0,
    badTarget.map(([k, v]) => `${k}->${v}`).join(', '))

  const contactRoles = Object.keys(CONTACT_TO_ENTITY)

  let accepted = 0
  for (const [i, r] of contactRoles.entries()) {
    const out = call({
      p_email: `k${i}@contact-role-${i}.test`, p_entity_role: CONTACT_TO_ENTITY[r],
      p_message: `[demo] [${r}] hello`, p_cta_placement: 'contact_form',
    })
    if (/"ok" *: *true/.test(out)) accepted++
    else check(`contact role ${r} accepted`, false, out)
  }
  check('every mapped contact role reaches the RPC', accepted === contactRoles.length,
    `${accepted}/${contactRoles.length}`)

  // The three that have no Entity/Role must land in `other` WITH their real role
  // still readable — a mapping that only narrows would destroy the answer.
  // Derived from the parsed mapping, not listed by hand: whichever roles the
  // component narrows to `other` are the ones whose text must carry the answer.
  const narrowed = contactRoles.filter((r) => CONTACT_TO_ENTITY[r] === 'other' && r !== 'other')
  check('at least one role is narrowed, so the next checks are not vacuous',
    narrowed.length > 0, `${narrowed.length} narrowed`)
  for (const r of narrowed) {
    const i = contactRoles.indexOf(r)
    const row = db.scalar(`select entity_role || '|' || message from public.waitlist_signup where email='k${i}@contact-role-${i}.test'`)
    check(`${r} stores as other, and the true role survives in the text`,
      row === `other|[demo] [${r}] hello`, `stored="${row}"`)
  }

  check('an over-long contact message is refused',
    /message_too_long/.test(call({ p_email: 'long@msg-len.test', p_message: 'x'.repeat(4100) })))

  console.log('\n[10] a second contact message is APPENDED, never discarded')
  // Under the 026 path a repeat address hit the unique index, returned 409, and
  // the second message was thrown away. Overwriting would lose the first instead.
  //
  // FLATTEN THE NEWLINES IN SQL, NOT IN JS. ScratchDb.scalar ends with
  // `.split('\n').filter(Boolean).pop()` — it returns the LAST LINE of the value,
  // so a multi-line column silently reads as its tail and nothing warns you. The
  // first version of this check asserted on the accumulated message directly and
  // reported a FAILURE against correct SQL: it saw only "SECOND question" because
  // the appended text begins on an earlier line. Any assertion here that can span
  // lines must collapse them inside the query.
  const flat = (email) => db.scalar(
    `select replace(replace(message, chr(10), '\\n'), chr(13), '') from public.waitlist_signup where email='${email}'`)
  const E = 'twice@msg-append.test'
  call({ p_email: E, p_entity_role: 'artist', p_message: 'FIRST question' })
  call({ p_email: E, p_entity_role: 'artist', p_message: 'SECOND question' })
  const both = flat(E)
  check('the FIRST message survives a second submission', /FIRST question/.test(both), `stored="${both}"`)
  check('...and the SECOND is there too', /SECOND question/.test(both), `stored="${both}"`)
  check('...and they are separated by a dated marker, not run together',
    /FIRST question\\n\\n--- \d{4}-\d{2}-\d{2} \d{2}:\d{2} ---\\nSECOND question/.test(both), `stored="${both}"`)
  check('...and still exactly one row', db.scalar(`select count(*) from public.waitlist_signup where email='${E}'`) === '1')
  // An accidental double-submit must not duplicate the text.
  const E2 = 'same@msg-append.test'
  call({ p_email: E2, p_entity_role: 'artist', p_message: 'IDENTICAL' })
  call({ p_email: E2, p_entity_role: 'artist', p_message: 'IDENTICAL' })
  const dup = flat(E2)
  check('an identical resubmission is not appended twice', dup === 'IDENTICAL', `stored="${dup}"`)
  // And a repeat that carries NO message must not erase the one already stored.
  call({ p_email: E2, p_entity_role: 'venue', p_message: null })
  check('a later submission with no message cannot clear the stored one', flat(E2) === 'IDENTICAL')

  // THE CEILING, EXECUTED (QA-INDEP-03, M7). The append comment used to claim
  // growth was "bounded by the rate limiter"; that bounds the RATE. With
  // WL-OVERWRITE unresolved, an unauthenticated caller can write to any address's
  // row, so an unbounded column is an unbounded write to somebody else's record.
  const E3 = 'cap@msg-cap.test'
  for (let i = 0; i < 12; i++) call({ p_email: E3, p_entity_role: 'artist', p_message: `${i}-${'x'.repeat(3900)}` })
  const capLen = Number(db.scalar(`select length(message) from public.waitlist_signup where email='${E3}'`))
  check('the stored message cannot grow past 32 KB however many are appended',
    capLen > 0 && capLen <= 32768, `length=${capLen}`)
  check('...and the OLDEST message is the one kept — it is the one awaiting a reply',
    db.scalar(`select left(message, 1) from public.waitlist_signup where email='${E3}'`) === '0')
}

console.log('\n[5] rate limiting')
let limited = false
for (let i = 0; i < 9; i++) if (/rate_limited/.test(call({ p_email: `r${i}@ratetest.com`, p_entity_role: 'venue' }))) limited = true
check('a burst on one domain+role bucket is eventually rate-limited', limited)
check('...and a DIFFERENT bucket is unaffected',
  /"ok" *: *true/.test(call({ p_email: 'fresh@other-domain.com', p_entity_role: 'artist' })))

console.log('\n[6] the public direct-table write is CLOSED (the 026 hole)')
const anonInsert = db.try(`insert into public.waitlist_signup (email) values ('sneak@b.com')`, { role: 'anon' })
check('anon can no longer INSERT directly into waitlist_signup', !anonInsert.ok,
  anonInsert.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 90))
const anonRead = db.try(`select email from public.waitlist_signup limit 1`, { role: 'anon' })
check('anon still cannot READ the list', !anonRead.ok || !/@/.test(anonRead.out))
check('...but anon CAN call the governed RPC (the only way in)',
  db.scalar(`select has_function_privilege('anon','public.join_waitlist(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text,text,text,text)','execute')`) === 't')

console.log('\n[7] no account is created')
// Was `count === count` on the SAME query — always true, proving nothing. Measure
// the delta ACROSS an RPC call: the contract is "no account is created today".
const usersBefore = db.scalar(`select count(*) from auth.users`)
call({ p_email: 'noacct@no-account.test', p_entity_role: 'artist' })
const usersAfter = db.scalar(`select count(*) from auth.users`)
check('the RPC creates NO auth user (delta measured across the call)',
  usersBefore === usersAfter, `before=${usersBefore} after=${usersAfter}`)
check('...while the waitlist row WAS created, so the check is not vacuous',
  db.scalar(`select count(*) from public.waitlist_signup where email='noacct@no-account.test'`) === '1')
check('...and touches only waitlist tables',
  db.scalar(`select count(*) from public.waitlist_signup`) !== '0')

console.log('\n[8] existing 026 rows survive the migration (additive only)')
check('the 026 legacy role vocabulary is still storable',
  db.try(`insert into public.waitlist_signup (email, role) values ('legacy@b.com','booking_manager')`).ok)

console.log('')
reachedEnd = true
if (failures) { console.log(`✗ WAITLIST CAPTURE: ${failures} failure(s).`); process.exit(1) }
console.log('✓ WAITLIST CAPTURE: server-side validation, six distinct roles, versioned consent that cannot be forged or silently withdrawn, idempotency, rate limiting, the closed public write path — and, both halves of it, that no client still asks for the write the database refuses. Contact payload proven end to end. NOT proven here: behaviour against the live Supabase, which this suite never contacts.')
process.exit(0)
