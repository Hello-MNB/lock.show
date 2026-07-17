// Home ג€” rebuilt per Codex exact rebuild brief ֲ§5.1 (2026-07-14).
// Goal: a visitor understands in 5 seconds ג€”
// LOCK = private Radar for the artist + public Passport for booking context.
// ALL copy lives in content/home.ts ({ en, he }); this page renders EN for
// now ג€” locale wiring is a later wave and stays mechanical.

import Link from 'next/link'

import { EntityCard } from '@/components/marketing/entity-card'
import { FinalCta } from '@/components/marketing/final-cta'
import { FlowRow, FlowStep } from '@/components/marketing/flow-step'
import { Hero } from '@/components/marketing/hero'
import { Icon } from '@/components/marketing/icons'
import { Section, SectionHeading } from '@/components/marketing/section'
import { homeContent } from '@/content/home'
import { buildPageMetadata } from '@/lib/seo'

const t = homeContent.en

const SITE_URL = 'https://lock.show'
const HERO_IMAGE = '/brand/lockshow-atmosphere-artist-career-workspace-v1.webp'

export const metadata = buildPageMetadata('home')

// Page-level JSON-LD: FAQPage ONLY. WebSite/Organization live in the root
// layout's graph ג€” duplicating them here created a conflicting entity graph
// (audit G8 finding).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a Passport?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A Passport is a public, method-labelled page showing only what the artist approved about their live history. Every detail carries its source and date ג€” so booking people can read real context without guessing.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is LOCK free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. LOCK is in a free pilot ג€” artists build their Radar and Passport for free, and booking people open Passports at no cost.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this a rating system?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. LOCK does not score artists, produce rankings, predict bookings, or guarantee outcomes. Context is shown as-is, labelled by method, and the artist controls what goes public.',
          },
        },
      ],
    },
  ],
}

// ג”€ג”€ Floating hero product cards (brief ֲ§5.1 hero right) ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

function MiniRadarCard() {
  const c = t.hero.radarCard
  return (
    <div
      style={{
        background: 'rgba(10,13,11,0.78)',
        border: '1px solid rgba(243,245,239,0.16)',
        borderRadius: '18px',
        padding: '0.9rem 1.1rem',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        minWidth: '150px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '0.6rem',
        }}
      >
        <Icon id="radar" size={14} color="var(--color-stamp)" />
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-stamp)',
          }}
        >
          {c.label}
        </span>
      </div>
      {c.rows.map((row) => (
        <div
          key={row}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0.22rem 0' }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'rgba(200,240,77,0.7)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.68rem',
              letterSpacing: '0.05em',
              color: 'rgba(243,245,239,0.72)',
            }}
          >
            {row}
          </span>
        </div>
      ))}
    </div>
  )
}

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '0.55rem',
        }}
      >
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main data-accent="home">
        {/* ג”€ג”€ HERO (brief ֲ§5.1) ג”€ג”€ */}
        <Hero
          eyebrow={t.hero.eyebrow}
          title={t.hero.h1}
          body={t.hero.body}
          primaryCta={t.hero.primaryCta}
          secondaryCta={t.hero.secondaryCta}
          trustLine={t.hero.trustLine}
          image={{ src: HERO_IMAGE, alt: t.hero.imageAlt }}
          chips={t.hero.chips}
          floatingTop={<MiniRadarCard />}
          floatingBottom={<PassportPreviewCard />}
        />

        {/* ג”€ג”€ WHY IT EXISTS ג€” 3 cards, varied rhythm (brief ֲ§3 + ֲ§5.1) ג”€ג”€ */}
        <Section tone="paper">
          <SectionHeading eyebrow={t.why.eyebrow} title={t.why.title} />
          <div
            className="m-divide"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'clamp(1rem, 2vw, 1.5rem)',
            }}
          >
            {t.why.cards.map((card, i) => {
              const dark = i === 1 // card rhythm: paper ֲ· dark ֲ· paper
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

        {/* ג”€ג”€ THE LOCK LOOP (brief ֲ§5.1) ג”€ג”€ */}
        <Section tone="forest">
          <SectionHeading tone="forest" eyebrow={t.loop.eyebrow} title={t.loop.title} />
          <FlowRow cols={5}>
            {t.loop.steps.map((step, i) => (
              <FlowStep
                key={step.verb}
                number={String(i + 1).padStart(2, '0')}
                verb={step.verb}
                body={step.body}
                icon={step.icon}
                tone="dark"
              />
            ))}
          </FlowRow>
        </Section>

        {/* ג”€ג”€ CHOOSE YOUR LANE ג€” 5 entity cards (brief ֲ§5.1) ג”€ג”€ */}
        <Section tone="paper">
          <SectionHeading eyebrow={t.lanes.eyebrow} title={t.lanes.title} body={t.lanes.body} />
          {/* 5 cards: mk-grid-5 lays them out 3 + 2 at desktop widths so the
              last row is intentional (no lone orphan card). */}
          <div className="m-divide mk-grid-5">
            {t.lanes.cards.map((card, i) => (
              <EntityCard
                key={card.cta.href}
                icon={card.icon}
                audienceLabel={card.audienceLabel}
                title={card.title}
                body={card.body}
                cta={card.cta}
                variant={i === 0 ? 'forest' : 'paper'}
              />
            ))}
          </div>
        </Section>

        {/* ג”€ג”€ FINAL CTA ג”€ג”€ */}
        <FinalCta
          title={t.finalCta.title}
          body={t.finalCta.body}
          primaryCta={t.finalCta.primaryCta}
          secondaryLink={t.finalCta.secondaryLink}
        />
      </main>
    </>
  )
}
