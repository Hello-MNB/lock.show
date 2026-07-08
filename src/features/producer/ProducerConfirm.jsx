import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as UI from '../../components/ui.jsx'
import { Wordmark, Loading, LanguageToggle } from '../../components/ui.jsx'
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
            {error === 'expired' ? 'This link has expired' : 'This link is no longer active'}
          </h1>
          <p className="text-sm text-muted">
            Confirmation links are one-time and short-lived on purpose — ask the artist for a fresh one.
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
        One-statement confirmation
      </p>
      <h1 className="mb-2 text-center text-2xl font-bold leading-snug text-ink">
        {data.artistName} asked you to confirm one statement.
      </h1>
      <p className="mb-6 text-center text-sm text-muted">
        No account needed. Your reply applies to this statement only.
      </p>

      <div className="card">
        {/* the claim — serif quote block, gold left border */}
        <blockquote className="mb-5 border-l-4 border-gold bg-surface2 py-4 pl-5 pr-4 rounded-r-xl">
          <p className="font-display text-lg leading-relaxed text-ink">“{data.claimText}”</p>
          <p className="mt-2 text-xs text-faint">— submitted by {data.artistName}</p>
        </blockquote>

        {sendError && (
          <p role="alert" className="mb-3 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
            Couldn’t record your reply — check your connection and try again.
          </p>
        )}

        {answered ? (
          <Terminal data={data} when={when} busy={busy} onRevoke={() => send({ revoke: true })} />
        ) : (
          <div className="grid gap-2">
            <button className="btn-primary w-full min-h-[48px]" disabled={busy}
              onClick={() => send({ response: 'yes' })}>
              Yes — this is accurate
            </button>
            <button className="btn-ghost w-full min-h-[48px]" disabled={busy}
              onClick={() => send({ response: 'partial' })}>
              Partly right — needs a fix
            </button>
            <button className="btn-ghost w-full min-h-[48px]" disabled={busy}
              onClick={() => send({ response: 'no' })}>
              No — this isn’t accurate
            </button>
            <button disabled={busy}
              className="min-h-[44px] w-full rounded-xl text-sm text-faint transition hover:text-muted"
              onClick={() => send({ response: 'wrong_person' })}>
              I’m not the right person for this
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
  const canRevoke = data.response === 'yes' || data.response === 'partial'
  if (data.response === 'wrong_person') {
    return (
      <div className="text-center py-2">
        <p className="mb-1 text-lg font-bold text-ink">Thanks — no action needed.</p>
        <p className="text-sm text-muted">We won’t contact you again about this statement.</p>
      </div>
    )
  }
  if (data.response === 'no') {
    return (
      <div className="text-center py-2">
        <p className="mb-1 text-lg font-bold text-ink">Noted — your answer was recorded.</p>
        <p className="text-sm text-muted">This statement will not show as confirmed.</p>
      </div>
    )
  }
  // yes / partial — confirmed (partial is flagged for the artist to fix)
  return (
    <div className="py-1">
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-base font-black text-[#12160A]" aria-hidden>✓</span>
        <p className="text-lg font-bold text-ink">
          {data.response === 'yes' ? 'Confirmed' : 'Noted — partly right'}
        </p>
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        {data.response === 'yes'
          ? <MethodLabel variant="lime">★ Producer-confirmed</MethodLabel>
          : <MethodLabel>✎ Sent back for a fix</MethodLabel>}
        {when && <span className="font-mono text-[11px] text-faint">{fmtDate(when)}</span>}
      </div>
      <p className="mb-4 text-center text-sm text-muted">
        {data.response === 'yes'
          ? 'Your confirmation now appears on this one statement. You can revoke it at any time — nothing else changes.'
          : 'We flagged this statement for the artist to fix. It will not show as producer-confirmed as it stands.'}
      </p>
      {canRevoke && (
        <button className="btn-ghost w-full" onClick={onRevoke} disabled={busy}>
          Revoke my confirmation
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
  return (
    <p className="mt-5 text-center text-[11px] leading-relaxed text-faint">
      This confirmation refers to the specific statement above only — it is not a general
      endorsement and never becomes a score. Your name is shown as you choose.
    </p>
  )
}
