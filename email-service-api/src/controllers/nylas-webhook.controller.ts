import { Request, Response } from 'express'
import { handleNylasWebhook } from '../services/nylas.service'

export class NylasWebhookController {
  receive = async (req: Request, res: Response): Promise<void> => {
    await handleNylasWebhook(req, res)
  }
}

const controller = new NylasWebhookController()
export default controller
