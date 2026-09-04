import crypto from 'crypto'

export function verifyNylasSignature(rawBody: Buffer, signature: string, secret: string): void {
  if (!signature || !secret) throw new Error('Nylas webhook signature is missing')

  // Nylas signs the raw request body with HMAC-SHA256 using the webhook secret.
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (signature !== expected) throw new Error('Invalid Nylas webhook signature')
}
