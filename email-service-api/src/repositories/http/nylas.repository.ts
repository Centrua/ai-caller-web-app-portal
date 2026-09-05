export interface NylasEmailAddress {
  name?: string
  email: string
}

export interface NylasMessage {
  id: string
  subject?: string
  body?: string
  from?: NylasEmailAddress[]
  to?: NylasEmailAddress[]
}

export class NylasRepository {
  private readonly baseUrl = process.env.NYLAS_API_URI || 'https://api.us.nylas.com/v3'

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const apiKey = process.env.NYLAS_API_KEY
    if (!apiKey) throw new Error('Missing Nylas API key')

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Nylas API error (${response.status}): ${errorBody || response.statusText}`)
    }

    return response.json() as Promise<T>
  }

  async sendMessage(
    grantId: string,
    payload: {
      subject: string
      body: string
      to: NylasEmailAddress[]
      reply_to_message_id?: string
    }
  ): Promise<NylasMessage> {
    const result = await this.request<{ data: NylasMessage }>(
      `/grants/${encodeURIComponent(grantId)}/messages/send`,
      { method: 'POST', body: JSON.stringify(payload) }
    )
    return result.data
  }
}
