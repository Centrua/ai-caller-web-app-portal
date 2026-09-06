import { Request, Response } from 'express'
import { VenueService } from '../services/venue.service'
import { sendError, sendSuccess } from '../utils/http'
import { VenueRepository } from '../repositories/venue.repository'
import Venue from '../models/venue.model'

export class VenueController {
  private venueService: VenueService
  private venueRepo = new VenueRepository()
  
  
  constructor(venueService?: VenueService) {
    this.venueService = venueService || new VenueService()
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

  public getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const venueId = Number(req.params.id)
      if (!venueId) {
        sendError(res, 400, 'Bad Request: venue id required')
        return
      }

      const venue = await this.venueRepo.findById(venueId)
      if (!venue) {
        sendError(res, 404, 'Venue not found')
        return
      }

      sendSuccess(res, 200, { auto_send_replies: !!venue.auto_send_replies })
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while retrieving settings')
    }
  }

  public updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const venueId = Number(req.params.id)
      if (!venueId) {
        sendError(res, 400, 'Bad Request: venue id required')
        return
      }

      const updates = req.body || {}
      const venue = await this.venueRepo.findById(venueId)
      if (!venue) {
        sendError(res, 404, 'Venue not found')
        return
      }

      if (typeof updates.auto_send_replies !== 'undefined') {
        venue.auto_send_replies = !!updates.auto_send_replies
      }

      await venue.save()
      sendSuccess(res, 200, { auto_send_replies: !!venue.auto_send_replies })
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while updating settings')
    }
  }

}