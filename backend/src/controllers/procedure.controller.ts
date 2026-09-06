import { Request, Response } from 'express'
import ProcedureService from '../services/procedure.service'

export class ProcedureController {
  private procedureService: ProcedureService

  constructor(procedureService?: ProcedureService) {
    this.procedureService = procedureService || new ProcedureService()
  }

  // GET /procedures?agentId=... or uses authenticated user's agent
  getProceduresForAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id

      const agentId = (req.query.agentId as string) || (req.body && req.body.agentId)
      const procedures = await this.procedureService.getAllProceduresForAgent(agentId, userId ? Number(userId) : undefined)

      res.status(200).json({ procedures })
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to retrieve procedures' })
    }
  }
}

export default ProcedureController
