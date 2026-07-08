import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works — From Gig to Verified Evidence | GIGPROOF',
  description: 'Three players. Three steps. See how artists build method-labelled evidence, producers verify in 30 seconds, and booking managers evaluate without signing up.',
}

import { APP_URL } from '@/lib/app-url'

const players = [
  {
    letter: 'A',
    role: 'Artist',
    heRole: 'אמן',
    body: 'Builds a profile, logs gigs, sends verification links to producers, and decides what to publish in the Passport.',
  },
  {
    letter: 'B',
    role: 'Producer',
    heRole: 'מפיק',
    body: 'Receives a magic link, confirms the gig data in 30 seconds — no account, no password, no app required.',
  },
  {
    letter: 'C',
    role: 'Booking Manager',
    heRole: 'אמרגן',
    body: 'Receives a Passport link, opens in browser, sees evidence with method labels and dates — and decides.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Artist signs up and builds a profile',
    body: 'Sign up with email or social login. Add name, genre, geographic area. That\'s the foundation.',
  },
  {
    num: '02',
    title: 'Log a gig',
    body: 'Date, venue, audience estimate. The gig enters the personal Artist Radar with status "awaiting verification".',
  },
  {
    num: '03',
    title: 'Send a magic link to the producer',
    body: 'GIGPROOF creates a unique link for the gig. Send via WhatsApp, SMS or email to the producer who ran the show.',
  },
  {
    num: '04',
    title: 'Producer confirms in 30 seconds',
    body: 'Producer opens link in browser — no account, no password. Checks date and venue, clicks confirm. The gig receives a "producer-confirmed" method label.',
  },
  {
    num: '05',
    title: 'Artist approves for publication',
    body: 'Every piece of evidence waits for your approval. You choose what crosses into the public Passport. Required step, not optional.',
  },
  {
    num: '06',
    title: 'Public Passport ready — send to booking manager',
    body: 'A unique Passport link. Send via WhatsApp. The booking manager opens in a browser and sees method-labelled evidence — no account needed.',
  },
  {
    num: '07',
    title: 'Availability request (optional)',
    body: 'An interested booking manager can send an availability request through the Passport — directly to you, no intermediary.',
  },
]

const firewallRules = [
  { yes: true, text: 'Audience draw as a band — not an exact figure' },
  { yes: true, text: 'Verification method always labelled' },
  { yes: true, text: 'Date and geographic area on every claim' },
  { yes: true, text: 'Approved by artist before publication' },
  { yes: false, text: 'No score, ranking, prediction or guarantee' },
]

export default function HowItWorks() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* PAGE HEADER */}
      <section style={{ padding: '72px 24px 56px', borderBottom: '1px solid rgba(10,13,11,0.08)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            HOW IT WORKS · THE PROCESS
          </p>
          <h1 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
          }}>
            From gig to verified evidence.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally)', maxWidth: '480px', lineHeight: 1.6, margin: 0 }}>
            Three players. Three steps. Evidence you can trust.
          </p>
        </div>
      </section>

      {/* THREE PLAYERS */}
      <section style={{ padding: '64px 24px', backgroundColor: 'var(--color-paper)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally)',
            textTransform: 'uppercase',
            marginBottom: '40px',
          }}>
            THREE PLAYERS
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {players.map((p) => (
              <div
                key={p.letter}
                style={{
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid rgba(10,13,11,0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '28px 24px',
                }}
              >
                <span style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-stamp)',
                  backgroundColor: 'rgba(200,240,77,0.08)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                }}>
                  {p.letter}
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.15rem',
                  marginBottom: '4px',
                }}>
                  {p.role}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--color-stamp)',
                  marginBottom: '12px',
                }}>
                  {p.heRole}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-tally)', lineHeight: 1.6, margin: 0 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          {/* Entity firewall note */}
          <div style={{
            marginTop: '24px',
            padding: '14px 18px',
            border: '1px solid rgba(200,240,77,0.25)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(200,240,77,0.04)',
          }}>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              color: 'var(--color-stamp)',
              margin: 0,
            }}>
              אמרגן ≠ מפיק — Booking manager ≠ producer. They are distinct roles that are never merged in this system.
            </p>
          </div>
        </div>
      </section>

      {/* STEP BY STEP */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            STEP BY STEP
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.02em',
            marginBottom: '48px',
          }}>
            From signup to Passport — everything.
          </h2>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {steps.map((step, i) => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '24px',
                  position: 'relative',
                  paddingBottom: i < steps.length - 1 ? '40px' : '0',
                }}
              >
                {/* Marker + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-stamp)',
                    color: 'var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: '1px',
                      flex: 1,
                      backgroundColor: 'rgba(10,13,11,0.12)',
                      marginTop: '8px',
                    }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ paddingTop: '6px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.05rem',
                    marginBottom: '8px',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-tally)', lineHeight: 1.65, margin: 0 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIREWALL PRINCIPLES — dark band */}
      <section style={{
        backgroundColor: 'var(--color-night)',
        color: '#fff',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            FIREWALL PRINCIPLES
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.02em',
            marginBottom: '40px',
          }}>
            Every public claim meets five rules.
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            {firewallRules.map((rule, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${rule.yes ? 'rgba(255,255,255,0.08)' : 'rgba(178,59,46,0.3)'}`,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  color: rule.yes ? 'var(--color-stamp)' : 'var(--color-void)',
                  flexShrink: 0,
                  paddingTop: '1px',
                }}>
                  {rule.yes ? '✓' : '✗'}
                </span>
                <p style={{
                  fontSize: '0.875rem',
                  color: rule.yes ? 'rgba(255,255,255,0.8)' : 'rgba(178,59,46,0.9)',
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {rule.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Ready to start?
          </h2>
          <p style={{ color: 'var(--color-tally)', marginBottom: '32px', lineHeight: 1.6 }}>
            Build your Passport. Free for artists.
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
              href="/passport/demo"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                backgroundColor: 'transparent',
                color: 'var(--color-ink)',
                border: '1px solid rgba(10,13,11,0.2)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              SEE A SAMPLE
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
