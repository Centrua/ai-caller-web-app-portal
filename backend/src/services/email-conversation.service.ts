import { VenueService } from './venue.service'
import EmailConversationRepository from '../repositories/email-conversation.repository'

export class EmailConversationService {
  private venueService = new VenueService()

  async getConversationsByUserId(userId: number) {
    const grantId = await this.venueService.getGrantIdFromUserId(userId)
    if (!grantId) return []
    return EmailConversationRepository.getConversationsByGrantId(grantId)
  }
}

export default new EmailConversationService()