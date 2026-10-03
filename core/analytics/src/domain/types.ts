export type AnalyticsEventType =
  | 'page_view'
  | 'article_read'
  | 'video_play'
  | 'video_complete'
  | 'odds_click'
  | 'affiliate_redirect'
  | 'sponsorship_impression'
  | 'sponsorship_click'
  | 'match_card_interaction'
  | 'poll_vote'
  | 'newsletter_signup_start'
  | 'newsletter_signup_complete';

export type EventSource = 'web' | 'admin' | 'mobile' | 'api' | 'email';

export interface DeviceContext {
  userAgent?: string;
  ipHash?: string;
  country?: string;
  city?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
  os?: string;
  browser?: string;
}

export interface BaseAnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  source: EventSource;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
  deviceContext: DeviceContext;
  url?: string;
  referrer?: string;
}

export interface ClickstreamEvent extends BaseAnalyticsEvent {
  elementId?: string;
  targetUrl?: string;
  dwellTimeMs?: number;
  scrollDepthPercentage?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface ImpressionEvent extends BaseAnalyticsEvent {
  placementId: string;
  campaignId?: string;
  advertiserId?: string;
  sport?: string;
  viewableDurationMs?: number;
}

export interface ConversionEvent extends BaseAnalyticsEvent {
  conversionType: 'affiliate_lead' | 'affiliate_sale' | 'subscription' | 'registration';
  partnerId: string;
  revenue?: number;
  currency?: string;
  transactionId?: string;
}

export interface AdvertiserMetric {
  advertiserId: string;
  campaignId: string;
  placementId: string;
  period: string; // e.g. '2026-10-02'
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  spend: number;
  ecpm: number;
  cpc: number;
}

export interface EngagementMetric {
  contentId: string;
  contentType: 'article' | 'video' | 'match' | 'standing';
  period: string;
  totalViews: number;
  uniqueVisitors: number;
  avgDwellTimeSeconds: number;
  completionRate: number;
  bounceRate: number;
}
