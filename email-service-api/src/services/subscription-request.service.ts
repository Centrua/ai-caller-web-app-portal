import nodemailer, { Transporter } from 'nodemailer'

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

export class EmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SUB_REQ_EMAIL,
                pass: process.env.SUB_REQ_EMAIL_PASS,
            },
        })
    }

    public async sendAcknowledgment(data: SubscriptionRequestPayload): Promise<{ success: boolean; messageId: string }> {
        try {
            const mailOptions = {
                from: `"Centrua AI" <${process.env.SUB_REQ_EMAIL}>`,
                to: data.email,
                subject: 'We Have Received Your Request | Centrua AI',
                html: `
                    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                            
                            <!-- Logo Header -->
                            <div style="margin-bottom: 24px;">
                                <span style="font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: normal; letter-spacing: 0.05em; color: #0f172a; text-decoration: none;">
                                    Centrua AI
                                </span>
                            </div>

                            <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.025em;">
                                Request Received, ${data.name}!
                            </h2>
                            
                            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                                Thank you for registering <strong style="color: #0f172a;">${data.venue_name}</strong> with Centrua AI. We have successfully received your submission details and our team is reviewing them.
                            </p>

                            <!-- Summary Box -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                                <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #334155; letter-spacing: 0.05em;">
                                    Submission Details
                                </h4>
                                <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Venue:</strong> ${data.venue_name}</p>
                                <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Address:</strong> ${data.venue_address}, ${data.venue_city}, ${data.venue_state} ${data.venue_zip_code}</p>
                                <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Phone:</strong> ${data.phone_number}</p>
                                <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Request Type:</strong> ${data.requesting_demo ? 'Live Demo & 40% Off Deal' : 'Standard Registration'}</p>
                            </div>

                            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
                                We will be in touch shortly to finalize your setup. Please continue to check your email or await a call/text from our team at (260) 797-2951.
                            </p>

                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                            
                            <p style="color: #64748b; font-size: 13px; margin: 0;">
                                Best regards,<br/><strong>The Centrua AI Team</strong>
                            </p>
                        </div>
                    </div>
                `,
            }

            const info = await this.transporter.sendMail(mailOptions)
            return { success: true, messageId: info.messageId }
        } 
        catch (error) {
            console.error('Error sending acknowledgment email:', error)
            throw new Error(`Failed to send acknowledgment email: ${(error as Error).message}`)
        }
    }

    public async sendApprove(data: SubscriptionRequestPayload, onboardingTimestamp: string): Promise<{ success: boolean; messageId: string }> {
        try {
            const dateObj = new Date(onboardingTimestamp);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'America/New_York'
            });
            const formattedTime = dateObj.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                timeZone: 'America/New_York',
                timeZoneName: 'short' 
            });

            const mailOptions = {
                from: `"Centrua AI" <${process.env.SUB_REQ_EMAIL}>`,
                to: data.email,
                subject: 'Your Centrua AI Request Has Been Approved!',
                html: `
                    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                            
                            <!-- Logo Header -->
                            <div style="margin-bottom: 24px;">
                                <span style="font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: normal; letter-spacing: 0.05em; color: #0f172a; text-decoration: none;">
                                    Centrua AI
                                </span>
                            </div>

                            <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.025em;">
                                You're All Set, ${data.name}!
                            </h2>
                            
                            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                                Great news! Your request for <strong style="color: #0f172a;">${data.venue_name}</strong> has been approved.
                            </p>

                            <!-- Notice Box -->
                            <div style="background-color: rgba(43, 53, 40, 0.03); border: 1px solid rgba(43, 53, 40, 0.15); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 15px; color: #2B3528; font-weight: 500; line-height: 1.5;">
                                    ${data.requesting_demo ? 'Your live demo and 40% off subscription lock-in have been processed. ' : ''}Your subscription setup is now active, scheduled for onboarding on <strong>${formattedDate} at ${formattedTime.replace(/EDT|EST/, 'EST')}</strong>. <br/><br/> You will receive a Google Meet link for this meeting shortly.
                                </p>
                            </div>

                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                            
                            <p style="color: #64748b; font-size: 13px; margin: 0;">
                                Welcome aboard,<br/><strong>The Centrua AI Team</strong>
                            </p>
                        </div>
                    </div>
                `,
            }

            const info = await this.transporter.sendMail(mailOptions)
            return { success: true, messageId: info.messageId }
        } 
        catch (error) {
            console.error('Error sending approval email:', error)
            throw new Error(`Failed to send approval email: ${(error as Error).message}`)
        }
    }
}

export default new EmailService()