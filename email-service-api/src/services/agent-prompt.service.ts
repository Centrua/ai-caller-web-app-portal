import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'

export class PromptService {
  private elevenLabsRepo: ElevenLabsRepository

  constructor(elevenLabsRepo?: ElevenLabsRepository) {
    this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
  }

  async getSystemPrompt(agentId: string): Promise<string | null> {
    const agentConfig = await this.elevenLabsRepo.getAgentConfig(agentId)

    const promptField =
      agentConfig?.conversation_config?.agent?.prompt?.prompt ??
      agentConfig?.agent?.prompt?.prompt ??
      null

    return promptField
  }
}

export default PromptService