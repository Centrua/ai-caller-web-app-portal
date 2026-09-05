import Message from '../models/message.model'

export async function findMessageById(id: string) {
  return Message.findByPk(id)
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

  // Use upsert for idempotent writes
  await Message.upsert(payload)
  return findMessageById(id)
}

export default { findMessageById, upsertMessageFromNylas }
