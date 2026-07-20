import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as UI from '../../components/ui.jsx'
import { Wordmark, Loading, LanguageToggle, Spinner } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { DEMO, demoConfirm } from '../../lib/demo.js'

// P1 — Producer (מפיק) claim confirmation. No login; opened from a magic link.
// Server-mediated (service role). A yes/partial reply upgrades the claim's
// method_label to 'producer-confirmed'; revoke clears it.
//
// DESIGN: this screen is a trust ceremony — one statement, one clear answer.
// Warm cinematic dark, serif quote block, gold accents. Firewall applies:
// no counts, no scores — just the statement and the reply.

// Local fallback if the shared MethodLabel export is not present in ui.jsx.
function LocalMethodLabel({ children, variant = 'gold' }) {
  const tone = variant === 'lime'
    ? 'border-accent/50 text-accent'
    : 'border-gold/50 text-gold'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] ${tone}`}>
      {children}
    </span>
  )
}
const MethodLabel = UI.MethodLabel ?? LocalMethodLabel

const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '' }
}

export default function ProducerConfirm() {
  const { T } = useLang()
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // null | 'expired' | 'used' | 'revoked' | 'invalid'
  const [sendError, setSendError] = useState(false)
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pendingKind, setPendingKind] = useState(null) // which action is in-flight: 'yes'|'partial'|'no'|'wrong_person'|'revoke'
  // §8.9 correction box (owner brief, 21 Jul): choosing "partly right" reveals a
  // small bounded inline field ("what needs correcting?") sent WITH the partial
  // response, instead of a bare partial reply with no way to say what to fix.
  const [partialOpen, setPartialOpen] = useState(false)
  const [correctionText, setCorrectionText] = useState('')
  const [submittedCorrection, setSubmittedCorrection] = useState('') // survives the post-send load() refetch (server does not echo it back yet — see send())
  const CORRECTION_MAX = 200

  async function load() {
    // DEMO build: zero network, always. Every /confirm/:token route renders the
    // same fixture ceremony from demoConfirm — the fit-inspector uses the token
    // 'demo-token' (scripts/test-fit.mjs); the in-app "generate a link" preview
    // (ClaimReview.jsx) uses 'demo-token-preview'. Neither is looked up by
    // value; DEMO short-circuits before any token comparison, same as every
    // other demo screen in this app.
    if (DEMO) { setData({ ...demoConfirm }); setLoading(false); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/confirm/${token}`)
      if (!res.ok) {
        // Distinguish WHY the link is dead — never show a raw error. Four warm,
        // safe outcomes: expired (time-based), used (a one-time link already
        // spent), revoked (the artist cancelled it), or invalid (anything else,
        // including a mistyped/unknown token). Verified against server/index.js
        // (GET/POST /api/confirm/:token): the server sends 404=invalid and
        // 410 {error:'link_expired'}=expired ONLY. Used/revoked links come back
        // 200 with {responded, revoked} payload flags and render below — a used
        // link shows its recorded receipt; a revoked link re-opens the ceremony
        // (the server's deliberate re-confirmation path). The 409/'used' and
        // 403/'revoked' branches here are unreachable defense — keep them, but
        // do not expect them to fire.
        let kind = 'invalid'
        try {
          const body = await res.text()
          if (res.status === 410 || /expir/i.test(body)) kind = 'expired'
          else if (res.status === 409 || /already[\s-]?used/i.test(body)) kind = 'used'
          else if (res.status === 403 || /revok/i.test(body)) kind = 'revoked'
        } catch { /* body unreadable — keep generic */ }
        setError(kind)
        return
      }
      setData(await res.json())
    } catch {
      setError('invalid')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  async function send(body) {
    if (busy) return
    setSendError(false)
    const kind = body.revoke ? 'revoke' : body.response
    // NOTE (server-field finding, verified server/index.js:772-852): POST
    // /api/confirm/:token destructures only { response, revoke } from req.body
    // — an extra `correction` key is dropped harmlessly (no schema validation,
    // plain express.json()), never causes a 400/500. It is sent below so the
    // wire contract is ready, but nothing server-side persists it yet — the
    // producer_confirmations table (migration 005) has no `correction` column
    // and the POST handler never reads req.body.correction. Kept client-side
    // (submittedCorrection) so THIS ceremony's own receipt can show it; a
    // follow-up migration + server write is owed to persist it for the artist's
    // Claim-review screen to read back (flagged, not built this pass).
    if (DEMO) {
      if (body.correction) setSubmittedCorrection(body.correction)
      if (body.revoke) setSubmittedCorrection('')
      setData((d) => ({ ...d, response: body.revoke ? d.response : body.response, revoked: !!body.revoke, responded: !body.revoke, respondedAt: new Date().toISOString() }))
      if (!body.revoke) { setPartialOpen(false); setCorrectionText('') }
      return
    }
    setBusy(true); setPendingKind(kind)
    try {
      const res = await fetch(`/api/confirm/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('failed')
      if (body.correction) setSubmittedCorrection(body.correction)
      if (body.revoke) setSubmittedCorrection('')
      await load()
      if (!body.revoke) { setPartialOpen(false); setCorrectionText('') }
    } catch {
      // Reply failed — keep the ceremony on screen so the producer can retry.
      // Deliberately does NOT clear partialOpen/correctionText — nothing typed
      // is lost on a failed send (§8.9 STATES: "the ceremony stays on screen").
      setSendError(true)
    } finally { setBusy(false); setPendingKind(null) }
  }

  if (loading) return <div className="min-h-full bg-bg"><Loading /></div>

  // ── Dead link — graceful, never a raw error. Four warm, safe outcomes;
  // each names what happened and offers a clear exit line — never a dead end. ──
  if (error || !data) {
    const DEAD_COPY = {
      expired: { title: T.producer.linkExpiredTitle, body: T.producer.linkExpiredBody },
      used: { title: T.producer.linkUsedTitle, body: T.producer.linkUsedBody },
      revoked: { title: T.producer.linkRevokedTitle, body: T.producer.linkRevokedBody },
      invalid: { title: T.producer.linkInactiveTitle, body: T.producer.linkDeadBody },
    }
    const copy = DEAD_COPY[error] || DEAD_COPY.invalid
    return (
      <Shell>
        <div className="card text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface2 text-2xl text-muted" aria-hidden>⏱</span>
          <h1 className="mb-2 text-xl font-bold text-ink">
            {copy.title}
          </h1>
          <p className="text-sm text-muted">
            {copy.body}
          </p>
          <p className="mt-4 text-xs text-faint">{T.producer.closeNote}</p>
        </div>
        <Footnote />
      </Shell>
    )
  }

  const answered = data.responded && !data.revoked
  const when = data.respondedAt || data.responded_at || data.updated_at

  return (
    <Shell>
      {/* framing — one person, one statement */}
      <p className="mb-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
        {T.producer.oneStatementEyebrow}
      </p>
      <h1 className="mb-2 text-center text-2xl font-bold leading-snug text-ink">
        {T.producer.askedToConfirm(data.artistName)}
      </h1>
      <p className="mb-6 text-center text-sm text-muted">
        {T.producer.noAccountNote}
      </p>

      <div className="card">
        {/* the claim — serif quote block, gold left border */}
        <blockquote className="mb-5 border-l-4 border-gold bg-surface2 py-4 pl-5 pr-4 rounded-r-xl">
          <p className="font-display text-lg leading-relaxed text-ink">“{data.claimText}”</p>
          <p className="mt-2 text-xs text-faint">{T.producer.submittedBy(data.artistName)}</p>
        </blockquote>

        {sendError && (
          <p role="alert" className="mb-3 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
            {T.producer.sendError}
          </p>
        )}

        {answered ? (
          <Terminal data={data} when={when} busy={busy} revoking={pendingKind === 'revoke'} onRevoke={() => send({ revoke: true })} correction={submittedCorrection} />
        ) : (
          <div className="grid gap-2">
            {/* Correction box open: one focus at a time — the other three
                choices step aside (same "single decision" ceremony law as the
                rest of this screen) until the producer sends or cancels. */}
            {!partialOpen && (
              <button className="btn-primary w-full min-h-[48px]" disabled={busy}
                onClick={() => send({ response: 'yes' })}>
                {pendingKind === 'yes' ? <><Spinner /> {T.common.loading}</> : T.producer.confirmYes}
              </button>
            )}

            {partialOpen ? (
              <div className="rounded-xl border border-line bg-surface2 p-3">
                <label htmlFor="pc-correction" className="mb-1 block text-sm font-semibold text-ink">
                  {T.producer.partialCorrectionLabel}
                </label>
                <p className="mb-2 text-xs text-muted">{T.producer.partialCorrectionHelper}</p>
                <textarea
                  id="pc-correction"
                  rows={3}
                  maxLength={CORRECTION_MAX}
                  value={correctionText}
                  disabled={busy}
                  placeholder={T.producer.partialCorrectionPlaceholder}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  className="field w-full resize-none"
                />
                <p className={`mt-1 text-end font-mono text-[10px] ${correctionText.length >= CORRECTION_MAX ? 'text-amber' : 'text-faint'}`}>
                  {correctionText.length}/{CORRECTION_MAX}
                </p>
                <div className="mt-2 grid gap-2">
                  <button className="btn-primary w-full min-h-[48px]" disabled={busy}
                    onClick={() => send({ response: 'partial', ...(correctionText.trim() ? { correction: correctionText.trim() } : {}) })}>
                    {pendingKind === 'partial' ? <><Spinner /> {T.common.loading}</> : T.producer.partialCorrectionSend}
                  </button>
                  <button disabled={busy}
                    className="min-h-[44px] w-full rounded-xl text-sm text-faint transition hover:text-muted"
                    onClick={() => { setPartialOpen(false); setCorrectionText('') }}>
                    {T.producer.partialCorrectionCancel}
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn-ghost w-full min-h-[48px]" disabled={busy}
                onClick={() => setPartialOpen(true)}>
                {T.producer.confirmPartial}
              </button>
            )}

            {!partialOpen && (
              <button className="btn-ghost w-full min-h-[48px]" disabled={busy}
                onClick={() => send({ response: 'no' })}>
                {pendingKind === 'no' ? <><Spinner /> {T.common.loading}</> : T.producer.confirmNo}
              </button>
            )}
            {!partialOpen && (
              <button disabled={busy}
                className="min-h-[44px] w-full rounded-xl text-sm text-faint transition hover:text-muted"
                onClick={() => send({ response: 'wrong_person' })}>
                {pendingKind === 'wrong_person' ? <span className="inline-flex items-center gap-2"><Spinner className="h-3.5 w-3.5" /> {T.common.loading}</span> : T.producer.confirmWrongPerson}
              </button>
            )}
          </div>
        )}
      </div>

      <Footnote />
    </Shell>
  )
}

// Distinct terminal states — the ceremony ends with a clear, human close.
// Every branch is a "submitted receipt": what was recorded, bounded, plus a
// closing exit line — no dead ends.
function Terminal({ data, when, busy, revoking, onRevoke, correction }) {
  const { T } = useLang()
  const canRevoke = data.response === 'yes' || data.response === 'partial'
  if (data.response === 'wrong_person') {
    return (
      <div className="text-center py-2">
        <p className="mb-1 text-lg font-bold text-ink">{T.producer.wrongPersonTitle}</p>
        <p className="text-sm text-muted">{T.producer.wrongPersonBody}</p>
        <p className="mt-4 text-xs text-faint">{T.producer.closeNote}</p>
      </div>
    )
  }
  if (data.response === 'no') {
    return (
      <div className="text-center py-2">
        <p className="mb-1 text-lg font-bold text-ink">{T.producer.noTitle}</p>
        <p className="text-sm text-muted">{T.producer.noBody}</p>
        <p className="mt-4 text-xs text-faint">{T.producer.closeNote}</p>
      </div>
    )
  }
  // yes / partial — confirmed (partial is flagged for the artist to fix)
  return (
    <div className="py-1">
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-base font-black text-[#12160A]" aria-hidden>✓</span>
        <p className="text-lg font-bold text-ink">
          {data.response === 'yes' ? T.producer.confirmedTitle : T.producer.partialTitle}
        </p>
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        {data.response === 'yes'
          ? <MethodLabel variant="lime">★ {T.methodLabel['producer-confirmed']}</MethodLabel>
          : <MethodLabel>✎ {T.producer.chipSentBack}</MethodLabel>}
        {when && <span className="font-mono text-[11px] text-faint">{fmtDate(when)}</span>}
      </div>
      <p className={`text-center text-sm text-muted ${data.response === 'partial' && correction ? 'mb-2' : 'mb-4'}`}>
        {data.response === 'yes'
          ? T.producer.confirmedBody
          : (correction ? T.producer.partialBodyWithCorrection : T.producer.partialBody)}
      </p>
      {data.response === 'partial' && correction && (
        <blockquote className="mb-4 rounded-r-xl border-l-4 border-gold/60 bg-surface2 px-3 py-2 text-start text-sm italic text-ink">
          “{correction}”
        </blockquote>
      )}
      {canRevoke && (
        <button className="btn-ghost w-full" onClick={onRevoke} disabled={busy}>
          {revoking ? <><Spinner /> {T.common.loading}</> : T.producer.revoke}
        </button>
      )}
      <p className="mt-4 text-center text-xs text-faint">{T.producer.closeNote}</p>
    </div>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-full bg-bg px-4 py-8">
      <div className="mx-auto w-full max-w-md animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <Wordmark /><LanguageToggle />
        </div>
        {children}
      </div>
    </div>
  )
}

function Footnote() {
  const { T } = useLang()
  return (
    <p className="mt-5 text-center text-[11px] leading-relaxed text-faint">
      {T.producer.footnote}
    </p>
  )
}
