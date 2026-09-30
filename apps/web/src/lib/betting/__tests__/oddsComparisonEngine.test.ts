import { describe, it, expect } from 'vitest';
import {
  formatOdds,
  toDecimal,
  toFractional,
  toAmerican,
  calculateMarketMargin,
  detectOddsMovement,
  computeBestOdds,
  buildMarketComparison,
  extractAllMarketComparisons,
  buildCompleteOddsMatrix,
  BookmakerMarketEntry,
} from '../oddsComparisonEngine';
import {
  sortBookmakerEntries,
  DEFAULT_COMMERCIAL_DISCLOSURE,
} from '../commercialPlacement';
import { FootballOdds } from '@goalmills/types';

describe('GoalMills Odds Comparison Engine & Math (Phase 2)', () => {
  describe('Odds Format Converters', () => {
    it('formats decimal odds correctly', () => {
      expect(toDecimal(2.5)).toBe('2.50');
      expect(toDecimal(1.333)).toBe('1.33');
      expect(formatOdds(3.0, 'decimal')).toBe('3.00');
    });

    it('formats american odds accurately for favourites and underdogs', () => {
      // Decimal >= 2.0 (Underdog / Plus money)
      expect(toAmerican(2.5)).toBe('+150');
      expect(toAmerican(3.0)).toBe('+200');
      expect(formatOdds(2.1, 'american')).toBe('+110');

      // Decimal < 2.0 (Favourite / Minus money)
      // For 1.50: -100 / (1.50 - 1.0) = -200
      expect(toAmerican(1.5)).toBe('-200');
      // For 1.25: -100 / (1.25 - 1.0) = -400
      expect(toAmerican(1.25)).toBe('-400');
    });

    it('formats fractional odds matching standard sports betting fractions', () => {
      expect(toFractional(2.5)).toBe('6/4');
      expect(toFractional(2.0)).toBe('Evs');
      expect(toFractional(1.5)).toBe('1/2');
      expect(toFractional(3.0)).toBe('2/1');
      expect(toFractional(4.0)).toBe('3/1');
    });

    it('handles fallback and edge-case inputs gracefully', () => {
      expect(formatOdds(0)).toBe('1.00');
      expect(formatOdds(-2.5)).toBe('1.00');
      expect(formatOdds(NaN)).toBe('1.00');
    });
  });

  describe('Overround & Bookmaker Margin Math', () => {
    it('calculates fair market overround and payout percentage', () => {
      // 2-way market: 2.00 vs 2.00 -> 1/2 + 1/2 = 1.0 (0% margin, 100% payout)
      const res1 = calculateMarketMargin([2.0, 2.0]);
      expect(res1.marginPercent).toBe(0);
      expect(res1.payoutPercent).toBe(100);

      // Typical 3-way market: 2.50, 3.40, 2.80
      // 1/2.50 + 1/3.40 + 1/2.80 = 0.40 + 0.2941 + 0.3571 = 1.0512
      // Margin = 5.1%, Payout = 95.1%
      const res2 = calculateMarketMargin([2.5, 3.4, 2.8]);
      expect(res2.marginPercent).toBeCloseTo(5.1, 0.2);
      expect(res2.payoutPercent).toBeCloseTo(95.1, 0.2);
    });

    it('handles single or invalid odds lists gracefully', () => {
      const emptyRes = calculateMarketMargin([]);
      expect(emptyRes.marginPercent).toBe(0);
      expect(emptyRes.payoutPercent).toBe(100);

      const invalidRes = calculateMarketMargin([0.8, -1]);
      expect(invalidRes.marginPercent).toBe(0);
      expect(invalidRes.payoutPercent).toBe(100);
    });
  });

  describe('Odds Movement Detection', () => {
    it('identifies lengthening odds (UP) when delta > +0.02', () => {
      const res = detectOddsMovement(2.15, 2.05);
      expect(res.movement).toBe('UP');
      expect(res.changePercent).toBeGreaterThan(0);
    });

    it('identifies shortening odds (DOWN) when delta < -0.02', () => {
      const res = detectOddsMovement(1.90, 2.05);
      expect(res.movement).toBe('DOWN');
      expect(res.changePercent).toBeLessThan(0);
    });

    it('identifies stable odds (STABLE) within threshold', () => {
      const res1 = detectOddsMovement(2.01, 2.00);
      expect(res1.movement).toBe('STABLE');
      expect(res1.changePercent).toBe(0);

      const res2 = detectOddsMovement(2.00, undefined);
      expect(res2.movement).toBe('STABLE');
    });
  });

  describe('Mathematical Best Odds Computation', () => {
    const mockBookmakers: BookmakerMarketEntry[] = [
      {
        bookmakerId: 'bet365',
        bookmakerName: 'Bet365',
        affiliateUrl: '/aff/bet365',
        isFeatured: false,
        outcomes: {
          Home: { label: 'Home', price: 2.10, formattedPrice: '2.10', isBest: false },
          Draw: { label: 'Draw', price: 3.40, formattedPrice: '3.40', isBest: false },
          Away: { label: 'Away', price: 3.20, formattedPrice: '3.20', isBest: false },
        },
      },
      {
        bookmakerId: '1xbet',
        bookmakerName: '1xBet',
        affiliateUrl: '/aff/1xbet',
        isFeatured: true, // Commercial partner
        outcomes: {
          Home: { label: 'Home', price: 2.25, formattedPrice: '2.25', isBest: false }, // Best Home
          Draw: { label: 'Draw', price: 3.30, formattedPrice: '3.30', isBest: false },
          Away: { label: 'Away', price: 3.50, formattedPrice: '3.50', isBest: false }, // Best Away
        },
      },
      {
        bookmakerId: 'pinnacle',
        bookmakerName: 'Pinnacle',
        affiliateUrl: '/aff/pinnacle',
        isFeatured: false,
        outcomes: {
          Home: { label: 'Home', price: 2.18, formattedPrice: '2.18', isBest: false },
          Draw: { label: 'Draw', price: 3.60, formattedPrice: '3.60', isBest: false }, // Best Draw
          Away: { label: 'Away', price: 3.10, formattedPrice: '3.10', isBest: false },
        },
      },
    ];

    it('computes pure mathematical maximum without bias', () => {
      const best = computeBestOdds(mockBookmakers);
      expect(best['Home']).toBe(2.25);
      expect(best['Draw']).toBe(3.60);
      expect(best['Away']).toBe(3.50);
    });

    it('tags isBest flags strictly according to highest price', () => {
      const comparison = buildMarketComparison(
        '1X2',
        'Match Winner',
        ['Home', 'Draw', 'Away'],
        [
          {
            bookmakerId: 'bet365',
            outcomes: { Home: { price: 2.10 }, Draw: { price: 3.40 }, Away: { price: 3.20 } },
          },
          {
            bookmakerId: '1xbet',
            outcomes: { Home: { price: 2.25 }, Draw: { price: 3.30 }, Away: { price: 3.50 } },
          },
          {
            bookmakerId: 'pinnacle',
            outcomes: { Home: { price: 2.18 }, Draw: { price: 3.60 }, Away: { price: 3.10 } },
          },
        ]
      );

      const b365 = comparison.bookmakers.find((b) => b.bookmakerId === 'bet365')!;
      const b1x = comparison.bookmakers.find((b) => b.bookmakerId === '1xbet')!;
      const pinn = comparison.bookmakers.find((b) => b.bookmakerId === 'pinnacle')!;

      expect(b1x.outcomes['Home'].isBest).toBe(true);
      expect(b365.outcomes['Home'].isBest).toBe(false);
      expect(pinn.outcomes['Home'].isBest).toBe(false);

      expect(pinn.outcomes['Draw'].isBest).toBe(true);
      expect(b1x.outcomes['Draw'].isBest).toBe(false);

      expect(b1x.outcomes['Away'].isBest).toBe(true);
      expect(pinn.outcomes['Away'].isBest).toBe(false);
    });
  });

  describe('Commercial Placement & Transparent Sorting', () => {
    const testEntries: BookmakerMarketEntry[] = [
      {
        bookmakerId: 'bet365',
        bookmakerName: 'Bet365',
        affiliateUrl: '',
        isFeatured: false,
        payoutPercent: 94.5,
        outcomes: {
          Home: { label: 'Home', price: 2.0, formattedPrice: '2.00', isBest: false },
        },
      },
      {
        bookmakerId: '1xbet',
        bookmakerName: '1xBet',
        affiliateUrl: '',
        isFeatured: true,
        payoutPercent: 96.2,
        outcomes: {
          Home: { label: 'Home', price: 2.2, formattedPrice: '2.20', isBest: true },
        },
      },
      {
        bookmakerId: 'williamhill',
        bookmakerName: 'William Hill',
        affiliateUrl: '',
        isFeatured: false,
        payoutPercent: 93.0,
        outcomes: {
          Home: { label: 'Home', price: 1.95, formattedPrice: '1.95', isBest: false },
        },
      },
    ];

    it('sorts by BEST_ODDS prioritizing highest price or best-odds count', () => {
      const sorted = sortBookmakerEntries(testEntries, 'BEST_ODDS', 'Home');
      expect(sorted[0].bookmakerId).toBe('1xbet'); // 2.20
      expect(sorted[1].bookmakerId).toBe('bet365'); // 2.00
      expect(sorted[2].bookmakerId).toBe('williamhill'); // 1.95
    });

    it('sorts by FEATURED prioritizing commercial partners while keeping prices intact', () => {
      const sorted = sortBookmakerEntries(testEntries, 'FEATURED');
      expect(sorted[0].bookmakerId).toBe('1xbet'); // isFeatured = true
      expect(sorted[0].isFeatured).toBe(true);
      // Actual prices are not modified
      expect(sorted[0].outcomes['Home'].price).toBe(2.2);
    });

    it('sorts by ALPHABETICAL (A-Z)', () => {
      const sorted = sortBookmakerEntries(testEntries, 'ALPHABETICAL');
      expect(sorted[0].bookmakerName).toBe('1xBet');
      expect(sorted[1].bookmakerName).toBe('Bet365');
      expect(sorted[2].bookmakerName).toBe('William Hill');
    });

    it('sorts by PAYOUT descending', () => {
      const sorted = sortBookmakerEntries(testEntries, 'PAYOUT');
      expect(sorted[0].payoutPercent).toBe(96.2);
      expect(sorted[1].payoutPercent).toBe(94.5);
      expect(sorted[2].payoutPercent).toBe(93.0);
    });

    it('includes required commercial disclosure constants', () => {
      expect(DEFAULT_COMMERCIAL_DISCLOSURE.responsibleGamblingText).toContain('18+');
      expect(DEFAULT_COMMERCIAL_DISCLOSURE.helplineUrl).toBe('https://www.begambleaware.org');
    });
  });

  describe('Multi-Market Extraction from Raw FootballOdds', () => {
    const mockRawOdds: FootballOdds[] = [
      {
        match_id: '99911',
        odd_bookmakers: '1xBet',
        odd_1: '2.40',
        odd_x: '3.40',
        odd_2: '3.10',
        odd_1x: '1.40',
        odd_12: '1.30',
        odd_x2: '1.60',
        'o+1.5': '1.25',
        'u+1.5': '4.00',
        'o+2.5': '1.85',
        'u+2.5': '2.00',
        'o+3.5': '3.20',
        'u+3.5': '1.35',
        bts_yes: '1.70',
        bts_no: '2.10',
        ah0_1: '1.75',
        ah0_2: '2.10',
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
        'o+2': null,
        'u+2': null,
        'o+3': null,
        'u+3': null,
        'o+4': null,
        'u+4': null,
        'o+4.5': null,
        'u+4.5': null,
        'o+5': null,
        'u+5': null,
        'o+5.5': null,
        'u+5.5': null,
      },
      {
        match_id: '99911',
        odd_bookmakers: 'Bet365',
        odd_1: '2.45', // Better home
        odd_x: '3.35',
        odd_2: '3.05',
        odd_1x: '1.38',
        odd_12: '1.32',
        odd_x2: '1.58',
        'o+1.5': '1.28',
        'u+1.5': '3.80',
        'o+2.5': '1.90', // Better Over
        'u+2.5': '1.95',
        'o+3.5': '3.10',
        'u+3.5': '1.38',
        bts_yes: '1.75', // Better BTTS Yes
        bts_no: '2.05',
        ah0_1: '1.80', // Better DNB 1
        ah0_2: '2.05',
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
        'o+2': null,
        'u+2': null,
        'o+3': null,
        'u+3': null,
        'o+4': null,
        'u+4': null,
        'o+4.5': null,
        'u+4.5': null,
        'o+5': null,
        'u+5': null,
        'o+5.5': null,
        'u+5.5': null,
      },
    ];

    it('extracts all expected market comparisons correctly', () => {
      const allMarkets = extractAllMarketComparisons(mockRawOdds, {
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
      });

      expect(allMarkets['1X2']).toBeDefined();
      expect(allMarkets['DOUBLE_CHANCE']).toBeDefined();
      expect(allMarkets['OVER_UNDER_2_5']).toBeDefined();
      expect(allMarkets['BOTH_TEAMS_TO_SCORE']).toBeDefined();
      expect(allMarkets['OVER_UNDER_1_5']).toBeDefined();
      expect(allMarkets['OVER_UNDER_3_5']).toBeDefined();
      expect(allMarkets['DRAW_NO_BET']).toBeDefined();

      // Check 1X2 best odds
      const m1x2 = allMarkets['1X2'];
      expect(m1x2.bestOdds['1 (Arsenal)']).toBe(2.45); // Bet365
      expect(m1x2.bestOdds['Draw (X)']).toBe(3.40); // 1xBet
      expect(m1x2.bestOdds['2 (Chelsea)']).toBe(3.10); // 1xBet

      // Check Over/Under 2.5 best odds
      const mOU = allMarkets['OVER_UNDER_2_5'];
      expect(mOU.bestOdds['Over 2.5']).toBe(1.90); // Bet365
      expect(mOU.bestOdds['Under 2.5']).toBe(2.00); // 1xBet

      // Check BTTS best odds
      const mBTTS = allMarkets['BOTH_TEAMS_TO_SCORE'];
      expect(mBTTS.bestOdds['Yes']).toBe(1.75); // Bet365
      expect(mBTTS.bestOdds['No']).toBe(2.10); // 1xBet
    });

    it('builds a complete canonical odds matrix for server response', () => {
      const matrix = buildCompleteOddsMatrix({
        eventId: '99911',
        sport: 'football',
        rawOddsList: mockRawOdds,
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        format: 'decimal',
      });

      expect(matrix.eventId).toBe('99911');
      expect(matrix.canonicalEventId).toBe('gm_event_football_99911');
      expect(matrix.sport).toBe('football');
      expect(matrix.markets['1X2']).toBeDefined();
      expect(matrix.updatedAt).toBeTruthy();
    });
  });
});
