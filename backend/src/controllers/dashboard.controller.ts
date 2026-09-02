import { Request, Response } from 'express'
import { DashboardService } from '../services/dashboard.service'
import { sendError, sendSuccess } from '../utils/http'

export class DashboardController {
  private dashboardService: DashboardService

  constructor(dashboardService?: DashboardService) {
    this.dashboardService = dashboardService || new DashboardService()
  }

  public getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        sendError(res, 401, 'Unauthorized: User context missing from request')
        return
      }

      const metrics = await this.dashboardService.getDashboardMetrics(userId)

      sendSuccess(res, 200, metrics)
    } 
    catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while retrieving dashboard metrics')
    }
  }
}