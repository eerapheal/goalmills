/**
 * GoalMills Social Engine — Match State Tracker
 *
 * Tracks match states across polling cycles and detects transitions:
 *   UPCOMING → LIVE → HALFTIME → SECOND_HALF → FULLTIME
 *
 * Uses MongoDB to persist state so it survives service restarts.
 * When a state transition is detected, the caller can trigger
 * the appropriate workflow (HT scorecard, FT scorecard, post-match report).
 */

import type { FootballEvent } from '@goalmills/types';
import MatchSchedule from '../models/MatchSchedule';
import { logger } from '../utils/logger';

/** Possible match lifecycle states */
export type MatchState =
  | 'UPCOMING'
  | 'FIRST_HALF'
  | 'HALFTIME'
  | 'SECOND_HALF'
  | 'FULLTIME'
  | 'EXTRA_TIME'
  | 'PENALTIES'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'UNKNOWN';

/** State transition event emitted when a match changes state */
export interface MatchStateTransition {
  matchId: string;
  previousState: MatchState;
  currentState: MatchState;
  match: FootballEvent;
}

/**
 * Detect the current match state from the AllSportsAPI event_status field.
 *
 * AllSportsAPI event_status values:
 * - "" (empty) = Not started
 * - "1" through "45" = First half minutes
 * - "Half Time" or "HT" = Halftime
 * - "46" through "90+" = Second half minutes
 * - "Finished" or "FT" = Full time
 * - "Extra Time" = Extra time
 * - "Penalties" = Penalty shootout
 * - "Postponed" = Match postponed
 * - "Cancelled" = Match cancelled
 * - "After Pen." = After penalties
 * - "After ET" = After extra time
 */
export function detectMatchState(match: FootballEvent): MatchState {
  const status = (match.event_status || '').trim();
  const isLive = match.event_live === '1';

  // Not started
  if (!status || status === '' || status === '0') {
    return 'UPCOMING';
  }

  // Finished states
  const finishedStates = ['Finished', 'FT', 'After Pen.', 'After ET', 'AET', 'AP'];
  if (finishedStates.some((s) => status.toLowerCase() === s.toLowerCase())) {
    return 'FULLTIME';
  }

  // Halftime
  if (status === 'Half Time' || status === 'HT' || status.toLowerCase() === 'half time') {
    return 'HALFTIME';
  }

  // Extra time
  if (status.toLowerCase().includes('extra time') || status === 'ET') {
    return 'EXTRA_TIME';
  }

  // Penalties
  if (status.toLowerCase().includes('penalties') || status === 'Pen.') {
    return 'PENALTIES';
  }

  // Postponed / Cancelled
  if (status.toLowerCase() === 'postponed') return 'POSTPONED';
  if (status.toLowerCase() === 'cancelled') return 'CANCELLED';

  // Numeric minute — determine half
  const minuteMatch = status.match(/^(\d+)/);
  if (minuteMatch) {
    const minute = parseInt(minuteMatch[1], 10);
    if (minute <= 45) return 'FIRST_HALF';
    return 'SECOND_HALF';
  }

  // If live flag is set but we can't parse the status
  if (isLive) return 'FIRST_HALF';

  return 'UNKNOWN';
}

/**
 * Get the previously recorded state for a match.
 */
export async function getMatchState(matchId: string): Promise<MatchState | null> {
  try {
    const record = await MatchSchedule.findOne({ matchId });
    return record?.currentState || null;
  } catch (err) {
    logger.error(`Failed to get match state for ${matchId}`, err);
    return null;
  }
}

/**
 * Update the recorded state for a match.
 */
export async function setMatchState(
  matchId: string,
  state: MatchState,
  match: FootballEvent
): Promise<void> {
  try {
    await MatchSchedule.findOneAndUpdate(
      { matchId },
      {
        matchId,
        currentState: state,
        leagueId: match.league_key,
        leagueName: match.league_name,
        homeTeam: match.event_home_team,
        awayTeam: match.event_away_team,
        eventDate: match.event_date,
        eventTime: match.event_time,
        lastUpdated: new Date(),
        score: match.event_final_result || match.event_ft_result || '',
        halfTimeScore: match.event_halftime_result || '',
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    logger.error(`Failed to set match state for ${matchId}`, err);
  }
}

/**
 * Check a batch of live matches for state transitions.
 * Returns an array of transitions that occurred (e.g., FIRST_HALF → HALFTIME).
 */
export async function detectStateTransitions(
  liveMatches: FootballEvent[]
): Promise<MatchStateTransition[]> {
  const transitions: MatchStateTransition[] = [];

  for (const match of liveMatches) {
    const matchId = match.event_key;
    const currentState = detectMatchState(match);
    const previousState = await getMatchState(matchId);

    // If no previous state, record and skip (first time seeing this match)
    if (!previousState) {
      await setMatchState(matchId, currentState, match);
      if (currentState !== 'UPCOMING') {
        logger.info(
          `New match detected: ${match.event_home_team} vs ${match.event_away_team} [${currentState}]`
        );
      }
      continue;
    }

    // If state changed, record transition
    if (previousState !== currentState) {
      logger.info(
        `State transition: ${match.event_home_team} vs ${match.event_away_team}: ${previousState} → ${currentState}`
      );

      await setMatchState(matchId, currentState, match);

      transitions.push({
        matchId,
        previousState,
        currentState,
        match,
      });
    }
  }

  return transitions;
}

/**
 * Clean up old match records (matches older than 7 days).
 */
export async function cleanupOldMatches(): Promise<number> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const result = await MatchSchedule.deleteMany({
      lastUpdated: { $lt: cutoff },
    });

    const count = result.deletedCount || 0;
    if (count > 0) {
      logger.info(`Cleaned up ${count} old match tracking records`);
    }
    return count;
  } catch (err) {
    logger.error('Failed to cleanup old matches', err);
    return 0;
  }
}
