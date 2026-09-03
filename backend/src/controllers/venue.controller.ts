import { Request, Response } from 'express'
import { VenueService } from '../services/venue.service'
import { sendError, sendSuccess } from '../utils/http'

export class VenueController {
  private venueService: VenueService

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

      const newVenue = await this.venueService.createVenue(venueData)

      sendSuccess(res, 201, { venue: newVenue })
    }
    catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while creating venue')
    }
  }

  public getAllVenues = async (req: Request, res: Response): Promise<void> => {
    try {
      const venues = await this.venueService.getAllVenues()

      sendSuccess(res, 200, { venues })
    }
    catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while retrieving venues')
    }
  }

  public addAssociatedUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const venueId = Number(req.params.id);
      const userId = Number(req.query.userId);

      if (!venueId || !userId) {
        sendError(res, 400, 'Bad Request: venueId and userId are required');
        return;
      }

      await this.venueService.addAssociatedUser(venueId, userId);

      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>User Approved</title></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding-top: 60px; background-color: #f4f5f7;">
            <div style="max-width: 400px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #111111; margin-top: 0;">User Successfully Approved</h2>
              <p style="color: #4b5563; font-size: 14px;">The user has been approved and linked to the venue.</p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">You can safely close this tab.</p>
            </div>
          </body>
        </html>
      `);
    }
    catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while associating user to venue');
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