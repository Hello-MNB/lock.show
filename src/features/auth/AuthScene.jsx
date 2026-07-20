import { Link } from 'react-router-dom'
import { Wordmark, LanguageToggle } from '../../components/ui.jsx'
import BuildStamp from '../../components/BuildStamp.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useAuth } from './AuthProvider.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { homePathFor } from '../../lib/navigation.js'
import { DEMO } from '../../lib/demo.js'

// The public marketing site's home — where a LOGGED-OUT visitor lands when
// they tap the wordmark on an auth screen (it must never be a dead mark).
const SITE_HOME = 'https://lock.show'

// Local auth-scene shell (auth feature only — not a shared component).
// Cinematic split: warm artist photo on the left (hidden on mobile), the form
// column on the right. One warm light, backstage intimacy — never a dashboard.
// LANGUAGE LAW: the left-panel copy is localized (no hardcoded EN in a HE view).
// `tagline` may be overridden per screen (e.g. Signup); it defaults to the
// localized authScene.tagline.
export default function AuthScene({ children, tagline }) {
  const { T } = useLang()
  const { user } = useAuth() || {}
  const { role, isProducerWorkspace } = useOrg() || {}
  // LOGO → HOME (never a dead mark): logged-out taps land on the public site
  // home; a logged-in visitor (e.g. mid password-reset with a live session)
  // goes to THEIR workspace home via the same RoleHome contract App.jsx uses —
  // homePathFor is the single source of truth, so this never drifts from it.
  const loggedInHome = homePathFor({ role, isProducerWorkspace, demo: DEMO })
  const wordmark = <Wordmark />

  return (
    <div className="flex min-h-full bg-bg">
      {/* left — warm live photo with a gradient veil (desktop only) */}
      <div className="relative hidden flex-1 overflow-hidden lg:block" aria-hidden="true">
        <img src="/assets/gigproof-live-hero.webp" alt=""
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/30 via-bg/45 to-bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-bg/25" />
        <div className="absolute bottom-10 left-10 right-16 max-w-md">
          <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
            {T.authScene.eyebrow}
          </p>
          <p className="font-display text-3xl font-bold leading-tight text-ink">{tagline || T.authScene.tagline}</p>
          <p className="mt-3 text-sm text-muted">
            {T.authScene.disclaimer}
          </p>
        </div>
      </div>

      {/* right — the form column. `relative` so the header can be lifted out
          of flow at desktop (lg:absolute) — otherwise its reserved row height
          skews the flex-centered form off the column's true vertical middle,
          visibly off-balance against the hero image at wide viewports. Mobile
          keeps the original in-flow header (untouched — same fit as before). */}
      <div className="relative flex w-full flex-col px-4 py-6 sm:px-8 lg:w-[520px] lg:shrink-0">
        <div className="mb-8 flex items-center justify-between lg:absolute lg:inset-x-8 lg:top-6 lg:z-10 lg:mb-0">
          {user
            ? <Link to={loggedInHome} aria-label={T.authScene.homeAria} className="tap-target">{wordmark}</Link>
            : <a href={SITE_HOME} aria-label={T.authScene.homeAria} className="tap-target">{wordmark}</a>}
          <LanguageToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          {/* Build stamp lives INSIDE the centered card (not a page-level
              sibling) so it never skews the vertical-centering math above —
              it's part of the one thing that's centered, always below it. */}
          <div className="w-full max-w-sm animate-fade-in pb-10">
            {children}
            <BuildStamp className="mt-8 flex justify-center" />
          </div>
        </div>
      </div>
    </div>
  )
}
