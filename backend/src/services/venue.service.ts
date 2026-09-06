import { VenueRepository } from '../repositories/venue.repository';
import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository';
import { RegisterTokenService } from './register-token.service';
import { Venue } from '../models/venue.model';
import venueSettingsRepo from '../repositories/venue-settings.repository';

export class VenueService {
  private venueRepo = new VenueRepository();
  private elevenLabsRepo = new ElevenLabsRepository();
  private registerTokenService = new RegisterTokenService();

  async createVenue(data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    kb_document_id?: string | null;
    nylas_grant_id?: string | null;
    associated_user_ids?: number[];
  }): Promise<{ venue: Venue; plainToken: string }> {
    let agentId: string | null = null;

    const templateAgentId = process.env.ELEVENLABS_TEMPLATE_AGENT_ID;
    if (!templateAgentId) {
      throw new Error('ElevenLabs template agent is not configured');
    }

    const agentResponse = await this.elevenLabsRepo.duplicateAgent(templateAgentId, data.name);
    agentId = agentResponse.agent_id || null;

    if (!agentId) {
      throw new Error('ElevenLabs did not return a duplicated agent ID');
    }

    const venuePayload = {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      nylas_grant_id: data.nylas_grant_id ?? null,
      elevenlabs_agent_id: agentId,
      kb_document_id: data.kb_document_id ?? null,
      associated_user_ids: data.associated_user_ids ?? [],
    };

    const venue = await this.venueRepo.createVenue(venuePayload);
    try {
      await venueSettingsRepo.createDefaultSettings(venue.id);
    } catch (err) {
      // swallow setting creation errors so venue creation can still succeed;
      // higher-level logging/monitoring should capture this in production
    }
    
    const { plainToken } = await this.registerTokenService.create(venue.id);

    return { venue, plainToken };
  }

  async addAssociatedUser(venueId: number, userId: number): Promise<void> {
    await this.venueRepo.addAssociatedUser(venueId, userId);
  }

  async getAgentIdFromUserId(userId: number): Promise<string | null> {
    return await this.venueRepo.getAgentIdByUserId(userId);
  }

  async getVenueIdFromUserId(userId: number): Promise<number | null> {
    return await this.venueRepo.getVenueIdByUserId(userId);
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