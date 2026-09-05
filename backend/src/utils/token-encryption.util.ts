import crypto from 'crypto';

const ALGORITHM = 'aes-128-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;
const SECRET_KEY_HEX = process.env.TOKEN_ENCRYPTION_SECRET;

if (!SECRET_KEY_HEX) {
  throw new Error('TOKEN_ENCRYPTION_SECRET environment variable is missing!');
}

const SECRET_KEY = Buffer.from(SECRET_KEY_HEX, 'hex');

if (SECRET_KEY.length < 16) {
  throw new Error('TOKEN_ENCRYPTION_SECRET must be at least 16 bytes for aes-128-gcm.');
}

function fromBase64Url(str: string): Buffer {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64');
}

export function toBase64Url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY.subarray(0, 16), iv);
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return toBase64Url(combined);
}

export function decrypt(text: string): string {
  const buffer = fromBase64Url(text);
  
  const iv = buffer.subarray(0, IV_BYTES);
  const authTag = buffer.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const encryptedText = buffer.subarray(IV_BYTES + TAG_BYTES);

  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY.subarray(0, 16), iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}