import { SubscriptionRequest } from '../models/subscription-request.model.js';

interface CreateSubscriptionRequestDTO {
    name: string;
    phone_number: string;
    email: string;
    venue_name: string;
    venue_address: string;
    venue_city: string;
    venue_state: string;
    venue_zip_code: string;
    approved?: boolean;
    requesting_demo?: boolean;
}

export class SubscriptionRequestRepository {
    public static async findByEmail(email: string): Promise<SubscriptionRequest | null> {
        try {
            const request = await SubscriptionRequest.findOne({ where: { email } });
            return request;
        }
        catch (error) {
            throw new Error(`Failed to find subscription request by email: ${(error as Error).message}`);
        }
    }

    public static async findNonApproved(): Promise<SubscriptionRequest[]> {
        try {
            const requests = await SubscriptionRequest.findAll({
                where: { approved: false },
                order: [['created_at', 'DESC']]
            });
            return requests;
        }
        catch (error) {
            throw new Error(`Failed to fetch non-approved subscription requests: ${(error as Error).message}`);
        }
    }

    public static async approve(id: number): Promise<SubscriptionRequest | null> {
        try {
            const request = await SubscriptionRequest.findByPk(id);
            if (!request) {
                return null;
            }

            request.approved = true;
            await request.save();
            return request;
        }
        catch (error) {
            throw new Error(`Failed to approve subscription request: ${(error as Error).message}`);
        }
    }

    public static async create(data: CreateSubscriptionRequestDTO): Promise<SubscriptionRequest> {
        try {
            const subscriptionRequest = await SubscriptionRequest.create({
                name: data.name,
                phone_number: data.phone_number,
                email: data.email,
                venue_name: data.venue_name,
                venue_address: data.venue_address,
                venue_city: data.venue_city,
                venue_state: data.venue_state,
                venue_zip_code: data.venue_zip_code,
                approved: data.approved ?? false,
                requesting_demo: data.requesting_demo ?? false,
            });

            return subscriptionRequest;
        } 
        catch (error) {
            throw new Error(`Failed to create subscription request: ${(error as Error).message}`);
        }
    }
}