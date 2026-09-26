/**
 * GoalMills Social Engine — Live Match Scorecard Polling Engine
 *
 * Runs every 60 seconds on matchdays.
 * Monitors real-time match state transitions across the Top 5 European leagues:
 * - FIRST_HALF → HALFTIME: Generates & posts HT Scorecard with stats
 * - SECOND_HALF/EXTRA_TIME → FULLTIME: Generates & posts FT Scorecard with full stats
 *
 * Uses MongoDB MatchSchedule for state persistence and deduplication.
 */

import { TOP_5_LEAGUES } from '../data/leagueConfig';
import { getLiveMatches, getMatchDetails } from '../data/footballApi';
import {
  detectStateTransitions,
  type MatchStateTransition,
} from '../data/matchTracker';
import MatchSchedule from '../models/MatchSchedule';
import {
  generateHalftimeGraphic,
  generateFulltimeGraphic,
  generateHalftimeAnalysis,
  generateFulltimeRecap,
  convertImageToVideo,
} from '../generators';
import { distributor } from '../platforms/distributor';
import type { PlatformTarget } from '../platforms/types';
import { logger } from '../utils/logger';
import type { FootballEvent } from '@goalmills/types';

export interface LivePollingResult {
  liveMatchesCount: number;
  transitionsDetected: number;
  htScorecardsPosted: number;
  ftScorecardsPosted: number;
}

/**
 * Poll live matches and process any HT/FT state transitions.
 */
export async function pollLiveMatches(
  platforms: PlatformTarget = 'all'
): Promise<LivePollingResult> {
  const result: LivePollingResult = {
    liveMatchesCount: 0,
    transitionsDetected: 0,
    htScorecardsPosted: 0,
    ftScorecardsPosted: 0,
  };

  try {
    // 1. Fetch live matches for all Top 5 leagues in parallel
    const leagueLivePromises = Object.values(TOP_5_LEAGUES).map((league) =>
      getLiveMatches(league.id)
    );
    const leagueResults = await Promise.allSettled(leagueLivePromises);

    const allLiveMatches: FootballEvent[] = [];
    for (const res of leagueResults) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allLiveMatches.push(...res.value);
      }
    }

    result.liveMatchesCount = allLiveMatches.length;

    if (allLiveMatches.length === 0) {
      return result;
    }

    logger.debug(`Found ${allLiveMatches.length} active live matches across Top 5 leagues`);

    // 2. Detect transitions from previous poll cycle
    const transitions = await detectStateTransitions(allLiveMatches);
    result.transitionsDetected = transitions.length;

    // 3. Process each state transition
    for (const transition of transitions) {
      if (transition.currentState === 'HALFTIME') {
        const posted = await handleHalftimeTransition(transition, platforms);
        if (posted) result.htScorecardsPosted++;
      } else if (transition.currentState === 'FULLTIME') {
        const posted = await handleFulltimeTransition(transition, platforms);
        if (posted) result.ftScorecardsPosted++;
      }
    }
  } catch (err) {
    logger.error('Error during live match polling cycle', err);
  }

  return result;
}

/**
 * Process Halftime transition for a match.
 */
async function handleHalftimeTransition(
  transition: MatchStateTransition,
  platforms: PlatformTarget
): Promise<boolean> {
  const { matchId, match } = transition;

  try {
    // Check if HT scorecard was already posted
    const record = await MatchSchedule.findOne({ matchId });
    if (record?.htScorecardPosted) {
      logger.info(`HT scorecard already posted for match ${matchId}`);
      return false;
    }

    logger.info(
      `Generating Half-Time scorecard: ${match.event_home_team} vs ${match.event_away_team}`
    );

    // Fetch rich match stats and details if available
    let detailedMatch = match;
    try {
      const details = await getMatchDetails(matchId);
      if (details) detailedMatch = details;
    } catch {}

    const leagueColor = getLeagueColor(match.league_key);
    const scores = parseScore(detailedMatch.event_halftime_result || detailedMatch.event_final_result);
    const scorers = extractScorers(detailedMatch);
    const stats = extractStats(detailedMatch);

    // 1. Generate Halftime Graphic
    const graphicBuffer = await generateHalftimeGraphic({
      homeTeam: match.event_home_team,
      awayTeam: match.event_away_team,
      homeScore: scores.home,
      awayScore: scores.away,
      leagueName: match.league_name || 'League',
      leagueColor,
      scorers,
      stats: {
        possession: stats.possession,
        shots: stats.shots,
        shotsOnTarget: stats.shotsOnTarget,
      },
    });

    // 2. Generate AI Reaction Text
    const captionText = await generateHalftimeAnalysis({
      homeTeam: match.event_home_team,
      awayTeam: match.event_away_team,
      score: `${scores.home} - ${scores.away}`,
      scorers,
      league: match.league_name || 'League',
    });

    // 3. Optional video conversion
    const videoBuffer = await convertImageToVideo(graphicBuffer, 5);

    // 4. Distribute
    const dispatch = await distributor.distribute(
      {
        text: captionText,
        imageBuffer: graphicBuffer,
        videoBuffer: videoBuffer || undefined,
        imageAltText: `Half-Time: ${match.event_home_team} ${scores.home} - ${scores.away} ${match.event_away_team}`,
        postType: 'ht_scorecard',
        matchId,
        leagueId: match.league_key,
        leagueName: match.league_name,
        homeTeam: match.event_home_team,
        awayTeam: match.event_away_team,
      },
      platforms,
      { triggeredBy: 'live_poller_halftime' }
    );

    // Mark as posted in DB
    if (dispatch.successCount > 0) {
      await MatchSchedule.findOneAndUpdate(
        { matchId },
        { $set: { htScorecardPosted: true } }
      );
      return true;
    }
  } catch (err) {
    logger.error(`Failed to handle Halftime transition for match ${matchId}`, err);
  }

  return false;
}

/**
 * Process Fulltime transition for a match.
 */
async function handleFulltimeTransition(
  transition: MatchStateTransition,
  platforms: PlatformTarget
): Promise<boolean> {
  const { matchId, match } = transition;

  try {
    // Check if FT scorecard was already posted
    const record = await MatchSchedule.findOne({ matchId });
    if (record?.ftScorecardPosted) {
      logger.info(`FT scorecard already posted for match ${matchId}`);
      return false;
    }

    logger.info(
      `Generating Full-Time scorecard: ${match.event_home_team} vs ${match.event_away_team}`
    );

    let detailedMatch = match;
    try {
      const details = await getMatchDetails(matchId);
      if (details) detailedMatch = details;
    } catch {}

    const leagueColor = getLeagueColor(match.league_key);
    const scores = parseScore(detailedMatch.event_final_result || detailedMatch.event_ft_result);
    const scorers = extractScorers(detailedMatch);
    const stats = extractStats(detailedMatch);

    // 1. Generate Fulltime Graphic
    const graphicBuffer = await generateFulltimeGraphic({
      homeTeam: match.event_home_team,
      awayTeam: match.event_away_team,
      homeScore: scores.home,
      awayScore: scores.away,
      halfTimeScore: detailedMatch.event_halftime_result || undefined,
      leagueName: match.league_name || 'League',
      leagueColor,
      scorers,
      stats,
    });

    // 2. Generate AI Text
    const captionText = await generateFulltimeRecap({
      homeTeam: match.event_home_team,
      awayTeam: match.event_away_team,
      score: `${scores.home} - ${scores.away}`,
      halfTimeScore: detailedMatch.event_halftime_result || undefined,
      scorers,
      league: match.league_name || 'League',
    });

    // 3. Optional video conversion
    const videoBuffer = await convertImageToVideo(graphicBuffer, 5);

    // 4. Distribute
    const dispatch = await distributor.distribute(
      {
        text: captionText,
        imageBuffer: graphicBuffer,
        videoBuffer: videoBuffer || undefined,
        imageAltText: `Full-Time: ${match.event_home_team} ${scores.home} - ${scores.away} ${match.event_away_team}`,
        postType: 'ft_scorecard',
        matchId,
        leagueId: match.league_key,
        leagueName: match.league_name,
        homeTeam: match.event_home_team,
        awayTeam: match.event_away_team,
      },
      platforms,
      { triggeredBy: 'live_poller_fulltime' }
    );

    // Mark as posted in DB
    if (dispatch.successCount > 0) {
      await MatchSchedule.findOneAndUpdate(
        { matchId },
        { $set: { ftScorecardPosted: true } }
      );
      return true;
    }
  } catch (err) {
    logger.error(`Failed to handle Fulltime transition for match ${matchId}`, err);
  }

  return false;
}

// ── Helpers ──
function parseScore(scoreStr?: string): { home: number; away: number } {
  if (!scoreStr) return { home: 0, away: 0 };
  const parts = scoreStr.split('-').map((s) => parseInt(s.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { home: parts[0], away: parts[1] };
  }
  return { home: 0, away: 0 };
}

function extractScorers(match: any): Array<{ team: 'home' | 'away'; player: string; minute: string }> {
  const result: Array<{ team: 'home' | 'away'; player: string; minute: string }> = [];
  if (!match.goalscorers || !Array.isArray(match.goalscorers)) return result;

  for (const g of match.goalscorers) {
    if (g.home_scorer) {
      result.push({ team: 'home', player: g.home_scorer, minute: g.time || '' });
    }
    if (g.away_scorer) {
      result.push({ team: 'away', player: g.away_scorer, minute: g.time || '' });
    }
  }
  return result;
}

function extractStats(match: any) {
  const stats: any = {};
  if (!match.statistics || !Array.isArray(match.statistics)) return stats;

  for (const s of match.statistics) {
    const type = (s.type || '').toLowerCase();
    const homeVal = parseInt(s.home, 10) || 0;
    const awayVal = parseInt(s.away, 10) || 0;

    if (type.includes('possession')) stats.possession = [homeVal, awayVal];
    else if (type.includes('shots on target') || type.includes('on target'))
      stats.shotsOnTarget = [homeVal, awayVal];
    else if (type.includes('shots') || type.includes('goal attempts')) stats.shots = [homeVal, awayVal];
    else if (type.includes('corner')) stats.corners = [homeVal, awayVal];
    else if (type.includes('foul')) stats.fouls = [homeVal, awayVal];
    else if (type.includes('yellow')) stats.yellowCards = [homeVal, awayVal];
  }

  return stats;
}

function getLeagueColor(leagueKey?: string): string {
  if (!leagueKey) return '#10b981';
  const found = Object.values(TOP_5_LEAGUES).find((l) => String(l.id) === String(leagueKey));
  return found?.color || '#10b981';
}
