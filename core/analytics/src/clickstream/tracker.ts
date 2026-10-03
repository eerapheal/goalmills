import type { ClickstreamEvent, DeviceContext } from '../domain/types';
import { isCrawlerOrBot } from '../security/botFilter';

/**
 * Parses user agent string into rough device type context.
 */
export function resolveDeviceContext(userAgent?: string, ipAddress?: string): DeviceContext {
  const botCheck = isCrawlerOrBot(userAgent);
  if (botCheck.isBot) {
    return {
      userAgent,
      deviceType: 'bot',
    };
  }

  const ua = userAgent || '';
  let deviceType: DeviceContext['deviceType'] = 'desktop';

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|android|blackberry|iemobile|kindle/i.test(ua)) {
    deviceType = 'mobile';
  }

  return {
    userAgent,
    deviceType,
  };
}

/**
 * Validates and normalizes raw clickstream payload.
 */
export function normalizeClickstreamEvent(
  raw: Partial<ClickstreamEvent> & { eventType: ClickstreamEvent['eventType']; userAgent?: string }
): ClickstreamEvent {
  const deviceContext = raw.deviceContext ?? resolveDeviceContext(raw.userAgent);

  return {
    id: raw.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    eventType: raw.eventType,
    source: raw.source || 'web',
    timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
    sessionId: raw.sessionId,
    userId: raw.userId,
    deviceContext,
    url: raw.url,
    referrer: raw.referrer,
    elementId: raw.elementId,
    targetUrl: raw.targetUrl,
    dwellTimeMs: raw.dwellTimeMs,
    scrollDepthPercentage: raw.scrollDepthPercentage,
    metadata: raw.metadata,
  };
}
