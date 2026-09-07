import { VenueService } from './venue.service'
import LeadInquiryRepository from '../repositories/lead-inquiry.repository'

export class LeadInquiryService {
  private venueService = new VenueService()

  async getByThreadId(userId: number, threadId: string) {
    const grantId = await this.venueService.getGrantIdFromUserId(userId)
    if (!grantId) return null
    const lead = await LeadInquiryRepository.getByThreadId(threadId, grantId)
    return lead
  }

  async getByEmail(userId: number, email: string) {
    const grantId = await this.venueService.getGrantIdFromUserId(userId)
    if (!grantId) return null
    return LeadInquiryRepository.getByEmail(email, grantId)
  }
}

export default new LeadInquiryService()
