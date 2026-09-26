/**
 * GoalMills Social Engine — Cron Job Orchestrator
 *
 * Schedules and runs all automated tasks via node-cron:
 * - Weekly Upcoming Fixtures (Mondays 09:00 UTC & Thursdays 12:00 UTC)
 * - Daily Pre-Match Reports (10:00 UTC — 2 days ahead of matchday)
 * - Live Match Polling (Every 60 seconds on match days)
 * - Post-Match Analysis (Every 10 minutes)
 * - Daily Database Hygiene (03:00 UTC)
 */

import cron from 'node-cron';
import { orchestrator } from './workflows/orchestrator';
import { logger } from './utils/logger';

export interface ScheduledTaskInfo {
  id: string;
  name: string;
  schedule: string;
  description: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

class SocialScheduler {
  private tasks: Map<string, { task: cron.ScheduledTask; info: ScheduledTaskInfo }> = new Map();
  private isInitialized = false;

  /**
   * Initialize and start all scheduled automation tasks.
   */
  init(): void {
    if (this.isInitialized) {
      logger.warn('Scheduler already initialized');
      return;
    }

    logger.info('Initializing GoalMills Social Engine Cron Scheduler...');

    // 1. Weekly Upcoming Fixtures (Mondays 09:00 UTC)
    this.registerTask({
      id: 'weekly_fixtures_mon',
      name: 'Weekly Fixtures Announcement',
      schedule: '0 9 * * 1',
      description: 'Generates upcoming fixture graphics & AI previews for Top 5 leagues',
      enabled: true,
      handler: async () => {
        logger.info('[CRON] Running Weekly Fixtures Announcement (Monday 09:00 UTC)...');
        await orchestrator.runWeeklyFixtures();
      },
    });

    // 2. Midweek / Weekend Matchday Kickoff Graphics (Thursdays 12:00 UTC — 2 days before weekend)
    this.registerTask({
      id: 'weekend_fixtures_thu',
      name: 'Weekend Matchday Preview',
      schedule: '0 12 * * 4',
      description: 'Generates weekend matchday previews 2 days before Saturday fixtures',
      enabled: true,
      handler: async () => {
        logger.info('[CRON] Running Weekend Fixtures Preview (Thursday 12:00 UTC)...');
        await orchestrator.runWeeklyFixtures();
      },
    });

    // 3. Daily Pre-Match Reports (Daily 10:00 UTC — checks matches in 2 days)
    this.registerTask({
      id: 'daily_pre_match',
      name: 'Pre-Match 48h Previews',
      schedule: '0 10 * * *',
      description: 'Finds marquee matches occurring in 2 days, generates clash cards & predictions',
      enabled: true,
      handler: async () => {
        logger.info('[CRON] Running Daily Pre-Match Previews (10:00 UTC)...');
        await orchestrator.runPreMatchReports();
      },
    });

    // 4. Live Match Scorecard Poller (Every 60s)
    this.registerTask({
      id: 'live_match_poller',
      name: 'Live Match State Tracker',
      schedule: '* * * * *',
      description: 'Polls active matches every 60s; detects HT/FT transitions and immediately publishes scorecards',
      enabled: true,
      handler: async () => {
        await orchestrator.runLivePolling();
      },
    });

    // 5. Post-Match Tactical Analysis (Every 10 minutes)
    this.registerTask({
      id: 'post_match_analyzer',
      name: 'Post-Match Report Analyzer',
      schedule: '*/10 * * * *',
      description: 'Checks for matches concluded 25-60m ago and publishes comprehensive post-match reports with MOTM',
      enabled: true,
      handler: async () => {
        await orchestrator.runPostMatchReports();
      },
    });

    // 6. Daily Database Record Cleanup (Daily 03:00 UTC)
    this.registerTask({
      id: 'daily_cleanup',
      name: 'Match State Database Cleanup',
      schedule: '0 3 * * *',
      description: 'Purges match state tracking records older than 7 days',
      enabled: true,
      handler: async () => {
        logger.info('[CRON] Running daily match state cleanup...');
        await orchestrator.runDailyCleanup();
      },
    });

    this.isInitialized = true;
    logger.info(`Scheduler running with ${this.tasks.size} registered tasks`);
  }

  /**
   * Register a scheduled cron task.
   */
  private registerTask(options: {
    id: string;
    name: string;
    schedule: string;
    description: string;
    enabled: boolean;
    handler: () => Promise<void>;
  }) {
    const info: ScheduledTaskInfo = {
      id: options.id,
      name: options.name,
      schedule: options.schedule,
      description: options.description,
      enabled: options.enabled,
    };

    const task = cron.schedule(
      options.schedule,
      async () => {
        if (!info.enabled) return;
        info.lastRun = new Date();
        try {
          await options.handler();
        } catch (err) {
          logger.error(`Error executing cron task ${options.id}`, err);
        }
      },
      { scheduled: true }
    );

    this.tasks.set(options.id, { task, info });
  }

  /**
   * Get all registered scheduled tasks and their metadata.
   */
  getTasks(): ScheduledTaskInfo[] {
    return Array.from(this.tasks.values()).map((t) => t.info);
  }

  /**
   * Toggle a task enable/disable.
   */
  setTaskEnabled(taskId: string, enabled: boolean): boolean {
    const entry = this.tasks.get(taskId);
    if (!entry) return false;
    entry.info.enabled = enabled;
    logger.info(`Scheduler task ${taskId} is now ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  /**
   * Stop all tasks gracefully.
   */
  stopAll(): void {
    logger.info('Stopping all scheduler tasks...');
    for (const { task } of this.tasks.values()) {
      task.stop();
    }
    this.isInitialized = false;
  }
}

export const scheduler = new SocialScheduler();
