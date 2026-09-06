import Message from '../models/message.model'

export async function findMessageById(id: string) {
  return Message.findByPk(id)
}

export async function findLatestMessageInThread(threadId: string | null, grantId: string | null) {
  if (!threadId) return null

  const where: any = { thread_id: threadId, grant_id: grantId }

  return Message.findOne({ where, order: [['created_at', 'DESC']] })
}

export async function upsertMessageFromNylas(obj: any) {
  const id = obj.id
  const payload: any = {
    id,
    thread_id: obj.thread_id || null,
    grant_id: obj.grant_id || null,
    snippet: obj.snippet || null,
    from: obj.from || null,
    to: obj.to || null,
  }

  await Message.upsert(payload)
  return findMessageById(id)
}

export default { findMessageById, findLatestMessageInThread, upsertMessageFromNylas }
