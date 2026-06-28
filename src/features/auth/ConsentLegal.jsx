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
      <div className="text-center mb-6">
        <Wordmark className="justify-center mb-3" />
        <h1 className="text-xl font-bold text-soft">{T.consent.title}</h1>
        <p className="text-sm text-muted mt-1">{T.consent.subtitle}</p>
      </div>

      <ErrorNote>{error}</ErrorNote>

      <div className="space-y-3 mb-4">
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
        {/* Third-party evidence consent is now collected inline in the Evidence step. */}
        {/* Marketing (optional) */}
        <ConsentBox
          checked={marketing}
          onChange={setMarketing}
          title={T.consent.marketingTitle}
          label={T.consent.marketing}
          required={false}
        />
      </div>

      <div className="card">
        <p className="text-[11px] text-muted mb-4">{T.consent.note.replace('<PolicyLink>', T.consent.policyDraft).replace('<TosLink>', T.consent.tosDraft)}</p>
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
    <div className={`card flex items-start gap-3 transition ${checked ? 'border-accent/40' : ''}`}>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 accent-[#F0C24B]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <p className="text-sm font-semibold text-soft">
          {title}
          {required && <span className="text-accent ml-1">*</span>}
        </p>
        <p className="text-xs text-muted mt-0.5">{label}</p>
      </div>
    </div>
  )
}
