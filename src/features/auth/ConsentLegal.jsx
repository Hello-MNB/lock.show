import { recordConsentScope } from '../../lib/db.js'
import { useLang } from '../../context/LangContext.jsx'

// Contextual privacy + processing consent — canon "account terms at
// registration," fired INLINE as a required checkbox on the FIRST onboarding
// step, never as a full-screen wall before first value. Third-party evidence
// consent fires at connect (EvidenceCapture); public-publication consent
// fires at publish (Onboarding step 7 / ArtistDashboard / ClaimReview);
// marketing consent lives in Settings as an optional toggle — all four write
// through the SAME consent_records table via recordConsentScope below.
export default function ConsentLegal({ checked, onChange }) {
  const { T } = useLang()
  return (
    <label className="card flex cursor-pointer items-start gap-3 transition hover:bg-raise">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 accent-[#BEE24E]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="block">
        <span className="block text-sm font-semibold text-ink">
          {T.consent.inlineTitle}
          <span className="ms-2 rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-accent">required</span>
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{T.consent.inlineAgree}</span>
      </span>
    </label>
  )
}

// Records the two required scopes together — called once, when the artist
// checks the inline box and advances past onboarding step 1.
export async function recordPrivacyConsent(userId) {
  await recordConsentScope(userId, 'privacy-policy')
  await recordConsentScope(userId, 'data-processing')
}
