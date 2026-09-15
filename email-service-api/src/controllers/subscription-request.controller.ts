import { Request, Response } from 'express'
import emailService, { SubscriptionRequestPayload } from '../services/subscription-request.service'

export class SubscriptionController {
    public async handleAcknowledgment(req: Request<{}, {}, SubscriptionRequestPayload>, res: Response): Promise<void> {
        try {
            const formData = req.body

            if (!formData.email || !formData.name || !formData.venue_name) {
                res.status(400).json({ error: 'Missing required fields (email, name, venue_name).' })
                return
            }

            const result = await emailService.sendAcknowledgment(formData)

            res.status(200).json({
                success: true,
                message: 'Acknowledgment email sent successfully.',
                messageId: result.messageId,
            })
        } 
        catch (error) {
            console.error('Controller Error (handleAcknowledgment):', error)
            res.status(500).json({
                success: false,
                error: (error as Error).message || 'Internal server error while sending email.',
            })
        }
    }

    public async handleApproval(req: Request<{}, {}, SubscriptionRequestPayload>, res: Response): Promise<void> {
        try {
            const formData = req.body

            if (!formData.email || !formData.name || !formData.venue_name) {
                res.status(400).json({ error: 'Missing required fields (email, name, venue_name).' })
                return
            }

            const result = await emailService.sendApprove(formData)

            res.status(200).json({
                success: true,
                message: 'Approval email sent successfully.',
                messageId: result.messageId,
            })
        } 
        catch (error) {
            console.error('Controller Error (handleApproval):', error)
            res.status(500).json({
                success: false,
                error: (error as Error).message || 'Internal server error while sending email.',
            })
        }
    }
}

export default new SubscriptionController()