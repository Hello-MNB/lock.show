import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as UI from '../../components/ui.jsx'
import { Wordmark, Loading, LanguageToggle } from '../../components/ui.jsx'
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
  const [error, setError] = useState(null) // null | 'expired' | 'invalid'
  const [sendError, setSendError] = useState(false)
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (DEMO) { setData({ ...demoConfirm }); setLoading(false); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/confirm/${token}`)
      if (!res.ok) {
        // Distinguish expired vs invalid when the API says so — never show a raw error.
        let kind = 'invalid'
        try {
          const body = await res.text()
          if (res.status === 410 || /expir/i.test(body)) kind = 'expired'
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
    if (DEMO) {
      setData((d) => ({ ...d, response: body.revoke ? d.response : body.response, revoked: !!body.revoke, responded: !body.revoke, respondedAt: new Date().toISOString() }))
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/confirm/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('failed')
      await load()
    } catch {
      // Reply failed — keep the ceremony on screen so the producer can retry.
      setSendError(true)
    } finally { setBusy(false) }
  }

  if (loading) return <div className="min-h-full bg-bg"><Loading /></div>

  // ── Dead link — graceful, never a raw error ───────────────────────────────
  if (error || !data) {
    return (
      <Shell>
        <div className="card text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface2 text-2xl text-muted" aria-hidden>⏱</span>
          <h1 className="mb-2 text-xl font-bold text-ink">
            {error === 'expired' ? T.producer.linkExpiredTitle : T.producer.linkInactiveTitle}
          </h1>
          <p className="text-sm text-muted">
            {T.producer.linkDeadBody}
          </p>
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
          <Terminal data={data} when={when} busy={busy} onRevoke={() => send({ revoke: true })} />
        ) : (
          <div className="grid gap-2">
            <button className="btn-primary w-full min-h-[48px]" disabled={busy}
              onClick={() => send({ response: 'yes' })}>
              {T.producer.confirmYes}
            </button>
            <button className="btn-ghost w-full min-h-[48px]" disabled={busy}
              onClick={() => send({ response: 'partial' })}>
              {T.producer.confirmPartial}
            </button>
            <button className="btn-ghost w-full min-h-[48px]" disabled={busy}
              onClick={() => send({ response: 'no' })}>
              {T.producer.confirmNo}
            </button>
            <button disabled={busy}
              className="min-h-[44px] w-full rounded-xl text-sm text-faint transition hover:text-muted"
              onClick={() => send({ response: 'wrong_person' })}>
              {T.producer.confirmWrongPerson}
            </button>
          </div>
        )}
      </div>

      <Footnote />
    </Shell>
  )
}

// Distinct terminal states — the ceremony ends with a clear, human close.
function Terminal({ data, when, busy, onRevoke }) {
  const { T } = useLang()
  const canRevoke = data.response === 'yes' || data.response === 'partial'
  if (data.response === 'wrong_person') {
    return (
      <div className="text-center py-2">
        <p className="mb-1 text-lg font-bold text-ink">{T.producer.wrongPersonTitle}</p>
        <p className="text-sm text-muted">{T.producer.wrongPersonBody}</p>
      </div>
    )
  }
  if (data.response === 'no') {
    return (
      <div className="text-center py-2">
        <p className="mb-1 text-lg font-bold text-ink">{T.producer.noTitle}</p>
        <p className="text-sm text-muted">{T.producer.noBody}</p>
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
      <p className="mb-4 text-center text-sm text-muted">
        {data.response === 'yes' ? T.producer.confirmedBody : T.producer.partialBody}
      </p>
      {canRevoke && (
        <button className="btn-ghost w-full" onClick={onRevoke} disabled={busy}>
          {T.producer.revoke}
        </button>
      )}
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
