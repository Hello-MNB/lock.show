import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Free for Booking Managers | GIGPROOF',
  description: 'GIGPROOF is always free for booking managers. Artists pay for access to build and publish their Passport. In closed beta — pricing by direct arrangement.',
}

import { APP_URL } from '@/lib/app-url'

const bookerIncludes = [
  'View any shared Passport link — no account needed',
  'See full method labels, dates, and geographic context',
  'Send an availability request through the Passport',
  'Never asked to create an account or pay anything',
]

const artistIncludes = [
  'Artist Radar — private evidence workspace',
  'Unlimited gig logging and evidence management',
  'Producer verification magic links',
  'Bookability Passport — WhatsApp-shareable',
  'Artist-controlled publication (you approve everything)',
  'Availability request inbox',
]

const notIncluded = [
  'No score. No ranking. No prediction.',
  'No booking guarantee.',
  'No automated matching or discovery (coming later).',
  'No management or agency workspace (coming later).',
]

export default function Pricing() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* PAGE HEADER */}
      <section style={{ padding: '72px 24px 56px', borderBottom: '1px solid rgba(10,13,11,0.08)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp-onlight)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            PRICING
          </p>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            margin: '0 0 20px',
          }}>
            Free for booking managers. By arrangement for artists.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally-onlight)', maxWidth: '540px', lineHeight: 1.6, margin: 0 }}>
            We&apos;re in closed beta. Access is direct and by arrangement — no credit card, no subscription page yet.
            Booking managers are always free.
          </p>
        </div>
      </section>

      {/* TWO TIERS */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>

          {/* Booking Manager — Free */}
          <div style={{
            border: '1px solid rgba(10,13,11,0.08)',
            borderRadius: 'var(--radius-sm)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally-onlight)',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                FOR BOOKING MANAGERS · אמרגנים
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '3rem',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  Free
                </span>
                <span style={{ color: 'var(--color-tally-onlight)', fontSize: '0.9rem' }}>always</span>
              </div>
              <p style={{ color: 'var(--color-tally-onlight)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                No account required. No email signup. Open a Passport link in your browser.
              </p>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(10,13,11,0.08)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bookerIncludes.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--color-stamp-onlight)',
                    flexShrink: 0,
                    paddingTop: '2px',
                  }}>✓</span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.5 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <a
              href="/passport/demo"
              style={{
                display: 'inline-block',
                padding: '13px 24px',
                backgroundColor: 'transparent',
                color: 'var(--color-ink)',
                border: '1px solid rgba(10,13,11,0.2)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                marginTop: 'auto',
              }}
            >
              SEE A SAMPLE PASSPORT
            </a>
          </div>

          {/* Artist — Beta */}
          <div style={{
            border: '2px solid var(--color-stamp)',
            borderRadius: 'var(--radius-sm)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative',
          }}>
            {/* Beta tag */}
            <div style={{
              position: 'absolute',
              top: '-1px',
              right: '24px',
              backgroundColor: 'var(--color-stamp)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              padding: '4px 10px',
            }}>
              CLOSED BETA
            </div>

            <div>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp-onlight)',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                FOR ARTISTS · אמנים
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '2rem',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  By arrangement
                </span>
              </div>
              <p style={{ color: 'var(--color-tally-onlight)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                During beta, artist access is by direct arrangement. Manual payment via Bit or bank transfer.
                Pricing will be published when we exit beta.
              </p>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(200,240,77,0.15)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {artistIncludes.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--color-stamp-onlight)',
                    flexShrink: 0,
                    paddingTop: '2px',
                  }}>✓</span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', margin: 0, lineHeight: 1.5 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <a
              href="/contact"
              style={{
                display: 'inline-block',
                padding: '13px 24px',
                backgroundColor: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                marginTop: 'auto',
              }}
            >
              REQUEST BETA ACCESS →
            </a>
          </div>

        </div>
      </section>

      {/* WHAT'S NOT INCLUDED */}
      <section style={{ padding: '64px 24px', backgroundColor: 'var(--color-paper)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally-onlight)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            BY DESIGN — NOT IN ANY TIER
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            letterSpacing: '-0.02em',
            marginBottom: '32px',
          }}>
            What you will never pay for — because it doesn&apos;t exist.
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            {notIncluded.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                  border: '1px solid rgba(178,59,46,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(178,59,46,0.03)',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--color-void)',
                  flexShrink: 0,
                }}>✗</span>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.5 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ROW */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally-onlight)',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}>
            PRICING FAQ
          </p>
          {[
            {
              q: 'Will there always be a free tier for booking managers?',
              a: 'Yes. Booking managers viewing Passports will always be free. This is structural to how GIGPROOF works — the booking manager receiving a Passport link should never face a paywall.',
            },
            {
              q: 'Why is pricing "by arrangement" and not listed?',
              a: 'We are in closed beta. Our focus is on validating the product with real artists and booking managers, not on publishing a subscription page. Pricing will be published when we exit beta and have locked the offer based on what we learn.',
            },
            {
              q: 'What does "manual payment" mean?',
              a: 'During beta, artists pay by Bit or bank transfer. Payment is confirmed manually by the founding team, who then activate entitlement in the system. No credit card processing yet.',
            },
            {
              q: 'Does paying for access improve my Passport or evidence labels?',
              a: 'No. Payment buys workflow access — the ability to log gigs, request verification, and publish a Passport. It does not change method labels, upgrade evidence, or affect what a booking manager sees. The evidence means what the evidence means.',
            },
          ].map((item, i) => (
            <details
              key={i}
              style={{ borderBottom: '1px solid rgba(10,13,11,0.08)' }}
            >
              <summary style={{
                padding: '20px 0',
                cursor: 'pointer',
                fontFamily: 'var(--font-archivo)',
                fontSize: '1rem',
                lineHeight: 1.4,
                listStyle: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
              }}>
                <span>{item.q}</span>
                <span style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--color-stamp-onlight)',
                  flexShrink: 0,
                }}>+</span>
              </summary>
              <p style={{
                padding: '0 0 24px 0',
                fontSize: '0.925rem',
                color: 'var(--color-tally-onlight)',
                lineHeight: 1.7,
                margin: 0,
                maxWidth: '600px',
              }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        backgroundColor: 'var(--color-night)',
        color: '#fff',
        padding: '72px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Ready to build your Passport?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', lineHeight: 1.6 }}>
            Contact us to join the beta — or go straight to the app if you&apos;re an artist who already has access.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/contact"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                backgroundColor: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
              }}
            >
              REQUEST ACCESS →
            </a>
            <a
              href={APP_URL}
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              GO TO APP
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
