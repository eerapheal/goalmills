import dbConnect from '@/lib/db';
import News from '@/models/News';
import Video from '@/models/Video';
import NewsletterCampaign from '@/models/NewsletterCampaign';
import { cacheGet, cacheSet } from '@/lib/redisCache';
import { getNewsUrl, slugify } from '@/lib/slugUtils';
import type {
  SearchFilterOptions,
  SearchResponse,
  SearchResultItem,
  SearchSuggestionsResponse,
  SearchSuggestionItem,
  SearchFacetCounts,
} from '@goalmills/types';

export class SearchService {
  /**
   * Execute multi-entity search across articles, videos, and newsletters
   */
  static async executeSearch(options: SearchFilterOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    const {
      query = '',
      sport,
      competition,
      team,
      category,
      dateRange = 'all',
      entityTypes = ['article', 'video', 'newsletter'],
      sortBy = 'relevance',
      page = 1,
      limit = 12,
      tenantSlug = 'goalmills',
    } = options;

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return {
        success: true,
        query: '',
        total: 0,
        page,
        limit,
        totalPages: 0,
        results: [],
        facets: { sports: {}, entityTypes: {}, competitions: {} },
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Cache key for search query
    const cacheKey = `search:query:${tenantSlug}:${Buffer.from(
      JSON.stringify({ cleanQuery, sport, competition, team, category, dateRange, entityTypes, sortBy, page, limit })
    ).toString('base64').substring(0, 48)}`;

    const cached = await cacheGet<SearchResponse>(cacheKey);
    if (cached) {
      return {
        ...cached,
        fromCache: true,
        executionTimeMs: Date.now() - startTime,
      };
    }

    await dbConnect();

    // Date range filter calculation
    let dateFilter: Date | null = null;
    const now = new Date();
    if (dateRange === 'today') {
      dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (dateRange === 'week') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'year') {
      dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const regexPattern = new RegExp(cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const queryTokens = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);

    const results: SearchResultItem[] = [];
    const facetCounts: SearchFacetCounts = {
      sports: {},
      entityTypes: {},
      competitions: {},
    };

    // 1. Search News Articles
    if (entityTypes.includes('article')) {
      const articleQuery: Record<string, any> = {
        $or: [
          { title: { $regex: regexPattern } },
          { excerpt: { $regex: regexPattern } },
          { tags: { $in: [regexPattern] } },
          { 'teams.name': { $regex: regexPattern } },
          { competition: { $regex: regexPattern } },
        ],
      };

      if (sport && sport !== 'all') articleQuery.sport = new RegExp(`^${sport}$`, 'i');
      if (category && category !== 'all') articleQuery.category = new RegExp(`^${category}$`, 'i');
      if (competition && competition !== 'all') articleQuery.competition = new RegExp(`^${competition}$`, 'i');
      if (team && team !== 'all') articleQuery['teams.name'] = new RegExp(`^${team}$`, 'i');
      if (dateFilter) articleQuery.createdAt = { $gte: dateFilter };

      const articles = await News.find(articleQuery)
        .select('title slug excerpt image category sport competition teams author createdAt views readTime')
        .sort(sortBy === 'newest' ? { createdAt: -1 } : sortBy === 'popular' ? { views: -1 } : { createdAt: -1 })
        .limit(50)
        .lean();

      articles.forEach((art: any) => {
        let score = 50;
        const lowerTitle = (art.title || '').toLowerCase();
        if (lowerTitle.includes(cleanQuery.toLowerCase())) score += 30;
        queryTokens.forEach((tok) => {
          if (lowerTitle.includes(tok)) score += 10;
        });

        const sportKey = (art.sport || 'general').toLowerCase();
        facetCounts.sports[sportKey] = (facetCounts.sports[sportKey] || 0) + 1;
        facetCounts.entityTypes['article'] = (facetCounts.entityTypes['article'] || 0) + 1;
        if (art.competition) {
          facetCounts.competitions[art.competition] = (facetCounts.competitions[art.competition] || 0) + 1;
        }

        results.push({
          id: String(art._id),
          entityType: 'article',
          title: art.title,
          snippet: art.excerpt || '',
          slug: art.slug || (art.title ? slugify(art.title) : undefined),
          url: getNewsUrl(art),
          image: art.image,
          sport: art.sport,
          competition: art.competition,
          category: art.category,
          author: art.author,
          publishedAt: art.createdAt ? new Date(art.createdAt).toISOString() : undefined,
          score,
        });
      });
    }

    // 2. Search Videos Highlights
    if (entityTypes.includes('video')) {
      const videoQuery: Record<string, any> = {
        $or: [
          { title: { $regex: regexPattern } },
          { description: { $regex: regexPattern } },
          { sport: { $regex: regexPattern } },
        ],
      };
      if (sport && sport !== 'all') videoQuery.sport = new RegExp(`^${sport}$`, 'i');
      if (dateFilter) videoQuery.createdAt = { $gte: dateFilter };

      const videos = await Video.find(videoQuery)
        .select('title description thumbnailUrl duration sport competition createdAt views videoUrl')
        .limit(30)
        .lean();

      videos.forEach((vid: any) => {
        let score = 40;
        if ((vid.title || '').toLowerCase().includes(cleanQuery.toLowerCase())) score += 25;

        const sportKey = (vid.sport || 'general').toLowerCase();
        facetCounts.sports[sportKey] = (facetCounts.sports[sportKey] || 0) + 1;
        facetCounts.entityTypes['video'] = (facetCounts.entityTypes['video'] || 0) + 1;

        results.push({
          id: String(vid._id),
          entityType: 'video',
          title: vid.title,
          snippet: vid.description || 'Video Highlights',
          url: vid.videoUrl || `/videos/${vid._id}`,
          image: vid.thumbnailUrl,
          sport: vid.sport,
          competition: vid.competition,
          publishedAt: vid.createdAt ? new Date(vid.createdAt).toISOString() : undefined,
          score,
        });
      });
    }

    // 3. Search Newsletters
    if (entityTypes.includes('newsletter')) {
      const newsletterQuery: Record<string, any> = {
        status: 'sent',
        $or: [
          { title: { $regex: regexPattern } },
          { previewText: { $regex: regexPattern } },
          { editorialNote: { $regex: regexPattern } },
        ],
      };
      if (dateFilter) newsletterQuery.sentAt = { $gte: dateFilter };

      const campaigns = await NewsletterCampaign.find(newsletterQuery)
        .select('title previewText editorialNote frequencyTier sentAt')
        .limit(20)
        .lean();

      campaigns.forEach((camp: any) => {
        let score = 35;
        if ((camp.title || '').toLowerCase().includes(cleanQuery.toLowerCase())) score += 20;

        facetCounts.entityTypes['newsletter'] = (facetCounts.entityTypes['newsletter'] || 0) + 1;

        results.push({
          id: String(camp._id),
          entityType: 'newsletter',
          title: camp.title,
          snippet: camp.previewText || camp.editorialNote || 'Newsletter Edition',
          url: `/newsletter/archive`,
          category: camp.frequencyTier || 'Daily',
          publishedAt: camp.sentAt ? new Date(camp.sentAt).toISOString() : undefined,
          score,
        });
      });
    }

    // Sort results by score if relevance, or by publishedAt
    if (sortBy === 'relevance') {
      results.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'newest') {
      results.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    }

    // Pagination
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedResults = results.slice((page - 1) * limit, page * limit);

    const response: SearchResponse = {
      success: true,
      query: cleanQuery,
      total,
      page,
      limit,
      totalPages,
      results: paginatedResults,
      facets: facetCounts,
      executionTimeMs: Date.now() - startTime,
    };

    // Cache search response for 60 seconds
    await cacheSet(cacheKey, response, 60);

    return response;
  }

  /**
   * Fast autocomplete suggestions for search bar dropdown
   */
  static async getSearchSuggestions(query: string, tenantSlug: string = 'goalmills'): Promise<SearchSuggestionsResponse> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      return { success: true, query: '', suggestions: [] };
    }

    const cacheKey = `search:suggest:${tenantSlug}:${cleanQuery.toLowerCase()}`;
    const cached = await cacheGet<SearchSuggestionsResponse>(cacheKey);
    if (cached) return { ...cached, fromCache: true };

    await dbConnect();

    const regexPattern = new RegExp(cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const suggestions: SearchSuggestionItem[] = [];

    // Top article matches
    const articles = await News.find({ title: { $regex: regexPattern } })
      .select('title slug sport category image')
      .limit(4)
      .lean();

    articles.forEach((art: any) => {
      suggestions.push({
        id: String(art._id),
        title: art.title,
        type: 'article',
        subtitle: `${art.sport || 'Sports'} • ${art.category || 'News'}`,
        slug: art.slug || (art.title ? slugify(art.title) : undefined),
        sport: art.sport,
        image: art.image,
      });
    });

    // Top video matches
    const videos = await Video.find({ title: { $regex: regexPattern } })
      .select('title sport thumbnailUrl')
      .limit(3)
      .lean();

    videos.forEach((vid: any) => {
      suggestions.push({
        id: String(vid._id),
        title: vid.title,
        type: 'video',
        subtitle: `Video Highlight • ${vid.sport || 'Sports'}`,
        sport: vid.sport,
        image: vid.thumbnailUrl,
      });
    });

    const response: SearchSuggestionsResponse = {
      success: true,
      query: cleanQuery,
      suggestions,
    };

    // Cache autocomplete suggestions for 5 minutes
    await cacheSet(cacheKey, response, 300);

    return response;
  }
}
