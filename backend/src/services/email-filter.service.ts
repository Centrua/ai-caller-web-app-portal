import type { NylasMessage } from '../repositories/http/nylas.repository'

const AUTOMATED_HEADER_NAMES = new Set([
  'auto-submitted',
  'list-id',
  'list-unsubscribe',
  'list-unsubscribe-post',
  'precedence',
])

const AUTOMATED_SENDER_PATTERN = /^(?:no[-_.]?reply|do[-_.]?not[-_.]?reply|mailer[-_.]?daemon)(?:@|$)/i
const PROMOTIONAL_PATTERN = /\b(?:sale|discount|coupon|promo(?:tion)?|clearance|offer|deal|save|limited time|special pricing)\b/i
const UNSUBSCRIBE_PATTERN = /\b(?:unsubscribe|manage preferences|email preferences|opt out)\b/i

export class EmailFilterService {
  private readonly blockedSenderDomains = new Set(
    (process.env.NYLAS_BLOCKED_SENDER_DOMAINS || '')
      .split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean)
  )

  shouldForward(message: NylasMessage, hasExistingConversation: boolean): boolean {
    if (this.hasAutomatedHeaders(message.headers)) return false

    const sender = message.from?.[0]?.email || ''
    if (this.isBlockedSenderDomain(sender)) return false
    if (AUTOMATED_SENDER_PATTERN.test(sender) && !hasExistingConversation) return false

    const content = `${message.subject || ''}\n${message.body || message.snippet || ''}`
    if (UNSUBSCRIBE_PATTERN.test(content) && PROMOTIONAL_PATTERN.test(content)) return false

    return true
  }

  private isBlockedSenderDomain(sender: string): boolean {
    const domain = sender.split('@')[1]?.toLowerCase()
    if (!domain) return false

    return [...this.blockedSenderDomains].some(
      (blockedDomain) => domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)
    )
  }

  private hasAutomatedHeaders(headers?: Record<string, string | undefined>): boolean {
    if (!headers) return false

    return Object.entries(headers).some(([name, value]) => {
      if (!AUTOMATED_HEADER_NAMES.has(name.toLowerCase())) return false
      if (name.toLowerCase() === 'precedence') return /bulk|list|junk/i.test(value || '')
      return true
    })
  }
}