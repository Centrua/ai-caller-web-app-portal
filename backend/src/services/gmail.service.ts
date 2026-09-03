import { google } from 'googleapis'

export class GmailService {
  private createOAuth2Client(refreshToken: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    return oauth2Client
  }

  // Fetch unread messages
  async getUnreadEmails(refreshToken: string, maxResults = 10) {
    const auth = this.createOAuth2Client(refreshToken)
    const gmail = google.gmail({ version: 'v1', auth })

    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults
    })

    const messages = res.data.messages || []
    return await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id! })
        return detail.data
      })
    )
  }

  // Send an email
  async sendEmail(refreshToken: string, to: string, subject: string, bodyText: string) {
    const auth = this.createOAuth2Client(refreshToken)
    const gmail = google.gmail({ version: 'v1', auth })

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      bodyText
    ]
    const message = messageParts.join('\n')

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    })

    return res.data
  }
}
