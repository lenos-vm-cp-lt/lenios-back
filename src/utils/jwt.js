import crypto from 'crypto';
import jwt from 'jsonwebtoken';

if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

const JWT_SECRET = process.env.JWT_SECRET || 'lenios_secret_key_default_fallback_2026';

export function firmarToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

export function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
