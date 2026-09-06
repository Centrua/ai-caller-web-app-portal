import Venue from '../models/venue.model'
import VenueSettings from '../models/venue-settings.model'

export class VenueRepository {
  async getAutoSendByGrant(grantId: string): Promise<boolean | null> {
    const v = await Venue.findOne({
      where: { nylas_grant_id: grantId },
      attributes: ['id'],
      include: [{ association: 'settings', attributes: ['auto_send_replies', 'email_ai_routing'] }],
    })
    if (!v) return null
    const s = (v as any).settings
    if (!s) return false
    return !!s.auto_send_replies
  }

  async getSettingsByGrant(grantId: string): Promise<{ auto_send_replies: boolean; email_ai_routing: boolean } | null> {
    const v = await Venue.findOne({
      where: { nylas_grant_id: grantId },
      attributes: ['id'],
      include: [{ association: 'settings', attributes: ['auto_send_replies', 'email_ai_routing'] }],
    })
    if (!v) return null
    const s = (v as any).settings
    if (!s) return null
    return { auto_send_replies: !!s.auto_send_replies, email_ai_routing: !!s.email_ai_routing }
  }

  async getVenueNameByGrant(grantId: string): Promise<string | null> {
    const v = await Venue.findOne({ where: { nylas_grant_id: grantId }, attributes: ['name'] })
    if (!v) return null
    // @ts-ignore
    return (v as any).name || null
  }
}

export default new VenueRepository()
