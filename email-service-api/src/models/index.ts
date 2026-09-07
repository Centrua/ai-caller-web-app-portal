import Venue from './venue.model'
import VenueSettings from './venue-settings.model'
import WebhookDelivery from './webhook-delivery.model'
import LeadInquiry from './lead-inquiry.model'

const models: any = {
  Venue,
  VenueSettings,
  WebhookDelivery,
  LeadInquiry,
}

// Call associate on each model if present
Object.values(models).forEach((m: any) => {
  if (typeof m.associate === 'function') m.associate(models)
})

export default models
