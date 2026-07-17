// Artists ג€” rebuilt per Codex exact rebuild brief ֲ§5.2 (2026-07-14).
// Goal: the artist feels SUPPORTED, not evaluated. No "build proof" as main
// language, nothing implying the artist is being judged.
// ALL copy lives in content/artists.ts ({ en, he }); this page renders EN
// for now ג€” locale wiring is a later wave and stays mechanical.

import { Fragment } from 'react'

import { FinalCta } from '@/components/marketing/final-cta'
import { FlowRow, FlowStep } from '@/components/marketing/flow-step'
import { Hero } from '@/components/marketing/hero'
import { Icon } from '@/components/marketing/icons'
import { Section, SectionHeading } from '@/components/marketing/section'
import { TrustBadge } from '@/components/marketing/trust-badge'
import { artistsContent } from '@/content/artists'
import { buildPageMetadata } from '@/lib/seo'

const t = artistsContent.en

const HERO_IMAGE = '/brand/lockshow-atmosphere-artist-career-workspace-v1.webp'

export const metadata = buildPageMetadata('artists')

// ג”€ג”€ Floating Radar overlay on the hero image (brief ֲ§5.2 wireframe) ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

function RadarOverlayCard() {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
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

// ג”€ג”€ Page ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

export default function ArtistsPage() {
  return (
    <main data-accent="artists">
      {/* ג”€ג”€ HERO (brief ֲ§5.2): supported, not evaluated ג”€ג”€ */}
      <Hero
        eyebrow={t.hero.eyebrow}
        title={t.hero.h1}
        body={t.hero.body}
        primaryCta={t.hero.primaryCta}
        secondaryCta={t.hero.secondaryCta}
        trustLine={t.hero.trustLine}
        image={{ src: HERO_IMAGE, alt: t.hero.imageAlt }}
        floatingBottom={<RadarOverlayCard />}
        below={
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.9rem',
            }}
          >
            {/* "Artist controls publication" badge (brief ֲ§5.2 Add) */}
            <TrustBadge
              methodLabel={t.hero.badge.methodLabel}
              explanation={t.hero.badge.explanation}
              visibility="private"
              tone="dark"
            />
            {/* "Start with one link" micro-step (brief ֲ§5.2 Add) */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(243,245,239,0.7)',
              }}
            >
              <Icon id="link" size={14} color="var(--color-stamp)" />
              {t.hero.microStep}
            </span>
          </div>
        }
      />

      {/* ג”€ג”€ MINI-FLOW STRIP: One link ג†’ Radar ג†’ Passport ג†’ Share ג”€ג”€ */}
      <section
        style={{
          background: 'var(--color-ink)',
          borderTop: '1px solid rgba(243,245,239,0.08)',
          borderBottom: '1px solid rgba(243,245,239,0.08)',
          padding: '1.4rem max(24px, 4vw)',
        }}
      >
        <div
          className="mk-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.6rem 0.9rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.66rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(243,245,239,0.45)',
              marginInlineEnd: '0.5rem',
            }}
          >
            {t.miniFlow.eyebrow}
          </span>
          {t.miniFlow.chips.map((chip, i) => (
            <Fragment key={chip}>
              {i > 0 ? (
                <span aria-hidden="true" style={{ color: 'rgba(243,245,239,0.35)' }}>
                  <Icon id="arrow" size={13} />
                </span>
              ) : null}
              <span
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  color: 'var(--color-paper)',
                  background: 'rgba(243,245,239,0.06)',
                  border: '1px solid rgba(243,245,239,0.18)',
                  borderRadius: '999px',
                  padding: '0.35rem 0.85rem',
                }}
              >
                {chip}
              </span>
            </Fragment>
          ))}
        </div>
      </section>

      {/* ג”€ג”€ 3 TENSION CARDS (brief ֲ§5.2) ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.tension.eyebrow} title={t.tension.title} />
        <div
          className="m-divide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.tension.cards.map((card, i) => {
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
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    lineHeight: 1.35,
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

      {/* ג”€ג”€ TWO PRODUCT CARDS: private Radar / public Passport (brief ֲ§5.2) ג”€ג”€ */}
      <Section tone="forest">
        <SectionHeading tone="forest" eyebrow={t.products.eyebrow} title={t.products.title} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(1.25rem, 2.5vw, 2rem)',
            alignItems: 'stretch',
          }}
        >
          {/* Radar ג€” dark card */}
          <article
            className="mk-card"
            style={{
              background: 'rgba(243,245,239,0.04)',
              border: '1px solid rgba(243,245,239,0.12)',
              padding: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' }}>
              <Icon id="radar" size={22} color="var(--color-stamp)" />
              <span
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-stamp)',
                  border: '1px solid rgba(200,240,77,0.3)',
                  borderRadius: '999px',
                  padding: '0.2rem 0.65rem',
                }}
              >
                {t.products.radar.label}
              </span>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--color-paper)',
                margin: '0 0 0.6rem',
              }}
            >
              {t.products.radar.title}
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.65,
                color: 'rgba(243,245,239,0.65)',
                margin: '0 0 1.25rem',
              }}
            >
              {t.products.radar.body}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.7rem' }}>
              {t.products.radar.features.map((feature) => (
                <li key={feature} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ marginTop: '2px', color: 'rgba(200,240,77,0.8)' }}>
                    <Icon id="confirm" size={15} />
                  </span>
                  <span style={{ fontSize: '0.9rem', lineHeight: 1.55, color: 'rgba(243,245,239,0.75)' }}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          {/* Passport ג€” paper card */}
          <article
            className="mk-card"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(10,13,11,0.1)',
              padding: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' }}>
              <Icon id="passport" size={22} color="var(--color-stamp-onlight)" />
              <span
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-stamp-onlight)',
                  border: '1px solid rgba(200,240,77,0.5)',
                  borderRadius: '999px',
                  padding: '0.2rem 0.65rem',
                }}
              >
                {t.products.passport.label}
              </span>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--color-ink)',
                margin: '0 0 0.6rem',
              }}
            >
              {t.products.passport.title}
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.65,
                color: 'var(--color-tally-onlight)',
                margin: '0 0 1.25rem',
              }}
            >
              {t.products.passport.body}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 1.25rem',
                display: 'grid',
                gap: '0.7rem',
              }}
            >
              {t.products.passport.features.map((feature) => (
                <li key={feature} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ marginTop: '2px', color: 'var(--color-stamp-onlight)' }}>
                    <Icon id="confirm" size={15} />
                  </span>
                  <span style={{ fontSize: '0.9rem', lineHeight: 1.55, color: 'var(--color-ink)' }}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {t.products.passport.methodChips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-stamp-onlight)',
                    background: 'rgba(200,240,77,0.12)',
                    border: '1px solid rgba(200,240,77,0.4)',
                    borderRadius: '4px',
                    padding: '0.18rem 0.5rem',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </article>
        </div>
      </Section>

      {/* ג”€ג”€ 4-STEP FLOW (brief ֲ§5.2) ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.flow.eyebrow} title={t.flow.title} />
        <FlowRow cols={4}>
          {t.flow.steps.map((step, i) => (
            <FlowStep
              key={step.verb}
              number={String(i + 1).padStart(2, '0')}
              verb={step.verb}
              body={step.body}
              icon={step.icon}
              tone="light"
            />
          ))}
        </FlowRow>
      </Section>

      {/* ג”€ג”€ FINAL CTA ג”€ג”€ */}
      <FinalCta
        title={t.finalCta.title}
        body={t.finalCta.body}
        primaryCta={t.finalCta.primaryCta}
        secondaryLink={t.finalCta.secondaryLink}
      />
    </main>
  )
}
