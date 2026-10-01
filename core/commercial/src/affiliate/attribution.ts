/**
 * GoalMills Affiliate Attribution & Link Generation
 */

export interface AffiliateAttributionParams {
  bookmakerSlug: string;
  targetUrl: string;
  sourcePage?: string;
  campaignId?: string;
  medium?: string;
}

export function buildAffiliateRedirectUrl(params: AffiliateAttributionParams): string {
  const url = new URL(params.targetUrl.startsWith('http') ? params.targetUrl : `https://${params.targetUrl}`);
  url.searchParams.set('utm_source', 'goalmills');
  url.searchParams.set('utm_medium', params.medium || 'sports_intel');
  if (params.campaignId) {
    url.searchParams.set('utm_campaign', params.campaignId);
  }
  if (params.sourcePage) {
    url.searchParams.set('utm_content', params.sourcePage);
  }
  return url.toString();
}

export function generateClickId(bookmakerSlug: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `click_${bookmakerSlug}_${timestamp}_${randomPart}`;
}
