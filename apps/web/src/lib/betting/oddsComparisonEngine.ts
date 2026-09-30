import { OddsMarketType, Bookmaker, FootballOdds } from '@goalmills/types';
import { getCanonicalBookmaker, normalizeBookmakerSlug } from './bookmakerRegistry';
import { buildCanonicalEventId } from './canonicalEventResolver';

export type OddsFormat = 'decimal' | 'fractional' | 'american';

export interface MarketOutcomeQuote {
  label: string;
  price: number; // Stored canonically as decimal (e.g. 2.50)
  formattedPrice: string;
  isBest: boolean;
  movement?: 'UP' | 'DOWN' | 'STABLE';
  openingPrice?: number;
  changePercent?: number;
}

export interface BookmakerMarketEntry {
  bookmakerId: string;
  bookmakerName: string;
  bookmakerLogo?: string;
  affiliateUrl: string;
  isFeatured?: boolean;
  outcomes: Record<string, MarketOutcomeQuote>;
  marginPercent?: number;
  payoutPercent?: number;
}

export interface MarketComparison {
  marketType: OddsMarketType;
  marketName: string;
  outcomes: string[];
  bestOdds: Record<string, number>;
  bookmakers: BookmakerMarketEntry[];
  averagePayoutPercent?: number;
}

export interface CompleteOddsMatrix {
  eventId: string;
  canonicalEventId: string;
  sport: string;
  format: OddsFormat;
  updatedAt: string;
  markets: Record<string, MarketComparison>;
}

/**
 * Format converter: Converts canonical decimal odds to requested display format
 */
export function formatOdds(decimalOdds: number, format: OddsFormat = 'decimal'): string {
  if (!decimalOdds || isNaN(decimalOdds) || decimalOdds <= 1.0) {
    return '1.00';
  }

  switch (format) {
    case 'decimal':
      return decimalOdds.toFixed(2);

    case 'american': {
      if (decimalOdds >= 2.0) {
        const american = Math.round((decimalOdds - 1.0) * 100);
        return `+${american}`;
      } else {
        const american = Math.round(-100 / (decimalOdds - 1.0));
        return `${american}`;
      }
    }

    case 'fractional': {
      // Common standard fractional odds approximations
      const tolerance = 1.0e-4;
      const val = decimalOdds - 1.0;

      // Known standard fractions lookup for common sports odds
      const standardFractions: Array<[number, string]> = [
        [0.1, '1/10'], [0.125, '1/8'], [0.2, '1/5'], [0.25, '1/4'], [0.3333, '1/3'],
        [0.4, '2/5'], [0.5, '1/2'], [0.5714, '4/7'], [0.6, '3/5'], [0.6667, '2/3'],
        [0.7272, '8/11'], [0.75, '3/4'], [0.8, '4/5'], [0.8333, '5/6'], [0.909, '10/11'],
        [1.0, 'Evs'], [1.1, '11/10'], [1.2, '6/5'], [1.25, '5/4'], [1.3333, '4/3'],
        [1.375, '11/8'], [1.4, '7/5'], [1.5, '6/4'], [1.6, '8/5'], [1.6667, '5/3'],
        [1.75, '7/4'], [1.8, '9/5'], [2.0, '2/1'], [2.2, '11/5'], [2.25, '9/4'],
        [2.5, '5/2'], [2.75, '11/4'], [3.0, '3/1'], [3.5, '7/2'], [4.0, '4/1'],
        [4.5, '9/2'], [5.0, '5/1'], [5.5, '11/2'], [6.0, '6/1'], [7.0, '7/1'],
        [8.0, '8/1'], [9.0, '9/1'], [10.0, '10/1'], [12.0, '12/1'], [14.0, '14/1'],
        [16.0, '16/1'], [20.0, '20/1'], [25.0, '25/1'], [33.0, '33/1'], [50.0, '50/1'],
        [100.0, '100/1'],
      ];

      for (const [decFrac, label] of standardFractions) {
        if (Math.abs(val - decFrac) < 0.035) {
          return label;
        }
      }

      // Continuous fraction approximation
      let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
      let b = val;
      do {
        const a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
      } while (Math.abs(val - h1 / k1) > val * tolerance && k1 <= 20);

      const numerator = Math.round(h1);
      const denominator = Math.round(k1);
      if (denominator === 1) return `${numerator}/1`;
      return `${numerator}/${denominator}`;
    }

    default:
      return decimalOdds.toFixed(2);
  }
}

/** Convenience wrappers for individual formats */
export function toDecimal(quote: number): string {
  return formatOdds(quote, 'decimal');
}

export function toFractional(quote: number): string {
  return formatOdds(quote, 'fractional');
}

export function toAmerican(quote: number): string {
  return formatOdds(quote, 'american');
}

/**
 * Calculates Bookmaker Margin (Overround) and Payout Percentage
 * Margin = (sum(1 / odds_i) - 1) * 100%
 * Payout = (1 / sum(1 / odds_i)) * 100%
 */
export function calculateMarketMargin(oddsList: number[]): { marginPercent: number; payoutPercent: number } {
  const validOdds = oddsList.filter((o) => typeof o === 'number' && o > 1.0);
  if (validOdds.length === 0) {
    return { marginPercent: 0, payoutPercent: 100 };
  }

  const sumInverse = validOdds.reduce((sum, val) => sum + 1.0 / val, 0);
  const marginPercent = Math.max(0, Number(((sumInverse - 1.0) * 100).toFixed(1)));
  const payoutPercent = Number(((1.0 / sumInverse) * 100).toFixed(1));

  return { marginPercent, payoutPercent };
}

/**
 * Determines odds movement direction & percentage change
 * Threshold: delta > +0.02 (UP), delta < -0.02 (DOWN), else STABLE
 */
export function detectOddsMovement(
  current: number,
  opening?: number
): { movement: 'UP' | 'DOWN' | 'STABLE'; changePercent: number } {
  if (!opening || opening <= 1.0 || !current || current <= 1.0) {
    return { movement: 'STABLE', changePercent: 0 };
  }

  const diff = current - opening;
  const changePercent = Number(((diff / opening) * 100).toFixed(1));

  if (diff > 0.02) {
    return { movement: 'UP', changePercent };
  } else if (diff < -0.02) {
    return { movement: 'DOWN', changePercent };
  }

  return { movement: 'STABLE', changePercent: 0 };
}

/**
 * Pure Mathematical Best Odds Calculation
 * Strictly finds the absolute maximum price per outcome across all bookmakers.
 * CANNOT be overridden or influenced by commercial tier or sponsorship.
 */
export function computeBestOdds(bookmakers: BookmakerMarketEntry[]): Record<string, number> {
  const bestOdds: Record<string, number> = {};

  for (const b of bookmakers) {
    for (const [outcomeKey, quote] of Object.entries(b.outcomes)) {
      if (quote.price > 1.0) {
        if (!bestOdds[outcomeKey] || quote.price > bestOdds[outcomeKey]) {
          bestOdds[outcomeKey] = quote.price;
        }
      }
    }
  }

  return bestOdds;
}

/**
 * Build a unified MarketComparison structure with best odds tags and formatted strings
 */
export function buildMarketComparison(
  marketType: OddsMarketType,
  marketName: string,
  outcomes: string[],
  rawEntries: Array<{
    bookmakerId: string;
    affiliateUrl?: string;
    isFeatured?: boolean;
    outcomes: Record<string, { price: number; openingPrice?: number }>;
  }>,
  format: OddsFormat = 'decimal'
): MarketComparison {
  // 1. Map raw entries to structured entries
  const bookmakers: BookmakerMarketEntry[] = rawEntries.map((raw) => {
    const canonical = getCanonicalBookmaker(raw.bookmakerId);
    const bookmakerName = canonical?.displayName || raw.bookmakerId;
    const bookmakerLogo = canonical?.logoUrl;
    const affiliateUrl = raw.affiliateUrl || `/api/affiliate/redirect/${encodeURIComponent(raw.bookmakerId)}`;

    const outcomeQuotes: Record<string, MarketOutcomeQuote> = {};
    const priceList: number[] = [];

    for (const outcome of outcomes) {
      const data = raw.outcomes[outcome];
      const price = data?.price || 0;
      if (price > 1.0) {
        priceList.push(price);
      }
      const movementInfo = detectOddsMovement(price, data?.openingPrice);

      outcomeQuotes[outcome] = {
        label: outcome,
        price,
        formattedPrice: price > 1.0 ? formatOdds(price, format) : '-',
        isBest: false, // Calculated in pass 2
        movement: movementInfo.movement,
        openingPrice: data?.openingPrice,
        changePercent: movementInfo.changePercent,
      };
    }

    const { marginPercent, payoutPercent } = calculateMarketMargin(priceList);

    return {
      bookmakerId: raw.bookmakerId,
      bookmakerName,
      bookmakerLogo,
      affiliateUrl,
      isFeatured: raw.isFeatured ?? canonical?.isFeatured ?? false,
      outcomes: outcomeQuotes,
      marginPercent,
      payoutPercent,
    };
  });

  // 2. Pure Mathematical Best Odds computation
  const bestOdds = computeBestOdds(bookmakers);

  // 3. Mark isBest flags
  for (const b of bookmakers) {
    for (const [outcomeKey, quote] of Object.entries(b.outcomes)) {
      if (quote.price > 1.0 && bestOdds[outcomeKey] && quote.price >= bestOdds[outcomeKey]) {
        quote.isBest = true;
      }
    }
  }

  // 4. Calculate average payout
  const validPayouts = bookmakers
    .map((b) => b.payoutPercent)
    .filter((p): p is number => typeof p === 'number' && p > 0);
  const averagePayoutPercent =
    validPayouts.length > 0
      ? Number((validPayouts.reduce((a, b) => a + b, 0) / validPayouts.length).toFixed(1))
      : 95.0;

  return {
    marketType,
    marketName,
    outcomes,
    bestOdds,
    bookmakers,
    averagePayoutPercent,
  };
}

/** Helper to parse numeric odds from raw string values */
function parseRawOddsValue(val?: string | null): number {
  if (!val || val === '-' || val === '0') return 0;
  const num = parseFloat(val);
  return !isNaN(num) && num > 1.0 ? num : 0;
}

/**
 * Extracts and compiles all primary betting markets from raw FootballOdds[]:
 * - 1X2 (Home, Draw, Away)
 * - DOUBLE_CHANCE (1X, 12, X2)
 * - OVER_UNDER_2_5 (Over 2.5, Under 2.5)
 * - OVER_UNDER_1_5 (Over 1.5, Under 1.5)
 * - OVER_UNDER_3_5 (Over 3.5, Under 3.5)
 * - BOTH_TEAMS_TO_SCORE (Yes, No)
 * - DRAW_NO_BET (Home, Away)
 */
export function extractAllMarketComparisons(
  rawOddsList: FootballOdds[],
  options?: {
    homeTeam?: string;
    awayTeam?: string;
    format?: OddsFormat;
    openingOddsMap?: Record<string, Record<string, number>>; // [bookmakerId][selectionKey] = openingPrice
  }
): Record<string, MarketComparison> {
  if (!Array.isArray(rawOddsList) || rawOddsList.length === 0) {
    return {};
  }

  const homeLabel = options?.homeTeam ? `1 (${options.homeTeam})` : 'Home (1)';
  const awayLabel = options?.awayTeam ? `2 (${options.awayTeam})` : 'Away (2)';
  const drawLabel = 'Draw (X)';
  const format = options?.format || 'decimal';
  const openingMap = options?.openingOddsMap || {};

  // Group raw rows by canonical bookmaker
  const rowsByBookmaker = new Map<string, FootballOdds>();
  for (const row of rawOddsList) {
    const slug = normalizeBookmakerSlug(row.odd_bookmakers || '');
    if (!rowsByBookmaker.has(slug)) {
      rowsByBookmaker.set(slug, row);
    }
  }

  const markets: Record<string, MarketComparison> = {};

  // ── 1. 1X2 Market ──────────────────────────────────────────────────────────
  const entries1X2 = Array.from(rowsByBookmaker.entries()).map(([slug, row]) => {
    const p1 = parseRawOddsValue(row.odd_1);
    const px = parseRawOddsValue(row.odd_x);
    const p2 = parseRawOddsValue(row.odd_2);
    const bookieOpening = openingMap[slug] || {};

    return {
      bookmakerId: slug,
      outcomes: {
        [homeLabel]: { price: p1, openingPrice: bookieOpening['HOME'] || bookieOpening[homeLabel] },
        [drawLabel]: { price: px, openingPrice: bookieOpening['DRAW'] || bookieOpening[drawLabel] },
        [awayLabel]: { price: p2, openingPrice: bookieOpening['AWAY'] || bookieOpening[awayLabel] },
      },
    };
  }).filter((e) => Object.values(e.outcomes).some((o) => o.price > 1.0));

  if (entries1X2.length > 0) {
    markets['1X2'] = buildMarketComparison(
      '1X2',
      'Match Result (1X2)',
      [homeLabel, drawLabel, awayLabel],
      entries1X2,
      format
    );
  }

  // ── 2. Double Chance Market ────────────────────────────────────────────────
  const entriesDC = Array.from(rowsByBookmaker.entries()).map(([slug, row]) => {
    const p1x = parseRawOddsValue(row.odd_1x);
    const p12 = parseRawOddsValue(row.odd_12);
    const px2 = parseRawOddsValue(row.odd_x2);
    const bookieOpening = openingMap[slug] || {};

    return {
      bookmakerId: slug,
      outcomes: {
        '1X': { price: p1x, openingPrice: bookieOpening['1X'] || bookieOpening['HOME_OR_DRAW'] },
        '12': { price: p12, openingPrice: bookieOpening['12'] || bookieOpening['HOME_OR_AWAY'] },
        'X2': { price: px2, openingPrice: bookieOpening['X2'] || bookieOpening['DRAW_OR_AWAY'] },
      },
    };
  }).filter((e) => Object.values(e.outcomes).some((o) => o.price > 1.0));

  if (entriesDC.length > 0) {
    markets['DOUBLE_CHANCE'] = buildMarketComparison(
      'DOUBLE_CHANCE',
      'Double Chance',
      ['1X', '12', 'X2'],
      entriesDC,
      format
    );
  }

  // ── 3. Over / Under 2.5 Market ─────────────────────────────────────────────
  const entriesOU25 = Array.from(rowsByBookmaker.entries()).map(([slug, row]) => {
    const pOver = parseRawOddsValue(row['o+2.5']);
    const pUnder = parseRawOddsValue(row['u+2.5']);
    const bookieOpening = openingMap[slug] || {};

    return {
      bookmakerId: slug,
      outcomes: {
        'Over 2.5': { price: pOver, openingPrice: bookieOpening['OVER_2.5'] },
        'Under 2.5': { price: pUnder, openingPrice: bookieOpening['UNDER_2.5'] },
      },
    };
  }).filter((e) => Object.values(e.outcomes).some((o) => o.price > 1.0));

  if (entriesOU25.length > 0) {
    markets['OVER_UNDER_2_5'] = buildMarketComparison(
      'OVER_UNDER_2_5',
      'Total Goals (Over/Under 2.5)',
      ['Over 2.5', 'Under 2.5'],
      entriesOU25,
      format
    );
  }

  // ── 4. Both Teams to Score (BTTS) ──────────────────────────────────────────
  const entriesBTTS = Array.from(rowsByBookmaker.entries()).map(([slug, row]) => {
    const pYes = parseRawOddsValue(row.bts_yes);
    const pNo = parseRawOddsValue(row.bts_no);
    const bookieOpening = openingMap[slug] || {};

    return {
      bookmakerId: slug,
      outcomes: {
        'Yes': { price: pYes, openingPrice: bookieOpening['BTTS_YES'] },
        'No': { price: pNo, openingPrice: bookieOpening['BTTS_NO'] },
      },
    };
  }).filter((e) => Object.values(e.outcomes).some((o) => o.price > 1.0));

  if (entriesBTTS.length > 0) {
    markets['BOTH_TEAMS_TO_SCORE'] = buildMarketComparison(
      'BOTH_TEAMS_TO_SCORE',
      'Both Teams To Score (BTTS)',
      ['Yes', 'No'],
      entriesBTTS,
      format
    );
  }

  // ── 5. Over / Under 1.5 Market ─────────────────────────────────────────────
  const entriesOU15 = Array.from(rowsByBookmaker.entries()).map(([slug, row]) => {
    const pOver = parseRawOddsValue(row['o+1.5']);
    const pUnder = parseRawOddsValue(row['u+1.5']);
    const bookieOpening = openingMap[slug] || {};

    return {
      bookmakerId: slug,
      outcomes: {
        'Over 1.5': { price: pOver, openingPrice: bookieOpening['OVER_1.5'] },
        'Under 1.5': { price: pUnder, openingPrice: bookieOpening['UNDER_1.5'] },
      },
    };
  }).filter((e) => Object.values(e.outcomes).some((o) => o.price > 1.0));

  if (entriesOU15.length > 0) {
    markets['OVER_UNDER_1_5'] = buildMarketComparison(
      'OVER_UNDER_1_5',
      'Total Goals (Over/Under 1.5)',
      ['Over 1.5', 'Under 1.5'],
      entriesOU15,
      format
    );
  }

  // ── 6. Over / Under 3.5 Market ─────────────────────────────────────────────
  const entriesOU35 = Array.from(rowsByBookmaker.entries()).map(([slug, row]) => {
    const pOver = parseRawOddsValue(row['o+3.5']);
    const pUnder = parseRawOddsValue(row['u+3.5']);
    const bookieOpening = openingMap[slug] || {};

    return {
      bookmakerId: slug,
      outcomes: {
        'Over 3.5': { price: pOver, openingPrice: bookieOpening['OVER_3.5'] },
        'Under 3.5': { price: pUnder, openingPrice: bookieOpening['UNDER_3.5'] },
      },
    };
  }).filter((e) => Object.values(e.outcomes).some((o) => o.price > 1.0));

  if (entriesOU35.length > 0) {
    markets['OVER_UNDER_3_5'] = buildMarketComparison(
      'OVER_UNDER_3_5',
      'Total Goals (Over/Under 3.5)',
      ['Over 3.5', 'Under 3.5'],
      entriesOU35,
      format
    );
  }

  // ── 7. Draw No Bet Market (Asian Handicap 0: ah0_1, ah0_2) ────────────────
  const entriesDNB = Array.from(rowsByBookmaker.entries()).map(([slug, row]) => {
    const p1 = parseRawOddsValue(row.ah0_1);
    const p2 = parseRawOddsValue(row.ah0_2);
    const bookieOpening = openingMap[slug] || {};

    return {
      bookmakerId: slug,
      outcomes: {
        [options?.homeTeam || 'Home']: { price: p1, openingPrice: bookieOpening['DNB_HOME'] },
        [options?.awayTeam || 'Away']: { price: p2, openingPrice: bookieOpening['DNB_AWAY'] },
      },
    };
  }).filter((e) => Object.values(e.outcomes).some((o) => o.price > 1.0));

  if (entriesDNB.length > 0) {
    markets['DRAW_NO_BET'] = buildMarketComparison(
      'DRAW_NO_BET',
      'Draw No Bet',
      [options?.homeTeam || 'Home', options?.awayTeam || 'Away'],
      entriesDNB,
      format
    );
  }

  return markets;
}

/**
 * Builds a CompleteOddsMatrix entity ready for API response and UI consumption.
 */
export function buildCompleteOddsMatrix(params: {
  eventId: string | number;
  sport?: string;
  rawOddsList: FootballOdds[];
  homeTeam?: string;
  awayTeam?: string;
  format?: OddsFormat;
  openingOddsMap?: Record<string, Record<string, number>>;
}): CompleteOddsMatrix {
  const sport = params.sport || 'football';
  const eventIdStr = String(params.eventId);
  const canonicalEventId = buildCanonicalEventId(sport, eventIdStr);
  const format = params.format || 'decimal';

  const markets = extractAllMarketComparisons(params.rawOddsList, {
    homeTeam: params.homeTeam,
    awayTeam: params.awayTeam,
    format,
    openingOddsMap: params.openingOddsMap,
  });

  return {
    eventId: eventIdStr,
    canonicalEventId,
    sport,
    format,
    updatedAt: new Date().toISOString(),
    markets,
  };
}
