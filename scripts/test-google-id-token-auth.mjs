import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

const [provider, ui, login, signup, constants] = await Promise.all([
  read('src/features/auth/AuthProvider.jsx'),
  read('src/components/ui.jsx'),
  read('src/features/auth/Login.jsx'),
  read('src/features/auth/Signup.jsx'),
  read('src/lib/constants.js'),
])

assert.match(provider, /signInWithIdToken\s*\(\s*\{\s*provider:\s*['"]google['"]\s*,\s*token\s*,?\s*\}\s*\)/,
  'Google must exchange a signed ID token directly with Supabase')
assert.match(provider, /signInWithGoogleIdToken/,
  'AuthProvider must expose the direct Google ID-token action')

for (const [name, source] of [['Login', login], ['Signup', signup]]) {
  assert.match(source, /signInWithGoogleIdToken/, `${name} must consume direct Google ID-token auth`)
  assert.match(source, /onGoogleCredential=\{signInWithGoogleIdToken\}/,
    `${name} must pass the direct credential handler to the social-auth surface`)
}

assert.match(constants, /GOOGLE_WEB_CLIENT_ID/,
  'The public Google web client ID must have one named source')
assert.match(ui, /https:\/\/accounts\.google\.com\/gsi\/client/,
  'The official Google Identity Services client must be loaded')
assert.match(ui, /google\.accounts\.id\.initialize/,
  'Google Identity Services must be initialized')
assert.match(ui, /google\.accounts\.id\.renderButton/,
  'The official Google sign-in button must be rendered')
assert.match(ui, /onClick=\{\(\) => demo && handle\(['"]google['"]\)\}/,
  'Only the fixture-only demo build may use the legacy Google button handler')

console.log('Google ID-token auth contract PASS')
