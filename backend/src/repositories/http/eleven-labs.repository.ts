export class ElevenLabsRepository {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    if (process.env.ELEVENLABS_API_KEY) {
      this.apiKey = process.env.ELEVENLABS_API_KEY
    } 
    else {
      throw new Error('Missing ElevenLabs credentials')
    }
  }

  async getConversations(filters: Record<string, any> = {}): Promise<{ conversations: any[]; has_more: boolean; next_cursor?: string | null }> {
    const url = new URL(`${this.baseUrl}/convai/conversations`)

    // Append allowed filters to query params. Handle arrays and booleans.
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return

      // Arrays: repeat param for arrays
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null) url.searchParams.append(key, String(v))
        })
        return
      }

      // Booleans and other primitive types
      url.searchParams.append(key, String(value))
    })

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    const data = await response.json()
    return {
      conversations: data.conversations || [],
      has_more: data.has_more || false,
      next_cursor: data.next_cursor || null,
    }
  }

  async getConversationById(conversationId: string): Promise<any> {
    if (!conversationId) throw new Error('conversationId is required')
    const url = `${this.baseUrl}/convai/conversations/${encodeURIComponent(conversationId)}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  async getConversationSummary(conversationId: string): Promise<any> {
    if (!conversationId) throw new Error('conversationId is required')
    const url = new URL(`${this.baseUrl}/convai/conversations/${encodeURIComponent(conversationId)}/summary`)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  async getConversationAudio(conversationId: string): Promise<{ arrayBuffer: ArrayBuffer; contentType: string }> {
    if (!conversationId) throw new Error('conversationId is required')
    const url = `${this.baseUrl}/convai/conversations/${encodeURIComponent(conversationId)}/audio`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const arrayBuffer = await response.arrayBuffer()
    return { arrayBuffer, contentType }
  }
}