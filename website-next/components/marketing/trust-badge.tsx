// TrustBadge — shared page-system component (Codex rebuild brief §8).
// Props: method label · plain-language explanation · visibility.
// Never a score, never a gauge — a labelled statement only.

const VISIBILITY_LABELS: Record<'public' | 'private' | 'app-only', string> = {
  public: 'PUBLIC',
  private: 'PRIVATE',
  'app-only': 'APP-ONLY',
}

export function TrustBadge({
  methodLabel,
  explanation,
  visibility,
  tone = 'dark',
}: {
  methodLabel: string
  explanation?: string
  visibility?: 'public' | 'private' | 'app-only'
  tone?: 'dark' | 'light'
}) {
  const dark = tone === 'dark'
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '0.35rem',
        background: dark ? 'rgba(200,240,77,0.07)' : 'rgba(200,240,77,0.12)',
        border: '1px solid rgba(200,240,77,0.28)',
        borderRadius: '14px',
        padding: '0.7rem 1rem',
        maxWidth: '420px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: dark ? 'var(--color-stamp)' : 'var(--color-stamp-onlight)',
          }}
        >
          {methodLabel}
        </span>
        {visibility ? (
          <span
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: dark ? 'rgba(243,245,239,0.55)' : 'var(--color-tally-onlight)',
              border: dark
                ? '1px solid rgba(243,245,239,0.2)'
                : '1px solid rgba(10,13,11,0.15)',
              borderRadius: '999px',
              padding: '0.12rem 0.5rem',
            }}
          >
            {VISIBILITY_LABELS[visibility]}
          </span>
        ) : null}
      </div>
      {explanation ? (
        <p
          style={{
            fontSize: '0.85rem',
            lineHeight: 1.55,
            color: dark ? 'rgba(243,245,239,0.7)' : 'var(--color-ink)',
            margin: 0,
          }}
        >
          {explanation}
        </p>
      ) : null}
    </div>
  )
}
