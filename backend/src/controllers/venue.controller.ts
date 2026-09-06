import { Request, Response } from 'express'
import { VenueRepository } from '../repositories/venue.repository'
import { VenueService } from '../services/venue.service'
import { sendError, sendSuccess } from '../utils/http'

export class VenueController {
  private venueService: VenueService

  constructor(venueService?: VenueService) {
    this.venueService = venueService || new VenueService()
  }

  public getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        sendError(res, 401, 'Unauthorized: User context missing from request')
        return
      }
      const settings = await this.venueService.getSettingsForUser(userId)
      if (!settings) {
        sendError(res, 404, 'Venue not found for user')
        return
      }

      sendSuccess(res, 200, settings)
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while retrieving settings')
    }
  }

  public updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        sendError(res, 401, 'Unauthorized: User context missing from request')
        return
      }

      const updates = (req.body && (req.body.data ?? req.body)) || {}

      const result = await this.venueService.updateSettingsForUser(userId, updates)
      if (!result) {
        sendError(res, 404, 'Venue not found for user')
        return
      }

      sendSuccess(res, 200, result)
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while updating settings')
    }
  }

  public createVenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const venueData = req.body

      if (!venueData || !venueData.name) {
        sendError(res, 400, 'Bad Request: Venue name is required')
        return
      }

      const result = await this.venueService.createVenue(venueData)

      sendSuccess(res, 201, result)
    }
    catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while creating venue')
    }
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