import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyNylasSignature(rawBody: Buffer, signature: string, secret: string): void {
  if (!signature || !secret) throw new Error('Nylas webhook signature is missing')

  const expected = createHmac('sha256', secret).update(rawBody).digest()
  const received = Buffer.from(signature, 'hex')
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) {
    throw new Error('Invalid Nylas webhook signature')
  }
}