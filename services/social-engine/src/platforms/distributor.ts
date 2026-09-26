/**
 * GoalMills Social Engine — Platform Distributor
 *
 * Central dispatcher that coordinates publishing content across all 7 platforms:
 * Twitter/X, Telegram, WhatsApp, Facebook, LinkedIn, YouTube, TikTok.
 *
 * Handles:
 * - Platform target filtering
 * - Deduplication checking (prevents double posting)
 * - Per-platform rate-limiting
 * - Cloudinary image asset upload
 * - Concurrency control with Promise.allSettled
 * - MongoDB SocialPost audit logging
 * - Platform health status updates
 */

import type {
  PlatformAdapter,
  PlatformPostResult,
  SocialContent,
  PlatformTarget,
} from './types';
import { twitterAdapter } from './twitter';
import { telegramAdapter } from './telegram';
import { whatsappAdapter } from './whatsapp';
import { facebookAdapter } from './facebook';
import { linkedinAdapter } from './linkedin';
import { youtubeAdapter } from './youtube';
import { tiktokAdapter } from './tiktok';
import { logger } from '../utils/logger';
import { isRateLimited, recordCall } from '../utils/rateLimiter';
import { uploadImage } from '../utils/cloudinary';
import SocialPost from '../models/SocialPost';
import SocialPlatformConfig from '../models/SocialPlatformConfig';

export interface DistributionSummary {
  totalAttempted: number;
  successCount: number;
  failedCount: number;
  imageUrl?: string;
  results: Record<string, PlatformPostResult>;
}

export class PlatformDistributor {
  private adapters: Map<string, PlatformAdapter> = new Map();

  constructor() {
    this.registerAdapter(twitterAdapter);
    this.registerAdapter(telegramAdapter);
    this.registerAdapter(whatsappAdapter);
    this.registerAdapter(facebookAdapter);
    this.registerAdapter(linkedinAdapter);
    this.registerAdapter(youtubeAdapter);
    this.registerAdapter(tiktokAdapter);
  }

  registerAdapter(adapter: PlatformAdapter): void {
    this.adapters.set(adapter.name.toLowerCase(), adapter);
  }

  getAdapter(name: string): PlatformAdapter | undefined {
    return this.adapters.get(name.toLowerCase());
  }

  getAllAdapters(): PlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Distribute content to the specified platform targets.
   *
   * @param content - Text, imageBuffer, videoBuffer, metadata
   * @param targets - 'all' or array of platform names (e.g. ['telegram', 'twitter'])
   * @param options - Additional dispatch options (skipDedupe, triggeredBy)
   */
  async distribute(
    content: SocialContent,
    targets: PlatformTarget = 'all',
    options?: { skipDedupe?: boolean; triggeredBy?: string }
  ): Promise<DistributionSummary> {
    const activeTargets: PlatformAdapter[] = [];
    const allAdapters = this.getAllAdapters();

    const targetArray = targets === 'all' ? 'all' : Array.isArray(targets) ? targets : [targets];

    for (const adapter of allAdapters) {
      const isTargeted =
        targetArray === 'all' ||
        targetArray.some((t) => {
          const norm = String(t).toLowerCase();
          if (adapter.name.toLowerCase() === 'twitter') {
            return norm === 'twitter' || norm === 'x_twitter' || norm === 'x';
          }
          return norm === adapter.name.toLowerCase();
        });

      if (isTargeted) {
        activeTargets.push(adapter);
      }
    }

    logger.info(
      `Distributing ${content.postType} across ${activeTargets.length} platform(s): ${activeTargets
        .map((a) => a.displayName)
        .join(', ')}`
    );

    // Optional Cloudinary upload so image URL is available for storage and social links
    let uploadedImageUrl: string | undefined;
    if (content.imageBuffer) {
      try {
        const upload = await uploadImage(
          content.imageBuffer,
          `goalmills/${content.postType}`
        );
        if (upload.success && upload.url) {
          uploadedImageUrl = upload.url;
        }
      } catch (err) {
        logger.warn('Failed to upload image to Cloudinary, continuing with raw buffers', err);
      }
    }

    const summary: DistributionSummary = {
      totalAttempted: activeTargets.length,
      successCount: 0,
      failedCount: 0,
      imageUrl: uploadedImageUrl,
      results: {},
    };

    // Dispatch concurrently to all targets
    const dispatchPromises = activeTargets.map(async (adapter) => {
      const platformName = adapter.name;

      // 1. Deduplication check (unless explicitly skipped)
      if (!options?.skipDedupe && content.matchId) {
        try {
          const existing = await SocialPost.findOne({
            platform: platformName,
            postType: content.postType,
            matchId: content.matchId,
            status: 'posted',
          });

          if (existing) {
            logger.info(
              `Deduplication hit: ${content.postType} for match ${content.matchId} already posted to ${platformName}`
            );
            summary.results[platformName] = {
              success: true,
              platform: platformName,
              platformPostId: existing.platformPostId,
              url: existing.platformPostUrl,
            };
            summary.successCount++;
            return;
          }
        } catch (dbErr) {
          logger.warn(`Deduplication check error for ${platformName}`, dbErr);
        }
      }

      // 2. Rate limit check
      if (isRateLimited(platformName)) {
        const rateLimitErr = `Rate limit exceeded for ${adapter.displayName}`;
        logger.warn(rateLimitErr);
        summary.results[platformName] = {
          success: false,
          platform: platformName,
          error: rateLimitErr,
        };
        summary.failedCount++;

        await this.logPost({
          platform: platformName,
          content,
          imageUrl: uploadedImageUrl,
          status: 'failed',
          error: rateLimitErr,
          triggeredBy: options?.triggeredBy,
        });
        return;
      }

      // 3. Configuration check
      if (!adapter.isConfigured()) {
        const configErr = `${adapter.displayName} is not configured with active credentials`;
        logger.debug(configErr);
        summary.results[platformName] = {
          success: false,
          platform: platformName,
          error: configErr,
        };
        summary.failedCount++;

        await this.updatePlatformHealth(platformName, 'unconfigured', configErr);
        return;
      }

      // 4. Execute post via appropriate method
      let postResult: PlatformPostResult;
      try {
        recordCall(platformName);

        if (content.videoBuffer && adapter.postVideo) {
          postResult = await adapter.postVideo(
            content.text,
            content.videoBuffer,
            content.imageAltText
          );
        } else if (content.imageBuffer) {
          postResult = await adapter.postImage(
            content.text,
            content.imageBuffer,
            content.imageAltText
          );
        } else {
          postResult = await adapter.postText(content.text);
        }
      } catch (postErr: any) {
        postResult = {
          success: false,
          platform: platformName,
          error: postErr.message || 'Unknown post error',
        };
      }

      summary.results[platformName] = postResult;

      if (postResult.success) {
        summary.successCount++;
        await this.updatePlatformHealth(platformName, 'healthy');
      } else {
        summary.failedCount++;
        await this.updatePlatformHealth(platformName, 'degraded', postResult.error);
      }

      // 5. Audit log to MongoDB SocialPost collection
      await this.logPost({
        platform: platformName,
        content,
        imageUrl: uploadedImageUrl,
        status: postResult.success ? 'posted' : 'failed',
        platformPostId: postResult.platformPostId,
        platformPostUrl: postResult.url,
        error: postResult.error,
        triggeredBy: options?.triggeredBy,
      });
    });

    await Promise.allSettled(dispatchPromises);

    logger.info(
      `Distribution finished: ${summary.successCount} succeeded, ${summary.failedCount} failed out of ${summary.totalAttempted}`
    );

    return summary;
  }

  /**
   * Test connection to a specific platform with a dummy heartbeat message.
   */
  async testPlatform(platformName: string): Promise<PlatformPostResult> {
    const adapter = this.getAdapter(platformName);
    if (!adapter) {
      return { success: false, platform: platformName, error: `Platform ${platformName} not found` };
    }

    if (!adapter.isConfigured()) {
      return {
        success: false,
        platform: platformName,
        error: `${adapter.displayName} is missing required environment variables or credentials`,
      };
    }

    try {
      const testContent = `⚽ [GoalMills Automation System Test] Connection verified at ${new Date().toISOString()}`;
      const result = await adapter.postText(testContent);
      if (result.success) {
        await this.updatePlatformHealth(platformName, 'healthy');
      } else {
        await this.updatePlatformHealth(platformName, 'degraded', result.error);
      }
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Connection test failed';
      await this.updatePlatformHealth(platformName, 'down', errorMsg);
      return { success: false, platform: platformName, error: errorMsg };
    }
  }

  /**
   * Log an audit trail entry in MongoDB SocialPost collection.
   */
  private async logPost(data: {
    platform: string;
    content: SocialContent;
    imageUrl?: string;
    status: 'posted' | 'failed';
    platformPostId?: string;
    platformPostUrl?: string;
    error?: string;
    triggeredBy?: string;
  }): Promise<void> {
    try {
      await SocialPost.create({
        platform: data.platform,
        postType: data.content.postType,
        matchId: data.content.matchId,
        leagueId: data.content.leagueId,
        leagueName: data.content.leagueName,
        homeTeam: data.content.homeTeam,
        awayTeam: data.content.awayTeam,
        content: data.content.text,
        imageUrl: data.imageUrl,
        platformPostId: data.platformPostId,
        platformPostUrl: data.platformPostUrl,
        status: data.status,
        error: data.error,
        postedAt: data.status === 'posted' ? new Date() : undefined,
        triggeredBy: data.triggeredBy || 'system_automation',
      });
    } catch (dbErr) {
      logger.error(`Failed to record post log in MongoDB for ${data.platform}`, dbErr);
    }
  }

  /**
   * Update the health status in MongoDB SocialPlatformConfig.
   */
  private async updatePlatformHealth(
    platform: string,
    healthStatus: 'healthy' | 'degraded' | 'down' | 'unconfigured',
    lastError?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        healthStatus,
        updatedAt: new Date(),
      };

      if (healthStatus === 'healthy') {
        updateData.lastSuccessAt = new Date();
        updateData.lastError = null;
      } else if (lastError) {
        updateData.lastError = lastError;
      }

      await SocialPlatformConfig.findOneAndUpdate(
        { platform },
        { $set: updateData },
        { upsert: true }
      );
    } catch (err) {
      logger.debug(`Failed to update platform config health for ${platform}`);
    }
  }
}

export const distributor = new PlatformDistributor();
