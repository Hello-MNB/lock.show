// Site 404 with the /app deep-link bootstrap (owner audit 17 Jul).
// The static export cannot serve dynamic app routes (/app/passport/:id,
// /app/confirm/:token …) — no physical file exists, so they land here.
// The inline script runs before paint: any /app/* path bounces into the app
// shell as /app/?dl=<original>, and the app restores the address before its
// router mounts (src/main.jsx). Same-origin only — the script never uses a
// caller-controlled host, only location.pathname/search of THIS origin.
// Every other path gets a warm site 404 instead of Next's bare default.
import type { Metadata } from 'next'
import Link from 'next/link'

// A 404 must never be an indexation target (C27 fix). App Router supports a
// static `metadata` export on not-found.tsx — this renders
// <meta name="robots" content="noindex, nofollow"> into the built out/404.html.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

const BOUNCE = `(function(){var p=location.pathname;
if(p.indexOf('/app/')===0||p==='/app'){
  location.replace('/app/?dl='+encodeURIComponent(p+location.search));
  return;
}
// T-34 rescue: app links shared WITHOUT the /app prefix (a pre-fix share bug
// put such links in the wild — e.g. lock.show/passport/<id>?s=1). App-ONLY
// prefixes here; never site pages (/passport alone is the site's demo page,
// /production and /radar are site pages — excluded by requiring the deeper
// segment or being app-exclusive).
var APP_ONLY=/^\\/(passport\\/|confirm\\/|invite\\/|evidence\\/|artist\\/|agency(\\/|$)|org\\/|admin$|login$|signup$|select$|onboarding$|discover$|forgot-password$|reset-password$)/;
if(APP_ONLY.test(p)){
  location.replace('/app/?dl='+encodeURIComponent('/app'+p+location.search));
}})();`

export default function NotFound() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOUNCE }} />
      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.14em', opacity: 0.6 }}>404</p>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700 }}>This page moved on.</h1>
        <p style={{ maxWidth: 420, opacity: 0.75 }}>
          The address you opened doesn&apos;t exist here. The proof you&apos;re after is one click away.
        </p>
        <Link href="/" style={{ textDecoration: 'underline', fontWeight: 600 }}>
          Back to LOCK
        </Link>
      </main>
    </>
  )
}
