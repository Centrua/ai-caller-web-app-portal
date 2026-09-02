import { Request, Response } from 'express'
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import ActionItemsService from '../services/action-items.service'
import { requireConversationId, sendError, sendSuccess } from '../utils/http'

export class ActionItemsController {
  private elevenLabsRepo: ElevenLabsRepository
  private actionItemsService = ActionItemsService

  constructor(elevenLabsRepo?: ElevenLabsRepository) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
  }

  public actionsList = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = requireConversationId(req, res)
      if (!conversationId) return

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
      const conversationId = this.getConversationId(req, res)
      if (!conversationId) return

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
      const conversationId = this.getConversationId(req, res)
      if (!conversationId) return

      const flags = await this.actionItemsService.getConversationFlags(conversationId)
      sendSuccess(res, 200, flags)
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error')
    }
  }

}

