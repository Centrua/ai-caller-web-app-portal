import { Request, Response } from 'express'
import { sendError } from './http'

export function getConversationId(req: Request): string | null {
  const conversationIdRaw = req.params.id
  const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw

  return conversationId ? String(conversationId) : null
}

export function requireConversationId(req: Request, res: Response): string | null {
  const conversationId = getConversationId(req)

  if (!conversationId) {
    sendError(res, 400, 'conversation id required')
    return null
  }

  return conversationId
}
