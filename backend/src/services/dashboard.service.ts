import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueService } from './venue.service'
import EmailConversationService from './email-conversation.service'

export interface DashboardMetrics {
  callsToday: number
  callsThisWeek: number
  totalCalls: number
  averageCallDurationFormatted: string
  callsOverTime: Array<{ date: string; count: number }>
  emailsToday: number
  emailsThisWeek: number
  totalEmailConversations: number
  emailsOverTime: Array<{ date: string; count: number }>
}

export class DashboardService {
  private elevenLabsRepo: ElevenLabsRepository
  private venueService: VenueService

  constructor(elevenLabsRepo?: ElevenLabsRepository, venueService?: VenueService) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
    this.venueService = venueService || new VenueService()
  }

  async getDashboardMetrics(userId?: number): Promise<DashboardMetrics> {
    let targetAgentId;

    if (!targetAgentId && userId) {
      targetAgentId = (await this.venueService.getAgentIdFromUserId(userId)) || undefined
    }

    if (!targetAgentId) {
      throw new Error('Agent ID could not be found for the given user or request.')
    }

    // Call the repository with filters; repository returns { conversations, has_more, next_cursor }
    const repoResp = await this.elevenLabsRepo.getConversations({ agent_id: targetAgentId, page_size: 100 })
    const conversations = Array.isArray(repoResp?.conversations) ? repoResp.conversations : []

    const nowSecs = Math.floor(Date.now() / 1000)
    const oneDayAgoSecs = nowSecs - 86400
    const oneWeekAgoSecs = nowSecs - 604800

    let totalDurationSecs = 0
    let successfulCallsCount = 0
    let callsToday = 0
    let callsThisWeek = 0

    const dailyBuckets: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().split('T')[0]
      dailyBuckets[dateKey] = 0
    }

    conversations.forEach((conv) => {
      const startTime = conv.start_time_unix_secs || 0
      const duration = conv.call_duration_secs || 0

      totalDurationSecs += duration

      if (['success', 'done', 'completed'].includes(conv.status?.toLowerCase())) {
        successfulCallsCount++
      }

      if (startTime >= oneDayAgoSecs) {
        callsToday++
      }
      if (startTime >= oneWeekAgoSecs) {
        callsThisWeek++
      }

      const dateKey = new Date(startTime * 1000).toISOString().split('T')[0]
      if (dailyBuckets[dateKey] !== undefined) {
        dailyBuckets[dateKey] += 1
      }
    })

    // Email stats: query conversations/messages from DB via EmailConversationService
    let emailsToday = 0
    let emailsThisWeek = 0
    let totalEmailConversations = 0
    let totalEmailMessages = 0
    const emailBuckets: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().split('T')[0]
      emailBuckets[dateKey] = 0
    }

    try {
      const emailConvs: any[] = await EmailConversationService.getConversationsByUserId(userId as number)
      totalEmailConversations = Array.isArray(emailConvs) ? emailConvs.length : 0

      emailConvs.forEach((conv) => {
        const messages = Array.isArray(conv.messages) ? conv.messages : []
        totalEmailMessages += messages.length

        messages.forEach((msg: any) => {
          const createdAt = msg.createdAt ? new Date(msg.createdAt) : null
          if (!createdAt) return
          const tsSecs = Math.floor(createdAt.getTime() / 1000)
          if (tsSecs >= oneDayAgoSecs) emailsToday++
          if (tsSecs >= oneWeekAgoSecs) emailsThisWeek++

          const dateKey = createdAt.toISOString().split('T')[0]
          if (emailBuckets[dateKey] !== undefined) {
            emailBuckets[dateKey] += 1
          }
        })
      })
    } catch (err) {
      // swallow DB errors and return zeros for email metrics
      emailsToday = 0
      emailsThisWeek = 0
      totalEmailConversations = 0
      totalEmailMessages = 0
    }

    const totalCalls = conversations.length
    const avgDurationSecs = totalCalls > 0 ? Math.round(totalDurationSecs / totalCalls) : 0
    const minutes = Math.floor(avgDurationSecs / 60)
    const seconds = avgDurationSecs % 60

    const successRateValue = totalCalls > 0 ? Math.round((successfulCallsCount / totalCalls) * 100) : 0

    const callsOverTime = Object.entries(dailyBuckets).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }))

    const emailsOverTime = Object.entries(emailBuckets).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }))

    return {
      callsToday,
      callsThisWeek,
      totalCalls,
      averageCallDurationFormatted: `${minutes}m ${seconds}s`,
      callsOverTime,
      emailsToday,
      emailsThisWeek,
      totalEmailConversations,
      emailsOverTime,
    }
  }
}