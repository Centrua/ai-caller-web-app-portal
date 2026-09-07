import { VenueService } from './venue.service'
import LeadInquiryRepository from '../repositories/lead-inquiry.repository'

export class LeadInquiryService {
  private venueService = new VenueService()

  async getByThreadId(userId: number, threadId: string) {
    const grantId = await this.venueService.getGrantIdFromUserId(userId)
    if (!grantId) return null
    const lead = await LeadInquiryRepository.getByThreadId(threadId, grantId)
    if (!lead) return null

    // merge lead_info JSONB into top-level for frontend convenience
    const leadInfo = (lead as any).lead_info || {}
    const payload = {
      id: (lead as any).id,
      grant_id: (lead as any).grant_id,
      thread_id: (lead as any).thread_id,
      original_message_id: (lead as any).original_message_id,
      status: (lead as any).status,
      ...leadInfo,
    }

    return payload
  }
}

export default new LeadInquiryService()
