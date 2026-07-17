import type { Metadata } from 'next'
import Link from 'next/link'

import { APP_URL } from '@/lib/app-url'

export const metadata: Metadata = {
  alternates: { canonical: '/pricing' },
  title: 'Pricing — What Each Person Pays',
  description:
    'Artists build and publish free during the pilot. Booking managers read Passports free, always. Producers never need an account. Agency roster plans come later.',
  openGraph: {
    url: '/pricing',
    title: 'Pricing | LOCK',
    description:
      'One page, four honest answers — artist, booking manager, producer, agency. And the things money can never buy here.',
    type: 'website',
  },
}

/* ── The four answers — one per entity ─────────────────── */
const seats = [
  {
    label: 'FOR ARTISTS',
    price: 'Free during the pilot',
    line: 'Build your Radar, shape your story, publish your Passport — all of it free while the pilot runs.',
    points: [
      'A full first scan of your gig and platform history',
      'Your private Radar workspace — only you see it',
      'Publishing your Passport, on your approval',
      'Full export and delete, any time',
    ],
    cta: { text: 'START FREE IN THE PILOT →', href: `${APP_URL}/signup`, primary: true },
    note: 'The pilot is a closed beta for Israeli artists. When pricing comes, it will be set with the artists already inside.',
  },
  {
    label: 'FOR BOOKING MANAGERS',
    price: 'Free, always',
    line: 'You receive proof — you don’t pay for it. Opening a Passport someone sends you never costs a thing.',
    points: [
      'Open any shared Passport link — no account needed',
      'Every claim carries its source and date',
      'Reply with an availability request in one tap',
    ],
    cta: { text: 'How booking managers use LOCK →', href: '/bookers', primary: false },
    note: 'This one is permanent. A paywall between you and the proof would defeat the whole idea.',
  },
  {
    label: 'FOR PRODUCERS',
    price: 'Nothing — no account at all',
    line: 'An artist asks you to confirm one show you ran. One tap from a link, and you’re done.',
    points: [
      'No signup, no app, no password',
      'Confirm, correct, or skip — your call',
      'Nothing to pay, nothing to join, no follow-ups',
    ],
    cta: { text: 'What producers confirm →', href: '/producers', primary: false },
    note: 'Your word is the product here. Charging you for giving it would be absurd.',
  },
  {
    label: 'FOR AGENCIES & ROSTERS',
    price: 'Plans come later',
    line: 'Roster tools are coming for agencies — one view across every artist you represent. Pricing arrives with them.',
    points: [
      'One screen across the whole roster',
      'Artists keep ownership of their own Passports',
      'Built with the first offices that raise a hand',
    ],
    cta: { text: 'Register roster interest →', href: '/contact', primary: false },
    note: 'No numbers yet, on purpose. We’d rather build it with you than guess at it.',
  },
]

/* ── The permanent principle — the only "forever" we say ── */
const neverForSale = [
  'Publication of a Passport',
  'A badge, seal, or verified status',
  'A better spot in anyone’s view',
  'A score or ranking — there is none to sell',
]

/* ── FAQ (visible + JSON-LD share this source) ──────────── */
const faq = [
  {
    q: 'Is LOCK free for artists?',
    a: 'Yes — free during the pilot. The pilot is a closed beta for Israeli artists: building your Radar and publishing your Passport cost nothing while it runs. When the pilot ends, pricing will be set together with the artists already inside — and we will say so clearly before anything changes.',
  },
  {
    q: 'Can a paid plan ever buy a better Passport?',
    a: 'No — and this is the one permanent promise on this page. A paid plan never buys publication, a badge, or a better spot. Those aren’t for sale. What a Passport shows is decided by what actually happened and by the artist’s own approval — never by money.',
  },
  {
    q: 'Do booking managers pay to read a Passport?',
    a: 'No. Reading a Passport is free, always. A booking manager receiving a Passport link opens it in the browser — no account, no paywall. That stays true permanently.',
  },
  {
    q: 'Do producers need an account or a plan?',
    a: 'Never. A producer confirming a show taps one link, looks at one night they ran, and answers. There is nothing to pay, nothing to join, and no account is ever created for them.',
  },
  {
    q: 'What will agencies and rosters pay?',
    a: 'Roster tools for agencies and management offices are coming, and pricing arrives with them. No numbers are set yet — the plans will be built with the first offices that join.',
  },
  {
    q: 'What happens to artist pricing after the pilot?',
    a: 'It gets decided with the founding artists, based on real usage — not announced at them. Whatever comes, the not-for-sale list above does not move: publication, badges, and placement will never be things money can buy.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const mono = 'var(--font-space-mono), monospace'
const sans = 'var(--font-heebo), system-ui, sans-serif'
const heading = 'var(--font-archivo), system-ui, sans-serif'

export default function Pricing() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: sans }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── HERO — live-crowd band with dark veil ─────────── */}
      <section
        style={{
          overflow: 'hidden',
          minHeight: 'min(78svh, 720px)',
          background: `linear-gradient(180deg, rgba(10,13,11,0.55) 0%, rgba(10,13,11,0.86) 55%, rgba(10,13,11,0.97) 100%), url('/lockshow-hero-live.webp') center/cover no-repeat`,
          color: 'var(--color-paper)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
        }}
      >
        <div style={{ maxWidth: '1120px', width: '100%', margin: '0 auto' }}>
          <div style={{ maxWidth: '640px' }}>
            <p
              style={{
                fontFamily: mono,
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                color: 'rgba(243,245,239,0.72)',
                textTransform: 'uppercase',
                marginBottom: '1.75rem',
              }}
            >
              PRICING
            </p>
            <h1
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                fontWeight: 400,
                lineHeight: 0.96,
                letterSpacing: '-0.055em',
                color: 'var(--color-paper)',
                marginBottom: '1.5rem',
              }}
            >
              Four people make a booking happen.
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
                Here&apos;s what each one pays.
              </em>
            </h1>
            <p
              style={{
                fontFamily: sans,
                fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
                lineHeight: 1.65,
                color: 'rgba(243,245,239,0.78)',
                maxWidth: '520px',
                marginBottom: '2.25rem',
              }}
            >
              The short version: during the pilot, almost nobody pays anything. And the
              things that make proof worth trusting are never for sale — to anyone.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <a
                href={`${APP_URL}/signup`}
                style={{
                  background: 'var(--color-stamp)',
                  color: 'var(--color-ink)',
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '0.95rem 1.75rem',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  display: 'inline-block',
                }}
              >
                START FREE IN THE PILOT →
              </a>
              <Link
                href="/passport/demo"
                style={{
                  border: '1px solid rgba(243,245,239,0.22)',
                  color: 'var(--color-paper)',
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '0.95rem 1.75rem',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  display: 'inline-block',
                }}
              >
                SEE A SAMPLE PASSPORT
              </Link>
            </div>
            <p
              style={{
                fontFamily: mono,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: 'rgba(243,245,239,0.55)',
                textTransform: 'uppercase',
                marginTop: '1.5rem',
              }}
            >
              NO SCORES · NO RANKINGS · NOTHING BOUGHT
            </p>
          </div>
        </div>
      </section>

      {/* ── THE FOUR ANSWERS ──────────────────────────────── */}
      <section style={{ background: 'var(--color-paper)', padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: mono,
              fontSize: '0.75rem',
              color: 'var(--color-tally-onlight)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            THE FOUR ANSWERS
          </p>
          <h2
            style={{
              fontFamily: heading,
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '0.75rem',
            }}
          >
            Whoever you are in the room, here&apos;s your answer.
          </h2>
          <p
            style={{
              fontFamily: sans,
              fontSize: '1rem',
              color: 'var(--color-tally-onlight)',
              lineHeight: 1.6,
              maxWidth: '560px',
              marginBottom: '2.5rem',
            }}
          >
            Artist, booking manager, producer, agency — one card each, no fine print
            hiding underneath.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {seats.map((seat) => (
              <div
                key={seat.label}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-mist)',
                  borderRadius: '16px',
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <p
                  style={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--color-stamp-onlight)',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  {seat.label}
                </p>
                <h3
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 400,
                    fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    color: 'var(--color-ink)',
                    margin: 0,
                  }}
                >
                  {seat.price}
                </h3>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: '1rem',
                    color: 'var(--color-tally-onlight)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {seat.line}
                </p>
                <div style={{ height: '1px', background: 'var(--color-mist)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {seat.points.map((point) => (
                    <div key={point} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: '0.75rem',
                          color: 'var(--color-stamp-onlight)',
                          flexShrink: 0,
                          paddingTop: '3px',
                        }}
                      >
                        ✓
                      </span>
                      <p style={{ fontFamily: sans, fontSize: '1rem', color: 'var(--color-ink)', lineHeight: 1.55, margin: 0 }}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: '1rem',
                    color: 'var(--color-tally-onlight)',
                    lineHeight: 1.55,
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  {seat.note}
                </p>
                {seat.cta.primary ? (
                  <a
                    href={seat.cta.href}
                    style={{
                      background: 'var(--color-stamp)',
                      color: 'var(--color-ink)',
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      padding: '0.95rem 1.5rem',
                      textDecoration: 'none',
                      borderRadius: '10px',
                      textAlign: 'center',
                      display: 'inline-block',
                      marginTop: 'auto',
                    }}
                  >
                    {seat.cta.text}
                  </a>
                ) : (
                  <Link
                    href={seat.cta.href}
                    style={{
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: 'var(--color-ink)',
                      textDecoration: 'none',
                      borderBottom: '2px solid var(--color-stamp)',
                      paddingBottom: '3px',
                      alignSelf: 'flex-start',
                      marginTop: 'auto',
                    }}
                  >
                    {seat.cta.text}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOT FOR SALE — the one permanent promise ──────── */}
      <section
        style={{
          background: 'var(--color-night)',
          color: 'var(--color-paper)',
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(2rem, 5vw, 4rem)',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: mono,
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp)',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              THE ONE PERMANENT PROMISE
            </p>
            <h2
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                marginBottom: '1.25rem',
              }}
            >
              A paid plan never buys a better story.
            </h2>
            <p
              style={{
                fontFamily: sans,
                fontSize: '1rem',
                color: 'rgba(243,245,239,0.72)',
                lineHeight: 1.7,
                maxWidth: '480px',
                marginBottom: '1.75rem',
              }}
            >
              Prices can change as LOCK grows — that&apos;s honest. What never changes is
              this: money moves nothing on a Passport. What it shows is decided by what
              actually happened, and by the artist&apos;s own approval.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {neverForSale.map((item) => (
                <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: '0.8rem',
                      color: 'var(--color-stamp)',
                      flexShrink: 0,
                      paddingTop: '2px',
                    }}
                  >
                    ✗
                  </span>
                  <p style={{ fontFamily: sans, fontSize: '1rem', color: 'rgba(243,245,239,0.85)', lineHeight: 1.55, margin: 0 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(243,245,239,0.12)',
              minHeight: '280px',
              background: `linear-gradient(180deg, rgba(10,13,11,0.1) 0%, rgba(10,13,11,0.45) 100%), url('/lockshow-evidence-review.webp') center/cover no-repeat`,
            }}
            role="img"
            aria-label="A booking manager reviewing evidence on a Passport"
          />
          {/* TODO: swap in a lockshow-atmosphere-* scene when Codex's Drive assets land */}
        </div>
      </section>

      {/* ── AFTER THE PILOT — honest, no "forever" ────────── */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
          borderBottom: '1px solid var(--color-mist)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px' }}>
            <p
              style={{
                fontFamily: mono,
                fontSize: '0.75rem',
                color: 'var(--color-tally-onlight)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              AFTER THE PILOT
            </p>
            <h2
              style={{
                fontFamily: heading,
                fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
                color: 'var(--color-ink)',
                marginBottom: '1rem',
              }}
            >
              We&apos;d rather tell you the truth than promise you forever.
            </h2>
            <p
              style={{
                fontFamily: sans,
                fontSize: '1rem',
                color: 'var(--color-tally-onlight)',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Right now LOCK is in a closed pilot with Israeli artists, and artists build
              free. When the pilot ends, artist pricing gets worked out with the founding
              artists — in the open, based on real use, before anything changes. Booking
              managers reading Passports stay free, producers never need an account, and
              the not-for-sale list above doesn&apos;t move. That&apos;s the deal.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING FAQ ───────────────────────────────────── */}
      <section style={{ background: 'var(--color-paper)', padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px' }}>
            <p
              style={{
                fontFamily: mono,
                fontSize: '0.75rem',
                color: 'var(--color-tally-onlight)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '2rem',
              }}
            >
              PRICING FAQ
            </p>
            {faq.map((item) => (
              <details key={item.q} style={{ borderBottom: '1px solid var(--color-mist)' }}>
                <summary
                  style={{
                    padding: '1.25rem 0',
                    cursor: 'pointer',
                    fontFamily: heading,
                    fontSize: '1.05rem',
                    lineHeight: 1.4,
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    color: 'var(--color-ink)',
                  }}
                >
                  <span>{item.q}</span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: '0.85rem',
                      color: 'var(--color-stamp-onlight)',
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </summary>
                <p
                  style={{
                    padding: '0 0 1.5rem 0',
                    fontFamily: sans,
                    fontSize: '1rem',
                    color: 'var(--color-tally-onlight)',
                    lineHeight: 1.7,
                    margin: 0,
                    maxWidth: '640px',
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── DARK CLOSING CTA ──────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-night)',
          color: 'var(--color-paper)',
          padding: 'clamp(3.5rem, 9vw, 6.5rem) max(24px, 4vw)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 'clamp(1.9rem, 4vw, 2.75rem)',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              marginBottom: '1rem',
            }}
          >
            The pilot is open. The price is your time.
          </h2>
          <p
            style={{
              fontFamily: sans,
              fontSize: '1rem',
              color: 'rgba(243,245,239,0.72)',
              lineHeight: 1.65,
              marginBottom: '2rem',
            }}
          >
            Start with one link. Radar helps you build from there — and every show you
            play makes the next room easier to enter.
          </p>
          <a
            href={`${APP_URL}/signup`}
            style={{
              background: 'var(--color-stamp)',
              color: 'var(--color-ink)',
              fontFamily: mono,
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '0.95rem 1.75rem',
              textDecoration: 'none',
              borderRadius: '10px',
              display: 'inline-block',
            }}
          >
            START FREE IN THE PILOT →
          </a>
        </div>
      </section>
    </main>
  )
}
