// Registers the resolve hook above for the whole child process.
// Run as: node --import ./scripts/lib/block-playwright-register.mjs <gate>
import { register } from 'node:module'
register('./block-playwright.mjs', import.meta.url)
