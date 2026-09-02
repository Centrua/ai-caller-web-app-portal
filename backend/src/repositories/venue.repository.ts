import { Venue } from '../models/venue.model';
import { Op } from 'sequelize';

export class VenueRepository {
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
}