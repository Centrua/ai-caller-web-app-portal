import Outgoing from '../models/outgoing.model'

export async function createDraft(payload: any) {
  const draft = await Outgoing.create(payload)
  return draft
}

export async function findDraftById(id: number) {
  return Outgoing.findByPk(id)
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

export default { createDraft, findDraftById, updateDraftStatus }