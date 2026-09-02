import type { Config } from "tailwindcss";

// MNB Brand System — dark-premium: deep base, gold accent,
// slate-blue Provider / warm-rose Growth. Locked tokens; do not invent new ones.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#0C0F16",
          surface: "#131826",
          raised: "#1B2233",
          line: "#252E44",
        },
        gold: {
          DEFAULT: "#C9A75B",
          soft: "#E4CE96",
          deep: "#9A7B35",
        },
        provider: "#6B8CAE",
        growth: "#D98A9E",
        ink: {
          DEFAULT: "#F2EFE8",
          muted: "#9AA3B5",
          faint: "#5F6880",
        },
        ok: "#5FBF8F",
        warn: "#E0B252",
        danger: "#E06565",
      },
      fontFamily: {
        display: ["Playfair Display", "Cormorant Garamond", "Georgia", "David Libre", "serif"],
        body: ["Inter", "Segoe UI", "Heebo", "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 24px rgba(201, 167, 91, 0.18)",
        card: "0 8px 24px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
