import { Request, Response } from 'express'
import { KnowledgeBaseService } from '../services/knowledge-base.service'

export class KnowledgeBaseController {
  private knowledgeBaseService: KnowledgeBaseService

  constructor(knowledgeBaseService?: KnowledgeBaseService) {
    this.knowledgeBaseService = knowledgeBaseService || new KnowledgeBaseService()
  }

  createOrUpdateKnowledgeBase = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, text, agentId } = req.body
      const userId = req.user?.id;

      if (!text) {
        res.status(400).json({ error: 'Text content is required' })
        return
      }

      const result = await this.knowledgeBaseService.createOrUpdateKnowledgeBaseText(
        name || 'Knowledge Base Text',
        text,
        userId ? Number(userId) : undefined,
        agentId
      )

      res.status(200).json(result)
    } 
    catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  getKnowledgeBaseContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id

      const text = await this.knowledgeBaseService.getCompiledKnowledgeBaseText(
        userId ? Number(userId) : undefined
      )

      res.status(200).json({ text })
    } 
    catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }
}