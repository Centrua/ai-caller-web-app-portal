import { EmailConversationRoute } from '../models/email-conversation-route.model'

export class EmailConversationRouteRepository {
  async findByThread(venueId: number, emailThreadId: string): Promise<EmailConversationRoute | null> {
    return EmailConversationRoute.findOne({ where: { venue_id: venueId, email_thread_id: emailThreadId } })
  }

  async findByConversationId(conversationId: string): Promise<EmailConversationRoute | null> {
    return EmailConversationRoute.findOne({ where: { elevenlabs_conversation_id: conversationId } })
  }

  async create(venueId: number, emailThreadId: string, replyToEmail?: string, subject?: string): Promise<EmailConversationRoute> {
    return EmailConversationRoute.create({ venue_id: venueId, email_thread_id: emailThreadId, reply_to_email: replyToEmail || null, subject: subject || null })
  }

  async setConversationId(routeId: number, conversationId: string, messageId: string): Promise<void> {
    await EmailConversationRoute.update(
      { elevenlabs_conversation_id: conversationId, last_email_message_id: messageId },
      { where: { id: routeId } }
    )
  }
}