import type { Metadata } from 'next'
import AccessibilityContent from './accessibility-content'

export const metadata: Metadata = {
  title: 'Accessibility | LOCK',
  description: 'LOCK accessibility statement — draft. Our commitment, what has been made accessible so far, known limitations, and how to reach us.',
}

export default function Accessibility() {
  return <AccessibilityContent />
}
