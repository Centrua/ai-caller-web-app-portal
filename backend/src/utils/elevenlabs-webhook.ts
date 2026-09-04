import { createHmac, timingSafeEqual } from 'node:crypto'

const MAX_SIGNATURE_AGE_SECONDS = 30 * 60

export function verifyElevenLabsSignature(rawBody: Buffer, header: string, secret: string): void {
  if (!header || !secret) throw new Error('ElevenLabs webhook signature is missing')

  const values = Object.fromEntries(
    header.split(',').map((part) => {
      const separator = part.indexOf('=')
      return separator === -1
        ? [part.trim(), '']
        : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()]
    })
  )
  const timestamp = values.t
  const received = Buffer.from(values.v0 || '', 'hex')

  if (!timestamp || !/^\d+$/.test(timestamp)) {
    throw new Error('Invalid ElevenLabs webhook timestamp')
  }

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > MAX_SIGNATURE_AGE_SECONDS) {
    throw new Error('Stale ElevenLabs webhook signature')
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest()

  if (received.length !== expected.length || !timingSafeEqual(expected, received)) {
    throw new Error('Invalid ElevenLabs webhook signature')
  }
}