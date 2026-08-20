import Image from 'next/image'
import type { CSSProperties } from 'react'

const SYMBOL_SRC = '/brand/lockshow-symbol-spotlight-lens-v2-lime.svg'

export function BrandSymbol({
  size = 36,
  style,
}: {
  size?: number
  style?: CSSProperties
}) {
  return (
    <Image
      src={SYMBOL_SRC}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0, ...style }}
    />
  )
}
