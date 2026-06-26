/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // GIGPROOF: dark, premium, one restrained accent for verified cues + CTA
        ink: '#0E0F13',
        surface: '#16181F',
        card: '#1C1F28',
        line: '#2A2E3A',
        muted: '#8A90A0',
        soft: '#C4C9D6',
        accent: '#F0C24B', // warm gold — verified cue + primary CTA
        'accent-700': '#C99A2E',
        ok: '#5BD6A0', // חזק
        warn: '#E9A23B', // מתפתח
        gap: '#6B7280', // חסר-הוכחה / לא ניתן להעריך
      },
      fontFamily: {
        sans: ['"Heebo"', '"Assistant"', 'system-ui', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out both',
      },
    },
  },
  plugins: [],
}
