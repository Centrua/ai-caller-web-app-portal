import Venue from '../../models/venue.model'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export class ElvenlabsRepository {
  private async getVenueByGrant(grantId: string): Promise<{ id: number; agent_id?: string | null } | null> {
    if (!grantId) return null
    const v = await Venue.findOne({ where: { nylas_grant_id: grantId }, attributes: ['id', 'agent_id'] })
    if (!v) return null
    return { id: (v as any).id, agent_id: (v as any).agent_id }
  }

  private async request(path: string): Promise<any> {
    const url = `${BACKEND_URL}${path}`
    const res = await fetch(url)
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Backend request failed (${res.status}): ${body || res.statusText}`)
    }
    return res.json().catch(() => null)
  }

  async getSystemPromptByGrant(grantId: string): Promise<string | null> {
    const v = await this.getVenueByGrant(grantId)
    if (!v) return null
    const agentId = v.agent_id
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
    const agentId = v.agent_id
    if (!agentId) return null

    const resp = await this.request(`/api/procedures?agentId=${encodeURIComponent(agentId)}`)
    if (!resp || !resp.procedures) return null
    return Array.isArray(resp.procedures)
      ? resp.procedures.map((p: any) => (p && typeof p.content === 'string' ? p.content : ''))
      : null
  }
}

export default new ElvenlabsRepository()
