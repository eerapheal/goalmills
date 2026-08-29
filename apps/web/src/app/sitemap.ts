import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import Video from '@/models/Video';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalmills.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    await dbConnect();

    // Fetch published news articles (excluding soft-deleted)
    const newsArticles = await News.find({
      status: 'published',
      isDeleted: { $ne: true },
    })
      .select('_id updatedAt')
      .sort({ updatedAt: -1 })
      .limit(1000)
      .lean();

    const newsRoutes: MetadataRoute.Sitemap = newsArticles.map((article: any) => ({
      url: `${baseUrl}/news/${article._id}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

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
      lastModified: video.updatedAt ? new Date(video.updatedAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    return [...staticRoutes, ...newsRoutes, ...videoRoutes];
  } catch (err) {
    console.warn('[SEO Sitemap] Database fetch failed, returning static routes fallback:', err);
    return staticRoutes;
  }
}
