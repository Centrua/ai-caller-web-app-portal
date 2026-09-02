import ActionItem from '../models/action-item.model'

export class ActionItemRepository {
  async findByConversationId(conversationId: string) {
    return ActionItem.findOne({ where: { conversationId } })
  }

  async upsertCompletion(conversationId: string, completed: boolean) {
    const [row, created] = await ActionItem.findOrCreate({
      where: { conversationId },
      defaults: { conversationId, completed },
    })

    if (!created) {
      row.completed = completed
      await row.save()
    }

    return { conversationId, completed, updatedAt: row.updatedAt }
  }
}
