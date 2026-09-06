import Venue from '../models/venue.model'
import VenueSettings from '../models/venue-settings.model'

export class VenueRepository {
  async getAutoSendByGrant(grantId: string): Promise<boolean | null> {
    const v = await Venue.findOne({
      where: { nylas_grant_id: grantId },
      attributes: ['id'],
      include: [{ association: 'settings', attributes: ['auto_send_replies'] }],
    })
    if (!v) return null
    const s = (v as any).settings
    if (!s) return false
    return !!s.auto_send_replies
  }
}

export default new VenueRepository()
