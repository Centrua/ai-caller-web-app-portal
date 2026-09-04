import { generateUserApprovalHtml } from "../utils/email-templates/user-approval-request.util";
import { NylasRepository } from '../repositories/http/nylas.repository'

const nylasRepository = new NylasRepository()

interface SendUserApprovalEmailOptions {
  to: string;
  username: string;
  email: string;
  venueId: number;
  userId: number;
  backendUrl?: string;
}

export const sendUserApprovalEmail = async ({
  to,
  username,
  email,
  venueId,
  userId,
  backendUrl = process.env.BACKEND_URL || 'http://localhost:3001',
}: SendUserApprovalEmailOptions) => {
  try {
    const approvalUrl = `${backendUrl}/api/venue/${venueId}/associate-user?userId=${userId}`;

    const html = generateUserApprovalHtml({
      username,
      email,
      approvalUrl,
    });

    const grantId = process.env.NYLAS_COMPANY_GRANT_ID
    if (!grantId) throw new Error('NYLAS_COMPANY_GRANT_ID is not configured')

    const info = await nylasRepository.sendMessage(grantId, {
      to: [{ email: to }],
      subject: `User Approval Request: ${username} (${email})`,
      body: html,
    });

    console.log("User approval email sent successfully: %s", info.id);
    return true;
  }
  catch (error) {
    console.error("Failed to send user approval email via Nylas:", error);
    throw new Error("Email delivery failed");
  }
};