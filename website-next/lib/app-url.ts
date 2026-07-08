// Single source for the app's address (LOGIN / GET STARTED targets).
// - Local dev: NEXT_PUBLIC_APP_URL=http://localhost:5173 (website-next/.env.local).
// - Production default '/app': the app is EMBEDDED in this website project —
//   the website build compiles the SPA into public/app (founder decision,
//   8 Jul 2026: public signup open). Same-origin, so a relative URL is right.
// - app.lock.show day (dedicated project): set NEXT_PUBLIC_APP_URL in the
//   Vercel website env — no code change needed.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '/app'
