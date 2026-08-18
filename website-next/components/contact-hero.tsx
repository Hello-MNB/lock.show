'use client'

/**
 * Contact hero + form heading, read from the copy matrix.
 *
 * These five strings were the concrete half of the localization gap: the matrix
 * carried translated Hebrew that NOTHING rendered, so /contact showed English
 * headings under dir=rtl. Independent QA named them (D10) — five ids with zero
 * consumers.
 *
 * The English is byte-identical to what the page rendered before. A localization
 * migration must not restyle approved English copy under cover of a translation
 * ticket, and holding it identical also keeps the /contact hero height inside the
 * compact-variant contract.
 */
import { useLocale } from '../lib/locale-context'
import { t } from '../content/copy-matrix'

export function ContactEyebrow(props: { style?: React.CSSProperties }) {
  const { locale } = useLocale()
  return <p style={props.style}>{t('contact.header.hero.eyebrow', locale)}</p>
}

export function ContactH1(props: { style?: React.CSSProperties }) {
  const { locale, dir } = useLocale()
  return <h1 dir={dir} style={props.style}>{t('contact.header.hero.h1', locale)}</h1>
}

export function ContactLead(props: { style?: React.CSSProperties }) {
  const { locale, dir } = useLocale()
  return <p dir={dir} style={props.style}>{t('contact.header.hero.lead', locale)}</p>
}

export function ContactFormHeading(props: { style?: React.CSSProperties }) {
  const { locale } = useLocale()
  return <p style={props.style}>{t('contact.form.block.h2', locale)}</p>
}
