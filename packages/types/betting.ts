/**
 * GoalMills Betting Intelligence & Odds Comparison Domain Models
 * Phase 1: Canonical Identities, Bookmakers, Normalized Odds & Affiliate Architecture
 */

export type GoalMillsEventId = `gm_event_${string}`;

export type ExternalOddsProvider =
  | 'ALLSPORTS'
  | 'API_FOOTBALL'
  | 'BETLOY'
  | 'BETRADAR'
  | 'INTERNAL';

export interface EventProviderMapping {
  id: string;
  goalMillsEventId: string;
  provider: ExternalOddsProvider | string;
  providerEventId: string;
  sport: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DISPUTED';
  lastVerifiedAt: string | Date;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type BookmakerStatus = 'ACTIVE' | 'INACTIVE' | 'RESTRICTED';

export interface Bookmaker {
  id: string; // canonical slug identifier e.g. "1xbet", "bet365"
  slug: string;
  displayName: string;
  legalName?: string;
  logoUrl: string;
  websiteUrl: string;
  countries: string[]; // ISO country codes or ["ALL"]
  supportedSports: string[];
  status: BookmakerStatus;
  externalProviderIds: Record<string, string>; // e.g. { allsports: "1xBet", betloy: "1xbet" }
  priorityRank: number;
  isFeatured?: boolean;
  isSponsored?: boolean;
  rating?: number;
  bonusText?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type MarketType =
  | '1X2'
  | 'DOUBLE_CHANCE'
  | 'OVER_UNDER'
  | 'OVER_UNDER_1_5'
  | 'OVER_UNDER_2_5'
  | 'OVER_UNDER_3_5'
  | 'BTTS'
  | 'BOTH_TEAMS_TO_SCORE'
  | 'DRAW_NO_BET'
  | 'ASIAN_HANDICAP'
  | 'EUROPEAN_HANDICAP'
  | 'CORRECT_SCORE'
  | 'CORNERS'
  | 'CARDS'
  | 'GOALSCORER'
  | 'CUSTOM';

export type OddsMarketType = MarketType;

export type SelectionType =
  | 'HOME'
  | 'DRAW'
  | 'AWAY'
  | 'HOME_OR_DRAW'
  | 'HOME_OR_AWAY'
  | 'DRAW_OR_AWAY'
  | 'OVER'
  | 'UNDER'
  | 'YES'
  | 'NO'
  | 'CUSTOM';

export type OddsFormat = 'DECIMAL' | 'FRACTIONAL' | 'AMERICAN';

export interface OddsQuote {
  id: string;
  eventId: string; // GoalMills event ID or provider ID
  bookmakerId: string; // Canonical bookmaker ID e.g. "1xbet"
  bookmakerName: string;
  marketType: MarketType;
  selection: SelectionType;
  selectionLabel: string; // User-facing label e.g. "Arsenal", "Over 2.5"
  line?: number; // e.g. 2.5 for Over/Under 2.5, -1.5 for Handicap
  odds: number; // Stored as decimal odds e.g. 1.95
  formattedOdds?: string;
  oddsFormat: OddsFormat;
  provider: ExternalOddsProvider | string;
  providerQuoteId?: string;
  isBestOdds?: boolean;
  capturedAt: string | Date;
  expiresAt?: string | Date;
}

export type AffiliateStatus = 'ACTIVE' | 'PAUSED' | 'DISABLED';

export interface AffiliateProgram {
  id: string;
  bookmakerId: string;
  provider: string; // Network or direct e.g. "DIRECT", "INCOME_ACCESS", "BETLOY"
  affiliateId: string;
  country?: string;
  sport?: string;
  trackingTemplate: string; // e.g. "https://1xbet.com/ref?aff={affiliateId}&subid={click_id}"
  status: AffiliateStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type DestinationType = 'HOMEPAGE' | 'EVENT' | 'REGISTRATION' | 'DEPOSIT';

export interface AffiliateLink {
  id: string;
  affiliateProgramId?: string;
  bookmakerId: string;
  country?: string;
  sport?: string;
  campaign: string;
  placement: string; // e.g. "odds_table", "best_odds", "match_details", "sidebar"
  destinationType: DestinationType;
  destinationUrl: string;
  trackingTemplate: string;
  status: AffiliateStatus;
  clickCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AffiliateClick {
  id: string;
  affiliateLinkId?: string;
  bookmakerId: string;
  eventId?: string;
  marketId?: string;
  selectionId?: string;
  placement: string;
  campaign: string;
  sessionId?: string;
  anonymousVisitorId?: string;
  country?: string;
  deviceType?: string;
  referrer?: string;
  destinationUrl: string;
  ipHash?: string;
  createdAt: string | Date;
}

export interface BettingFeatureFlags {
  oddsComparison: boolean;
  affiliateLinks: boolean;
  affiliateTracking: boolean;
  betloyIntegration: boolean;
  sponsoredBookmakers: boolean;
  oddsMovement: boolean;
}
