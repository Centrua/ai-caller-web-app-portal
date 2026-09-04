export class ElevenLabsRepository {
  private apiKey: string
  private baseUrl: string = 'https://api.elevenlabs.io/v1'

  constructor() {
    if (process.env.ELEVENLABS_API_KEY) {
      this.apiKey = process.env.ELEVENLABS_API_KEY
    } else {
      throw new Error('Missing ElevenLabs credentials')
    }
  }

  async getConversations(filters: Record<string, any> = {}): Promise<{ conversations: any[]; has_more: boolean; next_cursor?: string | null }> {
    const url = new URL(`${this.baseUrl}/convai/conversations`)

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return

      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null) url.searchParams.append(key, String(v))
        })
        return
      }

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
    const url = new URL(`${this.baseUrl}/convai/conversations/${encodeURIComponent(conversationId)}`)

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

    return await response.json()
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

    return await response.json()
  }

  async getConversationAudio(conversationId: string): Promise<{ arrayBuffer: ArrayBuffer; contentType: string }> {
    if (!conversationId) throw new Error('conversationId is required')
    const url = new URL(`${this.baseUrl}/convai/conversations/${encodeURIComponent(conversationId)}/audio`)

    const response = await fetch(url.toString(), {
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

  async createKnowledgeBaseDocument(name: string, text: string): Promise<any> {
    if (!text) throw new Error('text content is required')

    const url = new URL(`${this.baseUrl}/convai/knowledge-base/text`)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, text }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    return await response.json()
  }

  async updateKnowledgeBaseDocument(documentId: string, name: string, text: string): Promise<any> {
    if (!documentId) throw new Error('documentId is required')
    if (!text) throw new Error('text content is required')

    const url = new URL(`${this.baseUrl}/convai/knowledge-base/${encodeURIComponent(documentId)}`)

    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, content: text }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    return await response.json()
  }

  async getKnowledgeBaseContent(documentId: string): Promise<any> {
    if (!documentId) throw new Error('documentId is required')

    const url = new URL(`${this.baseUrl}/convai/knowledge-base/${encodeURIComponent(documentId)}/content`)

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

    const rawText = await response.text()

    return rawText
  }

  async duplicateAgent(agentId: string, name?: string | null): Promise<{ agent_id: string; [key: string]: any }> {
    if (!agentId) throw new Error('agentId is required')

    const url = new URL(`${this.baseUrl}/convai/agents/${encodeURIComponent(agentId)}/duplicate`)
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(name ? { name } : {}),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    return await response.json()
  }

  async getAgentConfig(agentId: string): Promise<any> {
    if (!agentId) throw new Error('agentId is required')

    const url = new URL(`${this.baseUrl}/convai/agents/${encodeURIComponent(agentId)}`)

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

    return await response.json()
  }

  async updateAgentConfig(agentId: string, payload: any): Promise<any> {
    if (!agentId) throw new Error('agentId is required')

    const url = new URL(`${this.baseUrl}/convai/agents/${encodeURIComponent(agentId)}`)

    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    return await response.json()
  }

}