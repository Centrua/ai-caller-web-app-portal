import { Request, Response } from 'express';
import { SubscriptionRequestService } from '../services/subscription-request.service';

export class SubscriptionRequestController {
    public static async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                name,
                phone_number,
                email,
                venue_name,
                venue_address,
                venue_city,
                venue_state,
                venue_zip_code,
                approved,
                requesting_demo,
            } = req.body;

            if (!name || !email || !phone_number || !venue_name) {
                return res.status(400).json({
                    error: 'Missing required fields: name, email, phone_number, and venue_name are required.',
                });
            }

            const newRequest = await SubscriptionRequestService.createSubscriptionRequest({
                name,
                phone_number,
                email,
                venue_name,
                venue_address,
                venue_city,
                venue_state,
                venue_zip_code,
                approved,
                requesting_demo,
            });

            return res.status(201).json({
                message: 'Subscription request created successfully.',
                data: newRequest,
            });
        } 
        catch (error) {
            const errorMessage = (error as Error).message;

            if (errorMessage.includes('already exists')) {
                return res.status(409).json({ error: errorMessage });
            }

            return res.status(500).json({
                error: `Internal server error: ${errorMessage}`,
            });
        }
    }
}