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

  /**
   * Fetch conversations with optional ElevenLabs-compatible filters.
   * Returns an object containing conversations array, has_more and next_cursor.
   */
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

  /**
   * Fetch a single conversation by id.
   */
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

  /**
   * Fetch a conversation summary (lightweight) by id.
   * Calls GET /convai/conversations/{id}/summary
   */
  async getConversationSummary(conversationId: string, max_messages?: number): Promise<any> {
    if (!conversationId) throw new Error('conversationId is required')
    const url = new URL(`${this.baseUrl}/convai/conversations/${encodeURIComponent(conversationId)}/summary`)
    if (typeof max_messages === 'number') url.searchParams.append('max_messages', String(max_messages))

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

  /**
   * Fetch the raw audio bytes for a conversation.
   * Returns { arrayBuffer, contentType }
   */
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