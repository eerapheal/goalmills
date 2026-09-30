/**
 * Server-Only Betloy Provider Configuration.
 * Under NO circumstances should this module or BETLOY_API_KEY be imported by client components.
 */

if (typeof window !== 'undefined' && process.env.VITEST !== 'true' && process.env.NODE_ENV !== 'test') {
  throw new Error('FATAL: Betloy provider configuration must not be imported in browser/client runtime.');
}

export interface BetloyConfig {
  apiUrl: string;
  apiKey: string;
  timeoutMs: number;
  enabled: boolean;
}

export function getBetloyConfig(): BetloyConfig {
  const apiUrl = (process.env.BETLOY_API_URL || 'https://betloy.com/api').replace(/\/+$/, '');
  const apiKey = process.env.BETLOY_API_KEY || '';
  const timeoutMs = parseInt(process.env.BETLOY_TIMEOUT_MS || '8000', 10);
  const enabled = process.env.BETLOY_ENABLED !== 'false' && Boolean(apiKey);

  return {
    apiUrl,
    apiKey,
    timeoutMs: isNaN(timeoutMs) ? 8000 : timeoutMs,
    enabled,
  };
}
