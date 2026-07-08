import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ESM-safe __dirname — `__dirname` itself is undefined when the config is
// evaluated as ESM (Vercel), while local tooling may evaluate it as CJS.
// Using it directly made every Vercel build fail SILENTLY after commit
// c0d2575 — production stayed pinned to the last green build (pre-rebrand)
// while local builds kept passing. Never use bare __dirname in this file.
const CONFIG_DIR = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  trailingSlash: false,
  // Two lockfiles exist (repo root + this dir) — without an explicit root,
  // Turbopack INFERS the workspace root, and the inference can differ between
  // machines (local vs Vercel CI). A wrong root yields page HTML referencing
  // chunk filenames that were never emitted → every page 500s on a script and
  // hydration dies site-wide (dead locale toggle, dead mobile menu, flaky
  // consent banner). Pinning the root makes chunk naming deterministic.
  turbopack: { root: CONFIG_DIR },
  outputFileTracingRoot: CONFIG_DIR,
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
