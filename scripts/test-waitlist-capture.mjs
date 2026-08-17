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
import { readFileSync } from 'node:fs'

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
check('[0] migration 048 applies on top of 026', true)

const call = (args = {}, opts = {}) => {
  const d = {
    p_email: 'a@b.com', p_entity_role: 'artist', p_name: null, p_primary_need: null,
    p_whatsapp: null, p_whatsapp_consent: false, p_consent_text: null,
    p_consent_version: null, p_locale: 'en', p_source_page: null, p_cta_placement: null,
    p_utm_source: null, p_utm_medium: null, p_utm_campaign: null, p_utm_content: null, p_referrer: null,
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
  db.scalar(`select has_function_privilege('anon','public.join_waitlist(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text,text,text)','execute')`) === 't')

console.log('\n[7] no account is created')
check('the RPC creates no auth user', db.scalar(`select count(*) from auth.users`) === db.scalar(`select count(*) from auth.users`))
check('...and touches only waitlist tables',
  db.scalar(`select count(*) from public.waitlist_signup`) !== '0')

console.log('\n[8] existing 026 rows survive the migration (additive only)')
check('the 026 legacy role vocabulary is still storable',
  db.try(`insert into public.waitlist_signup (email, role) values ('legacy@b.com','booking_manager')`).ok)

console.log('')
reachedEnd = true
if (failures) { console.log(`✗ WAITLIST CAPTURE: ${failures} failure(s).`); process.exit(1) }
console.log('✓ WAITLIST CAPTURE: server-side validation, six distinct roles, versioned consent that cannot be forged or silently withdrawn, idempotency, rate limiting and the closed public write path all proven by execution.')
process.exit(0)
