import { EmailConversationRouteRepository } from '../repositories/email-conversation-route.repository'
import { NylasRepository, type NylasMessage } from '../repositories/http/nylas.repository'
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueRepository } from '../repositories/venue.repository'
import { EmailFilterService } from './email-filter.service'

export class EmailRelayService {
  private readonly routes = new EmailConversationRouteRepository()
  private readonly nylas = new NylasRepository()
  private readonly elevenLabs = new ElevenLabsRepository()
  private readonly venues = new VenueRepository()
  private readonly emailFilter = new EmailFilterService()

  async forwardInboundMessage(venueId: number, message: NylasMessage): Promise<void> {
    if (!message.id || !message.thread_id || !message.grant_id) {
      throw new Error('Nylas message is missing routing fields')
    }

    const fullMessage = await this.nylas.getMessage(message.grant_id, message.id)
    const resolvedMessage = { ...message, ...fullMessage }
    const from = resolvedMessage.from?.[0]
    if (!from?.email) throw new Error('Nylas message is missing sender information')

    let route = await this.routes.findByThread(venueId, resolvedMessage.thread_id)
    if (!this.emailFilter.shouldForward(resolvedMessage, Boolean(route))) return

    if (!route) {
      route = await this.routes.create(venueId, resolvedMessage.thread_id, from.email, resolvedMessage.subject)
    }

    if (route.last_email_message_id === resolvedMessage.id) return

    const triggerConnectionId = process.env.ELEVENLABS_CUSTOM_CHANNEL_TRIGGER_ID
    const inboundSecret = process.env.ELEVENLABS_CUSTOM_CHANNEL_INBOUND_SECRET
    if (!triggerConnectionId || !inboundSecret) throw new Error('ElevenLabs Custom Channel is not configured')

    const result = await this.elevenLabs.sendCustomChannelMessage(triggerConnectionId, inboundSecret, {
      data: {
        type: 'user_message',
        text: (resolvedMessage.body || resolvedMessage.snippet || '').trim(),
        user_identifier: from.email,
      },
      user_message_id: `nylas_${resolvedMessage.id}`,
      ...(route.elevenlabs_conversation_id ? { conversation_id: route.elevenlabs_conversation_id } : {}),
    })

    await this.routes.setConversationId(route.id, result.conversation_id, resolvedMessage.id)
  }

  async sendAgentReply(conversationId: string, responseText: string): Promise<void> {
    const route = await this.routes.findByConversationId(conversationId)
    if (!route?.reply_to_email) throw new Error('No email route found for ElevenLabs conversation')

    const venue = await this.venues.findById(route.venue_id)
    if (!venue) throw new Error('No venue found for email route')
    if (!venue.nylas_grant_id) throw new Error('Venue has no Nylas grant configured')

    await this.nylas.sendMessage(venue.nylas_grant_id, {
      to: [{ email: route.reply_to_email }],
      subject: route.subject ? `Re: ${route.subject.replace(/^Re:\s*/i, '')}` : 'Reply from your venue assistant',
      body: responseText,
      ...(route.last_email_message_id ? { reply_to_message_id: route.last_email_message_id } : {}),
    })
  }
}