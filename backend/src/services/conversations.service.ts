import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueService } from '../services/venue.service'
import ActionItemsService from '../services/action-items.service'
import { conversationBelongsToAgent, normalizeConversation } from '../utils/conversation'

export class ConversationService {
  private elevenLabsRepo: ElevenLabsRepository
  private venueService: VenueService
  private actionItemsService = ActionItemsService

  constructor(elevenLabsRepo?: ElevenLabsRepository, venueService?: VenueService) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
    this.venueService = venueService || new VenueService()
  }

  private async enrichConversationList(conversations: any[]): Promise<any[]> {
    return Promise.all(
      conversations.map(async (conversation) => {
        try {
          const flags = await this.actionItemsService.getConversationFlags(String(conversation.id))
          const hasPending = flags ? !flags.completed : false
          return { ...conversation, hasUnacknowledgedActions: hasPending }
        } 
        catch {
          return { ...conversation, hasUnacknowledgedActions: false }
        }
      })
    )
  }

  private async resolveAgentId(userId?: number): Promise<string> {
    if (!userId) {
      throw new Error('UNAUTHORIZED: User context missing')
    }
    const agentId = await this.venueService.getAgentIdFromUserId(userId)
    if (!agentId) {
      throw new Error('FORBIDDEN: Agent ID could not be resolved for user')
    }
    return agentId
  }

  public async listConversations(userId: number, query: Record<string, any>) {
    const filters: Record<string, any> = { ...query }

    if (filters.page_size) {
      const parsed = parseInt(String(filters.page_size), 10)
      filters.page_size = Math.min(100, Math.max(1, isNaN(parsed) ? 30 : parsed))
    }

    const agentId = await this.resolveAgentId(userId)
    filters.agent_id = agentId

    const repoResp = await this.elevenLabsRepo.getConversations(filters)
    const normalized = (repoResp.conversations || []).map(normalizeConversation)
    const enriched = await this.enrichConversationList(normalized)

    return {
      conversations: enriched,
      hasMore: !!repoResp.has_more,
      nextCursor: repoResp.next_cursor,
    }
  }

  public async getConversation(userId: number, conversationId: string) {
    const agentId = await this.resolveAgentId(userId)

    const data = await this.elevenLabsRepo.getConversationById(conversationId)
    if (!conversationBelongsToAgent(data, agentId)) {
      throw new Error('FORBIDDEN: Conversation does not belong to this user\'s agent')
    }

    const normalized = normalizeConversation(data)
    const normalizedAny: any = normalized

    try {
      const dcr = data.analysis?.data_collection_results ?? data.data_collection_results ?? normalizedAny.dataCollectionResults
      const items = await this.actionItemsService.getActionItems(String(normalizedAny.id), dcr)
      normalizedAny.actionItems = items
      normalizedAny.hasUnacknowledgedActions = items.some((it: any) => it.actionable && !it.completed)
    } 
    catch {
      normalizedAny.actionItems = []
      normalizedAny.hasUnacknowledgedActions = false
    }

    return normalizedAny
  }

  public async getSummary(userId: number, conversationId: string) {
    const agentId = await this.resolveAgentId(userId)

    const data = await this.elevenLabsRepo.getConversationSummary(conversationId)
    if (!conversationBelongsToAgent(data, agentId)) {
      throw new Error('FORBIDDEN: Conversation does not belong to this user\'s agent')
    }

    return {
      id: data.conversation_id ?? data.conversationId ?? null,
      agentId: data.agent_id ?? null,
      status: data.status ?? null,
      messageCount: typeof data.message_count === 'number' ? data.message_count : null,
      note: data.note ?? null,
      callSummaryTitle: data.call_summary_title ?? null,
      transcriptSummary: data.transcript_summary ?? null,
      callSuccessful: data.call_successful ?? null,
      messages: Array.isArray(data.messages) ? data.messages.map((m: any) => ({ role: m.role, message: m.message })) : undefined,
      messagesOmitted: !!data.messages_omitted,
    }
  }

  public async getAudio(userId: number, conversationId: string) {
    const agentId = await this.resolveAgentId(userId)

    const data = await this.elevenLabsRepo.getConversationAudio(conversationId)
    const conversation = await this.elevenLabsRepo.getConversationById(conversationId)
    if (!conversationBelongsToAgent(conversation, agentId)) {
      throw new Error('FORBIDDEN: Conversation does not belong to this user\'s agent')
    }

    const buffer = Buffer.from(data.arrayBuffer)
    return {
      buffer,
      contentType: data.contentType,
    }
  }
}