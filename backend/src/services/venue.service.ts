import { VenueRepository } from '../repositories/venue.repository';
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository';
import { AuthService } from './auth.service';
import { Venue } from '../models/venue.model';

export class VenueService {
  private venueRepo = new VenueRepository();
  private elevenLabsRepo = new ElevenLabsRepository();
  private authService = new AuthService();

  async createVenue(data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    elevenlabs_agent_payload?: any;
    elevenlabs_phone_number_id?: string | null;
    kb_document_id?: string | null;
    google_refresh_token?: string | null;
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
      google_refresh_token: data.google_refresh_token ?? null,
      associated_user_ids: data.associated_user_ids ?? [],
    };

    return await this.venueRepo.createVenue(venuePayload);
  }

  async getAllVenues(): Promise<Venue[]> {
    return await this.venueRepo.getAllVenues();
  }

  async addAssociatedUser(venueId: number, userId: number): Promise<void> {
    await this.venueRepo.addAssociatedUser(venueId, userId);
    await this.authService.updateApprovalStatus(userId, true);
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