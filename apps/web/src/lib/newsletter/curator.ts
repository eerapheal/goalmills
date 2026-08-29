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
  const { title, previewText, editorialNote, frequency, articles, siteUrl, unsubscribeUrl } =
    params;
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

/**
 * Fetch top Editor's Pick news posts for confirmation & welcome emails
 * Prioritizes published articles marked as isFeatured, then isBreaking or top viewed
 */
export async function getEditorPickArticles(count = 2): Promise<NewsletterArticlePreview[]> {
  await dbConnect();

  try {
    // 1. Fetch featured articles
    const featuredDocs = await News.find({
      status: 'published',
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(count * 2);

    let articles = featuredDocs.map(formatArticlePreview);

    // 2. If fewer than requested count, backfill with breaking or latest high-traffic published stories
    if (articles.length < count) {
      const existingIds = articles.map((a) => a._id);
      const backfillDocs = await News.find({
        status: 'published',
        _id: { $nin: existingIds },
      })
        .sort({ isBreaking: -1, views: -1, createdAt: -1 })
        .limit(count - articles.length);

      articles = articles.concat(backfillDocs.map(formatArticlePreview));
    }

    // 3. Fallback: If still empty (e.g. fresh database), return realistic fallback preview objects
    if (articles.length === 0) {
      return [
        {
          _id: 'featured-1',
          title:
            'Champions League Tactical Masterclass: How Midfield Transitions Decided the Clash',
          slug: 'champions-league-tactical-masterclass',
          excerpt:
            'An in-depth tactical analysis on modern pressing schemes, midfield overloads, and decisive penalty box execution.',
          image:
            'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
          category: 'Tactical Analysis',
          sport: 'Football',
          readTime: 4,
          isBreaking: false,
          isFeatured: true,
          views: 1420,
          author: 'GoalMills Chief Tactician',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'featured-2',
          title: 'Transfer Radar: Top European Clubs Race for Emerging Wonderkid Playmaker',
          slug: 'transfer-radar-emerging-wonderkid',
          excerpt:
            'Exclusive scouting reports and insider transfer negotiations as top European giants submit priority inquiries.',
          image:
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
          category: 'Transfer Radar',
          sport: 'Football',
          readTime: 3,
          isBreaking: true,
          isFeatured: true,
          views: 2150,
          author: 'GoalMills Transfer Desk',
          createdAt: new Date().toISOString(),
        },
      ].slice(0, count);
    }

    return articles.slice(0, count);
  } catch (err) {
    console.error('Error fetching editor pick articles:', err);
    return [
      {
        _id: 'default-1',
        title: 'Champions League Tactical Masterclass: How Midfield Transitions Decided the Clash',
        slug: 'champions-league-tactical-masterclass',
        excerpt:
          'An in-depth tactical breakdown on modern pressing schemes and decisive match execution.',
        image:
          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
        category: 'Tactical Analysis',
        sport: 'Football',
        readTime: 4,
        isBreaking: false,
        isFeatured: true,
        views: 1200,
        author: 'GoalMills Editorial',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'default-2',
        title: 'Transfer Radar: Inside the High-Stakes Race for European Football Talent',
        slug: 'transfer-radar-european-talent',
        excerpt:
          'Exclusive scouting reports and insider negotiations shaping the upcoming transfer window.',
        image:
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
        category: 'Transfer Radar',
        sport: 'Football',
        readTime: 3,
        isBreaking: true,
        isFeatured: true,
        views: 1850,
        author: 'GoalMills Transfer Desk',
        createdAt: new Date().toISOString(),
      },
    ].slice(0, count);
  }
}

export interface ConfirmationEmailParams {
  subscriberEmail: string;
  frequency: string;
  categories?: string[];
  confirmationUrl: string;
  unsubscribeUrl: string;
  siteUrl: string;
  editorPicks: NewsletterArticlePreview[];
  requireDoubleOptIn?: boolean;
}

/**
 * Generate a professionally designed, bulletproof HTML email template
 * confirming subscription and showcasing two curated Editor's Pick posts.
 */
export function generateConfirmationEmailHTML(params: ConfirmationEmailParams): string {
  const {
    subscriberEmail,
    frequency,
    categories = [],
    confirmationUrl,
    unsubscribeUrl,
    siteUrl,
    editorPicks,
    requireDoubleOptIn = false,
  } = params;

  const year = new Date().getFullYear();
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedFrequency = frequency
    ? frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase()
    : 'Daily';

  // Render the 2 Editor Pick Post Cards
  const editorPicksHtml = editorPicks
    .slice(0, 2)
    .map((art, idx) => {
      const articleLink = `${siteUrl}/news/${art.slug || art._id}`;
      const badgeLabel = art.isBreaking ? '⚡ Breaking News' : "⭐ Editor's Pick";
      const badgeColor = art.isBreaking ? '#ef4444' : '#8b5cf6';
      const imageTag = art.image
        ? `<img src="${art.image}" alt="${art.title}" width="100%" style="width:100%;height:180px;object-fit:cover;display:block;border-top-left-radius:14px;border-top-right-radius:14px;background-color:#1e293b;" />`
        : `<div style="height:120px;background:linear-gradient(135deg,#1e1b4b,#0f172a);display:flex;align-items:center;justify-content:center;border-top-left-radius:14px;border-top-right-radius:14px;text-align:center;padding:12px;"><span style="color:#f59e0b;font-size:24px;font-weight:900;">GOALMILLS POST #${idx + 1}</span></div>`;

      return `
    <!-- Post Card ${idx + 1} -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:18px;background:#0d1527;border:1px solid rgba(245,158,11,0.22);border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.35);">
      <tr>
        <td style="padding:0;">
          <a href="${articleLink}" style="text-decoration:none;display:block;">
            ${imageTag}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 18px 18px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding-bottom:8px;">
                <span style="display:inline-block;padding:3px 8px;border-radius:6px;background:${badgeColor};color:#ffffff;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.04em;">
                  ${badgeLabel}
                </span>
                <span style="display:inline-block;margin-left:6px;color:#94a3b8;font-size:11px;font-weight:600;">
                  • ${art.category || 'Football'}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:10px;">
                <a href="${articleLink}" style="color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;line-height:1.35;display:block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                  ${art.title}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:14px;">
                <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                  ${art.excerpt}
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="left" style="color:#64748b;font-size:11px;font-weight:600;">
                      ⏱ ${art.readTime || 3} min read
                    </td>
                    <td align="right">
                      <a href="${articleLink}" style="display:inline-block;color:#f59e0b;text-decoration:none;font-size:12px;font-weight:800;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                        Read Full Story &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `;
    })
    .join('');

  const preheaderSnippet = requireDoubleOptIn
    ? `Please confirm your subscription to GoalMills Newsletters. Plus, explore 2 exclusive Editor's Pick posts today.`
    : `You're officially confirmed for GoalMills ${formattedFrequency} Sports Alerts! Check out today's top 2 Editor's Picks.`;

  const heroHeadline = requireDoubleOptIn
    ? `Confirm Your Subscription`
    : `You're Subscribed! Welcome to GoalMills`;

  const heroSubtitle = requireDoubleOptIn
    ? `Please click the button below to verify your email address and start receiving high-impact sports intelligence delivered at 10:00 AM WAT.`
    : `Your subscription to GoalMills ${formattedFrequency} Sports Alerts is now active. Get ready for breaking scoops, tactical breakdowns, and matchday insights.`;

  const ctaButtonText = requireDoubleOptIn
    ? `Confirm Subscription Now &rarr;`
    : `Explore Live Match Centre & News &rarr;`;

  const primaryActionUrl = requireDoubleOptIn ? confirmationUrl : siteUrl;

  const categoriesBadge =
    categories && categories.length > 0
      ? categories
          .map(
            (c) =>
              `<span style="display:inline-block;background:rgba(255,255,255,0.08);color:#cbd5e1;padding:2px 8px;border-radius:6px;font-size:11px;margin-right:4px;margin-bottom:4px;">${c}</span>`
          )
          .join('')
      : '<span style="color:#94a3b8;font-size:11px;">All Sports & Leagues</span>';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heroHeadline} - GoalMills Sports</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#050814;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#ffffff;line-height:1.5;">

  <!-- Hidden Preheader Preview Text for Email Clients -->
  <div style="display:none;font-size:1px;color:#050814;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
    ${preheaderSnippet}
  </div>

  <!-- Email Wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#050814;table-layout:fixed;">
    <tr>
      <td align="center" style="padding:24px 12px 36px;">
        
        <!-- Main Email Container (Max 600px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:#090e21;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Accent Gradient Bar -->
          <tr>
            <td height="4" style="background:linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%);"></td>
          </tr>

          <!-- Header / Branding -->
          <tr>
            <td align="center" style="padding:28px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.06);background:#070b1a;">
              <a href="${siteUrl}" style="text-decoration:none;display:inline-block;">
                <span style="font-size:28px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;color:#ffffff;">
                  GOAL<span style="color:#f59e0b;">MILLS</span>
                </span>
              </a>
              <div style="margin-top:8px;">
                <span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;background:rgba(245,158,11,0.12);color:#fbbf24;border:1px solid rgba(245,158,11,0.3);">
                  ⚽ SPORTS INTELLIGENCE • ${dateFormatted}
                </span>
              </div>
            </td>
          </tr>

          <!-- Hero Confirmation Section -->
          <tr>
            <td style="padding:32px 28px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <div style="width:52px;height:52px;line-height:52px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.4);border-radius:50%;text-align:center;font-size:24px;display:inline-block;">
                      ✓
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.3px;line-height:1.3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                      ${heroHeadline}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;max-width:480px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                      ${heroSubtitle}
                    </p>
                  </td>
                </tr>

                <!-- Primary CTA Button -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background:#f59e0b;border-radius:12px;box-shadow:0 8px 20px -4px rgba(245,158,11,0.4);">
                          <a href="${primaryActionUrl}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:900;color:#050814;text-decoration:none;text-transform:uppercase;letter-spacing:0.06em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                            ${ctaButtonText}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Subscription Summary Box -->
                <tr>
                  <td>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
                      <tr>
                        <td>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding-bottom:6px;font-size:12px;color:#94a3b8;font-weight:600;">
                                Subscriber Account:
                              </td>
                              <td align="right" style="padding-bottom:6px;font-size:12px;color:#ffffff;font-weight:700;">
                                ${subscriberEmail}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:6px;font-size:12px;color:#94a3b8;font-weight:600;">
                                Delivery Frequency:
                              </td>
                              <td align="right" style="padding-bottom:6px;font-size:12px;color:#fbbf24;font-weight:700;">
                                ${formattedFrequency} Digest (@ 10:00 AM WAT)
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size:12px;color:#94a3b8;font-weight:600;vertical-align:top;padding-top:2px;">
                                Selected Interests:
                              </td>
                              <td align="right" style="vertical-align:top;padding-top:2px;">
                                ${categoriesBadge}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Section Divider & Editor Picks Header -->
          <tr>
            <td style="padding:10px 28px 16px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <span style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:0.06em;color:#f59e0b;display:block;margin-bottom:4px;">
                            ⭐ EDITOR'S PICKS
                          </span>
                          <h2 style="margin:0;font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.2px;">
                            Two Stories Hand-Picked For You
                          </h2>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2 Editor Pick Articles -->
          <tr>
            <td style="padding:0 28px 16px;">
              ${editorPicksHtml}
            </td>
          </tr>

          <!-- Newsroom Dispatch / What to Expect Box -->
          <tr>
            <td style="padding:0 28px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(245,158,11,0.05);border:1px dashed rgba(245,158,11,0.3);border-radius:14px;padding:16px 18px;">
                <tr>
                  <td>
                    <h3 style="margin:0 0 6px;font-size:13px;font-weight:800;color:#fbbf24;text-transform:uppercase;letter-spacing:0.04em;">
                      ⚡ What to Expect in Your Inbox
                    </h3>
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#cbd5e1;">
                      Our newsroom monitors European leagues, continental tournaments, transfer developments, and match tactics 24/7. Expect concise, fluff-free digests curated every morning at <strong>10:00 AM WAT</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 24px;background:#050812;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${siteUrl}" style="font-size:16px;font-weight:900;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      GOAL<span style="color:#f59e0b;">MILLS</span>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px;font-size:11px;line-height:1.6;color:#64748b;">
                    <p style="margin:0 0 4px;">
                      GoalMills Sports Media • Global Football & Sports Intelligence
                    </p>
                    <p style="margin:0 0 4px;">
                      Victoria Island, Lagos & Central London • All Rights Reserved © ${year}
                    </p>
                    <p style="margin:0;">
                      You received this email because you subscribed on <a href="${siteUrl}" style="color:#94a3b8;text-decoration:underline;">goalmills.com</a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:8px;font-size:11px;color:#94a3b8;">
                    <a href="${primaryActionUrl}" style="color:#f59e0b;text-decoration:none;font-weight:700;margin:0 8px;">
                      Manage Preferences
                    </a>
                    <span style="color:#475569;">•</span>
                    <a href="${unsubscribeUrl}" style="color:#f59e0b;text-decoration:underline;font-weight:700;margin:0 8px;">
                      1-Click Unsubscribe
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:16px;font-size:10px;color:#475569;line-height:1.5;">
                    Deliverability Tip: Add <code>newsletter@goalmills.com</code> to your contacts or VIP senders list to ensure daily digests always land in your Primary inbox.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Container -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}
