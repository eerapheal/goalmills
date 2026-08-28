import dbConnect from '@/lib/db';
import News from '@/models/News';
import type { NewsletterArticlePreview, NewsletterFrequency } from '@goalmills/types';

export interface CuratedDigest {
  title: string;
  previewText: string;
  frequency: NewsletterFrequency | 'custom_broadcast';
  articles: NewsletterArticlePreview[];
  editorialNote?: string;
}

/**
 * Randomly shuffle an array (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format Mongoose news document to newsletter article preview
 */
export function formatArticlePreview(doc: any): NewsletterArticlePreview {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug || doc._id.toString(),
    excerpt: doc.excerpt || '',
    image: doc.image || '',
    category: doc.category || 'Football',
    sport: doc.sport || 'Football',
    readTime: doc.readTime || 3,
    isBreaking: !!doc.isBreaking,
    isFeatured: !!doc.isFeatured,
    views: doc.views || 0,
    author: doc.author || 'GoalMills Editorial',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Curate news articles based on newsletter frequency tier
 * - Daily: Randomly selects published Breaking News + Editor's Picks (last 48h)
 * - Weekly: Top Most Read stories from the last 7 days
 * - Monthly: Top Most Read stories from the last 30 days
 */
export async function curateNewsletterArticles(
  frequency: NewsletterFrequency,
  maxArticles = 5
): Promise<CuratedDigest> {
  await dbConnect();

  const now = new Date();

  if (frequency === 'daily' || frequency === 'all') {
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // 1. Fetch published breaking stories & featured editor picks from recent window
    const [breakingDocs, featuredDocs, recentGeneralDocs] = await Promise.all([
      News.find({
        status: 'published',
        isBreaking: true,
        createdAt: { $gte: twoDaysAgo },
      })
        .sort({ createdAt: -1 })
        .limit(10),
      News.find({
        status: 'published',
        isFeatured: true,
        createdAt: { $gte: twoDaysAgo },
      })
        .sort({ createdAt: -1 })
        .limit(10),
      News.find({
        status: 'published',
        createdAt: { $gte: twoDaysAgo },
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(15),
    ]);

    // Randomize candidates to give subscribers fresh, varied digests
    const shuffledBreaking = shuffleArray(breakingDocs.map(formatArticlePreview));
    const shuffledFeatured = shuffleArray(featuredDocs.map(formatArticlePreview));
    const shuffledGeneral = shuffleArray(recentGeneralDocs.map(formatArticlePreview));

    const selectedMap = new Map<string, NewsletterArticlePreview>();

    // Prioritize at least 1-2 breaking news
    for (const art of shuffledBreaking) {
      if (selectedMap.size >= Math.ceil(maxArticles / 2)) break;
      selectedMap.set(art._id, art);
    }

    // Add editor's picks
    for (const art of shuffledFeatured) {
      if (selectedMap.size >= maxArticles) break;
      if (!selectedMap.has(art._id)) {
        selectedMap.set(art._id, art);
      }
    }

    // Fill remaining spots with top general stories if needed
    for (const art of shuffledGeneral) {
      if (selectedMap.size >= maxArticles) break;
      if (!selectedMap.has(art._id)) {
        selectedMap.set(art._id, art);
      }
    }

    // Fallback: If still empty, grab any latest published news
    if (selectedMap.size === 0) {
      const fallbackDocs = await News.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(maxArticles);
      fallbackDocs.forEach((doc) => selectedMap.set(doc._id.toString(), formatArticlePreview(doc)));
    }

    const articles = Array.from(selectedMap.values());
    const dateFormatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    const topTitle = articles[0]?.title || 'Daily Football & Sports Brief';

    return {
      title: `⚡ GoalMills Daily: ${topTitle}`,
      previewText: `Today's top breaking stories and editor picks (${dateFormatted})`,
      frequency: 'daily',
      articles,
      editorialNote: `Here is your 10:00 AM curated daily digest featuring the top breaking updates and editor-selected analysis from the GoalMills newsroom.`,
    };
  }

  if (frequency === 'weekly') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyTopDocs = await News.find({
      status: 'published',
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(maxArticles);

    let articles = weeklyTopDocs.map(formatArticlePreview);

    if (articles.length === 0) {
      const fallback = await News.find({ status: 'published' })
        .sort({ views: -1, createdAt: -1 })
        .limit(maxArticles);
      articles = fallback.map(formatArticlePreview);
    }

    return {
      title: `🏆 GoalMills Week in Review: Top Read Sports Stories`,
      previewText: `The most-read headlines, tactical breakdowns, and viral highlights of the week`,
      frequency: 'weekly',
      articles,
      editorialNote: `Your weekly roundup of the most discussed and viewed stories across European leagues and world sports.`,
    };
  }

  // Monthly
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthlyTopDocs = await News.find({
    status: 'published',
    createdAt: { $gte: thirtyDaysAgo },
  })
    .sort({ views: -1, createdAt: -1 })
    .limit(maxArticles);

  let articles = monthlyTopDocs.map(formatArticlePreview);
  if (articles.length === 0) {
    const fallback = await News.find({ status: 'published' })
      .sort({ views: -1, createdAt: -1 })
      .limit(maxArticles);
    articles = fallback.map(formatArticlePreview);
  }

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return {
    title: `🌟 GoalMills Monthly Edition: ${monthName} Sports Retrospective`,
    previewText: `The highest-performing stories, transfer debriefs, and match analysis from this month`,
    frequency: 'monthly',
    articles,
    editorialNote: `A comprehensive monthly retrospective highlighting the biggest moments in sports over the past 30 days.`,
  };
}

/**
 * Generate responsive HTML newsletter email
 */
export function generateNewsletterHTML(params: {
  title: string;
  previewText?: string;
  editorialNote?: string;
  frequency: string;
  articles: NewsletterArticlePreview[];
  siteUrl: string;
  unsubscribeUrl: string;
}): string {
  const { title, previewText, editorialNote, frequency, articles, siteUrl, unsubscribeUrl } = params;
  const year = new Date().getFullYear();
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const articleCards = articles
    .map((art) => {
      const articleLink = `${siteUrl}/news/${art.slug || art._id}`;
      const badgeHtml = art.isBreaking
        ? `<span style="background:#ef4444;color:#ffffff;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:900;text-transform:uppercase;display:inline-block;margin-bottom:8px;">⚡ Breaking News</span>`
        : art.isFeatured
          ? `<span style="background:#8b5cf6;color:#ffffff;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:900;text-transform:uppercase;display:inline-block;margin-bottom:8px;">⭐ Editor's Pick</span>`
          : '';

      const imageHtml = art.image
        ? `<img src="${art.image}" alt="${art.title}" style="width:100%;height:210px;object-fit:cover;display:block;border-top-left-radius:16px;border-top-right-radius:16px;background-color:#1e293b;" />`
        : '';

      return `
      <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:18px;overflow:hidden;margin-bottom:20px;">
        ${imageHtml}
        <div style="padding:18px;">
          ${badgeHtml}
          <h2 style="font-size:17px;font-weight:800;line-height:1.35;margin:0 0 8px;color:#ffffff;">
            <a href="${articleLink}" style="color:#ffffff;text-decoration:none;">${art.title}</a>
          </h2>
          <p style="font-size:13px;line-height:1.5;color:#94a3b8;margin:0 0 12px;">${art.excerpt}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:#f59e0b;">
            <span>${art.category} • ${art.readTime} min read</span>
            <a href="${articleLink}" style="color:#f59e0b;text-decoration:none;font-weight:800;">Read Story &rarr;</a>
          </div>
        </div>
      </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#070b1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0 20px;border-bottom:1px solid rgba(255,255,255,0.1);">
      <a href="${siteUrl}" style="font-size:26px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
        Goal<span style="color:#f59e0b;">Mills</span>
      </a>
      <div style="margin-top:10px;">
        <span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.3);">
          ${frequency.toUpperCase()} DIGEST • ${dateFormatted}
        </span>
      </div>
    </div>

    ${
      previewText
        ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</div>`
        : ''
    }

    <!-- Editorial Note -->
    ${
      editorialNote
        ? `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px 18px;margin:24px 0;font-size:13px;line-height:1.6;color:#cbd5e1;">
            <strong style="color:#f59e0b;">Newsroom Dispatch:</strong> ${editorialNote}
          </div>`
        : ''
    }

    <!-- Articles Feed -->
    <div style="margin-top:24px;">
      ${articleCards}
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0;">
      <a href="${siteUrl}" style="display:inline-block;background:#f59e0b;color:#020617;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;padding:12px 24px;border-radius:14px;text-decoration:none;box-shadow:0 10px 25px -5px rgba(245,158,11,0.3);">
        Explore Live Match Centre & Highlights &rarr;
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:28px 16px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:#64748b;line-height:1.6;">
      <p style="margin:0 0 4px;">© ${year} GoalMills Sports Media. All rights reserved.</p>
      <p style="margin:0 0 10px;">You are receiving this digest because you subscribed to GoalMills Sports Alerts.</p>
      <p style="margin:0;">
        <a href="${unsubscribeUrl}" style="color:#f59e0b;text-decoration:underline;">Unsubscribe or Change Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
