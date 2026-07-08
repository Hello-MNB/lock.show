// ── Local proof-unit atoms (Live Intelligence spec) ──────────────────────────
// MethodLabel + BandPill. These mirror the shared components planned for
// src/components/ui.jsx; kept local to the artist feature so the build never
// races the Foundation agent. Firewall: a band is a bordered capsule of words,
// NEVER a bar, gauge or percentage.

// Mono uppercase, gold border/text on transparent — the method IS the message.
// The strongest label (producer-confirmed) speaks in lime.
export function MethodLabel({ label, confirmed = false }) {
  if (!label) return null
  const strong = confirmed || /producer[\s-]?confirmed/i.test(String(label))
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border bg-transparent px-2 py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${
        strong ? 'border-accent/60 text-accent' : 'border-gold/50 text-gold'
      }`}
    >
      {strong && <span aria-hidden>★</span>}
      {label}
    </span>
  )
}

// "180–300 heads" — a bounded capsule. Words and ranges only.
export function BandPill({ children }) {
  if (!children) return null
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-surface2 px-2.5 py-[3px] font-mono text-[11px] text-ink">
      {children}
    </span>
  )
}
