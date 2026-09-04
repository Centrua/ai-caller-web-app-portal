import { Venue } from '../models/venue.model';
import { Op } from 'sequelize';

export class VenueRepository {
  async createVenue(venueData: {
    name: string;
    email?: string | null;
    phone?: string | null;
    elevenlabs_agent_id?: string | null;
    kb_document_id?: string | null;
    associated_user_ids?: number[];
  }): Promise<Venue> {
    return await Venue.create(venueData as any);
  }

  async addAssociatedUser(venueId: number, userId: number): Promise<void> {
    const venue = await Venue.findByPk(venueId);
    if (!venue) {
      throw new Error('Venue not found');
    }

    const currentUsers = venue.associated_user_ids || [];
    if (!currentUsers.includes(userId)) {
      const updatedUsers = [...currentUsers, userId];
      venue.associated_user_ids = updatedUsers;
      venue.changed('associated_user_ids', true);
      await venue.save();
    }
  }

  async getAgentIdByUserId(userId: number): Promise<string | null> {
    const venue = await Venue.findOne({
      where: {
        associated_user_ids: {
          [Op.contains]: [userId],
        },
      },
      attributes: ['elevenlabs_agent_id'],
    });

    return venue ? venue.elevenlabs_agent_id : null;
  }

  async getVenueIdByUserId(userId: number): Promise<number | null> {
    const venue = await Venue.findOne({
      where: {
        associated_user_ids: {
          [Op.contains]: [userId],
        },
      },
      attributes: ['id'],
    });

    return venue?.id || null;
  }

  async getNameByUserId(userId: number): Promise<string | null> {
    const venue = await Venue.findOne({
      where: {
        associated_user_ids: {
          [Op.contains]: [userId],
        },
      },
      attributes: ['name'],
    });

    return venue ? venue.name : null;
  }

  async getKbDocumentIdByUserId(userId: number): Promise<string | null> {
    const venue = await Venue.findOne({
      where: {
        associated_user_ids: {
          [Op.contains]: [userId],
        },
      },
      attributes: ['kb_document_id'],
    });

    return venue ? venue.kb_document_id : null;
  }

  async updateKbDocumentIdByUserId(userId: number, kbDocumentId: string): Promise<void> {
    await Venue.update(
      { kb_document_id: kbDocumentId },
      {
        where: {
          associated_user_ids: {
            [Op.contains]: [userId],
          },
        },
      }
    );
  }

  async findById(venueId: number): Promise<Venue | null> {
    return Venue.findByPk(venueId);
  }
}