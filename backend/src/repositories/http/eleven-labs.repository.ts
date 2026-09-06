import { getMimeType } from '../../utils/file-mime-type.util'

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

  async duplicateAgent(agentId: string, name?: string | null): Promise<{ agent_id: string;[key: string]: any }> {
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

  async uploadKnowledgeBaseFile(fileBuffer: Buffer, filename: string): Promise<{ id: string; name: string; type: string;[key: string]: any }> {
    if (!fileBuffer || fileBuffer.length === 0) throw new Error('fileBuffer is required')
    if (!filename) throw new Error('filename is required')

    const url = new URL(`${this.baseUrl}/convai/knowledge-base/file`)

    const mimeType = getMimeType(filename)
    const formData = new FormData()
    const blob = new Blob([fileBuffer as BlobPart], { type: mimeType })

    formData.append('file', blob, filename)
    formData.append('name', filename)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    return await response.json()
  }

  async getKnowledgeBaseFiles(pageSize: number = 100): Promise<{ documents: any[]; has_more?: boolean }> {
    const url = new URL(`${this.baseUrl}/convai/knowledge-base`)
    url.searchParams.append('page_size', String(pageSize))

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
      documents: data.documents || data.knowledge_base_documents || [],
      has_more: data.has_more || false,
    }
  }

  async getKnowledgeBaseFileById(documentationId: string): Promise<any> {
    if (!documentationId) throw new Error('documentationId is required')

    const url = new URL(`${this.baseUrl}/convai/knowledge-base/${encodeURIComponent(documentationId)}`)

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

  async deleteKnowledgeBaseFileById(documentationId: string): Promise<any> {
    if (!documentationId) throw new Error('documentationId is required')

    const url = new URL(`${this.baseUrl}/convai/knowledge-base/${encodeURIComponent(documentationId)}`)

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    const text = await response.text()
    return text ? JSON.parse(text) : { success: true }
  }

  async listAgentProcedures(agentId: string, branchId: string, agentVersionId?: string | null): Promise<{ procedures: any[] }> {
    if (!agentId) throw new Error('agentId is required')
    if (!branchId) throw new Error('branchId is required')

    const url = new URL(`${this.baseUrl}/convai/agents/${encodeURIComponent(agentId)}/branches/${encodeURIComponent(branchId)}/procedures`)

    if (agentVersionId) {
      url.searchParams.append('agent_version_id', String(agentVersionId))
    }

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
    return { procedures: data.procedures || [] }
  }

  async listAgentBranches(
    agentId: string,
    options: { includeArchived?: boolean; limit?: number; includeCommitStatus?: boolean } = {},
  ): Promise<{ results: any[]; meta?: any }> {
    if (!agentId) throw new Error('agentId is required')

    const url = new URL(`${this.baseUrl}/convai/agents/${encodeURIComponent(agentId)}/branches`)

    const { includeArchived, limit, includeCommitStatus } = options

    if (includeArchived !== undefined && includeArchived !== null) {
      url.searchParams.append('include_archived', String(Boolean(includeArchived)))
    }
    if (limit !== undefined && limit !== null) {
      url.searchParams.append('limit', String(limit))
    }
    if (includeCommitStatus !== undefined && includeCommitStatus !== null) {
      url.searchParams.append('include_commit_status', String(Boolean(includeCommitStatus)))
    }

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
    return { results: data.results || [], meta: data.meta || null }
  }

  async getAgentProcedure(
    agentId: string,
    branchId: string,
    procedureId: string,
    options: { versionId?: string | null; agentVersionId?: string | null } = {},
  ): Promise<any> {
    if (!agentId) throw new Error('agentId is required')
    if (!branchId) throw new Error('branchId is required')
    if (!procedureId) throw new Error('procedureId is required')

    const url = new URL(
      `${this.baseUrl}/convai/agents/${encodeURIComponent(agentId)}/branches/${encodeURIComponent(branchId)}/procedures/${encodeURIComponent(
        procedureId,
      )}`,
    )

    const { versionId, agentVersionId } = options
    if (versionId !== undefined && versionId !== null) {
      url.searchParams.append('version_id', String(versionId))
    }
    if (agentVersionId !== undefined && agentVersionId !== null) {
      url.searchParams.append('agent_version_id', String(agentVersionId))
    }

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
}