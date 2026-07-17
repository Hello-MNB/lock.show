import type { CSSProperties } from 'react'

/**
 * Official LOCK stamp mark.
 * Use as:
 *   - Nav logomark (size ~22, full opacity, current color)
 *   - Hero watermark (size 280-340, opacity 0.05-0.08, absolutely positioned)
 */
export function DoorStamp({
  size = 200,
  style,
}: {
  size?: number
  style?: CSSProperties
}) {
  const h = Math.round(size * (130 / 200))
  return (
    <svg
      viewBox="0 0 200 130"
      width={size}
      height={h}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', color: 'inherit', ...style }}
    >
      {/* Outer frame */}
      <rect x="3" y="3" width="194" height="124" rx="2" stroke="currentColor" strokeWidth="4.5" />
      {/* Inner frame */}
      <rect x="10" y="10" width="180" height="110" rx="1" stroke="currentColor" strokeWidth="1" />

      {/* LOCK */}
      <text
        x="100" y="40"
        fontFamily="monospace"
        fontSize="18"
        letterSpacing="5"
        textAnchor="middle"
        fill="currentColor"
        fontWeight="700"
      >
        LOCK
      </text>

      {/* Top rule */}
      <line x1="22" y1="52" x2="178" y2="52" stroke="currentColor" strokeWidth="0.75" />

      {/* Center label */}
      <text
        x="100" y="70"
        fontFamily="monospace"
        fontSize="9.5"
        letterSpacing="3"
        textAnchor="middle"
        fill="currentColor"
      >
        VERIFIED
      </text>

      {/* Bottom rule */}
      <line x1="22" y1="81" x2="178" y2="81" stroke="currentColor" strokeWidth="0.75" />

      {/* Bottom label */}
      <text
        x="100" y="99"
        fontFamily="monospace"
        fontSize="6.5"
        letterSpacing="2.5"
        textAnchor="middle"
        fill="currentColor"
      >
        PRE-BOOKING PROOF
      </text>

      {/* Corner marks */}
      <circle cx="21" cy="18" r="2" fill="currentColor" />
      <circle cx="179" cy="18" r="2" fill="currentColor" />
      <circle cx="21" cy="112" r="2" fill="currentColor" />
      <circle cx="179" cy="112" r="2" fill="currentColor" />
    </svg>
  )
}
