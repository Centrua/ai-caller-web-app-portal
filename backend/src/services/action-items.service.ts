import { ActionItemRepository } from '../repositories/action-item.repository'

export class ActionItemsService {
  constructor(private readonly actionItemRepository = new ActionItemRepository()) {}

  // Return a simplified action item for the conversation.
  // We only expose whether there's a next actionable item and its completed state.
  public async getActionItems(conversationId: string, dcr: any): Promise<Array<any>> {
    // Keep previous behavior of extracting a single next actionable item from dcr
    if (!dcr) return []

    // Detect a single explicit next actionable marker similar to prior logic
    let candidateId: string | null = null
    let candidateValue: any = null

    if (Array.isArray(dcr)) {
      for (const it of dcr) {
        const id = String(it.data_collection_id || it.id || '')
        const o = it as any
        if (o?.nextActionableStep === true || o?.next_actionable_step === true) {
          candidateId = id || JSON.stringify(it)
          candidateValue = o.value ?? o
          break
        }
      }
    } else if (typeof dcr === 'object') {
      const explicit = Object.keys(dcr).find((k) => String(k).toLowerCase() === 'next actionable step' || String(k).toLowerCase() === 'next_actionable_step')
      if (explicit) {
        candidateId = explicit
        candidateValue = (dcr as any)[explicit]?.value ?? (dcr as any)[explicit]
      }
    } else {
      candidateId = 'value'
      candidateValue = dcr
    }

    if (!candidateId) return []

    const row = await this.actionItemRepository.findByConversationId(conversationId)
    const completed = !!row?.completed
    return [{ id: candidateId, label: candidateId, value: candidateValue, actionable: true, completed }]
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
