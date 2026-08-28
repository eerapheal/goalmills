import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isEmailSuppressed, suppressEmail, unsuppressEmail, getSuppressedEmailSet } from '../suppression';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const mockSuppressed = new Map<string, any>();

vi.mock('@/models/EmailSuppression', () => ({
  default: {
    findOne: vi.fn().mockImplementation((query) => {
      const entry = mockSuppressed.get(query.emailNormalized);
      return Promise.resolve(entry || null);
    }),
    find: vi.fn().mockImplementation((query) => {
      const list: any[] = [];
      if (query.emailNormalized?.$in) {
        query.emailNormalized.$in.forEach((e: string) => {
          if (mockSuppressed.has(e)) list.push({ emailNormalized: e });
        });
      }
      return {
        select: vi.fn().mockResolvedValue(list),
      };
    }),
    findOneAndUpdate: vi.fn().mockImplementation((filter, update) => {
      mockSuppressed.set(filter.emailNormalized, { emailNormalized: filter.emailNormalized, ...update.$set });
      return Promise.resolve(true);
    }),
    deleteOne: vi.fn().mockImplementation((filter) => {
      const exists = mockSuppressed.has(filter.emailNormalized);
      mockSuppressed.delete(filter.emailNormalized);
      return Promise.resolve({ deletedCount: exists ? 1 : 0 });
    }),
  },
}));

vi.mock('@/models/NewsletterSubscriber', () => ({
  default: {
    updateOne: vi.fn().mockResolvedValue(true),
  },
}));

describe('Global Suppression Engine', () => {
  beforeEach(() => {
    mockSuppressed.clear();
  });

  it('should identify unsuppressed emails', async () => {
    const suppressed = await isEmailSuppressed('clean@goalmills.com');
    expect(suppressed).toBe(false);
  });

  it('should suppress hard-bounced and complaining emails permanently', async () => {
    await suppressEmail({
      email: 'bounced@goalmills.com',
      reason: 'HARD_BOUNCE',
      source: 'smtp_550',
    });

    const isSupp = await isEmailSuppressed('bounced@goalmills.com');
    expect(isSupp).toBe(true);

    const set = await getSuppressedEmailSet(['bounced@goalmills.com', 'other@goalmills.com']);
    expect(set.has('bounced@goalmills.com')).toBe(true);
    expect(set.has('other@goalmills.com')).toBe(false);
  });

  it('should allow un-suppressing via admin override', async () => {
    await suppressEmail({
      email: 'mistake@goalmills.com',
      reason: 'MANUAL',
    });

    expect(await isEmailSuppressed('mistake@goalmills.com')).toBe(true);

    const unsuppressed = await unsuppressEmail('mistake@goalmills.com');
    expect(unsuppressed).toBe(true);
    expect(await isEmailSuppressed('mistake@goalmills.com')).toBe(false);
  });
});
