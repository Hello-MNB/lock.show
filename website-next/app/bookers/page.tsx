// Bookers / Buyers ג€” rebuilt per Codex exact rebuild brief ֲ§5.6 (2026-07-14).
// Goal: the page works for BOTH professional booking people and private
// clients (weddings, company nights). Hero H1 "Understand the artist before
// you say yes." + venue load-in image + Passport preview card; sections:
// three buyer fears ג†’ what Passport answers ג†’ private-client explanation
// (EN+HE, warm register) ג†’ no-account CTA. Ticket-sales overemphasis removed.
// ALL copy lives in content/bookers.ts ({ en, he }); this page renders EN ג€”
// locale wiring is a later wave and stays mechanical.

import Link from 'next/link'

import { FinalCta } from '@/components/marketing/final-cta'
import { Hero } from '@/components/marketing/hero'
import { Icon } from '@/components/marketing/icons'
import { Section, SectionHeading } from '@/components/marketing/section'
import { bookersContent } from '@/content/bookers'
import { buildPageMetadata } from '@/lib/seo'

const t = bookersContent.en
const tHe = bookersContent.he

const HERO_IMAGE = '/brand/lockshow-atmosphere-booker-context-venue-loadin-v1.webp'

export const metadata = buildPageMetadata('bookers')

// ג”€ג”€ Floating Passport preview card (brief ֲ§5.6 hero right) ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

function PassportPreviewCard() {
  const c = t.hero.passportCard
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(10,13,11,0.1)',
        borderRadius: '18px',
        padding: '1rem 1.2rem',
        minWidth: '210px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.55rem' }}>
        <Icon id="passport" size={14} color="var(--color-stamp-onlight)" />
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-stamp-onlight)',
          }}
        >
          {c.label}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '1rem',
          fontWeight: 800,
          color: 'var(--color-ink)',
          marginBottom: '0.15rem',
        }}
      >
        {c.name}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-tally-onlight)',
          marginBottom: '0.7rem',
        }}
      >
        {c.tag}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.58rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--color-stamp-onlight)',
            background: 'rgba(200,240,77,0.14)',
            border: '1px solid rgba(200,240,77,0.4)',
            borderRadius: '4px',
            padding: '0.14rem 0.4rem',
          }}
        >
          {c.methodChip}
        </span>
        <Link
          href={c.viewCta.href}
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.58rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-ink)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {c.viewCta.label}
          <Icon id="arrow" size={11} />
        </Link>
      </div>
    </div>
  )
}

// ג”€ג”€ Page ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

export default function BookersPage() {
  return (
    <main data-accent="bookers">
      {/* ג”€ג”€ HERO (brief ֲ§5.6) ג”€ג”€ */}
      <Hero
        eyebrow={t.hero.eyebrow}
        title={t.hero.h1}
        body={t.hero.body}
        primaryCta={t.hero.primaryCta}
        secondaryCta={t.hero.secondaryCta}
        trustLine={t.hero.trustLine}
        image={{ src: HERO_IMAGE, alt: t.hero.imageAlt }}
        chips={t.hero.chips}
        floatingBottom={<PassportPreviewCard />}
      />

      {/* ג”€ג”€ AUDIENCE BAND (entity-model audit 2026-07-14): private clients ג€”
          wedding couples, company events ג€” visible at the top of the page,
          EN+HE verbatim, rendered directly under the hero. */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: 'clamp(1.5rem, 3vw, 2.25rem) max(24px, 4vw)',
          borderBottom: '1px solid rgba(10,13,11,0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '880px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem',
          }}
        >
          <p
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              lineHeight: 1.5,
              letterSpacing: '-0.01em',
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {t.audience.en}
          </p>
          <p
            dir="rtl"
            lang="he"
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--color-tally-onlight)',
              margin: 0,
            }}
          >
            {t.audience.he}
          </p>
        </div>
      </section>

      {/* ג”€ג”€ SECTION 1 ג€” THREE BUYER FEARS (brief ֲ§5.6) ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.fears.eyebrow} title={t.fears.title} />
        <div
          className="m-divide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.fears.cards.map((card, i) => {
            const dark = i === 1 // card rhythm: paper ֲ· dark ֲ· paper (brief ֲ§3)
            return (
              <div
                key={card.title}
                className="mk-card m-flat"
                style={{
                  background: dark ? 'var(--color-forest)' : '#ffffff',
                  border: dark
                    ? '1px solid rgba(243,245,239,0.1)'
                    : '1px solid rgba(10,13,11,0.1)',
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: dark ? 'var(--color-stamp)' : 'var(--color-stamp-onlight)',
                    display: 'block',
                    marginBottom: '0.75rem',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    lineHeight: 1.3,
                    color: dark ? 'var(--color-paper)' : 'var(--color-ink)',
                    margin: '0 0 0.7rem',
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.65,
                    color: dark ? 'rgba(243,245,239,0.65)' : 'var(--color-tally-onlight)',
                    margin: 0,
                  }}
                >
                  {card.body}
                </p>
              </div>
            )
          })}
        </div>
      </Section>

      {/* ג”€ג”€ SECTION 2 ג€” WHAT THE PASSPORT ANSWERS (brief ֲ§5.6) ג”€ג”€ */}
      <Section tone="forest">
        <SectionHeading tone="forest" eyebrow={t.answers.eyebrow} title={t.answers.title} />
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {t.answers.items.map((item) => (
            <div
              key={item.label}
              style={{
                padding: '1.6rem 0',
                borderBottom: '1px solid rgba(243,245,239,0.1)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.11em',
                  textTransform: 'uppercase',
                  color: 'var(--color-stamp)',
                  display: 'block',
                  marginBottom: '0.45rem',
                }}
              >
                {item.label}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  lineHeight: 1.3,
                  color: 'var(--color-paper)',
                  margin: '0 0 0.45rem',
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.65,
                  color: 'rgba(243,245,239,0.65)',
                  margin: 0,
                  maxWidth: '720px',
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ג”€ג”€ SECTION 3 ג€” PRIVATE-CLIENT EXPLANATION (brief ֲ§5.6) ג”€ג”€
          MUST include the wedding/company-night copy EN+HE ג€” private
          clients are valid buyers; warm register, no venue jargon. */}
      <Section tone="paper" narrow>
        <SectionHeading
          eyebrow={t.privateClients.eyebrow}
          title={t.privateClients.title}
          align="start"
        />
        <div
          className="mk-card"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(10,13,11,0.1)',
            padding: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem',
          }}
        >
          <p
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(1.15rem, 2.2vw, 1.4rem)',
              lineHeight: 1.45,
              letterSpacing: '-0.015em',
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {t.privateClients.lead.en}
          </p>
          {/* HE verbatim from the brief ֲ§5.6 ג€” rendered alongside EN by design */}
          <p
            dir="rtl"
            lang="he"
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {t.privateClients.lead.he}
          </p>
          <p
            style={{
              fontSize: '0.98rem',
              lineHeight: 1.7,
              color: 'var(--color-tally-onlight)',
              margin: 0,
            }}
          >
            {t.privateClients.body}
          </p>
          <blockquote
            style={{
              margin: 0,
              padding: '1rem 1.25rem',
              borderInlineStart: '3px solid var(--color-stamp)',
              background: 'rgba(200,240,77,0.07)',
              borderRadius: '0 14px 14px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <p
              dir="rtl"
              lang="he"
              style={{
                fontSize: '0.98rem',
                lineHeight: 1.7,
                color: 'var(--color-ink)',
                margin: 0,
              }}
            >
              {tHe.privateClients.warmQuote.he}
            </p>
            <p
              style={{
                fontSize: '0.9rem',
                lineHeight: 1.65,
                color: 'var(--color-tally-onlight)',
                margin: 0,
              }}
            >
              {t.privateClients.warmQuote.en}
            </p>
          </blockquote>
        </div>
      </Section>

      {/* ג”€ג”€ SECTION 4 ג€” NO-ACCOUNT CTA (brief ֲ§5.6) ג”€ג”€ */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: '0 max(24px, 4vw) 2.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '880px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
          }}
        >
          {t.finalCta.chips.map((chip) => (
            <span
              key={chip}
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--color-tally-onlight)',
                border: '1px solid rgba(10,13,11,0.15)',
                padding: '0.3rem 0.7rem',
                borderRadius: '999px',
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </section>
      <FinalCta
        title={t.finalCta.title}
        body={t.finalCta.body}
        primaryCta={t.finalCta.primaryCta}
        secondaryLink={t.finalCta.secondaryLink}
      />
    </main>
  )
}
