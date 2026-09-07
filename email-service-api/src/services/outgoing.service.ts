import Outgoing from '../models/outgoing.model'
import outgoingRepository from '../repositories/outgoing.repository'

export class OutgoingService {
  async editBody(id: number, body: string) {
    if (!id) return null
    try {
      const draft = await outgoingRepository.findDraftById(id)
      if (!draft) return null

      draft.body = body
      await draft.save()
      return draft
    } 
    catch (err: any) {
      console.error(`Failed to edit body for draft ID ${id}:`, err?.message || err)
      return null
    }
  }
}

export default new OutgoingService()