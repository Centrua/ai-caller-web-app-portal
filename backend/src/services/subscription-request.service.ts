import { SubscriptionRequestRepository } from '../repositories/subscription-request.repository.js';
import { SubscriptionRequest } from '../models/subscription-request.model.js';

interface CreateSubscriptionRequestInput {
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

export class SubscriptionRequestService {
    public static async createSubscriptionRequest(input: CreateSubscriptionRequestInput): Promise<SubscriptionRequest> {
        try {
            const existingRequest = await SubscriptionRequestRepository.findByEmail(input.email);
            if (existingRequest) {
                throw new Error('A subscription request with this email already exists.');
            }

            const newRequest = await SubscriptionRequestRepository.create(input);
            return newRequest;
        } 
        catch (error) {
            throw new Error(`Error in SubscriptionRequestService.createSubscriptionRequest: ${(error as Error).message}`);
        }
    }
}