// FAQ ג€” rebuilt per Codex exact rebuild brief ֲ§5.10 (2026-07-14).
// Hero "Questions before you try LOCK?" ג€” categories Artists / Buyers +
// private clients / Managers + production / Privacy + trust / Free pilot.
// The brief's 8 required questions are all present (content/faq.ts marks
// them `required`), and the page JSON-LD FAQPage mirrors exactly those.
// ALL copy lives in content/faq.ts ({ en, he }); renders EN for now.


import { FinalCta } from '@/components/marketing/final-cta'
import { Section, SectionHeading } from '@/components/marketing/section'
import { faqContent } from '@/content/faq'
import { buildPageMetadata } from '@/lib/seo'

const t = faqContent.en

const SITE_URL = 'https://lock.show'

export const metadata = buildPageMetadata('faq')

// JSON-LD FAQPage ג€” kept in sync with the rendered copy by building it from
// the same content module (required questions only, per brief ֲ§5.10).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: t.categories.flatMap((cat) =>
        cat.items
          .filter((item) => item.required)
          .map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
      ),
    },
  ],
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        {/* ג”€ג”€ HERO ג€” calm text header (brief ֲ§5.10) ג”€ג”€ */}
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
                margin: '0 auto',
              }}
            >
              {t.hero.body}
            </p>
          </div>
        </section>

        {/* ג”€ג”€ CATEGORIES ג€” Artists / Buyers + private clients / Managers +
               production / Privacy + trust / Free pilot ג”€ג”€ */}
        <Section tone="paper" narrow>
          <SectionHeading eyebrow="Categories" title="Pick your lane — or read it all." />
          {t.categories.map((cat) => (
            <div key={cat.id} id={cat.id} style={{ marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
              <p
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-stamp-onlight)',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid rgba(10,13,11,0.08)',
                }}
              >
                {cat.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {cat.items.map((item) => (
                  <details key={item.q} style={{ borderBottom: '1px solid rgba(10,13,11,0.08)' }}>
                    <summary
                      style={{
                        padding: '18px 0',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-archivo)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        lineHeight: 1.4,
                        listStyle: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        color: 'var(--color-ink)',
                      }}
                    >
                      <span>{item.q}</span>
                      <span
                        className="faq-glyph"
                        aria-hidden
                        style={{
                          fontFamily: 'var(--font-space-mono)',
                          fontSize: '0.8rem',
                          color: 'var(--color-stamp-onlight)',
                          flexShrink: 0,
                        }}
                      />
                    </summary>
                    <p
                      style={{
                        padding: '0 0 22px',
                        fontSize: '1rem',
                        color: 'var(--color-tally-onlight)',
                        lineHeight: 1.7,
                        margin: 0,
                        maxWidth: '640px',
                      }}
                    >
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </Section>

        {/* ג”€ג”€ FINAL CTA ג€” "Still have questions?" ג”€ג”€ */}
        <FinalCta
          title={t.finalCta.title}
          primaryCta={t.finalCta.primaryCta}
          secondaryLink={t.finalCta.secondaryLink}
        />
      </main>
    </>
  )
}
