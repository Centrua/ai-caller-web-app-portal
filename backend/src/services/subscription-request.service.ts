import { SubscriptionRequestRepository } from '../repositories/subscription-request.repository';
import { SubscriptionRequest } from '../models/subscription-request.model';
import emailHttpRepository from '../repositories/http/email-service-api.repository';

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

            try {
                const payload = {
                    name: input.name,
                    phone_number: input.phone_number,
                    email: input.email,
                    venue_name: input.venue_name,
                    venue_address: input.venue_address,
                    venue_city: input.venue_city,
                    venue_state: input.venue_state,
                    venue_zip_code: input.venue_zip_code,
                    requesting_demo: input.requesting_demo ?? false
                }
                await emailHttpRepository.sendAcknowledgment(payload);
            } 
            catch (emailError) {
                console.error('Failed to trigger acknowledgment email:', (emailError as Error).message);
            }

            return newRequest;
        } 
        catch (error) {
            throw new Error(`Error in SubscriptionRequestService.createSubscriptionRequest: ${(error as Error).message}`);
        }
    }

    public static async getNonApprovedRequests(): Promise<SubscriptionRequest[]> {
        try {
            return await SubscriptionRequestRepository.findNonApproved();
        } 
        catch (error) {
            throw new Error(`Error in SubscriptionRequestService.getNonApprovedRequests: ${(error as Error).message}`);
        }
    }

    public static async approveSubscriptionRequest(id: number, onboardingTimestamp: string): Promise<SubscriptionRequest> {
        try {
            const updatedRequest = await SubscriptionRequestRepository.approve(id);
            if (!updatedRequest) {
                throw new Error('Subscription request not found.');
            }

            try {
                const payload = {
                    name: updatedRequest.name,
                    phone_number: updatedRequest.phone_number,
                    email: updatedRequest.email,
                    venue_name: updatedRequest.venue_name,
                    venue_address: updatedRequest.venue_address,
                    venue_city: updatedRequest.venue_city,
                    venue_state: updatedRequest.venue_state,
                    venue_zip_code: updatedRequest.venue_zip_code,
                    requesting_demo: updatedRequest.requesting_demo ?? false
                }
                await emailHttpRepository.sendApprove(payload, onboardingTimestamp);
            } 
            catch (emailError) {
                console.error('Failed to trigger approval email:', (emailError as Error).message);
            }

            return updatedRequest;
        } 
        catch (error) {
            throw new Error(`Error in SubscriptionRequestService.approveSubscriptionRequest: ${(error as Error).message}`);
        }
    }
}