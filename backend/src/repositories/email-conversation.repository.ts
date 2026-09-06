import Conversation from '../models/conversation.model'
import Message from '../models/message.model'

export class EmailConversationRepository {
  async getConversationsByGrantId(grantId: string) {
    return Conversation.findAll({
      where: { grant_id: grantId },
      include: [
        {
          model: Message,
          as: 'messages',
        },
      ],
    })
  }
}

export default new EmailConversationRepository()