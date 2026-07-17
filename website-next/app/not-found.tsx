// Site 404 with the /app deep-link bootstrap (owner audit 17 Jul).
// The static export cannot serve dynamic app routes (/app/passport/:id,
// /app/confirm/:token …) — no physical file exists, so they land here.
// The inline script runs before paint: any /app/* path bounces into the app
// shell as /app/?dl=<original>, and the app restores the address before its
// router mounts (src/main.jsx). Same-origin only — the script never uses a
// caller-controlled host, only location.pathname/search of THIS origin.
// Every other path gets a warm site 404 instead of Next's bare default.
import Link from 'next/link'

const BOUNCE = `(function(){var p=location.pathname;
if(p.indexOf('/app/')===0||p==='/app'){
  location.replace('/app/?dl='+encodeURIComponent(p+location.search));
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
