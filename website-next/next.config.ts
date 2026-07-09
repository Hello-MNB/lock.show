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
  // STATIC EXPORT (the architecture this site was designed for — DEPLOY.md).
  // Plain files in out/: no server, no output collector, no framework-preset
  // dependence — the entire class of path0/.next/BOA failures cannot occur.
  output: 'export',
  images: { unoptimized: true },
  turbopack: { root: CONFIG_DIR },
  outputFileTracingRoot: CONFIG_DIR,
}

export default nextConfig
