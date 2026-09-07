import { Request, Response } from 'express'
import LeadInquiryService from '../services/lead-inquiry.service'
import { requireConversationId } from '../utils/conversation'

export class LeadInquiryController {
  async getByThreadId(req: Request, res: Response) {
    try {
      const conversationId = requireConversationId(req, res)
      if (!conversationId) return

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'No user ID provided' })
      }
      const payload = await LeadInquiryService.getByThreadId(userId, String(conversationId))
      if (!payload) return res.status(404).json({})

      return res.status(200).json(payload)
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }
}

export default new LeadInquiryController()
