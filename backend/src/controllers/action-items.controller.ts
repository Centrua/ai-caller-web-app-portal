import { Request, Response } from 'express'
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import ActionItemsService from '../services/action-items.service'

export class ActionItemsController {
  private elevenLabsRepo: ElevenLabsRepository
  private actionItemsService = ActionItemsService

  constructor(elevenLabsRepo?: ElevenLabsRepository) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
  }

  private getConversationId(req: Request, res: Response): string | null {
    const conversationIdRaw = req.params.id
    const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw

    if (!conversationId) {
      res.status(400).json({ success: false, error: 'conversation id required' })
      return null
    }

    return String(conversationId)
  }

  public actionsList = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = this.getConversationId(req, res)
      if (!conversationId) return

      const data = await this.elevenLabsRepo.getConversationById(conversationId)
      const dcr = data.analysis?.data_collection_results ?? data.data_collection_results ?? data.dataCollectionResults
      const items = await this.actionItemsService.getActionItems(conversationId, dcr)
      res.status(200).json({ success: true, data: items })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  public setCompletionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = this.getConversationId(req, res)
      if (!conversationId) return

      const body = req.body || {}
      if (typeof body.completed !== 'boolean') {
        res.status(400).json({ success: false, error: 'Missing completed boolean' })
        return
      }

      const updated = body.completed
        ? await this.actionItemsService.markDone(conversationId)
        : await this.actionItemsService.markUndone(conversationId)
      res.status(200).json({ success: true, data: updated })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  public getFlags = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationId = this.getConversationId(req, res)
      if (!conversationId) return

      const flags = await this.actionItemsService.getConversationFlags(conversationId)
      res.status(200).json({ success: true, data: flags })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

}

