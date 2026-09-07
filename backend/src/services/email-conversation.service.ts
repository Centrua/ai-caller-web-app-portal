import { VenueService } from './venue.service'
import EmailConversationRepository from '../repositories/email-conversation.repository'

export class EmailConversationService {
  private venueService = new VenueService()

  async getConversationsByUserId(userId: number) {
    const grantId = await this.venueService.getGrantIdFromUserId(userId)
    if (!grantId) return []
    return EmailConversationRepository.getConversationsByGrantId(grantId)
  }

  async getNextActionForThread(userId: number, threadId: string) {
    const grantId = await this.venueService.getGrantIdFromUserId(userId)
    if (!grantId) return null

    const conv: any = await EmailConversationRepository.getConversationByThreadAndGrant(threadId, grantId)
    if (!conv) return null

    // `next_action` may be undefined if DB column does not exist; return null in that case
    return conv.next_action ?? null
  }
}

export default new EmailConversationService()