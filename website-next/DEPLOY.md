# LOCK Marketing Site — Deploy Guide

**Project:** `lock.show` — Next.js static export  
**Repo:** `C:\Users\user\LOCK` (GitHub)  
**Root directory for this Vercel project:** `website-next/`  
**NOT the existing Vercel project** — that is `app.lock.show` (Vite, repo root)

---

## Pre-deploy checklist (all verified ✓)

- [x] `next.config.ts` → `output: 'export'`, `trailingSlash: false`, `images.unoptimized: true`
- [x] `vercel.json` in `website-next/` — build command, output dir, headers, cleanUrls
- [x] TSC zero errors
- [x] No `netlify.toml` anywhere
- [x] No `console.log` in source
- [x] Firewall: zero violations
- [x] `public/og/og-default.png` — exists (1200×630)
- [x] `public/llms.txt` — exists
- [x] `app/robots.ts` + `app/sitemap.ts` — exist
- [x] `app/favicon.ico` — exists
- [x] Default Next.js boilerplate SVGs removed from `public/`
- [x] Stale `i18n/` directory removed (superseded by `messages/`)
- [x] `website-next/.gitignore` covers `.next/`, `out/`, `*.tsbuildinfo`, `.env*`
- [ ] OG image: `og-default.svg` must also be committed (source), `og-default.png` is the runtime asset

---

## Step 1: Push to GitHub

```bash
cd C:\Users\user\LOCK
git add website-next/
git status   # verify only website-next/ changes
git commit -m "feat: marketing site v1 — Next.js static export, phases 0-13"
git push origin main
```

**IMPORTANT:** Do NOT commit `.env.local`, `.next/`, `out/`, `node_modules/` — all covered by `.gitignore`.

---

## Step 2: Create new Vercel project for lock.show

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import from GitHub → select the LOCK repo
3. **Root Directory** → set to `website-next/` ← CRITICAL
4. Framework: Next.js (auto-detected)
5. Build Command: `npm run build` (default — do not override)
6. Output Directory: `out` (auto-detected from next.config.ts export)
7. Node.js version: 22.x — must match `package.json` `engines.node` (`22.x`) and
   `website-next/.nvmrc`. Authority: the Runtime ADR ruling recorded in
   B4-40.20 (BUILD-STATE, RELEASE & DECISION REGISTER) — 22.x is the
   lowest-drift target because it is the machine-enforced one. Verified by
   execution on Node 22: `npx next build` exits 0 and generates 20 static
   pages. This is a RUNTIME target, not a release claim.
8. Environment variables: **none needed** (marketing site has no Supabase/API keys)
9. Click Deploy

---

## Step 3: Add domain

After first deploy succeeds:
1. Project Settings → Domains
2. Add `lock.show` and `www.lock.show`
3. Set DNS at registrar:
   - `lock.show` → Vercel A record (or CNAME to `cname.vercel-dns.com`)
   - `www.lock.show` → CNAME to `cname.vercel-dns.com`
4. Set `www.lock.show` to redirect → `lock.show` (in Vercel domain settings)

---

## Step 4: Verify deploy

After deploy + DNS propagation:

```
https://lock.show/              → homepage
https://lock.show/passport/demo → FIRST CHECK — buyer-facing demo
https://lock.show/artists
https://lock.show/bookers
https://lock.show/producers
https://lock.show/how-it-works
https://lock.show/methodology
https://lock.show/pricing
https://lock.show/radar
https://lock.show/faq
https://lock.show/contact
https://lock.show/llms.txt     → plain text ✓
https://lock.show/sitemap.xml  → XML ✓
https://lock.show/robots.txt   → plain text ✓
https://lock.show/og/og-default.png → 1200×630 image ✓
```

WhatsApp test (390px): send `lock.show/passport/demo` link — verify OG card renders, page is readable on mobile.

---

## Existing Vercel project — DO NOT TOUCH

- Project: `app.lock.show`  
- Config: repo root `vercel.json` → `vite build` → `dist/`  
- This is the React+Vite app — separate deploy, separate project  

---

## Post-deploy (Phase 14)

- Submit `lock.show/sitemap.xml` to Google Search Console
- Verify JSON-LD renders in Rich Results Test
- Check Core Web Vitals in Vercel Analytics
- Verify HE locale toggle works client-side
