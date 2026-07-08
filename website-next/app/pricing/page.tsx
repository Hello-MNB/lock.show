import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Free to Publish, Plans for More | LOCK',
  description: 'Publishing a Passport is free — always. Momentum keeps an artist\'s proof fresh; Roster gives a management office one readiness view across artists. Pilot pricing on request — no locked numbers yet.',
}

import { APP_URL } from '@/lib/app-url'

const artistAlwaysFree = [
  'Identity & positioning — name, act, genre, geography',
  'A first deep scan of your professional universe',
  'Limited evidence logging in your Artist Radar',
  'Passport publication — never paywalled, ever',
  'Availability request inbox',
  'Full export and delete, any time',
]

const buyerAlwaysFree = [
  'View any shared Passport link — no account needed',
  'Full method labels, dates, and geographic context',
  'Send an availability request through the Passport',
  'Free. Forever. Not a trial.',
]

const momentumFeatures = [
  'Deep re-scans as your universe grows',
  'Freshness — nothing goes stale before the next call',
  'Incremental scans after every new gig',
  'Private guidance — your one next move, never public',
]

const rosterFeatures = [
  'Multi-artist booking-readiness view, one screen',
  'Team seats included — the plan is per workspace, not per head',
  'Pitch-prep tools for sending artists forward',
  "Your artists' own plans stay theirs — no double billing",
]

const neverIncluded = [
  'No score. No ranking. No prediction.',
  'No booking guarantee.',
  'No badge or status bought with money.',
  'No ownership transfer — an artist who leaves takes their Passport with them.',
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
            Publication is free. It always will be.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally-onlight)', maxWidth: '560px', lineHeight: 1.6, margin: '0 0 16px' }}>
            A plan buys the work behind your proof — a deep scan of your universe, a private
            reflection of what you actually have, guidance on the next move, and the freshness
            that keeps it all alive. It never buys publication, a badge, or a ranking. Those don&apos;t exist to sell.
          </p>
        </div>
      </section>

      {/* WHAT'S ALWAYS FREE — same visual weight as the plans */}
      <section style={{ padding: '64px 24px', borderBottom: '1px solid rgba(10,13,11,0.08)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp-onlight)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            WHAT&apos;S ALWAYS FREE — NO TIER, NO TRIAL, NO CATCH
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            letterSpacing: '-0.02em',
            marginBottom: '32px',
            maxWidth: '640px',
          }}>
            Building your proof and reading someone else&apos;s proof — both free, permanently.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {/* Artist always-free */}
            <div style={{
              border: '2px solid var(--color-stamp)',
              borderRadius: 'var(--radius-sm)',
              padding: '32px 28px',
            }}>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp-onlight)',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                FOR ARTISTS · אמנים
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {artistAlwaysFree.map((item, i) => (
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
            </div>

            {/* Buyer always-free */}
            <div style={{
              border: '2px solid var(--color-stamp)',
              borderRadius: 'var(--radius-sm)',
              padding: '32px 28px',
            }}>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp-onlight)',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                FOR BOOKING MANAGERS · אמרגנים
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {buyerAlwaysFree.map((item, i) => (
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
            </div>
          </div>
        </div>
      </section>

      {/* THE PLANS — Passport (free) / Momentum (artist) / Roster (manager) */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally-onlight)',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}>
            THE PLANS
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>

            {/* Passport — free tier */}
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
                  ARTIST · FREE
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-archivo)', fontSize: '2.25rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    Passport
                  </span>
                </div>
                <p style={{ color: 'var(--color-tally-onlight)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  Your career, provable. Your universe scanned, your radar live, your passport published — free.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(10,13,11,0.08)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {artistAlwaysFree.slice(0, 4).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.7rem', color: 'var(--color-stamp-onlight)', flexShrink: 0, paddingTop: '2px' }}>✓</span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>

              <a
                href={`${APP_URL}/signup`}
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
                BUILD YOUR PASSPORT →
              </a>
            </div>

            {/* Momentum — artist paid plan */}
            <div style={{
              border: '2px solid var(--color-stamp)',
              borderRadius: 'var(--radius-sm)',
              padding: '40px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              position: 'relative',
            }}>
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
                PILOT PRICING · ON REQUEST
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
                  ARTIST · MOMENTUM
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-archivo)', fontSize: '2.25rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    Momentum
                  </span>
                </div>
                <p style={{ color: 'var(--color-tally-onlight)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  Your career, provable. It never goes stale — every gig lands in your passport before the next call.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(200,240,77,0.15)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {momentumFeatures.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.7rem', color: 'var(--color-stamp-onlight)', flexShrink: 0, paddingTop: '2px' }}>✓</span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', margin: 0, lineHeight: 1.5 }}>{item}</p>
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
                  fontWeight: 700,
                }}
              >
                TALK TO US →
              </a>
            </div>

            {/* Roster — manager plan */}
            <div style={{
              border: '1px solid rgba(10,13,11,0.08)',
              borderRadius: 'var(--radius-sm)',
              padding: '40px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-1px',
                right: '24px',
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                padding: '4px 10px',
              }}>
                OPENS AFTER PILOT
              </div>

              <div>
                <p style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-tally-onlight)',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}>
                  MANAGEMENT / AGENCY · ROSTER
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-archivo)', fontSize: '2.25rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    Roster
                  </span>
                </div>
                <p style={{ color: 'var(--color-tally-onlight)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  Your roster, sellable. See every artist&apos;s booking-readiness on one screen — your team included.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(10,13,11,0.08)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rosterFeatures.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.7rem', color: 'var(--color-stamp-onlight)', flexShrink: 0, paddingTop: '2px' }}>✓</span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>

              <a
                href="/contact"
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
                REGISTER INTEREST →
              </a>
            </div>
          </div>

          {/* Buyer note — no plan, by design */}
          <div style={{
            marginTop: '24px',
            padding: '24px 28px',
            border: '1px solid rgba(10,13,11,0.08)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: 'var(--color-tally-onlight)',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              BOOKING MANAGER / PRODUCER · NO PLAN
            </p>
            <p style={{ fontFamily: 'var(--font-archivo)', fontSize: '1.1rem', margin: 0 }}>
              Not an EPK — a passport. Check, don&apos;t trust.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-tally-onlight)', lineHeight: 1.6, margin: 0, maxWidth: '560px' }}>
              Free. Always. There is no plan to buy here — a free, engaged booking manager is the demand signal
              the whole system runs on.
            </p>
          </div>
        </div>
      </section>

      {/* PORTABILITY */}
      <section style={{
        backgroundColor: 'var(--color-night)',
        color: 'var(--color-paper)',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            PORTABILITY
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '540px',
          }}>
            Your career is yours — even if you change offices.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '580px', margin: 0 }}>
            An artist&apos;s evidence, Passport, and consents belong to the artist — never to a management
            office, even when the office is paying. A management office can sponsor an artist&apos;s Momentum
            plan without taking any ownership over it. If an artist leaves, everything goes with them:
            the Passport, the evidence, the history. Nothing stays behind except the office&apos;s own view
            of it.
          </p>
        </div>
      </section>

      {/* WHAT'S NEVER FOR SALE */}
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
            BY DESIGN — NOT FOR SALE, ON ANY PLAN
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
            {neverIncluded.map((item, i) => (
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
              q: 'Will Passport publication ever be paywalled?',
              a: 'No. Publishing a Passport is locked only on having evidence, giving consent, and the artist\'s own approval — never on payment. This is structural, not a promotional offer.',
            },
            {
              q: 'Will there always be a free tier for booking managers?',
              a: 'Yes. Booking managers viewing Passports will always be free. This is structural to how LOCK works — the booking manager receiving a Passport link should never face a paywall.',
            },
            {
              q: 'Why is Momentum priced "on request" instead of listed?',
              a: 'We are running a paid pilot with a small number of real artists before we lock a public number. Pricing by direct conversation lets us find a fair number with real usage, instead of guessing in public and having to walk it back later.',
            },
            {
              q: 'What does "pilot pricing" mean in practice?',
              a: 'During the pilot, artists pay by direct arrangement — Bit or bank transfer, confirmed manually by the founding team. No credit card processing yet. The number discussed with you now is not a final, published price.',
            },
            {
              q: 'Does paying for Momentum improve my Passport or evidence labels?',
              a: 'No. Momentum buys ongoing scanning, freshness, and private guidance — the work that keeps your proof current. It does not change method labels, upgrade evidence, or affect what a booking manager sees. The evidence means what the evidence means.',
            },
            {
              q: 'If my management office pays for my Momentum plan, who owns my Passport?',
              a: 'You do — always. A sponsoring office funds the plan; it never gains control over your evidence, consents, or Passport. If you leave the office, your plan, Passport, and evidence go with you.',
            },
            {
              q: 'Does a management office pay again for evidence its artists already paid for?',
              a: "No. An artist's Momentum plan and an office's Roster plan are two different layers — an artist's own evidence-truth, and the office's multi-artist readiness view over it. Nothing is billed twice for the same value.",
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
        color: 'var(--color-paper)',
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
            Publishing is free — start now. Want Momentum or Roster? Talk to us and we&apos;ll work out pricing together.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`${APP_URL}/signup`}
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
              BUILD YOUR PASSPORT →
            </a>
            <a
              href="/contact"
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
              TALK TO US ABOUT PRICING
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
