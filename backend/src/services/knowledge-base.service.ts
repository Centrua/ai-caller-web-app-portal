import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { VenueService } from './venue.service'

export class KnowledgeBaseService {
    private elevenLabsRepo: ElevenLabsRepository
    private venueService: VenueService

    constructor(
        elevenLabsRepo?: ElevenLabsRepository,
        venueService?: VenueService
    ) {
        this.elevenLabsRepo = elevenLabsRepo || new ElevenLabsRepository()
        this.venueService = venueService || new VenueService()
    }

    private async resolveAgentId(agentId?: string, userId?: number): Promise<string> {
        let targetAgentId = agentId

        if (!targetAgentId && userId) {
            targetAgentId = (await this.venueService.getAgentIdFromUserId(userId)) || undefined
        }

        if (!targetAgentId) {
            throw new Error('Agent ID could not be found for the given user or request.')
        }

        return targetAgentId
    }

    async getCompiledKnowledgeBaseText(userId?: number): Promise<string> {
        if (!userId) {
            return ''
        }

        const kbDocumentId = await this.venueService.getKbDocumentIdFromUserId(userId)
        if (!kbDocumentId) {
            return ''
        }

        try {
            const content = await this.elevenLabsRepo.getKnowledgeBaseContent(kbDocumentId)
            return content;
        }
        catch {
            throw new Error('Failed to retrieve knowledge base document')
        }
    }

    async createOrUpdateKnowledgeBaseText(name: string, text: string, userId?: number, agentId?: string): Promise<any> {
        const targetAgentId = await this.resolveAgentId(agentId, userId)
        const kbDocumentId = userId ? await this.venueService.getKbDocumentIdFromUserId(userId) : null

        if (kbDocumentId) {
            try {
                return await this.elevenLabsRepo.updateKnowledgeBaseDocument(kbDocumentId, name, text)
            }
            catch {
                throw new Error('Failed to update knowledge base document')
            }
        }
        else {
            return await this.createNewAndAttach(targetAgentId, userId, name, text)
        }
    }

    private async createNewAndAttach(targetAgentId: string, userId: number | undefined, name: string, text: string): Promise<any> {
        const newDoc = await this.elevenLabsRepo.createKnowledgeBaseDocument(name, text)
        const docId = newDoc?.id || newDoc?.document_id

        if (!docId) {
            throw new Error('Failed to create knowledge base document')
        }

        if (userId) {
            await this.venueService.updateKbDocumentIdForUser(userId, docId)
        }

        if (targetAgentId) {
            try {
                const agentConfig = await this.elevenLabsRepo.getAgentConfig(targetAgentId)
                const existingKb = agentConfig.conversation_config?.agent?.prompt?.knowledge_base || agentConfig.knowledge_base || []

                if (!existingKb.some((doc: any) => doc.id === docId)) {
                    const updatedKb = [...existingKb, { id: docId, type: 'file' }]

                    await this.elevenLabsRepo.updateAgentConfig(targetAgentId, {
                        conversation_config: {
                            ...agentConfig.conversation_config,
                            agent: {
                                ...agentConfig.conversation_config?.agent,
                                prompt: {
                                    ...agentConfig.conversation_config?.agent?.prompt,
                                    knowledge_base: updatedKb,
                                },
                            },
                        },
                    })
                }
            }
            catch {
                // Ignore or log agent-side attachment error if network/config format varies
            }
        }

        return newDoc
    }
}