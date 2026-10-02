import crypto from 'crypto';
import type { VerificationTokenPayload } from '../domain/types';

/**
 * Generates a cryptographically secure URL-safe verification token
 * for double opt-in subscriptions or email management.
 */
export function generateVerificationToken(
  payload: VerificationTokenPayload,
  secretKey: string
): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(data);
  const signature = hmac.digest('hex');
  const encodedPayload = Buffer.from(data).toString('base64url');
  return `${encodedPayload}.${signature}`;
}

/**
 * Validates a verification token against the secret and checks expiration.
 */
export function verifyOptInToken(
  token: string,
  secretKey: string,
  maxAgeSeconds = 86400 * 7 // 7 days
): { valid: boolean; payload?: VerificationTokenPayload; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed token' };
  }

  const [encodedPayload, signature] = parts;

  try {
    const rawPayload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(rawPayload);
    const expectedSignature = hmac.digest('hex');

    // Constant-time comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload: VerificationTokenPayload = JSON.parse(rawPayload);
    const now = Date.now();
    if (now - payload.timestamp > maxAgeSeconds * 1000) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Token verification failed' };
  }
}
