import { VenueRepository } from '../repositories/venue.repository';

export class VenueService {
  private venueRepo = new VenueRepository();

  async getAgentIdFromUserId(userId: number): Promise<string | null> {
    return await this.venueRepo.getAgentIdByUserId(userId);
  }
}