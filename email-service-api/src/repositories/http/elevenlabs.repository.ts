import Venue from '../../models/venue.model'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export class ElvenlabsRepository {
  private async getVenueByGrant(grantId: string): Promise<{ id: number; elevenlabs_agent_id?: string | null } | null> {
    if (!grantId) return null
    const v = await Venue.findOne({ where: { nylas_grant_id: grantId }, attributes: ['id', 'elevenlabs_agent_id'] })
    if (!v) return null
    return { id: (v as any).id, elevenlabs_agent_id: (v as any).elevenlabs_agent_id }
  }

  private async request(path: string): Promise<any> {
    const url = `${BACKEND_URL}${path}`
    const token = process.env.BACKEND_API_TOKEN
    if (!token) throw new Error('Missing BACKEND_API_TOKEN environment variable')

    let res: Response
    try {
      res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (err: any) {
      throw new Error(`Backend request failed (network): ${url} - ${err?.message || err}`)
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Backend request failed (${res.status}) ${url}: ${body || res.statusText}`)
    }

    return res.json().catch(() => null)
  }

  async getSystemPromptByGrant(grantId: string): Promise<string | null> {
    const v = await this.getVenueByGrant(grantId)
    if (!v) return null
    const agentId = v.elevenlabs_agent_id
    if (!agentId) return null

    const resp = await this.request(`/api/agents/system-prompt?agentId=${encodeURIComponent(agentId)}`)

    if (!resp) return null
    if (typeof resp.prompt === 'string') return resp.prompt
    if (resp.data && typeof resp.data.prompt === 'string') return resp.data.prompt
    return null
  }

  async getProceduresByGrant(grantId: string): Promise<string[] | null> {
    const v = await this.getVenueByGrant(grantId)
    if (!v) return null
    const agentId = v.elevenlabs_agent_id
    if (!agentId) return null

    console.log('Fetching procedures for agentId:', agentId)

    const resp = await this.request(`/api/procedures?agentId=${encodeURIComponent(agentId)}`)

    if (!resp) return null

    const rawProcedures = Array.isArray(resp.procedures) ? resp.procedures : Array.isArray(resp) ? resp : null
    if (!rawProcedures) return null

    return rawProcedures.map((p: any) => {
      if (!p) return ''
      if (typeof p === 'string') return p
      if (typeof p.content === 'string') return p.content
      if (p.data && typeof p.data.content === 'string') return p.data.content
      return ''
    })
  }
}

export default new ElvenlabsRepository()
