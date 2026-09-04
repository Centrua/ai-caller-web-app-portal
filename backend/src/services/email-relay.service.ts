import { EmailConversationRouteRepository } from '../repositories/email-conversation-route.repository'
import { NylasRepository, type NylasMessage } from '../repositories/http/nylas.repository'
import { VenueRepository } from '../repositories/venue.repository'

export class EmailRelayService {
  private readonly routes = new EmailConversationRouteRepository()
  private readonly nylas = new NylasRepository()
  private readonly venues = new VenueRepository()

  async forwardInboundMessage(venueId: number, message: NylasMessage): Promise<void> {
    if (!message.id || !message.thread_id || !message.grant_id) {
      throw new Error('Nylas message is missing routing fields')
    }

    const fullMessage = await this.nylas.getMessage(message.grant_id, message.id)
    const resolvedMessage = { ...message, ...fullMessage }
    const from = resolvedMessage.from?.[0]
    if (!from?.email) throw new Error('Nylas message is missing sender information')

    let route = await this.routes.findByThread(venueId, resolvedMessage.thread_id)

    if (!route) {
      route = await this.routes.create(venueId, resolvedMessage.thread_id, from.email, resolvedMessage.subject)
    }

    if (route.last_email_message_id === resolvedMessage.id) return

    const venue = await this.venues.findById(venueId)
    if (!venue?.elevenlabs_agent_id) throw new Error('Venue has no ElevenLabs agent configured')

    // ElevenLabs WebSocket text-conversation support has been removed; this relay path is no longer functional.
    throw new Error('Email relay via ElevenLabs is no longer supported')
  }
}