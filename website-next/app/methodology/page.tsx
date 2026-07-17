// Methodology ג€” rebuilt per Codex exact rebuild brief ֲ§5.9 (2026-07-14).
// Trust page: calm, not over-technical. Hero "Not every source means the
// same thing. LOCK shows the method." Sections: method labels ג†’ source types
// ג†’ what never becomes public ג†’ firewall rules. Governed chips (Source-linked
// ֲ· Evidence-supported ֲ· Artist-declared ֲ· Producer-confirmed), icon row
// platform / document / person / artist-declared, source logos strip.
// NO visual that resembles a scoring chart ג€” labelled text cards only.
// ALL copy lives in content/methodology.ts ({ en, he }); renders EN for now.
//
// Local composition note (reported gap): components/marketing/icons.tsx has
// no "document" / "person" / "declared" concepts, so the ֲ§5.9 icon row uses
// small local glyphs below instead of the shared Icon set.


import { FinalCta } from '@/components/marketing/final-cta'
import { FirewallCard } from '@/components/marketing/cards'
import { Section, SectionHeading } from '@/components/marketing/section'
import { methodologyContent, type SourceKind } from '@/content/methodology'
import { buildPageMetadata } from '@/lib/seo'

const t = methodologyContent.en

const SITE_URL = 'https://lock.show'

export const metadata = buildPageMetadata('methodology')

// Source logos (brief ֲ§5.9 asset list) ג€” /public/brand/source-logos/*.svg.
// Each logo carries its source CATEGORY, coloured per SYNC ֲ§47:
// platform=source-blue ֲ· document=amber ֲ· person=lime ֲ· artist-declared=smoke.
type SourceCategory = 'platform' | 'document' | 'person' | 'declared'

const CATEGORY_COLOR: Record<SourceCategory, string> = {
  platform: 'var(--color-source-blue)',
  document: 'var(--color-amber-stage)',
  person: 'var(--color-stamp)',
  declared: 'rgba(221,227,215,0.7)',
}
const CATEGORY_LABEL: Record<SourceCategory, string> = {
  platform: 'Platform',
  document: 'Document',
  person: 'Person',
  declared: 'Artist-declared',
}

const SOURCE_LOGOS: { src: string; alt: string; category: SourceCategory }[] = [
  { src: '/brand/source-logos/codex-eventer.svg', alt: 'Eventer', category: 'document' },
  { src: '/brand/source-logos/codex-tickchak.svg', alt: 'Tickchak', category: 'document' },
  { src: '/brand/source-logos/codex-go-out.svg', alt: 'GO-OUT', category: 'document' },
  { src: '/brand/source-logos/codex-instagram.svg', alt: 'Instagram', category: 'platform' },
  { src: '/brand/source-logos/codex-soundcloud.svg', alt: 'SoundCloud', category: 'platform' },
  { src: '/brand/source-logos/generic-ticket-export.svg', alt: 'Ticket export', category: 'document' },
]

// ג”€ג”€ Local icon glyphs for the ֲ§5.9 icon row (shared icons.tsx lacks these) ג”€ג”€
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
    <main data-accent="methodology">
      {/* ג”€ג”€ HERO ג€” calm text header + governed chips, no image, nothing
             that could read as a chart ג”€ג”€ */}
      <section
        className="mk-hero"
        style={{
          // Trust-lab accent: source-blue + amber (SYNC ֲ§47), read from the
          // page's [data-accent="methodology"] channel.
          background:
            'radial-gradient(720px 480px at 85% 0%, var(--accent-cool), transparent 60%), radial-gradient(560px 420px at 12% 100%, var(--accent-warm), transparent 62%), linear-gradient(160deg, var(--color-ink) 0%, var(--color-forest) 100%)',
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

      {/* ג”€ג”€ 1 ֲ· METHOD LABELS ג€” governed chips with plain-language text ג”€ג”€ */}
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

      {/* ג”€ג”€ 2 ֲ· SOURCE TYPES ג€” icon row + source-logo strip (brief ֲ§5.9) ג”€ג”€ */}
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

        {/* Source-logo strip ג€” credibility row, not a chart */}
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
          {/* Source-ecosystem band (build scope ֲ§8) ג€” bigger dark logo cards,
              each carrying its source CATEGORY with a category colour on the
              top rule + type label. A credibility ecosystem, not a chart.
              The badge SVGs share one geometry (56x56 icon tile at 8,8 inside a
              72px canvas); we crop that tile to a 52px square (scale 52/56:
              img 66.86px tall, offset -7.43px, radius ~13px). */}
          <div className="mk-source-belt">
            {SOURCE_LOGOS.map((logo) => (
              <div
                key={logo.src}
                className="mk-source-logo-card"
                style={{ ['--src-cat' as string]: CATEGORY_COLOR[logo.category] }}
              >
                <span
                  className="mk-source-logo-card__tile"
                  aria-hidden="true"
                  style={{ filter: 'grayscale(1)', opacity: 0.9 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- small local SVG logos */}
                  <img
                    src={logo.src}
                    alt=""
                    style={{
                      position: 'absolute',
                      top: '-7.43px',
                      left: '-7.43px',
                      height: '66.86px',
                      width: 'auto',
                      maxWidth: 'none',
                      display: 'block',
                    }}
                  />
                </span>
                <span className="mk-source-logo-card__name">{logo.alt}</span>
                <span className="mk-source-logo-card__type">{CATEGORY_LABEL[logo.category]}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ג”€ג”€ 3 ֲ· WHAT NEVER BECOMES PUBLIC ג”€ג”€ */}
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

      {/* ג”€ג”€ 4 ֲ· FIREWALL RULES ג€” protection semantics via FirewallCard
             (build scope ֲ§8: "what never becomes public" reads as a firewall,
             warm-guard outline, shield glyph ג€” not neutral badges) ג”€ג”€ */}
      <Section tone="ink">
        <SectionHeading tone="ink" eyebrow={t.firewall.eyebrow} title={t.firewall.title} />
        <div
          className="m-divide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(0.85rem, 2vw, 1.25rem)',
          }}
        >
          {t.firewall.rules.map((rule) => (
            <FirewallCard key={rule.title} title={rule.title} body={rule.body} />
          ))}
        </div>
      </Section>

      {/* ג”€ג”€ FINAL CTA ג”€ג”€ */}
      <FinalCta
        title={t.finalCta.title}
        primaryCta={t.finalCta.primaryCta}
        secondaryLink={t.finalCta.secondaryLink}
      />
    </main>
  )
}
