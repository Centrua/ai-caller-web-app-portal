import { Request, Response } from 'express'
import { AgentService } from '../services/agent.service'
import { sendError, sendSuccess } from '../utils/http'

export class AgentController {
  private agentService: AgentService

  constructor(agentService?: AgentService) {
    this.agentService = agentService || new AgentService()
  }

  // GET /system-prompt?agentId=...
  public getSystemPrompt = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id
      const agentId = (req.query.agentId as string) || undefined

      if (!agentId && !userId) {
        sendError(res, 401, 'Unauthorized: must provide agentId or be authenticated')
        return
      }

      const prompt = await this.agentService.getSystemPrompt(agentId, userId)

      if (prompt === null || typeof prompt === 'undefined') {
        sendError(res, 404, 'System prompt not found for agent')
        return
      }

      sendSuccess(res, 200, { prompt })
    } catch (error: any) {
      sendError(res, 500, error.message || 'Internal server error while retrieving system prompt')
    }
  }
}
