import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateConfirmationEmailHTML,
  getEditorPickArticles,
} from '../curator';
import { sendConfirmationEmail } from '../dispatcher';
import News from '@/models/News';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/News', () => ({
  default: {
    find: vi.fn(),
  },
}));

describe('Newsletter Confirmation & Editor\'s Picks Email Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEditorPickArticles', () => {
    it('should return 2 featured editor pick articles when found in DB', async () => {
      const mockNewsDocs = [
        {
          _id: 'art-1',
          title: 'Tactical Revolution: Arsenal Midfield Overload Breakdown',
          slug: 'arsenal-midfield-overload',
          excerpt: 'How positional play in the central third created numerical superiority.',
          image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
          category: 'Premier League',
          sport: 'Football',
          readTime: 4,
          isBreaking: false,
          isFeatured: true,
          views: 3200,
          author: 'Tactics Desk',
          createdAt: new Date(),
        },
        {
          _id: 'art-2',
          title: 'Transfer Radar: Real Madrid Close In on Rising Superstar',
          slug: 'real-madrid-transfer-radar',
          excerpt: 'Inside the negotiations as personal terms have been verbally agreed.',
          image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
          category: 'La Liga',
          sport: 'Football',
          readTime: 3,
          isBreaking: true,
          isFeatured: true,
          views: 5400,
          author: 'Transfer Desk',
          createdAt: new Date(),
        },
      ];

      (News.find as any).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(mockNewsDocs),
        }),
      });

      const picks = await getEditorPickArticles(2);

      expect(picks).toHaveLength(2);
      expect(picks[0].title).toContain('Arsenal Midfield Overload');
      expect(picks[1].title).toContain('Real Madrid');
    });

    it('should fallback to 2 curated fallback articles when DB is empty', async () => {
      (News.find as any).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      });

      const picks = await getEditorPickArticles(2);

      expect(picks).toHaveLength(2);
      expect(picks[0].title).toBeDefined();
      expect(picks[1].title).toBeDefined();
    });
  });

  describe('generateConfirmationEmailHTML', () => {
    const mockPicks = [
      {
        _id: 'art-1',
        title: 'Mastering the High Press in Modern Football',
        slug: 'high-press-modern-football',
        excerpt: 'A comprehensive study of pressing triggers and counter-pressing traps.',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
        category: 'Tactical Analysis',
        sport: 'Football',
        readTime: 4,
        isBreaking: false,
        isFeatured: true,
        views: 1200,
        author: 'GoalMills Desk',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'art-2',
        title: 'Breaking: Star Striker Signs Historic 5-Year Extension',
        slug: 'star-striker-extension',
        excerpt: 'The club announced the blockbuster deal ahead of the weekend derby.',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
        category: 'Transfer Radar',
        sport: 'Football',
        readTime: 2,
        isBreaking: true,
        isFeatured: true,
        views: 4500,
        author: 'GoalMills Desk',
        createdAt: new Date().toISOString(),
      },
    ];

    it('should generate a responsive HTML email with both editor pick articles', () => {
      const html = generateConfirmationEmailHTML({
        subscriberEmail: 'fan@goalmills.com',
        frequency: 'daily',
        categories: ['Premier League', 'Tactics'],
        confirmationUrl: 'https://goalmills.com/newsletter/confirm?token=test-token-123',
        unsubscribeUrl: 'https://goalmills.com/newsletter/unsubscribe?token=unsub-token-456',
        siteUrl: 'https://goalmills.com',
        editorPicks: mockPicks,
        requireDoubleOptIn: false,
      });

      // Assert Branding & Hero
      expect(html).toContain('GOAL<span style="color:#f59e0b;">MILLS</span>');
      expect(html).toContain('fan@goalmills.com');
      expect(html).toContain('Daily Digest');
      expect(html).toContain('Premier League');

      // Assert 2 Editor Picks are present
      expect(html).toContain('Mastering the High Press in Modern Football');
      expect(html).toContain('Breaking: Star Striker Signs Historic 5-Year Extension');
      expect(html).toContain('https://goalmills.com/news/high-press-modern-football');
      expect(html).toContain('https://goalmills.com/news/star-striker-extension');
      expect(html).toContain('⭐ EDITOR&#39;S PICKS');

      // Assert Compliance & Deliverability
      expect(html).toContain('https://goalmills.com/newsletter/unsubscribe?token=unsub-token-456');
      expect(html).toContain('1-Click Unsubscribe');
      expect(html).toContain('newsletter@goalmills.com');
    });

    it('should include double opt-in verification link when required', () => {
      const html = generateConfirmationEmailHTML({
        subscriberEmail: 'fan@goalmills.com',
        frequency: 'weekly',
        confirmationUrl: 'https://goalmills.com/newsletter/confirm?token=verify-me',
        unsubscribeUrl: 'https://goalmills.com/newsletter/unsubscribe?token=unsub-me',
        siteUrl: 'https://goalmills.com',
        editorPicks: mockPicks,
        requireDoubleOptIn: true,
      });

      expect(html).toContain('Confirm Your Subscription');
      expect(html).toContain('https://goalmills.com/newsletter/confirm?token=verify-me');
      expect(html).toContain('Confirm Subscription Now');
    });
  });

  describe('sendConfirmationEmail', () => {
    it('should build confirmation email and return editor picks', async () => {
      const result = await sendConfirmationEmail({
        subscriber: {
          email: 'fan@goalmills.com',
          frequency: 'daily',
          confirmationToken: 'test-confirm',
          unsubscribeToken: 'test-unsub',
        },
        requireDoubleOptIn: false,
      });

      expect(result.success).toBe(true);
      expect(result.editorPicks).toHaveLength(2);
    });
  });
});
