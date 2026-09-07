import Outgoing from '../models/outgoing.model'

export async function findDraftById(id: number) {
  return await Outgoing.findByPk(id)
}

export default { findDraftById }