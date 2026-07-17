// Producers / Source Confirmer ג€” rebuilt per Codex exact rebuild brief ֲ§5.4
// (2026-07-14). This page is NOT a production workspace: it explains one-tap
// source confirmation (׳׳׳©׳¨-׳׳§׳•׳¨). One link. One claim. No account.
// Per ֲ§5.4 the hero is less cinematic: the production-warehouse webp is a
// heavily-darkened subtle BACKGROUND (not the shared Hero image card), with
// a CSS phone/WhatsApp confirmation-card mockup ג€” no real number anywhere.
// The shared Hero component has no background-image mode, so the hero is
// composed locally here (reported as a component gap).
// ALL copy lives in content/producers.ts ({ en, he }); this page renders EN
// for now ג€” locale wiring is a later wave and stays mechanical.

import Link from 'next/link'

import { FinalCta } from '@/components/marketing/final-cta'
import { Icon } from '@/components/marketing/icons'
import { Section, SectionHeading } from '@/components/marketing/section'
import { producersContent } from '@/content/producers'
import { buildPageMetadata } from '@/lib/seo'

const t = producersContent.en

const BG_IMAGE = '/brand/lockshow-atmosphere-production-warehouse-v1.webp'

export const metadata = buildPageMetadata('sourceConfirmers')

const MONO = 'var(--font-space-mono)'

// ג”€ג”€ Phone / WhatsApp confirmation-card mockup (brief ֲ§5.4) ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
// Pure CSS mockup ג€” no real phone number, no real chat screenshot.

function PhoneMockup() {
  const p = t.phone
  return (
    <div
      id="confirmation-example"
      aria-label="Example of a one-tap source confirmation card"
      style={{
        width: 'min(340px, 100%)',
        borderRadius: '36px',
        background: '#0d110e',
        border: '1px solid rgba(243,245,239,0.18)',
        boxShadow: '0 32px 80px -28px rgba(0,0,0,0.85)',
        padding: '0.9rem',
        scrollMarginTop: '96px',
      }}
    >
      <div
        style={{
          borderRadius: '28px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #101511 0%, #0b0e0c 100%)',
          border: '1px solid rgba(243,245,239,0.08)',
        }}
      >
        {/* chat header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1rem',
            borderBottom: '1px solid rgba(243,245,239,0.08)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: 'rgba(200,240,77,0.15)',
              border: '1px solid rgba(200,240,77,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-stamp)',
              flexShrink: 0,
            }}
          >
            <Icon id="artist" size={15} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--color-paper)',
                margin: 0,
              }}
            >
              {p.sender}
            </p>
            <p
              style={{
                fontFamily: MONO,
                fontSize: '0.56rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(243,245,239,0.45)',
                margin: 0,
              }}
            >
              {p.appLabel}
            </p>
          </div>
        </div>

        <div style={{ padding: '1rem' }}>
          {/* incoming message bubble */}
          <p
            style={{
              background: 'rgba(243,245,239,0.07)',
              border: '1px solid rgba(243,245,239,0.08)',
              borderRadius: '14px 14px 14px 4px',
              padding: '0.7rem 0.85rem',
              fontSize: '0.82rem',
              lineHeight: 1.55,
              color: 'rgba(243,245,239,0.85)',
              margin: '0 0 0.8rem',
            }}
          >
            {p.message}
          </p>

          {/* confirmation card */}
          <div
            style={{
              background: 'rgba(10,13,11,0.6)',
              border: '1px solid rgba(200,240,77,0.25)',
              borderRadius: '16px',
              padding: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.65rem' }}>
              <Icon id="lock" size={13} color="var(--color-stamp)" />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-stamp)',
                }}
              >
                {p.claim.title}
              </span>
            </div>
            <dl style={{ margin: '0 0 0.75rem', display: 'grid', gap: '0.35rem' }}>
              {p.claim.rows.map((row) => (
                <div key={row.label} style={{ display: 'flex', gap: '0.6rem' }}>
                  <dt
                    style={{
                      fontFamily: MONO,
                      fontSize: '0.6rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(243,245,239,0.45)',
                      minWidth: '3.2rem',
                    }}
                  >
                    {row.label}
                  </dt>
                  <dd
                    style={{
                      fontSize: '0.78rem',
                      color: 'rgba(243,245,239,0.85)',
                      margin: 0,
                    }}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p
              style={{
                fontSize: '0.76rem',
                lineHeight: 1.5,
                color: 'rgba(243,245,239,0.65)',
                margin: '0 0 0.75rem',
              }}
            >
              {p.claim.question}
            </p>
            {/* confirm / correct / skip ג€” mockup buttons, not page CTAs */}
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-stamp)',
                  background: 'rgba(200,240,77,0.12)',
                  border: '1px solid rgba(200,240,77,0.4)',
                  borderRadius: '999px',
                  padding: '0.4rem 0.85rem',
                }}
              >
                {p.actions.confirm}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(243,245,239,0.8)',
                  border: '1px solid rgba(243,245,239,0.25)',
                  borderRadius: '999px',
                  padding: '0.4rem 0.85rem',
                }}
              >
                {p.actions.correct}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(243,245,239,0.55)',
                  border: '1px solid rgba(243,245,239,0.15)',
                  borderRadius: '999px',
                  padding: '0.4rem 0.85rem',
                }}
              >
                {p.actions.skip}
              </span>
            </div>
          </div>

          <p
            style={{
              fontFamily: MONO,
              fontSize: '0.58rem',
              letterSpacing: '0.06em',
              color: 'rgba(243,245,239,0.45)',
              margin: '0.8rem 0 0',
              textAlign: 'center',
            }}
          >
            {p.footnote}
          </p>
        </div>
      </div>
    </div>
  )
}

// ג”€ג”€ Page ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

export default function ProducersPage() {
  return (
    <main data-accent="source">
      {/* ג”€ג”€ HERO (brief ֲ§5.4): warehouse webp as heavily-darkened subtle
             background + phone confirmation mockup ג”€ג”€ */}
      <section
        className="mk-hero"
        style={{
          background: `linear-gradient(160deg, rgba(10,13,11,0.94) 0%, rgba(10,13,11,0.88) 55%, rgba(10,13,11,0.96) 100%), url('${BG_IMAGE}') center / cover no-repeat`,
          color: 'var(--color-paper)',
        }}
      >
        <div className="mk-container">
          <div className="mk-hero-grid" style={{ alignItems: 'center' }}>
            {/* Left: copy */}
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--color-stamp)',
                    boxShadow: '0 0 10px var(--color-stamp)',
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: '0.75rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--color-stamp)',
                    margin: 0,
                  }}
                >
                  {t.hero.eyebrow}
                </p>
              </div>

              <h1
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  fontSize: 'clamp(2.2rem, 4.6vw, 3.6rem)',
                  lineHeight: 1.02,
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
                  maxWidth: '480px',
                  margin: '0 0 2rem',
                }}
              >
                {t.hero.body}
              </p>

              <div
                className="mk-cta-row"
                style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}
              >
                <a href={t.hero.primaryCta.href} className="mk-btn mk-btn--primary">
                  {t.hero.primaryCta.label}
                  <Icon id="arrow" size={16} />
                </a>
                <Link href={t.hero.secondaryCta.href} className="mk-btn mk-btn--outline-dark">
                  {t.hero.secondaryCta.label}
                </Link>
              </div>

              <p
                style={{
                  fontFamily: MONO,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  color: 'rgba(243,245,239,0.55)',
                  margin: 0,
                }}
              >
                {t.hero.trustLine}
              </p>
            </div>

            {/* Right: phone / WhatsApp confirmation-card mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ג”€ג”€ 1 ֲ· WHAT YOU SEE (brief ֲ§5.4) ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.see.eyebrow} title={t.see.title} body={t.see.body} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.see.cards.map((card, i) => {
            const dark = i === 1 // card rhythm: paper ֲ· dark ֲ· paper
            return (
              <div
                key={card.title}
                className="mk-card"
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

      {/* ג”€ג”€ 2 ֲ· CONFIRM / CORRECT / SKIP (brief ֲ§5.4) ג”€ג”€ */}
      <Section tone="forest" narrow>
        <SectionHeading
          tone="forest"
          eyebrow={t.answer.eyebrow}
          title={t.answer.title}
          body={t.answer.body}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(0.75rem, 1.5vw, 1.25rem)',
          }}
        >
          {t.answer.options.map((option) => (
            <div
              key={option.label}
              className="mk-card"
              style={{
                background: 'rgba(243,245,239,0.04)',
                border: '1px solid rgba(243,245,239,0.12)',
                padding: 'clamp(1.25rem, 2.5vw, 1.6rem)',
                textAlign: 'center',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.6rem',
                  height: '2.6rem',
                  borderRadius: '50%',
                  background: 'rgba(200,240,77,0.1)',
                  border: '1px solid rgba(200,240,77,0.3)',
                  color: 'var(--color-stamp)',
                  marginBottom: '0.8rem',
                }}
              >
                <Icon id={option.icon} size={18} />
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--color-paper)',
                  margin: '0 0 0.45rem',
                }}
              >
                {option.label}
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  color: 'rgba(243,245,239,0.65)',
                  margin: 0,
                }}
              >
                {option.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ג”€ג”€ 3 ֲ· WHAT DOES NOT HAPPEN (brief ֲ§5.4): no account, no dashboard,
             no ongoing role ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.not.eyebrow} title={t.not.title} body={t.not.body} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.not.cards.map((card) => (
            <div
              key={card.title}
              className="mk-card"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(10,13,11,0.1)',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--color-ink)',
                  margin: '0 0 0.6rem',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.65,
                  color: 'var(--color-tally-onlight)',
                  margin: 0,
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            textAlign: 'center',
            fontFamily: MONO,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-stamp-onlight)',
            margin: '2rem 0 0',
          }}
        >
          {t.not.closing}
        </p>
      </Section>

      {/* ג”€ג”€ 4 ֲ· ARTIST STILL CONTROLS PUBLICATION (brief ֲ§5.4) ג”€ג”€ */}
      <Section tone="ink">
        <SectionHeading tone="ink" eyebrow={t.control.eyebrow} title={t.control.title} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.control.cards.map((card) => (
            <div
              key={card.title}
              className="mk-card"
              style={{
                background: 'rgba(243,245,239,0.04)',
                border: '1px solid rgba(243,245,239,0.1)',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
              }}
            >
              <span
                aria-hidden="true"
                style={{ display: 'block', color: 'var(--color-stamp)', marginBottom: '0.7rem' }}
              >
                <Icon id="lock" size={18} />
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  lineHeight: 1.35,
                  color: 'var(--color-paper)',
                  margin: '0 0 0.6rem',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.65,
                  color: 'rgba(243,245,239,0.65)',
                  margin: 0,
                }}
              >
                {card.body}
              </p>
            </div>
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
  )
}
