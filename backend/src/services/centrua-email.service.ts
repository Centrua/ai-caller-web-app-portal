import nodemailer from "nodemailer";
import { generateUserApprovalHtml } from "../utils/email-templates/user-approval-request.util";

if (!process.env.COMPANY_GMAIL_USER || !process.env.COMPANY_GMAIL_PASS) {
  console.warn("COMPANY_GMAIL environment variables are missing.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.COMPANY_GMAIL_USER,
    pass: process.env.COMPANY_GMAIL_PASS,
  },
});

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

    const info = await transporter.sendMail({
      from: `"Centrua" <${process.env.COMPANY_GMAIL_USER}>`,
      to,
      subject: `User Approval Request: ${username} (${email})`,
      html,
    });

    console.log("User approval email sent successfully: %s", info.messageId);
    return true;
  }
  catch (error) {
    console.error("Failed to send user approval email via Gmail:", error);
    throw new Error("Email delivery failed");
  }
};