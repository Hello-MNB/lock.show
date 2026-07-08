import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { recordConsentScope } from '../../lib/db.js'
import { PageShell, Wordmark, ErrorNote } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { logEvent, EVENTS } from '../../lib/analytics.js'

export default function ConsentLegal() {
  const { T } = useLang()
  const { user } = useAuth()
  const nav = useNavigate()
  const [privacy, setPrivacy] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // First gate: privacy + processing (required) before any evidence processing.
  // Third-party evidence consent is collected inline in Evidence; publish consent
  // is collected at publish time. Marketing stays optional here.
  const allRequired = privacy && processing

  async function accept() {
    if (!allRequired) { setError(T.consent.allRequired); return }
    setBusy(true)
    setError('')
    try {
      await recordConsentScope(user.id, 'privacy-policy')
      await recordConsentScope(user.id, 'data-processing')
      await recordConsentScope(user.id, 'marketing', { status: marketing ? 'accepted' : 'declined', marketing_opt_in: marketing })
      logEvent(EVENTS.CONSENT_ACCEPTED, { marketing })
      nav('/onboarding')
    } catch (e) {
      setError(e.message || T.common.error)
    } finally { setBusy(false) }
  }

  return (
    <PageShell max="max-w-md">
      <div className="mb-7 text-center">
        <Wordmark className="mb-4 justify-center" />
        <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Before we start</p>
        <h1 className="text-2xl font-bold text-ink">{T.consent.title}</h1>
        <p className="mt-1 text-sm text-muted">{T.consent.subtitle}</p>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {/* 4 visually separate blocks — each consent stands on its own, no bundling. */}
      <div className="mb-5 space-y-3">
        {/* 1. Privacy Policy (required) */}
        <ConsentBox
          checked={privacy}
          onChange={setPrivacy}
          title={T.consent.privacyTitle}
          label={T.consent.privacy}
          required
        />
        {/* 2. Data processing (required) */}
        <ConsentBox
          checked={processing}
          onChange={setProcessing}
          title={T.consent.processingTitle}
          label={T.consent.processing}
          required
        />
        {/* 3. Marketing (optional — clearly separate from the required pair) */}
        <ConsentBox
          checked={marketing}
          onChange={setMarketing}
          title={T.consent.marketingTitle}
          label={T.consent.marketing}
          required={false}
        />
        {/* 4. Consent as education (canon): the consents that arrive LATER, in
            context — an informational block, deliberately not a checkbox, so
            nothing here looks bundled into this gate. */}
        <div className="card border-dashed">
          <p className="text-sm font-semibold text-ink">
            Asked later, in context
            <span className="ms-2 rounded-full bg-surface2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">no action now</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{T.consent.contextualNote}</p>
        </div>
      </div>

      <div className="card">
        <p className="mb-4 text-[11px] leading-relaxed text-muted">{T.consent.note.replace('<PolicyLink>', T.consent.policyDraft).replace('<TosLink>', T.consent.tosDraft)}</p>
        <div className="flex gap-3">
          <button className="btn-primary flex-1" onClick={accept} disabled={!allRequired || busy}>
            {busy ? T.common.loading : T.consent.accept}
          </button>
          <button className="btn-ghost" onClick={() => nav('/login')} disabled={busy}>
            {T.consent.decline}
          </button>
        </div>
      </div>
    </PageShell>
  )
}

function ConsentBox({ checked, onChange, title, label, required }) {
  return (
    <label className={`card flex cursor-pointer items-start gap-3 transition ${checked ? 'border-accent/50' : 'hover:bg-raise'}`}>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 accent-[#BEE24E]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="block">
        <span className="block text-sm font-semibold text-ink">
          {title}
          {required
            ? <span className="ms-2 rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-accent">required</span>
            : <span className="ms-2 rounded-full bg-surface2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">optional</span>}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{label}</span>
      </span>
    </label>
  )
}
