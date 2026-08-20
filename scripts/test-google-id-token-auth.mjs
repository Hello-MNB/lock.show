import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

const [provider, ui, login, signup, constants, vercel] = await Promise.all([
  read('src/features/auth/AuthProvider.jsx'),
  read('src/components/ui.jsx'),
  read('src/features/auth/Login.jsx'),
  read('src/features/auth/Signup.jsx'),
  read('src/lib/constants.js'),
  read('vercel.json'),
])

assert.match(provider, /signInWithIdToken\s*\(\s*\{\s*provider:\s*['"]google['"]\s*,\s*token\s*,?\s*\}\s*\)/,
  'Google must exchange a signed ID token directly with Supabase')
assert.match(provider, /signInWithGoogleIdToken/,
  'AuthProvider must expose the direct Google ID-token action')

for (const [name, source] of [['Login', login], ['Signup', signup]]) {
  assert.match(source, /signInWithGoogleIdToken/, `${name} must consume direct Google ID-token auth`)
  assert.match(source, /onGoogleCredential=\{onGoogleCredential\}/,
    `${name} must pass its post-exchange navigation handler to the social-auth surface`)
}

assert.match(login, /await signInWithGoogleIdToken\(credential\)[\s\S]{0,300}readPendingReturn\(\{ consume: true \}\)[\s\S]{0,100}nav\(loc\.state\?\.from \|\| pendingReturn \|\| ['"]\/['"]\)/,
  'Google login must honor the preserved return route after exchange')
assert.match(signup, /await signInWithGoogleIdToken\(credential\)[\s\S]{0,400}nav\(pendingReturn \|\| ['"]\/select['"]\)/,
  'Google signup must honor a preserved deep-link return, then otherwise continue to role selection')

assert.match(constants, /GOOGLE_WEB_CLIENT_ID/,
  'The public Google web client ID must have one named source')
assert.match(ui, /https:\/\/accounts\.google\.com\/gsi\/client/,
  'The official Google Identity Services client must be loaded')
assert.match(ui, /google\.accounts\.id\.initialize/,
  'Google Identity Services must be initialized')
assert.match(ui, /google\.accounts\.id\.renderButton/,
  'The official Google sign-in button must be rendered')
assert.match(ui, /waitForGoogleIdentity/,
  'Google Identity Services loading must tolerate delayed initialization')
assert.match(ui, /setLoadFailed\(true\)/,
  'A blocked initial Google script load must preserve a retryable sign-in control')
assert.doesNotMatch(ui, /loadGoogleIdentity\(\)[\s\S]{0,500}\.catch\(onError\)/,
  'An initial third-party script failure must not show an auth error before user action')
assert.match(ui, /onClick=\{\(\) => demo && handle\(['"]google['"]\)\}/,
  'Only the fixture-only demo build may use the legacy Google button handler')
for (const directive of ['script-src', 'style-src', 'connect-src', 'frame-src']) {
  assert.match(vercel, new RegExp(`${directive}[^;]*https:\\/\\/accounts\\.google\\.com`),
    `${directive} must permit the official Google Identity Services origin`)
}

console.log('Google ID-token auth contract PASS')
