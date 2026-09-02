import { Request, Response } from 'express'
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueService } from '../services/venue.service'
import ActionItemsService from '../services/action-items.service'

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

      // If no agent_id provided, resolve from user's venue
      if (!filters.agent_id) {
        if (!userId) {
          res.status(401).json({ success: false, error: 'Unauthorized: user context missing' })
          return
        }
        const agentId = await this.venueService.getAgentIdFromUserId(userId)
        if (!agentId) {
          res.status(400).json({ success: false, error: 'Agent ID could not be resolved for user' })
          return
        }
        filters.agent_id = agentId
      }

      const repoResp = await this.elevenLabsRepo.getConversations(filters)

      const normalized = (repoResp.conversations || []).map(normalizeConversation)

      // enrich with action-item presence info (pending = not completed)
        const enriched = await Promise.all(
          normalized.map(async (c) => {
            try {
              const flags = await this.actionItemsService.getConversationFlags(String(c.id))
              const hasPending = flags ? !flags.completed : false
              const out: any = { ...(c as any), hasUnacknowledgedActions: hasPending }
              return out
            } catch {
              return { ...(c as any), hasUnacknowledgedActions: false }
            }
          })
        )

      res.status(200).json({ success: true, data: { conversations: enriched, hasMore: !!repoResp.has_more, nextCursor: repoResp.next_cursor } })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  public get = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationIdRaw = req.params.id
      const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw
      if (!conversationId) {
        res.status(400).json({ success: false, error: 'conversation id required' })
        return
      }

      const data = await this.elevenLabsRepo.getConversationById(String(conversationId))
      const normalized = normalizeConversation(data)
      // include action items state
      const normalizedAny: any = normalized
      try {
        const dcr = data.analysis?.data_collection_results ?? data.data_collection_results ?? normalizedAny.dataCollectionResults
        const items = await this.actionItemsService.getActionItems(String(normalizedAny.id), dcr)
        normalizedAny.actionItems = items
        normalizedAny.hasUnacknowledgedActions = items.some((it: any) => it.actionable && !it.completed)
        try {
          const rawDcr = data.analysis?.data_collection_results ?? data.data_collection_results ?? normalizedAny.dataCollectionResults
          const next = items.find((it: any) => it.actionable && !it.completed) || null
          if (Array.isArray(rawDcr)) {
            const arr = (rawDcr as any[]).map((it: any) => {
              const id = String(it.data_collection_id ?? it.id ?? JSON.stringify(it))
              if (next && id === next.id) return { ...it, nextActionableStep: true }
              return it
            })
            normalizedAny.dataCollectionResults = arr
          } else if (next && rawDcr && typeof rawDcr === 'object') {
            const key = next.id
            normalizedAny.dataCollectionResults = { ...(normalizedAny.dataCollectionResults || {}), [key]: { value: rawDcr[key]?.value ?? rawDcr[key], nextActionableStep: true } }
          } else {
            normalizedAny.dataCollectionResults = normalizedAny.dataCollectionResults || {}
            if (next) normalizedAny.dataCollectionResults['Next Actionable Step'] = next.value ?? next.label
          }
        } catch {
          // ignore
        }
      } catch {
        normalizedAny.actionItems = []
        normalizedAny.hasUnacknowledgedActions = false
      }

      res.status(200).json({ success: true, data: normalizedAny })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  public summary = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationIdRaw = req.params.id
      const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw
      if (!conversationId) {
        res.status(400).json({ success: false, error: 'conversation id required' })
        return
      }

      const maxMessagesRaw = req.query.max_messages
      const maxMessages = maxMessagesRaw ? parseInt(String(maxMessagesRaw), 10) : undefined

      const data = await this.elevenLabsRepo.getConversationSummary(String(conversationId), maxMessages)

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

      res.status(200).json({ success: true, data: normalized })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  public audio = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationIdRaw = req.params.id
      const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw
      if (!conversationId) {
        res.status(400).json({ success: false, error: 'conversation id required' })
        return
      }

      const data = await this.elevenLabsRepo.getConversationAudio(String(conversationId))
      const buffer = Buffer.from(data.arrayBuffer)
      res.setHeader('Content-Type', data.contentType)
      res.setHeader('Content-Length', String(buffer.length))
      res.send(buffer)
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }
}
