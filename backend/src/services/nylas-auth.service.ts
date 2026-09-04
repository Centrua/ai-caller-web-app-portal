import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

interface NylasOAuthState {
  purpose: 'venue-email-connect'
  nonce: string
}

export class NylasAuthService {
  private readonly baseUrl = process.env.NYLAS_API_URI || 'https://api.us.nylas.com/v3'

  getAuthorizationUrl(provider?: string): string {
    const clientId = process.env.NYLAS_CLIENT_ID
    const redirectUri = process.env.NYLAS_REDIRECT_URI
    if (!clientId || !redirectUri) throw new Error('Nylas OAuth is not configured')

    const state = jwt.sign(
      { purpose: 'venue-email-connect', nonce: crypto.randomUUID() } satisfies NylasOAuthState,
      this.getStateSecret(),
      { expiresIn: '10m' }
    )
    const url = new URL(`${this.baseUrl}/connect/auth`)
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    if (provider) url.searchParams.set('provider', provider)
    url.searchParams.set('access_type', 'online')
    url.searchParams.set('state', state)
    return url.toString()
  }

  async exchangeCode(code: string, state: string): Promise<{ grantId: string; email?: string }> {
    const decoded = jwt.verify(state, this.getStateSecret()) as NylasOAuthState
    if (decoded.purpose !== 'venue-email-connect') throw new Error('Invalid Nylas OAuth state')

    const response = await fetch(`${this.baseUrl}/connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.NYLAS_CLIENT_ID,
        client_secret: process.env.NYLAS_API_KEY,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NYLAS_REDIRECT_URI,
        code_verifier: 'nylas',
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Nylas OAuth exchange failed (${response.status}): ${body || response.statusText}`)
    }

    const data = await response.json() as { grant_id?: string; email?: string }
    if (!data.grant_id) throw new Error('Nylas OAuth response did not include a grant ID')
    return { grantId: data.grant_id, email: data.email }
  }

  private getStateSecret(): string {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured')
    return process.env.JWT_SECRET
  }
}