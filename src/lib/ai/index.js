import { StubClaimProcessor } from './stub.js'
import { AnthropicClaimProcessor } from './anthropic.js'

export function anthropicKeyState(apiKey) {
  const value = typeof apiKey === 'string' ? apiKey.trim() : ''
  if (!value) return 'missing'
  return value.startsWith('sk-ant-') ? 'configured' : 'misconfigured'
}

const GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh'
const GATEWAY_MODEL = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i

export function resolveAiProviderConfig(env = {}) {
  const requested = typeof env.AI_PROVIDER === 'string' ? env.AI_PROVIDER.trim().toLowerCase() : ''
  const anthropicKey = typeof env.ANTHROPIC_API_KEY === 'string' ? env.ANTHROPIC_API_KEY.trim() : ''

  if (requested === 'vercel-gateway') {
    const apiKey = [env.AI_GATEWAY_API_KEY, env.VERCEL_OIDC_TOKEN]
      .find((value) => typeof value === 'string' && value.trim())?.trim() || ''
    const model = typeof env.AI_GATEWAY_MODEL === 'string' ? env.AI_GATEWAY_MODEL.trim() : ''
    const configured = Boolean(apiKey && GATEWAY_MODEL.test(model))
    return {
      provider: 'vercel-gateway',
      state: configured ? 'configured' : 'misconfigured',
      apiKey: configured ? apiKey : '',
      model,
      baseURL: GATEWAY_BASE_URL,
      credentialKind: 'nonempty',
      method: 'vercel_gateway',
    }
  }

  if (requested && requested !== 'anthropic') {
    return {
      provider: requested,
      state: 'misconfigured',
      apiKey: '',
      model: '',
      credentialKind: 'anthropic',
      method: 'anthropic',
    }
  }

  if (!requested && !anthropicKey) {
    return {
      provider: 'stub',
      state: 'missing',
      apiKey: '',
      model: 'deterministic-rules-v1',
      credentialKind: 'anthropic',
      method: 'mock',
    }
  }

  return {
    provider: 'anthropic',
    state: anthropicKeyState(anthropicKey) === 'configured' ? 'configured' : 'misconfigured',
    apiKey: anthropicKey,
    model: env.ANTHROPIC_MODEL || 'claude-opus-4-8',
    credentialKind: 'anthropic',
    method: 'anthropic',
  }
}

export function createClaimProcessorFromConfig(config) {
  if (config.state === 'missing') return new StubClaimProcessor()
  const apiKey = config.state === 'configured' ? config.apiKey : ''
  return new AnthropicClaimProcessor(apiKey, config.model, {
    baseURL: config.baseURL,
    credentialKind: config.credentialKind,
    method: config.method,
  })
}

// Returns StubClaimProcessor (no key) or AnthropicClaimProcessor (key set).
// Callers depend on the AiClaimProcessor interface — never on the concrete class.
export function createClaimProcessor(apiKey, model = 'claude-opus-4-8') {
  if (anthropicKeyState(apiKey) !== 'missing') return new AnthropicClaimProcessor(apiKey, model)
  return new StubClaimProcessor()
}
