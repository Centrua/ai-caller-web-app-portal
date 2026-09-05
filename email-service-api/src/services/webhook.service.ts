import { sequelize } from '../config/database'
import WebhookDelivery from '../models/webhook-delivery.model'

class WebhookService {
  // Returns true the FIRST time it sees an id, false on every duplicate.
  public async isFirstDelivery(notificationId: string): Promise<boolean> {
    if (!notificationId) return false
    try {
      const [instance, created] = await WebhookDelivery.findOrCreate({
        where: { id: notificationId },
        defaults: { id: notificationId },
      })

      return !!created
    } catch (err) {
      console.error('[WebhookService.isFirstDelivery] error', err)
      return false
    }
  }
}

export default new WebhookService()
