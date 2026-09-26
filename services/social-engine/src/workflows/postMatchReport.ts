/**
 * GoalMills Social Engine — Post-Match Report Workflow
 *
 * Runs periodically (every 10 minutes).
 * Finds matches that finished 25–60 minutes ago that have not yet had
 * their detailed post-match tactical report published.
 *
 * Generates an analytical report card with Man of the Match,
 * detailed AI article caption, and publishes across platforms.
 */

import MatchSchedule from '../models/MatchSchedule';
import { getMatchDetails } from '../data/footballApi';
import {
  generatePostMatchGraphic,
  generatePostMatchReport,
  convertImageToVideo,
} from '../generators';
import { distributor } from '../platforms/distributor';
import type { PlatformTarget } from '../platforms/types';
import { logger } from '../utils/logger';

export interface PostMatchWorkflowResult {
  eligibleMatches: number;
  reportsPublished: number;
}

/**
 * Execute post-match comprehensive report workflow.
 */
export async function executePostMatchWorkflow(
  platforms: PlatformTarget = 'all'
): Promise<PostMatchWorkflowResult> {
  const result: PostMatchWorkflowResult = {
    eligibleMatches: 0,
    reportsPublished: 0,
  };

  try {
    // Window: finished between 20 minutes and 3 hours ago
    const minTime = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const maxTime = new Date(Date.now() - 20 * 60 * 1000);

    const eligible = await MatchSchedule.find({
      currentState: 'FULLTIME',
      postMatchPosted: { $ne: true },
      updatedAt: { $gte: minTime, $lte: maxTime },
    }).limit(3); // Cap at 3 per cycle to maintain pacing

    result.eligibleMatches = eligible.length;

    for (const matchRecord of eligible) {
      const matchId = matchRecord.matchId;
      logger.info(
        `Generating post-match tactical report for ${matchRecord.homeTeam} vs ${matchRecord.awayTeam}`
      );

      try {
        let matchDetails: any = null;
        try {
          matchDetails = await getMatchDetails(matchId);
        } catch {}

        const finalScore = matchRecord.score || '0 - 0';

        // 1. Generate Graphic
        const graphicBuffer = await generatePostMatchGraphic({
          homeTeam: matchRecord.homeTeam || 'Home',
          awayTeam: matchRecord.awayTeam || 'Away',
          score: finalScore,
          leagueName: matchRecord.leagueName || 'League',
          manOfTheMatch: extractMotm(matchDetails, matchRecord),
          headline: `${matchRecord.homeTeam} vs ${matchRecord.awayTeam}: Final Tactical Verdict`,
        });

        // 2. Generate AI Text
        const captionText = await generatePostMatchReport({
          homeTeam: matchRecord.homeTeam || 'Home',
          awayTeam: matchRecord.awayTeam || 'Away',
          score: finalScore,
          halfTimeScore: matchRecord.halfTimeScore,
          league: matchRecord.leagueName || 'League',
        });

        // 3. Optional video conversion
        const videoBuffer = await convertImageToVideo(graphicBuffer, 5);

        // 4. Distribute
        const dispatch = await distributor.distribute(
          {
            text: captionText,
            imageBuffer: graphicBuffer,
            videoBuffer: videoBuffer || undefined,
            imageAltText: `Post-Match Analysis: ${matchRecord.homeTeam} vs ${matchRecord.awayTeam}`,
            postType: 'post_match',
            matchId,
            leagueId: matchRecord.leagueId,
            leagueName: matchRecord.leagueName,
            homeTeam: matchRecord.homeTeam,
            awayTeam: matchRecord.awayTeam,
          },
          platforms,
          { triggeredBy: 'post_match_analyzer' }
        );

        if (dispatch.successCount > 0) {
          await MatchSchedule.findOneAndUpdate(
            { matchId },
            { $set: { postMatchPosted: true } }
          );
          result.reportsPublished++;
        }
      } catch (err) {
        logger.error(`Error in post-match report for match ${matchId}`, err);
      }
    }
  } catch (err) {
    logger.error('Error executing post-match workflow', err);
  }

  return result;
}

function extractMotm(details: any, record: any): string {
  if (details?.event_man_of_the_match) return details.event_man_of_the_match;
  if (details?.goalscorers && details.goalscorers.length > 0) {
    const firstScorer = details.goalscorers[0];
    return firstScorer.home_scorer || firstScorer.away_scorer || 'Star Performer';
  }
  return `${record.homeTeam || 'Match'} Captain`;
}
