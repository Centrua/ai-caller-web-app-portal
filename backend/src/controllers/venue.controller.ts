import { Request, Response } from 'express'
import { VenueService } from '../services/venue.service'
import { sendError, sendSuccess } from '../utils/http'

export class VenueController {
  private venueService: VenueService

  constructor(venueService?: VenueService) {
    this.venueService = venueService || new VenueService()
  }

  public getVenueName = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id

      if (!userId) {
        sendError(res, 401, 'Unauthorized: User context missing from request')
        return
      }

      const name = await this.venueService.getNameFromUserId(userId)

      if (!name) {
        sendError(res, 404, 'Venue name not found for this user')
        return
      }

      sendSuccess(res, 200, { name })
    } 
    catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while retrieving venue name')
    }
  }
}