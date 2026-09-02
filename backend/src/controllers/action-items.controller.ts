import { Request, Response } from 'express'
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueService } from '../services/venue.service'
import ActionItemsService from '../services/action-items.service'
import { conversationBelongsToAgent, requireConversationId } from '../utils/conversation'
import { sendError, sendSuccess } from '../utils/http'

export class ActionItemsController {
  private elevenLabsRepo: ElevenLabsRepository
  private venueService: VenueService
  private actionItemsService = ActionItemsService

  constructor(elevenLabsRepo?: ElevenLabsRepository, venueService?: VenueService) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
    this.venueService = venueService || new VenueService()
  }

  private async ensureUserCanAccessConversation(req: Request, res: Response, conversationId: string): Promise<string | null> {
    const userId = req.user?.id
    if (!userId) {
      sendError(res, 401, 'Unauthorized: user context missing')
      return null
    }

    const agentId = await this.venueService.getAgentIdFromUserId(userId)
    if (!agentId) {
      sendError(res, 403, 'Forbidden: agent not found for user')
      return null
    }

    const conversation = await this.elevenLabsRepo.getConversationById(conversationId)
    if (!conversationBelongsToAgent(conversation, agentId)) {
      sendError(res, 403, 'Forbidden: conversation does not belong to this user\'s agent')
      return null
    }

    return agentId
  }

  public actionsList = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = requireConversationId(req, res)
      if (!conversationId) return

      if (!(await this.ensureUserCanAccessConversation(req, res, conversationId))) return

      const data = await this.elevenLabsRepo.getConversationById(conversationId)
      const dcr = data.analysis?.data_collection_results ?? data.data_collection_results ?? data.dataCollectionResults
      const items = await this.actionItemsService.getActionItems(conversationId, dcr)
      sendSuccess(res, 200, items)
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error')
    }
  }

  public setCompletionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = requireConversationId(req, res)
      if (!conversationId) return

      if (!(await this.ensureUserCanAccessConversation(req, res, conversationId))) return

      const body = req.body || {}
      if (typeof body.completed !== 'boolean') {
        sendError(res, 400, 'Missing completed boolean')
        return
      }

      const updated = body.completed
        ? await this.actionItemsService.markDone(conversationId)
        : await this.actionItemsService.markUndone(conversationId)
      sendSuccess(res, 200, updated)
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error')
    }
  }

  public getFlags = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = requireConversationId(req, res)
      if (!conversationId) return

      if (!(await this.ensureUserCanAccessConversation(req, res, conversationId))) return

      const flags = await this.actionItemsService.getConversationFlags(conversationId)
      sendSuccess(res, 200, flags)
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error')
    }
  }

}

