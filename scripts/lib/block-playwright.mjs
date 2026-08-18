// ESM resolve hook: make `playwright` unresolvable in the child process.
// Used ONLY by test-chain-closed.mjs, to execute the real
// "renderer unavailable" path of each rendered gate instead of asserting
// something about its source text. Nothing in the repo is modified.
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'playwright' || specifier.startsWith('playwright/')) {
    throw Object.assign(new Error(`Cannot find package 'playwright' (blocked by test-chain-closed)`), { code: 'ERR_MODULE_NOT_FOUND' })
  }
  return nextResolve(specifier, context)
}
