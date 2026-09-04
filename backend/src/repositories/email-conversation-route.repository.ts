import { EmailConversationRoute, type EmailTranscriptEntry } from '../models/email-conversation-route.model'

export class EmailConversationRouteRepository {
  async findByThread(venueId: number, emailThreadId: string): Promise<EmailConversationRoute | null> {
    return EmailConversationRoute.findOne({ where: { venue_id: venueId, email_thread_id: emailThreadId } })
  }

  async create(venueId: number, emailThreadId: string, replyToEmail?: string, subject?: string): Promise<EmailConversationRoute> {
    return EmailConversationRoute.create({ venue_id: venueId, email_thread_id: emailThreadId, reply_to_email: replyToEmail || null, subject: subject || null })
  }

  async recordTurn(
    routeId: number,
    conversationId: string,
    messageId: string,
    newEntries: EmailTranscriptEntry[]
  ): Promise<void> {
    const route = await EmailConversationRoute.findByPk(routeId)
    if (!route) return

    await route.update({
      elevenlabs_conversation_id: conversationId,
      last_email_message_id: messageId,
      transcript: [...route.transcript, ...newEntries],
    })
  }
}