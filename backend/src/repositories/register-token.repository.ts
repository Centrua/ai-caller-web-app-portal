import { RegisterToken } from '../models/register-token.model';

export class RegisterTokenRepository {
  public static async create(data: { venue_id: number; prefix: string; token: string }): Promise<RegisterToken> {
    return await RegisterToken.create(data);
  }

  public static async edit(id: number, data: Partial<{ venue_id: number; prefix: string; token: string }>): Promise<RegisterToken | null> {
    const tokenRecord = await RegisterToken.findByPk(id);
    if (!tokenRecord) {
      return null;
    }
    return await tokenRecord.update(data);
  }

  public static async getByPrefix(prefix: string): Promise<RegisterToken | null> {
    return await RegisterToken.findOne({
      where: { prefix },
    });
  }

  public static async getByVenueId(venueId: number): Promise<RegisterToken[]> {
    return await RegisterToken.findAll({
      where: { venue_id: venueId },
    });
  }
}