import VenueSettings from '../models/venue-settings.model'

export class VenueSettingsRepository {
    async getSettingsByVenueId(venueId: number) {
        return VenueSettings.findOne({ where: { venue_id: venueId } })
    }
    async createDefaultSettings(venueId: number) {
        return VenueSettings.create({ venue_id: venueId, auto_send_replies: false, email_ai_routing: false })
    }

    async updateSettings(venueId: number, updates: Partial<any>) {
        const settings = await this.getSettingsByVenueId(venueId)
        if (!settings) return null
        return settings.update(updates)
    }
}

export default new VenueSettingsRepository()
