import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/site'

import { Hero } from '@/components/hero'
import ContactForm from '@/components/contact-form'
import { ContactChannels } from '@/components/contact-channels'
import { APP_URL } from '@/lib/app-url'
import { conversionHref, conversionLabel } from '@/lib/conversion'


export const metadata: Metadata = {
  alternates: localeAlternates('/contact'),
  title: 'Contact — Get in Touch',
  description: 'LOCK SHOW is in closed beta. We want to hear from artists, booking managers, and producers. Questions, feedback, and collaboration welcome.',
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
  // 'Languages: Hebrew · English' REMOVED (owner, 17 Aug): a technical note,
  // not marketing copy. The site already announces its languages by BEING in
  // them — the locale toggle is the affordance, a spec line is not.
]

export default function Contact() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* PAGE HEADER — compact variant (T-97 hero system: styles/hero.css) */}
      <Hero variant="compact" align="start" style={{ borderBottom: '1px solid rgba(10,13,11,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp-onlight)',
            textTransform: 'uppercase',
            marginBottom: 'var(--hero-gap-eyebrow)',
          }}>
            CONTACT · GET IN TOUCH
          </p>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            margin: '0 0 var(--hero-gap-h1)',
          }}>
            Questions? Ideas? Collaboration?
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally-onlight)', maxWidth: '500px', lineHeight: 1.6, margin: 0 }}>
            LOCK SHOW is in closed beta. We always want to hear from artists, booking managers, and producers.
          </p>
          </div>
        </div>
      </Hero>

      {/* CONTACT GRID */}
      {/* container-contrast law: white body after the paper page header */}
      <section style={{ padding: '64px 24px 80px', backgroundColor: '#ffffff' }}>
        <div
          className="contact-grid"
          style={{
            maxWidth: '1100px',
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
            <ContactForm />
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

              {/* Direct channels — icon-first, no plain-text phone number */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(10,13,11,0.08)' }}>
                <ContactChannels />
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
      {/* T-97.1 dark-adjacency law: ink, not night — the footer below is
          night, adjacent dark containers must not share the same tone */}
      <section style={{
        backgroundColor: 'var(--color-ink)',
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
            {/* Was: "Registration is open — free for artists during the pilot."
                Both halves were false in waitlist mode — no account is created at
                submit, and §10.1 replaces "free in the pilot" with "beta access
                opens in waves" unless a current OfferVersion approves a free
                offer. Found by the visual-baseline review, not by a gate. */}
            Beta access opens in waves — tell us how you work and we'll invite you.
          </p>
          <a
            href={`${conversionHref({ page: 'contact', placement: 'body' })}`}
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: 'transparent',
              color: 'var(--color-paper)',
              border: '1px solid var(--ghost-border-on-dark)',
              fontFamily: 'var(--font-space-mono)',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {conversionLabel()}
          </a>
        </div>
      </section>

    </main>
  )
}
