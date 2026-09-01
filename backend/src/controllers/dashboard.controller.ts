import { Request, Response } from 'express'
import { DashboardService } from '../services/dashboard.service'
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'

export class DashboardController {
  private dashboardService: DashboardService

  constructor(dashboardService?: DashboardService) {
    this.dashboardService = dashboardService || new DashboardService()
  }

  public getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const agentId = req.query.agent_id as string | undefined
      const metrics = await this.dashboardService.getDashboardMetrics(agentId)

      res.status(200).json({
        success: true,
        data: metrics,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error while retrieving dashboard metrics',
      })
    }
  }
}