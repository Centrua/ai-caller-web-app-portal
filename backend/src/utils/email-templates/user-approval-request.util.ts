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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 8px;">Account Approval Required</h2>
          <p style="color: #64748b; font-size: 15px; line-height: 1.5; text-align: center; margin-top: 0; margin-bottom: 24px;">A new user has registered and is awaiting your approval to gain venue access.</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;"><strong>Name:</strong> ${username || 'N/A'}</p>
            <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          </div>

          <p style="color: #475569; font-size: 15px; line-height: 1.5; text-align: center; margin-bottom: 32px;">Clicking the button below will instantly approve this user account and associate them with your venue:</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${approvalUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">Approve User & Associate Venue</a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">If you did not expect this request, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;
};