import { Request, Response } from 'express'
import { DashboardService } from '../services/dashboard.service'

export class DashboardController {
  private dashboardService: DashboardService

  constructor(dashboardService?: DashboardService) {
    this.dashboardService = dashboardService || new DashboardService()
  }

  public getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User context missing from request',
        })
        return
      }

      const metrics = await this.dashboardService.getDashboardMetrics(userId)

      res.status(200).json({
        success: true,
        data: metrics,
      })
    } 
    catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error while retrieving dashboard metrics',
      })
    }
  }
}