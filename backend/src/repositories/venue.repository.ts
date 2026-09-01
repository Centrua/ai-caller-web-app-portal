import { Venue } from '../models/venue.model';
import { Op } from 'sequelize';

export class VenueRepository {
  async getAgentIdByUserId(userId: number): Promise<string | null> {
    const venue = await Venue.findOne({
      where: {
        associated_users: {
          [Op.contains]: [userId],
        },
      },
      attributes: ['elevenlabs_agent_id'],
    });

    return venue ? venue.elevenlabs_agent_id : null;
  }
}