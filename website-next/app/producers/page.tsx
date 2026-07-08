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

const ICON_PATHS: Record<string, string> = {
  link:    '<path d="M8 12h8M13 9l3 3-3 3"/><path d="M10 5H5v14h5M14 5h5v14h-5"/>',
  clip:    '<path d="M5 5h14v16H5zM8 3v4M16 3v4M5 9h14"/><path d="m9 15 2 2 4-4"/>',
  check:   '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/>',
  lock:    '<path d="M6 10h12v11H6zM8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/><circle cx="12" cy="15" r="1.2"/>',
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  )
}

export default function ProducersPage() {
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
          background: `linear-gradient(180deg, rgba(10,13,11,0.55) 0%, rgba(10,13,11,0.86) 55%, rgba(10,13,11,0.97) 100%), url('/gigproof-persona-producer-v1.webp') center/cover no-repeat`,
          color: 'var(--color-paper)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
        }}
      >
        <div style={{ maxWidth: '640px', position: 'relative' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.14em',
              color: 'rgba(243,245,239,0.4)',
              textTransform: 'uppercase',
              marginBottom: '1.75rem',
            }}
          >
            FOR PRODUCERS · למפיקים
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
            You confirm what happened.
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
              We make sure it counts.
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
              SEE WHAT THE PASSPORT LOOKS LIKE →
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

      {/* ── YOUR ROLE ────────────────────────────────────── */}
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
                icon: 'link',
                title: 'You receive a magic link',
                body: "An artist sends you a link specific to one show. Click it — no account creation, no app download.",
              },
              {
                icon: 'clip',
                title: 'You see one gig record',
                body: "Date, venue, and the artist's audience estimate. You review it against what you actually observed.",
              },
              {
                icon: 'check',
                title: 'You confirm, correct, or decline',
                body: "If the data looks right, confirm. If something's off, you can flag it. If you can't assess, you say so.",
              },
              {
                icon: 'lock',
                title: "That's the full scope",
                body: "Your access is bounded to that one claim. No ongoing role, no account, no further obligation.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{ background: 'var(--color-paper)', padding: '1.75rem' }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(200,240,77,0.1)',
                  color: 'var(--color-stamp-onlight)',
                  marginBottom: '0.875rem',
                }}>
                  <Icon name={item.icon} size={18} />
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
                    color: 'var(--color-tally-onlight)',
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
                color: 'var(--color-stamp-onlight)',
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
                color: 'var(--color-tally-onlight)',
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
          padding: '4rem max(24px, 4vw)',
          borderTop: '1px solid rgba(10,13,11,0.06)',
          borderBottom: '1px solid rgba(10,13,11,0.06)',
        }}
      >
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
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
                    color: 'var(--color-tally-onlight)',
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
      <section style={{ background: 'var(--color-paper)', padding: '4rem max(24px, 4vw)', textAlign: 'center' }}>
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
              color: 'var(--color-tally-onlight)',
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
            SEE THE SAMPLE PASSPORT →
          </Link>
        </div>
      </section>

    </main>
  )
}
