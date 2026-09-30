import dbConnect from '@/lib/db';
import OddsQuoteModel from '@/models/OddsQuote';
import { OddsQuote } from '@goalmills/types';
import { detectOddsMovement } from './oddsComparisonEngine';

export interface OddsMovementResult {
  opening: number;
  current: number;
  direction: 'UP' | 'DOWN' | 'STABLE';
  changePercent: number;
}

/**
 * Retrieves the earliest recorded (opening) odds for an event, grouped by bookmaker and selection.
 * Map structure: result[bookmakerId][selectionKey] = openingOddsValue
 */
export async function getOpeningOddsMapForEvent(
  eventId: string
): Promise<Record<string, Record<string, number>>> {
  const result: Record<string, Record<string, number>> = {};

  try {
    await dbConnect();

    // Find quotes for event sorted chronologically ascending
    const quotes = await OddsQuoteModel.find({ eventId })
      .sort({ capturedAt: 1, createdAt: 1 })
      .lean();

    for (const q of quotes) {
      const bookie = q.bookmakerId;
      const selection = q.selectionLabel || q.selection;
      if (!result[bookie]) {
        result[bookie] = {};
      }

      // Only set if not already set (retaining the earliest quote as opening)
      if (!result[bookie][selection] && typeof q.odds === 'number' && q.odds > 1.0) {
        result[bookie][selection] = q.odds;
      }
      if (!result[bookie][q.selection] && typeof q.odds === 'number' && q.odds > 1.0) {
        result[bookie][q.selection] = q.odds;
      }
    }
  } catch (error) {
    // Graceful degradation when MongoDB is unavailable or during cold boot
    console.warn('[OddsHistoryService] Failed to fetch opening odds from database:', error);
  }

  return result;
}

/**
 * Persists normalized odds quotes into the historical repository as snapshots.
 * Uses upsert or bulk insertion with duplicate handling.
 */
export async function recordOddsQuotesSnapshot(
  eventId: string,
  quotes: OddsQuote[]
): Promise<number> {
  if (!quotes || quotes.length === 0) return 0;

  try {
    await dbConnect();

    const docs = quotes.map((q) => ({
      eventId: q.eventId || eventId,
      bookmakerId: q.bookmakerId,
      bookmakerName: q.bookmakerName,
      marketType: q.marketType,
      selection: q.selection,
      selectionLabel: q.selectionLabel,
      line: q.line,
      odds: q.odds,
      formattedOdds: q.formattedOdds,
      oddsFormat: q.oddsFormat || 'DECIMAL',
      provider: q.provider || 'ALLSPORTS',
      providerQuoteId: q.providerQuoteId,
      isBestOdds: q.isBestOdds || false,
      capturedAt: q.capturedAt ? new Date(q.capturedAt) : new Date(),
    }));

    // Insert snapshot records
    const inserted = await OddsQuoteModel.insertMany(docs, { ordered: false });
    return inserted.length;
  } catch (error: any) {
    // If bulk write had partial errors (e.g. duplicate keys), return inserted count if available
    if (error?.insertedDocs?.length) {
      return error.insertedDocs.length;
    }
    console.warn('[OddsHistoryService] Failed to persist odds quotes snapshot:', error?.message || error);
    return 0;
  }
}

/**
 * Calculates historical movement between an opening price and current price.
 */
export function computeHistoricalOddsMovement(
  current: number,
  opening?: number
): OddsMovementResult {
  const { movement, changePercent } = detectOddsMovement(current, opening);
  return {
    opening: opening && opening > 1.0 ? opening : current,
    current,
    direction: movement,
    changePercent,
  };
}
