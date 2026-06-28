// AnthropicClaimProcessor — real API implementation (implements AiClaimProcessor).
// Only instantiated when ANTHROPIC_API_KEY is set. Never import in browser code.
//
// Hardened for production: own retry loop with backoff on transient errors,
// crash-proof JSON parsing, firewall validation of the returned status, and a
// deterministic StubClaimProcessor fallback so one failed call never breaks the
// whole process-evidence batch.
//
// FIREWALL: the prompt prohibits score/percentile/rank/exact-count, and
// #sanitize() additionally forces status into the four bounded values.
import { StubClaimProcessor } from './stub.js'

const BOUNDED = new Set(['verified', 'supporting', 'self-reported', 'not-assessable'])
// Transient HTTP statuses worth retrying (rate-limit, overloaded, gateway).
const RETRYABLE = new Set([408, 409, 429, 500, 502, 503, 529])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const SYSTEM = `You label music-booking evidence for GIGPROOF. Return ONLY JSON:
{"status": one of ["verified","supporting","self-reported","not-assessable"],
 "claim_type": short slug, "value": short human string or null, "reason": short string}.
FIREWALL: never output a score, percentile, prediction, rank, or an exact head-count.
Rules:
- ticket-export or settlement with real figures → "verified"
- public profile or producer reference → "supporting"
- screenshot or bare artist statement → "self-reported"
- proves nothing checkable → "not-assessable"`

const userPrompt = (ev) =>
  `Evidence: type=${ev.evidence_type}, source_type=${ev.source_type}, value=${ev.value ?? ''}, public_url=${ev.public_url ?? ''}`

function safeParse(text) {
  try {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

export class AnthropicClaimProcessor {
  #apiKey
  #model
  #fallback
  #maxRetries

  constructor(apiKey, model, { maxRetries = 3 } = {}) {
    this.#apiKey = apiKey
    this.#model = model
    this.#fallback = new StubClaimProcessor() // deterministic safety net
    this.#maxRetries = maxRetries
  }

  async label(ev) {
    try {
      const json = await this.#callWithRetry(ev)
      return this.#sanitize(json, ev)
    } catch (err) {
      // Terminal failure after retries → degrade to the deterministic stub so
      // the evidence still receives a bounded label and the batch continues.
      console.error('[anthropic] label failed, using stub fallback:', err?.message || err)
      return this.#fallback.label(ev)
    }
  }

  async #callWithRetry(ev) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: this.#apiKey, maxRetries: 0 }) // we own the retry loop
    let lastErr
    for (let attempt = 0; attempt <= this.#maxRetries; attempt++) {
      try {
        const msg = await client.messages.create({
          model: this.#model,
          max_tokens: 300,
          system: SYSTEM,
          messages: [{ role: 'user', content: userPrompt(ev) }],
        })
        const text = msg.content.map((c) => c.text || '').join('')
        return safeParse(text)
      } catch (err) {
        lastErr = err
        const status = err?.status
        const retryable = status == null || RETRYABLE.has(status)
        if (attempt === this.#maxRetries || !retryable) throw err
        await sleep(400 * 2 ** attempt) // 400ms → 800ms → 1600ms
      }
    }
    throw lastErr
  }

  // Firewall + shape guard: force a bounded status, clamp string lengths, and
  // fall back to the evidence's own value if the model returned nothing usable.
  #sanitize(json, ev) {
    const status = BOUNDED.has(json?.status) ? json.status : 'not-assessable'
    const claim_type = typeof json?.claim_type === 'string' && json.claim_type ? json.claim_type.slice(0, 60) : 'claim'
    const value = typeof json?.value === 'string' ? json.value.slice(0, 140) : (ev.value ?? null)
    const reason = typeof json?.reason === 'string' ? json.reason.slice(0, 200) : null
    return { status, claim_type, value, reason }
  }
}
