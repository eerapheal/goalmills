import { FootballOdds, OddsQuote, MarketType, SelectionType } from '@goalmills/types';
import { getCanonicalBookmaker, normalizeBookmakerSlug } from './bookmakerRegistry';

/**
 * Normalizes legacy flat provider odds (FootballOdds) into strongly-typed GoalMills OddsQuote entities.
 * Pure deterministic mapping that preserves existing data structures without mutation.
 */
export function normalizeLegacyFootballOdds(
  rawOddsList: FootballOdds[],
  eventId = 'unknown_event'
): OddsQuote[] {
  if (!Array.isArray(rawOddsList) || rawOddsList.length === 0) {
    return [];
  }

  const quotes: OddsQuote[] = [];
  const capturedAt = new Date().toISOString();

  for (const raw of rawOddsList) {
    const rawBookmaker = raw.odd_bookmakers || 'Unknown';
    const canonicalBookie = getCanonicalBookmaker(rawBookmaker);
    const bookmakerId = canonicalBookie?.id || normalizeBookmakerSlug(rawBookmaker);
    const bookmakerName = canonicalBookie?.displayName || rawBookmaker;
    const matchId = raw.match_id || eventId;

    // Helper to safely parse decimal odds
    const parseOdds = (val?: string | null): number | null => {
      if (!val || val === '-' || val === '0') return null;
      const num = parseFloat(val);
      return !isNaN(num) && num > 1.0 ? num : null;
    };

    // ── 1. 1X2 / Match Winner Market ──────────────────────────────────────────
    const o1 = parseOdds(raw.odd_1);
    if (o1 !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_1X2_HOME`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: '1X2',
        selection: 'HOME',
        selectionLabel: '1 (Home)',
        odds: o1,
        formattedOdds: o1.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }

    const ox = parseOdds(raw.odd_x);
    if (ox !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_1X2_DRAW`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: '1X2',
        selection: 'DRAW',
        selectionLabel: 'X (Draw)',
        odds: ox,
        formattedOdds: ox.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }

    const o2 = parseOdds(raw.odd_2);
    if (o2 !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_1X2_AWAY`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: '1X2',
        selection: 'AWAY',
        selectionLabel: '2 (Away)',
        odds: o2,
        formattedOdds: o2.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }

    // ── 2. Double Chance Market ───────────────────────────────────────────────
    const o1x = parseOdds(raw.odd_1x);
    if (o1x !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_DC_1X`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: 'DOUBLE_CHANCE',
        selection: 'HOME_OR_DRAW',
        selectionLabel: '1X (Home or Draw)',
        odds: o1x,
        formattedOdds: o1x.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }

    const o12 = parseOdds(raw.odd_12);
    if (o12 !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_DC_12`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: 'DOUBLE_CHANCE',
        selection: 'HOME_OR_AWAY',
        selectionLabel: '12 (Home or Away)',
        odds: o12,
        formattedOdds: o12.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }

    const ox2 = parseOdds(raw.odd_x2);
    if (ox2 !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_DC_X2`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: 'DOUBLE_CHANCE',
        selection: 'DRAW_OR_AWAY',
        selectionLabel: 'X2 (Draw or Away)',
        odds: ox2,
        formattedOdds: ox2.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }

    // ── 3. Over / Under 2.5 Market ────────────────────────────────────────────
    const o25 = parseOdds(raw['o+2.5']);
    if (o25 !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_OU_OVER_2.5`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: 'OVER_UNDER',
        selection: 'OVER',
        selectionLabel: 'Over 2.5',
        line: 2.5,
        odds: o25,
        formattedOdds: o25.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }

    const u25 = parseOdds(raw['u+2.5']);
    if (u25 !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_OU_UNDER_2.5`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: 'OVER_UNDER',
        selection: 'UNDER',
        selectionLabel: 'Under 2.5',
        line: 2.5,
        odds: u25,
        formattedOdds: u25.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }

    // ── 4. Both Teams to Score (BTTS) ─────────────────────────────────────────
    const btsY = parseOdds(raw.bts_yes);
    if (btsY !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_BTTS_YES`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: 'BTTS',
        selection: 'YES',
        selectionLabel: 'BTTS Yes',
        odds: btsY,
        formattedOdds: btsY.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }

    const btsN = parseOdds(raw.bts_no);
    if (btsN !== null) {
      quotes.push({
        id: `${matchId}_${bookmakerId}_BTTS_NO`,
        eventId: matchId,
        bookmakerId,
        bookmakerName,
        marketType: 'BTTS',
        selection: 'NO',
        selectionLabel: 'BTTS No',
        odds: btsN,
        formattedOdds: btsN.toFixed(2),
        oddsFormat: 'DECIMAL',
        provider: 'ALLSPORTS',
        capturedAt,
      });
    }
  }

  // Calculate and tag objective best odds per market selection
  tagBestOddsInPlace(quotes);

  return quotes;
}

/**
 * Evaluates mathematical top odds per market and selection,
 * tagging isBestOdds without altering raw rankings.
 */
function tagBestOddsInPlace(quotes: OddsQuote[]): void {
  const topQuoteMap = new Map<string, OddsQuote>();

  for (const q of quotes) {
    const key = `${q.marketType}_${q.selection}_${q.line ?? 'none'}`;
    const existing = topQuoteMap.get(key);
    if (!existing || q.odds > existing.odds) {
      topQuoteMap.set(key, q);
    }
  }

  for (const q of quotes) {
    const key = `${q.marketType}_${q.selection}_${q.line ?? 'none'}`;
    const top = topQuoteMap.get(key);
    if (top && top.bookmakerId === q.bookmakerId && top.odds === q.odds) {
      q.isBestOdds = true;
    } else {
      q.isBestOdds = false;
    }
  }
}

/**
 * Groups a flat array of odds quotes by market type.
 */
export function groupOddsByMarket(quotes: OddsQuote[]): Record<MarketType, OddsQuote[]> {
  const groups: Record<string, OddsQuote[]> = {};
  for (const q of quotes) {
    if (!groups[q.marketType]) {
      groups[q.marketType] = [];
    }
    groups[q.marketType].push(q);
  }
  return groups as Record<MarketType, OddsQuote[]>;
}
