'use client'

/**
 * Shared renderer for legal pages (Terms / Privacy / Accessibility).
 *
 * Each route (app/terms, app/privacy, app/accessibility) supplies its own
 * bilingual content object — see e.g. app/terms/terms-content.tsx — and this
 * component handles the shared chrome: page header, draft-review notice,
 * and numbered-section prose, switching between the `en` and `he` copy via
 * the site's locale context (RTL applied via `dir` for Hebrew).
 */

import { useLocale } from '@/lib/locale-context'
import { renderInline } from '@/lib/inline-markdown'

export interface LegalSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface LegalCopy {
  metaLabel: string
  title: string
  versionLine: string
  taskNote?: string
  draftNotice: string
  sections: LegalSection[]
}

export interface LegalContent {
  en: LegalCopy
  he: LegalCopy
}

export function LegalDocument({ content }: { content: LegalContent }) {
  const { locale, dir } = useLocale()
  const t = content[locale]

  return (
    <main
      dir={dir}
      style={{
        backgroundColor: 'var(--color-paper)',
        color: 'var(--color-ink)',
        fontFamily: 'var(--font-heebo)',
      }}
    >
      {/* PAGE HEADER */}
      <section style={{ padding: '72px 24px 32px', borderBottom: '1px solid rgba(10,13,11,0.08)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            {t.metaLabel}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.9rem, 5vw, 2.9rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 16px',
          }}>
            {t.title}
          </h1>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.8rem',
            color: 'var(--color-tally)',
            fontWeight: 700,
            margin: 0,
          }}>
            {t.versionLine}
          </p>
          {t.taskNote && (
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--color-tally)',
              marginTop: '10px',
              fontStyle: 'italic',
              lineHeight: 1.6,
              maxWidth: '580px',
            }}>
              {t.taskNote}
            </p>
          )}
        </div>
      </section>

      {/* DRAFT NOTICE */}
      <section style={{ padding: '32px 24px 0' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            padding: '16px 20px',
            backgroundColor: 'rgba(217,119,6,0.07)',
            border: '1px solid rgba(217,119,6,0.28)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <span aria-hidden="true" style={{ fontSize: '0.95rem', flexShrink: 0, lineHeight: 1.4 }}>
              
            </span>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.03em',
              color: '#8a5a12',
              margin: 0,
              lineHeight: 1.6,
              fontWeight: 700,
            }}>
              {t.draftNotice}
            </p>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <section style={{ padding: '48px 24px 96px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {t.sections.map((s, i) => (
            <div key={i}>
              {s.heading && (
                <h2 style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.15rem',
                  letterSpacing: '-0.01em',
                  marginBottom: '10px',
                }}>
                  {renderInline(s.heading)}
                </h2>
              )}
              {s.paragraphs?.map((p, j) => (
                <p key={j} style={{ fontSize: '0.925rem', color: 'var(--color-tally)', lineHeight: 1.7, margin: '0 0 10px' }}>
                  {renderInline(p)}
                </p>
              ))}
              {s.bullets && (
                <ul style={{ margin: '8px 0 0', paddingInlineStart: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {s.bullets.map((b, k) => (
                    <li key={k} style={{ fontSize: '0.925rem', color: 'var(--color-tally)', lineHeight: 1.7 }}>
                      {renderInline(b)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
