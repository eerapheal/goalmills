import { describe, it, expect } from 'vitest';
import {
  getCanonicalBookmaker,
  normalizeBookmakerSlug,
  getAllCanonicalBookmakers,
  isBookmakerSupported,
} from '../bookmakerRegistry';
import { buildCanonicalEventId } from '../canonicalEventResolver';
import {
  normalizeLegacyFootballOdds,
  groupOddsByMarket,
} from '../oddsNormalizer';
import {
  buildSecureAffiliateRedirectUrl,
  isAuthorizedBookmakerDestination,
  renderAffiliateTrackingTemplate,
  hashIpForTelemetry,
} from '../affiliateEngine';
import { isBettingFeatureEnabled } from '../bettingFeatureFlags';
import { FootballOdds } from '@goalmills/types';

describe('GoalMills Betting Domain Foundation (Phase 1)', () => {
  describe('Authoritative Bookmaker Registry', () => {
    it('resolves all major canonical bookmakers with complete metadata', () => {
      const bookies = ['1xbet', 'bet365', 'betfair', 'betano', 'marathon', 'betvictor', 'williamhill', 'pinnacle', 'sbobet', 'sportybet', 'betway', '888sport'];

      for (const id of bookies) {
        const b = getCanonicalBookmaker(id);
        expect(b).toBeDefined();
        expect(b!.id).toBe(id);
        expect(b!.displayName).toBeTruthy();
        expect(b!.websiteUrl).toContain('http');
        expect(b!.status).toBe('ACTIVE');
        expect(b!.supportedSports.length).toBeGreaterThan(0);
      }
    });

    it('correctly normalizes ambiguous provider strings into canonical bookmaker slugs', () => {
      expect(normalizeBookmakerSlug('1xBet')).toBe('1xbet');
      expect(normalizeBookmakerSlug('Pncl')).toBe('pinnacle');
      expect(normalizeBookmakerSlug('Pinnacle')).toBe('pinnacle');
      expect(normalizeBookmakerSlug('Sbo')).toBe('sbobet');
      expect(normalizeBookmakerSlug('Sbobet')).toBe('sbobet');
      expect(normalizeBookmakerSlug('Betfair Exchange')).toBe('betfair');
      expect(normalizeBookmakerSlug('Marathonbet')).toBe('marathon');
      expect(normalizeBookmakerSlug('William Hill')).toBe('williamhill');
      expect(normalizeBookmakerSlug('SportyBet')).toBe('sportybet');
    });

    it('returns canonical bookmakers sorted by priority rank', () => {
      const list = getAllCanonicalBookmakers();
      expect(list.length).toBeGreaterThanOrEqual(10);
      for (let i = 0; i < list.length - 1; i++) {
        expect(list[i].priorityRank).toBeLessThanOrEqual(list[i + 1].priorityRank);
      }
    });

    it('verifies supported bookmaker operator presence', () => {
      expect(isBookmakerSupported('bet365')).toBe(true);
      expect(isBookmakerSupported('1xBet')).toBe(true);
      expect(isBookmakerSupported('unknown_gambling_site')).toBe(false);
    });
  });

  describe('Canonical Event Identity', () => {
    it('builds canonical GoalMills event ID deterministically', () => {
      const id1 = buildCanonicalEventId('football', 1058291);
      const id2 = buildCanonicalEventId('football', '1058291');
      const idCricket = buildCanonicalEventId('cricket', 'cric_9921');

      expect(id1).toBe('gm_event_football_1058291');
      expect(id2).toBe('gm_event_football_1058291');
      expect(idCricket).toBe('gm_event_cricket_cric_9921');
    });
  });

  describe('Normalized Odds Domain & Best Odds Engine', () => {
    const mockRawOdds: FootballOdds[] = [
      {
        match_id: '123456',
        odd_bookmakers: '1xBet',
        odd_1: '9.30',
        odd_x: '5.50',
        odd_2: '1.35',
        odd_1x: '3.20',
        odd_12: '1.18',
        odd_x2: '1.08',
        'ah-4.5_1': null,
        'ah-4.5_2': null,
        'ah-4_1': null,
        'ah-4_2': null,
        'ah-3.5_1': null,
        'ah-3.5_2': null,
        'ah-3_1': null,
        'ah-3_2': null,
        'ah-2.5_1': null,
        'ah-2.5_2': null,
        'ah-2_1': null,
        'ah-2_2': null,
        'ah-1.5_1': null,
        'ah-1.5_2': null,
        'ah-1_1': null,
        'ah-1_2': null,
        ah0_1: null,
        ah0_2: null,
        'ah+0.5_1': null,
        'ah+1_1': null,
        'ah+1_2': null,
        'ah+1.5_1': null,
        'ah+1.5_2': null,
        'ah+2_1': null,
        'ah+2_2': null,
        'ah+2.5_1': null,
        'ah+2.5_2': null,
        'ah+3_1': null,
        'ah+3_2': null,
        'ah+3.5_1': null,
        'ah+3.5_2': null,
        'ah+4_1': null,
        'ah+4_2': null,
        'ah+4.5_1': null,
        'ah+4.5_2': null,
        'o+0.5': null,
        'u+0.5': null,
        'o+1': null,
        'u+1': null,
        'o+1.5': null,
        'u+1.5': null,
        'o+2': null,
        'u+2': null,
        'o+2.5': '1.65',
        'u+2.5': '2.25',
        'o+3': null,
        'u+3': null,
        'o+3.5': null,
        'u+3.5': null,
        'o+4': null,
        'u+4': null,
        'o+4.5': null,
        'u+4.5': null,
        'o+5': null,
        'u+5': null,
        'o+5.5': null,
        'u+5.5': null,
        bts_yes: '1.90',
        bts_no: '1.90',
      },
      {
        match_id: '123456',
        odd_bookmakers: 'BetVictor',
        odd_1: '8.50',
        odd_x: '5.25',
        odd_2: '1.38',
        odd_1x: null,
        odd_12: null,
        odd_x2: null,
        'ah-4.5_1': null,
        'ah-4.5_2': null,
        'ah-4_1': null,
        'ah-4_2': null,
        'ah-3.5_1': null,
        'ah-3.5_2': null,
        'ah-3_1': null,
        'ah-3_2': null,
        'ah-2.5_1': null,
        'ah-2.5_2': null,
        'ah-2_1': null,
        'ah-2_2': null,
        'ah-1.5_1': null,
        'ah-1.5_2': null,
        'ah-1_1': null,
        'ah-1_2': null,
        ah0_1: null,
        ah0_2: null,
        'ah+0.5_1': null,
        'ah+1_1': null,
        'ah+1_2': null,
        'ah+1.5_1': null,
        'ah+1.5_2': null,
        'ah+2_1': null,
        'ah+2_2': null,
        'ah+2.5_1': null,
        'ah+2.5_2': null,
        'ah+3_1': null,
        'ah+3_2': null,
        'ah+3.5_1': null,
        'ah+3.5_2': null,
        'ah+4_1': null,
        'ah+4_2': null,
        'ah+4.5_1': null,
        'ah+4.5_2': null,
        'o+0.5': null,
        'u+0.5': null,
        'o+1': null,
        'u+1': null,
        'o+1.5': null,
        'u+1.5': null,
        'o+2': null,
        'u+2': null,
        'o+2.5': '1.70',
        'u+2.5': '2.15',
        'o+3': null,
        'u+3': null,
        'o+3.5': null,
        'u+3.5': null,
        'o+4': null,
        'u+4': null,
        'o+4.5': null,
        'u+4.5': null,
        'o+5': null,
        'u+5': null,
        'o+5.5': null,
        'u+5.5': null,
        bts_yes: '1.95',
        bts_no: '1.85',
      },
    ];

    it('normalizes legacy flat records into strongly-typed Quotes', () => {
      const quotes = normalizeLegacyFootballOdds(mockRawOdds, '123456');
      expect(quotes.length).toBeGreaterThan(0);

      const oneXTwo = quotes.filter((q) => q.marketType === '1X2');
      expect(oneXTwo.length).toBe(6); // 2 bookies * 3 selections (Home, Draw, Away)

      const homeQuotes = quotes.filter((q) => q.marketType === '1X2' && q.selection === 'HOME');
      expect(homeQuotes).toHaveLength(2);

      // 1xBet has 9.30, BetVictor has 8.50 -> 1xBet must be tagged as isBestOdds: true
      const oneXBetHome = homeQuotes.find((q) => q.bookmakerId === '1xbet');
      const betVictorHome = homeQuotes.find((q) => q.bookmakerId === 'betvictor');

      expect(oneXBetHome?.isBestOdds).toBe(true);
      expect(betVictorHome?.isBestOdds).toBe(false);

      // BetVictor has 1.38 away win vs 1xBet 1.35 -> BetVictor must be best odds
      const awayQuotes = quotes.filter((q) => q.marketType === '1X2' && q.selection === 'AWAY');
      const betVictorAway = awayQuotes.find((q) => q.bookmakerId === 'betvictor');
      const oneXBetAway = awayQuotes.find((q) => q.bookmakerId === '1xbet');

      expect(betVictorAway?.isBestOdds).toBe(true);
      expect(oneXBetAway?.isBestOdds).toBe(false);
    });

    it('groups quotes cleanly by market type', () => {
      const quotes = normalizeLegacyFootballOdds(mockRawOdds, '123456');
      const grouped = groupOddsByMarket(quotes);

      expect(grouped['1X2']).toBeDefined();
      expect(grouped['OVER_UNDER']).toBeDefined();
      expect(grouped['BTTS']).toBeDefined();
      expect(grouped['DOUBLE_CHANCE']).toBeDefined();
    });
  });

  describe('Affiliate Engine & Security', () => {
    it('builds internal redirect URL rather than exposing external affiliate links', () => {
      const redirectUrl = buildSecureAffiliateRedirectUrl({
        bookmakerId: '1xbet',
        campaign: 'match_preview',
        placement: 'odds_table',
        eventId: 'gm_event_football_123',
      });

      expect(redirectUrl).toContain('/api/affiliate/redirect/1xbet');
      expect(redirectUrl).toContain('campaign=match_preview');
      expect(redirectUrl).toContain('placement=odds_table');
    });

    it('validates authorized bookmaker destinations strictly against domain whitelist', () => {
      // Authorized 1xBet domains
      expect(isAuthorizedBookmakerDestination('https://1xbet.com/register', '1xbet')).toBe(true);
      expect(isAuthorizedBookmakerDestination('https://promo.1xbet.com/bonus', '1xbet')).toBe(true);

      // Open redirect attacks / unauthorized domains must be rejected
      expect(isAuthorizedBookmakerDestination('https://malicious-phishing.com', '1xbet')).toBe(false);
      expect(isAuthorizedBookmakerDestination('https://1xbet.com.malicious.com', '1xbet')).toBe(false);
      expect(isAuthorizedBookmakerDestination('https://bet365.com', '1xbet')).toBe(false); // Bookmaker mismatch
    });

    it('renders tracking template tokens correctly', () => {
      const template = 'https://1xbet.com/ref?aff={affiliateId}&subid={click_id}&tag={campaign}';
      const rendered = renderAffiliateTrackingTemplate(template, {
        affiliateId: 'aff_7721',
        clickId: 'clk_998822',
        campaign: 'premier_league',
      });

      expect(rendered).toBe('https://1xbet.com/ref?aff=aff_7721&subid=clk_998822&tag=premier_league');
      expect(rendered).not.toContain('{click_id}');
      expect(rendered).not.toContain('{affiliateId}');
    });

    it('hashes IP addresses deterministically for non-PII telemetry', () => {
      const hash1 = hashIpForTelemetry('192.168.1.100');
      const hash2 = hashIpForTelemetry('192.168.1.100');
      const hashOther = hashIpForTelemetry('10.0.0.1');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hashOther);
      expect(hash1).not.toContain('192.168.1.100'); // IP not stored in plaintext
    });
  });

  describe('Feature Flags Control', () => {
    it('evaluates default betting feature flags', () => {
      expect(isBettingFeatureEnabled('oddsComparison')).toBe(true);
      expect(isBettingFeatureEnabled('affiliateLinks')).toBe(true);
      expect(isBettingFeatureEnabled('betloyIntegration')).toBe(true); // Activated in Phase 3
      expect(isBettingFeatureEnabled('betScanner')).toBe(true);
      expect(isBettingFeatureEnabled('betAnalyzer')).toBe(true);
    });
  });
});
