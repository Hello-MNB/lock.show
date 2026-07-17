// Production ג€” rebuilt per Codex exact rebuild brief ֲ§5.5 (2026-07-14).
// Audience: production offices / event production teams ג€” event & lineup
// value first, never team-admin first. Route separation (Codex law):
// /producers = Source-Confirmer education ֲ· /production = THIS page.
// Firewall: "under review" reads as reading context ג€” no ranking implication,
// no score/percentile language anywhere.
// ALL copy lives in content/production.ts ({ en, he }); this page renders EN
// for now ג€” locale wiring is a later wave and stays mechanical.


import { FinalCta } from '@/components/marketing/final-cta'
import { Hero } from '@/components/marketing/hero'
import { Icon } from '@/components/marketing/icons'
import { Section, SectionHeading } from '@/components/marketing/section'
import { productionContent, type RequestStatus } from '@/content/production'
import { buildPageMetadata } from '@/lib/seo'

const t = productionContent.en

const HERO_IMAGE = '/brand/lockshow-atmosphere-production-warehouse-v1.webp'

export const metadata = buildPageMetadata('production')

const MONO_LABEL = {
  fontFamily: 'var(--font-space-mono)',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
} as const

// Status chip palette ג€” three distinct states, none reads as a grade.
const STATUS_STYLE: Record<RequestStatus, { color: string; border: string; bg: string }> = {
  sent: {
    color: 'rgba(243,245,239,0.7)',
    border: '1px solid rgba(243,245,239,0.25)',
    bg: 'transparent',
  },
  answered: {
    color: 'var(--color-stamp)',
    border: '1px solid rgba(200,240,77,0.4)',
    bg: 'rgba(200,240,77,0.1)',
  },
  closed: {
    color: 'rgba(243,245,239,0.45)',
    border: '1px solid rgba(243,245,239,0.15)',
    bg: 'rgba(243,245,239,0.04)',
  },
}

function StatusChip({ status }: { status: RequestStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <span
      style={{
        ...MONO_LABEL,
        color: s.color,
        border: s.border,
        background: s.bg,
        borderRadius: '999px',
        padding: '0.2rem 0.6rem',
        whiteSpace: 'nowrap',
      }}
    >
      {t.inbox.statusLabels[status]}
    </span>
  )
}

// ג”€ג”€ Event-lineup overlay card on the hero image (brief ֲ§5.5 Add) ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€
// "Event: Friday night / Slot open / 3 artists under review" ג€” method-safe:
// review = reading context; the footnote says so explicitly.

function EventOverlayCard() {
  const c = t.hero.eventCard
  return (
    <div
      style={{
        background: 'rgba(10,13,11,0.78)',
        border: '1px solid rgba(243,245,239,0.16)',
        borderRadius: '18px',
        padding: '0.9rem 1.1rem',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        minWidth: '215px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
        <Icon id="production" size={14} color="var(--color-stamp)" />
        <span style={{ ...MONO_LABEL, color: 'var(--color-stamp)' }}>{c.label}</span>
      </div>
      {[c.event, c.slot, c.review].map((line) => (
        <div
          key={line}
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
              color: 'rgba(243,245,239,0.8)',
            }}
          >
            {line}
          </span>
        </div>
      ))}
      <p
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '0.55rem',
          letterSpacing: '0.05em',
          color: 'rgba(243,245,239,0.45)',
          margin: '0.55rem 0 0',
          borderTop: '1px solid rgba(243,245,239,0.1)',
          paddingTop: '0.55rem',
        }}
      >
        {c.footnote}
      </p>
    </div>
  )
}

// ג”€ג”€ Page ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€

export default function ProductionPage() {
  return (
    <main data-accent="production">
      {/* ג”€ג”€ HERO (brief ֲ§5.5): warehouse image + event-lineup overlay ג”€ג”€ */}
      <Hero
        eyebrow={t.hero.eyebrow}
        title={t.hero.h1}
        body={t.hero.body}
        primaryCta={t.hero.primaryCta}
        secondaryCta={t.hero.secondaryCta}
        trustLine={t.hero.trustLine}
        image={{ src: HERO_IMAGE, alt: t.hero.imageAlt }}
        floatingBottom={<EventOverlayCard />}
      />

      {/* ג”€ג”€ 1 ֲ· BEFORE COMMITMENT (brief ֲ§5.5): fit ֲ· reliability ֲ·
             source context ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.before.eyebrow} title={t.before.title} body={t.before.body} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.before.cards.map((card, i) => {
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
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            color: 'var(--color-tally-onlight)',
            margin: '2rem 0 0',
          }}
        >
          {t.before.note}
        </p>
      </Section>

      {/* ג”€ג”€ 2 ֲ· REQUESTS INBOX (brief ֲ§5.5): sent / answered / closed chips ג”€ג”€ */}
      <Section tone="forest" narrow>
        <SectionHeading tone="forest" eyebrow={t.inbox.eyebrow} title={t.inbox.title} body={t.inbox.body} />
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
                key={`${row.artist}-${row.request}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.8rem',
                  flexWrap: 'wrap',
                  background: 'rgba(10,13,11,0.45)',
                  border: '1px solid rgba(243,245,239,0.08)',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-archivo)',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: 'var(--color-paper)',
                      margin: '0 0 0.15rem',
                    }}
                  >
                    {row.artist}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.66rem',
                      letterSpacing: '0.06em',
                      color: 'rgba(243,245,239,0.55)',
                      margin: 0,
                    }}
                  >
                    {row.request}
                  </p>
                </div>
                <StatusChip status={row.status} />
              </div>
            ))}
          </div>
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
          {t.inbox.note}
        </p>
      </Section>

      {/* ג”€ג”€ 3 ֲ· LINEUP WORKSPACE (brief ֲ§5.5): team + events + artists.
             Events first ג€” never a Team-only default (brief ֲ§5.5 Remove). ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.workspace.eyebrow} title={t.workspace.title} body={t.workspace.body} />
        {/* Entity-model audit 2026-07-14 ג€” freelancer / crew / company =
            one Production family at different scale (verbatim). */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
            color: 'var(--color-ink)',
            maxWidth: '720px',
            margin: '-1.25rem auto clamp(2rem, 4vw, 3rem)',
          }}
        >
          {t.workspace.scaleNote}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.workspace.cards.map((card) => (
            <div
              key={card.title}
              className="mk-card"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(10,13,11,0.1)',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
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
                  marginBottom: '0.8rem',
                }}
              >
                <Icon id={card.icon} size={18} />
              </span>
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
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            color: 'var(--color-tally-onlight)',
            margin: '2rem 0 0',
          }}
        >
          {t.workspace.note}
        </p>
      </Section>

      {/* ג”€ג”€ 4 ֲ· FINAL CTA: Join production beta ג”€ג”€ */}
      <FinalCta
        title={t.finalCta.title}
        body={t.finalCta.body}
        primaryCta={t.finalCta.primaryCta}
        secondaryLink={t.finalCta.secondaryLink}
      />
    </main>
  )
}
