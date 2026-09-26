/**
 * GoalMills Social Engine — Service Entry Point
 *
 * Microservice responsible for automated multi-platform social media posting:
 * - Matchday graphic generation (Weekly fixtures, HT scorecards, FT scorecards, Pre-match)
 * - AI text generation via Google Gemini API
 * - 7 platform adapters (Twitter/X, Telegram, WhatsApp, Facebook, LinkedIn, YouTube, TikTok)
 * - Real-time match state polling and cron scheduler
 * - Express HTTP API for admin UI controls and webhooks
 */

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { connectDB } from './utils/db';
import { logger } from './utils/logger';
import { scheduler } from './scheduler';
import { orchestrator } from './workflows/orchestrator';
import { distributor } from './platforms/distributor';
import SocialPost from './models/SocialPost';
import SocialPlatformConfig from './models/SocialPlatformConfig';

import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for admin dashboard and internal microservice requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '20mb' }));

// ── 1. Health & Status ──

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'goalmills-social-engine',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/status', async (_req: Request, res: Response) => {
  try {
    const tasks = scheduler.getTasks();
    const adapters = distributor.getAllAdapters().map((a) => ({
      name: a.name,
      displayName: a.displayName,
      isConfigured: a.isConfigured(),
    }));

    const totalPosts = await SocialPost.countDocuments();
    const postsToday = await SocialPost.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    res.json({
      success: true,
      service: 'goalmills-social-engine',
      uptime: process.uptime(),
      platforms: adapters,
      scheduledTasks: tasks,
      metrics: {
        totalPosts,
        postsToday,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 2. Platform Management & Test ──

app.get('/api/platforms', async (_req: Request, res: Response) => {
  try {
    const adapters = distributor.getAllAdapters();
    const configs = await SocialPlatformConfig.find();
    const configMap = new Map(configs.map((c) => [c.platform, c]));

    const platforms = adapters.map((adapter) => {
      const dbConfig = configMap.get(adapter.name);
      return {
        platform: adapter.name,
        displayName: adapter.displayName,
        isConfigured: adapter.isConfigured(),
        enabled: dbConfig ? dbConfig.enabled : adapter.isConfigured(),
        healthStatus: dbConfig?.healthStatus || (adapter.isConfigured() ? 'healthy' : 'unconfigured'),
        lastSuccessAt: dbConfig?.lastSuccessAt,
        lastError: dbConfig?.lastError,
        enabledPostTypes: dbConfig?.enabledPostTypes || [],
      };
    });

    res.json({ success: true, platforms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/test-platform/:platform', async (req: Request, res: Response) => {
  const platform = String(req.params.platform);
  try {
    const result = await distributor.testPlatform(platform);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, platform, error: err.message });
  }
});

// ── 3. Workflow Triggers (Manual & Webhook) ──

app.post('/api/trigger/:workflow', async (req: Request, res: Response) => {
  const { workflow } = req.params;
  const { leagueId, platforms } = req.body || {};

  logger.info(`Received manual trigger request for workflow: ${workflow}`);

  try {
    switch (workflow) {
      case 'weekly-fixtures': {
        const result = await orchestrator.runWeeklyFixtures(leagueId, platforms);
        return res.json({ success: true, workflow, result });
      }

      case 'pre-match': {
        const result = await orchestrator.runPreMatchReports(leagueId, platforms);
        return res.json({ success: true, workflow, result });
      }

      case 'live-poll': {
        const result = await orchestrator.runLivePolling(platforms);
        return res.json({ success: true, workflow, result });
      }

      case 'post-match': {
        const result = await orchestrator.runPostMatchReports(platforms);
        return res.json({ success: true, workflow, result });
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown workflow '${workflow}'. Valid: weekly-fixtures, pre-match, live-poll, post-match`,
        });
    }
  } catch (err: any) {
    logger.error(`Error triggering workflow ${workflow}`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 4. Custom Manual Post Dispatch ──

app.post('/api/dispatch', async (req: Request, res: Response) => {
  const {
    text,
    headline,
    linkUrl,
    postType,
    platforms,
    leagueId,
    leagueName,
    matchId,
    homeTeam,
    awayTeam,
    imageBase64,
    imageUrl,
  } = req.body || {};

  if (!text && !headline) {
    return res.status(400).json({ success: false, error: 'text or headline is required' });
  }

  try {
    let imageBuffer: Buffer | undefined;
    if (imageBase64) {
      imageBuffer = Buffer.from(imageBase64, 'base64');
    } else if (imageUrl) {
      try {
        const imgRes = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 8000,
        });
        imageBuffer = Buffer.from(imgRes.data);
      } catch (err: any) {
        logger.warn(`Could not download image from ${imageUrl}: ${err.message}`);
      }
    }

    // Build complete text if headline and linkUrl provided
    let fullText = text || '';
    if (headline && !fullText.includes(headline)) {
      fullText = fullText ? `${headline}\n\n${fullText}` : headline;
    }
    if (linkUrl && !fullText.includes(linkUrl)) {
      fullText = `${fullText}\n\n🔗 ${linkUrl}`;
    }

    const summary = await orchestrator.dispatchManualPost(
      {
        text: fullText,
        imageBuffer,
        postType: postType || 'manual',
        leagueId,
        leagueName,
        matchId,
        homeTeam,
        awayTeam,
      },
      platforms || 'all'
    );

    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5. Post History & Retry ──

app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const platform = req.query.platform as string;
    const status = req.query.status as string;
    const postType = req.query.postType as string;

    const filter: any = {};
    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    if (postType) filter.postType = postType;

    const [posts, total] = await Promise.all([
      SocialPost.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SocialPost.countDocuments(filter),
    ]);

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/posts/:id/retry', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await SocialPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const adapter = distributor.getAdapter(post.platform);
    if (!adapter) {
      return res.status(400).json({ success: false, error: `Adapter for ${post.platform} not available` });
    }

    const result = await adapter.postText(post.content);

    if (result.success) {
      post.status = 'posted';
      post.platformPostId = result.platformPostId;
      post.platformPostUrl = result.url;
      post.postedAt = new Date();
      post.error = undefined;
    } else {
      post.status = 'failed';
      post.error = result.error;
      post.retryCount = (post.retryCount || 0) + 1;
    }

    await post.save();
    res.json({ success: result.success, post, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Startup & Lifecycle ──

async function bootstrap() {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Start Cron Scheduler
    scheduler.init();

    // 3. Start Express HTTP Server
    app.listen(PORT, () => {
      logger.info(`🚀 GoalMills Social Engine microservice running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Status API: http://localhost:${PORT}/api/status`);
    });
  } catch (err) {
    logger.error('Failed to start GoalMills Social Engine service', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully...');
  scheduler.stopAll();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down gracefully...');
  scheduler.stopAll();
  process.exit(0);
});

bootstrap();
