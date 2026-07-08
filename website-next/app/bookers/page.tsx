import type { Metadata } from 'next'
import Link from 'next/link'
import { DoorStamp } from '@/components/door-stamp'

export const metadata: Metadata = {
  title: 'For Booking Managers — Evaluate Before You Commit',
  description:
    'GIGPROOF is free for booking managers. An artist sends you a link; you open method-labelled performance evidence — no account, no signup.',
  openGraph: {
    title: 'For Booking Managers | GIGPROOF',
    description: 'Your reputation is on the line. Evaluate before you commit.',
    type: 'website',
  },
}

const risks = [
  {
    num: '01',
    title: "Recommending someone who doesn't draw.",
    body: "An empty floor isn't forgotten. Every recommendation stakes credibility you've built over years.",
  },
  {
    num: '02',
    title: "Links don't answer the question.",
    body: "Spotify, Instagram, YouTube — they all show existence. None answer: \"How many will show up to my venue?\"",
  },
  {
    num: '03',
    title: "You don't have time to investigate every name.",
    body: "New names come in daily. Deep investigation takes time you don't have. You need fast, useful context.",
  },
]

const passportFeatures = [
  {
    label: 'AUDIENCE DRAW AS A BAND',
    title: 'Ranges, not exact figures.',
    body: 'Every claim shows a band (60–100, 100–200, etc.) — not a precise number. More honest about what evidence actually supports. More useful for your decision.',
  },
  {
    label: 'VERIFICATION METHOD',
    title: 'You always know how much to trust it.',
    body: '"Producer-confirmed" / "ticket platform export" / "self-reported" — the method label is always visible. You decide the weight.',
  },
  {
    label: 'DATE + GEOGRAPHIC AREA',
    title: 'Evidence from Jan 2026 ≠ evidence from 2023.',
    body: 'You always know when the data was collected and in which market. Freshness and locality are part of every claim.',
  },
  {
    label: 'NO SIGNUP REQUIRED',
    title: 'One link, open in browser.',
    body: "Artist sends a link. You open it — no app, no account, no friction. The full Passport is visible immediately.",
  },
]

export default function BookersPage() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          margin: '28px max(24px, 4vw) 0',
          border: '1px solid #2a362c',
          borderRadius: '20px',
          overflow: 'hidden',
          minHeight: '620px',
          background: `linear-gradient(180deg, rgba(10,13,11,0.55) 0%, rgba(10,13,11,0.86) 55%, rgba(10,13,11,0.97) 100%), url('/gigproof-persona-manager-v1.webp') center/cover no-repeat`,
          color: 'var(--color-paper)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
        }}
      >
        {/* Stamp watermarks */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-15px',
            right: '-55px',
            transform: 'rotate(-11deg)',
            color: 'var(--color-paper)',
            opacity: 0.07,
            pointerEvents: 'none',
          }}
        >
          <DoorStamp size={310} />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '-70px',
            transform: 'rotate(7deg)',
            color: 'var(--color-paper)',
            opacity: 0.03,
            pointerEvents: 'none',
          }}
        >
          <DoorStamp size={240} />
        </div>
        <div style={{ maxWidth: '640px', position: 'relative' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.14em',
              color: 'var(--color-stamp)',
              textTransform: 'uppercase',
              marginBottom: '1.75rem',
            }}
          >
            FOR BOOKING MANAGERS · לאמרגנים
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
            Evaluate before
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
              you commit.
            </em>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
              lineHeight: 1.65,
              color: 'rgba(243,245,239,0.62)',
              maxWidth: '520px',
              marginBottom: '2.25rem',
            }}
          >
            GIGPROOF is free for booking managers. An artist sends you a link;
            you open it in a browser and get clear, method-labelled context —
            no speculation, no signup, no account.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link
              href="/passport/demo"
              style={{
                background: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '0.9rem 1.75rem',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-block',
              }}
            >
              SEE A SAMPLE PASSPORT →
            </Link>
            <Link
              href="/how-it-works"
              style={{
                border: '1px solid rgba(243,245,239,0.22)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '0.9rem 1.75rem',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-block',
              }}
            >
              HOW IT WORKS
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE RISK ─────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: '4rem max(24px, 4vw)',
          borderBottom: '1px solid rgba(10,13,11,0.06)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              color: 'var(--color-tally-onlight)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            THE RISK YOU TAKE
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '2.5rem',
            }}
          >
            Your reputation is on the line.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1px',
              background: 'rgba(10,13,11,0.08)',
              border: '1px solid rgba(10,13,11,0.08)',
            }}
          >
            {risks.map((r) => (
              <div
                key={r.num}
                style={{ background: 'var(--color-paper)', padding: '1.75rem' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: '0.65rem',
                    color: 'var(--color-tally-onlight)',
                    opacity: 0.5,
                    display: 'block',
                    marginBottom: '0.75rem',
                  }}
                >
                  {r.num}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--color-ink)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {r.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                    fontSize: '0.875rem',
                    color: 'var(--color-tally-onlight)',
                    lineHeight: 1.6,
                  }}
                >
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU SEE IN THE PASSPORT ─────────────────── */}
      <section style={{ background: 'var(--color-paper)', padding: '4rem max(24px, 4vw)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              color: 'var(--color-tally-onlight)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            WHAT YOU SEE IN THE PASSPORT
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '2.5rem',
            }}
          >
            Evidence. Method. Date.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {passportFeatures.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: '1.75rem 0',
                  borderBottom: '1px solid rgba(10,13,11,0.06)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: '0.6rem',
                    color: 'var(--color-stamp-onlight)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '0.4rem',
                  }}
                >
                  {f.label}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '0.95rem',
                    color: 'var(--color-ink)',
                    marginBottom: '0.4rem',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                    fontSize: '0.875rem',
                    color: 'var(--color-tally-onlight)',
                    lineHeight: 1.65,
                    maxWidth: '52rem',
                  }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT GIGPROOF DOESN'T PROMISE ────────────────── */}
      <section style={{
        background: 'var(--color-night)',
        padding: '4rem max(24px, 4vw)',
        borderTop: '1px solid #2a342d',
        borderBottom: '1px solid #2a342d',
      }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              color: 'var(--color-stamp)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            IMPORTANT TO KNOW
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-paper)',
              marginBottom: '1rem',
            }}
          >
            GIGPROOF doesn&apos;t promise anything.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '0.95rem',
              color: 'rgba(243,245,239,0.6)',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            No score. No ranking. No guarantee that an artist will fill a floor.
            Evidence with a verification method and a date — that&apos;s what GIGPROOF
            provides. The decision is yours.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              'NO SCORES',
              'NO RANKINGS',
              'NO PREDICTIONS',
              'NO GUARANTEES',
              'METHOD-LABELLED EVIDENCE ONLY',
            ].map((chip) => (
              <span
                key={chip}
                style={{
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontSize: '0.6rem',
                  color: 'rgba(243,245,239,0.4)',
                  border: '1px solid rgba(243,245,239,0.12)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  letterSpacing: '0.06em',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-paper)', padding: '5rem max(24px, 4vw)', textAlign: 'center' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '1rem',
            }}
          >
            Getting a link from an artist?
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '0.9rem',
              color: 'var(--color-tally-onlight)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}
          >
            Just open it. GIGPROOF is completely free for booking managers —
            no signup, no account, no friction.
          </p>
          <Link
            href="/passport/demo"
            style={{
              background: 'var(--color-ink)',
              color: 'var(--color-paper)',
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '0.9rem 1.75rem',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-block',
            }}
          >
            SEE A SAMPLE PASSPORT →
          </Link>
        </div>
      </section>

    </main>
  )
}
