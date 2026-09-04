import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; 
const SECRET_KEY_HEX = process.env.TOKEN_ENCRYPTION_SECRET;

if (!SECRET_KEY_HEX) {
  throw new Error('TOKEN_ENCRYPTION_SECRET environment variable is missing!');
}

const SECRET_KEY = Buffer.from(SECRET_KEY_HEX, 'hex');

if (SECRET_KEY.length !== 32) {
  throw new Error('TOKEN_ENCRYPTION_SECRET must be a 64-character hex string (32 bytes) for aes-256-gcm.');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv) as crypto.CipherGCM;
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format.');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv) as crypto.DecipherGCM;
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}