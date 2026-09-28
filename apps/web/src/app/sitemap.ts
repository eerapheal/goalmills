import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import Video from '@/models/Video';
import { slugify } from '@/lib/slugUtils';
import {
  getAllCanonicalCompetitions,
  getAllConfederations,
  getAllCountries,
  PRIORITY_CLUBS_LIST,
} from '@/lib/football';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalmills.com';
  const now = new Date();

  // 1. Static Core Landing Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/football`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Canonical Football Competitions (75+ Global & African Leagues)
  const canonicalCompetitions = getAllCanonicalCompetitions();
  const competitionRoutes: MetadataRoute.Sitemap = canonicalCompetitions.map((comp) => {
    // Top-tier leagues get higher crawl priority
    const priority = comp.priorityRank <= 10 ? 0.9 : comp.priorityRank <= 25 ? 0.85 : 0.75;
    return {
      url: `${baseUrl}/football/${comp.slug}`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority,
    };
  });

  // 3. Continental Confederations (CAF, UEFA, CONMEBOL, CONCACAF, AFC, OFC, FIFA)
  const confederations = getAllConfederations();
  const confederationRoutes: MetadataRoute.Sitemap = confederations.map((confed) => ({
    url: `${baseUrl}/football/confederations/${confed.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // 4. Country Domestic Football Pyramids (30+ registered nations)
  const countries = getAllCountries();
  const countryRoutes: MetadataRoute.Sitemap = countries.map((country) => {
    const slug = country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
      url: `${baseUrl}/football/countries/${slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: country.priorityRank <= 10 ? 0.8 : 0.7,
    };
  });

  // 5. Registered Priority Clubs (150+ clubs)
  const clubRoutes: MetadataRoute.Sitemap = PRIORITY_CLUBS_LIST.map((club) => ({
    url: `${baseUrl}/football/teams/${club.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: club.isFeatured ? 0.8 : 0.7,
  }));

  const allFootballRoutes = [
    ...staticRoutes,
    ...competitionRoutes,
    ...confederationRoutes,
    ...countryRoutes,
    ...clubRoutes,
  ];

  try {
    await dbConnect();

    // Fetch published news articles (excluding soft-deleted)
    const newsArticles = await News.find({
      status: 'published',
      isDeleted: { $ne: true },
    })
      .select('_id title slug updatedAt')
      .sort({ updatedAt: -1 })
      .limit(1000)
      .lean();

    const newsRoutes: MetadataRoute.Sitemap = newsArticles.map((article: any) => {
      const slug =
        article.slug || (article.title ? slugify(article.title) : '') || article._id.toString();
      return {
        url: `${baseUrl}/news/${slug}`,
        lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
        changeFrequency: 'daily',
        priority: 0.8,
      };
    });

    // Fetch published video highlights
    const videos = await Video.find({
      status: 'published',
      isDeleted: { $ne: true },
    })
      .select('_id updatedAt')
      .sort({ updatedAt: -1 })
      .limit(500)
      .lean();

    const videoRoutes: MetadataRoute.Sitemap = videos.map((video: any) => ({
      url: `${baseUrl}/highlights/${video._id}`,
      lastModified: video.updatedAt ? new Date(video.updatedAt) : now,
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    return [...allFootballRoutes, ...newsRoutes, ...videoRoutes];
  } catch (err) {
    console.warn('[SEO Sitemap] Database fetch failed, returning static and football routes fallback:', err);
    return allFootballRoutes;
  }
}
