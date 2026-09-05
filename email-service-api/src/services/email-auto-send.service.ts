import { NylasRepository } from '../repositories/http/nylas.repository'
import outgoingRepo from '../repositories/outgoing.repository'
import venueRepo from '../repositories/venue.repository'

export class AutoSendService {
  async decideAutoSend(grantId: string | null): Promise<boolean> {
    try {
      if (grantId) {
        const v = await venueRepo.getAutoSendByGrant(String(grantId))
        if (v !== null) return v
      }
    } catch (err: any) {
      console.warn('Failed to query venue auto-send from DB:', err?.message || err)
    }

    return false
  }

  async sendDraft(nylasRepo: NylasRepository, draft: any, obj: any, grantId: string | null): Promise<void> {
    try {
      const recipients = (obj.from && obj.from.map((f: any) => f.email)) || []
      // Preserve paragraphs and use CRLF line endings for email transport
      const bodyText = (draft as any).body || ''
      const bodyForSend = bodyText.replace(/\r?\n/g, '\r\n')
      const payload: any = { subject: (draft as any).subject, body: bodyForSend, to: recipients.map((r: string) => ({ email: r })) }
      payload.reply_to_message_id = obj.id
      const sendResp = await nylasRepo.sendMessage(grantId, payload)
      await outgoingRepo.updateDraftStatus((draft as any).id, 'sent', { nylas_response: sendResp })
    } catch (sendErr: any) {
      console.error('Auto-send failed for draft:', sendErr?.message || sendErr)
      try {
        await outgoingRepo.updateDraftStatus((draft as any).id, 'failed', { send_error: String(sendErr?.message || sendErr) })
      } catch (e: any) {
        console.warn('Failed to update draft status after send failure:', e?.message || e)
      }
    }
  }
}

const autoSendService = new AutoSendService()

export const decideAutoSend = (grantId: string | null) => autoSendService.decideAutoSend(grantId)
export const sendDraft = (nylasRepo: NylasRepository, draft: any, obj: any, grantId: string | null) => autoSendService.sendDraft(nylasRepo, draft, obj, grantId)

export default autoSendService
