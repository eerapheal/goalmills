import type {
  SocialPlatform,
  SocialPublishRequest,
  SocialPublishResponse,
  SocialGraphicOptions,
} from '@goalmills/contracts';
import { SocialEngineClient, socialEngineClient } from '@goalmills/contracts';

export interface ArticleForSocial {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  sportSlug?: string;
  tags?: string[];
  imageUrl?: string;
}

/**
 * Formats social media text content tailored to each platform's constraints.
 */
export function formatSocialCopy(
  article: ArticleForSocial,
  platform: SocialPlatform,
  siteUrl: string = 'https://goalmills.com'
): { text: string; hashtags: string[]; linkUrl: string } {
  const linkUrl = `${siteUrl}/news/${article.slug}`;
  const baseTags = (article.tags || []).slice(0, 3).map((t) => `#${t.replace(/\s+/g, '')}`);
  if (article.sportSlug && !baseTags.includes(`#${article.sportSlug}`)) {
    baseTags.push(`#${article.sportSlug}`);
  }

  switch (platform) {
    case 'twitter': {
      // 280-char limit: allocate ~200 chars for text + link + hashtags
      const tagStr = baseTags.slice(0, 2).join(' ');
      const availableTextLen = 280 - (linkUrl.length + tagStr.length + 6);
      let text = article.title;
      if (text.length > availableTextLen) {
        text = text.slice(0, availableTextLen - 3) + '...';
      }
      return {
        text: `${text}\n\n${linkUrl} ${tagStr}`,
        hashtags: baseTags.slice(0, 2),
        linkUrl,
      };
    }

    case 'telegram': {
      const text = `🚨 *BREAKING SPORTS NEWS*\n\n*${article.title}*\n\n${article.excerpt}\n\n👉 Read full story: ${linkUrl}`;
      return { text, hashtags: baseTags, linkUrl };
    }

    case 'whatsapp': {
      const text = `*GoalMills Sports Update*\n\n*${article.title}*\n\n${article.excerpt}\n\nRead more at ${linkUrl}`;
      return { text, hashtags: baseTags, linkUrl };
    }

    case 'facebook': {
      const text = `${article.title}\n\n${article.excerpt}\n\nStay ahead of the game on GoalMills. Full coverage and stats at the link below.`;
      return { text, hashtags: baseTags, linkUrl };
    }

    case 'linkedin': {
      const text = `Sports Media & Intelligence: ${article.title}\n\n${article.excerpt}\n\nIn-depth analysis and editorial coverage: ${linkUrl}`;
      return { text, hashtags: baseTags, linkUrl };
    }

    case 'youtube': {
      const text = `${article.title}\n\n${article.excerpt}\n\nSubscribe to GoalMills for tactical analysis, match highlights, and live score updates.\n\nRead more: ${linkUrl}`;
      return { text, hashtags: baseTags, linkUrl };
    }

    default:
      return {
        text: `${article.title}\n\n${article.excerpt}\n\n${linkUrl}`,
        hashtags: baseTags,
        linkUrl,
      };
  }
}

/**
 * Orchestrates multi-platform social publication for GoalMills editorial content.
 */
export class SocialPublisher {
  private client: SocialEngineClient;

  constructor(client: SocialEngineClient = socialEngineClient) {
    this.client = client;
  }

  async publishArticle(
    article: ArticleForSocial,
    platforms: SocialPlatform[],
    includeGraphic: boolean = false
  ): Promise<SocialPublishResponse> {
    const primaryCopy = formatSocialCopy(article, platforms[0] || 'twitter');

    let graphic: SocialGraphicOptions | undefined;
    if (includeGraphic) {
      graphic = {
        template: 'breaking_news',
        title: article.title,
        subtitle: article.sportSlug?.toUpperCase() || 'SPORTS',
        aspectRatio: '16:9',
      };
    }

    const request: SocialPublishRequest = {
      id: `pub_${article.id}_${Date.now()}`,
      platforms,
      content: {
        text: primaryCopy.text,
        hashtags: primaryCopy.hashtags,
        linkUrl: primaryCopy.linkUrl,
      },
      graphic,
      mediaUrls: article.imageUrl ? [article.imageUrl] : undefined,
      sourceContext: {
        articleId: article.id,
        sport: article.sportSlug,
      },
    };

    return this.client.publish(request);
  }
}

export const socialPublisher = new SocialPublisher();
