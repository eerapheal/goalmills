import dbConnect from '@/lib/db';
import OddsAlertModel from '@/models/OddsAlert';
import { OddsAlert, OddsAlertDirection, OddsAlertChannel } from '@goalmills/types';

export interface CreateOddsAlertParams {
  userId?: string;
  userEmail?: string;
  eventId: string;
  sport?: string;
  matchName: string;
  marketId: string;
  marketName?: string;
  selection: string;
  bookmakerId?: string;
  bookmakerName?: string;
  targetOdds: number;
  initialOdds?: number;
  targetDirection?: OddsAlertDirection;
  channel?: OddsAlertChannel;
}

/**
 * Creates a new odds target alert.
 */
export async function createOddsAlert(params: CreateOddsAlertParams): Promise<OddsAlert> {
  await dbConnect();

  const doc = await OddsAlertModel.create({
    userId: params.userId,
    userEmail: params.userEmail,
    eventId: params.eventId,
    sport: params.sport || 'football',
    matchName: params.matchName,
    marketId: params.marketId,
    marketName: params.marketName || params.marketId,
    selection: params.selection,
    bookmakerId: params.bookmakerId,
    bookmakerName: params.bookmakerName,
    targetOdds: params.targetOdds,
    initialOdds: params.initialOdds || 1.0,
    targetDirection: params.targetDirection || 'GREATER_THAN_OR_EQUAL',
    channel: params.channel || 'IN_APP',
    status: 'ACTIVE',
  });

  return doc.toObject ? doc.toObject() : doc;
}

/**
 * Lists active and historical alerts for a user.
 */
export async function getUserOddsAlerts(userId?: string): Promise<OddsAlert[]> {
  await dbConnect();
  const query = userId ? { userId } : {};
  const docs = await OddsAlertModel.find(query).sort({ createdAt: -1 }).limit(50).lean();
  return docs as unknown as OddsAlert[];
}

/**
 * Cancels or deletes an alert.
 */
export async function cancelOddsAlert(alertId: string, userId?: string): Promise<boolean> {
  await dbConnect();
  const query: any = { _id: alertId };
  if (userId) query.userId = userId;

  const res = await OddsAlertModel.updateOne(query, { $set: { status: 'CANCELLED' } });
  return (res.modifiedCount || 0) > 0;
}

/**
 * Evaluates active alerts against a live odds quote snapshot.
 * Marks alerts as TRIGGERED when condition is met.
 */
export async function evaluateOddsAlert(
  alert: OddsAlert,
  currentOdds: number
): Promise<{ triggered: boolean; alert: OddsAlert }> {
  let isTriggered = false;

  if (alert.targetDirection === 'GREATER_THAN_OR_EQUAL') {
    isTriggered = currentOdds >= alert.targetOdds;
  } else {
    isTriggered = currentOdds <= alert.targetOdds;
  }

  if (isTriggered && alert.status === 'ACTIVE') {
    await dbConnect();
    await OddsAlertModel.updateOne(
      { _id: alert.id },
      {
        $set: {
          status: 'TRIGGERED',
          triggeredAt: new Date(),
          lastCheckedOdds: currentOdds,
        },
      }
    );
    alert.status = 'TRIGGERED';
    alert.triggeredAt = new Date().toISOString();
  }

  return { triggered: isTriggered, alert };
}
