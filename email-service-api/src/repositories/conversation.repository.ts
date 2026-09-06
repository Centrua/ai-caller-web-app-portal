import Conversation from '../models/conversation.model'

export async function findConversationByThreadAndGrant(threadId: string, grantId: string) {
  return Conversation.findOne({ where: { thread_id: threadId, grant_id: grantId } })
}

export async function createConversationFromMessage(message: any) {
  const convo = await Conversation.create({
    thread_id: message.thread_id,
    grant_id: message.grant_id,
    subject: message.subject || null,
  })
  return convo
}

export async function updateConversationFromMessage(convo: Conversation, message: any) {
  convo.subject = message.subject || convo.subject
  await convo.save()
  return convo
}

export default {
  findConversationByThreadAndGrant,
  createConversationFromMessage,
  updateConversationFromMessage,
}
