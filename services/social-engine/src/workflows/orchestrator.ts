/**
 * GoalMills Social Engine — Master Workflow Orchestrator
 *
 * Coordinates execution of all automation workflows:
 * - Weekly Upcoming Fixtures (Mondays / 2 days prior to matchweek)
 * - Pre-Match Previews (2 days before kickoff)
 * - Live Halftime & Fulltime Scorecards (60s live poller)
 * - Post-Match In-Depth Reports (30m after FT)
 * - Custom Manual Dispatch
 */

import { executeWeeklyFixturesWorkflow, type WeeklyFixturesResult } from './weeklyFixtures';
import { executePreMatchWorkflow, type PreMatchWorkflowResult } from './preMatchReport';
import { pollLiveMatches, type LivePollingResult } from './liveScorecard';
import { executePostMatchWorkflow, type PostMatchWorkflowResult } from './postMatchReport';
import { distributor, type DistributionSummary } from '../platforms/distributor';
import type { PlatformTarget, SocialContent } from '../platforms/types';
import { cleanupOldMatches } from '../data/matchTracker';
import { logger } from '../utils/logger';

export class WorkflowOrchestrator {
  private isLivePollingActive = false;

  /**
   * Run Weekly Fixtures Workflow
   */
  async runWeeklyFixtures(
    leagueId?: number,
    platforms: PlatformTarget = 'all'
  ): Promise<WeeklyFixturesResult[]> {
    logger.info(`Orchestrator: running weekly fixtures (league: ${leagueId || 'all'})...`);
    return executeWeeklyFixturesWorkflow(leagueId, platforms);
  }

  /**
   * Run Pre-Match Previews Workflow (2 days ahead)
   */
  async runPreMatchReports(
    leagueId?: number,
    platforms: PlatformTarget = 'all'
  ): Promise<PreMatchWorkflowResult> {
    logger.info(`Orchestrator: running pre-match previews (league: ${leagueId || 'all'})...`);
    return executePreMatchWorkflow(leagueId, platforms);
  }

  /**
   * Run Real-Time Match Polling Cycle
   */
  async runLivePolling(platforms: PlatformTarget = 'all'): Promise<LivePollingResult> {
    if (this.isLivePollingActive) {
      logger.debug('Live match polling already in progress; skipping duplicate tick');
      return { liveMatchesCount: 0, transitionsDetected: 0, htScorecardsPosted: 0, ftScorecardsPosted: 0 };
    }

    try {
      this.isLivePollingActive = true;
      return await pollLiveMatches(platforms);
    } finally {
      this.isLivePollingActive = false;
    }
  }

  /**
   * Run Post-Match Reports Workflow
   */
  async runPostMatchReports(platforms: PlatformTarget = 'all'): Promise<PostMatchWorkflowResult> {
    logger.info('Orchestrator: checking for finished matches needing post-match analysis...');
    return executePostMatchWorkflow(platforms);
  }

  /**
   * Dispatch a custom manual social post
   */
  async dispatchManualPost(
    content: SocialContent,
    platforms: PlatformTarget = 'all'
  ): Promise<DistributionSummary> {
    logger.info('Orchestrator: executing manual post dispatch...');
    return distributor.distribute(content, platforms, {
      skipDedupe: true,
      triggeredBy: 'admin_manual_trigger',
    });
  }

  /**
   * Run daily database hygiene
   */
  async runDailyCleanup(): Promise<number> {
    logger.info('Orchestrator: running daily match tracker record cleanup...');
    return cleanupOldMatches();
  }
}

export const orchestrator = new WorkflowOrchestrator();
