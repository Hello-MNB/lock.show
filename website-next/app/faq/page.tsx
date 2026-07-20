import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/faq' },
  title: 'FAQ — What LOCK Does (and Doesn\'t) Promise',
  description: 'Straight answers on how verification works, what a Passport shows, and why there\'s no score, rank, or guarantee — ever.',
}

const faqs = [
  {
    category: 'WHAT IT IS',
    questions: [
      {
        q: 'What is LOCK?',
        a: 'LOCK helps independent artists prove their live draw before a booking manager ever calls. Instead of a bio or a follower count, you get a Passport — a record of what actually happened on stage, with each claim showing how it was checked.',
      },
      {
        q: 'What problem does it solve?',
        a: 'Booking managers in Israel and internationally face the same problem: an unfamiliar artist sends a name, a link, maybe some screenshots. There is no standardised way to evaluate live draw without already knowing the artist or calling around. LOCK gives the booking manager a structured, method-labelled document — and gives the artist a way to prove their track record.',
      },
      {
        q: 'What is a Bookability Passport?',
        a: 'The Bookability Passport is the public-facing document a booking manager receives. Every item carries a method label — TICKET EXPORT, PRODUCER-CONFIRMED, PLATFORM DATA, OPERATOR-REVIEWED, or SELF-REPORTED. Self-reported data appears only with an explicit SELF-REPORTED label — never disguised as verified. Each item shows what was claimed, the verification method, the geographic area, and the date of review. There are no scores, no rankings, and no predictions.',
      },
      {
        q: 'What is the Artist Radar?',
        a: 'The Radar is the artist\'s private workspace — visible only to them. It shows all logged gigs and claims, including those awaiting verification. It surfaces what\'s missing and what the next action is. Nothing from the Radar appears publicly unless the artist explicitly approves it for the Passport.',
      },
    ],
  },
  {
    category: 'WHO IT IS FOR',
    questions: [
      {
        q: 'Who is an "artist" in LOCK?',
        a: 'Any live performer — solo musician, DJ, band, comedian, spoken-word artist. LOCK is artist-type-agnostic. The system adapts to the artist\'s context rather than assuming a specific genre or format.',
      },
      {
        q: 'Who is a "booking manager" (mazmin hofa\'ot)?',
        a: 'A booking manager (mazmin hofa\'ot) is the person who evaluates artists for events and takes reputational risk if a booking goes wrong. They receive Passport links, open them in a browser, and decide. This is a different role from an amargan, the artist\'s own agent or representation office. LOCK is free for booking managers — no account required to view a Passport.',
      },
      {
        q: 'Who is a "producer" (mefik)?',
        a: 'A producer (mefik) is the person who ran a specific event — took financial risk, sold tickets, managed the venue. They confirm the gig record via a bounded magic link. A producer is NOT the same as a booking manager. These are distinct roles and are never merged in this system.',
      },
      {
        q: 'Is LOCK free for booking managers?',
        a: 'Yes. A booking manager never needs to create an account, sign up, or pay to view a Passport. They receive a link, open it in a browser, and see the evidence.',
      },
      {
        q: 'Does a producer need an account to verify a gig?',
        a: 'No. A producer receives a private one-time link from the artist. They open it in their browser — no account, no password, no app. They see one gig record, and they confirm, flag, or decline. That\'s the whole job.',
      },
    ],
  },
  {
    category: 'HOW VERIFICATION WORKS',
    questions: [
      {
        q: 'What does "producer-confirmed" mean?',
        a: 'It means the person who produced the event — who ran the show, took the financial risk — confirmed the gig record via a magic link. They saw the date and venue and clicked confirm. This is the strongest verification method for live-draw claims.',
      },
      {
        q: 'What is a "magic link"?',
        a: 'A magic link is a private one-time link LOCK creates for a specific gig. The artist sends it to the producer via WhatsApp, SMS, or email. The link shows only that gig record. The producer can confirm, flag, or decline. The link expires after use and can\'t be re-used to reach anything else.',
      },
      {
        q: 'Can a claim appear on the Passport without producer confirmation?',
        a: 'Yes — if supported by another eligible method, such as a ticket export reviewed by a LOCK operator. The method label will reflect the actual verification source. A claim with a weaker method label is still visible to the booking manager with the full label shown.',
      },
      {
        q: 'Who reviews ticket export documents?',
        a: 'Submitted documents run through LOCK\'s automated review pipeline, which reads the document and assigns the method label the evidence actually supports. During the current beta the founding team keeps an eye on every result before it stands.',
      },
      {
        q: 'Can an artist remove a claim from their Passport?',
        a: 'Yes. The artist has full control over what appears on the public Passport at all times. They can unpublish any claim. Removing a claim from the Passport does not delete the underlying gig record from the Radar.',
      },
    ],
  },
  {
    category: 'READING A PASSPORT',
    questions: [
      {
        q: 'What is a BandPill?',
        a: 'A BandPill is the way audience draw is expressed on the Passport — as a text range (e.g. "70–150") rather than an exact number. This is by design. An exact figure implies precision that live attendance data rarely supports. A band is honest about what can actually be known. There is no fill bar, no gauge, and no visual representation of the number as a fraction of anything.',
      },
      {
        q: 'Why does every claim show a date?',
        a: 'Evidence ages. A sold-out show in January 2026 carries different weight than one from 2022. LOCK shows the review date and the period of the evidence so a booking manager can assess relevance to their current decision.',
      },
      {
        q: 'What does it mean if a Passport section is missing?',
        a: 'If a domain (e.g. streaming context) doesn\'t appear on a Passport, it means either no verified claim exists, or the artist chose not to publish it. LOCK never shows "developing" or "missing" or any weakness indicator on the public Passport. Omission is the policy — not a placeholder.',
      },
      {
        q: 'What does "LOCK doesn\'t guarantee anything" mean?',
        a: 'LOCK provides method-labelled evidence. It does not predict, guarantee, or imply that an artist will fill a floor, sell tickets, or perform to any specific outcome. Booking decisions remain entirely with the booking manager. Evidence is not a guarantee.',
      },
    ],
  },
  {
    category: 'PRIVACY & DATA',
    questions: [
      {
        q: 'Is my data stored before I give consent?',
        a: 'No. Real data is not stored before explicit, contextual consent. Consents are separate — account terms, data connection, public publication, and counterparty-name disclosure are each separate consent events. They are never pre-checked or bundled.',
      },
      {
        q: 'Can booking managers see my exact audience numbers?',
        a: 'No. Exact figures are never shown on the public Passport — only bands. The internal Radar may hold a more precise estimate for operational purposes, but this is never surfaced to buyers.',
      },
      {
        q: 'Is my contact information visible on my Passport?',
        a: 'No. Artist contact details are never accessible via a public session. An interested booking manager can send an availability request through the Passport; LOCK routes it to the artist without exposing contact information.',
      },
    ],
  },
]

export default function FAQ() {
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
            FAQ · FREQUENTLY ASKED QUESTIONS
          </p>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            margin: '0 0 20px',
          }}>
            Common questions, direct answers.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally-onlight)', maxWidth: '520px', lineHeight: 1.6, margin: 0 }}>
            If something isn&apos;t covered here, just ask — the contact page reaches a human.
          </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTIONS */}
      <section style={{ padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px' }}>
          {faqs.map((section, si) => (
            <div key={si} style={{ marginBottom: '64px' }}>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                color: 'var(--color-tally-onlight)',
                textTransform: 'uppercase',
                marginBottom: '24px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(10,13,11,0.08)',
              }}>
                {section.category}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.questions.map((item, qi) => (
                  <details
                    key={qi}
                    style={{
                      borderBottom: '1px solid rgba(10,13,11,0.08)',
                    }}
                  >
                    <summary style={{
                      padding: '20px 0',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-archivo)',
                      fontSize: '1rem',
                      lineHeight: 1.4,
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                    }}>
                      <span>{item.q}</span>
                      <span className="faq-glyph" aria-hidden style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.8rem',
                        color: 'var(--color-stamp-onlight)',
                        flexShrink: 0,
                      }} />
                    </summary>
                    <p style={{
                      padding: '0 0 24px 0',
                      fontSize: '1rem',
                      color: 'var(--color-tally-onlight)',
                      lineHeight: 1.7,
                      margin: 0,
                      maxWidth: '640px',
                    }}>
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* STILL HAVE QUESTIONS? */}
      <section style={{
        backgroundColor: 'var(--color-night)',
        color: 'var(--color-paper)',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Still have questions?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '32px', lineHeight: 1.6 }}>
            Reach out directly — we&apos;re in closed beta and talk to everyone.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/contact"
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
              CONTACT US →
            </a>
            <a
              href="/passport/demo"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              SEE A SAMPLE PASSPORT
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
