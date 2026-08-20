import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function runScript(relativePath, args = []) {
  return spawnSync(process.execPath, [path.join(repoRoot, relativePath), ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 120_000,
  })
}

for (const [label, script, args] of [
  ['component-style drift check', 'scripts/generate-component-styles.mjs', ['--check']],
  ['event-registry drift check', 'scripts/generate-event-registry.mjs', ['--check']],
  ['built-app fit check', 'scripts/test-fit.mjs', []],
]) {
  test(`${label} resolves repository files on the current operating system`, () => {
    const result = runScript(script, args)
    assert.equal(
      result.status,
      0,
      `${label} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    )
  })
}
