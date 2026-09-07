import Outgoing from '../models/outgoing.model'

export async function createDraft(payload: any) {
  const draft = await Outgoing.create(payload)
  return draft
}

export async function findDraftById(id: number) {
  return Outgoing.findByPk(id)
}

export async function findDraftByOriginalThreadGrant(originalId: string | null, threadId: string | null, grantId: string | null) {
  const original = originalId ?? null
  const thread = threadId ?? null
  const grant = grantId ?? null

  return Outgoing.findOne({
    where: {
      original_message_id: original,
      thread_id: thread,
      grant_id: grant,
      status: 'draft',
    },
  })
}

export async function updateDraftStatus(id: number, status: string, extra: any = {}, time?: Date) {
  const draft = await findDraftById(id)
  if (!draft) return null
  draft.status = status
  if (time) {
    (draft as any).updated_at = time
  }
  Object.assign(draft as any, extra)
  await draft.save()
  return draft
}

export default { createDraft, findDraftById, findDraftByOriginalThreadGrant, updateDraftStatus }