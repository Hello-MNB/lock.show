# CODE-TASK-01 — Phase 0: Next.js Project Scaffold
*Assigned to: Claude Code | PM: Claude Chat | Status: READY TO EXECUTE*
*Minimum-token mode: read this file + WEBSITE-BUILD-CANON.md §1–2. No other files needed.*

---

## WHAT TO BUILD
Initialize a production-grade Next.js marketing website inside the existing GIGPROOF repo.

**Output directory:** `C:\Users\user\GIGPROOF\website-next\`
(Sibling to the existing `/website/` HTML folder — do NOT touch `/website/`)

---

## EXACT COMMANDS

```bash
cd C:\Users\user\GIGPROOF

npx create-next-app@latest website-next \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-turbopack
```

Then install Google Fonts dependency (already included via next/font — no install needed).

---

## CONFIGURATION CHANGES AFTER SCAFFOLD

### 1. `website-next/app/globals.css` — Replace generated content with:

```css
@import "tailwindcss";

/* ─── GIGPROOF Design Tokens ─── */
:root {
  --color-paper:  #EFEBDF;
  --color-ink:    #16150F;
  --color-stamp:  #5B3FD6;
  --color-night:  #0E0E13;
  --color-tally:  #7A766A;
  --color-void:   #B23B2E;
  --radius:       2px;
}

html {
  font-family: var(--font-heebo), system-ui, sans-serif;
  color: var(--color-ink);
  background-color: var(--color-paper);
}

* {
  border-radius: var(--radius);
  box-sizing: border-box;
}
```

### 2. `website-next/tailwind.config.ts` — Replace with:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper:  '#EFEBDF',
        ink:    '#16150F',
        stamp:  '#5B3FD6',
        night:  '#0E0E13',
        tally:  '#7A766A',
        void:   '#B23B2E',
      },
      fontFamily: {
        body:    ['var(--font-heebo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-space-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
        none: '0px',
        sm: '2px',
        md: '2px',
        lg: '4px',
      },
    },
  },
  plugins: [],
}
export default config
```

### 3. `website-next/app/layout.tsx` — Replace with:

```typescript
import type { Metadata } from 'next'
import { Heebo, Archivo_Black, Space_Mono } from 'next/font/google'
import './globals.css'

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  variable: '--font-heebo',
  display: 'swap',
})

const archivo = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://gigproof.co'), // placeholder — update when domain purchased (W3)
  title: {
    default: 'GIGPROOF — Booking Proof for Independent Artists',
    template: '%s | GIGPROOF',
  },
  description: 'Standardized, method-labeled proof of live performance for independent artists. Built for booking managers who need to verify before they risk their name.',
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${heebo.variable} ${archivo.variable} ${spaceMono.variable} font-body bg-paper text-ink antialiased`}>
        {/* NAV — placeholder until Phase 1 */}
        <header className="border-b border-ink/10 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="font-display text-lg tracking-tight">GIGPROOF</span>
            <nav aria-label="Main navigation">
              {/* Phase 1: NavBar component goes here */}
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* FOOTER — placeholder until Phase 1 */}
        <footer className="border-t border-ink/10 mt-24 px-6 py-12 text-tally text-sm">
          <div className="max-w-6xl mx-auto">
            <p>© {new Date().getFullYear()} GIGPROOF. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
```

### 4. `website-next/app/page.tsx` — Replace with:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GIGPROOF — Booking Proof for Independent Artists',
  description: 'Standardized, method-labeled proof of live performance. Built for booking managers who need to verify before they risk their name.',
}

export default function HomePage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 text-center">
      <p className="font-mono text-tally text-xs tracking-widest uppercase mb-6">
        GIGPROOF · PRIVATE BETA
      </p>
      <h1 className="font-display text-5xl md:text-7xl text-ink leading-none mb-8">
        Proof before the risk.
      </h1>
      <p className="text-xl text-tally max-w-xl mx-auto mb-12">
        Standardized, method-labeled performance evidence for independent artists.
        Built for booking managers who need to verify before they put their name behind a show.
      </p>
      <a
        href="/passport/demo"
        className="inline-block bg-stamp text-paper px-8 py-4 font-display text-sm tracking-wide hover:bg-ink transition-colors"
      >
        See a Sample Passport →
      </a>
    </section>
  )
}
```

### 5. `website-next/next.config.ts` — Verify or replace with:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export', // SSG for marketing pages
  trailingSlash: false,
  images: {
    unoptimized: true, // required for static export
  },
}

export default nextConfig
```

> **NOTE on `output: 'export'`:** This enables static export. Vercel handles this automatically. Do NOT add Netlify config. `netlify.toml` must NOT exist.

---

## FOLDER STRUCTURE TO CREATE (empty dirs + placeholder files)

```
website-next/
  app/
    layout.tsx          ← done above
    page.tsx            ← done above
    globals.css         ← done above
    passport/
      demo/
        page.tsx        ← create: export default function PassportDemo() { return <div>Passport Demo — Phase 2</div> }
    artists/
      page.tsx          ← create: export default function Artists() { return <div>Artists — Phase 4</div> }
    bookers/
      page.tsx          ← create: export default function Bookers() { return <div>Bookers — Phase 4</div> }
    producers/
      page.tsx          ← create: export default function Producers() { return <div>Producers — Phase 4</div> }
    how-it-works/
      page.tsx          ← create: export default function HowItWorks() { return <div>How It Works — Phase 5</div> }
    methodology/
      page.tsx          ← create: export default function Methodology() { return <div>Methodology — Phase 5</div> }
    faq/
      page.tsx          ← create: export default function FAQ() { return <div>FAQ — Phase 5</div> }
    contact/
      page.tsx          ← create: export default function Contact() { return <div>Contact — Phase 5</div> }
    pricing/
      page.tsx          ← create: export default function Pricing() { return <div>Pricing — Phase 6</div> }
    radar/
      page.tsx          ← create: export default function Radar() { return <div>Radar — Phase 6</div> }
  components/
    nav.tsx             ← placeholder: export function Nav() { return null }
    footer.tsx          ← placeholder: export function Footer() { return null }
    proof-unit.tsx      ← placeholder: export function ProofUnit() { return null }
    band-pill.tsx       ← placeholder: export function BandPill() { return null }
  public/
    assets/             ← empty dir (add .gitkeep)
    og/                 ← empty dir (add .gitkeep)
  i18n/
    en.json             ← create: { "_note": "EN strings — source of truth", "site.name": "GIGPROOF" }
    he.json             ← create: { "_note": "DRAFT — machine scaffold only, NOT for production without native HE editor review", "site.name": "GIGPROOF" }
```

---

## VERIFICATION (run before closing session)

```bash
cd C:\Users\user\GIGPROOF\website-next

# 1. Build succeeds with zero errors
npm run build

# 2. No netlify.toml exists
ls netlify.toml 2>&1 | grep "No such file" && echo "PASS: no netlify.toml" || echo "FAIL: netlify.toml found — delete it"

# 3. Firewall: no forbidden terms in Phase 0
grep -r "score\|rating\|percentile\|rank\|gauge\|fill_value\|bookability" --include="*.tsx" --include="*.ts" --include="*.css" . && echo "FAIL: firewall violation" || echo "PASS: no firewall violations"

# 4. lang="en" confirmed (NOT lang="he")
grep -r 'lang="he"' --include="*.tsx" . && echo "FAIL: lang=he found" || echo "PASS: lang=en"

# 5. Homepage renders
npm run dev &
sleep 5
curl -s http://localhost:3000 | grep "Proof before the risk" && echo "PASS: homepage renders" || echo "FAIL: homepage not rendering"
```

All 5 checks must pass. Report output to PM (Claude Chat) before marking Phase 0 complete.

---

## WHAT NOT TO DO
- ❌ Do NOT touch `/website/` HTML files — content reference only
- ❌ Do NOT create netlify.toml
- ❌ Do NOT add score/rating/gauge/fill to any component
- ❌ Do NOT build content in Phase 0 — placeholder divs only for pages other than homepage
- ❌ Do NOT use `output: 'standalone'` — must be `'export'` for SSG
- ❌ Do NOT import from Base44, Supabase, or app.gigproof.co — this is the marketing site only

---

## REFERENCES
- Full engineering spec: `docs/WEBSITE-BUILD-CANON.md`
- Page content + SEO specs: `docs/WEBSITE-ARCHITECTURE.md`
- Product firewall rules: `CLAUDE.md` (§ THE FIREWALL — ABSOLUTE)

*Phase 0 complete when: `npm run build` passes with zero errors, all 5 verification checks pass.*
*Next task: CODE-TASK-02.md (Phase 1 — Shared Components)*
