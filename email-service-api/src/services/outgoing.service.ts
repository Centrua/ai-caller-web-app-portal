import outgoingRepository from '../repositories/outgoing.repository'

export class OutgoingService {
  async editBody(id: number, body: string) {
    if (!id) return null
    try {
      return await outgoingRepository.editBody(id, body)
    } catch (err: any) {
      console.error(`Failed to edit body for draft ID ${id}:`, err?.message || err)
      return null
    }
  }
}

export default new OutgoingService()