import { Request, Response } from 'express'
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueService } from '../services/venue.service'
import ActionItemsService from '../services/action-items.service'
import { conversationBelongsToAgent, requireConversationId } from '../utils/conversation'
import { sendError, sendSuccess } from '../utils/http'

function formatDuration(seconds?: number) {
  if (!seconds && seconds !== 0) return null
  const s = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(s / 60)
  const secs = s % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function normalizeConversation(conv: any) {
  const startUnix = conv.start_time_unix_secs ?? conv.metadata?.start_time_unix_secs ?? null
  const durationSecs = conv.call_duration_secs ?? conv.metadata?.call_duration_secs ?? null

  const transcript = Array.isArray(conv.transcript)
    ? conv.transcript
    : Array.isArray(conv.messages)
      ? conv.messages
      : undefined

  return {
    id: conv.conversation_id ?? conv.id ?? null,
    agentName: conv.agent_name ?? conv.agentName ?? null,
    startTime: startUnix ? new Date(startUnix * 1000).toISOString() : null,
    durationDisplay: formatDuration(durationSecs),
    callSummaryTitle: conv.call_summary_title ?? conv.callSummaryTitle ?? null,
    transcriptSummary: conv.transcript_summary ?? null,
    transcript,
    messages: transcript,
    hasAudio: typeof conv.has_audio === 'boolean' ? conv.has_audio : undefined,
    hasUserAudio: typeof conv.has_user_audio === 'boolean' ? conv.has_user_audio : undefined,
    hasResponseAudio: typeof conv.has_response_audio === 'boolean' ? conv.has_response_audio : undefined,
    hasAuxiliaryAudio: typeof conv.has_auxiliary_audio === 'boolean' ? conv.has_auxiliary_audio : undefined,
    analysis: conv.analysis ?? undefined,
    dataCollectionResults: conv.analysis?.data_collection_results ?? conv.data_collection_results ?? undefined,
  }
}

export class ConversationsController {
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
        } catch {
          return { ...conversation, hasUnacknowledgedActions: false }
        }
      })
    )
  }

  public list = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id

      // Build filters by copying query params. Express parses repeated params into arrays already.
      const filters: Record<string, any> = { ...req.query }

      // Ensure page_size numeric and bounded
      if (filters.page_size) {
        const parsed = parseInt(String(filters.page_size), 10)
        filters.page_size = Math.min(100, Math.max(1, isNaN(parsed) ? 30 : parsed))
      }

      if (!userId) {
        sendError(res, 401, 'Unauthorized: user context missing')
        return
      }
      const agentId = await this.venueService.getAgentIdFromUserId(userId)
      if (!agentId) {
        sendError(res, 400, 'Agent ID could not be resolved for user')
        return
      }
      filters.agent_id = agentId

      const repoResp = await this.elevenLabsRepo.getConversations(filters)

      const normalized = (repoResp.conversations || []).map(normalizeConversation)
      const enriched = await this.enrichConversationList(normalized)

      sendSuccess(res, 200, { conversations: enriched, hasMore: !!repoResp.has_more, nextCursor: repoResp.next_cursor })
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error')
    }
  }

  public get = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = requireConversationId(req, res)
      if (!conversationId) return

      const userId = req.user?.id
      if (!userId) {
        sendError(res, 401, 'Unauthorized: user context missing')
        return
      }

      const agentId = await this.venueService.getAgentIdFromUserId(userId)
      if (!agentId) {
        sendError(res, 403, 'Forbidden: agent not found for user')
        return
      }

      const data = await this.elevenLabsRepo.getConversationById(String(conversationId))
      if (!conversationBelongsToAgent(data, agentId)) {
        sendError(res, 403, 'Forbidden: conversation does not belong to this user\'s agent')
        return
      }

      const normalized = normalizeConversation(data)
      const normalizedAny: any = normalized

      try {
        const dcr = data.analysis?.data_collection_results ?? data.data_collection_results ?? normalizedAny.dataCollectionResults
        const items = await this.actionItemsService.getActionItems(String(normalizedAny.id), dcr)
        normalizedAny.actionItems = items
        normalizedAny.hasUnacknowledgedActions = items.some((it: any) => it.actionable && !it.completed)
      } catch {
        normalizedAny.actionItems = []
        normalizedAny.hasUnacknowledgedActions = false
      }

      sendSuccess(res, 200, normalizedAny)
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error')
    }
  }

  public summary = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = requireConversationId(req, res)
      if (!conversationId) return

      const userId = req.user?.id
      if (!userId) {
        sendError(res, 401, 'Unauthorized: user context missing')
        return
      }

      const agentId = await this.venueService.getAgentIdFromUserId(userId)
      if (!agentId) {
        sendError(res, 403, 'Forbidden: agent not found for user')
        return
      }

      const data = await this.elevenLabsRepo.getConversationSummary(String(conversationId))
      if (!conversationBelongsToAgent(data, agentId)) {
        sendError(res, 403, 'Forbidden: conversation does not belong to this user\'s agent')
        return
      }

      // Map summary fields into normalized shape similar to normalizeConversation
      const normalized = {
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

      sendSuccess(res, 200, normalized)
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error')
    }
  }

  public audio = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = requireConversationId(req, res)
      if (!conversationId) return

      const userId = req.user?.id
      if (!userId) {
        sendError(res, 401, 'Unauthorized: user context missing')
        return
      }

      const agentId = await this.venueService.getAgentIdFromUserId(userId)
      if (!agentId) {
        sendError(res, 403, 'Forbidden: agent not found for user')
        return
      }

      const data = await this.elevenLabsRepo.getConversationAudio(String(conversationId))
      const conversation = await this.elevenLabsRepo.getConversationById(String(conversationId))
      if (!conversationBelongsToAgent(conversation, agentId)) {
        sendError(res, 403, 'Forbidden: conversation does not belong to this user\'s agent')
        return
      }

      const buffer = Buffer.from(data.arrayBuffer)
      res.setHeader('Content-Type', data.contentType)
      res.setHeader('Content-Length', String(buffer.length))
      res.send(buffer)
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error')
    }
  }
}
