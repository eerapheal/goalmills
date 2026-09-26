/**
 * GoalMills Social Engine — Pre-Match Report Workflow
 *
 * Runs daily at 10:00 UTC.
 * Checks for matches scheduled 2 days ahead (within next 48-72h)
 * across the Top 5 European leagues.
 *
 * Generates an analytical pre-match clash preview with H2H context,
 * renders the match card, and publishes to all platforms.
 */

import { TOP_5_LEAGUES } from '../data/leagueConfig';
import { getUpcomingFixtures, getH2H, getStandings } from '../data/footballApi';
import {
  generatePreMatchGraphic,
  generatePreMatchReport,
  convertImageToVideo,
} from '../generators';
import { distributor } from '../platforms/distributor';
import type { PlatformTarget } from '../platforms/types';
import { logger } from '../utils/logger';

export interface PreMatchWorkflowResult {
  matchesEvaluated: number;
  reportsPublished: number;
  matches: Array<{
    matchId: string;
    fixture: string;
    published: boolean;
  }>;
}

/**
 * Execute pre-match preview workflow for matches occurring in 2 days.
 */
export async function executePreMatchWorkflow(
  targetLeagueId?: number,
  platforms: PlatformTarget = 'all'
): Promise<PreMatchWorkflowResult> {
  logger.info('Starting Pre-Match 2-day-ahead automation workflow...');

  const result: PreMatchWorkflowResult = {
    matchesEvaluated: 0,
    reportsPublished: 0,
    matches: [],
  };

  // Determine target date (2 days ahead)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 2);
  const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

  const leaguesToProcess = targetLeagueId
    ? Object.values(TOP_5_LEAGUES).filter((l) => l.id === targetLeagueId)
    : Object.values(TOP_5_LEAGUES);

  for (const league of leaguesToProcess) {
    try {
      // Look 3 days ahead to capture 2-day matches across timezones
      const fixtures = await getUpcomingFixtures(league.id, 3);
      if (!fixtures || fixtures.length === 0) continue;

      // Filter matches taking place on target date (or next 48h)
      const matchingEvents = fixtures.filter(
        (f) => f.event_date === targetDateStr || isWithin48Hours(f.event_date)
      );

      for (const match of matchingEvents.slice(0, 3)) {
        // Cap at top 3 marquee matches per league per cycle to avoid spamming
        result.matchesEvaluated++;
        const matchId = match.event_key;
        const fixtureName = `${match.event_home_team} vs ${match.event_away_team}`;

        try {
          logger.info(`Generating 2-day pre-match preview for ${fixtureName}...`);

          // Fetch H2H context if possible
          let h2hData: any = null;
          try {
            if (match.home_team_key && match.away_team_key) {
              h2hData = await getH2H(match.home_team_key, match.away_team_key);
            }
          } catch {}

          // 1. Generate Graphic
          const graphicBuffer = await generatePreMatchGraphic({
            homeTeam: match.event_home_team,
            awayTeam: match.event_away_team,
            leagueName: league.name,
            leagueColor: league.color,
            eventDate: match.event_date,
            eventTime: match.event_time ? match.event_time.slice(0, 5) : '15:00',
            venue: match.event_stadium || `${match.event_home_team} Stadium`,
          });

          // 2. Generate AI Text
          const captionText = await generatePreMatchReport({
            homeTeam: match.event_home_team,
            awayTeam: match.event_away_team,
            league: league.name,
            h2hRecord: h2hData,
            eventDate: match.event_date,
            eventTime: match.event_time,
          });

          // 3. Optional video conversion
          const videoBuffer = await convertImageToVideo(graphicBuffer, 5);

          // 4. Distribute
          const dispatch = await distributor.distribute(
            {
              text: captionText,
              imageBuffer: graphicBuffer,
              videoBuffer: videoBuffer || undefined,
              imageAltText: `${fixtureName} Pre-Match Preview`,
              postType: 'pre_match',
              matchId,
              leagueId: String(league.id),
              leagueName: league.name,
              homeTeam: match.event_home_team,
              awayTeam: match.event_away_team,
            },
            platforms,
            { triggeredBy: 'cron_pre_match' }
          );

          const success = dispatch.successCount > 0;
          if (success) result.reportsPublished++;

          result.matches.push({
            matchId,
            fixture: fixtureName,
            published: success,
          });
        } catch (matchErr) {
          logger.error(`Failed to process pre-match preview for ${fixtureName}`, matchErr);
        }
      }
    } catch (err) {
      logger.error(`Error in pre-match workflow for league ${league.name}`, err);
    }
  }

  logger.info(
    `Pre-Match workflow finished: ${result.reportsPublished}/${result.matchesEvaluated} previews published`
  );
  return result;
}

function isWithin48Hours(dateStr?: string): boolean {
  if (!dateStr) return false;
  const matchDate = new Date(dateStr);
  const now = new Date();
  const diffHours = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours >= 24 && diffHours <= 60;
}
