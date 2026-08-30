import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdvertiserReportingService } from '../advertiserReportingService';

const { mockSponsor } = vi.hoisted(() => {
  const sponsor = {
    _id: 'sp_emirates',
    name: 'Fly Emirates Global',
    title: 'Premier League Matchday Takeover',
    impressions: 485000,
    clicks: 18430,
  };
  return { mockSponsor: sponsor };
});

vi.mock('../../../lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
  connectDB: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../models/Sponsorship', () => {
  const sponsorMock = {
    findById: vi.fn(() => ({
      lean: vi.fn().mockResolvedValue(mockSponsor),
    })),
    find: vi.fn(() => ({
      lean: vi.fn().mockResolvedValue([mockSponsor]),
    })),
  };
  return {
    default: sponsorMock,
    Sponsorship: sponsorMock,
  };
});

vi.mock('../../../models/AdvertiserReport', () => ({
  AdvertiserReportModel: {
    findOneAndUpdate: vi.fn().mockResolvedValue(true),
  },
}));

describe('Phase 10C: Advertiser Proof-of-Performance & Reporting Engine', () => {
  let reportingService: AdvertiserReportingService;

  beforeEach(() => {
    vi.clearAllMocks();
    reportingService = AdvertiserReportingService.getInstance();
  });

  it('should generate verifiable Proof-of-Performance report with cryptographic SHA-256 hash', async () => {
    const report = await reportingService.generateCampaignReport('sp_emirates', '2026-02', 'goalmills');

    expect(report).toBeDefined();
    expect(report.sponsorName).toBe('Fly Emirates Global');
    expect(report.impressions).toBe(485000);
    expect(report.viewableImpressions).toBeGreaterThanOrEqual(1000);
    expect(report.viewabilityRate).toBeGreaterThanOrEqual(80);
    expect(report.ctr).toBeGreaterThan(0);
    expect(report.certificateHash).toHaveLength(64); // SHA-256 hex string
    expect(report.sportBreakdown.football).toBeDefined();
  });

  it('should calculate advertiser hub metrics across active brand campaigns', async () => {
    const stats = await reportingService.getAdvertiserHubStats('goalmills');

    expect(stats).toBeDefined();
    expect(stats.activeSponsors).toBeGreaterThanOrEqual(1);
    expect(stats.totalDeliveredImpressions).toBeGreaterThanOrEqual(485000);
    expect(stats.topSponsors).toHaveLength(3);
  });

  it('should export formatted CSV for advertiser reconciliation audit', async () => {
    const csv = await reportingService.exportCampaignsCsv('goalmills');

    expect(csv).toContain('Sponsor ID,Sponsor Name,Delivered Impressions,Spend (USD),CTR (%),Status');
    expect(csv).toContain('Fly Emirates Global');
    expect(csv).toContain('Audited & Verified');
  });
});
