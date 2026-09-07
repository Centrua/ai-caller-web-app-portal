import models from '../models'

export class LeadInquiryRepository {
  async getByThreadId(threadId: string, grantId?: string) {
    const where: any = { thread_id: threadId }
    if (grantId) where.grant_id = grantId
    return models.LeadInquiry.findOne({ where })
  }

  async getByEmail(email: string, grantId?: string) {
    const where: any = { email }
    if (grantId) where.grant_id = grantId
    return models.LeadInquiry.findOne({ where })
  }
}

export default new LeadInquiryRepository()
