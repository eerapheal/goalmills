import dbConnect from '@/lib/db';
import BettingAnalyticsEventModel from '@/models/BettingAnalyticsEvent';
import { BettingAnalyticsEventPayload } from '@goalmills/types';

/**
 * Server-side telemetry recorder for betting intelligence and affiliate interactions.
 * Never stores personal passwords, private financial details, or raw unhashed IP addresses.
 */
export async function trackBettingAnalytics(payload: BettingAnalyticsEventPayload): Promise<boolean> {
  try {
    await dbConnect();
    await BettingAnalyticsEventModel.create({
      eventName: payload.eventName,
      bookmakerId: payload.bookmakerId,
      eventId: payload.eventId,
      sport: payload.sport || 'football',
      placement: payload.placement || 'general',
      campaign: payload.campaign || 'organic',
      sessionId: payload.sessionId,
      anonymousVisitorId: payload.anonymousVisitorId,
      metadata: payload.metadata || {},
    });
    return true;
  } catch (err) {
    console.warn('[BettingAnalytics] Non-fatal telemetry recording failure:', err);
    return false;
  }
}
