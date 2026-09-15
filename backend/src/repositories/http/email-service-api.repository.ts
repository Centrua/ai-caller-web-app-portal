export interface SubscriptionRequestPayload {
    name: string;
    phone_number: string;
    email: string;
    venue_name: string;
    venue_address: string;
    venue_city: string;
    venue_state: string;
    venue_zip_code: string;
    requesting_demo: boolean;
}

export class EmailServiceApiHttpRepository {
    private baseUrl: string;

    constructor() {
        const url = process.env.EMAIL_SERVICE_API_URL;
        if (!url) {
            console.warn('WARNING: EMAIL_SERVICE_API_URL environment variable is not defined.');
        }
        this.baseUrl = (url || '').replace(/\/+$/, '');
    }

    public async sendAcknowledgment(data: SubscriptionRequestPayload): Promise<{ success: boolean; messageId?: string }> {
        const endpoint = `${this.baseUrl}/subscription-requests/acknowledge`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json() as { success?: boolean; error?: string; messageId?: string };

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            return {
                success: true,
                messageId: result.messageId,
            };
        } 
        catch (error) {
            console.error('HTTP Repository Error (sendAcknowledgment):', error);
            throw new Error(`Failed to communicate with email service: ${(error as Error).message}`);
        }
    }

    public async sendApprove(data: SubscriptionRequestPayload, onboardingTimestamp: string): Promise<{ success: boolean; messageId?: string }> {
        const endpoint = `${this.baseUrl}/subscription-requests/approve`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    onboardingTimestamp,
                }),
            });

            const result = await response.json() as { success?: boolean; error?: string; messageId?: string };

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            return {
                success: true,
                messageId: result.messageId,
            };
        } 
        catch (error) {
            console.error('HTTP Repository Error (sendApprove):', error);
            throw new Error(`Failed to communicate with email service: ${(error as Error).message}`);
        }
    }
}

export default new EmailServiceApiHttpRepository();