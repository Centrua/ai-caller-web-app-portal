import { Request, Response } from 'express'
import { ConversationService } from '../services/conversations.service'
import { requireConversationId } from '../utils/conversation'
import { sendError, sendSuccess } from '../utils/http'

export class ConversationsController {
  private conversationService: ConversationService

  constructor(conversationService?: ConversationService) {
    this.conversationService = conversationService || new ConversationService()
  }

  public list = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        sendError(res, 401, 'Unauthorized: user context missing')
        return
      }

      const result = await this.conversationService.listConversations(userId, req.query)
      sendSuccess(res, 200, result)
    } 
    catch (error: any) {
      if (error.message === 'AGENT_NOT_FOUND') {
        sendError(res, 400, 'Agent ID could not be resolved for user')
        return
      }
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

      const result = await this.conversationService.getConversation(userId, String(conversationId))
      sendSuccess(res, 200, result)
    } 
    catch (error: any) {
      if (error.message === 'AGENT_NOT_FOUND') {
        sendError(res, 403, 'Forbidden: agent not found for user')
        return
      }
      if (error.message === 'FORBIDDEN_CONVERSATION') {
        sendError(res, 403, 'Forbidden: conversation does not belong to this user\'s agent')
        return
      }
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

      const result = await this.conversationService.getSummary(userId, String(conversationId))
      sendSuccess(res, 200, result)
    } 
    catch (error: any) {
      if (error.message === 'AGENT_NOT_FOUND') {
        sendError(res, 403, 'Forbidden: agent not found for user')
        return
      }
      if (error.message === 'FORBIDDEN_CONVERSATION') {
        sendError(res, 403, 'Forbidden: conversation does not belong to this user\'s agent')
        return
      }
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

      const { buffer, contentType } = await this.conversationService.getAudio(userId, String(conversationId))
      res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Length', String(buffer.length))
      res.send(buffer)
    } 
    catch (error: any) {
      if (error.message === 'AGENT_NOT_FOUND') {
        sendError(res, 403, 'Forbidden: agent not found for user')
        return
      }
      if (error.message === 'FORBIDDEN_CONVERSATION') {
        sendError(res, 403, 'Forbidden: conversation does not belong to this user\'s agent')
        return
      }
      sendError(res, 500, error.message || 'Internal server error')
    }
  }
}