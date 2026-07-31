import crypto from 'crypto';
import jwt from 'jsonwebtoken';

if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

export function firmarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

export function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
