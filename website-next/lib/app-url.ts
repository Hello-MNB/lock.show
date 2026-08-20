// Single source for the app's address (LOGIN / GET STARTED targets).
// - Local dev: NEXT_PUBLIC_APP_URL=http://localhost:5173 (website-next/.env.local).
// - Production default: the canonical app is the separate app.lock.show
//   deployment property. The historical public/app bundle is not authority.
// - Local development may override this with NEXT_PUBLIC_APP_URL.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.lock.show'
