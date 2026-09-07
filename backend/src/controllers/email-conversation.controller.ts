import { Request, Response } from 'express'
import EmailConversationService from '../services/email-conversation.service'

export class EmailConversationController {
  async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No user ID provided' })
      }

      const conversations = await EmailConversationService.getConversationsByUserId(userId)
      return res.status(200).json(conversations)
    } 
    catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  async getNextAction(req: Request, res: Response) {
    try {
      const threadId = req.params.threadId
      if (!threadId) {
        return res.status(400).json({ error: 'threadId parameter required' })
      }

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'No user ID provided' })
      }

      const nextAction = await EmailConversationService.getNextActionForThread(userId, String(threadId))
      return res.status(200).json({ next_action: nextAction })
    } 
    catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  
}

export default new EmailConversationController()