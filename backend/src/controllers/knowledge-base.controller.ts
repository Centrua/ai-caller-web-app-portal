import { Request, Response } from 'express'
import { KnowledgeBaseService } from '../services/knowledge-base.service'

export class KnowledgeBaseController {
  private knowledgeBaseService: KnowledgeBaseService

  constructor(knowledgeBaseService?: KnowledgeBaseService) {
    this.knowledgeBaseService = knowledgeBaseService || new KnowledgeBaseService()
  }

  async createKnowledgeBase(req: Request, res: Response): Promise<void> {
    try {
      const { name, text, agentId } = req.body
      const userId = (req as any).user?.id || req.body.userId

      if (!text) {
        res.status(400).json({ error: 'Text content is required' })
        return
      }

      const result = await this.knowledgeBaseService.createKnowledgeBaseFromText(
        name || 'Knowledge Base Text',
        text,
        userId ? Number(userId) : undefined,
        agentId
      )

      res.status(201).json(result)
    } 
    catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  async getKnowledgeBaseContent(req: Request, res: Response): Promise<void> {
    try {
      const { agentId, userId: queryUserId } = req.query
      const userId = (req as any).user?.id || queryUserId

      const text = await this.knowledgeBaseService.getCompiledKnowledgeBaseText(
        userId ? Number(userId) : undefined,
        agentId as string
      )

      res.status(200).json({ text })
    } 
    catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }
}