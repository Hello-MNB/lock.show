// Pricing → FREE PILOT — rebuilt per Codex exact rebuild brief §5.7
// (2026-07-14). The route stays /pricing (nav relabel is a later wave), but
// the page is conceptually "Free Pilot": NO pricing table, NO paid plan
// names, NO payment CTA. ALL copy lives in content/pricing.ts ({ en, he });
// this page renders EN for now — locale wiring is a later wave.

import type { Metadata } from 'next'

import { EntityCard } from '@/components/marketing/entity-card'
import { FinalCta } from '@/components/marketing/final-cta'
import { Hero } from '@/components/marketing/hero'
import { Section, SectionHeading } from '@/components/marketing/section'
import { pricingContent } from '@/content/pricing'

const t = pricingContent.en

const SITE_URL = 'https://lock.show'
const HERO_IMAGE = '/brand/lockshow-social-cover-growth-intelligence-v1.webp'

export const metadata: Metadata = {
  alternates: { canonical: '/pricing' },
  title: t.meta.title,
  description: t.meta.description,
  openGraph: {
    title: t.meta.title,
    description: t.meta.description,
    type: 'website',
    url: `${SITE_URL}/pricing`,
  },
}

export default function FreePilotPage() {
  return (
    <main>
      {/* ── HERO — H1 "Free pilot. No plans yet." (brief §5.7) ── */}
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

      {/* ── 5 ENTITY CARDS — Artist / Buyer / Manager / Production / Source
             confirmer (brief §5.7). Card rhythm: first card dark. ── */}
      <Section tone="paper">
        <SectionHeading
          eyebrow={t.entities.eyebrow}
          title={t.entities.title}
          body={t.entities.body}
        />
        <div
          className="m-divide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {t.entities.cards.map((card, i) => (
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

      {/* ── FINAL CTA — "Join free pilot" (the section's single lime CTA) ── */}
      <FinalCta
        title={t.finalCta.title}
        body={t.finalCta.body}
        primaryCta={t.finalCta.primaryCta}
        secondaryLink={t.finalCta.secondaryLink}
      />
    </main>
  )
}
