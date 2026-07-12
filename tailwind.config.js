/** @type {import('tailwindcss').Config} */

// ── GIGPROOF "Live Intelligence" Design System — warm cinematic night ────────
// SSOT for the palette (mirrored in src/tokens.ts — keep both in sync).
// Backstage/show-business intimacy: dark canvas, one warm light, lime accent.
// Firewall reminder: bands + binaries + method labels ONLY — never gauges.
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Canvas & surfaces ──
        bg: '#0B0C0B',        // page canvas (dark)
        bg2: '#0E100F',       // sidebar / nav bg
        surface: '#14181A',   // cards
        surface2: '#1B2022',  // inputs, nested surfaces
        raise: '#232A2B',     // hover elevation

        // ── Text ──
        ink: '#F3F0E8',       // primary text
        muted: '#98A19A',     // secondary text
        faint: '#69716B',     // tertiary / placeholders

        // ── Accent & atmosphere ──
        // Lime aligned to Design System v1.2.0 (docs/design-system): #c8f04d is
        // THE single dominant action. ALWAYS dark text (--ink #0a0d0b) on lime.
        accent: '#C8F04D',        // lime — CTAs, verified cues (DS v1.2.0 exact)
        'accent-deep': '#AEDA36', // pressed / gradient bottom
        gold: '#F2C063',          // warm atmosphere, method labels, artist aura
        teal: '#46DCC2',          // developing state
        amber: '#E39A4B',         // needs-you state

        // ── Hairlines ──
        line: 'rgba(255,255,255,.08)',
        line2: 'rgba(255,255,255,.15)',

        // ── Bounded-status pairs (fg + bg) — categorical, never a gauge ──
        // The 5-state data-collection vocabulary (MASTER-CLASS MANDATE §1):
        // ✦ found · ✓ confirmed (good) · ◌ developing (dev) · + needs-you (need) · ○ not-assessable (na)
        // RESTRAINT (owner round 2): tints ≤10% alpha, small elements only —
        // dots, chips, thin rings, text accents. NEVER large fills or tinted cards.
        found: '#F2C063',
        'found-bg': 'rgba(242,192,99,.08)',
        good: '#CBEE72',
        'good-bg': 'rgba(190,226,78,.08)',
        dev: '#82E8D6',
        'dev-bg': 'rgba(70,220,194,.08)',
        need: '#F0B478',
        'need-bg': 'rgba(227,154,75,.09)',
        na: '#9AA29B',
        'na-bg': 'rgba(255,255,255,.05)',

        // ── DS MAPPING LAYER (A9, rel-07.13) — audit-verified v1.6.5 values ──
        // The PAPER task-surface family for the batch-by-batch migration
        // (Surface Language Contract: paper for task surfaces, dark for
        // media/proof moments). ADDITIVE ONLY: the legacy `paper/forest/card`
        // aliases below stay dark until each screen batch migrates to ds-*.
        // AA proof (DS v1.6.5): ds-paper/ds-forest = 14.91 · app bg/ink = 17.21.
        'ds-paper': '#F3F5EF',   // DS color.paper — page canvas (task surfaces)
        'ds-card': '#FFFFFF',    // DS white card
        'ds-forest': '#18221A',  // DS color.forest — panels + display text on paper
        'ds-ink': '#0A0D0B',     // DS ink on paper
        'ds-mist': '#DDE3D9',    // DS hairlines on paper
        'ds-slate': '#687269',   // DS secondary text on paper

        // ── LEGACY ALIASES (CODEX v1.2.0 light-theme names) ─────────────────
        // Remapped onto the dark palette so unrefactored screens still render
        // coherently dark. New/refactored code must use the tokens above.
        paper: '#0B0C0B',                // was page paper → dark canvas (= bg)
        night: '#14181A',                // dark sections → surface
        forest: '#14181A',               // deep green panels → surface
        card: '#14181A',                 // white cards → surface
        lime: '#C8F04D',                 // = accent (DS v1.2.0)
        'accent-700': '#9FD531',         // lime hover → accent-deep
        soft: '#F3F0E8',                 // was body text → ink
        mist: 'rgba(255,255,255,.08)',   // hairlines → line
        tally: '#98A19A',                // secondary text → muted
        ok: '#CBEE72',                   // strong/success fg → good pair fg
        'ok-bg': 'rgba(190,226,78,.08)',
        warn: '#F0B478',                 // caution fg → need pair fg
        'warn-bg': 'rgba(227,154,75,.09)',
        gap: '#9AA29B',                  // neutral/not-assessable fg → na pair fg
        'gap-bg': 'rgba(255,255,255,.05)',
        void: '#F0B478',                 // danger fg → warm amber (never harsh red on the dark stage)
        'void-bg': 'rgba(227,154,75,.09)',
      },
      fontFamily: {
        display: ['"Frank Ruhl Libre"', 'Georgia', 'serif'],  // headings — editorial serif voice
        sans: ['"Heebo"', 'system-ui', 'sans-serif'],         // body/UI (Heebo covers Hebrew)
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'], // method labels · bands · dates
      },
      borderRadius: {
        // buttons 12px · rows 14px · cards 18–24px · chips 999px
        DEFAULT: '14px',
        sm: '12px',
        md: '14px',
        lg: '16px',
        xl: '20px',
        '2xl': '22px',
        '3xl': '24px',
        xl2: '20px', // legacy alias used by .card
      },
      boxShadow: {
        card: '0 24px 60px -24px rgba(0,0,0,.75)',
        glow: '0 10px 26px -10px rgba(200,240,77,.5)',    // lime glow (DS v1.2.0) — THE one primary CTA per view
        'glow-gold': '0 0 12px 0 rgba(242,192,99,.22)',   // found-state edge — subtle, never loud
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        // state-motion keyframes (found-glow, bloom) live in src/index.css as
        // adoptable utility classes: .glow-found · .bloom-confirm · .aura-gold
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
