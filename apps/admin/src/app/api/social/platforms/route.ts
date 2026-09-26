import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import SocialPlatformConfig from '@/models/SocialPlatformConfig';

export const dynamic = 'force-dynamic';

const PLATFORM_METADATA = [
  {
    platform: 'telegram',
    displayName: 'Telegram',
    description: '100% Free Bot API. Broadcasts to public channel with instant photos and live scores.',
    requiredKeys: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHANNEL_ID'],
  },
  {
    platform: 'twitter',
    displayName: 'X / Twitter',
    description: 'Twitter API v2 Free Tier (1,500 posts/month). High-impact sports chatter and scorecards.',
    requiredKeys: ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET'],
  },
  {
    platform: 'facebook',
    displayName: 'Facebook Page',
    description: 'Graph API v21.0. Automatic posts to the GoalMills Facebook Page with scorecard albums.',
    requiredKeys: ['FACEBOOK_PAGE_ID', 'FACEBOOK_PAGE_ACCESS_TOKEN'],
  },
  {
    platform: 'whatsapp',
    displayName: 'WhatsApp Channel',
    description: 'WhatsApp Business Cloud API. Real-time broadcast alerts to subscribed supporters.',
    requiredKeys: ['WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_ACCESS_TOKEN'],
  },
  {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    description: 'LinkedIn Share API. Professional sports media summaries, corporate updates, and analytics.',
    requiredKeys: ['LINKEDIN_ORG_ID', 'LINKEDIN_ACCESS_TOKEN'],
  },
  {
    platform: 'youtube',
    displayName: 'YouTube',
    description: 'YouTube Data API v3. Community tab graphics and video short matchday highlights.',
    requiredKeys: ['YOUTUBE_CHANNEL_ID', 'YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'],
  },
  {
    platform: 'tiktok',
    displayName: 'TikTok',
    description: 'Content Posting API v2. Short-form video matchday cards and animated slides.',
    requiredKeys: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_ACCESS_TOKEN'],
  },
];

export async function GET() {
  try {
    await dbConnect();
    const configs = await SocialPlatformConfig.find().lean();
    const configMap = new Map(configs.map((c: any) => [c.platform, c]));

    const platforms = PLATFORM_METADATA.map((meta) => {
      const dbConfig: any = configMap.get(meta.platform);
      const isEnvConfigured = meta.requiredKeys.every((key) => Boolean(process.env[key]));

      return {
        platform: meta.platform,
        displayName: meta.displayName,
        description: meta.description,
        isConfigured: isEnvConfigured || Boolean(dbConfig?.credentials && Object.keys(dbConfig.credentials).length > 0),
        enabled: dbConfig ? dbConfig.enabled : isEnvConfigured,
        healthStatus: dbConfig?.healthStatus || (isEnvConfigured ? 'healthy' : 'unconfigured'),
        lastSuccessAt: dbConfig?.lastSuccessAt,
        lastError: dbConfig?.lastError,
        enabledPostTypes: dbConfig?.enabledPostTypes || [
          'weekly_fixtures',
          'pre_match',
          'ht_scorecard',
          'ft_scorecard',
          'post_match',
        ],
      };
    });

    return NextResponse.json({ success: true, platforms });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch platform configs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { platform, enabled, enabledPostTypes, testConnection } = body;

    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform name is required' },
        { status: 400 }
      );
    }

    // If testing connection, try proxying to the social engine microservice
    if (testConnection) {
      const engineUrl = process.env.SOCIAL_ENGINE_URL || 'http://localhost:4000';
      try {
        const testRes = await fetch(`${engineUrl}/api/test-platform/${platform}`, {
          method: 'POST',
        });
        const testData = await testRes.json();
        return NextResponse.json(testData);
      } catch (proxyErr) {
        return NextResponse.json({
          success: false,
          platform,
          error: `Social engine service unreachable at ${engineUrl}. Ensure microservice is running.`,
        });
      }
    }

    const updateFields: any = { updatedAt: new Date() };
    if (typeof enabled === 'boolean') updateFields.enabled = enabled;
    if (Array.isArray(enabledPostTypes)) updateFields.enabledPostTypes = enabledPostTypes;

    const updated = await SocialPlatformConfig.findOneAndUpdate(
      { platform },
      { $set: updateFields },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update platform config' },
      { status: 500 }
    );
  }
}
