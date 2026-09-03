interface UserApprovalHtmlOptions {
  username: string;
  email: string;
  approvalUrl: string;
}

export const generateUserApprovalHtml = ({
  username,
  email,
  approvalUrl,
}: UserApprovalHtmlOptions): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>User Approval Request</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #111111; margin-top: 0; font-size: 22px; font-weight: 600;">Account Approval Required</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello Admin,</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">A new user has registered and is awaiting your approval to gain venue access:</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 24px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;"><strong>Name:</strong> ${username || 'N/A'}</p>
            <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          </div>

          <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">Clicking the button below will instantly approve this user account and associate them with the venue:</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${approvalUrl}" style="background-color: #000000; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; display: inline-block;">Approve User & Associate Venue</a>
          </div>

          <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 40px; border-top: 1px solid #eaeaea; padding-top: 20px;">If you did not expect this request, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;
};