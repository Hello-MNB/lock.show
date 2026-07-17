import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: '/how-it-works' },
  title: 'How It Works — From Gig to Verified Evidence',
  description: 'See exactly how a gig becomes evidence a booking manager can trust — three people, three simple steps, no signup required to view.',
}

import { APP_URL } from '@/lib/app-url'

const players = [
  {
    letter: 'A',
    role: 'Artist',
    body: 'That\'s you. You log the nights you\'ve played, invite the person who ran them to back you up, and decide exactly what the world gets to see.',
  },
  {
    letter: 'B',
    role: 'Producer',
    body: 'The one who ran your show. They get a single link, tap confirm in about thirty seconds, and they\'re done — no account, no password, no app.',
  },
  {
    letter: 'C',
    role: 'Booking Manager',
    body: 'The one deciding on the next room. They open your Passport in a browser and see real nights, checked and dated — no signup, no wall between you and the yes.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Sign up and set the stage.',
    body: 'Email, name, genre, where you play. Two minutes, and you have a home for your history.',
  },
  {
    num: '02',
    title: 'Log a night you played.',
    body: 'Date, venue, roughly how many people were in the room. It lands in your private Radar — only you can see it there.',
  },
  {
    num: '03',
    title: 'Send the producer one link.',
    body: 'LOCK gives you a unique link for that night. WhatsApp it to the producer who ran the show — that\'s the whole ask.',
  },
  {
    num: '04',
    title: 'They confirm in thirty seconds.',
    body: 'No account, no password. They see the date and the venue, tap confirm, done. Your night now carries their word, not just yours.',
  },
  {
    num: '05',
    title: 'You decide what goes public.',
    body: 'Nothing leaves your Radar without your say-so. Every night waits for your approval before it appears anywhere.',
  },
  {
    num: '06',
    title: 'Send your Passport before the call.',
    body: 'One link, your strongest nights — checked and dated, ready to open in any browser. No login on their side either.',
  },
  {
    num: '07',
    title: 'And if they like what they see —',
    body: 'A booking manager can ask about your availability right from the Passport. Straight to you, nobody in the middle.',
  },
]

const groundRules = [
  'Your crowd shows as an honest range — never a made-up exact number',
  'Every night says plainly how it was checked',
  'Every night carries its date and where it happened',
  'Nothing goes public until you approve it',
  'No scores, no rankings, no predictions — ever',
]

export default function HowItWorks() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* ── HERO — compact full-bleed image header ──────────────────────── */}
      <section
        style={{
          overflow: 'hidden',
          minHeight: 'min(56svh, 560px)',
          background: `
            linear-gradient(180deg,
              rgba(10,13,11,0.55) 0%,
              rgba(10,13,11,0.88) 65%,
              rgba(10,13,11,0.98) 100%
            ),
            url('/lockshow-evidence-review.webp') center 30% / cover no-repeat
          `,
          color: 'var(--color-paper)',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: 'clamp(2rem, 5vw, 3.5rem) max(24px, 4vw)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', width: '100%' }}>
          <div style={{ maxWidth: '720px', position: 'relative' }}>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'var(--color-stamp)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              HOW IT WORKS
            </p>
            <h1 style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.045em',
              color: 'var(--color-paper)',
              margin: '0 0 1.25rem',
            }}>
              From a night you played
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
                to a night you&apos;re booked.
              </em>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(243,245,239,0.72)', maxWidth: '520px', lineHeight: 1.65, margin: 0 }}>
              Three people, one link, and about thirty seconds of someone
              else&apos;s time. Here&apos;s the whole walk-through.
            </p>
          </div>
        </div>
      </section>

      {/* ── THREE PLAYERS — paper ────────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-paper)',
        padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
        borderBottom: '1px solid #dde3d9',
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            color: 'var(--color-tally-onlight)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            THREE PLAYERS
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--color-ink)',
            marginBottom: 'clamp(2rem, 5vw, 3.5rem)',
            maxWidth: '600px',
          }}>
            It takes three people. Only one of them needs an account.
          </h2>
          <div
            className="m-divide"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'clamp(1rem, 2vw, 1.5rem)',
            }}
          >
            {players.map((p) => (
              <div
                key={p.letter}
                className="m-flat"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(10,13,11,0.08)',
                  borderRadius: '16px',
                  padding: 'clamp(1.25rem, 3vw, 2rem)',
                }}
              >
                <span style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-stamp-onlight)',
                  backgroundColor: 'rgba(200,240,77,0.08)',
                  border: '1px solid rgba(200,240,77,0.2)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                }}>
                  {p.letter}
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  marginBottom: '0.6rem',
                }}>
                  {p.role}
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', lineHeight: 1.65, margin: 0 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          {/* Role clarity note */}
          <p style={{
            marginTop: '2rem',
            fontSize: '1rem',
            color: 'var(--color-tally-onlight)',
            lineHeight: 1.65,
            maxWidth: '640px',
          }}>
            Worth knowing: the producer who ran your show and the booking
            manager deciding on the next one are two different people with two
            different jobs. LOCK never mixes them up.
          </p>
        </div>
      </section>

      {/* ── STEP BY STEP — paper, narrow text column ─────────────────────── */}
      <section style={{
        background: 'var(--color-paper)',
        padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            color: 'var(--color-stamp-onlight)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            STEP BY STEP
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.75rem, 4vw, 2.4rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--color-ink)',
            marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
          }}>
            The whole journey, start to finish.
          </h2>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, i) => (
              <div
                key={step.num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr',
                  gap: '1.25rem',
                  paddingBottom: i < steps.length - 1 ? '2rem' : '0',
                }}
              >
                {/* Marker + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    background: 'var(--color-stamp)',
                    border: '1px solid rgba(10,13,11,0.1)',
                    borderRadius: '10px',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      flex: 1,
                      width: '1px',
                      background: 'var(--color-mist)',
                      marginTop: '0.5rem',
                    }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ paddingTop: '0.5rem' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    marginBottom: '0.4rem',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', lineHeight: 1.65, margin: 0 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GROUND RULES — paper trust strip ─────────────────────────────── */}
      <section style={{
        background: 'var(--color-paper)',
        padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
        borderTop: '1px solid #dde3d9',
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            color: 'var(--color-tally-onlight)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            THE GROUND RULES
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.75rem, 4vw, 2.4rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--color-ink)',
            marginBottom: '0.75rem',
            maxWidth: '600px',
          }}>
            Five rules that never bend.
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--color-tally-onlight)',
            lineHeight: 1.65,
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
            maxWidth: '560px',
          }}>
            Everything public plays by the same rules — that&apos;s what makes
            the link worth trusting.
          </p>
          <div
            className="m-divide"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1px',
              background: 'var(--color-mist)',
            }}
          >
            {groundRules.map((rule, i) => (
              <div
                key={i}
                className="m-flat"
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  padding: 'clamp(1rem, 2.5vw, 1.5rem)',
                  backgroundColor: '#ffffff',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--color-stamp-onlight)',
                  flexShrink: 0,
                  paddingTop: '2px',
                }}>
                  ✓
                </span>
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--color-ink)',
                  margin: 0,
                  lineHeight: 1.55,
                }}>
                  {rule}
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '1rem', lineHeight: 1.6 }}>
            <Link
              href="/methodology"
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                color: 'var(--color-ink)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              CURIOUS HOW THE CHECKING WORKS? READ THE METHODOLOGY →
            </Link>
          </p>
        </div>
      </section>

      {/* ── CLOSING CTA — dark ───────────────────────────────────────────── */}
      <section
        style={{
          background: `
            linear-gradient(180deg,
              rgba(10,13,11,0.92) 0%,
              rgba(10,13,11,0.84) 45%,
              rgba(10,13,11,0.96) 100%
            ),
            url('/lockshow-hero-live.webp') center/cover no-repeat
          `,
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.9rem, 4.5vw, 3rem)',
            letterSpacing: '-0.045em',
            lineHeight: 1.0,
            color: 'var(--color-paper)',
            marginBottom: '1rem',
          }}>
            Your first night takes
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
              two minutes to log.
            </em>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(243,245,239,0.72)', marginBottom: '2.25rem', lineHeight: 1.7, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            Free to build and publish during the pilot — and always free for a
            booking manager to open.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`${APP_URL}/signup`}
              style={{
                display: 'inline-block',
                padding: '0.95rem 2rem',
                backgroundColor: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              BUILD YOUR PASSPORT →
            </a>
            <Link
              href="/passport/demo"
              style={{
                display: 'inline-block',
                padding: '0.95rem 2rem',
                backgroundColor: 'transparent',
                color: 'var(--color-paper)',
                border: '1px solid rgba(243,245,239,0.22)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              SEE A SAMPLE
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
