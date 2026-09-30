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
  betScanner?: boolean;
  betAnalyzer?: boolean;
  betEditor?: boolean;
  betTrimmer?: boolean;
}

// ---------------------------------------------------------------------------
// Phase 3: Bet Intelligence & BetTools Provider Abstraction
// ---------------------------------------------------------------------------

export interface BetSlipSelection {
  market: string;
  selection: string;
  odds: number;
  probability?: number;
  isBanker?: boolean;
}

export interface BetSlipLeg {
  id: string;
  fixture: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  league?: string;
  kickoffTime?: string;
  status: 'PENDING' | 'WON' | 'LOST' | 'VOID';
  selection: BetSlipSelection;
}

export interface DecodedBetSlip {
  code: string;
  sourceBookmaker: string;
  totalOdds: number;
  legCount: number;
  legs: BetSlipLeg[];
  potentialPayout?: number;
  currency?: string;
  generatedAt?: string;
}

export interface BookmakerScanQuote {
  bookmakerId: string;
  bookmakerName: string;
  bookmakerLogo?: string;
  totalOdds: number;
  differencePercent?: number; // e.g. +14.2% vs baseline
  isBestOdds: boolean;
  affiliateUrl?: string;
  supportedLegCount: number;
  totalLegCount: number;
  availableMarkets: string[];
}

export interface BetScanRequest {
  code: string;
  sourceBookmaker: string;
  stake?: number;
  country?: string;
}

export interface NormalizedBetScanResult {
  code: string;
  sourceBookmaker: string;
  baselineOdds: number;
  stake: number;
  scannedAt: string;
  legs: BetSlipLeg[];
  quotes: BookmakerScanQuote[];
  bestBookmaker: BookmakerScanQuote;
}

export interface RiskFactor {
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface BetAnalysisRequest {
  code: string;
  sourceBookmaker: string;
  stake?: number;
}

export interface NormalizedBetAnalysisResult {
  code: string;
  sourceBookmaker: string;
  overallRiskScore: number; // 0 (safest) to 100 (extreme risk)
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  estimatedWinProbabilityPercent: number;
  recommendedMaxStakePercent?: number;
  expectedValueIndicator: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  riskFactors: RiskFactor[];
  strengths: string[];
  disclaimer: string;
  analyzedAt: string;
}

export interface BetConvertRequest {
  code: string;
  sourceBookmaker: string;
  targetBookmaker: string;
}

export interface NormalizedBetConvertResult {
  originalCode: string;
  sourceBookmaker: string;
  targetBookmaker: string;
  targetCode: string;
  convertedOdds: number;
  originalOdds: number;
  oddsDifferencePercent: number;
  matchedLegs: number;
  totalLegs: number;
  convertedAt: string;
}

export interface TrimmedLegDifference {
  legId: string;
  fixture: string;
  action: 'REMOVED' | 'ADJUSTED_MARKET' | 'KEPT';
  reason: string;
  originalOdds: number;
  adjustedOdds?: number;
}

export interface BetTrimRequest {
  code: string;
  sourceBookmaker: string;
  riskTolerance?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

export interface NormalizedBetTrimResult {
  originalCode: string;
  trimmedCode?: string;
  sourceBookmaker: string;
  originalOdds: number;
  trimmedOdds: number;
  originalLegCount: number;
  trimmedLegCount: number;
  riskReductionPercent: number;
  estimatedWinProbabilityBefore: number;
  estimatedWinProbabilityAfter: number;
  differences: TrimmedLegDifference[];
  disclaimer: string;
  trimmedAt: string;
}

export interface ProviderBookmakerSummary {
  id: string;
  slug: string;
  name: string;
  country: string;
  isActive: boolean;
  supportedFeatures: {
    scan: boolean;
    decode: boolean;
    convert: boolean;
    analyze: boolean;
    trim: boolean;
  };
}

export interface ProviderHealthStatus {
  providerId: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  lastChecked: string;
  circuitBreakerStatus: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  error?: string;
}

export interface ProviderUsageStats {
  providerId: string;
  requestsToday: number;
  limitDaily?: number;
  rateLimitRemaining?: number;
  resetAt?: string;
}

export interface BookmakerProviderMapping {
  id: string;
  bookmakerId: string;
  provider: ExternalOddsProvider | string;
  providerBookmakerId: string;
  country?: string;
  supportedMarkets: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'UNSUPPORTED';
  lastSyncedAt: string | Date;
}

/**
 * Universal Provider Contract for Bet Tools & Intelligence.
 * Isolates Betloy and future external providers behind an interchangeable interface.
 */
export interface BetToolsProvider {
  readonly providerId: string;
  decodeBet(request: { code: string; sourceBookmaker: string }): Promise<DecodedBetSlip>;
  scanOdds(request: BetScanRequest): Promise<NormalizedBetScanResult>;
  analyzeBet(request: BetAnalysisRequest): Promise<NormalizedBetAnalysisResult>;
  convertBet(request: BetConvertRequest): Promise<NormalizedBetConvertResult>;
  trimBet(request: BetTrimRequest): Promise<NormalizedBetTrimResult>;
  getBookmakers(): Promise<ProviderBookmakerSummary[]>;
  healthCheck(): Promise<ProviderHealthStatus>;
  getUsage?(): Promise<ProviderUsageStats>;
}

