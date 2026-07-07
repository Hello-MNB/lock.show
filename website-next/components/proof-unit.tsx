// ProofUnit — canonical evidence block.
// Renders: claim · context · method-label · reviewed-date as ONE block.
// NEVER show a bare number. NEVER omit the method label.

interface ProofUnitProps {
  claim: string          // e.g. "200–350" or "Self-managed touring"
  context: string        // e.g. "Headline capacity, Zappa Club TLV, Feb 2025"
  method: string         // e.g. "TICKET EXPORT" or "OPERATOR-REVIEWED"
  reviewed: string       // e.g. "REVIEWED OCT 2025"
  isBand?: boolean       // true → render claim as BandPill style
  note?: string          // optional secondary note (e.g. streaming disclaimer)
}

export function ProofUnit({ claim, context, method, reviewed, isBand = false, note }: ProofUnitProps) {
  return (
    <div
      style={{
        borderInlineStart: '2px solid var(--color-stamp)',
        paddingInlineStart: '1rem',
        marginBottom: '1.25rem',
      }}
    >
      {/* Claim */}
      <div
        style={{
          fontFamily: isBand ? 'var(--font-space-mono)' : 'var(--font-archivo)',
          fontSize: isBand ? '1.4rem' : '1.1rem',
          fontWeight: 700,
          color: 'var(--color-ink)',
          lineHeight: 1.2,
          marginBottom: '0.25rem',
        }}
      >
        {claim}
      </div>

      {/* Context */}
      <div
        style={{
          fontSize: '0.9rem',
          color: 'var(--color-tally)',
          marginBottom: '0.4rem',
          lineHeight: 1.4,
        }}
      >
        {context}
      </div>

      {/* Method label + reviewed date */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--color-stamp)',
            background: 'var(--lime-tint-light)',
            border: '1px solid var(--lime-tint-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.15rem 0.4rem',
          }}
        >
          {method}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-tally)',
            letterSpacing: '0.06em',
          }}
        >
          {reviewed}
        </span>
      </div>

      {/* Optional note */}
      {note && (
        <div
          style={{
            marginTop: '0.35rem',
            fontSize: '0.75rem',
            color: 'var(--color-tally)',
            fontStyle: 'italic',
          }}
        >
          {note}
        </div>
      )}
    </div>
  )
}
