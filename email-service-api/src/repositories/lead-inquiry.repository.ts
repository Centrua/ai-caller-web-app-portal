import LeadInquiry from '../models/lead-inquiry.model'

export async function findLeadInquiryByThreadAndGrant(threadId: string | null, grantId: string | null) {
  return LeadInquiry.findOne({ where: { thread_id: threadId, grant_id: grantId } })
}

export async function upsertLeadInquiryByThreadAndGrant(payload: any) {
  const { thread_id, grant_id, original_message_id, lead_info, status } = payload

  const existing = await LeadInquiry.findOne({ where: { thread_id, grant_id } })
  if (!existing) {
    const rec = await LeadInquiry.create(payload)
    return rec
  }

  // Merge lead_info: prefer new non-empty values over existing
  const existingInfo = existing.lead_info || {}
  const mergedInfo: any = { ...(existingInfo || {}) }
  if (lead_info && typeof lead_info === 'object') {
    for (const k of Object.keys(lead_info)) {
      const v = lead_info[k]
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        mergedInfo[k] = v
      }
    }
  }

  existing.lead_info = mergedInfo
  if (original_message_id) existing.original_message_id = original_message_id

  await existing.save()
  return existing
}

export default {
  findLeadInquiryByThreadAndGrant,
  upsertLeadInquiryByThreadAndGrant,
}
