import { randomBytes, scrypt as deriveKey, timingSafeEqual } from 'node:crypto';

const PREFIX = 'scrypt-v1';
const N = 32768;
const KEY_LENGTH = 64;

function scrypt(pin: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    deriveKey(pin, salt, KEY_LENGTH, { N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export function isPinHash(value: string): boolean {
  return /^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(value);
}

export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4,6}$/.test(pin)) throw new Error('PIN must contain 4 to 6 digits.');
  const salt = randomBytes(16);
  const key = await scrypt(pin, salt);
  return `${PREFIX}$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  if (!/^\d{4,6}$/.test(pin) || !isPinHash(stored)) return false;
  const [, salt, expected] = stored.split('$');
  const key = await scrypt(pin, Buffer.from(salt, 'hex'));
  return timingSafeEqual(key, Buffer.from(expected, 'hex'));
}
