import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueService } from './venue.service'

export class AgentService {
  private elevenLabsRepo: ElevenLabsRepository
  private venueService: VenueService

  constructor(elevenLabsRepo?: ElevenLabsRepository, venueService?: VenueService) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
    this.venueService = venueService || new VenueService()
  }

  async getSystemPrompt(agentId?: string, userId?: number): Promise<string | null> {
    let targetAgentId = agentId

    if (!targetAgentId && userId) {
      targetAgentId = (await this.venueService.getAgentIdFromUserId(userId)) || undefined
    }

    if (!targetAgentId) {
      throw new Error('Agent ID could not be resolved from request')
    }

    const agentConfig = await this.elevenLabsRepo.getAgentConfig(targetAgentId)

    const promptField =
      agentConfig?.conversation_config?.agent?.prompt?.prompt ??
      agentConfig?.agent?.prompt?.prompt ??
      null

    return promptField
  }
}
