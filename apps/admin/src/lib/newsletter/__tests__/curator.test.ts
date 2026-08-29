import { describe, it, expect, vi, beforeEach } from 'vitest';
import { curateNewsletterArticles, generateNewsletterHTML, formatArticlePreview } from '../curator';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const mockArticles = [
  {
    _id: 'news-1',
    title: 'Mbappe Scores Stunner in Champions League Quarterfinal',
    slug: 'mbappe-scores-stunner',
    excerpt: 'Sensational finish sends Madrid through to semifinals.',
    image: 'https://example.com/photo.jpg',
    category: 'Football',
    sport: 'Football',
    readTime: 4,
    isBreaking: true,
    isFeatured: false,
    views: 1250,
    author: 'Chief Reporter',
    createdAt: new Date(),
  },
  {
    _id: 'news-2',
    title: 'Tactical Analysis: How Arsenal Dismantled City Press',
    slug: 'tactical-analysis-arsenal-city',
    excerpt: 'Detailed tactical breakdown of positional superiority.',
    image: 'https://example.com/tactics.jpg',
    category: 'Tactical Analysis',
    sport: 'Football',
    readTime: 5,
    isBreaking: false,
    isFeatured: true,
    views: 980,
    author: 'Tactics Desk',
    createdAt: new Date(),
  },
  {
    _id: 'news-3',
    title: 'Transfer Watch: Summer Window Mega Deals',
    slug: 'transfer-watch-summer-deals',
    excerpt: 'Every top target linked across Europe.',
    category: 'Transfers',
    sport: 'Football',
    readTime: 3,
    isBreaking: false,
    isFeatured: false,
    views: 3400,
    author: 'Transfer Desk',
    createdAt: new Date(),
  },
];

vi.mock('@/models/News', () => ({
  default: {
    find: vi.fn().mockImplementation((query) => {
      let filtered = [...mockArticles];
      if (query.isBreaking) filtered = filtered.filter((a) => a.isBreaking);
      if (query.isFeatured) filtered = filtered.filter((a) => a.isFeatured);
      return {
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(filtered),
        }),
      };
    }),
  },
}));

describe('Newsletter Curator & HTML Generator', () => {
  it('should curate daily digest with breaking news and editor picks', async () => {
    const digest = await curateNewsletterArticles('daily', 5);

    expect(digest.frequency).toBe('daily');
    expect(digest.title).toContain('GoalMills Daily');
    expect(digest.articles.length).toBeGreaterThanOrEqual(1);
  });

  it('should curate weekly digest based on most read', async () => {
    const digest = await curateNewsletterArticles('weekly', 5);

    expect(digest.frequency).toBe('weekly');
    expect(digest.title).toContain('Week in Review');
  });

  it('should render clean responsive HTML newsletter with articles and unsubscribe link', () => {
    const html = generateNewsletterHTML({
      title: 'GoalMills Matchday Brief',
      previewText: 'Exclusive tactical previews and lineup alerts',
      editorialNote: 'Good morning fans!',
      frequency: 'daily',
      articles: [formatArticlePreview(mockArticles[0])],
      siteUrl: 'https://goalmills.com',
      unsubscribeUrl: 'https://goalmills.com/newsletter/unsubscribe?token=abc123token',
    });

    expect(html).toContain('GoalMills Matchday Brief');
    expect(html).toContain('Mbappe Scores Stunner');
    expect(html).toContain('https://goalmills.com/newsletter/unsubscribe?token=abc123token');
    expect(html).toContain('⚡ Breaking News');
  });
});
