import { Request, Response } from 'express'
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import ActionItemsService from '../services/action-items.service'

export class ActionItemsController {
  private elevenLabsRepo: ElevenLabsRepository
  private actionItemsService = ActionItemsService

  constructor(elevenLabsRepo?: ElevenLabsRepository) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
  }

  public actionsList = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationIdRaw = req.params.id
      const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw
      if (!conversationId) {
        res.status(400).json({ success: false, error: 'conversation id required' })
        return
      }

      const data = await this.elevenLabsRepo.getConversationById(String(conversationId))
      const dcr = data.analysis?.data_collection_results ?? data.data_collection_results ?? data.dataCollectionResults
      const items = await this.actionItemsService.getActionItems(String(conversationId), dcr)
      res.status(200).json({ success: true, data: items })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  public updateAction = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationIdRaw = req.params.id
      const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw
      if (!conversationId) {
        res.status(400).json({ success: false, error: 'conversation id required' })
        return
      }

      const body = req.body || {}
      if (typeof body.completed === 'boolean') {
        const updated = body.completed
          ? await this.actionItemsService.markDone(String(conversationId))
          : await this.actionItemsService.markUndone(String(conversationId))
        res.status(200).json({ success: true, data: updated })
        return
      }

      res.status(400).json({ success: false, error: 'Unsupported update. Send { completed: true|false }' })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  public getFlags = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationIdRaw = req.params.id
      const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw
      if (!conversationId) {
        res.status(400).json({ success: false, error: 'conversation id required' })
        return
      }
      const flags = await this.actionItemsService.getConversationFlags(String(conversationId))
      res.status(200).json({ success: true, data: flags })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }

  public setComplete = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversationIdRaw = req.params.id
      const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw
      if (!conversationId) {
        res.status(400).json({ success: false, error: 'conversation id required' })
        return
      }

      const body = req.body || {}
      if (typeof body.completed !== 'boolean') {
        res.status(400).json({ success: false, error: 'Missing completed boolean' })
        return
      }

      const updated = body.completed
        ? await this.actionItemsService.markDone(String(conversationId))
        : await this.actionItemsService.markUndone(String(conversationId))
      res.status(200).json({ success: true, data: updated })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' })
    }
  }
}
