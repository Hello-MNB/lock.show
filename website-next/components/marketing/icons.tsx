// Marketing icon system — Codex rebuild brief §7.
// Icons carry meaning only: entity / action / trust method / product.
// No decorative icons.

export type IconId =
  // entity
  | 'artist'
  | 'manager'
  | 'production'
  | 'buyer'
  | 'source'
  // action
  | 'add'
  | 'review'
  | 'confirm'
  | 'share'
  | 'request'
  // trust / product
  | 'lock'
  | 'radar'
  | 'passport'
  | 'link'
  // ui
  | 'arrow'

const ICON_PATHS: Record<IconId, string> = {
  artist:
    '<circle cx="12" cy="8" r="3"/><path d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6"/><path d="M19 4v7M16.5 6.5 19 4l2.5 2.5"/>',
  manager:
    '<circle cx="8" cy="8" r="2.5"/><circle cx="17" cy="9" r="2"/><path d="M3.5 19c.5-3.4 2-5.2 4.5-5.2s4 1.8 4.5 5.2M13.5 18c.4-2.7 1.6-4.1 3.5-4.1s3.1 1.4 3.5 4.1"/>',
  production:
    '<path d="M3 20V9l9-5 9 5v11"/><path d="M3 20h18"/><path d="M9 20v-6h6v6"/>',
  buyer:
    '<path d="M4 6h16v14H4z"/><path d="M4 10h16M8 3v4M16 3v4"/><path d="m9.5 15 2 2 3.5-3.5"/>',
  source:
    '<path d="m9 15 6-6"/><path d="m11.5 5.5 1-1a4 4 0 0 1 5.66 5.66l-1 1"/><path d="m12.5 18.5-1 1a4 4 0 0 1-5.66-5.66l1-1"/>',
  add: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  review:
    '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  confirm:
    '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/>',
  share:
    '<path d="M4 13v7h16v-7"/><path d="M12 3v12M8 7l4-4 4 4"/>',
  request:
    '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
  lock: '<path d="M6 10h12v11H6zM8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/><circle cx="12" cy="15" r="1.2"/>',
  radar:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 3v9l6.5-6.5"/>',
  passport:
    '<path d="M5 3h14v18H5z"/><circle cx="12" cy="10" r="3"/><path d="M8 17c.7-2 2-3 4-3s3.3 1 4 3"/>',
  link: '<path d="m9 15 6-6"/><path d="m11.5 5.5 1-1a4 4 0 0 1 5.66 5.66l-1 1"/><path d="m12.5 18.5-1 1a4 4 0 0 1-5.66-5.66l1-1"/>',
  arrow: '<path d="M4 12h15M14 7l5 5-5 5"/>',
}

export function Icon({
  id,
  size = 18,
  color = 'currentColor',
}: {
  id: IconId
  size?: number
  color?: string
}) {
  const paths = ICON_PATHS[id] ?? ''
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  )
}
