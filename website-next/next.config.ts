import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  trailingSlash: false,
  // the /app/[[...slug]] route handler reads the SPA shell from public/ at
  // runtime — make sure the file ships inside the serverless bundle
  outputFileTracingIncludes: {
    '/app/[[...slug]]': ['./public/app/index.html'],
  },
  // The real app (Vite SPA) ships pre-built in public/app. afterFiles rewrites
  // run AFTER the filesystem, so real files (assets, icons) are served first
  // and every other /app route falls back to the SPA shell. NOTE: keep the
  // catch-all plain — Vercel's production router rejected a lookahead regex
  // here (deep links 404'd) while dev accepted it.
  async rewrites() {
    return [
      { source: '/app', destination: '/app/index.html' },
      { source: '/app/:path*', destination: '/app/index.html' },
    ]
  },
}

export default nextConfig
