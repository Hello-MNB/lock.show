import { StubClaimProcessor } from './stub.js'
import { AnthropicClaimProcessor } from './anthropic.js'

export function anthropicKeyState(apiKey) {
  const value = typeof apiKey === 'string' ? apiKey.trim() : ''
  if (!value) return 'missing'
  return value.startsWith('sk-ant-') ? 'configured' : 'misconfigured'
}

// Returns StubClaimProcessor (no key) or AnthropicClaimProcessor (key set).
// Callers depend on the AiClaimProcessor interface — never on the concrete class.
export function createClaimProcessor(apiKey, model = 'claude-opus-4-8') {
  if (anthropicKeyState(apiKey) !== 'missing') return new AnthropicClaimProcessor(apiKey, model)
  return new StubClaimProcessor()
}
