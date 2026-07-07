import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Artists — Own Your Live-Performance Evidence',
  description:
    'GIGPROOF helps independent artists build a verified Bookability Passport. Log gigs, get producer confirmation, share proof — not promises.',
  openGraph: {
    title: 'For Artists | GIGPROOF',
    description: 'A Spotify link doesn\'t close a booking. Method-labelled proof does.',
    type: 'website',
  },
}

const APP_URL = 'https://app.gigproof.co'

const problems = [
  {
    num: '01',
    title: 'Followers don\'t fill floors.',
    body: 'A serious booking manager knows social reach ≠ live draw. Follower counts are existence, not evidence.',
  },
  {
    num: '02',
    title: 'An EPK isn\'t evidence.',
    body: 'An EPK is a marketing profile. A booking manager who\'s been burned once won\'t trust a polished bio the second time.',
  },
  {
    num: '03',
    title: 'Your data lives on their platforms.',
    body: 'Spotify, Instagram, YouTube — that data is theirs. GIGPROOF lets you own the evidence that matters for live performance.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Log your gigs',
    body: 'Add date, venue, and your audience estimate. The system creates a record with a unique verification ID.',
  },
  {
    num: '02',
    title: 'Send verification link to the producer',
    body: 'GIGPROOF generates a magic link. Send it via WhatsApp, SMS, or email — the producer doesn\'t need an account.',
  },
  {
    num: '03',
    title: 'Producer confirms in 30 seconds',
    body: 'They open the link, review the data, and click confirm. The claim becomes "producer-confirmed."',
  },
  {
    num: '04',
    title: 'You approve before anything goes public',
    body: 'Every piece of evidence waits for your approval before crossing into the public Passport. Nothing goes out without your explicit OK.',
  },
]

export default function ArtistsPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <header
        style={{
          background: 'var(--color-stamp)',
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
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.06\'/%3E%3C/svg%3E")',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: '48rem', margin: '0 auto', position: 'relative' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'rgba(243,245,239,0.6)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            FOR ARTISTS · לאמנים
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
            Proof you own and control.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '1.1rem',
              color: 'rgba(243,245,239,0.75)',
              lineHeight: 1.6,
              maxWidth: '42rem',
              marginBottom: '2.5rem',
            }}
          >
            Talent isn&apos;t enough. You need to prove it — in a way a booking manager
            can actually trust.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--color-ink)',
                color: 'var(--color-paper)',
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
              Build your Passport →
            </a>
            <Link
              href="/passport/demo"
              style={{
                border: '1px solid rgba(243,245,239,0.3)',
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
              See a sample Passport
            </Link>
          </div>
        </div>
      </header>

      {/* ── THE PROBLEM ──────────────────────────────────── */}
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
            WHAT&apos;S NOT WORKING NOW
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '2.5rem',
            }}
          >
            A Spotify link doesn&apos;t close a booking.
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
            {problems.map((p) => (
              <div
                key={p.num}
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
                  {p.num}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--color-ink)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                    fontSize: '0.875rem',
                    color: 'var(--color-tally)',
                    lineHeight: 1.6,
                  }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ─────────────────────────────────── */}
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
            WHAT YOU GET
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '2.5rem',
            }}
          >
            Two tools. One goal.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                title: 'Artist Radar (private to you)',
                body: "Your private dashboard: see exactly what evidence you have, what you're missing, and the single highest-value next action. A growth tool — never exposed publicly.",
              },
              {
                title: 'Bookability Passport (public — with your approval)',
                body: 'A clean, method-labelled view of your verified strengths. Only what you approve is shown. No scores, no rankings — evidence with bands, verification method, and date.',
              },
              {
                title: 'Direct share to booking managers',
                body: 'One link. Send via WhatsApp, email, or DM — the booking manager opens it in a browser and sees your evidence. No account required on their end.',
              },
              {
                title: 'Booking requests come to you',
                body: "A booking manager who views your Passport can send an availability request directly. No intermediary, no account needed on their side.",
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  padding: '1.75rem 0',
                  borderBottom: '1px solid rgba(10,13,11,0.06)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '1rem',
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
                    lineHeight: 1.6,
                    maxWidth: '56rem',
                  }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW VERIFICATION WORKS ───────────────────────── */}
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
            HOW VERIFICATION WORKS
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-paper)',
              marginBottom: '2.5rem',
            }}
          >
            30 seconds for the producer. Evidence that lasts.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {steps.map((s) => (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  padding: '1.5rem 0',
                  borderBottom: '1px solid rgba(243,245,239,0.07)',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: '0.75rem',
                    color: 'var(--color-stamp)',
                    letterSpacing: '0.08em',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {s.num}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                      fontSize: '0.95rem',
                      color: 'var(--color-paper)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                      fontSize: '0.875rem',
                      color: 'rgba(243,245,239,0.55)',
                      lineHeight: 1.6,
                    }}
                  >
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              color: 'rgba(243,245,239,0.3)',
              letterSpacing: '0.06em',
              marginTop: '2rem',
            }}
          >
            The producer (מפיק) confirms ONE claim via a bounded magic link — no
            account, no ongoing access. אמרגן ≠ מפיק — they are different roles.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-paper)', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              color: 'var(--color-tally)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            CLOSED BETA · ISRAEL
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '1rem',
            }}
          >
            Ready to build your Passport?
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
            Private beta, Israeli market. Artists pay; booking managers are always free.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
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
              Build your Passport — start free →
            </a>
            <Link
              href="/passport/demo"
              style={{
                border: '1.5px solid var(--color-ink)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                fontSize: '0.9rem',
                letterSpacing: '0.02em',
                padding: '0.875rem 1.75rem',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-block',
              }}
            >
              See a sample Passport
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
