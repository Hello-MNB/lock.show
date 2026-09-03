'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackMarketingEvent(eventName: string, parameters: Record<string, string> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, parameters)
}

export function TrackedLink({
  href,
  eventName,
  eventContext,
  className,
  children,
}: {
  href: string
  eventName: string
  eventContext: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackMarketingEvent(eventName, { context: eventContext, destination: href })}
    >
      {children}
    </Link>
  )
}
