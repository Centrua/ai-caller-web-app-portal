import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueService } from './venue.service'

export class KnowledgeBaseService {
  private elevenLabsRepo: ElevenLabsRepository
  private venueService: VenueService

  constructor(elevenLabsRepo?: ElevenLabsRepository, venueService?: VenueService) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
    this.venueService = venueService || new VenueService()
  }

  private async resolveAgentId(agentId?: string, userId?: number): Promise<string> {
    let targetAgentId = agentId

    if (!targetAgentId && userId) {
      targetAgentId = (await this.venueService.getAgentIdFromUserId(userId)) || undefined
    }

    if (!targetAgentId) {
      throw new Error('Agent ID could not be found for the given user or request.')
    }

    return targetAgentId
  }

  async getCompiledKnowledgeBaseText(userId?: number, agentId?: string): Promise<string> {
    const targetAgentId = await this.resolveAgentId(agentId, userId)

    const documentsResponse = await this.elevenLabsRepo.listKnowledgeBaseDocuments()
    const documents = Array.isArray(documentsResponse?.documents) ? documentsResponse.documents : []

    if (documents.length === 0) {
      return ''
    }

    const documentIds = documents.map((doc: any) => doc.id).filter(Boolean)

    const contentPromises = documentIds.map(async (docId: string) => {
      try {
        return await this.elevenLabsRepo.getAgentKnowledgeBaseContent(targetAgentId, docId)
      } 
      catch {
        return ''
      }
    })

    const contents = await Promise.all(contentPromises)

    return contents.filter((text) => typeof text === 'string' && text.trim().length > 0).join('\n\n---\n\n')
  }

  async createKnowledgeBaseFromText(name: string, text: string, userId?: number, agentId?: string): Promise<any> {
    const targetAgentId = await this.resolveAgentId(agentId, userId)
    return await this.elevenLabsRepo.createAgentKnowledgeBaseFromText(targetAgentId, name, text)
  }
}