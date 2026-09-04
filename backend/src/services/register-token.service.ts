import crypto from 'crypto';
import { RegisterTokenRepository } from '../repositories/register-token.repository';
import { RegisterToken } from '../models/register-token.model';
import { encrypt, decrypt } from '../utils/token-encryption.util';

export class RegisterTokenService {
  public async create(venueId: number): Promise<{ tokenRecord: RegisterToken; plainToken: string }> {
    const prefix = crypto.randomBytes(4).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');
    const plainToken = `${prefix}.${secret}`;
    const encryptedSecret = encrypt(secret);

    const tokenRecord = await RegisterTokenRepository.create({
      venue_id: venueId,
      prefix,
      token: encryptedSecret,
    });

    return { tokenRecord, plainToken };
  }

  public async edit(id: number): Promise<{ tokenRecord: RegisterToken; plainToken: string } | null> {
    const prefix = crypto.randomBytes(4).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');
    const plainToken = `${prefix}.${secret}`;
    const encryptedSecret = encrypt(secret);

    const tokenRecord = await RegisterTokenRepository.edit(id, { 
      prefix, 
      token: encryptedSecret 
    });
    
    if (!tokenRecord) {
      return null;
    }

    return { tokenRecord, plainToken };
  }

  public async getByVenueId(venueId: number): Promise<any[]> {
    const tokens = await RegisterTokenRepository.getByVenueId(venueId);
    
    return tokens.map((tokenRecord) => {
      const tokenJson = tokenRecord.toJSON() as any;
      tokenJson.token = `${tokenRecord.prefix}.[PROTECTED]`;
      return tokenJson;
    });
  }

  public async verifyToken(plainToken: string): Promise<number | null> {
    const parts = plainToken.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [prefix, secret] = parts;
    const record = await RegisterTokenRepository.getByPrefix(prefix);
    
    if (!record) {
      return null;
    }

    try {
      const decryptedSecret = decrypt(record.token);
      if (decryptedSecret === secret) {
        return record.venue_id;
      }
    } 
    catch (error) {
      return null;
    }

    return null;
  }
}