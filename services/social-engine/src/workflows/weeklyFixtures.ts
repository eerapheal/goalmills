/**
 * GoalMills Social Engine — Weekly Fixtures Workflow
 *
 * Runs automatically every Monday (and 2 days before any league matchday).
 * Fetches upcoming fixtures for the Top 5 European leagues,
 * renders high-resolution graphic cards, generates AI preview text,
 * and distributes across all configured social platforms.
 */

import { TOP_5_LEAGUES } from '../data/leagueConfig';
import { getUpcomingFixtures } from '../data/footballApi';
import {
  generateUpcomingFixturesGraphic,
  generateWeeklyFixturesPreview,
  convertImageToVideo,
} from '../generators';
import { distributor } from '../platforms/distributor';
import type { PlatformTarget } from '../platforms/types';
import { logger } from '../utils/logger';

export interface WeeklyFixturesResult {
  leagueId: number;
  leagueName: string;
  fixturesCount: number;
  published: boolean;
  errors?: string[];
}

/**
 * Execute the weekly fixtures workflow for all or specific leagues.
 */
export async function executeWeeklyFixturesWorkflow(
  targetLeagueId?: number,
  platforms: PlatformTarget = 'all'
): Promise<WeeklyFixturesResult[]> {
  logger.info('Starting Weekly Fixtures automation workflow...');
  const results: WeeklyFixturesResult[] = [];

  const leaguesToProcess = targetLeagueId
    ? Object.values(TOP_5_LEAGUES).filter((l) => l.id === targetLeagueId)
    : Object.values(TOP_5_LEAGUES);

  for (const league of leaguesToProcess) {
    try {
      logger.info(`Fetching upcoming fixtures for ${league.name}...`);
      const fixtures = await getUpcomingFixtures(league.id, 7);

      if (!fixtures || fixtures.length === 0) {
        logger.info(`No upcoming fixtures found for ${league.name} in next 7 days`);
        results.push({
          leagueId: league.id,
          leagueName: league.name,
          fixturesCount: 0,
          published: false,
        });
        continue;
      }

      // Format fixtures for the graphic and AI text generator
      const mappedFixtures = fixtures.slice(0, 8).map((f) => ({
        homeTeam: f.event_home_team || 'Home',
        awayTeam: f.event_away_team || 'Away',
        date: f.event_date || '',
        time: f.event_time ? f.event_time.slice(0, 5) : 'TBD',
      }));

      // 1. Generate Graphic
      const graphicBuffer = await generateUpcomingFixturesGraphic({
        leagueName: league.name,
        leagueColor: league.color,
        fixtures: mappedFixtures,
      });

      // 2. Generate AI Social Post Text
      const captionText = await generateWeeklyFixturesPreview(
        league.name,
        mappedFixtures
      );

      // 3. Optional video conversion for TikTok/Shorts
      const videoBuffer = await convertImageToVideo(graphicBuffer, 5);

      // 4. Distribute across social platforms
      const dispatchSummary = await distributor.distribute(
        {
          text: captionText,
          imageBuffer: graphicBuffer,
          videoBuffer: videoBuffer || undefined,
          imageAltText: `${league.name} Upcoming Fixtures`,
          postType: 'weekly_fixtures',
          leagueId: String(league.id),
          leagueName: league.name,
        },
        platforms,
        { triggeredBy: 'cron_weekly_fixtures' }
      );

      results.push({
        leagueId: league.id,
        leagueName: league.name,
        fixturesCount: mappedFixtures.length,
        published: dispatchSummary.successCount > 0,
      });
    } catch (err: any) {
      logger.error(`Weekly fixtures workflow error for league ${league.name}`, err);
      results.push({
        leagueId: league.id,
        leagueName: league.name,
        fixturesCount: 0,
        published: false,
        errors: [err.message || 'Unknown error'],
      });
    }
  }

  return results;
}
