import { EmailConversationRouteRepository } from '../repositories/email-conversation-route.repository'
import { NylasRepository, type NylasMessage } from '../repositories/http/nylas.repository'
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueRepository } from '../repositories/venue.repository'
import { EmailFilterService } from './email-filter.service'
import type { EmailTranscriptEntry } from '../models/email-conversation-route.model'

const MAX_TRANSCRIPT_ENTRIES = 20

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

    const venue = await this.venues.findById(venueId)
    if (!venue?.elevenlabs_agent_id) throw new Error('Venue has no ElevenLabs agent configured')

    const messageText = (resolvedMessage.body || resolvedMessage.snippet || '').trim()
    const firstMessage = this.buildFirstMessage(route.transcript, messageText)

    const { conversationId, replyText } = await this.elevenLabs.runTextConversation(venue.elevenlabs_agent_id, firstMessage)

    const newEntries: EmailTranscriptEntry[] = [
      { role: 'user', content: messageText, created_at: new Date().toISOString() },
      { role: 'agent', content: replyText, created_at: new Date().toISOString() },
    ]
    await this.routes.recordTurn(route.id, conversationId, resolvedMessage.id, newEntries)

    if (!venue.nylas_grant_id) throw new Error('Venue has no Nylas grant configured')
    await this.nylas.sendMessage(venue.nylas_grant_id, {
      to: [{ email: from.email }],
      subject: route.subject ? `Re: ${route.subject.replace(/^Re:\s*/i, '')}` : 'Reply from your venue assistant',
      body: replyText,
      reply_to_message_id: resolvedMessage.id,
    })
  }

  // Every WebSocket connection starts a brand-new ElevenLabs conversation, so prior thread
  // history has to be replayed as context in the first message rather than resumed server-side.
  private buildFirstMessage(transcript: EmailTranscriptEntry[], latestMessage: string): string {
    if (transcript.length === 0) return latestMessage

    const history = transcript
      .slice(-MAX_TRANSCRIPT_ENTRIES)
      .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
      .join('\n\n')

    return [
      'This is an ongoing email conversation. Here is the prior history:',
      history,
      '',
      'New message from the user:',
      latestMessage,
    ].join('\n')
  }
}