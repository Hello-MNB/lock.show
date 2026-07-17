// FlowStep — shared page-system component (Codex rebuild brief §8).
// Props: number · verb · short body · entity icon.
// FlowRow lays steps out horizontally on desktop, vertically on mobile
// (brief §5.8 stepper rules apply site-wide).

import type { CSSProperties, ReactNode } from 'react'

import { Icon, type IconId } from './icons'

export function FlowRow({ cols, children }: { cols: number; children: ReactNode }) {
  return (
    <div className="mk-flow" style={{ '--mk-flow-cols': cols } as CSSProperties}>
      {children}
    </div>
  )
}

export function FlowStep({
  number,
  verb,
  body,
  icon,
  tone = 'dark',
}: {
  number: string
  verb: string
  body: string
  icon: IconId
  tone?: 'dark' | 'light'
}) {
  const dark = tone === 'dark'
  return (
    <div
      className="mk-card"
      style={{
        background: dark ? 'rgba(243,245,239,0.04)' : '#ffffff',
        border: dark ? '1px solid rgba(243,245,239,0.1)' : '1px solid rgba(10,13,11,0.1)',
        padding: 'clamp(1.25rem, 2.5vw, 1.6rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.7rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: dark ? 'var(--color-stamp)' : 'var(--color-stamp-onlight)',
          }}
        >
          {number}
        </span>
        <span
          aria-hidden="true"
          style={{ color: dark ? 'rgba(243,245,239,0.5)' : 'var(--color-slate)' }}
        >
          <Icon id={icon} size={17} />
        </span>
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '1rem',
          fontWeight: 800,
          lineHeight: 1.3,
          color: dark ? 'var(--color-paper)' : 'var(--color-ink)',
          margin: 0,
        }}
      >
        {verb}
      </h3>
      <p
        style={{
          fontSize: '0.9rem',
          lineHeight: 1.6,
          color: dark ? 'rgba(243,245,239,0.6)' : 'var(--color-tally-onlight)',
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  )
}
