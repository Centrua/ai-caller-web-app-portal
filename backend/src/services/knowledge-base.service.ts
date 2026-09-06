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

    private async attachDocumentToAgent(targetAgentId: string, docId: string, name?: string): Promise<void> {
        try {
            const agentConfig = await this.elevenLabsRepo.getAgentConfig(targetAgentId)
            const existingKb = agentConfig.conversation_config?.agent?.prompt?.knowledge_base || agentConfig.knowledge_base || []

            if (!existingKb.some((doc: any) => doc.id === docId)) {
                const updatedKb = [...existingKb, { id: docId, name: name || 'File', type: 'file' }]

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
        catch (err: any) {
            console.error('[KnowledgeBase attachDocumentToAgent error]', err)
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
            await this.attachDocumentToAgent(targetAgentId, docId, name)
        }

        return newDoc
    }

    async uploadKnowledgeBaseFile(fileBuffer: Buffer, filename: string, userId?: number, agentId?: string): Promise<any> {
        try {
            const result = await this.elevenLabsRepo.uploadKnowledgeBaseFile(fileBuffer, filename)
            const docId = result?.id || result?.document_id

            let targetAgentId = agentId
            if (!targetAgentId && userId) {
                targetAgentId = (await this.venueService.getAgentIdFromUserId(userId)) || undefined
            }

            if (docId && targetAgentId) {
                await this.attachDocumentToAgent(targetAgentId, docId, filename)
            }

            return result
        }
        catch (error: any) {
            throw new Error(error.message || 'Failed to upload knowledge base file')
        }
    }

    async getKnowledgeBaseFiles(userId?: number, pageSize: number = 100): Promise<{ documents: any[]; has_more?: boolean }> {
        try {
            if (!userId) {
                return { documents: [] }
            }

            const agentId = await this.venueService.getAgentIdFromUserId(userId)
            if (!agentId) {
                return { documents: [] }
            }

            const agentConfig = await this.elevenLabsRepo.getAgentConfig(agentId)
            const attachedKbList: Array<{ id: string; name?: string; type?: string }> =
                agentConfig.conversation_config?.agent?.prompt?.knowledge_base || agentConfig.knowledge_base || []

            if (attachedKbList.length === 0) {
                return { documents: [] }
            }

            const attachedIds = new Set(attachedKbList.map((doc) => doc.id))

            const allFiles = await this.elevenLabsRepo.getKnowledgeBaseFiles(pageSize)
            const filteredDocuments = (allFiles.documents || []).filter((doc: any) => attachedIds.has(doc.id))

            return {
                documents: filteredDocuments.length > 0 ? filteredDocuments : attachedKbList,
                has_more: allFiles.has_more,
            }
        }
        catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve knowledge base files for user agent')
        }
    }

    async getKnowledgeBaseFileById(documentationId: string): Promise<string> {
        try {
            return await this.elevenLabsRepo.getKnowledgeBaseContent(documentationId)
        }
        catch (error: any) {
            throw new Error(error.message || 'Failed to download knowledge base file content')
        }
    }

    async deleteKnowledgeBaseFileById(documentationId: string, userId?: number, agentId?: string): Promise<any> {
        try {
            let targetAgentId = agentId
            if (!targetAgentId && userId) {
                targetAgentId = (await this.venueService.getAgentIdFromUserId(userId)) || undefined
            }

            if (targetAgentId) {
                try {
                    const agentConfig = await this.elevenLabsRepo.getAgentConfig(targetAgentId)
                    const existingKb = agentConfig.conversation_config?.agent?.prompt?.knowledge_base || agentConfig.knowledge_base || []
                    const updatedKb = existingKb.filter((doc: any) => doc.id !== documentationId)

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
                catch (err) {
                    console.warn('[KnowledgeBase] Failed to detach file from agent prior to deletion:', err)
                }
            }

            const result = await this.elevenLabsRepo.deleteKnowledgeBaseFileById(documentationId)
            return result
        }
        catch (error: any) {
            throw new Error(error.message || 'Failed to delete knowledge base file')
        }
    }
}