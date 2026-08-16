import { useLang } from '../context/LangContext.jsx'
import { MANDATE_EXPIRY_CHOICES } from '../lib/mandateExpiry.js'

// ── T-103 · "How long should this last?" ────────────────────────────────────
// The one control behind `artist_access.expires_at`. Four answers, one of them
// explicitly "no end date" — endless is a CHOICE the artist makes, never the
// silent default it used to be. Shared by the artist access screen and the
// account-hub representation accordion so both write the same thing.
export default function MandateExpiryChooser({ value, onChange }) {
  const { T } = useLang()
  const a = T.artistAccess
  return (
    <div className="mb-3">
      <p className="mb-2 text-xs text-muted">{a.expiryHint}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={a.expiryLabel}>
        {MANDATE_EXPIRY_CHOICES.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={value === c}
            onClick={() => onChange(c)}
            className={`min-h-[44px] rounded-full border px-3 py-1.5 text-xs transition ${
              value === c ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-surface2 text-ink hover:border-line2'}`}>
            {a.expiryChoice[c]}
          </button>
        ))}
      </div>
    </div>
  )
}
