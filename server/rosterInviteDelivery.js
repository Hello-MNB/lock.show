export async function deliverRosterInvitation(input = {}, options = {}) {
  const fetchImpl = options.fetchImpl || fetch
  const logger = options.logger || console
  if (!input.enabled || !input.apiKey || !input.to || !input.inviteUrl) {
    return { sent: false, reason: 'disabled' }
  }

  const payload = {
    from: input.from || 'LOCK SHOW <hello@lock.show>',
    to: [input.to],
    subject: `${input.organizationName || 'A representation team'} invited you to LOCK SHOW`,
    text:
      `Hi ${input.artistName || 'there'},\n\n` +
      `${input.organizationName || 'A representation team'} invited you to connect your Artist workspace to their roster. ` +
      `Nothing is shared until you sign in and approve the requested access.\n\n` +
      `Review invitation: ${input.inviteUrl}\n\n` +
      `You can accept or leave without sharing data. This is not a booking or a commitment.`,
  }

  try {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      logger.warn('[email] roster invite rejected:', response.status)
      return { sent: false, reason: 'rejected', status: response.status }
    }
    return { sent: true }
  } catch {
    logger.warn('[email] roster invite delivery failed')
    return { sent: false, reason: 'network_error' }
  }
}
