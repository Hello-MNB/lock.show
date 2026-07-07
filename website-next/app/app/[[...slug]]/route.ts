import { readFile } from 'node:fs/promises'
import path from 'node:path'

// SPA fallback for the embedded app as a FIRST-CLASS route — the only
// mechanism this Vercel project honors end-to-end (verified live 8 Jul 2026:
// vercel.json rewrites are ignored on Next projects; dynamic next.config
// rewrites to public files are dropped by the platform router; Next 16
// proxy.ts is not yet wired by the build infra). Real files in public/app/*
// (assets, icons) are served by the filesystem BEFORE this route fires.
export const dynamic = 'force-dynamic'

export async function GET() {
  const html = await readFile(
    path.join(process.cwd(), 'public', 'app', 'index.html'),
    'utf8',
  )
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
