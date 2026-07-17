import { Wordmark, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Local auth-scene shell (auth feature only — not a shared component).
// Cinematic split: warm artist photo on the left (hidden on mobile), the form
// column on the right. One warm light, backstage intimacy — never a dashboard.
// LANGUAGE LAW: the left-panel copy is localized (no hardcoded EN in a HE view).
// `tagline` may be overridden per screen (e.g. Signup); it defaults to the
// localized authScene.tagline.
export default function AuthScene({ children, tagline }) {
  const { T } = useLang()
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

      {/* right — the form column */}
      <div className="flex w-full flex-col px-4 py-6 sm:px-8 lg:w-[520px] lg:shrink-0">
        <div className="mb-8 flex items-center justify-between">
          <Wordmark />
          <LanguageToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm animate-fade-in pb-10">{children}</div>
        </div>
      </div>
    </div>
  )
}
