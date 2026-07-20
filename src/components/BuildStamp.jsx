// Quiet build/environment stamp (W-2#5, owner directive): every screen shows
// "{PREVIEW|LIVE} · {sha7} · {date}" so anyone looking at a live screen — the
// owner, a tester, a bug reporter — can tell which build they're on without
// opening devtools. __BUILD_SHA__/__BUILD_TIME__ are baked in at build time
// by vite.config.js (VERCEL_GIT_COMMIT_SHA in prod, `git rev-parse HEAD`
// locally). LIVE vs PREVIEW is a build check (import.meta.env.PROD) PLUS a
// hostname check — a prod BUILD served from a Vercel preview URL (or a local
// `vite preview`) must still read PREVIEW, only the two real production
// hostnames count as LIVE.
// i18n-exempt: a technical diagnostic line, not product copy (mandate: the
// evidence firewall covers user-facing claims, not build metadata).
const LIVE_HOSTS = new Set(['app.lock.show', 'lock.show'])

export default function BuildStamp({ className = '' }) {
  const sha = typeof __BUILD_SHA__ === 'string' ? __BUILD_SHA__ : 'dev'
  const time = typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : ''
  const sha7 = sha.slice(0, 7)
  const date = time.slice(0, 10) // __BUILD_TIME__ is an ISO string — YYYY-MM-DD
  const isLive = import.meta.env.PROD && LIVE_HOSTS.has(window.location.hostname)
  const env = isLive ? 'LIVE' : 'PREVIEW'

  return (
    <p className={`select-none font-mono text-[10px] leading-none tracking-wide text-faint ${className}`}>
      {env} · {sha7} · {date}
    </p>
  )
}
