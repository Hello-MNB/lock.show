import type { Metadata } from 'next'
import WaitlistForm from '../../components/waitlist-form'
import { APP_URL } from '@/lib/app-url'
import { SOCIAL, WHATSAPP_URL, WHATSAPP_DISPLAY } from '@/lib/social'

export const metadata: Metadata = {
  alternates: { canonical: '/contact' },
  title: 'Contact — Get in Touch',
  description: 'LOCK is in closed beta. We want to hear from artists, booking managers, and producers. Questions, feedback, and collaboration welcome.',
}

const lookingFor = [
  'Independent artists who want their live draw taken seriously',
  'Booking managers evaluating unfamiliar talent',
  'Producers happy to confirm the shows they ran — one click, no account',
  'Honest feedback — what works, what doesn\'t',
]

const contactDetails = [
  { label: 'Location', value: 'Tel Aviv, Israel' },
  { label: 'Stage', value: 'Closed Beta 2026' },
  { label: 'Languages', value: 'Hebrew · English' },
]

export default function Contact() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* PAGE HEADER */}
      <section style={{ padding: '72px 24px 56px', borderBottom: '1px solid rgba(10,13,11,0.08)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp-onlight)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            CONTACT · GET IN TOUCH
          </p>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            margin: '0 0 20px',
          }}>
            Questions? Ideas? Collaboration?
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally-onlight)', maxWidth: '500px', lineHeight: 1.6, margin: 0 }}>
            LOCK is in closed beta. We always want to hear from artists, booking managers, and producers.
          </p>
          </div>
        </div>
      </section>

      {/* CONTACT GRID */}
      <section style={{ padding: '64px 24px 80px' }}>
        <div
          className="contact-grid"
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: '48px',
            alignItems: 'start',
          }}
        >

          {/* FORM COLUMN */}
          <div>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              color: 'var(--color-tally-onlight)',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              SEND A MESSAGE
            </p>

            {/* First-party waitlist capture — writes to waitlist_signup
                (migration 026; write-only for the public, operator-only read).
                No Formspree, no third parties — matching the promise below. */}
            <WaitlistForm />
          </div>

          {/* INFO COLUMN */}
          <div className="m-divide" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Contact details */}
            <div className="m-flat" style={{
              padding: '28px 24px',
              border: '1px solid rgba(10,13,11,0.08)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally-onlight)',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                CONTACT INFO
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contactDetails.map((d) => (
                  <div
                    key={d.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(10,13,11,0.06)',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      color: 'var(--color-tally-onlight)',
                      textTransform: 'uppercase',
                    }}>
                      {d.label}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--color-ink)' }}>
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Direct channels */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(10,13,11,0.08)' }}>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-night)',
                    color: 'var(--color-paper)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                    WHATSAPP
                  </span>
                  <span dir="ltr" style={{ fontSize: '1rem', fontWeight: 700 }}>{WHATSAPP_DISPLAY}</span>
                </a>
                <div style={{ display: 'flex', gap: '18px' }}>
                  {SOCIAL.map(({ key, label, href }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.06em',
                        color: 'var(--color-tally-onlight)',
                        textDecoration: 'none',
                      }}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* What we're looking for */}
            <div className="m-flat" style={{
              padding: '28px 24px',
              border: '1px solid rgba(200,240,77,0.2)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(200,240,77,0.03)',
            }}>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp-onlight)',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                WHAT WE&apos;RE LOOKING FOR
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lookingFor.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-stamp-onlight)',
                      flexShrink: 0,
                      paddingTop: '2px',
                    }}>
                      ✓
                    </span>
                    <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.5 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* CTA BAND */}
      <section style={{
        backgroundColor: 'var(--color-night)',
        color: 'var(--color-paper)',
        padding: '56px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Ready to start without waiting?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '28px', fontSize: '1rem', lineHeight: 1.6 }}>
            Registration is open — free for artists during the pilot.
          </p>
          <a
            href={`${APP_URL}/signup`}
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: 'transparent',
              color: 'var(--color-paper)',
              border: '1px solid rgba(243,245,239,0.35)',
              fontFamily: 'var(--font-space-mono)',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            BUILD YOUR PASSPORT →
          </a>
        </div>
      </section>

    </main>
  )
}
