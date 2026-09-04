import crypto from 'crypto';
import { RegisterTokenRepository } from '../repositories/register-token.repository';
import { RegisterToken } from '../models/register-token.model';
import { encrypt, decrypt } from '../utils/token-encryption.util';

export class RegisterTokenService {
  public static async create(venueId: number): Promise<{ tokenRecord: RegisterToken; plainToken: string }> {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const encryptedToken = encrypt(plainToken);

    const tokenRecord = await RegisterTokenRepository.create({
      venue_id: venueId,
      token: encryptedToken,
    });

    return { tokenRecord, plainToken };
  }

  public static async edit(id: number): Promise<{ tokenRecord: RegisterToken; plainToken: string } | null> {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const encryptedToken = encrypt(plainToken);

    const tokenRecord = await RegisterTokenRepository.edit(id, { token: encryptedToken });
    if (!tokenRecord) {
      return null;
    }

    return { tokenRecord, plainToken };
  }

  public static async getByVenueId(venueId: number): Promise<any[]> {
    const tokens = await RegisterTokenRepository.getByVenueId(venueId);
    
    return tokens.map((tokenRecord) => {
      const tokenJson = tokenRecord.toJSON() as any;
      try {
        tokenJson.token = decrypt(tokenRecord.token);
      } 
      catch (error) {
        tokenJson.token = tokenRecord.token;
      }
      return tokenJson;
    });
  }
}