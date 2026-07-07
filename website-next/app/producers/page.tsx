import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Producers — Verify One Show in 30 Seconds',
  description:
    'Verify one artist claim via a magic link — no account, no signup, fully bounded. Your confirmation turns a self-reported gig into verified evidence.',
  openGraph: {
    title: 'For Producers | GIGPROOF',
    description: 'You confirm what happened. We make sure that confirmation means something.',
    type: 'website',
  },
}

const steps = [
  '1. Artist sends you a WhatsApp / SMS / email link',
  '2. Click the link — opens in your browser',
  '3. See the gig record (one show, date, venue, estimate)',
  '4. Confirm, flag, or decline',
  '5. Done. No account, no follow-up.',
]

const whyItMatters = [
  {
    title: 'Self-reported data vs producer-confirmed',
    body: 'An audience estimate from the artist themselves is useful context. The same data confirmed by the producer who ran the show is evidence. Your confirmation creates that distinction.',
  },
  {
    title: 'Method-labelled, always',
    body: 'Every claim on the Passport carries a visible method label. When you confirm, it reads "✓ Confirmed by producer · [Your name, Venue]". The booking manager sees exactly what it is.',
  },
  {
    title: 'You can decline or flag',
    body: "If the numbers are off, you can say so. If you can't accurately assess draw from your side, you can decline. Honest disagreement is built into the system — forced confirmation is not the model.",
  },
  {
    title: 'Nothing goes public without artist approval',
    body: 'After you confirm, the artist still approves before anything crosses into the public Passport. Your confirmation is an input — the artist controls publication.',
  },
]

export default function ProducersPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <header
        style={{
          background: 'var(--color-ink)',
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
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: '48rem', margin: '0 auto', position: 'relative' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'rgba(243,245,239,0.4)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            FOR PRODUCERS · למפיקים
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
            You confirm what happened.<br />
            We make sure it means something.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '1.1rem',
              color: 'rgba(243,245,239,0.6)',
              lineHeight: 1.6,
              maxWidth: '42rem',
              marginBottom: '2.5rem',
            }}
          >
            An artist you worked with sent you a magic link. They&apos;re asking you to confirm
            one thing about one show. No account, no signup — just open the link and confirm
            or correct the record.
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
              See what the Passport looks like →
            </Link>
            <Link
              href="/how-it-works"
              style={{
                border: '1px solid rgba(243,245,239,0.15)',
                color: 'rgba(243,245,239,0.7)',
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

      {/* ── YOUR ROLE ────────────────────────────────────── */}
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
            YOUR ROLE
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '2rem',
            }}
          >
            One confirmation. Bounded.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1px',
              background: 'rgba(10,13,11,0.08)',
              border: '1px solid rgba(10,13,11,0.08)',
              marginBottom: '3rem',
            }}
          >
            {[
              {
                icon: '🔗',
                title: 'You receive a magic link',
                body: "An artist sends you a link specific to one show. Click it — no account creation, no app download.",
              },
              {
                icon: '📋',
                title: 'You see one gig record',
                body: "Date, venue, and the artist's audience estimate. You review it against what you actually observed.",
              },
              {
                icon: '✓',
                title: 'You confirm, correct, or decline',
                body: "If the data looks right, confirm. If something's off, you can flag it. If you can't assess, you say so.",
              },
              {
                icon: '🔒',
                title: "That's the full scope",
                body: "Your access is bounded to that one claim. No ongoing role, no account, no further obligation.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{ background: 'var(--color-paper)', padding: '1.75rem' }}
              >
                <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.75rem' }}>
                  {item.icon}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '0.95rem',
                    color: 'var(--color-ink)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                    fontSize: '0.875rem',
                    color: 'var(--color-tally)',
                    lineHeight: 1.6,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          {/* Entity firewall callout — CRITICAL per CLAUDE.md */}
          <div
            style={{
              border: '1px solid rgba(200,240,77,0.2)',
              background: 'rgba(200,240,77,0.04)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '0.65rem',
                color: 'var(--color-stamp)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              אמרגן ≠ מפיק
            </p>
            <p
              style={{
                fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                fontSize: '0.875rem',
                color: 'var(--color-tally)',
                lineHeight: 1.6,
              }}
            >
              A <strong style={{ color: 'var(--color-ink)' }}>producer (מפיק)</strong> confirms
              one claim via this bounded magic link — no account, no ongoing access.
              A <strong style={{ color: 'var(--color-ink)' }}>booking manager (אמרגן)</strong> is
              a different role entirely: they evaluate the full Passport and decide whether to book.
              These are separate roles with separate tools in GIGPROOF. Never merged.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY IT MATTERS ───────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: '4rem 1.5rem',
          borderTop: '1px solid rgba(10,13,11,0.06)',
          borderBottom: '1px solid rgba(10,13,11,0.06)',
        }}
      >
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
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
            WHY PRODUCER CONFIRMATION MATTERS
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '1.5rem',
            }}
          >
            Your word carries weight.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {whyItMatters.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '1.5rem 0',
                  borderBottom: '1px solid rgba(10,13,11,0.06)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '0.95rem',
                    color: 'var(--color-ink)',
                    marginBottom: '0.4rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                    fontSize: '0.875rem',
                    color: 'var(--color-tally)',
                    lineHeight: 1.65,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT FEELS FROM YOUR SIDE ──────────────────── */}
      <section style={{ background: 'var(--color-paper)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--color-night)',
              padding: '2.5rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '2rem',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '0.65rem',
                color: 'var(--color-stamp)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              HOW IT FEELS FROM YOUR SIDE
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {steps.map((step) => (
                <p
                  key={step}
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: '0.75rem',
                    color: 'rgba(243,245,239,0.6)',
                    letterSpacing: '0.02em',
                    lineHeight: 1.5,
                  }}
                >
                  {step}
                </p>
              ))}
            </div>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '0.875rem',
              color: 'var(--color-tally)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            Want to understand how your confirmation appears in the final Passport?
          </p>
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
            See the sample Passport →
          </Link>
        </div>
      </section>
    </>
  )
}
