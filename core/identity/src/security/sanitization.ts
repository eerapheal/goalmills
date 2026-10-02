/**
 * Enterprise Cyber Security & Injection Prevention Layer
 * Protects against NoSQL / Mongo injection, SQL injection patterns, XSS attacks,
 * and malicious parameter payloads.
 */

// Characters with special meaning in Regular Expressions
const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

/**
 * Escapes any special regex characters so that user input
 * cannot be manipulated to create ReDoS (Regex Denial of Service)
 * or unintentional wildcards.
 */
export function escapeRegex(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text.replace(REGEX_SPECIAL_CHARS, '\\$&');
}

/**
 * Validates whether a given string is a valid 24-character hexadecimal MongoDB ObjectId
 */
export function isValidObjectId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Strips dangerous HTML tags and script injection attempts from text inputs
 */
export function sanitizeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*(["']).*?\1/gi, '') // inline event handlers like onclick=
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Recursively cleans incoming request body or query params to prevent NoSQL operator injection.
 * Removes keys starting with '$' or containing '.' (which can inject Mongo path expressions).
 */
export function sanitizeObject<T = any>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return sanitizeHtml(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      // Block MongoDB operator keys ($where, $gt, $ne, $regex, etc.) in raw user payload
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObj[key] = sanitizeObject((data as Record<string, any>)[key]);
    }
    return cleanObj as T;
  }

  return data;
}

/**
 * Standard Security Headers for Enterprise API & Web responses
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};
