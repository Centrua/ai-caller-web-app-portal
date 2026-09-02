import { VenueRepository } from '../repositories/venue.repository';

export class VenueService {
  private venueRepo = new VenueRepository();

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