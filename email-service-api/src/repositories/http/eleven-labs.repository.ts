const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export class ElevenLabsRepository {
  private async request(path: string): Promise<any> {
    const url = `${ELEVENLABS_API_URL}${path}`
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY environment variable')

    let res: Response
    try {
      res = await fetch(url, {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      })
    } catch (err: any) {
      throw new Error(`ElevenLabs request failed (network): ${url} - ${err?.message || err}`)
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`ElevenLabs request failed (${res.status}) ${url}: ${body || res.statusText}`)
    }

    return res.json().catch(() => null)
  }

  async getAgentConfig(agentId: string): Promise<any> {
    if (!agentId) throw new Error('agentId is required')

    return await this.request(`/convai/agents/${encodeURIComponent(agentId)}`)
  }

  async getSystemPrompt(agentId: string): Promise<string | null> {
    if (!agentId) return null

    const resp = await this.request(`/convai/agents/${encodeURIComponent(agentId)}`)

    if (!resp) return null
    const prompt = resp.conversation_config?.agent?.prompt?.prompt
    if (typeof prompt === 'string') return prompt
    return null
  }

  async getProcedures(agentId: string): Promise<string[] | null> {
    if (!agentId) return null

    const resp = await this.request(`/convai/agents/${encodeURIComponent(agentId)}`)

    if (!resp) return null

    const knowledgeBase = resp.conversation_config?.agent?.prompt?.knowledge_base
    const rawProcedures = Array.isArray(knowledgeBase) ? knowledgeBase : null
    if (!rawProcedures) return null

    return rawProcedures.map((p: any) => {
      if (!p) return ''
      if (typeof p === 'string') return p
      if (typeof p.name === 'string') return p.name
      if (typeof p.content === 'string') return p.content
      return ''
    })
  }

  async listAgentProcedures(agentId: string, branchId: string, agentVersionId?: string | null): Promise<{ procedures: any[] }> {
    if (!agentId) throw new Error('agentId is required')
    if (!branchId) throw new Error('branchId is required')

    const queryParams = new URLSearchParams()
    if (agentVersionId) {
      queryParams.append('agent_version_id', String(agentVersionId))
    }
    const queryStr = queryParams.toString()
    const path = `/convai/agents/${encodeURIComponent(agentId)}/branches/${encodeURIComponent(branchId)}/procedures${queryStr ? `?${queryStr}` : ''}`

    const data = await this.request(path)
    return { procedures: data?.procedures || [] }
  }

  async listAgentBranches(
    agentId: string,
    options: { includeArchived?: boolean; limit?: number; includeCommitStatus?: boolean } = {},
  ): Promise<{ results: any[]; meta?: any }> {
    if (!agentId) throw new Error('agentId is required')

    const queryParams = new URLSearchParams()
    const { includeArchived, limit, includeCommitStatus } = options

    if (includeArchived !== undefined && includeArchived !== null) {
      queryParams.append('include_archived', String(Boolean(includeArchived)))
    }
    if (limit !== undefined && limit !== null) {
      queryParams.append('limit', String(limit))
    }
    if (includeCommitStatus !== undefined && includeCommitStatus !== null) {
      queryParams.append('include_commit_status', String(Boolean(includeCommitStatus)))
    }

    const queryStr = queryParams.toString()
    const path = `/convai/agents/${encodeURIComponent(agentId)}/branches${queryStr ? `?${queryStr}` : ''}`

    const data = await this.request(path)
    return { results: data?.results || [], meta: data?.meta || null }
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

    const queryParams = new URLSearchParams()
    const { versionId, agentVersionId } = options
    if (versionId !== undefined && versionId !== null) {
      queryParams.append('version_id', String(versionId))
    }
    if (agentVersionId !== undefined && agentVersionId !== null) {
      queryParams.append('agent_version_id', String(agentVersionId))
    }

    const queryStr = queryParams.toString()
    const path = `/convai/agents/${encodeURIComponent(agentId)}/branches/${encodeURIComponent(branchId)}/procedures/${encodeURIComponent(procedureId)}${queryStr ? `?${queryStr}` : ''}`

    return await this.request(path)
  }

  async getKnowledgeBaseFiles(): Promise<{ documents: any[]; has_more?: boolean }> {
    const data = await this.request(`/convai/knowledge-base`)
    return { documents: data?.documents}
  }

  async getKnowledgeBaseContent(documentId: string): Promise<string> {
    if (!documentId) throw new Error('documentId is required')

    const url = `${ELEVENLABS_API_URL}/convai/knowledge-base/${encodeURIComponent(documentId)}/content`
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY environment variable')

    let res: Response
    try {
      res = await fetch(url, {
        headers: {
          'xi-api-key': apiKey,
        },
      })
    } catch (err: any) {
      throw new Error(`ElevenLabs request failed (network): ${url} - ${err?.message || err}`)
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`ElevenLabs request failed (${res.status}) ${url}: ${body || res.statusText}`)
    }

    const raw = await res.text().catch(() => '')
    return raw
  }
}

export default new ElevenLabsRepository()