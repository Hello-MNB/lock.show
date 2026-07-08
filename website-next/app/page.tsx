import type { Metadata } from 'next'
import Link from 'next/link'

import { APP_URL } from '@/lib/app-url'

const SITE_URL = 'https://gigproof.co'

export const metadata: Metadata = {
  title: 'GIGPROOF — Booking Proof for Independent Artists',
  description:
    'GIGPROOF turns live-performance evidence into a verified Bookability Passport — so booking managers can evaluate before they risk their reputation.',
  openGraph: {
    title: 'GIGPROOF — Booking Proof for Independent Artists',
    description:
      'Method-labelled performance evidence. Built for booking managers who need to verify before they risk their name.',
    type: 'website',
    url: `${SITE_URL}/`,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'GIGPROOF',
      description: 'Pre-booking proof platform for independent artists',
      inLanguage: ['en', 'he'],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: 'GIGPROOF',
      url: `${SITE_URL}/`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a Bookability Passport?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "A Bookability Passport is a public, method-labelled profile showing only verified claims about an artist's live performance history. Every claim includes the evidence method and review date — so booking managers can evaluate without guessing.",
          },
        },
        {
          '@type': 'Question',
          name: 'Is GIGPROOF free for booking managers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Booking managers (אמרגנים) view Bookability Passports at no cost. Artists pay to build and publish their proof profile.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is evidence verified?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Each claim carries a method label — TICKET EXPORT, PRODUCER-CONFIRMED, PLATFORM DATA, OPERATOR-REVIEWED, or SELF-REPORTED — alongside a review date. The label is always visible. Producers confirm individual claims via a bounded magic link; no account required.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does GIGPROOF not do?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'GIGPROOF does not score artists, produce rankings, predict bookings, or guarantee outcomes. There is no algorithm, no percentage, no gauge. Evidence is shown as-is, labelled by method.',
          },
        },
      ],
    },
  ],
}

// ─── Inline icon helper ────────────────────────────────────────────────────
// Paths sourced from gigproof-icons.svg (Codex design system)
const ICON_PATHS: Record<string, string> = {
  artist:   '<circle cx="12" cy="8" r="3"/><path d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6"/><path d="M19 4v7M16.5 6.5 19 4l2.5 2.5"/>',
  manager:  '<circle cx="8" cy="8" r="2.5"/><circle cx="17" cy="9" r="2"/><path d="M3.5 19c.5-3.4 2-5.2 4.5-5.2s4 1.8 4.5 5.2M13.5 18c.4-2.7 1.6-4.1 3.5-4.1s3.1 1.4 3.5 4.1"/><path d="M12 5.5 14.5 3 17 5.5"/>',
  producer: '<path d="M4 5h16v11H4zM8 20h8M12 16v4"/><path d="m8 12 3-3 2.5 2 3-3"/>',
  approved: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/>',
  arrow:    '<path d="M4 12h15M14 7l5 5-5 5"/>',
  lock:     '<path d="M6 10h12v11H6zM8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/><circle cx="12" cy="15" r="1.2"/>',
  passport: '<path d="M5 3h14v18H5z"/><circle cx="12" cy="10" r="3"/><path d="M8 17c.7-2 2-3 4-3s3.3 1 4 3"/>',
}

function Icon({
  id,
  size = 18,
  color = 'currentColor',
}: {
  id: string
  size?: number
  color?: string
}) {
  const paths = ICON_PATHS[id] ?? ''
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  )
}

// ─── Shared sub-components ─────────────────────────────────────────────────

function RoleTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: 'var(--color-ink)',
        background: 'rgba(200,240,77,0.14)',
        border: '1px solid rgba(200,240,77,0.4)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.15rem 0.5rem',
        marginBottom: '0.75rem',
      }}
    >
      {children}
    </span>
  )
}

function MethodBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--color-stamp)',
        background: 'rgba(200,240,77,0.08)',
        border: '1px solid rgba(200,240,77,0.2)',
        borderRadius: '2px',
        padding: '0.15rem 0.4rem',
      }}
    >
      {label}
    </span>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          style={{
            margin: '28px max(24px, 4vw) 0',
            border: '1px solid #2a362c',
            borderRadius: '20px',
            background: `
              linear-gradient(135deg,
                rgba(10,13,11,0.97) 0%,
                rgba(10,13,11,0.88) 52%,
                rgba(10,13,11,0.5)  100%
              ),
              url('/gigproof-live-hero.webp') center/cover no-repeat
            `,
            color: 'var(--color-paper)',
            minHeight: '620px',
            padding: 'clamp(3.5rem, 8vw, 5.5rem) clamp(1.5rem, 4vw, 4rem)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Lime ambient glow — the תמנון */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: '480px',
              height: '480px',
              borderRadius: '50%',
              right: '-140px',
              bottom: '-220px',
              background: 'rgba(200,240,77,0.12)',
              filter: 'blur(75px)',
              pointerEvents: 'none',
            }}
          />
          {/* Secondary top-left glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              left: '-80px',
              top: '-60px',
              background: 'rgba(200,240,77,0.05)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />

          {/* Hero grid */}
          <div
            className="hero-grid"
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(300px, 0.7fr)',
              gap: 'clamp(2rem, 6vw, 5rem)',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* ── LEFT: hero copy ── */}
            <div>
              {/* Pulsing badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1.75rem',
                }}
              >
                <span
                  className="pulse-dot"
                  style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--color-stamp)',
                    boxShadow: '0 0 10px var(--color-stamp)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.14em',
                    color: 'var(--color-stamp)',
                    textTransform: 'uppercase',
                  }}
                >
                  Closed Beta · Tel Aviv
                </span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 'clamp(2.4rem, 5.5vw, 4.25rem)',
                  fontWeight: 400,
                  lineHeight: 0.96,
                  letterSpacing: '-0.055em',
                  color: 'var(--color-paper)',
                  marginBottom: '1.5rem',
                }}
              >
                Build the proof
                <br />
                <em
                  style={{
                    fontStyle: 'italic',
                    color: 'var(--color-stamp)',
                  }}
                >
                  that books you.
                </em>
              </h1>

              {/* Sub */}
              <p
                style={{
                  fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                  lineHeight: 1.7,
                  color: 'rgba(243,245,239,0.68)',
                  maxWidth: '480px',
                  marginBottom: '2.25rem',
                }}
              >
                Turn live-performance evidence into a verified Bookability Passport —
                so booking managers can evaluate before they risk their name.
              </p>

              {/* CTAs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '2rem',
                }}
              >
                <a
                  href={`${APP_URL}/signup`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--color-stamp)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '0.85rem 1.75rem',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                  }}
                >
                  BUILD YOUR PASSPORT
                  <Icon id="arrow" size={16} color="var(--color-ink)" />
                </a>
                <Link
                  href="/passport/demo"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    color: 'var(--color-paper)',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '0.85rem 1.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(243,245,239,0.25)',
                    textDecoration: 'none',
                  }}
                >
                  SEE A SAMPLE
                </Link>
              </div>

              {/* Confidence row */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { icon: 'approved', text: 'No scores or rankings' },
                  { icon: 'lock',     text: 'Artist-controlled' },
                  { icon: 'approved', text: 'Evidence with method labels' },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Icon id={icon} size={15} color="rgba(200,240,77,0.7)" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.04em',
                        color: 'rgba(243,245,239,0.45)',
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Bookability Passport preview card ── */}
            <div
              className="hero-passport-card"
              style={{
                background: 'rgba(243,245,239,0.04)',
                border: '1px solid rgba(243,245,239,0.1)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {/* Passport header */}
              <div
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.14em',
                  color: 'var(--color-stamp)',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                }}
              >
                GIGPROOF · BOOKABILITY PASSPORT
              </div>

              {/* Artist identity */}
              <div
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: 'var(--color-paper)',
                  marginBottom: '0.2rem',
                }}
              >
                Lior Noy
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(243,245,239,0.35)',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                }}
              >
                Electronic · Tel Aviv
              </div>

              {/* Audience draw */}
              <div
                style={{
                  borderTop: '1px solid rgba(243,245,239,0.08)',
                  paddingTop: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.12em',
                    color: 'rgba(243,245,239,0.3)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Audience Draw
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: 'var(--color-paper)',
                    marginBottom: '0.5rem',
                  }}
                >
                  200–350
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <MethodBadge label="TICKET EXPORT" />
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.58rem',
                      color: 'rgba(243,245,239,0.28)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    REVIEWED JAN 2026
                  </span>
                </div>
              </div>

              {/* Gig claim */}
              <div
                style={{
                  borderTop: '1px solid rgba(243,245,239,0.08)',
                  paddingTop: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.12em',
                    color: 'rgba(243,245,239,0.3)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Gig History
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--color-paper)',
                    marginBottom: '0.2rem',
                  }}
                >
                  Zappa Tel Aviv — headline
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'rgba(243,245,239,0.4)',
                    marginBottom: '0.5rem',
                  }}
                >
                  May 2025 · sold out
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <MethodBadge label="PRODUCER-CONFIRMED" />
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.58rem',
                      color: 'rgba(243,245,239,0.28)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    REVIEWED MAY 2025
                  </span>
                </div>
              </div>

              {/* Card footer */}
              <div
                style={{
                  borderTop: '1px solid rgba(243,245,239,0.06)',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.52rem',
                    letterSpacing: '0.06em',
                    color: 'rgba(243,245,239,0.18)',
                    textTransform: 'uppercase',
                  }}
                >
                  Sample · Fictional artist
                </span>
                <Link
                  href="/passport/demo"
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.08em',
                    color: 'var(--color-stamp)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  VIEW FULL
                  <Icon id="arrow" size={12} color="var(--color-stamp)" />
                </Link>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes gp-pulse {
              0%, 100% { opacity: 1; box-shadow: 0 0 8px #c8f04d; }
              50%       { opacity: 0.55; box-shadow: 0 0 20px #c8f04d; }
            }
            .pulse-dot { animation: gp-pulse 2.4s ease-in-out infinite; }

            @media (max-width: 720px) {
              .hero-grid { grid-template-columns: 1fr !important; }
              .hero-passport-card { display: none !important; }
            }
          `}</style>
        </section>

        {/* ── FIREWALL BANNER ──────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-paper)',
            borderBottom: '1px solid rgba(10,13,11,0.1)',
            padding: '0.85rem 1.25rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: 'var(--color-tally-onlight)',
            }}
          >
            NO SCORE · NO RANKING · NO PREDICTION · NO GUARANTEE — EVIDENCE, LABELLED BY METHOD
          </p>
        </section>

        {/* ── THREE ACTORS ─────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-paper)',
            padding: 'clamp(3rem, 7vw, 5rem) 1.25rem',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally-onlight)',
                marginBottom: '0.5rem',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              Three Distinct Roles
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
                marginBottom: '0.5rem',
                textAlign: 'center',
              }}
            >
              One platform, three different jobs
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-tally-onlight)',
                textAlign: 'center',
                marginBottom: '3rem',
                maxWidth: '560px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.6,
              }}
            >
              Booking manager ≠ producer. These are distinct roles with distinct interests —
              and GIGPROOF keeps them separate at every level.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* ARTIST */}
              <div
                style={{
                  background: 'var(--color-paper)',
                  border: '1px solid rgba(10,13,11,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2rem',
                }}
              >
                <div style={{ marginBottom: '0.6rem', color: 'var(--color-ink)', opacity: 0.7 }}>
                  <Icon id="artist" size={22} color="var(--color-ink)" />
                </div>
                <RoleTag>אמן · ARTIST</RoleTag>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: 'var(--color-ink)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Build your proof profile
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-tally-onlight)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  Collect evidence, invite producers to confirm a single claim, and publish
                  a verified Passport that speaks for you before the first call.
                </p>
                <Link
                  href="/artists"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-ink)',
                    textDecoration: 'none',
                  }}
                >
                  FOR ARTISTS
                  <Icon id="arrow" size={14} color="var(--color-ink)" />
                </Link>
              </div>

              {/* BOOKING MANAGER */}
              <div
                style={{
                  background: 'var(--color-paper)',
                  border: '1px solid rgba(10,13,11,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2rem',
                }}
              >
                <div style={{ marginBottom: '0.6rem' }}>
                  <Icon id="manager" size={22} color="var(--color-ink)" />
                </div>
                <RoleTag>אמרגן · BOOKING MANAGER</RoleTag>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: 'var(--color-ink)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Evaluate before you risk your name
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-tally-onlight)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  Read a Bookability Passport in under two minutes. Every claim shows its
                  method and review date — no algorithm, no guesswork, no black box.
                  Viewing is always free.
                </p>
                <Link
                  href="/bookers"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-ink)',
                    textDecoration: 'none',
                  }}
                >
                  FOR BOOKING MANAGERS
                  <Icon id="arrow" size={14} color="var(--color-ink)" />
                </Link>
              </div>

              {/* PRODUCER */}
              <div
                style={{
                  background: 'var(--color-paper)',
                  border: '1px solid rgba(10,13,11,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2rem',
                }}
              >
                <div style={{ marginBottom: '0.6rem' }}>
                  <Icon id="producer" size={22} color="var(--color-ink)" />
                </div>
                <RoleTag>מפיק · PRODUCER</RoleTag>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: 'var(--color-ink)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Confirm one claim, no account needed
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-tally-onlight)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  Receive a bounded magic link, confirm a single claim you know
                  first-hand, and done. Your confirmation is method-labelled on
                  the Passport.
                </p>
                <Link
                  href="/producers"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-ink)',
                    textDecoration: 'none',
                  }}
                >
                  FOR PRODUCERS
                  <Icon id="arrow" size={14} color="var(--color-ink)" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROOF UNIT DEMO ──────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-night)',
            padding: 'clamp(3rem, 7vw, 5rem) max(24px, 4vw)',
            borderTop: '1px solid #2a342d',
            borderBottom: '1px solid #2a342d',
          }}
        >
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '3rem',
                alignItems: 'center',
              }}
            >
              {/* Left: explanation */}
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--color-stamp)',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  The Proof Unit
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-paper)',
                    marginBottom: '1rem',
                    lineHeight: 1.15,
                  }}
                >
                  Every claim shows how it was verified
                </h2>
                <p
                  style={{
                    fontSize: '1rem',
                    color: 'rgba(243,245,239,0.65)',
                    lineHeight: 1.7,
                    marginBottom: '1.5rem',
                  }}
                >
                  No bare numbers. No unexplained assertions. Every piece of evidence on
                  a Bookability Passport carries a method label and a review date —
                  so a booking manager can judge the strength of each claim, not just its value.
                </p>
                <Link
                  href="/methodology"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-paper)',
                    textDecoration: 'none',
                  }}
                >
                  READ THE METHODOLOGY
                  <Icon id="arrow" size={14} color="var(--color-paper)" />
                </Link>
              </div>

              {/* Right: live proof units */}
              <div
                style={{
                  background: 'rgba(243,245,239,0.04)',
                  border: '1px solid rgba(243,245,239,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2rem',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    color: 'rgba(243,245,239,0.3)',
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Sample Proof Units — Fictional Artist
                </p>

                {/* BandPill proof unit */}
                <div
                  style={{
                    borderLeft: '2px solid var(--color-stamp)',
                    paddingLeft: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--color-paper)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    200–350
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(243,245,239,0.5)', marginBottom: '0.5rem' }}>
                    Headline audience draw, Zappa Club TLV, Feb 2025
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <MethodBadge label="TICKET EXPORT" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.65rem',
                        color: 'rgba(243,245,239,0.35)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      REVIEWED MAR 2025
                    </span>
                  </div>
                </div>

                {/* Performance proof unit */}
                <div
                  style={{
                    borderLeft: '2px solid var(--color-stamp)',
                    paddingLeft: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-archivo)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--color-paper)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    Self-managed touring since 2021
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(243,245,239,0.5)', marginBottom: '0.5rem' }}>
                    Full booking coordination, rider management, sound requirements
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <MethodBadge label="OPERATOR-REVIEWED" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.65rem',
                        color: 'rgba(243,245,239,0.35)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      REVIEWED JAN 2025
                    </span>
                  </div>
                </div>

                {/* Producer-confirmed proof unit */}
                <div
                  style={{
                    borderLeft: '2px solid var(--color-stamp)',
                    paddingLeft: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--color-paper)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    70–120
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(243,245,239,0.5)', marginBottom: '0.5rem' }}>
                    Capacity, Shapira Arts Hub, support slot, Dec 2024
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <MethodBadge label="PRODUCER-CONFIRMED" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.65rem',
                        color: 'rgba(243,245,239,0.35)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      REVIEWED DEC 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-paper)',
            padding: 'clamp(3rem, 7vw, 5rem) 1.25rem',
          }}
        >
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally-onlight)',
                marginBottom: '0.5rem',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              How It Works
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
                marginBottom: '3rem',
                textAlign: 'center',
              }}
            >
              From evidence to verified Passport
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                {
                  step: '01',
                  title: 'Log your evidence',
                  body: 'Add gig history, platform data, and professional context. Everything stays private in your Artist Radar until you choose to publish.',
                },
                {
                  step: '02',
                  title: 'Invite a producer to confirm',
                  body: 'Send a bounded magic link to a producer who was there. They confirm one claim — no account, no friction.',
                },
                {
                  step: '03',
                  title: 'Operator reviews and labels',
                  body: 'GIGPROOF reviews your evidence and applies the correct method label. No claim appears on your Passport without a label.',
                },
                {
                  step: '04',
                  title: 'Publish your Bookability Passport',
                  body: 'Your Passport shows verified strengths only. Share the link with a booking manager — they see exactly what was verified and how.',
                },
              ].map(({ step, title, body }, i, arr) => (
                <div
                  key={step}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3rem 1fr',
                    gap: '1.25rem',
                    paddingBottom: i < arr.length - 1 ? '2.5rem' : '0',
                    position: 'relative',
                  }}
                >
                  {/* Step number + connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--color-ink)',
                        background: 'rgba(10,13,11,0.06)',
                        border: '1px solid rgba(10,13,11,0.1)',
                        borderRadius: 'var(--radius-sm)',
                        width: '2.5rem',
                        height: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {step}
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          width: '1px',
                          background: 'rgba(10,13,11,0.1)',
                          marginTop: '0.5rem',
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingTop: '0.4rem' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-archivo)',
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        color: 'var(--color-ink)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.95rem',
                        color: 'var(--color-tally-onlight)',
                        lineHeight: 1.65,
                      }}
                    >
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link
                href="/how-it-works"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                }}
              >
                SEE THE FULL WALKTHROUGH
                <Icon id="arrow" size={14} color="var(--color-ink)" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── TRUST STATEMENT ──────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-ink)',
            padding: 'clamp(3rem, 7vw, 5rem) max(24px, 4vw)',
            textAlign: 'center',
            borderTop: '1px solid #1a221c',
            borderBottom: '1px solid #1a221c',
          }}
        >
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp)',
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
              }}
            >
              The Design Principle
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--color-paper)',
                lineHeight: 1.15,
                marginBottom: '1.5rem',
              }}
            >
              A booking manager&apos;s reputation is their livelihood. We treat it that way.
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'rgba(243,245,239,0.65)',
                lineHeight: 1.75,
                marginBottom: '2.5rem',
              }}
            >
              GIGPROOF has no algorithm that scores artists. No ranking. No &ldquo;top performers.&rdquo;
              No percentage telling a booker whether to say yes. We show evidence, labelled by
              how it was collected — and we let the booker decide.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1px',
                background: 'rgba(243,245,239,0.1)',
                border: '1px solid rgba(243,245,239,0.1)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '2.5rem',
              }}
            >
              {['NO SCORE', 'NO RANKING', 'NO PREDICTION', 'NO GUARANTEE'].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: '1rem',
                    background: 'var(--color-ink)',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'rgba(243,245,239,0.45)',
                    textAlign: 'center',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/methodology"
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-paper)',
                  border: '1px solid rgba(243,245,239,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1.75rem',
                  textDecoration: 'none',
                }}
              >
                READ THE METHODOLOGY
              </Link>
              <Link
                href="/passport/demo"
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-paper)',
                  border: '1px solid rgba(243,245,239,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1.75rem',
                  textDecoration: 'none',
                }}
              >
                SEE A SAMPLE PASSPORT
              </Link>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-ink)',
            padding: 'clamp(3rem, 7vw, 5rem) 1.25rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--color-paper)',
                marginBottom: '1rem',
                lineHeight: 1.15,
              }}
            >
              Ready to build your proof profile?
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'rgba(243,245,239,0.6)',
                marginBottom: '2rem',
                lineHeight: 1.65,
              }}
            >
              Closed beta — Israeli artists only. Early access is limited.
            </p>
            <a
              href={`${APP_URL}/signup`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '1rem 2.5rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
            >
              REQUEST ACCESS
              <Icon id="arrow" size={16} color="var(--color-ink)" />
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
