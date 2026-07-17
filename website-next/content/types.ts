// Content module types — per-page typed dictionaries, exporting { en, he }.
// NO hardcoded copy in components/pages: every string lives here so the
// Hebrew wave only wires a locale switch (mechanical, no copy work).
//
// HE strings come VERBATIM from the Codex HE copy pack
// (00_INDEX / 01_HOME / 02_ARTISTS, 2026-07-14). Where the pack has no
// string yet, the value is the TODO_HE marker — never an improvised
// translation.
//
// Canon (absolute): פספורט never דרכון · buyer = מזמין הופעות never אמרגן
// (אמרגן is artist-side only) · no score/rank/percentile/prediction
// language · free pilot — no prices.

import type { IconId } from '@/components/marketing/icons'

/** Marker for Hebrew strings the Codex HE copy pack does not cover yet. */
export const TODO_HE = 'TODO_HE'

export type Locale = 'en' | 'he'

export interface Cta {
  label: string
  href: string
}

export interface HeroContent {
  eyebrow: string
  h1: string
  body: string
  primaryCta: Cta
  secondaryCta: Cta
  trustLine: string
  imageAlt: string
}

export interface CardContent {
  title: string
  body: string
}

export interface FlowStepContent {
  verb: string
  body: string
  icon: IconId
}

export interface EntityCardContent {
  icon: IconId
  audienceLabel: string
  title: string
  body: string
  cta: Cta
}

export interface SectionHeadingContent {
  eyebrow: string
  title: string
  body?: string
}

export interface FinalCtaContent {
  title: string
  body?: string
  primaryCta: Cta
  secondaryLink: Cta
}
