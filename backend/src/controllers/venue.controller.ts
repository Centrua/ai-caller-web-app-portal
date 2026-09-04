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

      if (!venueData || !venueData.name || !venueData.nylas_grant_id) {
        sendError(res, 400, 'Bad Request: Venue name and Nylas email connection are required')
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
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; padding-top: 60px; background-color: #f8fafc; margin: 0;">
            <div style="max-width: 400px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);">
              <div style="width: 48px; height: 48px; background-color: #4f46e5; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="color: #ffffff; font-size: 20px; font-weight: bold;">✓</span>
              </div>
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; margin-bottom: 12px;">User Successfully Approved</h2>
              <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 0; margin-bottom: 24px;">The user has been approved and linked to the venue.</p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">You can safely close this tab.</p>
            </div>
          </body>
        </html>
        `)
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