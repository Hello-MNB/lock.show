import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell, Field } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// ── Booking manager home — bookers are trust-receivers: they open a Passport
// from a link they were sent. Open marketplace/discovery is deferred
// (post-validation), so this is a light, premium entry that resolves a
// passport link or id. One dominant action. ─────────────────────────────────
export default function BookerHome() {
  const { T } = useLang()
  const nav = useNavigate()
  const [v, setV] = useState('')
  const [err, setErr] = useState('')

  function open() {
    const m = v.trim().match(/passport\/([0-9a-f-]{6,})/i)
    const id = m ? m[1] : v.trim()
    if (id) { nav(`/passport/${id}`); return }
    setErr(T.booker.pasteError)
  }

  return (
    <div className="min-h-full bg-bg">
      <PageShell max="max-w-md">
        {/* ── HERO — one field, one lime action ── */}
        <div className="relative overflow-hidden rounded-[22px] border border-line bg-surface p-7 shadow-card">
          {/* warm backstage light, purely atmospheric */}
          <div aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_-10%,rgba(242,192,99,.12)_0%,rgba(242,192,99,0)_55%)]" />
          <div className="relative">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gold">
              {T.booker.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-[26px] font-bold leading-tight text-ink">
              {T.booker.title}
            </h1>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-muted">{T.booker.subtitle}</p>

            <Field label={T.booker.inputLabel} error={err}>
              <input className="field" dir="ltr" value={v}
                onChange={(e) => { setV(e.target.value); if (err) setErr('') }}
                placeholder="lock.show/passport/…"
                onKeyDown={(e) => e.key === 'Enter' && open()} />
            </Field>
            <button
              className="btn-primary min-h-[48px] w-full shadow-[0_10px_26px_-10px_rgba(190,226,78,.6)]"
              onClick={open}
            >
              {T.booker.openCta}
            </button>
            {/* Empty-state escape hatch — a booker who arrived with no link in
                hand yet should never be stuck staring at a blank field. */}
            <p className="mt-3 text-center text-[13px] text-muted">
              {T.booker.noLinkYet}{' '}
              <Link to="/passport/demo-artist" className="font-semibold text-accent hover:underline">
                {T.booker.sampleCta}
              </Link>
            </p>
          </div>
        </div>

        {/* ── SECONDARY — what a LOCK passport is (calm, professional) ── */}
        <div className="mt-4 rounded-[22px] border border-line bg-bg2 p-7">
          <h2 className="font-display text-lg font-bold text-ink">{T.booker.whatIsTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {T.booker.whatIsBody}
          </p>
          <ul className="mt-4 grid gap-2.5">
            {T.booker.whatIsPoints.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                <span aria-hidden="true" className="mt-0.5 text-accent">✓</span>
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
            {T.authScene.disclaimer}
          </p>
        </div>
      </PageShell>
    </div>
  )
}
