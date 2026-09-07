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

      const lead = await LeadInquiryService.getByThreadId(userId, String(conversationId))
      if (!lead) return res.status(404).json({})

      // merge lead_info JSONB into top-level for frontend convenience
      const leadInfo = (lead as any).lead_info || {}
      const payload = {
        id: (lead as any).id,
        grant_id: (lead as any).grant_id,
        thread_id: (lead as any).thread_id,
        original_message_id: (lead as any).original_message_id,
        status: (lead as any).status,
        ...leadInfo,
      }

      return res.status(200).json(payload)
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }
}

export default new LeadInquiryController()
