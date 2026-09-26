import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import SocialPost from '@/models/SocialPost';
import SocialPlatformConfig from '@/models/SocialPlatformConfig';
import type { SocialPlatformHealth } from '@goalmills/types';

export const dynamic = 'force-dynamic';

const ALL_PLATFORMS = [
  'twitter',
  'telegram',
  'whatsapp',
  'facebook',
  'linkedin',
  'youtube',
  'tiktok',
] as const;

export async function GET() {
  try {
    await dbConnect();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [
      totalPosts,
      postsToday,
      postsThisWeek,
      successfulPosts,
      postsByPlatformRaw,
      postsByTypeRaw,
      platformConfigs,
    ] = await Promise.all([
      SocialPost.countDocuments(),
      SocialPost.countDocuments({ createdAt: { $gte: startOfToday } }),
      SocialPost.countDocuments({ createdAt: { $gte: startOfWeek } }),
      SocialPost.countDocuments({ status: 'posted' }),
      SocialPost.aggregate([
        { $group: { _id: '$platform', count: { $sum: 1 } } },
      ]),
      SocialPost.aggregate([
        { $group: { _id: '$postType', count: { $sum: 1 } } },
      ]),
      SocialPlatformConfig.find().lean(),
    ]);

    const successRate =
      totalPosts > 0 ? Math.round((successfulPosts / totalPosts) * 100) : 100;

    const postsByPlatform: Record<string, number> = {};
    for (const p of ALL_PLATFORMS) {
      postsByPlatform[p] = 0;
    }
    for (const item of postsByPlatformRaw) {
      if (item._id) postsByPlatform[item._id] = item.count;
    }

    const postsByType: Record<string, number> = {};
    for (const item of postsByTypeRaw) {
      if (item._id) postsByType[item._id] = item.count;
    }

    const configMap = new Map(platformConfigs.map((c: any) => [c.platform, c]));
    const platformHealth: Record<string, SocialPlatformHealth> = {};
    let activePlatforms = 0;

    for (const p of ALL_PLATFORMS) {
      const cfg: any = configMap.get(p);
      const isEnvConfigured = checkEnvConfigured(p);
      const health: SocialPlatformHealth = cfg?.healthStatus || (isEnvConfigured ? 'healthy' : 'unconfigured');
      platformHealth[p] = health;
      if (cfg?.enabled || (isEnvConfigured && cfg?.enabled !== false)) {
        activePlatforms++;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalPosts,
        postsToday,
        postsThisWeek,
        successRate,
        activePlatforms,
        totalPlatforms: ALL_PLATFORMS.length,
        trackedMatchesCount: 0,
        platformHealth,
        postsByPlatform,
        postsByType,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch social stats' },
      { status: 500 }
    );
  }
}

function checkEnvConfigured(platform: string): boolean {
  switch (platform) {
    case 'twitter':
      return Boolean(process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN);
    case 'telegram':
      return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID);
    case 'whatsapp':
      return Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
    case 'facebook':
      return Boolean(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
    case 'linkedin':
      return Boolean(process.env.LINKEDIN_ORG_ID && process.env.LINKEDIN_ACCESS_TOKEN);
    case 'youtube':
      return Boolean(process.env.YOUTUBE_CHANNEL_ID && process.env.YOUTUBE_CLIENT_ID);
    case 'tiktok':
      return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_ACCESS_TOKEN);
    default:
      return false;
  }
}
