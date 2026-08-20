// App-only links from the retired same-origin embed are handed to the one
// canonical application origin. Site routes keep the normal warm 404.
import Link from 'next/link'

const BOUNCE = `(function(){var p=location.pathname;
// T-34 rescue: app links shared WITHOUT the /app prefix (a pre-fix share bug
// put such links in the wild — e.g. lock.show/passport/<id>?s=1). App-ONLY
// prefixes here; never site pages (/passport alone is the site's demo page,
// /production and /radar are site pages — excluded by requiring the deeper
// segment or being app-exclusive).
var APP_ONLY=/^\\/(passport\\/|confirm\\/|invite\\/|evidence\\/|artist\\/|agency(\\/|$)|org\\/|admin$|login$|signup$|select$|onboarding$|discover$|forgot-password$|reset-password$)/;
if(APP_ONLY.test(p)){
  location.replace('https://app.lock.show'+p+location.search+location.hash);
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
          Back to LOCK SHOW
        </Link>
      </main>
    </>
  )
}
