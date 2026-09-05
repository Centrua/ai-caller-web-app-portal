import Venue from './venue.model'
import VenueSettings from './venue-settings.model'
import WebhookDelivery from './webhook-delivery.model'

const models: any = {
  Venue,
  VenueSettings,
  WebhookDelivery,
}

// Call associate on each model if present
Object.values(models).forEach((m: any) => {
  if (typeof m.associate === 'function') m.associate(models)
})

export default models
