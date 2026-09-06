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

  uploadKnowledgeBaseFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file
      if (!file) {
        res.status(400).json({ error: 'File is required' })
        return
      }

      const userId = req.user?.id

      const result = await this.knowledgeBaseService.uploadKnowledgeBaseFile(
        file.buffer,
        file.originalname,
        userId ? Number(userId) : undefined
      )
      res.status(200).json(result)
    }
    catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to upload file' })
    }
  }

  getKnowledgeBaseFiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 100

      const result = await this.knowledgeBaseService.getKnowledgeBaseFiles(
        userId ? Number(userId) : undefined,
        pageSize
      )
      res.status(200).json(result)
    }
    catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to retrieve knowledge base files' })
    }
  }

  getKnowledgeBaseFileById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id || (req.params as any).documentationId
      if (!id) {
        res.status(400).json({ error: 'Documentation ID is required' })
        return
      }

      const content = await this.knowledgeBaseService.getKnowledgeBaseFileById(id)

      res.setHeader('Content-Type', 'text/plain')
      res.status(200).send(content)
    }
    catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to download knowledge base file' })
    }
  }

deleteKnowledgeBaseFileById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id || (req.params as any).documentationId
      if (!id) {
        res.status(400).json({ error: 'Documentation ID is required' })
        return
      }

      const userId = req.user?.id
      const agentId = req.body.agentId || req.query.agentId

      await this.knowledgeBaseService.deleteKnowledgeBaseFileById(
        id,
        userId ? Number(userId) : undefined,
        agentId as string
      )

      res.status(200).json({ success: true, message: 'File deleted successfully' })
    }
    catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete knowledge base file' })
    }
  }
}