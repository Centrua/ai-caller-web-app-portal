import { Request, Response } from 'express'
import outgoingService from '../services/outgoing.service'

export class OutgoingController {
  editBody = async (req: Request, res: Response): Promise<void> => {
    try {
      const draftId = Number(req.params.id || req.params.draftId)
      const { body } = req.body
      const result = await outgoingService.editBody(draftId, body)
      if (!result) {
        res.status(404).json({ error: 'Draft not found' })
        return
      }
      res.status(200).json(result)
    } 
    catch (err: any) {
      console.error('Error editing draft body:', err?.message || err)
      const status = err?.status || 500
      res.status(status).json({ error: err?.message || 'Failed to edit draft body' })
    }
  }
}

const controller = new OutgoingController()
export default controller