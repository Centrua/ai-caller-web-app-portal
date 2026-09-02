import { Request, Response } from 'express'
import { sendError } from './http'

export function getConversationId(req: Request): string | null {
  const conversationIdRaw = req.params.id
  const conversationId = Array.isArray(conversationIdRaw) ? conversationIdRaw[0] : conversationIdRaw

  return conversationId ? String(conversationId) : null
}

export function conversationBelongsToAgent(conversation: any, agentId: string | null | undefined): boolean {
  if (!agentId) return false
  if (!conversation || typeof conversation !== 'object') return false

  const conversationAgentId =
    conversation.agent_id ??
    conversation.agentId ??
    conversation.agent?.id ??
    conversation.metadata?.agent_id ??
    conversation.metadata?.agentId ??
    null

  return typeof conversationAgentId === 'string' && conversationAgentId === agentId
}

export function requireConversationId(req: Request, res: Response): string | null {
  const conversationId = getConversationId(req)

  if (!conversationId) {
    sendError(res, 400, 'conversation id required')
    return null
  }

  return conversationId
}

export function formatDuration(seconds?: number) {
  if (!seconds && seconds !== 0) return null
  const s = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(s / 60)
  const secs = s % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function normalizeConversation(conv: any) {
  const startUnix = conv.start_time_unix_secs ?? conv.metadata?.start_time_unix_secs ?? null
  const durationSecs = conv.call_duration_secs ?? conv.metadata?.call_duration_secs ?? null

  const transcript = Array.isArray(conv.transcript)
    ? conv.transcript
    : Array.isArray(conv.messages)
      ? conv.messages
      : undefined

  return {
    id: conv.conversation_id ?? conv.id ?? null,
    agentName: conv.agent_name ?? conv.agentName ?? null,
    startTime: startUnix ? new Date(startUnix * 1000).toISOString() : null,
    durationDisplay: formatDuration(durationSecs),
    callSummaryTitle: conv.call_summary_title ?? conv.callSummaryTitle ?? null,
    transcriptSummary: conv.transcript_summary ?? null,
    transcript,
    messages: transcript,
    hasAudio: typeof conv.has_audio === 'boolean' ? conv.has_audio : undefined,
    hasUserAudio: typeof conv.has_user_audio === 'boolean' ? conv.has_user_audio : undefined,
    hasResponseAudio: typeof conv.has_response_audio === 'boolean' ? conv.has_response_audio : undefined,
    hasAuxiliaryAudio: typeof conv.has_auxiliary_audio === 'boolean' ? conv.has_auxiliary_audio : undefined,
    analysis: conv.analysis ?? undefined,
    dataCollectionResults: conv.analysis?.data_collection_results ?? conv.data_collection_results ?? undefined,
  }
}
