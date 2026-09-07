import LeadInquiry from '../models/lead-inquiry.model'

export async function createLeadInquiry(payload: any) {
  const rec = await LeadInquiry.create(payload)
  return rec
}

export async function findLeadInquiryById(id: number) {
  return LeadInquiry.findByPk(id)
}

export async function findLeadInquiriesByThread(threadId: string) {
  return LeadInquiry.findAll({ where: { thread_id: threadId } })
}

export default { createLeadInquiry, findLeadInquiryById, findLeadInquiriesByThread }
