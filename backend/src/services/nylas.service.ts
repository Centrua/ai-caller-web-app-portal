import Nylas from 'nylas'

export interface TokenExchangeResponse {
  [key: string]: any
}

export class NylasService {
  private apiKey?: string
  private rawApiUri?: string
  private apiUri: string
  private clientId?: string
  private nylas: any = null

  constructor() {
    this.apiKey = process.env.NYLAS_API_KEY
    this.rawApiUri = process.env.NYLAS_API_URI
    this.apiUri = (this.rawApiUri || 'https://api.us.nylas.com').replace(/\/v3\/?$/i, '').replace(/\/$/, '')
    this.clientId = process.env.NYLAS_CLIENT_ID

    if (!this.apiKey) {
      console.warn('[NylasService] Missing NYLAS_API_KEY in env; auth endpoints will error')
    }

    this.initNylas()
  }

  private initNylas() {
    try {
      if (this.apiKey && this.apiUri) {
        this.nylas = new Nylas({ apiKey: this.apiKey as string, apiUri: this.apiUri as string })
      } else {
        console.warn('[NylasService] Skipping Nylas SDK init because apiKey or apiUri is missing')
      }

      if (this.rawApiUri && /\/v3\/?$/i.test(this.rawApiUri)) {
        console.info('[NylasService] Normalized NYLAS_API_URI by stripping trailing /v3')
      }
    } catch (e) {
      console.error('[NylasService] Failed to initialize Nylas SDK', e)
    }
  }

  getAuthUrl(provider: string, loginHint?: string, backendUrl?: string): string {
    if (!this.clientId || !this.apiKey) {
      throw new Error('NYLAS_CLIENT_ID or NYLAS_API_KEY is not configured on server')
    }

    if (!this.nylas || !this.nylas.auth || typeof this.nylas.auth.urlForOAuth2 !== 'function') {
      throw new Error('Nylas SDK not initialized')
    }

    const redirectUri = `${backendUrl || (process.env.BACKEND_URL || 'http://localhost:3001')}/api/nylas/callback`

    let url = this.nylas.auth.urlForOAuth2({
      clientId: this.clientId as string,
      provider: provider === 'outlook' ? 'microsoft' : (provider as any),
      redirectUri,
      loginHint: loginHint as string | undefined,
      state: provider,
    })

    // Defensive fix: remove duplicated '/v3/v3' if SDK produces it
    return String(url).replace('/v3/v3', '/v3')
  }

  async exchangeCode(code: string, backendUrl?: string): Promise<TokenExchangeResponse> {
    const redirectUri = `${backendUrl || (process.env.BACKEND_URL || 'http://localhost:3001')}/api/nylas/callback`

    try {
      if (this.nylas && this.nylas.auth && typeof this.nylas.auth.exchangeCodeForToken === 'function') {
        return await this.nylas.auth.exchangeCodeForToken({
          clientId: this.clientId as string,
          redirectUri,
          code,
        })
      }
      throw new Error('Nylas SDK not initialized for exchange')
    } catch (exchangeErr: any) {
      console.error('[NylasService] SDK exchangeCodeForToken failed:', exchangeErr)
      // manual token exchange fallback
      const tokenUrl = `${this.apiUri}/v3/connect/token`
      console.info('[NylasService] attempting manual token exchange to', tokenUrl)

      const params = new URLSearchParams()
      params.append('client_id', this.clientId as string)
      params.append('client_secret', this.apiKey || '')
      params.append('grant_type', 'authorization_code')
      params.append('code', code)
      params.append('redirect_uri', redirectUri)
      params.append('code_verifier', 'nylas')

      const fetchResp = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      const text = await fetchResp.text()
      try {
        const parsed = JSON.parse(text)
        if (!fetchResp.ok) {
          console.error('[NylasService] manual token exchange failed', fetchResp.status, parsed)
          throw new Error(`Token exchange failed: ${fetchResp.status} - ${JSON.stringify(parsed)}`)
        }
        return parsed
      } catch (e) {
        if (!fetchResp.ok) {
          console.error('[NylasService] manual token exchange failed', fetchResp.status, text)
          throw new Error(`Token exchange failed: ${fetchResp.status} - ${text}`)
        }
        return { raw: text }
      }
    }
  }
}

export default new NylasService()
