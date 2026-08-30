import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentDistributionService } from '../contentDistributionService';

const { mockRules, mockJobs, mockNews } = vi.hoisted(() => {
  const rules = [
    {
      ruleId: 'rule_pl_recap',
      tenantSlug: 'goalmills',
      name: 'Premier League Recaps to Social',
      sport: 'football',
      competitionSlug: 'premier-league',
      triggerEvent: 'match_recap',
      targetChannels: ['x_twitter', 'telegram'],
      requiresApproval: false,
      isActive: true,
    },
    {
      ruleId: 'rule_breaking_gate',
      tenantSlug: 'goalmills',
      name: 'Breaking News Gate',
      sport: 'all',
      triggerEvent: 'article_publish',
      targetChannels: ['x_twitter', 'telegram', 'whatsapp'],
      requiresApproval: true,
      isActive: true,
    },
  ];

  const jobs = [
    {
      jobId: 'job_test_001',
      tenantSlug: 'goalmills',
      sport: 'football',
      channel: 'x_twitter',
      triggerEvent: 'match_recap',
      sourceEntityId: 'match_123',
      content: {
        headline: 'FT: Arsenal 3 - 1 Chelsea | Premier League',
        body: 'Full-time whistle in the Premier League! Final score: Arsenal 3 - 1 Chelsea.',
        hashtags: ['#FOOTBALL', '#PremierLeague'],
      },
      status: 'pending_approval',
      attempts: 0,
      save: vi.fn().mockResolvedValue(true),
    },
  ];

  const news = [
    {
      _id: 'news_1',
      title: 'Arsenal seal qualification with thrilling victory',
      slug: 'arsenal-seal-qualification',
      sport: 'football',
      summary: 'Arsenal secured their spot in Europe with an authoritative 3-1 victory.',
      imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20',
      publishedAt: '2026-02-10T21:45:00Z',
      status: 'published',
    },
  ];

  return { mockRules: rules, mockJobs: jobs, mockNews: news };
});

vi.mock('../../../lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
  connectDB: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../models/DistributionRule', () => ({
  DistributionRuleModel: {
    find: vi.fn(() => ({
      lean: vi.fn().mockResolvedValue(mockRules),
    })),
    countDocuments: vi.fn().mockResolvedValue(4),
  },
}));

vi.mock('../../../models/SyndicationJob', () => {
  const mockCreate = vi.fn((doc: any) => ({
    ...doc,
    toObject: () => doc,
  }));
  const mockFind = vi.fn(() => ({
    sort: vi.fn(() => ({
      limit: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(mockJobs),
      })),
    })),
  }));
  const mockFindOne = vi.fn((query: any) => {
    const job = mockJobs[0];
    return {
      ...job,
      save: vi.fn().mockResolvedValue(true),
    };
  });
  const mockCount = vi.fn().mockResolvedValue(128);

  return {
    SyndicationJobModel: {
      create: mockCreate,
      find: mockFind,
      findOne: mockFindOne,
      countDocuments: mockCount,
    },
  };
});

vi.mock('../../../models/ChannelConfig', () => ({
  ChannelConfigModel: {
    findOneAndUpdate: vi.fn().mockResolvedValue(true),
    find: vi.fn(() => ({
      lean: vi.fn().mockResolvedValue([
        { channel: 'x_twitter', stats: { totalDispatched: 50 }, status: 'connected' },
        { channel: 'telegram', stats: { totalDispatched: 40 }, status: 'connected' },
      ]),
    })),
  },
}));

vi.mock('../../../models/News', () => ({
  News: {
    find: vi.fn(() => ({
      sort: vi.fn(() => ({
        limit: vi.fn(() => ({
          lean: vi.fn().mockResolvedValue(mockNews),
        })),
      })),
    })),
  },
}));

describe('Phase 9: Automated Content Distribution & Multi-Channel Syndication Engine', () => {
  let distributionService: ContentDistributionService;

  beforeEach(() => {
    vi.clearAllMocks();
    distributionService = ContentDistributionService.getInstance();
  });

  it('should process article publish and route to active channels with approval gate', async () => {
    const article = {
      id: 'art_123',
      title: 'Arsenal triumph in London derby',
      summary: 'A thrilling 3-1 victory for the Gunners.',
      sport: 'football',
      tenantSlug: 'goalmills',
    };

    const jobs = await distributionService.processArticlePublish(article);

    expect(jobs).toBeDefined();
    expect(jobs.length).toBeGreaterThanOrEqual(1);
    expect(jobs[0].triggerEvent).toBe('article_publish');
    expect(jobs[0].status).toBe('pending_approval');
  });

  it('should generate automated match completion recap and enqueue social posts', async () => {
    const match = {
      matchId: 'match_ft_ars_che',
      sport: 'football',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      score: '3 - 1',
      competition: 'Premier League',
      scorers: ['Saka 22\'', 'Havertz 54\'', 'Rice 88\''],
    };

    const jobs = await distributionService.processMatchRecap(match);

    expect(jobs).toBeDefined();
    expect(jobs.length).toBe(3);
    expect(jobs[0].content.headline).toContain('FT: Arsenal 3 - 1 Chelsea');
    expect(jobs[0].content.body).toContain('Scorers: Saka');
  });

  it('should approve pending syndication jobs and execute dispatch', async () => {
    const approved = await distributionService.approveJob('job_test_001', 'editor@goalmills.com');
    expect(approved).toBe(true);
  });

  it('should dispatch manual breaking news broadcasts across channels', async () => {
    const jobs = await distributionService.manualBroadcast('goalmills', {
      headline: 'BREAKING: Champions League Semifinal Draw Confirmed',
      body: 'Arsenal to face Real Madrid in the UEFA Champions League semifinals.',
      sport: 'football',
      targetChannels: ['x_twitter', 'telegram'],
    });

    expect(jobs).toHaveLength(2);
    expect(jobs[0].content.headline).toContain('BREAKING');
  });

  it('should generate valid RSS 2.0 XML with Media RSS enclosure elements', async () => {
    const rssXml = await distributionService.getPublicRssFeed('football');

    expect(rssXml).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
    expect(rssXml).toContain('<rss version="2.0"');
    expect(rssXml).toContain('<channel>');
    expect(rssXml).toContain('<title>GoalMills FOOTBALL News Feed</title>');
    expect(rssXml).toContain('<item>');
    expect(rssXml).toContain('Arsenal seal qualification');
  });

  it('should generate valid Google News XML sitemap', async () => {
    const sitemapXml = await distributionService.getGoogleNewsSitemap();

    expect(sitemapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemapXml).toContain('<urlset');
    expect(sitemapXml).toContain('<news:news>');
    expect(sitemapXml).toContain('<news:name>GoalMills Sports</news:name>');
    expect(sitemapXml).toContain('Arsenal seal qualification');
  });
});
