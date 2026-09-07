import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueService } from './venue.service'

export class ProcedureService {
  private elevenLabsRepo: ElevenLabsRepository
  private venueService: VenueService

  constructor(elevenLabsRepo?: ElevenLabsRepository, venueService?: VenueService) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
    this.venueService = venueService || new VenueService()
  }

  private async resolveAgentId(grantId?: string): Promise<string> {
    if (!grantId) {
      throw new Error('Grant ID is required.')
    }
    const agentId = await this.venueService.getAgentIdByGrant(grantId)
    if (!agentId) {
      throw new Error(`Agent ID could not be found for the given grant: ${grantId}`)
    }

    return agentId
  }

  async getMainBranchId(agentId: string): Promise<string | null> {
    const branchesResp = await this.elevenLabsRepo.listAgentBranches(agentId)
    const branches = branchesResp.results || []

    if (branches.length === 0) return null

    // Prefer a branch explicitly named "main" (case-insensitive), otherwise return the first branch.
    const mainBranch = branches.find((b: any) => typeof b.name === 'string' && b.name.toLowerCase() === 'main') || branches[0]

    return mainBranch?.id || null
  }

  async getAllProceduresForAgent(grantId?: string): Promise<any[]> {
    const targetAgentId = await this.resolveAgentId(grantId)

    const mainBranchId = await this.getMainBranchId(targetAgentId)
    if (!mainBranchId) return []

    const proceduresList = await this.elevenLabsRepo.listAgentProcedures(targetAgentId, mainBranchId)
    const procedures = proceduresList.procedures || []

    // Fetch full procedure content for each procedure id
    const detailedProcedures = await Promise.all(
      procedures.map(async (p: any) => {
        try {
          const proc = await this.elevenLabsRepo.getAgentProcedure(targetAgentId, mainBranchId, p.procedure_id)
          return proc
        } catch (err) {
          // If one procedure fails, return the metadata plus an error flag
          return { ...p, _error: (err as any)?.message || 'Failed to fetch procedure' }
        }
      }),
    )

    return detailedProcedures
  }
}

export default ProcedureService
