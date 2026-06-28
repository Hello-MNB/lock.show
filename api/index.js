// Vercel serverless entry — reuses the SAME Express app as local dev.
// On Vercel, VERCEL=1 is set automatically, so server/index.js skips
// app.listen() and we export the app here as the request handler.
// Local dev keeps using `node server/index.js` (npm run dev) unchanged.
import app from '../server/index.js'

export default app
