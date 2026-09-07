import models from '../models'

export class EmailConversationRepository {
  async getConversationsByGrantId(grantId: string) {
    return models.Conversation.findAll({
      where: { grant_id: grantId },
      include: [
        {
          model: models.Message,
          as: 'messages',
        },
        {
          model: models.Outgoing,
          as: 'outgoing',
        },
      ],
    })
  }

  async getConversationByThreadAndGrant(threadId: string, grantId: string) {
    return models.Conversation.findOne({
      where: { thread_id: threadId, grant_id: grantId },
      include: [
        {
          model: models.Message,
          as: 'messages',
        },
        {
          model: models.Outgoing,
          as: 'outgoing',
        },
      ],
    })
  }
}

export default new EmailConversationRepository()