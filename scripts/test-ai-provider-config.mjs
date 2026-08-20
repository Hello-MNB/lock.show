import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { once } from 'node:events'

import { AnthropicClaimProcessor } from '../src/lib/ai/anthropic.js'
import { createClaimProcessorFromConfig, resolveAiProviderConfig } from '../src/lib/ai/index.js'

const direct = resolveAiProviderConfig({
  ANTHROPIC_API_KEY: 'sk-ant-api03-example',
  ANTHROPIC_MODEL: 'claude-direct-test',
})
assert.equal(direct.provider, 'anthropic')
assert.equal(direct.state, 'configured')
assert.equal(direct.model, 'claude-direct-test')
assert.equal(direct.baseURL, undefined)
assert.equal(direct.method, 'anthropic')

const gateway = resolveAiProviderConfig({
  AI_PROVIDER: 'vercel-gateway',
  VERCEL_OIDC_TOKEN: 'oidc-example',
  AI_GATEWAY_MODEL: 'anthropic/claude-sonnet-4.5',
  ANTHROPIC_API_KEY: 'not-an-anthropic-key',
})
assert.equal(gateway.provider, 'vercel-gateway')
assert.equal(gateway.state, 'configured')
assert.equal(gateway.model, 'anthropic/claude-sonnet-4.5')
assert.equal(gateway.baseURL, 'https://ai-gateway.vercel.sh')
assert.equal(gateway.method, 'vercel_gateway')

const gatewayApiKey = resolveAiProviderConfig({
  AI_PROVIDER: 'vercel-gateway',
  AI_GATEWAY_API_KEY: 'gateway-example',
  AI_GATEWAY_MODEL: 'anthropic/claude-sonnet-4.5',
})
assert.equal(gatewayApiKey.state, 'configured')

for (const env of [
  { AI_PROVIDER: 'vercel-gateway', AI_GATEWAY_MODEL: 'anthropic/claude-sonnet-4.5' },
  { AI_PROVIDER: 'vercel-gateway', VERCEL_OIDC_TOKEN: 'oidc-example' },
  { AI_PROVIDER: 'vercel-gateway', VERCEL_OIDC_TOKEN: 'oidc-example', AI_GATEWAY_MODEL: 'no-provider-prefix' },
  { AI_PROVIDER: 'unknown-provider', ANTHROPIC_API_KEY: 'sk-ant-api03-example' },
]) {
  const config = resolveAiProviderConfig(env)
  assert.equal(config.state, 'misconfigured')
}

const disabled = resolveAiProviderConfig({})
assert.equal(disabled.provider, 'stub')
assert.equal(disabled.state, 'missing')
assert.equal(disabled.model, 'deterministic-rules-v1')

const invalidDirect = resolveAiProviderConfig({ ANTHROPIC_API_KEY: 'foreign-provider-key' })
assert.equal(invalidDirect.provider, 'anthropic')
assert.equal(invalidDirect.state, 'misconfigured')

let gatewayRequest
let gatewayRequestCount = 0
const fakeGateway = createServer((req, res) => {
  let body = ''
  req.setEncoding('utf8')
  req.on('data', (chunk) => { body += chunk })
  req.on('end', () => {
    gatewayRequestCount += 1
    gatewayRequest = { path: req.url, headers: req.headers, body: JSON.parse(body) }
    const payload = Buffer.from(JSON.stringify({
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      model: 'anthropic/claude-sonnet-4.5',
      content: [{ type: 'text', text: '{"status":"supporting","claim_type":"profile","value":"Artist page","reason":"Public source"}' }],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 10, output_tokens: 10 },
    }))
    res.writeHead(200, {
      'content-type': 'application/json',
      'content-length': String(payload.length),
      connection: 'close',
    })
    res.end(payload)
  })
})
fakeGateway.listen(0, '127.0.0.1')
await once(fakeGateway, 'listening')
const gatewayPort = fakeGateway.address().port

for (const env of [
  { AI_PROVIDER: 'vercel-gateway', AI_GATEWAY_API_KEY: 'gateway-example' },
  { AI_PROVIDER: 'vercel-gateway', VERCEL_OIDC_TOKEN: 'oidc-example', AI_GATEWAY_MODEL: 'no-provider-prefix' },
]) {
  const config = resolveAiProviderConfig(env)
  config.baseURL = `http://127.0.0.1:${gatewayPort}`
  const blocked = await createClaimProcessorFromConfig(config).labelWithMethod({
    evidence_type: 'profile',
    source_type: 'public_url',
    value: 'Artist page',
    public_url: 'https://example.test/artist',
  })
  assert.equal(config.state, 'misconfigured')
  assert.equal(blocked.method, 'deterministic_fallback')
  assert.equal(blocked.aiFailed, true)
}
assert.equal(gatewayRequestCount, 0)

const processor = new AnthropicClaimProcessor('oidc-example', 'anthropic/claude-sonnet-4.5', {
  baseURL: `http://127.0.0.1:${gatewayPort}`,
  credentialKind: 'nonempty',
  method: 'vercel_gateway',
  maxRetries: 0,
})

let labelled
try {
  labelled = await processor.labelWithMethod({
    evidence_type: 'profile',
    source_type: 'public_url',
    value: 'Artist page',
    public_url: 'https://example.test/artist',
  })
} finally {
  fakeGateway.close()
  await once(fakeGateway, 'close')
}
assert.equal(gatewayRequest.path, '/v1/messages')
assert.equal(gatewayRequestCount, 1)
assert.equal(gatewayRequest.headers['x-api-key'], 'oidc-example')
assert.equal(gatewayRequest.body.model, 'anthropic/claude-sonnet-4.5')
assert.equal(labelled.method, 'vercel_gateway')
assert.equal(labelled.aiFailed, false)
assert.equal(labelled.label.status, 'supporting')

const port = 19_000 + (process.pid % 1_000)
const child = spawn(process.execPath, ['server/index.js'], {
  cwd: new URL('..', import.meta.url),
  env: {
    ...process.env,
    API_PORT: String(port),
    AI_PROVIDER: 'vercel-gateway',
    VERCEL_OIDC_TOKEN: '',
    AI_GATEWAY_MODEL: 'anthropic/claude-sonnet-4.5',
    ANTHROPIC_API_KEY: '',
    VITE_SUPABASE_URL: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})

let output = ''
child.stdout.on('data', (chunk) => { output += chunk })
child.stderr.on('data', (chunk) => { output += chunk })

try {
  let health
  for (let attempt = 0; attempt < 200; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
        headers: { 'x-vercel-oidc-token': 'oidc-runtime-example' },
      })
      if (response.ok) {
        health = await response.json()
        break
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
  assert.ok(health, `server did not become healthy: ${output}`)
  assert.equal(health.ai, 'configured')
  assert.equal(health.provider, 'vercel-gateway')
  assert.equal(health.model, 'anthropic/claude-sonnet-4.5')
} finally {
  child.kill('SIGTERM')
}

console.log('AI provider configuration: 15/15 passed')
