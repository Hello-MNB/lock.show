// AnthropicClaimProcessor — real API implementation.
// Only instantiated when ANTHROPIC_API_KEY is set. Never import in browser code.
// FIREWALL in prompt: explicitly prohibits score/percentile/exact-count output.
export class AnthropicClaimProcessor {
  #apiKey
  #model

  constructor(apiKey, model) {
    this.#apiKey = apiKey
    this.#model = model
  }

  async label(ev) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: this.#apiKey })

    const system = `You label music-booking evidence for GIGPROOF. Return ONLY JSON:
{"status": one of ["verified","supporting","self-reported","not-assessable"],
 "claim_type": short slug, "value": short human string or null, "reason": short string}.
FIREWALL: never output a score, percentile, prediction, rank, or an exact head-count.
Rules:
- ticket-export or settlement with real figures → "verified"
- public profile or producer reference → "supporting"
- screenshot or bare artist statement → "self-reported"
- proves nothing checkable → "not-assessable"`

    const user = `Evidence: type=${ev.evidence_type}, source_type=${ev.source_type}, value=${ev.value ?? ''}, public_url=${ev.public_url ?? ''}`

    const msg = await client.messages.create({
      model: this.#model,
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: user }],
    })

    const text = msg.content.map((c) => c.text || '').join('')
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
    return {
      status: json.status ?? 'not-assessable',
      claim_type: json.claim_type ?? 'claim',
      value: json.value ?? null,
      reason: json.reason ?? null,
    }
  }
}
