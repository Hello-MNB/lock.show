// Methodology — rebuilt per Codex exact rebuild brief §5.9 (2026-07-14).
// Trust page: calm, not over-technical. Hero "Not every source means the
// same thing. LOCK shows the method." Sections: method labels → source types
// → what never becomes public → firewall rules. Governed chips (Source-linked
// · Evidence-supported · Artist-declared · Producer-confirmed), icon row
// platform / document / person / artist-declared, source logos strip.
// NO visual that resembles a scoring chart — labelled text cards only.
// ALL copy lives in content/methodology.ts ({ en, he }); renders EN for now.
//
// Local composition note (reported gap): components/marketing/icons.tsx has
// no "document" / "person" / "declared" concepts, so the §5.9 icon row uses
// small local glyphs below instead of the shared Icon set.

import type { Metadata } from 'next'

import { FinalCta } from '@/components/marketing/final-cta'
import { Section, SectionHeading } from '@/components/marketing/section'
import { TrustBadge } from '@/components/marketing/trust-badge'
import { methodologyContent, type SourceKind } from '@/content/methodology'

const t = methodologyContent.en

const SITE_URL = 'https://lock.show'

export const metadata: Metadata = {
  alternates: { canonical: '/methodology' },
  title: t.meta.title,
  description: t.meta.description,
  openGraph: {
    title: t.meta.title,
    description: t.meta.description,
    type: 'website',
    url: `${SITE_URL}/methodology`,
  },
}

// Source logos (brief §5.9 asset list) — /public/brand/source-logos/*.svg
const SOURCE_LOGOS = [
  { src: '/brand/source-logos/codex-eventer.svg', alt: 'Eventer' },
  { src: '/brand/source-logos/codex-tickchak.svg', alt: 'Tickchak' },
  { src: '/brand/source-logos/codex-go-out.svg', alt: 'GO-OUT' },
  { src: '/brand/source-logos/codex-instagram.svg', alt: 'Instagram' },
  { src: '/brand/source-logos/codex-soundcloud.svg', alt: 'SoundCloud' },
  { src: '/brand/source-logos/generic-ticket-export.svg', alt: 'Ticket export' },
]

// ── Local icon glyphs for the §5.9 icon row (shared icons.tsx lacks these) ──
const SOURCE_KIND_PATHS: Record<SourceKind, string> = {
  // platform: browser/platform window
  platform: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 7h.01"/>',
  // document: page with lines
  document: '<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3M9 11h6M9 15h6"/>',
  // person: single person
  person: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6"/>',
  // declared: speech mark / statement
  declared: '<path d="M4 5h16v11H9l-5 4z"/><path d="M9 9h6"/>',
}

function SourceKindGlyph({ kind }: { kind: SourceKind }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'inline-block', flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: SOURCE_KIND_PATHS[kind] }}
    />
  )
}

export default function MethodologyPage() {
  return (
    <main>
      {/* ── HERO — calm text header + governed chips, no image, nothing
             that could read as a chart ── */}
      <section
        className="mk-hero"
        style={{
          background:
            'radial-gradient(720px 480px at 85% 0%, rgba(200,240,77,0.07), transparent 60%), linear-gradient(160deg, var(--color-ink) 0%, var(--color-forest) 100%)',
          color: 'var(--color-paper)',
          paddingBottom: '72px',
        }}
      >
        <div className="mk-container--narrow" style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-stamp)',
              margin: '0 0 1.25rem',
            }}
          >
            {t.hero.eyebrow}
          </p>
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 'clamp(2.1rem, 4.4vw, 3.3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: 'var(--color-paper)',
              margin: '0 0 1.4rem',
            }}
          >
            {t.hero.h1}
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(243,245,239,0.7)',
              maxWidth: '560px',
              margin: '0 auto 2rem',
            }}
          >
            {t.hero.body}
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
            }}
          >
            {t.hero.chips.map((chip) => (
              <span
                key={chip}
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  color: 'var(--color-stamp)',
                  background: 'rgba(200,240,77,0.08)',
                  border: '1px solid rgba(200,240,77,0.3)',
                  borderRadius: '999px',
                  padding: '0.32rem 0.75rem',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 1 · METHOD LABELS — governed chips with plain-language text ── */}
      <Section tone="paper">
        <SectionHeading
          eyebrow={t.methodLabels.eyebrow}
          title={t.methodLabels.title}
          body={t.methodLabels.body}
        />
        <div
          className="m-divide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.methodLabels.items.map((item) => (
            <div
              key={item.chip}
              className="mk-card m-flat"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(10,13,11,0.1)',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}
            >
              <span
                style={{
                  alignSelf: 'flex-start',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  color: 'var(--color-stamp-onlight)',
                  background: 'rgba(200,240,77,0.14)',
                  border: '1px solid rgba(200,240,77,0.4)',
                  borderRadius: '4px',
                  padding: '0.18rem 0.5rem',
                }}
              >
                {item.chip}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  lineHeight: 1.3,
                  color: 'var(--color-ink)',
                  margin: 0,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.65,
                  color: 'var(--color-tally-onlight)',
                  margin: 0,
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 2 · SOURCE TYPES — icon row + source-logo strip (brief §5.9) ── */}
      <Section tone="forest">
        <SectionHeading tone="forest" eyebrow={t.sourceTypes.eyebrow} title={t.sourceTypes.title} />
        <div
          className="m-divide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
            marginBottom: 'clamp(2.5rem, 5vw, 3.5rem)',
          }}
        >
          {t.sourceTypes.items.map((item) => (
            <div
              key={item.kind}
              className="mk-card"
              style={{
                background: 'rgba(243,245,239,0.04)',
                border: '1px solid rgba(243,245,239,0.1)',
                padding: 'clamp(1.25rem, 2.5vw, 1.6rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.4rem',
                  height: '2.4rem',
                  borderRadius: '12px',
                  background: 'rgba(200,240,77,0.1)',
                  border: '1px solid rgba(200,240,77,0.25)',
                  color: 'var(--color-stamp)',
                }}
              >
                <SourceKindGlyph kind={item.kind} />
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  lineHeight: 1.3,
                  color: 'var(--color-paper)',
                  margin: 0,
                }}
              >
                {item.label}
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'rgba(243,245,239,0.6)',
                  margin: 0,
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* Source-logo strip — credibility row, not a chart */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(243,245,239,0.5)',
              margin: '0 0 1.25rem',
            }}
          >
            {t.sourceTypes.logosLabel}
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(1rem, 2.5vw, 2rem)',
            }}
          >
            {SOURCE_LOGOS.map((logo) => (
              <span
                key={logo.src}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(243,245,239,0.06)',
                  border: '1px solid rgba(243,245,239,0.12)',
                  borderRadius: '14px',
                  padding: '0.6rem 1rem',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- small local SVG logos */}
                <img
                  src={logo.src}
                  alt={logo.alt}
                  height={22}
                  style={{ height: '22px', width: 'auto', display: 'block' }}
                />
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 3 · WHAT NEVER BECOMES PUBLIC ── */}
      <Section tone="paper">
        <SectionHeading
          eyebrow={t.neverPublic.eyebrow}
          title={t.neverPublic.title}
        />
        <div
          className="m-divide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.neverPublic.items.map((item, i) => {
            const dark = i % 2 === 1 // card rhythm, not a ladder/scale
            return (
              <div
                key={item.title}
                className="mk-card m-flat"
                style={{
                  background: dark ? 'var(--color-forest)' : '#ffffff',
                  border: dark
                    ? '1px solid rgba(243,245,239,0.1)'
                    : '1px solid rgba(10,13,11,0.1)',
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    lineHeight: 1.3,
                    color: dark ? 'var(--color-paper)' : 'var(--color-ink)',
                    margin: '0 0 0.6rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.92rem',
                    lineHeight: 1.65,
                    color: dark ? 'rgba(243,245,239,0.65)' : 'var(--color-tally-onlight)',
                    margin: 0,
                  }}
                >
                  {item.body}
                </p>
              </div>
            )
          })}
        </div>
      </Section>

      {/* ── 4 · FIREWALL RULES — labelled statements via TrustBadge ── */}
      <Section tone="ink" narrow>
        <SectionHeading tone="ink" eyebrow={t.firewall.eyebrow} title={t.firewall.title} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          {t.firewall.rules.map((rule) => (
            <TrustBadge key={rule.title} methodLabel={rule.title} explanation={rule.body} tone="dark" />
          ))}
        </div>
      </Section>

      {/* ── FINAL CTA ── */}
      <FinalCta
        title={t.finalCta.title}
        primaryCta={t.finalCta.primaryCta}
        secondaryLink={t.finalCta.secondaryLink}
      />
    </main>
  )
}
