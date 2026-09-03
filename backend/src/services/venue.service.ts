import { VenueRepository } from '../repositories/venue.repository';
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository';
import { Venue } from '../models/venue.model';

export class VenueService {
  private venueRepo = new VenueRepository();
  private elevenLabsRepo = new ElevenLabsRepository();

  async createVenue(data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    elevenlabs_agent_payload?: any;
    elevenlabs_phone_number_id?: string | null;
    kb_document_id?: string | null;
    associated_user_ids?: number[];
  }): Promise<Venue> {
    let agentId: string | null = null;

    if (data.elevenlabs_agent_payload) {
      const agentResponse = await this.elevenLabsRepo.createAgent(data.elevenlabs_agent_payload);
      agentId = agentResponse.agent_id || null;
    }

    const venuePayload = {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      elevenlabs_agent_id: agentId,
      elevenlabs_phone_number_id: data.elevenlabs_phone_number_id ?? null,
      kb_document_id: data.kb_document_id ?? null,
      associated_user_ids: data.associated_user_ids ?? [],
    };

    return await this.venueRepo.createVenue(venuePayload);
  }

  async addAssociatedUser(venueId: number, userId: number): Promise<void> {
    await this.venueRepo.addAssociatedUser(venueId, userId);
  }

  async getAgentIdFromUserId(userId: number): Promise<string | null> {
    return await this.venueRepo.getAgentIdByUserId(userId);
  }

  async getNameFromUserId(userId: number): Promise<string | null> {
    return await this.venueRepo.getNameByUserId(userId);
  }

  async getKbDocumentIdFromUserId(userId: number): Promise<string | null> {
    return await this.venueRepo.getKbDocumentIdByUserId(userId);
  }

  async updateKbDocumentIdForUser(userId: number, kbDocumentId: string): Promise<void> {
    await this.venueRepo.updateKbDocumentIdByUserId(userId, kbDocumentId);
  }
}