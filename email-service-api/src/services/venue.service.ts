import venueRepository from '../repositories/venue.repository'

export class VenueService {
  async getAutoSendByGrant(grantId: string): Promise<boolean | null> {
    if (!grantId) return null
    try {
      return await venueRepository.getAutoSendByGrant(grantId)
    } 
    catch (err: any) {
      console.error(`Failed to fetch auto send for grant ${grantId}:`, err?.message || err)
      return null
    }
  }

  async getSettingsByGrant(grantId: string): Promise<{ auto_send_replies: boolean; email_ai_routing: boolean } | null> {
    if (!grantId) return null
    try {
      return await venueRepository.getSettingsByGrant(grantId)
    } 
    catch (err: any) {
      console.error(`Failed to fetch settings for grant ${grantId}:`, err?.message || err)
      return null
    }
  }

  async getVenueNameByGrant(grantId: string): Promise<string | null> {
    if (!grantId) return null
    try {
      return await venueRepository.getVenueNameByGrant(grantId)
    } 
    catch (err: any) {
      console.error(`Failed to fetch venue name for grant ${grantId}:`, err?.message || err)
      return null
    }
  }

  async getAgentIdByGrant(grantId: string): Promise<string | null> {
    if (!grantId) {
      return null
    }

    try {
      return await venueRepository.getAgentIdByGrant(grantId)
    } 
    catch (err: any) {
      console.error(`Failed to fetch agent ID for grant ${grantId}:`, err?.message || err)
      return null
    }
  }
}

export default new VenueService()