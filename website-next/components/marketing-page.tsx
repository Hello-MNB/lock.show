'use client'

import Image from 'next/image'
import { useLocale } from '@/lib/locale-context'
import { marketingCopy, type MarketingPageId } from '@/lib/marketing-copy'
import { TrackedLink } from '@/components/tracked-link'

const heroImages: Partial<Record<MarketingPageId, { src: string; altEn: string; altHe: string }>> = {
  home: {
    src: '/lockshow-hero-live.webp',
    altEn: 'An artist performing under stage light',
    altHe: 'אמן מופיע תחת תאורת במה',
  },
  artists: {
    src: '/lockshow-persona-artist-v1.webp',
    altEn: 'An artist preparing for a live performance',
    altHe: 'אמן מתכונן להופעה חיה',
  },
  professionals: {
    src: '/lockshow-evidence-review.webp',
    altEn: 'A music professional reviewing material at a desk',
    altHe: 'איש מקצוע בתחום המוזיקה בוחן חומר ליד שולחן',
  },
}

function PrimaryActions({ context }: { context: string }) {
  const { locale } = useLocale()
  const copy = marketingCopy[locale]
  return (
    <div className="marketing-actions">
      <TrackedLink
        href="/early-access#request"
        eventName="early_access_cta_click"
        eventContext={context}
        className="button button-primary"
      >
        {copy.common.primaryCta}
      </TrackedLink>
      {context !== 'how' && (
        <TrackedLink
          href="/how-it-works"
          eventName="secondary_cta_click"
          eventContext={context}
          className="button button-secondary"
        >
          {copy.common.secondaryCta}
        </TrackedLink>
      )}
    </div>
  )
}

function PageHero({
  page,
  kicker,
  title,
  lead,
}: {
  page: MarketingPageId
  kicker: string
  title: string
  lead: string
}) {
  const { locale } = useLocale()
  const image = heroImages[page]
  return (
    <section className={`marketing-hero${image ? ' marketing-hero-with-image' : ''}`}>
      {image && (
        <Image
          src={image.src}
          alt={locale === 'he' ? image.altHe : image.altEn}
          fill
          priority={page === 'home'}
          sizes="100vw"
          className="marketing-hero-image"
        />
      )}
      <div className="marketing-hero-scrim" aria-hidden="true" />
      <div className="marketing-container marketing-hero-inner">
        <p className="marketing-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p className="marketing-lead">{lead}</p>
        <PrimaryActions context={page} />
      </div>
    </section>
  )
}

function SectionHeading({ label, title, body }: { label: string; title: string; body?: string }) {
  return (
    <header className="marketing-section-heading">
      <p className="marketing-kicker marketing-kicker-dark">{label}</p>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </header>
  )
}

function StepGrid({ items }: { items: Array<{ label: string; title: string; body: string }> }) {
  return (
    <div className="marketing-step-grid">
      {items.map((item) => (
        <article className="marketing-step" key={`${item.label}-${item.title}`}>
          <p className="marketing-kicker marketing-kicker-dark">{item.label}</p>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  )
}

function ValueGrid({ items }: { items: Array<{ title: string; body: string }> }) {
  return (
    <div className="marketing-value-grid">
      {items.map((item) => (
        <article className="marketing-value" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  )
}

function EarlyAccessBand({ context }: { context: string }) {
  const { locale } = useLocale()
  const copy = marketingCopy[locale]
  return (
    <section className="marketing-early-band">
      <div className="marketing-container marketing-early-inner">
        <div>
          <p className="marketing-kicker">{copy.common.eyebrow}</p>
          <h2>{copy.common.earlyTitle}</h2>
          <p>{copy.common.earlyBody}</p>
        </div>
        <TrackedLink
          href="/early-access#request"
          eventName="early_access_cta_click"
          eventContext={`${context}_final`}
          className="button button-primary"
        >
          {copy.common.primaryCta}
        </TrackedLink>
      </div>
    </section>
  )
}

function HomePage() {
  const { locale } = useLocale()
  const copy = marketingCopy[locale]
  return (
    <>
      <PageHero page="home" kicker={copy.home.kicker} title={copy.home.title} lead={copy.home.lead} />
      <section className="marketing-section marketing-section-paper">
        <div className="marketing-container marketing-two-column">
          <SectionHeading label={copy.home.problemLabel} title={copy.home.problemTitle} />
          <p className="marketing-large-copy">{copy.home.problemBody}</p>
        </div>
      </section>
      <section className="marketing-section marketing-section-light">
        <div className="marketing-container">
          <SectionHeading label={copy.home.flowLabel} title={copy.home.flowTitle} />
          <StepGrid items={copy.home.flow} />
        </div>
      </section>
      <section className="marketing-section marketing-section-paper">
        <div className="marketing-container">
          <SectionHeading label={copy.home.valueLabel} title={copy.home.valueTitle} />
          <ValueGrid items={copy.home.values} />
        </div>
      </section>
      <section className="marketing-section marketing-section-night">
        <div className="marketing-container marketing-narrow">
          <p className="marketing-kicker">{copy.home.trustLabel}</p>
          <h2>{copy.home.trustTitle}</h2>
          <p>{copy.home.trustBody}</p>
          <TrackedLink href="/trust" eventName="trust_link_click" eventContext="home" className="text-link">
            {copy.nav.trust} →
          </TrackedLink>
        </div>
      </section>
      <EarlyAccessBand context="home" />
    </>
  )
}

function StandardPage({ page }: { page: Exclude<MarketingPageId, 'home' | 'faq' | 'sample'> }) {
  const { locale } = useLocale()
  const copy = marketingCopy[locale]
  const model = page === 'how'
    ? { ...copy.how, items: copy.how.steps, lowerTitle: copy.how.boundaryTitle, lowerBody: copy.how.boundaryBody, steps: true as const }
    : page === 'artists'
      ? { ...copy.artists, items: copy.artists.values, lowerTitle: copy.artists.actsTitle, lowerBody: copy.artists.actsBody, steps: false as const }
      : page === 'professionals'
        ? { ...copy.professionals, items: copy.professionals.values, lowerTitle: copy.professionals.boundaryTitle, lowerBody: copy.professionals.boundaryBody, steps: false as const }
        : { ...copy.trust, items: copy.trust.values, lowerTitle: copy.trust.freshnessTitle, lowerBody: copy.trust.freshnessBody, steps: false as const }
  return (
    <>
      <PageHero page={page} kicker={model.kicker} title={model.title} lead={model.lead} />
      <section className="marketing-section marketing-section-paper">
        <div className="marketing-container">
          {model.steps ? <StepGrid items={model.items} /> : <ValueGrid items={model.items} />}
        </div>
      </section>
      <section className="marketing-section marketing-section-light">
        <div className="marketing-container marketing-narrow">
          <SectionHeading label={copy.common.eyebrow} title={model.lowerTitle} body={model.lowerBody} />
          <p className="marketing-boundary">{copy.common.disclaimer}</p>
        </div>
      </section>
      <EarlyAccessBand context={page} />
    </>
  )
}

function FaqPage() {
  const { locale } = useLocale()
  const copy = marketingCopy[locale]
  return (
    <>
      <PageHero page="faq" kicker={copy.faq.kicker} title={copy.faq.title} lead={copy.faq.lead} />
      <section className="marketing-section marketing-section-paper">
        <div className="marketing-container marketing-faq-list">
          {copy.faq.items.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <EarlyAccessBand context="faq" />
    </>
  )
}

function SamplePage() {
  const { locale } = useLocale()
  const copy = marketingCopy[locale]
  return (
    <>
      <PageHero page="sample" kicker={copy.sample.kicker} title={copy.sample.title} lead={copy.sample.lead} />
      <section className="marketing-section marketing-section-paper">
        <div className="marketing-container marketing-narrow">
          <p className="marketing-sample-notice">{copy.sample.notice}</p>
          <ValueGrid items={copy.sample.items} />
          <p className="marketing-boundary">{copy.common.disclaimer}</p>
        </div>
      </section>
      <EarlyAccessBand context="sample" />
    </>
  )
}

export function MarketingPage({ page }: { page: MarketingPageId }) {
  const { dir } = useLocale()
  return (
    <main className="marketing-site" dir={dir}>
      {page === 'home' && <HomePage />}
      {page !== 'home' && page !== 'faq' && page !== 'sample' && <StandardPage page={page} />}
      {page === 'faq' && <FaqPage />}
      {page === 'sample' && <SamplePage />}
    </main>
  )
}
