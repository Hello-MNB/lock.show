import type { Metadata } from 'next'
import Link from 'next/link'

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
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <header
        style={{
          background: 'var(--color-night)',
          color: 'var(--color-paper)',
          padding: '4.5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: '48rem', margin: '0 auto', position: 'relative' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'var(--color-stamp)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            FOR BOOKING MANAGERS · לאמרגנים
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(2rem, 6vw, 3.25rem)',
              color: 'var(--color-paper)',
              lineHeight: 1.05,
              marginBottom: '1.25rem',
            }}
          >
            Evaluate before you commit.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '1.1rem',
              color: 'rgba(243,245,239,0.65)',
              lineHeight: 1.6,
              maxWidth: '42rem',
              marginBottom: '2.5rem',
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
                fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                padding: '0.875rem 1.75rem',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-block',
              }}
            >
              See a sample Passport →
            </Link>
            <Link
              href="/how-it-works"
              style={{
                border: '1px solid rgba(243,245,239,0.2)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                fontSize: '0.9rem',
                letterSpacing: '0.02em',
                padding: '0.875rem 1.75rem',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-block',
              }}
            >
              How it works
            </Link>
          </div>
        </div>
      </header>

      {/* ── THE RISK ─────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: '4rem 1.5rem',
          borderBottom: '1px solid rgba(10,13,11,0.06)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              color: 'var(--color-tally)',
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
                    color: 'var(--color-tally)',
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
                    color: 'var(--color-tally)',
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
      <section style={{ background: 'var(--color-paper)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              color: 'var(--color-tally)',
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
                    color: 'var(--color-stamp)',
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
                    color: 'var(--color-tally)',
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
      <section style={{ background: 'var(--color-night)', padding: '4rem 1.5rem' }}>
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
      <section style={{ background: 'var(--color-paper)', padding: '5rem 1.5rem', textAlign: 'center' }}>
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
              color: 'var(--color-tally)',
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
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: '0.9rem',
              letterSpacing: '0.02em',
              padding: '0.875rem 1.75rem',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-block',
            }}
          >
            See a sample Passport →
          </Link>
        </div>
      </section>
    </>
  )
}
