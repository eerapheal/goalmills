import type { SportType } from '@goalmills/types';

/**
 * Realtime Streaming Contracts (SSE / WebSockets)
 */

export type RealtimeChannel = 'sports:live' | 'betting:odds' | 'news:breaking';

export type RealtimeEventName =
  | 'match:score_update'
  | 'match:status_change'
  | 'match:incident'
  | 'odds:movement'
  | 'news:alert';

export interface BaseRealtimeMessage<T = unknown> {
  channel: RealtimeChannel;
  event: RealtimeEventName;
  timestamp: number;
  data: T;
}

export interface MatchScoreUpdatePayload {
  sport: SportType;
  matchId: string;
  homeScore: number;
  awayScore: number;
  period: string;
  minute?: number;
  lastIncident?: {
    type: 'goal' | 'card' | 'wicket' | 'quarter_end';
    player?: string;
    team: 'home' | 'away';
    minute?: number;
  };
}

export interface OddsMovementPayload {
  canonicalEventId: string;
  bookmakerId: string;
  marketType: '1x2' | 'over_under' | 'moneyline';
  selection: string;
  oldOdds: number;
  newOdds: number;
  direction: 'up' | 'down';
  timestamp: number;
}
