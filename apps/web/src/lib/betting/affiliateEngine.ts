import crypto from 'crypto';
import { getCanonicalBookmaker } from './bookmakerRegistry';
import { isBettingFeatureEnabled } from './bettingFeatureFlags';

export interface AffiliateLinkParams {
  bookmakerId: string;
  campaign?: string;
  placement?: string;
  eventId?: string;
  marketId?: string;
  selectionId?: string;
  country?: string;
  sport?: string;
}

export interface ResolvedAffiliateDestination {
  approvedUrl: string;
  bookmakerId: string;
  campaign: string;
  placement: string;
}

/**
 * Generates an internal secure GoalMills redirect URL for a bookmaker action.
 * Never exposes raw external affiliate links to frontend components.
 */
export function buildSecureAffiliateRedirectUrl(params: AffiliateLinkParams): string {
  if (!isBettingFeatureEnabled('affiliateLinks')) {
    const canonical = getCanonicalBookmaker(params.bookmakerId);
    return canonical?.websiteUrl || '#';
  }

  const query = new URLSearchParams();
  if (params.campaign) query.set('campaign', params.campaign);
  if (params.placement) query.set('placement', params.placement);
  if (params.eventId) query.set('eventId', params.eventId);
  if (params.marketId) query.set('marketId', params.marketId);
  if (params.selectionId) query.set('selectionId', params.selectionId);
  if (params.country) query.set('country', params.country);
  if (params.sport) query.set('sport', params.sport);

  const qs = query.toString();
  return `/api/affiliate/redirect/${encodeURIComponent(params.bookmakerId)}${qs ? `?${qs}` : ''}`;
}

/**
 * Validates that an outbound destination URL strictly matches the authorized
 * bookmaker domain hostname. Prevents open redirect attacks.
 */
export function isAuthorizedBookmakerDestination(
  destinationUrl: string,
  bookmakerId: string
): boolean {
  try {
    const bookmaker = getCanonicalBookmaker(bookmakerId);
    if (!bookmaker || !bookmaker.websiteUrl) {
      return false;
    }

    const targetUrl = new URL(destinationUrl);
    const authorizedUrl = new URL(bookmaker.websiteUrl);

    // Strict domain matching (e.g. target host must end with authorized hostname)
    const targetHost = targetUrl.hostname.toLowerCase().replace(/^www\./, '');
    const authorizedHost = authorizedUrl.hostname.toLowerCase().replace(/^www\./, '');

    return targetHost === authorizedHost || targetHost.endsWith(`.${authorizedHost}`);
  } catch {
    return false;
  }
}

/**
 * Injects dynamic tracking tokens into an affiliate tracking template.
 */
export function renderAffiliateTrackingTemplate(
  template: string,
  tokens: {
    affiliateId: string;
    clickId: string;
    campaign?: string;
    placement?: string;
    sport?: string;
  }
): string {
  let rendered = template;
  rendered = rendered.replace(/{affiliateId}/g, encodeURIComponent(tokens.affiliateId));
  rendered = rendered.replace(/{click_id}/g, encodeURIComponent(tokens.clickId));
  rendered = rendered.replace(/{subid}/g, encodeURIComponent(tokens.clickId));
  rendered = rendered.replace(/{campaign}/g, encodeURIComponent(tokens.campaign || 'general'));
  rendered = rendered.replace(/{placement}/g, encodeURIComponent(tokens.placement || 'odds_table'));
  rendered = rendered.replace(/{sport}/g, encodeURIComponent(tokens.sport || 'football'));
  return rendered;
}

/**
 * Hashes client IP using SHA-256 with server salt for fraud/telemetry analysis
 * without persisting personal identifiable information (PII).
 */
export function hashIpForTelemetry(ip: string): string {
  const salt = process.env.TELEMETRY_SALT || 'goalmills_telemetry_salt_2026';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex').substring(0, 16);
}
