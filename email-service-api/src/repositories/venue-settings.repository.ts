import VenueSettings from '../models/venue-settings.model'

export class VenueSettingsRepository {
  async getByVenueId(venueId: number) {
    return VenueSettings.findOne({ where: { venue_id: venueId }, attributes: ['auto_send_replies', 'email_ai_routing'] })
  }

  async createDefaultSettings(venueId: number) {
    return VenueSettings.create({ venue_id: venueId, auto_send_replies: false, email_ai_routing: false })
  }
}

export default new VenueSettingsRepository()
