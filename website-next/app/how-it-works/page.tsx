// How It Works ג€” rebuilt per Codex exact rebuild brief ֲ§5.8 (2026-07-14).
// Hero "Start with one link. End with a Passport you control." ג†’ 6-step flow
// (artist adds link ג†’ Radar organizes ג†’ source can confirm ג†’ artist approves
// ג†’ Passport shared ג†’ buyer reacts) as a horizontal stepper on desktop and
// vertical cards on mobile (FlowRow handles both), tiny entity icons per
// step, career-workspace image, procedural detail cut above the fold.
// ALL copy lives in content/how-it-works.ts ({ en, he }); renders EN for now.


import { FinalCta } from '@/components/marketing/final-cta'
import { FlowRow, FlowStep } from '@/components/marketing/flow-step'
import { Hero } from '@/components/marketing/hero'
import { Icon } from '@/components/marketing/icons'
import { Section, SectionHeading } from '@/components/marketing/section'
import { howItWorksContent } from '@/content/how-it-works'
import { buildPageMetadata } from '@/lib/seo'

const t = howItWorksContent.en

const SITE_URL = 'https://lock.show'
const HERO_IMAGE = '/brand/lockshow-atmosphere-artist-career-workspace-v1.webp'

export const metadata = buildPageMetadata('howItWorks')

export default function HowItWorksPage() {
  return (
    <main>
      {/* ג”€ג”€ HERO (brief ֲ§5.8) ג€” no procedural detail above the fold ג”€ג”€ */}
      <Hero
        eyebrow={t.hero.eyebrow}
        title={t.hero.h1}
        body={t.hero.body}
        primaryCta={t.hero.primaryCta}
        secondaryCta={t.hero.secondaryCta}
        trustLine={t.hero.trustLine}
        image={{ src: HERO_IMAGE, alt: t.hero.imageAlt }}
        chips={t.hero.chips}
      />

      {/* ג”€ג”€ 6-STEP FLOW ג€” horizontal stepper desktop / vertical cards mobile,
             tiny entity icon on every step (brief ֲ§5.8) ג”€ג”€ */}
      <Section tone="forest">
        <SectionHeading tone="forest" eyebrow={t.flow.eyebrow} title={t.flow.title} />
        <FlowRow cols={6}>
          {t.flow.steps.map((step, i) => (
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

      {/* ג”€ג”€ WHO IS INVOLVED ג€” three roles, card rhythm paperֲ·darkֲ·paper ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading eyebrow={t.roles.eyebrow} title={t.roles.title} />
        <div
          className="m-divide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.roles.cards.map((card, i) => {
            const dark = i === 1
            return (
              <div
                key={card.label}
                className="mk-card m-flat"
                style={{
                  background: dark ? 'var(--color-forest)' : '#ffffff',
                  border: dark
                    ? '1px solid rgba(243,245,239,0.1)'
                    : '1px solid rgba(10,13,11,0.1)',
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.8rem',
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
                      background: dark ? 'rgba(200,240,77,0.12)' : 'rgba(10,13,11,0.05)',
                      border: dark
                        ? '1px solid rgba(200,240,77,0.25)'
                        : '1px solid rgba(10,13,11,0.08)',
                      color: dark ? 'var(--color-stamp)' : 'var(--color-ink)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon id={card.icon} size={18} />
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-archivo)',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      lineHeight: 1.25,
                      color: dark ? 'var(--color-paper)' : 'var(--color-ink)',
                      margin: 0,
                    }}
                  >
                    {card.label}
                  </h3>
                </div>
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
