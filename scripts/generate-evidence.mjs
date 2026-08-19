#!/usr/bin/env node
// ============================================================
// EVIDENCE GENERATOR · scripts/generate-evidence.mjs
//
// Owner ruling (16 Aug 2026): "Generate one compact /evidence/current.json from
// tests per exact HEAD: commands/exits, gate IDs, negative tests, snapshot ID,
// independent verdict and rollback. No hand-written append-only prose."
//
// So this file records only what a run actually produced. It never asserts a
// result it did not observe, and it refuses to write a green record for a dirty
// tree — evidence pinned to a HEAD that does not describe the files on disk is
// worse than no evidence.
//
//   node scripts/generate-evidence.mjs                    → run the chain, write evidence/current.json
//   node scripts/generate-evidence.mjs --from-log <path>  → record an existing chain log
//   node scripts/generate-evidence.mjs --self-test        → prove the parser, write nothing
//
// ── M7 · WHY THE UNIT OF EVIDENCE IS THE CHAIN STEP, NOT A STRING PATTERN ────
//
// This file used to find gates by matching a regex against console lines. Every
// repair to that regex was a repair to a GUESS about how gates phrase themselves,
// and each one left a different set of gates invisible. Measured against a real
// green chain at 1091ea9 — 42 steps, 51 column-0 verdict lines:
//
//   · 43 lines matched the regex
//   ·  4 real gates were dropped for cosmetic reasons: `canon-drift:`,
//      `component-styles:` and `event-registry:` begin with a LOWERCASE id, and
//      `LANGUAGE-PURE (0 violations)` separates with a parenthesis, not a colon
//   ·  4 lines were vite build output — `✓ 160 modules transformed.`, `✓ built
//      in 5.63s`, twice each. A looser regex would have ADDED FOUR FAKE GATES,
//      which is why "just widen the pattern" is the wrong repair
//   ·  and FIVE gates had never appeared in the evidence AT ALL, on any run:
//      test:isolation, test:security, test:public-passport, test:ds and
//      test:projection-matrix print a real column-0 summary with NO leading tick
//      (`All security-denial checks passed.`, `G13 act-isolation: 17 passed, 0
//      failed`, `DS-DRIFT PASS — …`). Nothing was broken; the parser simply had
//      no model for them, and nothing ever compared the gate list to the chain.
//
// The old header promised "a gate that stops printing disappears from the
// evidence instead of being silently assumed green". It could not keep that
// promise, because it had no idea what the chain contained.
//
// It does now. The DECLARED chain is read out of package.json, the RAN steps are
// read out of the log, and one gate is recorded per declared step — so the gate
// count cannot silently disagree with the chain, whatever a gate chooses to
// print. Summary text is still captured, but it is now decoration on a step that
// is already accounted for, not the thing that decides the step exists.
// ============================================================
import { execFileSync, execSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, realpathSync, existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const OUT = 'evidence/current.json'
// Defined here, above BOTH executable blocks: the self-test block used to sit
// above this definition and therefore outside L2's protection.
const IS_ENTRYPOINT = Boolean(process.argv[1])
  && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href

// EVERY GLYPH A GATE CAN PRINT, NOT THE TWO I HAPPENED TO USE — QA-INDEP-04, H2.
// The classifier was `/^[✓✗]/` and the contradiction guard `/(^|\n)✗/`. Five of
// the 45 chain gates print their column-0 failure with `✖` (U+2716), not `✗`
// (U+2717): test-chain-closed, test-client-store, test-logical-direction,
// test-storage-resilience and test-brand-naming. The reviewer spliced the real
// failure verdict of test:chain-closed into a green log and this generator wrote
//
//     {"id":"test:chain-closed","summary":"✖ CHAIN CLOSED — 1 finding(s) …","result":"pass"}
//
// inside a record marked green-at-head — a gate whose own recorded summary says
// it found findings, classified as passing. M7 de-prosed the step verdicts and
// H3 de-prosed the chain verdict; both were done against a glyph set that was
// itself a guess. `test:evidence-parser` now DERIVES the set from the scripts, so
// a gate that adopts a sixth glyph fails the parser instead of vanishing from it.
const PASS_GLYPHS = '✓✔✅'
const FAIL_GLYPHS = '✗✖✘❌'
// GLYPHS THAT ARE DELIBERATELY NOT VERDICTS. Widening the derived scan (M2) made
// it find these, correctly: `⚠` prefixes a warning or skip line, and the bidi
// isolates appear inside RTL test strings. Neither is a pass or a fail, and the
// parser must not treat them as one — but they must be ENUMERATED, so that an
// unfamiliar glyph is still loud. A third category is the honest answer; forcing
// them into pass or fail, or narrowing the scan until it stops seeing them, would
// both be ways of not answering.
// M1 WIDENED THIS FROM WHAT REAL OUTPUT CONTAINS, NOT FROM WHAT SOURCE CONTAINS.
// The seven added here — box-drawing banners printed by the flow, security-denial
// and act gates, plus `▲ ○ ┌ ├ └` from the Next.js build step — were invisible to
// every source-based scan and appear at column 0 of a real `npm run verify` log.
// They are declared non-verdicts because that is what they are; leaving them
// unclassified would red the recorder on every clean run, and absorbing them
// silently is the H2 defect. `× ≠` are prose symbols the widened source scan
// surfaced out of template interpolation (test-ds-drift, test-tenant-isolation),
// and `\u2192` is the separator 173 source lines use after an interpolated value.
// U+0192 was added by the F2 rule on its first run against a real log: Next.js
// prints `\u0192 Proxy (Middleware)` in its route legend. It is a LETTER, which is
// exactly why the category rule could not see it, and it is a real leading marker
// in real output. One line of evidence that the structural rule is not merely a
// different guess.
const NEUTRAL_GLYPHS = '⚠\u2066\u2067\u2068\u2069\u200e\u200f·—–═─▲┌├└○×≠→\u0192\u2022'

// -- ONE NORMALISATION, SHARED BY EVERY CLASSIFIER -- QA-INDEP-07, F2 --------
// Everything below used to test raw bytes: `line[0]`, `^`, `\s*`. The reviewer
// walked past all of it with a colour escape, and not only past the glyph scan --
// past the LOAD-BEARING half. A gate whose summary literally read
// ESC + "[31m" + a fail glyph + " ACT STAMP: 6 failures" was recorded
// `"result": "pass"`, with an empty unknownGlyphs list and no blocking finding.
// Reproduced before it was believed. Today's chain emits no ANSI because
// spawnSync gives the steps no TTY, so this was a latent defect AND a false
// claim -- the commit said quoting, indentation and concatenation "are all
// irrelevant to it". They were not.
//
// `decorate` strips what a terminal adds and a reader ignores: ANSI CSI/OSC
// sequences, carriage returns, bidi controls, and leading whitespace. Every
// classifier now decides on that form, so a colourising reporter or a FORCE_COLOR
// in CI changes what the log LOOKS like and nothing about what it MEANS.
// The ESC byte is the whole point and my first version omitted it, matching the
// PAYLOAD without its introducer -- so the escapes survived and the reviewer's
// case still walked through. Caught by re-running the reproduction rather than
// by re-reading the regex. CSI, OSC (both terminators) and two-byte Fe forms.
// EVERY SPELLING OF "DECORATION", not the three I happened to think of --
// QA-INDEP-08, M4. The previous version stripped ESC-introduced sequences, \r and
// bidi, and SIX further spellings still recorded a genuine failure as a pass:
// a variation selector (U+FE0F/U+FE0E) or a combining mark after the glyph, a
// zero-width space before it, the 8-bit CSI (U+009B), and an unterminated OSC.
// Each is invisible to a reader and each defeated the parser silently -- the same
// defect QA-INDEP-07 found, four times over.
// TERMINATED SEQUENCES ONLY. My first attempt ended the OSC branch with `$`,
// which made the lazy match swallow the entire rest of the line -- including the
// verdict on it. That is `decorate` DESTROYING content, the failure mode the
// reviewer asked about by name, and it turned a genuine failure into silence
// rather than into a pass. An unterminated escape is now left in place and
// reported below, because a line whose display cannot be determined must not be
// classified as anything. The 8-bit CSI (U+009B) replaces `ESC [`, and the `\[?`
// tolerates the redundant bracket a hand-written case may carry.
// `]` IS EXCLUDED FROM THE TWO-BYTE BRANCH. `[@-Z\\-_]` is the range 0x40-0x5F,
// which contains `]` (0x5D) -- so `ESC ]` matched the generic Fe form, the OSC
// introducer vanished, and an UNTERMINATED OSC left no residual escape to
// report. It silently became `0;title` + the verdict, and the verdict was then
// unreachable behind an ASCII word. Found by tracing the one case that still
// failed, not by reading the class.
const ANSI = /(?:\x1b\[|\x9b\[?)[0-9;?]*[ -\/]*[@-~]|\x1b\][\s\S]*?(?:\x07|\x1b\\)|\x1b[@-Z\\^_]/g
/** An escape introducer that survived stripping: the line's display is undetermined. */
const UNRESOLVED_ESCAPE = /[\x1b\x9b]/
// A CATEGORY, NOT A LIST -- QA-INDEP-09, M7. The previous version enumerated four
// ranges under a comment claiming "EVERY SPELLING OF DECORATION, not the three I
// happened to think of". It was still a list, and five more format characters
// walked through it, each turning a genuine failure into a silent pass:
//   U+2060 WORD JOINER · U+00AD SOFT HYPHEN · U+061C ARABIC LETTER MARK
//   U+2061 FUNCTION APPLICATION · U+180E MONGOLIAN VOWEL SEPARATOR
// The property that matters is Unicode's own: a character that is Default
// Ignorable renders as nothing, so it cannot be part of what a line MEANS.
// `\p{Cf}` covers the format class (including the bidi controls stripped
// separately below), the variation selectors need their two blocks named because
// they are Mn/Default_Ignorable rather than Cf, and U+00AD is Cf already.
// Enumerating ranges was the defect; this asks Unicode instead of me.
const INVISIBLE = /[\p{Cf}\u200b-\u200d\ufe00-\ufe0f\u{e0100}-\u{e01ef}\u180e\u2061-\u2064]/gu
const decorate = (line) => line.replace(ANSI, '').replace(INVISIBLE, '').replace(/\r/g, '')
  .replace(/^[\s‎‏⁦-⁩]+/, '')

// A MARKER IS A CHARACTER THAT STANDS ALONE, and that is a structural fact, not a
// script one. The previous scan excluded every Unicode LETTER so a Hebrew prose
// line would not be reported as an unknown verdict -- and the reviewer used
// letters that read as marks (Bopomofo U+3128, Cherokee U+13CF, Lisu U+A4D2) to
// walk straight through. Category was the wrong axis. A verdict marker is ONE
// character followed by a space; Hebrew prose opens with a WORD, whose first
// letter is followed by another letter. So the rule is now "one non-ASCII
// character, alone in its token, at the head of the line" -- no list of scripts,
// nothing to keep up to date.
//
// A NON-LETTER ASCII PREFIX IS ALLOWED BEFORE IT. "[3/9] <glyph> GATE X" and
// "- <glyph> GATE X" are both a marker with a counter or a bullet in front, and
// both were invisible. Letters are NOT allowed in that prefix, so a line like
// "the guard sees <glyph> as a violation" is prose and stays prose.
// TWO RULES, BECAUSE THEY ANSWER DIFFERENT QUESTIONS -- M4.
// `leadGlyph` asks "what character does this line lead with", and NOTHING about
// what follows it. `leadMarker` adds the "alone in its token" test, which exists
// only to keep Hebrew prose out of the UNKNOWN scan.
//
// Collapsing the two was the defect. A known PASS or FAIL glyph is drawn from a
// hand-curated set -- it is never a letter inside a word -- so whether a combining
// mark or a variation selector follows it cannot change what it asserts. Making
// the load-bearing FAIL detection depend on a trailing space meant one invisible
// codepoint turned a reported violation into a silent pass.
const LEAD_GLYPH = /^[\s\d[\]()\/.,:;#*+|>-]*([^\s\x00-\x7f])/u
/** The character a line leads with, after decoration. Says nothing about what follows. */
const leadGlyph = (line) => LEAD_GLYPH.exec(decorate(line))?.[1] ?? null
/** …and the same character only when it stands alone as a token. */
const leadMarker = (line) => {
  const d = decorate(line)
  const m = LEAD_GLYPH.exec(d)
  if (!m) return null
  // Combining marks belong to the character they decorate, so skip them before
  // asking whether the token ended.
  const rest = d.slice(m.index + m[0].length).replace(/^\p{M}+/u, '')
  return rest === '' || /^\s/.test(rest) ? m[1] : null
}

const VERDICT = (line) => {
  const g = leadGlyph(line)
  return g !== null && `${PASS_GLYPHS}${FAIL_GLYPHS}`.includes(g)
}
// INDENTED FAILURES COUNT TOO (QA-INDEP-04, M5). The guard was column-0 only, so a
// log whose sole marker was `  ✗ C2 …: uppercase LOCK.SHOW outside an approved
// lockup` was accepted with --exit 0. A sub-check failure is still a reported
// violation; the register said "a log containing a ✗" and meant something narrower.
const FAIL_AT_COL0 = (log) => log.split('\n').some((l) => {
  const g = leadGlyph(l)
  return g !== null && FAIL_GLYPHS.includes(g)
})
const isFail = (line) => {
  const g = leadGlyph(line)
  return g !== null && FAIL_GLYPHS.includes(g)
}
const sh = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim()

// Build tools print their own ticks. These are NOT gate verdicts, and recording
// them would inflate the count with lines that assert nothing about the product.
// An explicit, documented list: anything NOT matched here and NOT attributable is
// reported as unclassified and fails the run, so new tool output is never
// silently absorbed.
const TOOL_OUTPUT = [
  new RegExp(`^[${PASS_GLYPHS}${FAIL_GLYPHS}]\\s+\\d+\\s+modules transformed\\.`),   // vite
  new RegExp(`^[${PASS_GLYPHS}${FAIL_GLYPHS}]\\s+built in [\\d.]+m?s`),                 // vite
]

/** The chain exactly as package.json declares it — the only authority on what
 *  "the full chain" means. Split on && so a step can never be miscounted. */
export function declaredChain(pkgJson) {
  const verify = JSON.parse(pkgJson).scripts.verify
  return verify.split('&&').map((s) => s.trim()).filter(Boolean).map((cmd) => ({
    cmd,
    // Only `npm run X` prints a `> gigproof@0.1.0 X` header. A raw `node …` step
    // prints nothing identifying, so its output lands inside the previous step's
    // block; it is still a declared step and is still counted.
    step: /^npm run (\S+)$/.exec(cmd)?.[1] ?? null,
  }))
}

const SUBCHECK_ID = /^[A-Z]\d+(?:-[A-Z]?\d+)?$/
/** A verdict line's display id, when it has one. Decoration, not identity. */
function summaryId(line) {
  const m = new RegExp(`^[${PASS_GLYPHS}${FAIL_GLYPHS}]\\s+([A-Za-z][A-Za-z0-9 ·/\\-+]*?)(?::|\\s[—–]\\s|\\s\\()`).exec(line)
  return m ? m[1].trim() : null
}

/**
 * Attribute every line of a chain log to the step that printed it, then record
 * ONE gate per DECLARED step. A step's result comes from chain progression, not
 * from its prose: `&&` means a step that was followed by another step passed,
 * and the last step's result is the chain's exit code.
 */
export function parseChain(log, declared, exitCode) {
  const lines = log.split('\n')
  const blocks = []          // { step, lines[] } in the order they ran
  let cur = { step: null, lines: [] }
  for (const line of lines) {
    const h = /^> gigproof@[\d.]+ (\S+)/.exec(line)
    if (h) { if (cur.step || cur.lines.length) blocks.push(cur); cur = { step: h[1], lines: [] }; continue }
    cur.lines.push(line)
  }
  blocks.push(cur)

  const ranSteps = blocks.map((b) => b.step).filter(Boolean)
  const verdictLines = []
  for (const b of blocks) {
    for (const l of b.lines) {
      if (VERDICT(l)) verdictLines.push({ step: b.step, line: l })
    }
  }

  const gates = []
  const stepsNotRun = []
  for (const [i, d] of declared.entries()) {
    // The umbrella script itself is the chain, not a step within it.
    if (d.cmd === 'npm run verify') continue
    // A raw command prints no header, so its execution must be inferred from
    // POSITION — QA-INDEP-03, M2. The first version asked `ranSteps.length > 0`,
    // i.e. "it ran iff ANY step ran", which is true by construction on every
    // non-empty log. The reviewer executed a log where the chain died at step 2
    // of 43 and the raw step at position 38 was still recorded as a PASSING gate
    // and was structurally absent from `stepsNotRun` — the very list the register
    // calls "the ratchet". With `&&`, a step ran iff the chain reached the step
    // AFTER it; if it is last, iff the step before it ran and the chain exited 0.
    const nextHeadered = declared.slice(i + 1).find((x) => x.step !== null)
    const prevHeadered = declared.slice(0, i).reverse().find((x) => x.step !== null)
    const ran = d.step !== null
      ? ranSteps.includes(d.step)
      : nextHeadered
        ? ranSteps.includes(nextHeadered.step)
        : Boolean(prevHeadered && ranSteps.includes(prevHeadered.step) && exitCode === 0)
    if (!ran) { stepsNotRun.push(d.cmd); continue }
    const block = d.step === null ? null : blocks.find((b) => b.step === d.step)
    const own = block ? block.lines.filter((l) => VERDICT(l) && !TOOL_OUTPUT.some((r) => r.test(l))) : []
    // A GATE THAT PRINTS NO TICK STILL SAYS SOMETHING — QA-INDEP-03, L3. Counting
    // the step was the fix; recording `summary: null` for the five gates this
    // increment exists to rescue left the register's word "recorded" stronger than
    // the artifact. Their real summaries — "All security-denial checks passed.",
    // "G13 act-isolation: 17 passed, 0 failed", "DS-DRIFT PASS — …" — are the
    // evidence, so fall back to the block's LAST non-blank column-0 line, which is
    // where a suite prints its verdict. Tool output is excluded from the fallback
    // too, so a vite line can never stand in for a gate's summary.
    const tickless = block ? block.lines.filter((l) =>
      l.trim() && !/^\s/.test(l) && !TOOL_OUTPUT.some((r) => r.test(l)) && !/^> /.test(l)) : []
    const summaryLine = own[0] ?? tickless[tickless.length - 1] ?? null
    const failed = own.some(isFail)
    const isLast = i === declared.length - 1
    gates.push({
      id: (own.map(summaryId).find(Boolean)) || d.step || d.cmd,
      step: d.step ?? d.cmd,
      // A step with no printable summary is recorded anyway — that is the whole
      // point. `null` means "printed no column-0 verdict", never "did not run".
      summary: summaryLine ? summaryLine.trim().slice(0, 400) : null,
      result: failed ? 'fail' : (isLast && exitCode !== 0) ? 'fail' : 'pass',
    })
  }

  // NOTHING MAY BE SILENTLY DISCARDED — but be exact about what that can mean
  // now. Because gates are counted per DECLARED STEP, an unfamiliar verdict line
  // printed INSIDE a step's block cannot invent or hide a gate: the step is
  // already counted, and the line is that gate's own output. So `unclassified` is
  // deliberately narrow. It catches the one case attribution cannot explain — a
  // column-0 verdict printed OUTSIDE any step, with no id and matching no
  // documented tool pattern, which means the log is not shaped the way this
  // parser believes chain logs are shaped. That is worth failing on, and it is
  // the only thing this list claims to catch.
  const subChecks = []
  const toolOutput = []
  const unclassified = []
  for (const v of verdictLines) {
    if (TOOL_OUTPUT.some((r) => r.test(v.line))) { toolOutput.push(v.line.trim()); continue }
    const id = summaryId(v.line)
    if (id && SUBCHECK_ID.test(id)) { subChecks.push({ id, result: isFail(v.line) ? 'fail' : 'pass' }); continue }
    if (v.step && gates.some((g) => g.step === v.step)) continue   // belongs to a counted step
    if (id) continue                                               // a named verdict from an unheadered raw step
    unclassified.push(v.line.trim())
  }
  // THE AUTHORITATIVE GLYPH SCAN READS OUTPUT, NOT SOURCE — QA-INDEP-06, M1.
  // The self-test below also scans the gate SOURCES, and that scan has now been
  // wrong twice in the same way: it looked for a hand-picked glyph RANGE (H2),
  // then for a hand-picked set of quoting POSITIONS (M1). Both are guesses about
  // how a `console.log` will be written, and `scripts/test-act-isolation.mjs:35`
  // proved the second one wrong — it prints `  ✔ ${name}` with two leading
  // spaces, which no position anchor in that scan could see.
  //
  // This check cannot be evaded by quoting style, indentation, concatenation or
  // interpolation, because it reads the bytes the chain actually printed. Every
  // line's first non-whitespace character, when it is a non-ASCII SYMBOL, must be
  // classifiable as pass, fail or explicitly non-verdict.
  //
  // IT CLASSIFIES BY STRUCTURE, NOT BY CHARACTER CATEGORY -- QA-INDEP-07, F2.
  // The first version excluded every Unicode letter so Hebrew prose would not be
  // reported, and the reviewer walked through with letters that read as marks. The
  // rule now lives in leadMarker(): one non-ASCII character, alone in its token,
  // at the head of a decorated line. Hebrew prose opens with a word and is still
  // silent; a Bopomofo character used as a tick is not.
  const unknownGlyphs = []
  for (const l of lines) {
    // AN UNTERMINATED ESCAPE IS ITSELF A FINDING. What such a line displays is
    // undetermined -- a terminal would swallow the rest of it, and so would any
    // stripper that guessed -- so it is reported rather than classified. Fail
    // closed: this blocks the record exactly like an unknown glyph.
    if (UNRESOLVED_ESCAPE.test(decorate(l))) {
      const esc = '\u001b'
      if (!unknownGlyphs.includes(esc)) unknownGlyphs.push(esc)
      continue
    }
    const g = leadMarker(l)
    if (g === null) continue
    if (`${PASS_GLYPHS}${FAIL_GLYPHS}${NEUTRAL_GLYPHS}`.includes(g)) continue
    if (!unknownGlyphs.includes(g)) unknownGlyphs.push(g)
  }
  return { gates, ranSteps, stepsNotRun, subChecks, toolOutput, unclassified, unknownGlyphs }
}

// "Nothing was skipped." is a chain ASSERTION, not a skip — counting it would
// report a skip on exactly the runs that prove there were none. Likewise
// "✓ S3 … (fail closed, never skipped)" is a gate asserting it never skips.
export function parseSkips(log) {
  return log.split('\n')
    .filter((l) => /SKIPPED|did not run|UNPROVEN in this run/i.test(l))
    .filter((l) => !/nothing was skipped/i.test(l))
    .filter((l) => !/^\s*✓/.test(l))
    .map((l) => l.trim())
}

// ── SELF-TEST ───────────────────────────────────────────────────────────────
// This generator is in no verification chain, so nothing has ever executed its
// parser except a human reading it. The fixtures below run it against logs whose
// correct answer is known, and `npm run verify` runs this mode. A parser that
// decides what the evidence says must itself be evidence.
// GUARDED LIKE THE RECORDER (QA-INDEP-04, M5). L2 moved the record-a-run block
// behind an entrypoint check so importing the parser stops running the chain, but
// left this block above it — an importer passing --self-test in argv would still
// run and `process.exit`. Cheap to close, and the asymmetry was the finding.
if (IS_ENTRYPOINT && process.argv.includes('--self-test')) {
  let bad = 0
  const t = (name, cond, detail = '') => {
    if (cond) console.log(`  PASS  ${name}`)
    else { bad++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
  }
  const pkg = (verify) => JSON.stringify({ scripts: { verify } })

  console.log('\nEVIDENCE PARSER — self-test')

  // 1 · a gate that prints NO tick is still recorded. This is the exact class of
  //     defect that hid five gates: they pass, they print, they had no ✓.
  {
    const d = declaredChain(pkg('npm run a && npm run b'))
    const log = '> gigproof@0.1.0 a\nAll security-denial checks passed.\n\n> gigproof@0.1.0 b\n✓ B GATE: fine\n'
    const r = parseChain(log, d, 0)
    t('a tickless gate is still counted', r.gates.length === 2, `${r.gates.length} gate(s)`)
    // Was `summary === null`. L3 changed that deliberately: leaving the summary
    // empty for exactly the gates this parser exists to rescue made "recorded"
    // a stronger word than the artifact deserved.
    t('...and is marked pass, carrying its own tickless verdict line',
      r.gates[0].result === 'pass' && r.gates[0].summary === 'All security-denial checks passed.',
      JSON.stringify(r.gates[0]))
  }

  // 2 · lowercase ids and the parenthesis form are gates, not noise.
  {
    const d = declaredChain(pkg('npm run a && npm run b'))
    const log = '> gigproof@0.1.0 a\n✓ canon-drift: in sync\n\n> gigproof@0.1.0 b\n✓ LANGUAGE-PURE (0 violations)\n'
    const r = parseChain(log, d, 0)
    t('a lowercase-id summary is captured', r.gates[0].id === 'canon-drift', r.gates[0].id)
    t('a parenthesis-separated summary is captured', r.gates[1].id === 'LANGUAGE-PURE', r.gates[1].id)
  }

  // 3 · build-tool ticks are NOT gates. A looser regex would have added four.
  {
    const d = declaredChain(pkg('npm run build'))
    const log = '> gigproof@0.1.0 build\n✓ 160 modules transformed.\n✓ built in 5.63s\n'
    const r = parseChain(log, d, 0)
    t('vite output is classified as tool output, not a gate',
      r.gates.length === 1 && r.toolOutput.length === 2, `${r.gates.length} gate(s), ${r.toolOutput.length} tool line(s)`)
    t('...and the build step is still counted once', r.gates[0].step === 'build')
  }

  // 4 · THE ONE THAT MATTERS: a declared step that never ran is reported, and is
  //     never quietly treated as green.
  {
    const d = declaredChain(pkg('npm run a && npm run b && npm run c'))
    const log = '> gigproof@0.1.0 a\n✓ A: ok\n\n> gigproof@0.1.0 c\n✓ C: ok\n'
    const r = parseChain(log, d, 0)
    t('a declared step missing from the log is reported', r.stepsNotRun.includes('npm run b'),
      JSON.stringify(r.stepsNotRun))
    t('...and it is NOT recorded as a passing gate', !r.gates.some((g) => g.step === 'b'))
  }

  // 5 · a failing step is a failing gate.
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('> gigproof@0.1.0 a\n✗ A GATE: violations above.\n', d, 1)
    t('a ✗ summary records the gate as fail', r.gates[0].result === 'fail')
  }

  // 6 · the last step inherits the chain exit code even when it prints nothing.
  {
    const d = declaredChain(pkg('npm run a && npm run b'))
    const r = parseChain('> gigproof@0.1.0 a\n✓ A: ok\n\n> gigproof@0.1.0 b\nsilent crash\n', d, 1)
    t('a silent final step under a non-zero exit is recorded as fail',
      r.gates[1].result === 'fail', JSON.stringify(r.gates[1]))
  }

  // 7 · a verdict printed before any step header cannot be attributed, so it is
  //     surfaced rather than swallowed. Scope note: a stray line INSIDE a step's
  //     block is that step's own output and is correctly absorbed — verified
  //     below so the narrowness is a measured claim, not an assumption.
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('✓ ???\n> gigproof@0.1.0 a\n✓ A: ok\n', d, 0)
    t('a verdict printed OUTSIDE any step is reported as unclassified',
      r.unclassified.length === 1, JSON.stringify(r.unclassified))
  }

  // 7b · the scope of check 7, stated by measurement: the SAME line inside a
  //      step's block is absorbed by that step and creates no extra gate.
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('> gigproof@0.1.0 a\n✓ A: ok\n✓ ???\n', d, 0)
    t('...while the same line inside a step block is absorbed, not counted twice',
      r.unclassified.length === 0 && r.gates.length === 1,
      `${r.unclassified.length} unclassified, ${r.gates.length} gate(s)`)
  }

  // 8 · sub-checks stay sub-checks; conflating them inflated the gate count.
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('> gigproof@0.1.0 a\n✓ S3 — something\n✓ A GATE: ok\n', d, 0)
    t('a sub-check id is not promoted to a gate',
      r.gates.length === 1 && r.subChecks.length === 1, `${r.gates.length}/${r.subChecks.length}`)
  }

  // 8b · A RAW (non-`npm run`) STEP IS JUDGED BY POSITION — QA-INDEP-03, M2. The
  //      old rule was "it ran iff ANY step ran", true by construction, so the one
  //      raw command in `verify` was recorded as a passing gate on every log and
  //      could never appear in `stepsNotRun`. No fixture had ever placed a raw
  //      command in a truncated chain, which is why the battery missed it.
  {
    const d = declaredChain(pkg('npm run a && node scripts/x.mjs --check && npm run c'))
    const died = parseChain('> gigproof@0.1.0 a\n✓ A: ok\n', d, 1)
    t('a raw step is NOT counted when the chain died before it',
      died.stepsNotRun.includes('node scripts/x.mjs --check') && !died.gates.some((g) => g.step.startsWith('node ')),
      JSON.stringify(died.stepsNotRun))
    const ok2 = parseChain('> gigproof@0.1.0 a\n✓ A: ok\n\n> gigproof@0.1.0 c\n✓ C: ok\n', d, 0)
    t('...and IS counted when the step after it ran',
      ok2.gates.some((g) => g.step === 'node scripts/x.mjs --check') && ok2.stepsNotRun.length === 0,
      JSON.stringify(ok2.stepsNotRun))
  }

  // 8c · a tickless gate's own verdict line is captured, not discarded (L3).
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('> gigproof@0.1.0 a\n  some detail\nAll security-denial checks passed.\n', d, 0)
    t('a tickless gate\'s summary is recorded, not left null',
      r.gates[0].summary === 'All security-denial checks passed.', JSON.stringify(r.gates[0]))
  }

  // 8d · tool output can never stand in as a gate's summary (L3 + Q3 together).
  {
    const d = declaredChain(pkg('npm run build'))
    const r = parseChain('> gigproof@0.1.0 build\nvite v5\n✓ 160 modules transformed.\n✓ built in 5.63s\n', d, 0)
    t('vite output is not promoted to a summary by the tickless fallback',
      r.gates[0].summary === 'vite v5', JSON.stringify(r.gates[0]))
  }

  // 8e · A `✖` FAILURE IS A FAILURE (QA-INDEP-04, H2), in both the step verdict
  //      and the chain contradiction guard.
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('> gigproof@0.1.0 a\n✖ CHAIN CLOSED — 1 finding(s) of 22 checks:\n', d, 1)
    t('a ✖ verdict records the gate as FAIL, not pass',
      r.gates[0].result === 'fail', JSON.stringify(r.gates[0]))
    t('...and the contradiction guard sees ✖ as a violation',
      FAIL_AT_COL0('> x\n✖ CHAIN CLOSED — 1 finding(s):\n'))
  }

  // 8e2 · THE OUTPUT SCAN — the check the source scan keeps failing to be. Every
  //       case the reviewer listed against 8f is exercised here against LOG TEXT,
  //       because that is what the chain actually produces.
  {
    const d = declaredChain(pkg('npm run a'))
    // CONSTRUCTED, NOT WRITTEN. Spelled as a literal or a `\\u` escape, this
    // fixture glyph would be picked up by the source scan below as a glyph this
    // file emits — which it does not; it is the defect these fixtures inject.
    const UNK = String.fromCodePoint(0x26d4)
    const HE = [0x05d1, 0x05d3, 0x05d9, 0x05e7, 0x05d4].map((c) => String.fromCodePoint(c)).join('')
    const run = (body) => parseChain(`> gigproof@0.1.0 a\n${body}\n`, d, 0).unknownGlyphs
    t('an INDENTED unknown glyph is seen — the exact case the position anchor missed',
      run('  ' + UNK + ' GATE X: 3 failures').join('') === UNK, JSON.stringify(run('  ' + UNK + ' x')))
    t('...and one at column 0 too', run(UNK + ' GATE X').join('') === UNK)
    t('...and a bidi-wrapped one, which Hebrew gate lines really do emit',
      run('\u2066' + UNK + ' ' + HE).join('') === UNK, JSON.stringify(run('\u2066' + UNK + ' x')))
    t('...while a line opening in Hebrew is prose, not an unknown marker',
      run(HE + ' ' + HE).length === 0, JSON.stringify(run('\u05d1\u05d3\u05d9\u05e7\u05d4')))
    t('...and the declared verdict and non-verdict glyphs stay silent',
      run('\u2713 A: fine\n  \u2718 B: not fine\n\u2500\u2500 banner \u2500\u2500\n\u25b2 Next.js 16').length === 0,
      JSON.stringify(run('\u2713 A\n\u2500\u2500 b \u2500\u2500')))
    t('...and each unknown is reported once, not once per line',
      run([UNK + ' one', UNK + ' two', UNK + ' three'].join('\n')).length === 1)
    // The real log this increment was measured against, as a fixture: the seven
    // glyphs added to NEUTRAL came from here, and if any is dropped this reds.
    t('...and a real chain banner set classifies clean',
      run('\u2550\u2550 FLOW CONTRACT GATE \u2550\u2550\n\u00b7 F1 route table parsed\n\u250c \u25cb /\n\u251c \u25cb /_not-found\n\u2514 \u25cb /waitlist').length === 0,
      JSON.stringify(run('\u2550\u2550 x\n\u250c y')))
  }

  // 8e3 · DECORATION MUST NOT CHANGE A VERDICT -- QA-INDEP-07, F2. Every case the
  //       reviewer used, against log text, including the load-bearing half: a
  //       genuine failure wearing a colour escape must still be recorded FAIL.
  {
    const d = declaredChain(pkg('npm run a'))
    const run = (body) => parseChain(`> gigproof@0.1.0 a\n${body}\n`, d, 0)
    const glyphs = (body) => run(body).unknownGlyphs
    const UNK = String.fromCodePoint(0x26d4)
    const ESC = String.fromCodePoint(27)
    const RED = ESC + '[31m'
    const OFF = ESC + '[0m'
    const FAILG = String.fromCodePoint(0x2717)
    t('an ANSI-coloured unknown marker is seen',
      glyphs(RED + UNK + ' GATE X' + OFF).join('') === UNK, JSON.stringify(glyphs(RED + UNK + ' x' + OFF)))
    t('...and one behind an ASCII counter prefix', glyphs('[3/9] ' + UNK + ' GATE X').join('') === UNK)
    t('...and one behind a bullet', glyphs('- ' + UNK + ' GATE X').join('') === UNK)
    t('...and one behind a carriage return', glyphs('\r' + UNK + ' GATE X').join('') === UNK)
    // Category was the wrong axis: these are LETTERS that read as marks.
    for (const [name, cp] of [['Bopomofo', 0x3128], ['Cherokee', 0x13cf], ['Lisu', 0xa4d2]]) {
      const g = String.fromCodePoint(cp)
      t(`...and a ${name} letter used as a tick is not prose`, glyphs(g + ' GATE X').join('') === g)
    }
    t('...while a Hebrew WORD still is prose, which is what the letter rule was protecting',
      glyphs('בדיקה עברה').length === 0)
    t('...and a marker inside prose is not a marker',
      glyphs('the guard sees ' + UNK + ' as a violation').length === 0)
    // THE LOAD-BEARING HALF. This is the one that mattered: a coloured genuine
    // failure was recorded "pass" with no blocking finding of any kind.
    const coloured = run(RED + FAILG + ' ACT STAMP: 6 failures' + OFF)
    t('a COLOURED failure line still records the gate as fail',
      coloured.gates[0].result === 'fail', JSON.stringify(coloured.gates[0]))
    t('...and the contradiction guard sees it too',
      FAIL_AT_COL0('> x\n' + RED + FAILG + ' CHAIN CLOSED' + OFF + '\n'))
    t('...and behind an ASCII prefix as well',
      FAIL_AT_COL0('> x\n[3/9] ' + FAILG + ' CHAIN CLOSED\n'))
  }

  // 8e4 · DECORATION, EVERY SPELLING -- QA-INDEP-08, M4. Six of these recorded a
  //       genuine failure as a PASS after the F2 repair, with an empty
  //       unknownGlyphs list and no blocking finding: the same defect QA-INDEP-07
  //       found, in spellings I had not thought of. They are fixtures now.
  {
    const d = declaredChain(pkg('npm run a'))
    const run = (body) => parseChain(`> gigproof@0.1.0 a\n${body}\n`, d, 0)
    const FAILG = String.fromCodePoint(0x2717)
    const ESC = String.fromCodePoint(27)
    const CSI8 = String.fromCodePoint(0x9b)
    const cases = [
      ['a variation selector (emoji presentation)', FAILG + String.fromCodePoint(0xfe0f)],
      ['a variation selector (text presentation)', FAILG + String.fromCodePoint(0xfe0e)],
      ['a combining mark', FAILG + String.fromCodePoint(0x301)],
      ['a zero-width space in front', String.fromCodePoint(0x200b) + FAILG],
      ['an 8-bit CSI colour', CSI8 + '[31m' + FAILG],
    ]
    for (const [name, lead] of cases) {
      const r = run(lead + ' ACT STAMP: 6 failures')
      t(`a failure behind ${name} is still recorded as fail`, r.gates[0].result === 'fail', JSON.stringify(r.gates[0]))
      t(`...and the contradiction guard sees it behind ${name}`,
        FAIL_AT_COL0('> x\n' + lead + ' CHAIN CLOSED\n'))
    }
    // AN UNTERMINATED ESCAPE IS NOT CLASSIFIED AT ALL. What it displays is
    // undetermined, so it blocks the record instead of being called pass or fail.
    const osc = run(ESC + ']0;title' + FAILG + ' ACT STAMP: 6 failures')
    t('an unterminated OSC is REPORTED rather than classified, so the record is refused',
      osc.unknownGlyphs.includes(ESC), JSON.stringify(osc.unknownGlyphs))
    // …and decoration must not destroy a line it cannot fully resolve.
    t('...and the line it appears on is not swallowed — decorate() strips, it does not eat',
      run(ESC + ']0;t' + FAILG + ' X').gates[0].summary.includes('X'))
  }

  // 8f · THE SET IS DERIVED FROM THE SCRIPTS, NOT HAND-LISTED. This is the check
  //      that would have caught H2 on the day `✖` was introduced: every glyph any
  //      chain gate actually prints at column 0 must be classifiable. A gate that
  //      adopts a sixth glyph fails here instead of disappearing from the record.
  {
    // SCOPED TO THE CHAIN, because the contract is about gates the evidence
    // records. On its first run this check flagged ✅ (U+2705) — real, and used
    // only by e2e-live.mjs and the seed scripts, none of which are in `verify`.
    // A non-chain script's glyph choice must not red the parser; a chain gate's
    // must. (✅ is in PASS_GLYPHS anyway: a broader set costs nothing.)
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts
    const files = declaredChain(readFileSync('package.json', 'utf8'))
      .map((d) => (d.step ? scripts[d.step] : d.cmd) ?? '')
      .flatMap((cmd) => [...cmd.matchAll(/(scripts\/[\w.-]+\.mjs)/g)].map((m) => m[1]))
      .filter((f, i, a) => a.indexOf(f) === i && existsSync(f))
    const used = new Set()
    for (const f of files) {
      // ANY leading non-ASCII glyph, in ANY quoting position — QA-INDEP-05, M2.
      // The first version matched a hand-picked range `[\u2713-\u2718\u274c\u2705]`
      // after `^`, `\n`, a backtick or a single quote. The reviewer got past it
      // three ways: a DOUBLE-quoted string, a `\u` escape, and any glyph outside
      // the range — so `console.log("⛔ GATE X: 3 failures")` was invisible to the
      // check AND unclassifiable by the parser, which is H2 reproduced one level
      // up. A scan whose job is to find UNKNOWN glyphs must not be told in advance
      // which glyphs to look for.
      // COMMENT LINES STRIPPED FIRST. A glyph in a comment is not printed, and the
      // widened scan proved it on this very file: it flagged `⛔` out of the
      // comment above that QUOTES the reviewer's example. It also flagged U+0590
      // and U+05FF, which are the endpoints of the Hebrew RANGE in
      // test-client-store.mjs:242 — a character class, not a glyph anyone emits.
      // Both are the scan reading source rather than output; neither is a real
      // unknown, and absorbing them into the neutral list would have hidden the
      // next real one.
      // TRAILING COMMENTS STRIPPED TOO. Full-line comments were already dropped;
      // `const routes = new Map() // path \u2192 { … }` is not, and once the anchor
      // below stopped demanding the glyph sit flush against a quote, that arrow
      // surfaced as an "unknown glyph" nothing ever prints. `//` preceded by a
      // colon or a quote is left alone so a URL is not truncated mid-string.
      const src = readFileSync(f, 'utf8').split('\n')
        .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
        .map((l) => l.replace(/(?<![:'"`\\])\/\/.*$/, ''))
        .join('\n')
      // THE POSITION ANCHOR WAS THE SECOND GUESS AND IT WAS ALSO WRONG — M1.
      // H2's fix stopped hand-picking a glyph RANGE; it kept hand-picking the
      // POSITIONS a glyph may occupy, and `  \u2714 ${name}` — two leading spaces,
      // test-act-isolation.mjs:35 — occupies none of them. Indentation and
      // template interpolation are now both allowed before the glyph. This scan
      // is deliberately the SECOND line of defence: the authoritative check in
      // parseChain reads the chain's real output, where quoting cannot hide
      // anything. This one exists to fail at edit time rather than at run time.
      for (const m of src.matchAll(/(?:^|\\n|['"`}])[ \t]*([^\s\x00-\x7f])\s/gu)) used.add(m[1])
      // …and the escaped spelling, excluding escapes that are RANGE endpoints.
      // LOOKAROUNDS, not capture groups. Both endpoints of a character range must
      // be skipped — `[\u0590-` opens one, `-\u05FF]` closes it — and a capturing
      // version CONSUMED the `-` on the first match, so the second endpoint saw an
      // empty prefix and stayed "unknown". Excluding one end of a pair is the same
      // half-a-fix this session keeps finding elsewhere; a lookaround consumes
      // nothing, so each endpoint is judged on its own context.
      for (const m of src.matchAll(/(?<![[-])\\u\{?([0-9a-fA-F]{4,6})\}?(?!-)/g)) {
        const cp = parseInt(m[1], 16)
        // SAME CATEGORY RULE AS THE OUTPUT SCAN. A `\\u05d1` escape is a Hebrew
        // LETTER — the i18n gates spell fixtures that way — and a letter is never
        // a verdict marker. Without this the scan reports prose as an unknown
        // verdict glyph, which is noise the next real unknown would hide behind.
        const ch = cp > 0x7f ? String.fromCodePoint(cp) : ''
        if (ch && !/[\p{L}\p{N}\p{M}]/u.test(ch)) used.add(ch)
      }
    }
    // A CHARACTER `decorate` STRIPS CAN NEVER BE A LEADING MARKER, so it is not an
    // unknown one. This scan reads SOURCE, and M4 added U+FEFF and the variation
    // selectors to this file's own INVISIBLE class — which the escape-scan then
    // reported as a glyph the chain prints. Filtering by what the parser itself
    // removes is the general form of that, not a special case for one codepoint.
    const unknown = [...used]
      .filter((g) => decorate(g) !== '')
      .filter((g) => !`${PASS_GLYPHS}${FAIL_GLYPHS}${NEUTRAL_GLYPHS}`.includes(g))
    t(`every leading glyph printed by the ${files.length} gate scripts in the chain is classifiable as pass, fail or explicitly non-verdict`,
      unknown.length === 0, `unclassified glyph(s): ${unknown.map((g) => `${g} (U+${g.codePointAt(0).toString(16).toUpperCase()})`).join(', ')}`)
    t('...and the scan actually found glyphs, so it is not vacuous',
      used.size >= 2, `found ${[...used].join('')}`)
  }

  // 9 · non-vacuity: the fixtures above must exercise a real declared chain.
  {
    const real = declaredChain(readFileSync('package.json', 'utf8'))
    t('the real package.json chain parses to many steps', real.length >= 30, `${real.length} steps`)
    t('...and every step is either `npm run X` or a raw command, none empty',
      real.every((d) => d.cmd.length > 0), JSON.stringify(real.filter((d) => !d.cmd.length)))
  }

  console.log('')
  if (bad) { console.log(`✗ EVIDENCE PARSER: ${bad} failure(s).`); process.exit(1) }
  console.log('✓ EVIDENCE PARSER: one gate per declared chain step, tickless and lowercase summaries captured, build-tool output excluded, a step that did not run reported rather than assumed green, and no column-0 verdict silently discarded.')
  process.exit(0)
}

// ── RECORD A RUN ────────────────────────────────────────────────────────────
// ENTRYPOINT GUARD (QA-INDEP-03, L2). `declaredChain`/`parseChain`/`parseSkips`
// are exported so a future gate can reuse them, but this block was top-level and
// unguarded: `import { parseChain } from './generate-evidence.mjs'` RAN THE WHOLE
// CHAIN and overwrote evidence/current.json. The reviewer hit exactly that and
// had to kill it. The exports were unusable by anything.
if (IS_ENTRYPOINT) {
const head = sh('git rev-parse HEAD')
const branch = sh('git rev-parse --abbrev-ref HEAD')
// The evidence file itself is excluded: it is being written by this run, so its
// own dirtiness says nothing about whether the tree matches the recorded HEAD.
const dirty = sh('git status --porcelain').split('\n').filter(Boolean)
  .filter((l) => !l.includes('evidence/current.json'))

// THE CHAIN VERDICT IS OBSERVED, NEVER INFERRED FROM PROSE — QA-INDEP-03, H3.
// `--from-log` used to derive the exit code as `/(^|\n)✗/.test(log) ? 1 : 0`, and
// BOTH committed evidence records were written that way, so their `exitCode: 0`
// was a statement about text in a file rather than about a process. The reviewer
// built a 43-step log whose LAST step died on an unhandled exception — the shape
// a ReferenceError produces, which is precisely the class the brand increment
// celebrates catching — and this generator certified it:
//
//     ✓ wrote evidence/current.json … 43/43 declared step(s) recorded, result=green-at-head
//     last gate: {"id":"test:fit","result":"pass"}
//
// All three fail-closed guards were satisfied. The failure is realistic: a vite
// build error prints `error during build:` with no ✗, a node crash prints a stack
// trace with no ✗, and a log captured as `npm run verify > log.txt` loses every ✗
// outright, because gates print failures through console.error.
//
// M7 de-prosed the STEP verdicts and left the CHAIN verdict inferred from prose —
// the load-bearing half. `--exit` is now REQUIRED with `--from-log`: the caller
// must state the status it observed, and there is no default that quietly means
// "green".
const logIdx = process.argv.indexOf('--from-log')
const exitIdx = process.argv.indexOf('--exit')
let log = ''
let exitCode = 0
let command = 'npm run verify'
if (logIdx > -1) {
  if (exitIdx === -1 || !/^\d+$/.test(process.argv[exitIdx + 1] ?? '')) {
    console.error('✗ --from-log requires --exit <observed exit code>. Refusing to infer a chain')
    console.error('  verdict from console prose: a crashed step prints no ✗, and a stdout-only')
    console.error('  capture drops every ✗ that was printed. Pass the status you actually saw.')
    process.exit(1)
  }
  log = readFileSync(process.argv[logIdx + 1], 'utf8')
  exitCode = Number(process.argv[exitIdx + 1])
  // A ✗ in the log with a zero exit is a contradiction, not a detail: it means a
  // gate reported a violation and the chain still claimed success.
  if (exitCode === 0 && FAIL_AT_COL0(log)) {
    console.error('✗ --exit 0 was given but the log contains a ✗ verdict line — refusing to record')
    console.error('  a green result over a reported violation.')
    process.exit(1)
  }
  command = `${command} (recorded from ${process.argv[logIdx + 1]}, observed exit ${exitCode})`
} else {
  try {
    // BOTH STREAMS — QA-INDEP-04, M5. `execFileSync` returns stdout only on
    // success, and every gate prints its failures through console.error. So on a
    // zero-exit chain the contradiction guard was structurally inert, and any
    // stderr-side skip line was absent from the record. The failure branch already
    // concatenated both; the success branch did not.
    const r = spawnSync('npm', ['run', 'verify'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    log = `${r.stdout || ''}${r.stderr || ''}`
    if ((r.status ?? 1) !== 0) throw Object.assign(new Error('chain failed'), { stdout: log, stderr: '', status: r.status })
  } catch (e) {
    log = `${e.stdout || ''}${e.stderr || ''}`
    exitCode = e.status ?? 1
  }
}

const declared = declaredChain(readFileSync('package.json', 'utf8'))
const { gates, ranSteps, stepsNotRun, subChecks, toolOutput, unclassified, unknownGlyphs } = parseChain(log, declared, exitCode)
const skips = parseSkips(log)

const evidence = {
  schemaVersion: '1.1.0',
  generatedBy: 'scripts/generate-evidence.mjs',
  head,
  branch,
  treeClean: dirty.length === 0,
  dirtyFiles: dirty,
  command,
  exitCode,
  result: exitCode === 0 && dirty.length === 0 ? 'green-at-head'
    : exitCode === 0 ? 'green-but-tree-dirty (does NOT describe this HEAD)'
      : 'red',
  // One gate per DECLARED chain step, so this count cannot drift from the chain
  // whatever a gate prints. `declaredStepCount` excludes the umbrella script.
  declaredStepCount: declared.filter((d) => d.cmd !== 'npm run verify').length,
  gateCount: gates.length,
  gates,
  stepsNotRun,
  subCheckCount: subChecks.length,
  subChecks,
  toolOutput,
  unclassified,
  // Empty on every accepted record — a non-empty value blocks the write. Kept in
  // the schema so the artifact states the check ran, not merely that it passed.
  unknownGlyphs,
  skips,
  // Negative controls: gates that prove themselves by catching an injected defect.
  // Listed because a suite that has never failed is not evidence of anything.
  negativeControls: [
    { gate: 'INTEGRATION CONTRACT', mutations: ['unregistered env read', 'undeclared route', 'committed sk-ant-shaped literal', 'requireAuth stripped from POST /api/notify', 'schema drift', 'value smuggled into schema', 'token-bearing endpoint in schema'] },
    { gate: 'ACT BOUNDARY', mutations: ['stale parameter reference', 'act_id stamp dropped', 'non-default fail-closed guard removed', 'authority falls back to the URL'] },
    { gate: 'WAITLIST CAPTURE', mutations: ['client posts the revoked table', 'an offered role with no mapping', 'message overwrites instead of appending', 'the stale 16-argument overload is left installed'] },
    { gate: 'BRAND NAMING', mutations: ['bare LOCK in an OG source asset', 'a lockup allowlist entry removed'] },
    { gate: 'EVIDENCE PARSER', mutations: ['a gate that prints no tick', 'a declared step missing from the log', 'build-tool output offered as a gate'] },
  ],
  // Filled by the independent reviewer, never by the implementer.
  independentVerdict: null,
  rollback: 'Every gate and generated artifact in this record is additive. Revert by removing the named script/contract files and their package.json entries; no runtime code, migration or provider state is touched by the evidence layer itself.',
  unverified: [
    '.env.local is absent — no credential was exercised; no named-environment readiness is claimed.',
    'Reproducibility (QA-INDEP-03, M6): C5/C6 of the brand gate and the client-store freshness check assert against website-next/out, which is gitignored. `npm run build:site` is now a chain step so a fresh clone reproduces this, but the artifact itself is local build state, not something this record pins.',
    'No provider console (Supabase, Vercel, Anthropic, Resend, Google, Shopify) was inspected or mutated.',
    'Migrations 043-048 remain drafted-or-authored and NOT applied to any live environment.',
  ],
}
// VALIDATE FIRST, WRITE LAST — QA-INDEP-03, L1. The file used to be written
// before these guards ran, so a refused record still landed on disk: the process
// exited 1 while `evidence/current.json` said `green-at-head`. Anything reading
// the artifact rather than the exit status saw the claim the guard had just
// rejected. A record that fails its own completeness check must not exist.
const blocking = []
if (unclassified.length) {
  blocking.push(`${unclassified.length} column-0 verdict line(s) could not be classified — the record is incomplete:`)
  for (const l of unclassified) blocking.push(`    ${l.slice(0, 140)}`)
}
if (unknownGlyphs.length) {
  blocking.push(`${unknownGlyphs.length} leading glyph(s) in the chain output are neither pass, fail nor declared non-verdict — the parser cannot say what they assert: ${unknownGlyphs.map((g) => `${g} (U+${g.codePointAt(0).toString(16).toUpperCase()})`).join(', ')}`)
}
if (stepsNotRun.length && exitCode === 0) {
  blocking.push(`the chain exited 0 but ${stepsNotRun.length} declared step(s) never ran: ${stepsNotRun.join(', ')}`)
}
if (blocking.length) {
  for (const b of blocking) console.error(`✗ ${b}`)
  console.error(`✗ ${OUT} was NOT written — an incomplete record is worse than none.`)
  process.exit(1)
}

writeFileSync(OUT, JSON.stringify(evidence, null, 2) + '\n')
console.log(`✓ wrote ${OUT} — HEAD ${head.slice(0, 8)}, exit ${exitCode}, ${gates.length}/${evidence.declaredStepCount} declared step(s) recorded, ${skips.length} skip line(s), result=${evidence.result}`)
process.exit(0)
}
