import { StubClaimProcessor } from './stub.js'
import { AnthropicClaimProcessor } from './anthropic.js'

// Returns StubClaimProcessor (no key) or AnthropicClaimProcessor (key set).
// Callers depend on the AiClaimProcessor interface — never on the concrete class.
export function createClaimProcessor(apiKey, model = 'claude-opus-4-8') {
  if (apiKey) return new AnthropicClaimProcessor(apiKey, model)
  return new StubClaimProcessor()
}
