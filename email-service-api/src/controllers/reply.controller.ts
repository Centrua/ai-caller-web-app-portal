import { Request, Response } from 'express'
import emailReplyService from '../services/email-reply.service'

export class ReplyController {
  approve = async (req: Request, res: Response): Promise<void> => {
    try {
      const draftId = Number(req.params.draftId)
      const result = await emailReplyService.approveDraft(draftId)
      res.status(200).json(result)
    } catch (err: any) {
      console.error('Error approving draft:', err?.message || err)
      const status = err?.status || 500
      res.status(status).json({ error: err?.message || 'Failed to send draft' })
    }
  }
}

const controller = new ReplyController()
export default controller
