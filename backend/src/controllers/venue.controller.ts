import { Request, Response } from 'express'
import { VenueService } from '../services/venue.service'
import { sendError, sendSuccess } from '../utils/http'
import { VenueRepository } from '../repositories/venue.repository'
import Venue from '../models/venue.model'
import venueSettingsRepo from '../repositories/venue-settings.repository'

export class VenueController {
  private venueService: VenueService
  private venueRepo = new VenueRepository()
  
  
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

      const venueId = await this.venueService.getVenueIdFromUserId(userId)
      if (!venueId) {
        sendError(res, 404, 'Venue not found for user')
        return
      }

      const venue = await this.venueRepo.findById(venueId)
      if (!venue) {
        sendError(res, 404, 'Venue not found')
        return
      }

      const settings = await venueSettingsRepo.getSettingsByVenueId(venueId)
      // Prefer the settings row for `auto_send_replies` when present, otherwise fall back to the venues table.
      const autoSend = settings ? !!(settings as any).auto_send_replies : !!venue.auto_send_replies
      sendSuccess(res, 200, {
        auto_send_replies: autoSend,
        email_ai_routing: !!(settings && (settings as any).email_ai_routing),
      })
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

      const venueId = await this.venueService.getVenueIdFromUserId(userId)
      if (!venueId) {
        sendError(res, 404, 'Venue not found for user')
        return
      }

      const updates = req.body || {}
      const venue = await this.venueRepo.findById(venueId)
      if (!venue) {
        sendError(res, 404, 'Venue not found')
        return
      }

      // Update auto_send_replies on the settings row (preferred). Create the settings row if it doesn't exist.
      if (typeof updates.auto_send_replies !== 'undefined') {
        let settings = await venueSettingsRepo.getSettingsByVenueId(venueId)
        if (!settings) {
          await venueSettingsRepo.createDefaultSettings(venueId)
          settings = await venueSettingsRepo.getSettingsByVenueId(venueId)
        }
        if (settings) {
          await settings.update({ auto_send_replies: !!updates.auto_send_replies })
        } else {
          // Fall back to updating the venues table for backward compatibility
          venue.auto_send_replies = !!updates.auto_send_replies
          await venue.save()
        }
      }

      // Update email_ai_routing on the settings row (create if needed)
      if (typeof updates.email_ai_routing !== 'undefined') {
        let settings = await venueSettingsRepo.getSettingsByVenueId(venueId)
        if (!settings) {
          await venueSettingsRepo.createDefaultSettings(venueId)
          settings = await venueSettingsRepo.getSettingsByVenueId(venueId)
        }
        if (settings) {
          await settings.update({ email_ai_routing: !!updates.email_ai_routing })
        }
      }

      const settings = await venueSettingsRepo.getSettingsByVenueId(venueId)
      sendSuccess(res, 200, {
        auto_send_replies: !!venue.auto_send_replies,
        email_ai_routing: !!(settings && (settings as any).email_ai_routing),
      })
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