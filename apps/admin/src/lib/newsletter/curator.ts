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
 * Generate a clean SEO slug from text
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format Mongoose news document to newsletter article preview
 */
export function formatArticlePreview(doc: any): NewsletterArticlePreview {
  const safeSlug =
    doc.slug && !/^[0-9a-fA-F]{24}$/.test(doc.slug)
      ? doc.slug
      : doc.title
        ? slugify(doc.title)
        : doc._id.toString();

  return {
    _id: doc._id.toString(),
    title: doc.title,
    slug: safeSlug,
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
    // 1. Fetch pool of latest published news (up to 30) for daily randomized selection
    const candidateDocs = await News.find({
      status: 'published',
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const previews = candidateDocs.map(formatArticlePreview);

    // Prioritize breaking news if present in the pool
    const breaking = previews.filter((p) => p.isBreaking);
    const standard = previews.filter((p) => !p.isBreaking);

    // Shuffle both sets with Fisher-Yates for unpredictable, fresh daily digest
    const shuffledBreaking = shuffleArray(breaking);
    const shuffledStandard = shuffleArray(standard);

    const selected: NewsletterArticlePreview[] = [];

    // Add up to 2 breaking stories if available
    for (const art of shuffledBreaking) {
      if (selected.length >= 2) break;
      selected.push(art);
    }

    // Fill the remainder with randomized standard stories
    for (const art of shuffledStandard) {
      if (selected.length >= maxArticles) break;
      selected.push(art);
    }

    // If still under maxArticles, backfill from remaining breaking
    for (const art of shuffledBreaking) {
      if (selected.length >= maxArticles) break;
      if (!selected.some((s) => s._id === art._id)) {
        selected.push(art);
      }
    }

    // Final shuffle so breaking stories aren't always in the same position
    const articles = shuffleArray(selected).slice(0, maxArticles);

    const dateFormatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    const topTitle = articles[0]?.title || 'Daily Football & Sports Brief';

    return {
      title: `⚡ GoalMills Daily: ${topTitle}`,
      previewText: `Today's top breaking stories and newsroom picks (${dateFormatted})`,
      frequency: 'daily',
      articles,
      editorialNote: `Here is your 10:00 AM curated daily digest featuring fresh, randomized top stories, breaking updates, and tactical analysis straight from the GoalMills newsroom.`,
    };
  }

  if (frequency === 'weekly') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let weeklyTopDocs = await News.find({
      status: 'published',
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(maxArticles);

    if (weeklyTopDocs.length < maxArticles) {
      const existingIds = weeklyTopDocs.map((d) => d._id);
      const backfill = await News.find({
        status: 'published',
        _id: { $nin: existingIds },
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(maxArticles - weeklyTopDocs.length);
      weeklyTopDocs = [...weeklyTopDocs, ...backfill];
    }

    const articles = weeklyTopDocs.map(formatArticlePreview);

    return {
      title: `🏆 GoalMills Week in Review: Most-Read Sports Stories`,
      previewText: `The highest-performing headlines, viral highlights, and tactical breakdowns of the week`,
      frequency: 'weekly',
      articles,
      editorialNote: `Your weekly roundup of the most-read and discussed stories across European football and global sports.`,
    };
  }

  // Monthly
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  let monthlyTopDocs = await News.find({
    status: 'published',
    createdAt: { $gte: thirtyDaysAgo },
  })
    .sort({ views: -1, createdAt: -1 })
    .limit(maxArticles);

  if (monthlyTopDocs.length < maxArticles) {
    const existingIds = monthlyTopDocs.map((d) => d._id);
    const backfill = await News.find({
      status: 'published',
      _id: { $nin: existingIds },
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(maxArticles - monthlyTopDocs.length);
    monthlyTopDocs = [...monthlyTopDocs, ...backfill];
  }

  const articles = monthlyTopDocs.map(formatArticlePreview);
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return {
    title: `🌟 GoalMills Monthly Edition: ${monthName} Sports Retrospective`,
    previewText: `The most-read stories, transfer debriefs, and match analysis from this month`,
    frequency: 'monthly',
    articles,
    editorialNote: `A comprehensive monthly retrospective highlighting the highest-read stories and key moments in sports over the past 30 days.`,
  };
}

// ═══════════════════════════════════════════════════════════════════
// NEWSLETTER HTML EMAIL TEMPLATE — Professional, Email-Client-Safe
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate professional responsive HTML newsletter email.
 * Uses table-based layout for maximum email client compatibility.
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
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const frequencyLabel = frequency
    ? frequency.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Daily';

  // Build article cards
  const articleCards = articles
    .map((art, idx) => {
      const articleSlug =
        art.slug && !/^[0-9a-fA-F]{24}$/.test(art.slug)
          ? art.slug
          : art.title
            ? slugify(art.title)
            : art._id;
      const articleLink = `${siteUrl}/news/${articleSlug}`;
      const badgeHtml = art.isBreaking
        ? `<span style="display:inline-block;background:#dc2626;color:#ffffff;padding:3px 10px;border-radius:4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">⚡ BREAKING</span>`
        : art.isFeatured
          ? `<span style="display:inline-block;background:#7c3aed;color:#ffffff;padding:3px 10px;border-radius:4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">⭐ EDITOR'S PICK</span>`
          : '';

      const imageSection = art.image
        ? `<tr>
            <td style="padding:0;">
              <a href="${articleLink}" style="text-decoration:none;display:block;">
                <img src="${art.image}" alt="${art.title}" width="536" style="width:100%;max-width:536px;height:auto;display:block;border:0;" />
              </a>
            </td>
          </tr>`
        : '';

      const divider = idx < articles.length - 1
        ? `<tr><td style="padding:0 28px;"><div style="height:1px;background:rgba(255,255,255,0.06);margin:4px 0;"></div></td></tr>`
        : '';

      return `
      <!-- Article ${idx + 1} -->
      <tr>
        <td style="padding:0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:0;">
            ${imageSection}
            <tr>
              <td style="padding:20px 28px 24px;">
                ${badgeHtml}
                <h2 style="margin:0 0 8px;font-size:18px;font-weight:800;line-height:1.35;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                  <a href="${articleLink}" style="color:#ffffff;text-decoration:none;">${art.title}</a>
                </h2>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                  ${art.excerpt}
                </p>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size:11px;color:#64748b;font-weight:600;">
                      ${art.category} &bull; ${art.readTime || 3} min read
                    </td>
                    <td align="right">
                      <a href="${articleLink}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:8px 16px;border-radius:6px;font-size:11px;font-weight:800;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em;">
                        Read Story &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${divider}`;
    })
    .join('');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#050814;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#ffffff;">

  <!-- Hidden Preheader -->
  ${previewText ? `<div style="display:none;font-size:1px;color:#050814;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">${previewText}</div>` : ''}

  <!-- Email Wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#050814;table-layout:fixed;">
    <tr>
      <td align="center" style="padding:24px 12px 40px;">

        <!-- Main Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:#0a0f24;border-radius:16px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.5);">

          <!-- Amber Gradient Top Bar -->
          <tr>
            <td height="4" style="background:linear-gradient(90deg,#f59e0b 0%,#fbbf24 40%,#d97706 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header with Official App Icon PNG -->
          <tr>
            <td align="center" style="padding:28px 28px 22px;background:#080d1e;border-bottom:1px solid rgba(255,255,255,0.06);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td valign="middle" style="padding-right:12px;">
                    <a href="${siteUrl}" style="text-decoration:none;display:block;">
                      <img src="${siteUrl}/icon.png" alt="GoalMills Logo" width="40" height="40" style="width:40px;height:40px;border-radius:10px;display:block;border:0;" />
                    </a>
                  </td>
                  <td valign="middle">
                    <a href="${siteUrl}" style="text-decoration:none;">
                      <span style="font-size:28px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">GOAL<span style="color:#f59e0b;">MILLS</span></span>
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-top:10px;">
                <span style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;background:rgba(245,158,11,0.12);color:#fbbf24;border:1px solid rgba(245,158,11,0.25);">
                  ${frequencyLabel} Digest &bull; ${dateFormatted}
                </span>
              </div>
            </td>
          </tr>

          <!-- Editorial Note -->
          ${editorialNote ? `
          <tr>
            <td style="padding:24px 28px 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(245,158,11,0.05);border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;line-height:1.6;color:#cbd5e1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                      <strong style="color:#fbbf24;">From The Newsroom:</strong> ${editorialNote}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ''}

          <!-- Section Header -->
          <tr>
            <td style="padding:24px 28px 16px;">
              <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#f59e0b;">
                TODAY'S TOP STORIES
              </span>
              <div style="margin-top:6px;height:1px;background:linear-gradient(90deg,rgba(245,158,11,0.4),rgba(245,158,11,0));"></div>
            </td>
          </tr>

          <!-- Articles -->
          ${articleCards}

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:28px 28px 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:#f59e0b;border-radius:8px;box-shadow:0 4px 14px rgba(245,158,11,0.3);">
                    <a href="${siteUrl}" style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:800;color:#0f172a;text-decoration:none;text-transform:uppercase;letter-spacing:0.06em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                      Explore All Stories on GoalMills &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer with Official Icon -->
          <tr>
            <td style="padding:28px 28px;background:#050810;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:14px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td valign="middle" style="padding-right:8px;">
                          <img src="${siteUrl}/icon.png" alt="GoalMills" width="22" height="22" style="width:22px;height:22px;border-radius:6px;display:block;border:0;" />
                        </td>
                        <td valign="middle">
                          <span style="font-size:16px;font-weight:900;text-transform:uppercase;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">GOAL<span style="color:#f59e0b;">MILLS</span></span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:14px;font-size:11px;line-height:1.7;color:#64748b;">
                    <p style="margin:0 0 4px;">&copy; ${year} GoalMills Sports Media. All rights reserved.</p>
                    <p style="margin:0;">You're receiving this because you subscribed to GoalMills Sports Alerts.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px;font-size:12px;">
                    <a href="${unsubscribeUrl}" style="color:#f59e0b;text-decoration:underline;font-weight:700;">
                      Unsubscribe or Change Preferences
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:10px;color:#475569;line-height:1.5;">
                    Tip: Add our sender address to your contacts to ensure delivery to your primary inbox.
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

// ═══════════════════════════════════════════════════════════════════
// EDITOR'S PICKS FETCHER
// ═══════════════════════════════════════════════════════════════════

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
}

// ═══════════════════════════════════════════════════════════════════
// LATEST NEWS FETCHER (WELCOME & INTRO EMAILS)
// ═══════════════════════════════════════════════════════════════════

/**
 * Fetch top latest published news posts for welcome & intro emails
 */
export async function getLatestPublishedArticles(count = 5): Promise<NewsletterArticlePreview[]> {
  await dbConnect();
  try {
    const docs = await News.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(count);

    if (docs.length >= count) {
      return docs.map(formatArticlePreview);
    }

    const existingIds = docs.map((d) => d._id);
    const backfill = await News.find({
      status: 'published',
      _id: { $nin: existingIds },
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(count - docs.length);

    const combined = [...docs, ...backfill];
    if (combined.length > 0) {
      return combined.map(formatArticlePreview);
    }
  } catch (err) {
    console.error('Error fetching latest published articles:', err);
  }

  return getEditorPickArticles(count);
}

// ═══════════════════════════════════════════════════════════════════
// WELCOME & INTRO EMAIL TEMPLATE — Professional, Unified Design
// ═══════════════════════════════════════════════════════════════════

export interface WelcomeIntroEmailParams {
  subscriberEmail: string;
  frequency: string;
  categories?: string[];
  confirmationUrl?: string;
  unsubscribeUrl: string;
  siteUrl: string;
  articles?: NewsletterArticlePreview[];
  requireDoubleOptIn?: boolean;
}

export type ConfirmationEmailParams = WelcomeIntroEmailParams & {
  editorPicks?: NewsletterArticlePreview[];
};

/**
 * Generate a luxury dark-mode Welcome & Intro HTML email template
 * featuring 5 latest published news posts and the official app icon PNG.
 */
export function generateWelcomeIntroEmailHTML(params: WelcomeIntroEmailParams): string {
  const {
    subscriberEmail,
    frequency,
    categories = [],
    confirmationUrl,
    unsubscribeUrl,
    siteUrl,
    articles = [],
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

  // Render the 5 Latest Article Post Cards
  const articleCardsHtml = articles
    .slice(0, 5)
    .map((art, idx) => {
      const articleSlug =
        art.slug && !/^[0-9a-fA-F]{24}$/.test(art.slug)
          ? art.slug
          : art.title
            ? slugify(art.title)
            : art._id;
      const articleLink = `${siteUrl}/news/${articleSlug}`;
      const badgeLabel = art.isBreaking
        ? '⚡ Breaking'
        : art.isFeatured
          ? "⭐ Editor's Pick"
          : '🔥 Top Story';
      const badgeColor = art.isBreaking ? '#dc2626' : art.isFeatured ? '#7c3aed' : '#d97706';

      const imageSection = art.image
        ? `<tr>
            <td style="padding:0;">
              <a href="${articleLink}" style="text-decoration:none;display:block;">
                <img src="${art.image}" alt="${art.title}" width="100%" style="width:100%;height:180px;object-fit:cover;display:block;border-top-left-radius:12px;border-top-right-radius:12px;background-color:#1e293b;" />
              </a>
            </td>
          </tr>`
        : '';

      return `
    <!-- Post Card ${idx + 1} -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;background:#0d1527;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      ${imageSection}
      <tr>
        <td style="padding:16px 18px 18px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding-bottom:8px;">
                <span style="display:inline-block;padding:3px 8px;border-radius:4px;background:${badgeColor};color:#ffffff;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;">
                  ${badgeLabel}
                </span>
                <span style="display:inline-block;margin-left:6px;color:#94a3b8;font-size:11px;font-weight:600;">
                  &bull; ${art.category || 'Football'}
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
    </table>`;
    })
    .join('');

  const preheaderSnippet = requireDoubleOptIn
    ? `Please confirm your GoalMills Sports Alerts subscription. Explore 5 latest stories inside.`
    : `Welcome to GoalMills Sports Alerts! Explore 5 of today's latest news stories and transfer exclusives.`;

  const heroHeadline = requireDoubleOptIn
    ? `Confirm Your Subscription`
    : `Welcome to GoalMills Sports Alerts! ⚽`;

  const heroSubtitle = requireDoubleOptIn
    ? `Please verify your email address to begin receiving your ${formattedFrequency} digest delivered automatically at 10:00 AM WAT.`
    : `Your subscription to GoalMills ${formattedFrequency} Sports Alerts is now active. You are now connected to verified sports reporting, exclusive transfer radars, and tactical breakdowns.`;

  const ctaButtonText = requireDoubleOptIn
    ? `Confirm Subscription Now &rarr;`
    : `Explore All Sports News &rarr;`;

  const primaryActionUrl = requireDoubleOptIn && confirmationUrl ? confirmationUrl : siteUrl;

  const categoriesBadge =
    categories && categories.length > 0
      ? categories
          .map(
            (c) =>
              `<span style="display:inline-block;background:rgba(255,255,255,0.08);color:#cbd5e1;padding:2px 8px;border-radius:6px;font-size:11px;margin-right:4px;margin-bottom:4px;">${c}</span>`
          )
          .join('')
      : '<span style="color:#94a3b8;font-size:11px;">All Sports &amp; Competitions</span>';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${heroHeadline} - GoalMills Sports</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#050814;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#ffffff;line-height:1.5;">

  <!-- Hidden Preheader -->
  <div style="display:none;font-size:1px;color:#050814;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
    ${preheaderSnippet}
  </div>

  <!-- Email Wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#050814;table-layout:fixed;">
    <tr>
      <td align="center" style="padding:24px 12px 36px;">

        <!-- Main Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:#090e21;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">

          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background:linear-gradient(90deg,#f59e0b 0%,#fbbf24 50%,#d97706 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header with Official App Icon PNG -->
          <tr>
            <td align="center" style="padding:28px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.06);background:#070b1a;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td valign="middle" style="padding-right:12px;">
                    <a href="${siteUrl}" style="text-decoration:none;display:block;">
                      <img src="${siteUrl}/icon.png" alt="GoalMills Logo" width="40" height="40" style="width:40px;height:40px;border-radius:10px;display:block;border:0;" />
                    </a>
                  </td>
                  <td valign="middle">
                    <a href="${siteUrl}" style="text-decoration:none;">
                      <span style="font-size:28px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                        GOAL<span style="color:#f59e0b;">MILLS</span>
                      </span>
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-top:8px;">
                <span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;background:rgba(245,158,11,0.12);color:#fbbf24;border:1px solid rgba(245,158,11,0.3);">
                  ⚽ WELCOME EDITION &bull; ${dateFormatted}
                </span>
              </div>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding:32px 28px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <div style="width:52px;height:52px;line-height:52px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.4);border-radius:50%;text-align:center;font-size:24px;display:inline-block;color:#f59e0b;">
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
                  <td align="center" style="padding-bottom:20px;">
                    <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;max-width:480px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                      ${heroSubtitle}
                    </p>
                  </td>
                </tr>

                <!-- Benefits Chips -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <span style="display:inline-block;padding:4px 10px;border-radius:6px;background:rgba(255,255,255,0.05);color:#f59e0b;font-size:11px;font-weight:700;margin:3px;">⚡ Breaking Transfers</span>
                    <span style="display:inline-block;padding:4px 10px;border-radius:6px;background:rgba(255,255,255,0.05);color:#f59e0b;font-size:11px;font-weight:700;margin:3px;">⚽ Match Debriefs</span>
                    <span style="display:inline-block;padding:4px 10px;border-radius:6px;background:rgba(255,255,255,0.05);color:#f59e0b;font-size:11px;font-weight:700;margin:3px;">📊 Tactical Analysis</span>
                    <span style="display:inline-block;padding:4px 10px;border-radius:6px;background:rgba(255,255,255,0.05);color:#f59e0b;font-size:11px;font-weight:700;margin:3px;">🏆 League Standings</span>
                  </td>
                </tr>

                <!-- Primary CTA -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background:#f59e0b;border-radius:8px;box-shadow:0 8px 20px -4px rgba(245,158,11,0.4);">
                          <a href="${primaryActionUrl}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:900;color:#050814;text-decoration:none;text-transform:uppercase;letter-spacing:0.06em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                            ${ctaButtonText}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Subscription Summary -->
                <tr>
                  <td>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                      <tr>
                        <td style="padding:16px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding-bottom:6px;font-size:12px;color:#94a3b8;font-weight:600;">
                                Subscriber:
                              </td>
                              <td align="right" style="padding-bottom:6px;font-size:12px;color:#ffffff;font-weight:700;">
                                ${subscriberEmail}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:6px;font-size:12px;color:#94a3b8;font-weight:600;">
                                Cadence:
                              </td>
                              <td align="right" style="padding-bottom:6px;font-size:12px;color:#fbbf24;font-weight:700;">
                                ${formattedFrequency} Digest (10:00 AM WAT)
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size:12px;color:#94a3b8;font-weight:600;vertical-align:top;padding-top:2px;">
                                Coverage:
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

          <!-- 5 Latest Posts Header -->
          <tr>
            <td style="padding:10px 28px 16px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
                    <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#f59e0b;display:block;margin-bottom:4px;">
                      🔥 LATEST HEADLINES
                    </span>
                    <h2 style="margin:0;font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.2px;">
                      5 Latest Stories to Get You Started
                    </h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 5 Latest Articles Cards -->
          <tr>
            <td style="padding:0 28px 16px;">
              ${articleCardsHtml}
            </td>
          </tr>

          <!-- What to Expect Box -->
          <tr>
            <td style="padding:0 28px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(245,158,11,0.05);border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;">
                <tr>
                  <td style="padding:14px 18px;">
                    <h3 style="margin:0 0 6px;font-size:13px;font-weight:800;color:#fbbf24;text-transform:uppercase;letter-spacing:0.04em;">
                      ⚡ Curated Daily at 10:00 AM WAT
                    </h3>
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#cbd5e1;">
                      Our international sports desk operates round the clock. Expect concise, high-impact digests curated every morning and delivered straight to your inbox without spam or fluff.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer with Official Icon -->
          <tr>
            <td style="padding:28px 24px;background:#050812;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:14px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td valign="middle" style="padding-right:8px;">
                          <img src="${siteUrl}/icon.png" alt="GoalMills" width="22" height="22" style="width:22px;height:22px;border-radius:6px;display:block;border:0;" />
                        </td>
                        <td valign="middle">
                          <span style="font-size:16px;font-weight:900;text-transform:uppercase;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">GOAL<span style="color:#f59e0b;">MILLS</span></span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:14px;font-size:11px;line-height:1.7;color:#64748b;">
                    <p style="margin:0 0 4px;">&copy; ${year} GoalMills Sports Media. All rights reserved.</p>
                    <p style="margin:0;">You received this email because you subscribed to GoalMills Sports Alerts.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px;font-size:12px;">
                    <a href="${siteUrl}/newsletter/preferences" style="color:#f59e0b;text-decoration:none;font-weight:700;margin:0 8px;">
                      Manage Preferences
                    </a>
                    <span style="color:#475569;">&bull;</span>
                    <a href="${unsubscribeUrl}" style="color:#f59e0b;text-decoration:underline;font-weight:700;margin:0 8px;">
                      Unsubscribe
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:10px;color:#475569;line-height:1.5;">
                    Tip: Add our sender address to your contacts to ensure delivery to your primary inbox.
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

/**
 * Backward compatibility alias for generateWelcomeIntroEmailHTML
 */
export function generateConfirmationEmailHTML(params: ConfirmationEmailParams): string {
  const articles = params.articles || params.editorPicks || [];
  return generateWelcomeIntroEmailHTML({
    ...params,
    articles,
  });
}
