// Pricing ג†’ FREE PILOT ג€” rebuilt per Codex exact rebuild brief ֲ§5.7
// (2026-07-14). The route stays /pricing (nav relabel is a later wave), but
// the page is conceptually "Free Pilot": NO pricing table, NO paid plan
// names, NO payment CTA. ALL copy lives in content/pricing.ts ({ en, he });
// this page renders EN for now ג€” locale wiring is a later wave.


import { EntityCard } from '@/components/marketing/entity-card'
import { FinalCta } from '@/components/marketing/final-cta'
import { ProductCompositionHero } from '@/components/marketing/product-composition-hero'
import { Section, SectionHeading } from '@/components/marketing/section'
import { pricingContent } from '@/content/pricing'
import { buildPageMetadata } from '@/lib/seo'

const t = pricingContent.en

const SITE_URL = 'https://lock.show'

export const metadata = buildPageMetadata('freePilot')

export default function FreePilotPage() {
  return (
    <main data-accent="free-pilot">
      {/* ג”€ג”€ HERO ג€” product composition, NO photo (Codex build scope ֲ§7).
             Central lime "Free pilot" tile + 5 orbiting entity chips. ג”€ג”€ */}
      <ProductCompositionHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.h1}
        body={t.hero.body}
        primaryCta={t.hero.primaryCta}
        secondaryCta={t.hero.secondaryCta}
        trustLine={t.hero.trustLine}
        coreEyebrow="No plans yet"
        coreTitle="Free pilot"
        chips={[
          { label: 'Artist', icon: 'artist' },
          { label: 'Buyer', icon: 'buyer' },
          { label: 'Representation', icon: 'manager' },
          { label: 'Production', icon: 'production' },
          { label: 'Source confirmation', icon: 'source' },
        ]}
        note="No payment ֲ· No scores ֲ· Artist controls publication"
      />

      {/* ג”€ג”€ 5 ENTITY CARDS ג€” Artist / Buyer / Manager / Production / Source
             confirmer (brief ֲ§5.7). Card rhythm: first card dark. ג”€ג”€ */}
      <Section tone="paper">
        <SectionHeading
          eyebrow={t.entities.eyebrow}
          title={t.entities.title}
          body={t.entities.body}
        />
        {/* 5 cards: mk-grid-5 lays them out 3 + 2 at desktop widths so the
            last row is intentional (no lone orphan card). */}
        <div className="m-divide mk-grid-5">
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

      {/* ג”€ג”€ FINAL CTA ג€” "Join free pilot" (the section's single lime CTA) ג”€ג”€ */}
      <FinalCta
        title={t.finalCta.title}
        body={t.finalCta.body}
        primaryCta={t.finalCta.primaryCta}
        secondaryLink={t.finalCta.secondaryLink}
      />
    </main>
  )
}
