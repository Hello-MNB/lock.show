// Managers ג€” rebuilt per Codex exact rebuild brief ֲ§5.3 (2026-07-14).
// Audience: artist-side manager / ׳׳©׳¨׳“ ׳׳׳¨׳’׳ ׳•׳× (roster owner) ג€” NOT the buyer.
// Goal: roster leverage. Readiness reads as next actions, never a grade.
// ALL copy lives in content/managers.ts ({ en, he }); this page renders EN
// for now ג€” locale wiring is a later wave and stays mechanical.

import { Fragment } from 'react'

import { FinalCta } from '@/components/marketing/final-cta'
import { Hero } from '@/components/marketing/hero'
import { Icon } from '@/components/marketing/icons'
import { Section, SectionHeading } from '@/components/marketing/section'
import { TrustBadge } from '@/components/marketing/trust-badge'
import { managersContent } from '@/content/managers'
import { buildPageMetadata } from '@/lib/seo'

const t = managersContent.en

const HERO_IMAGE = '/brand/lockshow-atmosphere-agency-roster-room-v1.webp'

export const metadata = buildPageMetadata('managers')

const MONO_LABEL = {
  fontFamily: 'var(--font-space-mono)',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
} as const

// ג”€ג”€ Floating roster mini-card on the hero image (brief ֲ§5.3 hero right) ג”€ג”€ג”€ג”€

function RosterOverlayCard() {
  const c = t.hero.rosterCard
  return (
    <div
      style={{
        background: 'rgba(10,13,11,0.78)',
        border: '1px solid rgba(243,245,239,0.16)',
        borderRadius: '18px',
        padding: '0.9rem 1.1rem',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        minWidth: '210px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
        <Icon id="manager" size={14} color="var(--color-stamp)" />
        <span style={{ ...MONO_LABEL, color: 'var(--color-stamp)' }}>{c.label}</span>
      </div>
      {c.rows.map((row) => (
        <div
          key={row.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '0.24rem 0',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.68rem',
              letterSpacing: '0.04em',
              color: 'rgba(243,245,239,0.85)',
            }}
          >
            {row.name}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(200,240,77,0.75)',
              whiteSpace: 'nowrap',
            }}
          >
            {row.status}
          </span>
        </div>
      ))}
    </div>
  )
}

// ג”€ג”€ Page ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

export default function ManagersPage() {
  return (
    <main data-accent="managers">
      {/* ג”€ג”€ HERO (brief ֲ§5.3): roster-room image + roster cards ג”€ג”€ */}
      <Hero
        eyebrow={t.hero.eyebrow}
        title={t.hero.h1}
        body={t.hero.body}
        primaryCta={t.hero.primaryCta}
        secondaryCta={t.hero.secondaryCta}
        trustLine={t.hero.trustLine}
        image={{ src: HERO_IMAGE, alt: t.hero.imageAlt }}
        floatingBottom={<RosterOverlayCard />}
      />

      {/* ג”€ג”€ 1 ֲ· ROSTER PAIN (brief ֲ§5.3): scattered links ֲ· uneven readiness ֲ·
             buyer follow-up gaps ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.pain.eyebrow} title={t.pain.title} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.pain.cards.map((card, i) => {
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

      {/* ג”€ג”€ 2 ֲ· ROSTER COCKPIT (brief ֲ§5.3): artist cards, ONE next action ג”€ג”€ */}
      <Section tone="forest">
        <SectionHeading
          tone="forest"
          eyebrow={t.cockpit.eyebrow}
          title={t.cockpit.title}
          body={t.cockpit.body}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.cockpit.cards.map((card) => (
            <article
              key={card.name}
              className="mk-card"
              style={{
                background: 'rgba(243,245,239,0.04)',
                border: '1px solid rgba(243,245,239,0.12)',
                padding: 'clamp(1.4rem, 2.5vw, 1.8rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-archivo)',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--color-paper)',
                      margin: '0 0 0.2rem',
                    }}
                  >
                    {card.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.64rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(243,245,239,0.5)',
                      margin: 0,
                    }}
                  >
                    {card.tag}
                  </p>
                </div>
                <span aria-hidden="true" style={{ color: 'rgba(243,245,239,0.45)' }}>
                  <Icon id="artist" size={18} />
                </span>
              </div>
              <div
                style={{
                  borderTop: '1px solid rgba(243,245,239,0.1)',
                  paddingTop: '0.8rem',
                }}
              >
                <span
                  style={{
                    ...MONO_LABEL,
                    display: 'inline-block',
                    marginBottom: '0.45rem',
                    color: card.ready ? 'var(--color-stamp)' : 'rgba(243,245,239,0.55)',
                    border: card.ready
                      ? '1px solid rgba(200,240,77,0.35)'
                      : '1px solid rgba(243,245,239,0.2)',
                    borderRadius: '999px',
                    padding: '0.18rem 0.6rem',
                  }}
                >
                  {card.ready ? t.cockpit.readyLabel : t.cockpit.actionLabel}
                </span>
                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'rgba(243,245,239,0.75)',
                    margin: 0,
                  }}
                >
                  {card.action}
                </p>
              </div>
            </article>
          ))}
        </div>
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            color: 'rgba(243,245,239,0.55)',
            margin: '2rem 0 0',
          }}
        >
          {t.cockpit.note}
        </p>
      </Section>

      {/* ג”€ג”€ 3 ֲ· ARTISTACCESS (brief ֲ§5.3): grant, not ownership + diagram
             Artist owns identity ג†’ Manager gets scoped access ג†’ Buyer sees
             Passport, plus the trust card ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.access.eyebrow} title={t.access.title} body={t.access.body} />
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: '0.75rem',
          }}
        >
          {t.access.diagram.map((node, i) => (
            <Fragment key={node.title}>
              {i > 0 ? (
                <span
                  aria-hidden="true"
                  style={{
                    alignSelf: 'center',
                    color: 'var(--color-tally-onlight)',
                    flexShrink: 0,
                  }}
                >
                  <Icon id="arrow" size={18} />
                </span>
              ) : null}
              <div
                className="mk-card"
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(10,13,11,0.1)',
                  padding: 'clamp(1.25rem, 2.5vw, 1.6rem)',
                  flex: '1 1 240px',
                  maxWidth: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
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
                    background: 'rgba(10,13,11,0.05)',
                    border: '1px solid rgba(10,13,11,0.08)',
                    color: 'var(--color-ink)',
                  }}
                >
                  <Icon id={node.icon} size={18} />
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1rem',
                    fontWeight: 800,
                    lineHeight: 1.3,
                    color: 'var(--color-ink)',
                    margin: 0,
                  }}
                >
                  {node.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'var(--color-tally-onlight)',
                    margin: 0,
                  }}
                >
                  {node.body}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
        {/* "Grant, not ownership" trust card (brief ֲ§5.3 Add) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <TrustBadge
            methodLabel={t.access.trustCard.methodLabel}
            explanation={t.access.trustCard.explanation}
            visibility="app-only"
            tone="light"
          />
        </div>
      </Section>

      {/* ג”€ג”€ 3b ֲ· REPRESENTATION FAMILY (entity-model audit 2026-07-14):
             individual rep ֲ· booking agent ֲ· small team ֲ· agency ג€” one
             Representation workspace; roles separate from the organization ג”€ג”€ */}
      <Section tone="forest" narrow>
        <SectionHeading
          tone="forest"
          title={t.representation.title}
          body={t.representation.body}
        />
      </Section>

      {/* ג”€ג”€ 4 ֲ· ONE REACTION INBOX (brief ֲ§5.3) ג€” method-safe text only,
             never a count/%/score ג”€ג”€ */}
      <Section tone="ink" narrow>
        <SectionHeading tone="ink" eyebrow={t.inbox.eyebrow} title={t.inbox.title} body={t.inbox.body} />
        <div
          className="mk-card"
          style={{
            background: 'rgba(243,245,239,0.04)',
            border: '1px solid rgba(243,245,239,0.12)',
            padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
            <Icon id="request" size={14} color="var(--color-stamp)" />
            <span style={{ ...MONO_LABEL, color: 'var(--color-stamp)' }}>{t.inbox.panelLabel}</span>
          </div>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {t.inbox.rows.map((row) => (
              <div
                key={row.reaction}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.8rem',
                  background: 'rgba(10,13,11,0.45)',
                  border: '1px solid rgba(243,245,239,0.08)',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                }}
              >
                <span aria-hidden="true" style={{ marginTop: '2px', color: 'rgba(200,240,77,0.8)' }}>
                  <Icon id="buyer" size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.62rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(243,245,239,0.5)',
                      margin: '0 0 0.25rem',
                    }}
                  >
                    {row.artist} ֲ· {row.when}
                  </p>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      lineHeight: 1.55,
                      color: 'rgba(243,245,239,0.8)',
                      margin: 0,
                    }}
                  >
                    {row.reaction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ג”€ג”€ 5 ֲ· FINAL CTA: Join manager beta ג”€ג”€ */}
      <FinalCta
        title={t.finalCta.title}
        body={t.finalCta.body}
        primaryCta={t.finalCta.primaryCta}
        secondaryLink={t.finalCta.secondaryLink}
      />
    </main>
  )
}
