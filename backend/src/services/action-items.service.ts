import { ActionItemRepository } from '../repositories/action-item.repository'

export class ActionItemsService {
  constructor(private readonly actionItemRepository = new ActionItemRepository()) {}

  // Return the persisted action-item state for the conversation.
  // The UI only needs to know whether the item is actionable and whether it is done.
  public async getActionItems(conversationId: string, _dcr?: any): Promise<Array<any>> {
    const row = await this.actionItemRepository.findByConversationId(conversationId)
    if (!row) return []

    return [{
      id: conversationId,
      actionable: true,
      completed: !!row.completed,
    }]
  }

  public async setCompleted(conversationId: string, completed: boolean) {
    return this.actionItemRepository.upsertCompletion(conversationId, completed)
  }

  public async markDone(conversationId: string) {
    return this.setCompleted(conversationId, true)
  }

  public async markUndone(conversationId: string) {
    return this.setCompleted(conversationId, false)
  }

  public async getConversationFlags(conversationId: string) {
    const row = await this.actionItemRepository.findByConversationId(conversationId)
    return { completed: !!row?.completed, updatedAt: row?.updatedAt ?? null }
  }
}

export default new ActionItemsService()
